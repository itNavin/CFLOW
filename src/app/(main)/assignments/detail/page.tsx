"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AssignmentInformation from "@/components/assignment/information";
import SubmitAssignment from "@/components/assignment/submit";
import ViewSubmission from "@/components/assignment/getSubmission";
import { getUserRole } from "@/util/cookies";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import type { assignmentDetail, getAllAssignments } from "@/types/api/assignment";
import ViewSubmissionVersions from "@/components/assignment/versionStd";
import GiveFeedback from "@/components/assignment/feedback";
import GiveFeedbackLecturer from "@/components/assignment/feedback";
import { getLecStfAssignmentDetailAPI } from "@/api/assignment/assignmentDetail";

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

export default function AssignmentDetailContent() {
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

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);

  const fetchBase = useCallback(async () => {
    if (!courseId || !assignmentId || !selectedGroup) return;
    try {
      const res = await getLecStfAssignmentDetailAPI(courseId, assignmentId, selectedGroup);
      setData({
        ...res.data.assignment,
        submissions: res.data.assignment.submissions?.map((submission: any) => ({
          ...submission,
          submissionFiles: submission.submissionFiles?.map((file: any) => ({
            ...file,
            fileUrl: Array.isArray(file.fileUrl) ? file.fileUrl : [file.fileUrl],
          })) ?? [],
        })) ?? [],
      });
    } catch (e) {
      console.error("[getLecStfAssignmentDetailAPI] error:", e);
    }
  }, [courseId, assignmentId, selectedGroup]);

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

  const handleSubmitted = useCallback(async () => {
    await Promise.all([fetchDetail(), fetchBase()]);
  }, [fetchDetail, fetchBase]);

  const assignmentEndISO =
    (detail as any)?.endDate ??
    (data as any)?.endDate ??
    (data as any)?.assignmentDueDates?.[0]?.endDate ??
    undefined;
  const isPastEnd = assignmentEndISO ? Date.parse(assignmentEndISO) < Date.now() : false;

  return (
    <div>
      <AssignmentInformation
        data={data}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        courseId={courseId!}
        assignmentId={assignmentId}
        role={role}
      />

      {["lecturer", "advisor", "staff"].includes(role ?? "") && selectedGroup && (
        <GiveFeedbackLecturer
          courseId={courseId ?? ""}
          assignmentId={assignmentId ?? ""}
          groupId={selectedGroup}
          onFeedbackGiven={handleSubmitted}
          role={role!}
        />
      )}

      {isStudent && (
        <>
          <ViewSubmissionVersions />
          {detail === null
            ? <div className="p-6 text-gray-500">Loading assignment details…</div>
            : waitingReview
              ? <ViewSubmission data={data} />
              : isPastEnd
                ? (
                  <div className="p-6">
                    <div className="p-2 text-red-700 text-lg font-semibold">
                      The submission period has ended, submissions are closed.
                    </div>
                  </div>
                )
                : <SubmitAssignment data={data} onSubmitted={handleSubmitted} />
          }
        </>
      )}
    </div>
  );
}