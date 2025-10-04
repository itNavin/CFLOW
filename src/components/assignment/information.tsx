"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import AssignmentGroup from "./group";
import { getStdAssignmentDetailAPI } from "@/api/assignment/stdAssignmentDetail";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";

interface InformationAssignmentProps {
  // if parent ever passes it, we’ll use it; otherwise we’ll fetch it here
  data?: getAllAssignments.getAssignmentWithSubmission | undefined;
}

const clean = (v: string | null | undefined) =>
  v && v !== "null" && v !== "undefined" && v !== "0" ? v : undefined;

const formatDateTime = (
  input?: string | null,
  locale: string = "en-GB",
  timeZone: string = "Asia/Bangkok"
) => {
  if (!input) return "Not set";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
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

  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // local copies so this component works even if `data` is not passed
  const [baseData, setBaseData] = useState<getAllAssignments.getAssignmentWithSubmission | undefined>(undefined);
  const [getDetail, setGetDetail] = useState<any>(null);

  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isStudent = (role ?? "") === "student";

  // IDs from URL
  const courseId = useMemo(() => clean(sp.get("courseId")) ?? data?.courseId, [sp, data?.courseId]);
  const assignmentId = useMemo(() => clean(sp.get("assignmentId")) ?? data?.id, [sp, data?.id]);

  // client + role
  useEffect(() => {
    setRole(getUserRole());
    setIsClient(true);
  }, []);

  // Fetch general assignment (for title/description/dates) if not passed in
  useEffect(() => {
    if (!isClient || data || !courseId || !assignmentId) return;

    let cancelled = false;
    setLoadingBase(true);

    (async () => {
      try {
        const res = await getAssignmentWithSubmissionAPI(courseId, assignmentId);
        if (!cancelled) {
          setBaseData(res.data);
        }
      } catch (e) {
        console.error("[assignmentWithSubmission] error:", e);
      } finally {
        if (!cancelled) setLoadingBase(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient, data, courseId, assignmentId]);

  // Fetch student-specific detail when student
  useEffect(() => {
    if (!isClient || !isStudent || !courseId || !assignmentId) return;

    let cancelled = false;
    setLoadingDetail(true);

    (async () => {
      try {
        const res = await getStdAssignmentDetailAPI(courseId, assignmentId);
        if (!cancelled) {
          const payload = res.data?.assignment ?? res.data;
          setGetDetail(payload);
        }
      } catch (e) {
        console.error("[std detail] error:", e);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isClient, isStudent, courseId, assignmentId]);

  if (!isClient) {
    return (
      <div>
        <div className="flex items-center gap-2 text-3xl font-semibold text-black">
          <button onClick={() => router.back()} className="text-lg text-black hover:text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2>Loading...</h2>
        </div>
        <p className="text-lg text-gray-600 font-medium">
          <strong className="mr-2">Due date</strong> Loading...
        </p>
        <p className="text-lg text-gray-700">Loading description...</p>
        <hr className="my-4" />
      </div>
    );
  }

  const source = getDetail ?? data ?? baseData;

  const title = source?.name ?? "Assignment";
  const dueDate =
    source?.dueDate ??
    source?.assignmentDueDates?.[0]?.dueDate ??
    null;

  const endDate = source?.endDate ?? null;
  const description = source?.description ?? "No description available";

  return (
    <div>
      <div className="flex items-center gap-2 text-3xl font-semibold text-black">
        <button onClick={() => router.back()} className="text-lg text-black hover:text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>{title}</h2>
      </div>

      {role !== "student" && <AssignmentGroup />}

      <p className="text-lg text-gray-600 font-medium">
        <strong className="mr-2">Due date</strong>
        {formatDateTime(dueDate)}{" "}
        {!isStudent && endDate && (
          <>
            <strong className="ml-3 mr-2">End date</strong>
            {formatDateTime(endDate)}
          </>
        )}
      </p>

      <p className="text-lg text-gray-700">Description : {description}</p>
      <hr className="my-4" />
    </div>
  );
}
