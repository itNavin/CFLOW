// src/components/assignment/ViewSubmittedAssignment.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAllAssignments } from "@/types/api/assignment";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import type { assignmentDetail } from "@/types/api/assignment";

type Props = {
  data?: getAllAssignments.getAssignmentWithSubmission;
  onResubmit?: () => void;
};

const clean = (v: string | null | undefined) =>
  v && v !== "null" && v !== "undefined" && v !== "0" ? v : undefined;

const getLatestSubmission = (subs: any[] | undefined | null) => {
  if (!Array.isArray(subs) || subs.length === 0) return null;
  return [...subs].sort((a, b) => {
    const v = (b.version ?? 0) - (a.version ?? 0);
    if (v !== 0) return v;
    return new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime();
  })[0];
};

export default function ViewSubmittedAssignment({ data, onResubmit }: Props) {
  const sp = useSearchParams();
  const courseId = useMemo(() => clean(sp.get("courseId")) ?? data?.courseId, [sp, data?.courseId]);
  const assignmentId = useMemo(() => clean(sp.get("assignmentId")) ?? data?.id, [sp, data?.id]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] =
    useState<assignmentDetail.AssignmentStudentDetail["assignment"] | null>(null);

  useEffect(() => {
    if (!courseId || !assignmentId) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const res = await getStdAssignmentDetailAPI(courseId, assignmentId);
        if (!cancelled) setDetail(res.data.assignment);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.response?.data?.message || e?.message || "Failed to load submission.");
          console.error("[ViewSubmittedAssignment] fetch error:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId, assignmentId]);

  const latest = useMemo(() => getLatestSubmission(detail?.submissions), [detail?.submissions]);

  /** ---- Build links per deliverable with parsed extension ---- */
  const linksByDeliverable = useMemo(() => {
    const map: Record<string, { name: string; href: string; ext: string }[]> = {};
    const toUrls = (x: string[] | string | null | undefined) =>
      !x ? [] : Array.isArray(x) ? x : [x];

    const parse = (u: string) => {
      const clean = u.split(/[?#]/)[0];
      const name = decodeURIComponent(clean.split("/").pop() || "file");
      const ext = (name.includes(".") ? name.split(".").pop() : "")?.toLowerCase() || "";
      return { name, ext };
    };

    const sfs = latest?.submissionFiles ?? [];
    for (const sf of sfs) {
      const key = sf?.deliverableId ?? sf?.deliverable?.id ?? "unknown";
      for (const u of toUrls(sf?.fileUrl)) {
        const { name, ext } = parse(u);
        (map[key] ??= []).push({ name, href: u, ext });
      }
    }
    return map;
  }, [latest]);

  /** ---- Map allowed type/mime → actual extensions ---- */
  const extsForAllowed = (aft: any) => {
    const type = String(aft?.type || "").toLowerCase();
    const mime = String(aft?.mime || "").toLowerCase();

    if (mime.includes("pdf") || type.includes("pdf")) return new Set(["pdf"]);
    if (mime.includes("word") || mime.includes("officedocument") || type.includes("word"))
      return new Set(["docx", "doc"]);
    // add more mappings as your system supports (pptx, xlsx, etc.)
    return undefined; // if unknown, show all files for this deliverable block
  };

  return (
    <div className="p-6 space-y-6 font-dbheavent bg-white min-h-[50vh]">
      {loading && <div className="text-gray-600">Loading submission…</div>}
      {err && <div className="text-red-600">{err}</div>}
      {!loading && !err && !latest && (
        <div className="text-gray-600">No submission found yet.</div>
      )}

      {latest && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-black">Your submission</h2>
            </div>
            {/* optional: resubmit button if you need */}
            {/* {onResubmit && <button onClick={onResubmit} className="...">Resubmit</button>} */}
          </div>

          <div>
            <div className="text-lg text-black font-semibold">Comment</div>
            <div className="whitespace-pre-wrap text-black text-lg">
              " {latest.comment?.trim() || "—"} "
            </div>
          </div>

          <div className="space-y-2">
            {(detail?.deliverables ?? []).map((del) => {
              const links = linksByDeliverable[del.id] ?? [];
              return (
                <div key={del.id} className="border border-gray-300 rounded-md p-4 space-y-2 mt-4">
                  <div className="font-semibold text-lg">{del.name}</div>

                  {del.allowedFileTypes?.length ? (
                    del.allowedFileTypes.map((aft: any) => {
                      const exts = extsForAllowed(aft);
                      const matched = exts ? links.filter((l) => exts.has(l.ext)) : links;

                      return (
                        <div key={aft.id} className="flex items-center gap-4 mb-2">
                          <span className="font-semibold text-black">{aft.type}</span>
                          {matched.length === 0 ? (
                            <span className="text-sm text-gray-500">No file</span>
                          ) : (
                            <div className="flex flex-col">
                              {matched.map((l) => (
                                <a
                                  key={l.href}
                                  href={l.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#326295] hover:underline truncate"
                                  title={l.name}
                                >
                                  {l.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Fallback if no allowed types defined: list everything under this deliverable
                    <div className="mt-2">
                      {links.length === 0 ? (
                        <span className="text-sm text-gray-500">No file</span>
                      ) : (
                        <div className="flex flex-col">
                          {links.map((l) => (
                            <a
                              key={l.href}
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#326295] hover:underline truncate"
                              title={l.name}
                            >
                              {l.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
