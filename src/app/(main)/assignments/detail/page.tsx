"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import SubmitAssignment from "@/components/assignment/submit";
import AssignmentInformation from "@/components/assignment/information";
import AssignmentGroup from "@/components/assignment/group";
import { get } from "http";
import { getUserRole } from "@/util/cookies";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const assignmentId = useSearchParams().get("assignmentId") || "";
  const groupId = useSearchParams().get("groupId") || "";
  const role = getUserRole();
  const isStudent = (role ?? "") === "student";
  const isLecturer = (role ?? "") === "lecturer";
  const isStaff = (role ?? "") === "staff";

  return (
    <div>
      <AssignmentInformation
        assignmentId={Number(assignmentId)}
        groupId={Number(groupId)}
      />
      <SubmitAssignment
        assignmentId={Number(assignmentId)}
        groupId={Number(groupId)}
      />

      <div className="flex justify-end mt-6">
        <button className="px-6 py-3 bg-[#305071] text-white text-lg rounded-md shadow">
          Turn in
        </button>
      </div>
    </div>
  );
}
{
  /* <Feedback
        workFile={{
          name: "G0001_A01_V01.pdf",
          href: "/files/G0001_A01_V01.pdf",
        }}
        onSubmit={async (data) => {
          console.log("Feedback submitted:", data);
        }}
      /> */
}

{
  /* <Version
        versionLabel="Version 01"
        statusText="Not Approved"
        statusVariant="not_approved"
        feedback={[
          {
            chapter: "Chapter 4",
            title: "System Design and Implementation",
            comments: [
              "Good overview of the system components, but the architecture diagram needs clearer labeling and descriptions.",
              "The implementation section is too brief — consider expanding on key technologies and how they were integrated.",
              "Please add brief justifications for design decisions (e.g., why certain frameworks or patterns were used).",
            ],
            files: [{ name: "Vithida_G0001_Chapter4_V01.pdf", href: "#" }],
          },
          {
            chapter: "Chapter 5",
            title: "Testing and Evaluation",
            comments: [
              "Well-structured and clearly presented.",
              "The test cases, results, and analysis are sufficient — no major revisions needed.",
            ],
            files: [],
          },
        ]}
        workDescription="Submitted Chapters 4–5 with system design, implementation, and testing results. Ready for your review."
        work={[
          {
            chapter: "Chapter4",
            files: [
              { name: "G0001_Chapter4_V01.pdf", href: "#" },
              { name: "G0001_Chapter4_V01.docx", href: "#" },
            ],
          },
          {
            chapter: "Chapter5",
            files: [
              { name: "G0001_Chapter5_V01.pdf", href: "#" },
              { name: "G0001_Chapter5_V01.docx", href: "#" },
            ],
          },
        ]}
      /> */
}
