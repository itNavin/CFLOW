"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getLecStfAssignmentDetailAPI } from "@/api/assignment/assignmentDetail";
import { giveFeedbackAPI } from "@/api/assignment/giveFeedback";
import { uploadFeedbackFileAPI } from "@/api/assignment/uploadFeedbackFile";
import type { assignmentDetail } from "@/types/api/assignment";
import { Upload, X } from "lucide-react";
import { changeFeedbackFileName } from "@/util/fileName";
import { getProfileAPI } from "@/api/profile/getProfile";
import { downloadSubmissionFileAPI } from "@/api/assignment/downloadSubmissionFile";
import { useToast } from "../toast";
import { isoToBangkokInput, bangkokInputToIso } from "@/util/bangkokDate";

type Props = {
  courseId: string;
  assignmentId: string;
  groupId: string;
  role: string;
  onFeedbackGiven?: () => void;
};

export default function GiveFeedbackLecturer({
  courseId,
  assignmentId,
  groupId,
  role,
  onFeedbackGiven,
}: Props) {
  const { showToast } = useToast();
  const [detail, setDetail] = useState<assignmentDetail.AssignmentLecStfDetail["assignment"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("FINAL");
  const [newDueDate, setNewDueDate] = useState("");
  const [username, setUsername] = useState<string>("");

  // validation state
  const [assignmentEndISO, setAssignmentEndISO] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfileAPI();
        setUsername(res.data.profile?.user?.id || "");
      } catch (e) {
        setUsername("");
      }
    })();
  }, []);

  useEffect(() => {
    if (!courseId || !assignmentId || !groupId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getLecStfAssignmentDetailAPI(courseId, assignmentId, groupId);
        if (!cancelled) setDetail(res.data.assignment);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || "Failed to load assignment detail.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId, assignmentId, groupId]);

  const latestSubmission = useMemo(() => {
    const subs = detail?.submissions ?? [];
    if (!subs.length) return null;
    return [...subs].sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0];
  }, [detail]);

  const latestSubmissionFinal = useMemo(() => {
    const subs = detail?.submissions ?? [];
    if (!subs.length) return null;
    return subs.reduce((latest, curr) =>
      (curr.version ?? 0) > (latest.version ?? 0) ? curr : latest
    );
  }, [detail]);

  const deliverables = detail?.deliverables ?? [];

  const handleFileChange = (deliverableId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => ({
      ...prev,
      [deliverableId]: selectedFiles,
    }));
    e.target.value = "";
  };

  const removeFeedbackFile = (deliverableId: string, idx: number) => {
    setFiles((prev) => {
      const arr = [...(prev[deliverableId] ?? [])];
      arr.splice(idx, 1);
      return { ...prev, [deliverableId]: arr };
    });
  };

  const findAssignmentEndDate = (dt: any): string | null => {
    if (!dt) return null;

    const arr = dt?.assignmentDueDates;
    if (Array.isArray(arr) && arr.length) {
      for (const item of arr) {
        if (!item || typeof item !== "object") continue;
        if (item.endDate) return item.endDate;
        if (item.end_at) return item.end_at;
        if (item.end) return item.end;
        for (const k of Object.keys(item)) {
          if (/^end/i.test(k) && item[k]) return item[k];
        }
      }
    }

    if (dt?.endDate) return dt.endDate;
    if (dt?.end_at) return dt.end_at;
    if (dt?.end) return dt.end;
    return null;
  };

  // keep canonical ISO end date for validation (prefer detail then submission)
  useEffect(() => {
    const foundFromDetail = findAssignmentEndDate(detail);
    const foundFromSubmission = findAssignmentEndDate(latestSubmission);
    const maybeEnd = foundFromDetail ?? foundFromSubmission ?? null;
    setAssignmentEndISO(maybeEnd ? new Date(maybeEnd).toISOString() : null);
  }, [detail, latestSubmission]);

  const validateNewDueDate = (inputVal: string | null | undefined) => {
    setDueDateError(null);
    if (!inputVal) return true;
    const iso = bangkokInputToIso(inputVal);
    if (!iso) {
      setDueDateError("Invalid date/time");
      return false;
    }
    if (assignmentEndISO) {
      try {
        if (new Date(iso).getTime() > new Date(assignmentEndISO).getTime()) {
          setDueDateError("New due date must not be after assignment end date");
          return false;
        }
      } catch {
        setDueDateError("Invalid date/time");
        return false;
      }
    }
    setDueDateError(null);
    return true;
  };

  useEffect(() => {
    if (newStatus !== "APPROVED_WITH_FEEDBACK") return;
    const foundFromDetail = findAssignmentEndDate(detail);
    const foundFromSubmission = findAssignmentEndDate(latestSubmission);
    const maybeEnd = foundFromDetail ?? foundFromSubmission ?? null;
    const inputVal = isoToBangkokInput(maybeEnd);
    if (inputVal) {
      setNewDueDate(inputVal);
      validateNewDueDate(inputVal);
    }
  }, [newStatus, detail, latestSubmission]);

  const handleSubmitFeedback = async () => {
    if (!latestSubmission) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const mappedStatus = newStatus === "APPROVED" ? "FINAL" : newStatus;

      // validate before submit
      if (mappedStatus !== "FINAL") {
        const ok = validateNewDueDate(newDueDate);
        if (!ok) {
          setSubmitting(false);
          setSubmitError("Please fix due date before submitting.");
          showToast({ variant: "error", message: "Please fix due date before submitting." });
          return;
        }
      }

      const isoDueDate = mappedStatus === "FINAL" ? null : (newDueDate ? bangkokInputToIso(newDueDate) : null);

      const feedbackRes = await giveFeedbackAPI(
        latestSubmission.id,
        comment,
        isoDueDate,
        newStatus
      );
      const feedbackId = feedbackRes.feedback?.id;
      if (!feedbackId) {
        const msg = "Feedback ID not returned from server.";
        setSubmitError(msg);
        showToast({ variant: "error", message: msg });
        setSubmitting(false);
        return;
      }

      const groupNumber =
        detail?.assignmentDueDates?.[0]?.group?.codeNumber || "0";

      const uploads: Promise<any>[] = [];
      for (const [deliverableId, fileArr] of Object.entries(files)) {
        for (const file of fileArr) {
          const mime = file.type;
          const formattedName = changeFeedbackFileName({
            username: username,
            groupNumber: groupNumber,
            deliverableName: deliverables.find(d => d.id === deliverableId)?.name || "",
            version: latestSubmission.version,
            mime,
          });
          uploads.push(
            uploadFeedbackFileAPI(file, deliverableId, groupId, feedbackId, formattedName)
          );
        }
      }

      if (uploads.length > 0) {
        const results = await Promise.allSettled(uploads);
        const failures = results.filter((r) => (r as any).status === "rejected");
        if (failures.length > 0) {
          const msg = `Uploaded with ${failures.length} error(s).`;
          setSubmitError(msg);
          showToast({ variant: "warning", message: msg });
        }
      }

      const successMsg = "Feedback submitted successfully.";
      setSubmitSuccess(successMsg);
      showToast({ variant: "success", message: successMsg });
      setComment("");
      setFiles({});
      onFeedbackGiven?.();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to submit feedback.";
      setSubmitError(msg);
      showToast({ variant: "error", message: String(msg) });
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDownloadSubmission(submissionFileId: string, fileName: string) {
    try {
      const res = await downloadSubmissionFileAPI(submissionFileId);
      const url = res.data.url;
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const msg = "Failed to download file.";
      showToast({ variant: "error", message: msg });
    }
  }

  if (loading) return <div className="p-6">Loading assignment detail…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!latestSubmission) return <div className="p-6 text-gray-500">No submissions found.</div>;
  if (latestSubmissionFinal?.status === "FINAL") {
    return (
      <div className="p-6 text-green-700 text-lg font-semibold">
        This group assignment is already approved.
      </div>
    );
  }
  if (latestSubmission?.feedbacks && latestSubmission.feedbacks.length > 0) {
    return (
      <div className="p-6 text-gray-500">
        Feedback already given for this version.
        Please wait for new version submission.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 ml-6 mt-3">
      <div className="border-b pb-6 mb-6">
        <div className="font-bold text-xl mb-2">Student Work</div>
        <div className="mb-4 text-lg">
          <div className="font-semibold">Comment:</div>
          <div>{latestSubmission.comment || "No comment"}</div>
        </div>
        {deliverables.map((del) => {
          const submittedFiles = (latestSubmission.submissionFiles ?? []).filter(
            (sf: any) => sf.deliverableId === del.id
          );
          return (
            <div key={del.id} className="mb-4">
              <div className="font-semibold text-lg">{del.name}</div>
              <div className="flex flex-col gap-1 mt-1 text-lg">
                {del.allowedFileTypes?.map((t: any, idx: number) => (
                  <div key={idx}>
                    {t.type}
                    {submittedFiles.length > 0 &&
                      submittedFiles.map((sf: any) => {
                        const urls = Array.isArray(sf.fileUrl) ? sf.fileUrl : sf.fileUrl ? [sf.fileUrl] : [];
                        return urls
                          .filter((url: string) =>
                            url.toLowerCase().endsWith(
                              t.type === "PDF"
                                ? ".pdf"
                                : t.type === "Word Document"
                                  ? ".docx"
                                  : ""
                            )
                          )
                          .map((url: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded text-lg">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#326295] hover:underline truncate text-lg"
                                title={sf.name}
                              >
                                {sf.name}
                              </a>
                              {sf.id && (
                                <button
                                  className="text-blue-600 underline hover:underline truncate cursor-pointer"
                                  onClick={() => handleDownloadSubmission(sf.id, sf.name)}
                                  title="Download file"
                                >
                                  Download
                                </button>
                              )}
                            </span>
                          ));
                      })
                    }
                  </div>
                ))}
                {submittedFiles.length === 0 && (
                  <span className="text-gray-500">No files submitted</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div className="font-bold text-xl mb-2">Feedback</div>
        {role === "staff" && (!latestSubmission.feedbacks || latestSubmission.feedbacks.length === 0) && (
          <div className="text-gray-500 mb-4">Lecturer haven't give feedback</div>
        )}
        {role !== "staff" && (
          <>
            <div className="mb-4">
              <label htmlFor="feedbackComment" className="font-semibold mb-1 block text-lg">
                Comment
              </label>
              <textarea
                id="feedbackComment"
                className="w-full border border-gray-300 rounded-md p-3 text-lg"
                placeholder="Write your feedback here..."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            {deliverables.map((del) => {
              const groupNumber =
                detail?.assignmentDueDates?.[0]?.group?.codeNumber || "0";
              return (
                <div className="text-lg flex items-center gap-3 flex-wrap text-lg" key={del.id}>
                  <span className="font-bold">{del.name}</span>
                  <label className="text-blue-600 underline cursor-pointer">
                    {(files[del.id]?.length ?? 0) > 0 ? "Replace" : "Upload"}
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange(del.id)}
                      className="hidden"
                    />
                  </label>
                  {(files[del.id]?.length ?? 0) > 0 ? (
                    <>
                      {files[del.id].map((file, idx) => {
                        const mime = file.type;
                        const formattedName = changeFeedbackFileName({
                          username,
                          groupNumber: detail?.assignmentDueDates?.[0]?.group?.codeNumber || "0",
                          deliverableName: del.name,
                          version: latestSubmission?.version ?? 1,
                          mime,
                        });
                        return (
                          <span key={idx} className="text-sm break-all bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                            {formattedName}
                            <button
                              type="button"
                              onClick={() => removeFeedbackFile(del.id, idx)}
                              className="text-red-600 text-sm underline"
                            >
                              remove
                            </button>
                          </span>
                        );
                      })}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 text-lg">No file selected</span>
                  )}
                </div>
              );
            })}

            <div className="mt-4 flex gap-4 items-center text-lg">
              <div>
                <label className="font-semibold">Status:</label>
                <select
                  value={newStatus}
                  onChange={e => {
                    const v = e.target.value;
                    setNewStatus(v);
                    if (v === "APPROVED") {
                      setNewDueDate("");
                      setDueDateError(null);
                      return;
                    }

                    if (v === "APPROVED_WITH_FEEDBACK") {
                      const foundFromDetail = findAssignmentEndDate(detail);
                      const foundFromSubmission = findAssignmentEndDate(latestSubmission);
                      const maybeEnd = foundFromDetail ?? foundFromSubmission ?? null;
                      const auto = isoToBangkokInput(maybeEnd);
                      if (auto) {
                        setNewDueDate(auto);
                        validateNewDueDate(auto);
                      }
                    }
                  }}
                  className="ml-2 border rounded px-2 py-1"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="APPROVED_WITH_FEEDBACK">APPROVED WITH FEEDBACK</option>
                  <option value="REJECTED">NOT APPROVED</option>
                </select>
              </div>
              {newStatus !== "FINAL" && newStatus !== "APPROVED" && (
                <div>
                  <label className="font-semibold">Set new due date:</label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={e => {
                      const val = e.target.value;
                      setNewDueDate(val);
                      validateNewDueDate(val);
                    }}
                    className="ml-2 border rounded px-2"
                  />
                  {dueDateError && <div className="text-red-600 text-base">{dueDateError}</div>}
                </div>
              )}
            </div>

            {submitError && <div className="text-red-600 text-sm mt-2">{submitError}</div>}
            {submitSuccess && <div className="text-green-700 text-sm mt-2">{submitSuccess}</div>}

            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-3 bg-[#305071] text-white text-lg rounded-md shadow disabled:opacity-50"
                onClick={handleSubmitFeedback}
                disabled={submitting || !!dueDateError}
              >
                {submitting ? "Submitting…" : "Confirm Feedback"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}