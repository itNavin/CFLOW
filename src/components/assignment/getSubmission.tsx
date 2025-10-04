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

  const filesByDeliverable = useMemo(() => {
    const map: Record<string, any[]> = {};
    const files = latest?.files || latest?.submissionFiles || [];
    for (const f of files ?? []) {
      const key =
        f?.deliverableId ??
        f?.assignmentDeliverableId ??
        f?.deliverable?.id ??
        f?.assignmentDeliverable?.id ??
        "unknown";
      if (!map[key]) map[key] = [];
      map[key].push(f);
    }
    return map;
  }, [latest]);

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
          </div>

          <div>
            <div className="text-lg text-black font-semibold">Comment</div>
            <div className="whitespace-pre-wrap text-black text-lg">
              " {latest.comment?.trim() || "—"} "
            </div>
          </div>
          <div className="space-y-2">
            {(detail?.deliverables ?? []).map((del) => {
              const files = filesByDeliverable[del.id] ?? [];
              return (
                <div key={del.id} className="border border-gray-300 rounded-md p-4 space-y-2 mt-4">
                  <div className="font-semibold text-lg">{del.name}</div>

                  {/* Allowed file types: show once per deliverable */}
                  <div className="font-semibold text-black flex flex-col mb-2">
                    {del.allowedFileTypes.map(aft => (
                      <span key={aft.id}>{aft.type}</span>
                    ))}
                  </div>


                  {/* Show file names after allowed file types */}
                  {files.length === 0 ? (
                    <div className="text-sm text-gray-500 mt-2">
                      No files uploaded for this deliverable in the latest version.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      {files.map((f) => {
                        const fileName =
                          f?.originalName || f?.fileName || f?.name || "file";
                        const ext =
                          (fileName.split(".").pop() || f?.mime || "").toLowerCase();

                        return (
                          <div key={f.id ?? fileName} className="flex items-center gap-3">
                            <span className="mr-2 text-xs rounded bg-gray-100 px-2 py-0.5">
                              {ext || "FILE"}
                            </span>
                            <span className="truncate align-middle">{fileName}</span>
                          </div>
                        );
                      })}
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
