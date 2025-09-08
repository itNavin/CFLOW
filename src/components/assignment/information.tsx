"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";
import { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import AssignmentGroup from "./group";

interface InformationAssignmentProps {
  data : getAllAssignments.getAssignmentWithSubmission | undefined;
}

export default function AssignmentInformation({
  data
}: InformationAssignmentProps) {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const isStudent = (role ?? "") === "student";
  

  useEffect(() => {
    setRole(getUserRole());
    setIsClient(true);
  }, []);

  

  if (!isClient) {
    return (
      <div>
        <div className="flex items-center gap-2 text-3xl font-semibold text-black">
          <button
            onClick={() => router.back()}
            className="text-lg text-black hover:text-gray-600"
          >
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

  return (
    <div>
      <div className="flex items-center gap-2 text-3xl font-semibold text-black">
        <button
          onClick={() => router.back()}
          className="text-lg text-black hover:text-gray-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>{data?.name || "Assignment"}</h2>
      </div>
      
      {role !== "student" && <AssignmentGroup />}
      
      <p className="text-lg text-gray-600 font-medium">
        <strong className="mr-2">Due date</strong>{" "}
        {data?.assignmentDueDates?.[0]?.dueDate || "Not set"}{" "}
        {!isStudent && data?.endDate && (
          <>
            {" "}
            <strong className="mr-2">End date</strong> {data.endDate}
          </>
        )}
      </p>

      <p className="text-lg text-gray-700">{data?.description || "No description available"}</p>

      <hr className="my-4" />
    </div>
  );
}
