"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import SubmitAssignment from "@/components/assignment/submit";
import AssignmentInformation from "@/components/assignment/information";
import AssignmentGroup from "@/components/assignment/group";
import { get } from "http";
import { getUserRole } from "@/util/cookies";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";
import { getAllAssignments } from "@/types/api/assignment";


export default function AssignmentDetailPage() {
  const router = useRouter();
  const assignmentId = Number(useSearchParams().get("assignmentId")) || 0;
  const groupId = Number(useSearchParams().get("groupId")) || 0;
  const courseId = Number(useSearchParams().get("courseId")) || 0;
  const role = getUserRole();
  const isStudent = (role ?? "") === "student";
  const isLecturer = (role ?? "") === "lecturer";
  const isStaff = (role ?? "") === "staff";
    const [data, setData] = useState<getAllAssignments.getAssignmentWithSubmission>();
  console.log("data:", data);

  const fetchAssignmentAndSubmission = async () => {
        try {
          console.log("get in submit")
          if (!assignmentId || !courseId) return;      
    
          const response = await getAssignmentWithSubmissionAPI(courseId, assignmentId);
          setData(response.data);
          console.log("Assignment with submission response:", response.data);
        } catch (e) {
          console.error("Error fetching assignment and submission:", e);
        }
      };
      useEffect(() => {
        fetchAssignmentAndSubmission();
      }, [courseId, assignmentId]);
  

  return (
    <div>
      <AssignmentInformation
        data={data}
      />
      <SubmitAssignment
        data={data}
      />

      
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
