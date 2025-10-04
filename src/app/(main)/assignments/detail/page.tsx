// AssignmentDetailPage.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AssignmentInformation from "@/components/assignment/information";
import SubmitAssignment from "@/components/assignment/submit";
import ViewSubmission from "@/components/assignment/getSubmission";
import { getUserRole } from "@/util/cookies";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import type { assignmentDetail, getAllAssignments } from "@/types/api/assignment";
import ViewSubmissionVersions from "@/components/assignment/version";

const clean = (v: string | null | undefined) =>
  v && v !== "null" && v !== "undefined" && v !== "0" ? v : undefined;

const latestOf = (subs?: any[]) => {
  if (!Array.isArray(subs) || subs.length === 0) return null;
  return [...subs].sort((a, b) => {
    const v = (b.version ?? 0) - (a.version ?? 0);
    if (v !== 0) return v;
    return new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime();
  })[0];
};

export default function AssignmentDetailPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const assignmentId = useMemo(() => clean(sp.get("assignmentId")), [sp]);
  const courseId = useMemo(() => clean(sp.get("courseId")), [sp]);

  const role = getUserRole();
  const isStudent = (role ?? "") === "student";

  const [data, setData] =
    useState<getAllAssignments.getAssignmentWithSubmission | undefined>(undefined);
  const [detail, setDetail] =
    useState<assignmentDetail.AssignmentStudentDetail["assignment"] | null>(null);

  // ---- fetchers ----
  const fetchBase = useCallback(async () => {
    if (!courseId || !assignmentId) return;
    try {
      const res = await getAssignmentWithSubmissionAPI(courseId, assignmentId);
      setData(res.data);
    } catch (e) {
      console.error("[getAssignmentWithSubmissionAPI] error:", e);
    }
  }, [courseId, assignmentId]);

  const fetchDetail = useCallback(async () => {
    if (!courseId || !assignmentId) return;
    try {
      const res = await getStdAssignmentDetailAPI(courseId, assignmentId);
      setDetail(res.data.assignment);
    } catch (e) {
      console.error("[getStdAssignmentDetailAPI] error:", e);
    }
  }, [courseId, assignmentId]);

  useEffect(() => {
    fetchBase();
    fetchDetail();
  }, [fetchBase, fetchDetail]);

  const latest = latestOf(detail?.submissions);
  const waitingReview = isStudent && latest?.status === "SUBMITTED";

  // When submit finishes inside the modal, re-fetch; the conditional below will auto-close the modal
  const handleSubmitted = useCallback(async () => {
    await Promise.all([fetchDetail(), fetchBase()]);
    // After this, latest?.status should be SUBMITTED; JSX below will switch to <ViewSubmission />
  }, [fetchDetail, fetchBase]);

  return (
    <div>
      <AssignmentInformation data={data} />
      <ViewSubmissionVersions />

      {isStudent && (
        <>
          {detail === null
            ? <div className="p-6 text-gray-500">Loading assignment details…</div>
            : waitingReview
              ? <ViewSubmission data={data} />
              : <SubmitAssignment data={data} onSubmitted={handleSubmitted} />
          }
        </>
      )}
    </div>
  );
}
