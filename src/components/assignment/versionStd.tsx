"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import type { getAllAssignments, assignmentDetail } from "@/types/api/assignment";
import { downloadSubmissionFileAPI } from "@/api/assignment/downloadSubmissionFile";
import { downloadFeedbackFileAPI } from "@/api/assignment/downloadFeedbackFile";
import { changeFileName, changeFeedbackFileName } from "@/util/fileName";

type FileLink = { name: string; href: string; id?: string; mime?: string };
type FeedbackItem = { chapter: string; title?: string; comments?: string[]; files?: FileLink[] };
type WorkItem = { chapter: string; files: FileLink[] };

const statusColorMap: Record<string, string> = {
  NOT_SUBMITTED: "#6b7280",
  SUBMITTED: "#1d4ed8",
  REJECTED: "#ef4444",
  APPROVED_WITH_FEEDBACK: "#f59e0b",
  FINAL: "#16a34a",
};

type VersionProps = {
  versionLabel: string;
  statusText: string;
  feedback?: FeedbackItem[];
  workDescription: string;
  work?: WorkItem[];
  className?: string;
  groupNumber: string;
};

const arr = <T,>(x: T[] | null | undefined) => (Array.isArray(x) ? x : []);

function inferMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "doc") return "application/msword";
  if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === "zip") return "application/zip";
  return "application/octet-stream";
}

function getDisplayFileName({
  file,
  groupNumber,
  deliverableName,
  version,
  username,
  isFeedback = false,
}: {
  file: FileLink;
  groupNumber: string;
  deliverableName: string;
  version: string | number;
  username?: string;
  isFeedback?: boolean;
}) {
  try {
    const mime = file.mime || inferMimeType(file.name);
    if (isFeedback && username) {
      return changeFeedbackFileName({
        username,
        groupNumber,
        deliverableName,
        version,
        mime,
      });
    }
    return changeFileName({
      groupNumber,
      deliverableName,
      version,
      mime,
    });
  } catch {
    return file.name;
  }
}

async function handleDownloadSubmission(submissionFileId: string, fileName: string) {
  try {
    const res = await downloadSubmissionFileAPI(submissionFileId);
    const url = res.data.url;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Failed to download file.");
  }
}

async function handleDownloadFeedback(feedbackFileId: string, fileName: string) {
  try {
    const res = await downloadFeedbackFileAPI(feedbackFileId);
    const url = res.data.url;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Failed to download file.");
  }
}

export function Version({
  versionLabel,
  statusText,
  feedback = [],
  workDescription,
  work = [],
  className = "",
  groupNumber,
}: VersionProps) {
  const version = versionLabel.replace("Version ", "");
  const username = useSearchParams().get("user") || undefined;
  const color = statusColorMap[statusText] || "#6b7280";

  return (
    <div className={`font-dbheavent ${className}`}>
      <div className="mb-3">
        <h1 className="text-[18px] font-semibold text-[#000000] ml-6">{versionLabel}</h1>
        <p className="mt-1 text-sm ml-6" style={{ color }}>
          Status: {statusText === "FINAL" ? "APPROVED" : statusText === "REJECTED" ? "NOT APPROVED" : statusText}
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ml-6">
        <section className="p-6 border-b">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-3">Feedback</h2>
          {(statusText === "FINAL" || statusText === "APPROVED")
            ? (<p className="text-sm text-gray-500">No feedback from advisor.</p>)
            : feedback.length === 0
              ? (<p className="text-sm text-gray-500">No feedback yet.</p>)
              : (
                <div className="space-y-5 text-[14px] leading-relaxed text-gray-800">
                  {feedback.map((f, idx) => {
                    const comments = arr(f.comments);
                    const files = arr(f.files);
                    return (
                      <div key={idx}>
                        <div className="text-gray-800">
                          {f.title ? <span className="mx-1">: {f.title}</span> : null}
                        </div>
                        {comments.length > 0 ? (
                          <ul className="mt-2 list-disc list-inside space-y-1">
                            {comments.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : null}
                        {f.files !== undefined && (
                          <div className="mt-4">
                            <div className="font-medium text-[16px]">{f.chapter}</div>
                            <div className="mt-1 space-y-1">
                              {files.length > 0 ? (
                                files.map((file, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <a href={file.href} className="block text-[#326295] hover:underline">
                                      {file.name}
                                    </a>
                                    {file.id && (
                                      <button
                                        className="text-blue-600 underline"
                                        onClick={() => handleDownloadFeedback(file.id!, file.name)}
                                        title="Download file"
                                      >
                                        Download
                                      </button>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
        </section>
        <section className="p-6">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-3">Your work</h2>
          <p className="text-[14px] text-gray-800 mb-4">{workDescription || "—"}</p>
          {work.length === 0 ? (
            <p className="text-sm text-gray-500"></p>
          ) : (
            <div className="space-y-4 text-[14px]">
              {work.map((w, idx) => {
                const files = arr(w.files);
                return (
                  <div key={idx}>
                    <div className="font-medium text-[16px]">{w.chapter}</div>
                    <div className="mt-1 space-y-1">
                      {files.length > 0 ? (
                        files.map((file, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <a href={file.href} className="block text-[#326295] hover:underline">
                              {getDisplayFileName({
                                file,
                                groupNumber,
                                deliverableName: w.chapter,
                                version,
                                username,
                                isFeedback: false,
                              })}
                            </a>
                            {file.id && (
                              <button
                                className="text-blue-600 underline"
                                onClick={() => handleDownloadSubmission(file.id!, file.name)}
                                title="Download file"
                              >
                                Download
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type Props = { data?: getAllAssignments.getAssignmentWithSubmission | undefined };

const clean = (v: string | null | undefined) =>
  v && v !== "null" && v !== "undefined" && v !== "0" ? v : undefined;

const padV = (n?: number) => `Version ${String(n ?? 1).padStart(2, "0")}`;

const urls = (x: string[] | string | null | undefined) => (!x ? [] : Array.isArray(x) ? x : [x]);

const fileName = (u: string) => {
  try {
    const tail = u.split("?")[0].split("#")[0].split("/").pop();
    return decodeURIComponent(tail || u);
  } catch {
    return u;
  }
};

export default function ViewSubmissionVersions({ data }: Props) {
  const sp = useSearchParams();
  const courseId = useMemo(() => clean(sp.get("courseId")) ?? data?.courseId, [sp, data?.courseId]);
  const assignmentId = useMemo(() => clean(sp.get("assignmentId")) ?? data?.id, [sp, data?.id]);

  const [detail, setDetail] =
    useState<assignmentDetail.AssignmentStudentDetail["assignment"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!courseId || !assignmentId) return;
    let off = false;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const res = await getStdAssignmentDetailAPI(courseId, assignmentId);
        if (!off) setDetail(res.data.assignment);
      } catch (e: any) {
        if (!off) setErr(e?.response?.data?.message || e?.message || "Failed to load.");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [courseId, assignmentId]);

  const subs = useMemo(() => {
    const s = (detail as any)?.submissions ?? [];
    return [...s].sort((a, b) => {
      const dv = (b?.version ?? 0) - (a?.version ?? 0);
      return dv !== 0
        ? dv
        : new Date(b?.submittedAt ?? 0).getTime() - new Date(a?.submittedAt ?? 0).getTime();
    });
  }, [detail]);

  const deliverableNames: Record<string, string> = {};
  (detail?.deliverables ?? data?.deliverables ?? []).forEach((d: any) => {
    deliverableNames[d.id] = d.name;
  });

  const groupNumber =
    detail?.assignmentDueDates?.[0]?.group?.codeNumber || "0";

  const latestSub = subs[0];
  const isFinal = latestSub?.status === "FINAL";

  const feedbackVersions = subs.filter((sub: any) => Array.isArray(sub.feedbacks) && sub.feedbacks.length > 0);
  const allVersions = subs;

  let visible: any[] = [];
  let hasMore = false;

  if (allVersions.length === 0) {
    visible = [];
    hasMore = false;
  } else if (showAll) {
    visible = allVersions;
    hasMore = false;
  } else if (latestSub?.status === "FINAL") {
    const finalList = latestSub && latestSub.id
      ? feedbackVersions.some(v => v.id === latestSub.id)
        ? feedbackVersions
        : [latestSub, ...feedbackVersions]
      : feedbackVersions;

    visible = finalList.slice(0, 1);
    hasMore = finalList.length > visible.length;
  } else {
    const latestHasFeedback = Array.isArray(latestSub?.feedbacks) && latestSub.feedbacks.length > 0;

    if (latestHasFeedback) {
      visible = allVersions.slice(0, 1);
    } else {
      if (allVersions.length === 1) {
        visible = [];
      } else {
        visible = allVersions.slice(1);
      }
    }

    hasMore = visible.length > 0 && allVersions.length > visible.length;
  }

  const showToggle = showAll || (visible.length > 0 && allVersions.length > visible.length);

  return (
    <div className="space-y-3">
      {visible.filter(sub => sub && sub.id).map((sub: any) => {
        const allComments: string[] = [];
        const fbFiles: Record<string, FileLink[]> = {};
        (sub?.feedbacks ?? []).forEach((fb: any) => {
          String(fb?.comment || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((c) => allComments.push(c));

          (fb?.feedbackFiles ?? []).forEach((ff: any) => {
            const links = urls(ff?.fileUrl).map((u) => ({
              name: ff?.name,
              href: u,
              id: ff?.id,
              mime: inferMimeType(fileName(u)),
            }));
            const k = String(ff?.deliverableId ?? "");
            (fbFiles[k] ??= []).push(...links);
          });
        });

        const feedbackItems: FeedbackItem[] = [
          { chapter: "Feedback", comments: allComments },
          ...Object.entries(fbFiles).map(([dId, links]) => ({
            chapter: deliverableNames[dId] || "Deliverable",
            files: links,
          })),
        ];

        const workGrouped: Record<string, FileLink[]> = {};
        (sub?.submissionFiles ?? []).forEach((sf: any) => {
          const links = urls(sf?.fileUrl).map((u) => ({
            name: sf.name,
            href: u,
            id: sf?.id,
            mime: inferMimeType(fileName(u)),
          }));
          const k = String(sf?.deliverableId ?? "");
          (workGrouped[k] ??= []).push(...links);
        });
        const workItems: WorkItem[] = Object.entries(workGrouped).map(([dId, files]) => ({
          chapter: deliverableNames[dId] || "Deliverable",
          files,
        }));

        return (
          <Version
            key={sub.id}
            className="bg-white"
            versionLabel={padV(sub?.version)}
            statusText={sub?.status ?? "—"}
            feedback={feedbackItems}
            workDescription={sub?.comment || "No description from your submission."}
            work={workItems}
            groupNumber={groupNumber}
          />
        );
      })}

      {showToggle && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="text-sm text-blue-700 underline cursor-pointer"
          >
            {showAll ? "See less ▲" : "See more ▼"}
          </button>
        </div>
      )}
    </div>
  );
}