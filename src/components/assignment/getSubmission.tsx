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
            {(detail?.deliverables ?? []).map((del) => (
              <div key={del.id} className="border border-gray-300 rounded-md p-4 space-y-2 mt-4">
                <div className="font-semibold text-lg">{del.name}</div>
                {del.allowedFileTypes.map(aft => {
                  const files = (filesByDeliverable[del.id] ?? []).filter(f => {
                    const fileName = f?.originalName || f?.fileName || f?.name || "";
                    const ext = fileName.split(".").pop()?.toLowerCase();
                    // Match by extension or by aft.type (case-insensitive)
                    return ext === aft.type?.toLowerCase();
                  });

                  return (
                    <div key={aft.id} className="flex items-center gap-4 mb-2">
                      <span className="font-semibold text-black">
                        {aft.type}
                      </span>
                      {files.length === 0 ? (
                        <span className="text-sm text-gray-500">No file</span>
                      ) : (
                        files.map(f => {
                          const fileName = f?.originalName || f?.fileName || f?.name || "file";
                          return (
                            <span key={f.id ?? fileName} className="truncate align-middle ml-2">
                              {fileName}
                            </span>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}