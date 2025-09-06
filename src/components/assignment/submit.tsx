"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAssignmentWithSubmissionAPI } from "@/api/assignment/getAssignmentWithSubmission";
import { getAllAssignments } from "@/types/api/assignment";
import { getUserRole } from "@/util/cookies";

interface SubmitAssignmentProps {
  assignmentId: number;
  groupId: number;
}

export default function SubmitAssignment({
  assignmentId,
  groupId,
}: SubmitAssignmentProps) {
  const router = useRouter();
  const role = getUserRole();
  const isStudent = (role ?? "") === "student";
  const [comment, setComment] = useState("");

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

      {data?.deliverables.map((del) => (
        <div
          key={del.id}
          className="border border-gray-300 rounded-md p-4 space-y-2 mt-4"
        >
          <div className="font-semibold text-xl">{del.name}</div>
          <div className="space-y-2">
            {del.allowedFileTypes.map((aft) => {
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
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
