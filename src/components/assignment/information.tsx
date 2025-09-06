"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";
import { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import AssignmentGroup from "./group";

interface InformationAssignmentProps {
  assignmentId: number;
  groupId: number;
}

export default function AssignmentInformation({
  assignmentId,
  groupId,
}: InformationAssignmentProps) {
  const router = useRouter();
  const role = getUserRole();
  const isStudent = (role ?? "") === "student";
  const [data, setData] =
    useState<getAllAssignments.getAssignmentWithSubmission>();

  const fetchAssignmentAndSubmission = async () => {
    try {
      if (!assignmentId || !groupId) return;
      const aid = Number(assignmentId);
      const gid = Number(groupId);

      const response = await getAssignmentWithSubmissionAPI(aid, gid);
      setData(response.data);
      console.log("Assignment with submission response:", response.data);
    } catch (e) {
      console.error("Error fetching assignment and submission:", e);
    }
  };
  useEffect(() => {
    fetchAssignmentAndSubmission();
  }, [assignmentId, groupId]);

  return (
    <div>
      <div className="flex items-center gap-2 text-3xl font-semibold text-black">
        <button
          onClick={() => router.back()}
          className="text-lg text-black hover:text-gray-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>{data?.name}</h2>
      </div>
      {
        role !== "student" &&
        <AssignmentGroup />
      }
      <p className="text-lg text-gray-600 font-medium">
        <strong className="mr-2">Due date</strong>{" "}
        {data?.assignmentDueDates[0].dueDate}{" "}
        {!isStudent && data?.endDate && (
          <>
            {" "}
            <strong className="mr-2">End date</strong> {data.endDate}
          </>
        )}
      </p>

      <p className="text-lg text-gray-700">{data?.description}</p>

      <hr className="my-4" />
    </div>
  );
}
