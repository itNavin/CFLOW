"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import { submitAssignmentAPI } from "@/api/assignment/submitAssignment";
import type { submitAssignment, SubmissionPayload } from "@/types/api/assignment";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import type { assignmentDetail } from "@/types/api/assignment";
import { submitAssignmentFileAPI } from "@/api/assignment/submitAssignmentFile";
import { changeFileName } from "@/util/fileName";

type SubmitAssignmentProps = {
  data: getAllAssignments.getAssignmentWithSubmission | undefined;
  onSubmitted?: () => void; // <-- NEW
};

const clean = (v: string | null | undefined) =>
  v && v !== "null" && v !== "undefined" && v !== "0" ? v : undefined;

type DraftState = Record<string, Record<string, { file: File; mime: string }>>;

const getLatestSubmission = (subs: any[] | undefined) => {
  if (!Array.isArray(subs) || subs.length === 0) return null;
  return [...subs].sort((a, b) => {
    const v = (b.version ?? 0) - (a.version ?? 0);
    if (v !== 0) return v;
    return new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime();
  })[0];
};

export default function SubmitAssignment({ data, onSubmitted }: SubmitAssignmentProps) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const isStudent = (role ?? "") === "student";
  const [comment, setComment] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const sp = useSearchParams();
  const courseId = useMemo(() => clean(sp.get("courseId")) ?? data?.courseId, [sp, data?.courseId]);
  const assignmentId = useMemo(() => clean(sp.get("assignmentId")) ?? data?.id, [sp, data?.id]);

  useEffect(() => {
    setRole(getUserRole());
    setIsClient(true);
  }, []);

  // Detail (for deliverables and latest status)
  const [detail, setDetail] = useState<assignmentDetail.AssignmentStudentDetail["assignment"] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const latestFinal = useMemo(() => getLatestSubmission(detail?.submissions), [detail?.submissions]);

  useEffect(() => {
    if (!isClient || !courseId || !assignmentId) return;
    let cancelled = false;
    setLoadingDetail(true);
    setDetailError(null);

    (async () => {
      try {
        const res = await getStdAssignmentDetailAPI(courseId, assignmentId);
        if (!cancelled) setDetail(res.data.assignment);
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.response?.data?.message || e?.message || "Failed to load assignment detail.";
          setDetailError(msg);
          console.error("[getStdAssignmentDetailAPI] error:", e);
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient, courseId, assignmentId]);

  const deliverables = detail?.deliverables ?? data?.deliverables ?? [];
  const latest = getLatestSubmission(detail?.submissions);
  const canSubmit = !latest || latest.status !== "SUBMITTED"; // gate

  const [drafts, setDrafts] = useState<DraftState>({});
  const onDraftSelect =
    (deliverableId: string, aftId: string, mime: string) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDrafts((prev) => ({
          ...prev,
          [deliverableId]: {
            ...(prev[deliverableId] ?? {}),
            [aftId]: { file, mime },
          },
        }));
        e.target.value = "";
      };
  const removeDraft = (deliverableId: string, aftId: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      const map = { ...(next[deliverableId] ?? {}) };
      delete map[aftId];
      if (Object.keys(map).length) next[deliverableId] = map;
      else delete next[deliverableId];
      return next;
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionPayload | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setUploadingFiles(false);
      setSubmitError(null);
      setSubmitSuccess(null);

      if (!assignmentId) {
        setSubmitError("Missing assignmentId from URL.");
        return;
      }
      if (!canSubmit) {
        setSubmitError("You cannot submit while your latest status is SUBMITTED. Please wait for review.");
        return;
      }

      const res: submitAssignment.SubmitAssignmentPayload = await submitAssignmentAPI(
        assignmentId,
        comment ?? ""
      );
      const submissionId = res.submission.id;
      setSubmission(res.submission);

      const groupNumber =
        detail?.assignmentDueDates?.[0]?.group?.codeNumber ||
        "0";
      const uploads: Promise<any>[] = [];
      for (const [deliverableId, aftMap] of Object.entries(drafts)) {
        for (const { file, mime } of Object.values(aftMap)) {
          const deliverableName = deliverables.find((d) => d.id === deliverableId)?.name || "Deliverable";
          const version = res.submission.version;
          const formattedFileName = changeFileName({
            groupNumber,
            deliverableName,
            version,
            mime,
          });
          uploads.push(
            submitAssignmentFileAPI(submissionId, file, deliverableId, formattedFileName)
          );
        }
      }

      if (uploads.length > 0) {
        setUploadingFiles(true);
        const results = await Promise.allSettled(uploads);
        setUploadingFiles(false);
        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
          setSubmitError(`Uploaded with ${failures.length} error(s).`);
        }
      }

      setSubmitSuccess(res.message || "Submitted successfully.");
      setDrafts({});

      // tell parent to re-fetch and swap to the view
      onSubmitted?.();

    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to submit.";
      setSubmitError(msg);
      console.error("[handleSubmit] error:", e);
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  if (!isClient) {
    return <div className="p-6 space-y-6">Loading assignment…</div>;
  }

  if (latestFinal?.status === "FINAL") {
    return (
      <div className="p-6 text-green-700 text-lg font-semibold">
        Your group assignment is already approved.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!canSubmit && (
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
          You’ve already submitted this version. Please wait for review (status: <b>SUBMITTED</b>).
          You’ll be able to submit again after it changes to <b>REJECT</b> or <b>APPROVE_WITH_FEEDBACK</b>.
        </div>
      )}

      {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
      {submitSuccess && (
        <div className="text-green-700 text-sm">
          {submitSuccess}
          {submission && (
            <span className="ml-2 text-gray-600">
              (submission ID: {submission.id}, version {submission.version})
            </span>
          )}
        </div>
      )}

      {loadingDetail && <div className="text-gray-500 text-sm mt-2">Loading deliverables…</div>}
      {detailError && <div className="text-red-600 text-sm mt-2">Error: {detailError}</div>}

      {deliverables.length > 0 ? (
        deliverables.map((del) => {
          const selectedForDel = drafts[del.id] ?? {};
          return (
            <div key={del.id} className="border border-gray-300 rounded-md p-4 space-y-2 mt-4">
              <div className="font-semibold text-xl">{del.name}</div>
              <div className="space-y-2">
                {del.allowedFileTypes?.length ? (
                  del.allowedFileTypes.map((aft) => {
                    const chosen = selectedForDel[aft.id];
                    return (
                      <div className="text-lg flex items-center gap-3 flex-wrap" key={aft.id}>
                        <span className="font-bold">{aft.type}</span>
                        <label className="text-blue-600 underline cursor-pointer">
                          {chosen ? "Replace" : "Upload"}
                          <input
                            type="file"
                            accept={aft.mime}
                            onChange={onDraftSelect(del.id, aft.id, aft.mime)}
                            className="hidden"
                          />
                        </label>

                        {chosen ? (
                          <>
                            <span className="text-sm break-all bg-gray-100 px-2 py-1 rounded">
                              {
                                changeFileName({
                                  groupNumber:
                                    detail?.assignmentDueDates?.[0]?.group?.codeNumber || "0",
                                  deliverableName: del.name,
                                  version: latest?.version ? latest.version + 1 : 1, // next version
                                  mime: aft.mime,
                                })
                              }
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDraft(del.id, aft.id)}
                              className="text-red-600 text-sm underline"
                            >
                              remove
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">No file selected</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-sm">No file types specified</div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-gray-500 text-lg mt-4">
          {detail ? "No deliverables found for this assignment" : "Loading deliverables..."}
        </div>
      )}
      <label htmlFor="comment" className="text-lg text-black font-semibold">
        Comment
      </label>
      <textarea
        id="comment"
        className="w-full border border-gray-300 rounded-md p-3 text-lg"
        placeholder="Write your comment here..."
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex justify-end mt-6">
        <button
          className="px-6 py-3 bg-[#305071] text-white text-lg rounded-md shadow disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting || !assignmentId || !canSubmit}
        >
          {submitting ? "Submitting…" : "Turn in"}
        </button>
      </div>
    </div>
  );
}

