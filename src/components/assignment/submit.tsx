"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";
import { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";
import { createAssignmentAPI } from "@/api/assignment/createAssignment";
import { createAssignment } from "@/types/api/assignment";
import { uploadSubmissionFileAPI } from "@/api/submission/createSubmission";
import { uploadSubmissionFile } from "@/types/api/file";
import { createSubmissionAPI } from "@/api/submission/createSubmission";


interface SubmitAssignmentProps {
  data: getAllAssignments.getAssignmentWithSubmission | undefined;
}

export default function SubmitAssignment({
  data,
  
}: SubmitAssignmentProps) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);    
  const isStudent = (role ?? "") === "student";
  const [comment, setComment] = useState("");
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get("courseId")) || 0;
  const assignmentId = Number(searchParams.get("assignmentId")) || 0;
  const groupId = Number(searchParams.get("groupId")) || 0;

  
  useEffect(() => {
    setRole(getUserRole());
    setIsClient(true);
  }, []);

  type DraftState = Record<
    number, 
    Record<number, { file: File; mime: string }> 
  >;

  const [drafts, setDrafts] = useState<DraftState>({});
  const [submitting, setSubmitting] = useState(false);

  const onDraftSelect =
    (deliverableId: number, aftId: number, mime: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setDrafts((prev) => ({
        ...prev,
        [deliverableId]: {
          ...(prev[deliverableId] ?? {}),
          [aftId]: { file, mime },
        },
      }));

      e.target.value = ""; 
    };

  const removeDraft = (deliverableId: number, aftId: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      const map = { ...(next[deliverableId] ?? {}) };
      delete map[aftId];
      if (Object.keys(map).length) next[deliverableId] = map;
      else delete next[deliverableId];
      return next;
    });
  };

  if (!isClient) {
    return (
      <div className="p-6 space-y-6 font-dbheavent bg-white min-h-screen">
        <div className="text-lg">Loading assignment...</div>
      </div>
    );
  }
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!courseId || !assignmentId || !groupId) {
        alert("Missing courseId, assignmentId, or groupId");
        return;
      }
      const createdSubmission = await createSubmissionAPI(
        courseId,
        assignmentId,
        comment
      );
      console.log("createdSubmissionStatus: ", createdSubmission.status);
      
      if (createdSubmission.status !== 201) {
        alert("Failed to create submission");
        return;
      }
      const submissionId = createdSubmission.data.id;
      if (drafts && Object.keys(drafts).length > 0) {
        Object.entries(drafts).forEach(async ([delId, aftMap]) => {
          const deliverableId = Number(delId);
          if (Number.isNaN(deliverableId)) return;

          Object.entries(aftMap).forEach(async ([aftId, draft]) => {
            const createdSubmissionFile = await uploadSubmissionFileAPI(courseId, assignmentId, deliverableId, groupId, submissionId, draft.file)
            if (createdSubmissionFile.id === -1) {
              alert("Failed to upload submission file");
              return;
            }
          });
        });
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6 font-dbheavent bg-white min-h-screen">
      

      <label htmlFor="comment" className="text-lg text-black font-semibold">
        Comment
      </label>
      <textarea
        id="comment"
        className="w-full border border-gray-300 rounded-md p-3 text-lg"
        placeholder="Write your comment here..."
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {data?.deliverables && data.deliverables.length > 0 ? (
        data.deliverables.map((del) => (
          <div
            key={del.id}
            className="border border-gray-300 rounded-md p-4 space-y-2 mt-4"
          >
            <div className="font-semibold text-xl">{del.name}</div>
            <div className="space-y-2">
              {del.allowedFileTypes && del.allowedFileTypes.length > 0 ? (
                del.allowedFileTypes.map((aft) => {
                  const selected = drafts[del.id]?.[aft.id];
                  return (
                    <div
                      className="text-lg flex items-center gap-3 flex-wrap"
                      key={aft.id}
                    >
                      <span className="font-bold">{aft.type}</span>
                      <label className="text-blue-600 underline cursor-pointer">
                        {selected ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept={aft.mime}
                          onChange={onDraftSelect(del.id, aft.id, aft.mime)}
                          className="hidden"
                        />
                      </label>

                      {selected && (
                        <>
                          <span className="text-sm break-all bg-gray-100 px-2 py-1 rounded">
                            {selected.file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDraft(del.id, aft.id)}
                            className="text-red-600 text-sm underline"
                          >
                            remove
                          </button>
                        </>
                      )}

                      {!selected && (
                        <span className="text-sm text-gray-500">
                          No file selected
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 text-sm">
                  No file types specified for this deliverable
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-lg mt-4">
          {data ? "No deliverables found for this assignment" : "Loading deliverables..."}
        </div>
      )}
      <div className="flex justify-end mt-6">
        <button className="px-6 py-3 bg-[#305071] text-white text-lg rounded-md shadow" onClick={handleSubmit} disabled={submitting}>
          Turn in
        </button>
      </div>
    </div>
  );
}
