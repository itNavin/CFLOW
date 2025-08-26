"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const assignment = {
    title: `A04_V01: Chapters 4-5`,
    dueDate: "30/04/2025 9:00 PM",
    description:
      "You are required to submit your combined report for Chapters 4 to 5 as part of your capstone project progress. This submission will be reviewed by your advisor, who will provide feedback and indicate whether revisions are required.",
    chapters: ["Chapter4", "Chapter5"],
  };

  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<{
    [chapter: string]: { pdf?: File; docx?: File };
  }>({});

  const handleFileChange = (
    chapter: string,
    type: "pdf" | "docx",
    file: File
  ) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [chapter]: {
        ...prev[chapter],
        [type]: file,
      },
    }));
  };

  return (
    <div className="p-6 space-y-6 font-dbheavent bg-white min-h-screen">
      <div className="flex items-center gap-2 text-3xl font-semibold text-black">
        <button
          onClick={() => router.back()}
          className="text-lg text-black hover:text-gray-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2>{assignment.title}</h2>
      </div>

      <p className="text-lg text-gray-600 font-medium">
        <strong>Due date</strong> {assignment.dueDate}
      </p>

      <p className="text-lg text-gray-700">{assignment.description}</p>

      <hr className="my-4" />

      <div
        className="text-lg text-blue-600 underline cursor-pointer w-fit"
        onClick={() => setShowCommentBox((prev) => !prev)}
      >
        Comment
      </div>

      {showCommentBox && (
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-lg"
          placeholder="Write your comment here..."
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      )}

      {assignment.chapters.map((ch) => (
        <div
          key={ch}
          className="border border-gray-300 rounded-md p-4 space-y-2 mt-4"
        >
          <div className="font-semibold text-xl">{ch}</div>
          <div className="space-y-1">
            <div className="text-lg">
              <span className="font-bold">.PDF</span>{" "}
              <label className="text-blue-600 underline cursor-pointer">
                Upload
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileChange(ch, "pdf", e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-lg">
              <span className="font-bold">.DOCX</span>{" "}
              <label className="text-blue-600 underline cursor-pointer">
                Upload
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) =>
                    e.target.files &&
                    handleFileChange(ch, "docx", e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-6">
        <button className="px-6 py-3 bg-[#305071] text-white text-lg rounded-md shadow">
          Turn in
        </button>
      </div>
    </div>
  );
}
