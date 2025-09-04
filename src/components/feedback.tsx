"use client";

import React, { useMemo, useRef, useState } from "react";
import { Paperclip, MessageSquareMore, Upload, ChevronDown } from "lucide-react";

type FeedbackStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";

export type FeedbackPayload = {
  comment?: string;
  status: FeedbackStatus | "";
  files: File[];
};

type WorkFile = {
  name: string;
  href: string;
};

type FeedbackProps = {
  /** Top-left greeting line, e.g., "Hello Ajarn" */
  greeting?: string;
  /** The submitted work file to show under Work */
  workFile?: WorkFile;
  /** Initial status (optional) */
  initialStatus?: FeedbackStatus | "";
  /** Initial comment (optional) */
  initialComment?: string;
  /** Called when user clicks Submit */
  onSubmit?: (data: FeedbackPayload) => Promise<void> | void;
  /** Disable all inputs when submitting */
  submitting?: boolean;
  /** ClassName passthrough for outer wrapper */
  className?: string;
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NEEDS_REVISION: "Needs Revision",
};

export default function Feedback({
  workFile = { name: "G0001_A01_V01.pdf", href: "#" },
  initialStatus = "",
  initialComment = "",
  onSubmit,
  submitting = false,
  className = "",
}: FeedbackProps) {
  const [showComment, setShowComment] = useState<boolean>(!!initialComment);
  const [comment, setComment] = useState(initialComment);
  const [status, setStatus] = useState<FeedbackStatus | "">(initialStatus);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => {
    // Allow submit when a status is chosen; comment/files optional
    return !!status && !submitting;
  }, [status, submitting]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const payload: FeedbackPayload = { comment: comment?.trim() || undefined, status, files };
    await onSubmit?.(payload);
  };

  return (
    <div
      className={`rounded-md border border-gray-200 bg-white shadow-sm ${className}`}
      role="region"
      aria-labelledby="feedback-title"
    >
      {/* Work */}
      <section className="p-5 sm:p-6 border-b" aria-labelledby="work-title">
        <h2 id="work-title" className="text-lg font-semibold text-gray-900">
          Work
        </h2>


        <div className="mt-3">
          <a
            href={workFile.href}
            className="inline-flex items-center gap-2 text-[#326295] hover:underline"
          >
            <Paperclip className="h-4 w-4" />
            <span className="truncate">{workFile.name}</span>
          </a>
        </div>
      </section>

      {/* Feedback */}
      <section className="p-5 sm:p-6" aria-labelledby="feedback-title">
        <h2 id="feedback-title" className="text-lg font-semibold text-gray-900">
          Feedback
        </h2>

        {/* Actions row */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {/* Comment toggle */}
          <button
            type="button"
            onClick={() => setShowComment((v) => !v)}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-black"
          >
            <MessageSquareMore className="h-4 w-4" />
            <span>Comment</span>
          </button>

          {/* Upload */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-black"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              multiple
            />
          </div>
        </div>

        {/* Comment box */}
        {showComment && (
          <div className="mt-4">
            <label htmlFor="comment" className="sr-only">
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment…"
              className="w-full min-h-[110px] resize-y rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
            />
          </div>
        )}

        {/* Uploaded file chips */}
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
            {files.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700"
              >
                {f.name}
              </span>
            ))}
          </div>
        )}

        {/* Status + Submit */}
        <div className="mt-6 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <label htmlFor="status" className="text-gray-800">
              Status :
            </label>

            <div className="relative">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as FeedbackStatus | "")}
                disabled={submitting}
                className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-9 text-gray-900 focus:border-black focus:outline-none"
              >
                <option value="">Select</option>
                {(
                  Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]
                ).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_LABEL[key]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`rounded-md px-5 py-2 text-white transition ${
              canSubmit
                ? "bg-[#305071] hover:bg-[#25425f]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ----------------------------- Usage example ------------------------------
<Feedback
  greeting="Hello Ajarn"
  workFile={{ name: "G0001_A01_V01.pdf", href: "/files/G0001_A01_V01.pdf" }}
  initialStatus=""
  onSubmit={async (data) => {
    // send to API
    // const form = new FormData();
    // data.files.forEach((f) => form.append("files", f));
    // form.append("status", data.status);
    // if (data.comment) form.append("comment", data.comment);
    // await fetch("/api/feedback", { method: "POST", body: form });
    console.log("submit", data);
  }}
/>
--------------------------------------------------------------------------- */
