"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserRole } from "@/util/cookies";
import { getLecStfAssignmentDetailAPI } from "@/api/assignment/assignmentDetail";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import { getAllAssignments, assignmentDetail } from "@/types/api/assignment";
import AssignmentGroup from "./groupSelector";
import { ArrowLeft } from "lucide-react";
import ViewSubmissionVersionsStfLec from "./versionStfLec";
import GiveFeedbackLecturer from "./feedback";

interface InformationAssignmentProps {
  data?: getAllAssignments.getAssignmentWithSubmission | undefined;
  selectedGroup?: string;
  setSelectedGroup?: React.Dispatch<React.SetStateAction<string | undefined>>;
  courseId: string;
  assignmentId?: string;
  role?: string;
}

const clean = (v: string | null | undefined) =>
  v && v !== "null" && v !== "undefined" && v !== "0" ? v : undefined;

const formatDateTime = (
  input?: string | null,
  locale: string = "en-GB",
  timeZone: string = "Asia/Bangkok"
) => {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });
};

export default function AssignmentInformation({ data }: InformationAssignmentProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const assignmentId = useMemo(() => clean(sp.get("assignmentId")), [sp]);
  const courseId = useMemo(() => clean(sp.get("courseId")), [sp]);
  const role = getUserRole();

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const [lecStfDetail, setLecStfDetail] = useState<assignmentDetail.AssignmentLecStfDetail | null>(null);
  const [stdDetail, setStdDetail] = useState<assignmentDetail.AssignmentStudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (
      !["lecturer", "advisor", "staff"].includes(role ?? "") ||
      !courseId ||
      !assignmentId ||
      !selectedGroup
    ) return;

    let cancelled = false;
    setLoadingDetail(true);

    (async () => {
      try {
        const res = await getLecStfAssignmentDetailAPI(courseId, assignmentId, selectedGroup);
        if (!cancelled) setLecStfDetail(res.data);
      } catch (e) {
        console.error("[lec/stf detail] error:", e);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => { cancelled = true; };
  }, [role, courseId, assignmentId, selectedGroup]);

  // Fetch for student
  useEffect(() => {
    if ((role ?? "") !== "student" || !courseId || !assignmentId) return;

    let cancelled = false;
    setLoadingDetail(true);

    (async () => {
      try {
        const res = await getStdAssignmentDetailAPI(courseId, assignmentId);
        if (!cancelled) setStdDetail(res.data);
      } catch (e) {
        console.error("[student detail] error:", e);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => { cancelled = true; };
  }, [role, courseId, assignmentId]);

  // Choose the correct source for assignment info
  let assignmentObj: any = null;
  if (["lecturer", "advisor", "staff"].includes(role ?? "")) {
    assignmentObj =
      (lecStfDetail as assignmentDetail.AssignmentLecStfDetail)?.assignment ??
      (data as getAllAssignments.getAssignmentWithSubmission);
  } else if ((role ?? "") === "student") {
    assignmentObj =
      (stdDetail as assignmentDetail.AssignmentStudentDetail)?.assignment ??
      (data as getAllAssignments.getAssignmentWithSubmission);
  } else {
    assignmentObj = data as getAllAssignments.getAssignmentWithSubmission;
  }

  const title = assignmentObj?.name ?? "-";
  const description = assignmentObj?.description ?? "-";
  const dueDate = assignmentObj?.dueDate ?? null;
  const endDate = assignmentObj?.endDate ?? null;
  const assignmentFiles = assignmentObj?.assignmentFiles ?? [];

  const sortedSubmissions =
    (["lecturer", "advisor"].includes(role ?? "") &&
      Array.isArray(assignmentObj?.submissions))
      ? [...assignmentObj.submissions].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [];

  return (
    <div>
      <div className="flex items-center gap-2 text-3xl font-semibold text-black">
        <button onClick={() => router.back()} className="text-lg text-black hover:text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>{title}</h2>
      </div>

      <p className="text-lg text-gray-600 font-medium">
        <strong className="mr-2">Due date</strong>
        {formatDateTime(dueDate)}{" "}
        {role !== "student" && endDate && (
          <>
            <strong className="ml-3 mr-2">End date</strong>
            {formatDateTime(endDate)}
          </>
        )}
      </p>

      <p className="text-lg text-gray-700">Description : {description}</p>

      {/* Assignment Files Section */}
      {assignmentFiles.length > 0 && (
        <div className="my-4">
          <div className="font-semibold text-lg mb-2">Assignment Files</div>
          <ul className="space-y-2">
            {assignmentFiles.map((file: any) => (
              <li key={file.id} className="flex items-center gap-2">
                <span className="truncate">{file.name}</span>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  download
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr className="my-4" />

      {["lecturer", "advisor", "staff"].includes(role ?? "") && (
        <AssignmentGroup
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          role={role}
          courseId={courseId!}
        />
      )}

      {["lecturer", "advisor", "staff"].includes(role ?? "") && selectedGroup && (
        <ViewSubmissionVersionsStfLec
          groupId={selectedGroup}
          courseId={courseId}
          assignmentId={assignmentId}
        />
      )}

      {["lecturer", "advisor", "staff"].includes(role ?? "") && selectedGroup && (
        <GiveFeedbackLecturer
          courseId={courseId ?? ""}
          assignmentId={assignmentId ?? ""}
          groupId={selectedGroup}
          onFeedbackGiven={() => window.location.reload()}
          role={role}
        />
      )}

      {loadingDetail && <div>Loading assignment detail...</div>}
    </div>
  );
}