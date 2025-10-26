"use client";

import React, { useMemo, useState } from "react";
import DeliverableFields from "@/components/deliverableField";
import { X } from "lucide-react";
import { Deliverable } from "@/components/deliverableField";
import { FileUpload } from "../uploadFile";
import { uploadAssignmentFileAPI } from "@/api/assignment/uploadAssignmentFile";

export type AssignmentPayload = {
  title: string;
  descriptionHtml: string | null;
  deliverables: Deliverable[];
  dueAt?: string;     // ISO
  endAt?: string;     // ISO
  scheduleAt?: string;// ISO
};

type AssignmentSubmitResult = {
  id: string;
  courseId: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentPayload) => Promise<AssignmentSubmitResult | void> | AssignmentSubmitResult | void;
  defaultValue?: Partial<AssignmentPayload>;
};

const newDeliverable = (): Deliverable => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  requiredTypes: [],
});

export default function AssignmentModal({
  open,
  onClose,
  onSubmit,
  defaultValue,
}: Props) {
  const [title, setTitle] = useState(defaultValue?.title ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(
    defaultValue?.descriptionHtml ?? ""
  );
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    defaultValue?.deliverables?.length ? defaultValue!.deliverables! : [newDeliverable()]
  );
  const [dueAt, setDueAt] = useState(defaultValue?.dueAt ?? "");
  const [endAt, setEndAt] = useState(defaultValue?.endAt ?? "");
  const [scheduleAt, setScheduleAt] = useState(defaultValue?.scheduleAt ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const canSubmit = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasValidDeliv =
      deliverables.length > 0 &&
      deliverables.every(
        (d) => d.name.trim() && d.requiredTypes.length > 0
      );
    const hasDates = dueAt && endAt; // scheduleAt optional

    const nowTs = Date.now();
    let datesValid = false;
    if (hasDates) {
      const dueTs = new Date(dueAt!).getTime();
      const endTs = new Date(endAt!).getTime();
      // both dates must be valid and not before now, and end must be >= due
      datesValid =
        !isNaN(dueTs) &&
        !isNaN(endTs) &&
        dueTs >= nowTs &&
        endTs >= nowTs &&
        endTs >= dueTs;
    }
    return hasTitle && hasValidDeliv && !!hasDates && !submitting;
  }, [title, descriptionHtml, deliverables, dueAt, endAt, submitting]);

  const patchDeliverable = (id: string, patch: Partial<Deliverable>) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  };

  const removeDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const addDeliverable = () => setDeliverables((prev) => [...prev, newDeliverable()]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const scheduleValue = scheduleAt && scheduleAt.trim()
        ? scheduleAt
        : new Date().toISOString();
      const descTrim = (descriptionHtml || "").trim();
      const basePayload: any = {
        title,
        descriptionHtml: descTrim, // may be "" (empty)
        deliverables,
        dueAt,
        endAt,
        scheduleAt: scheduleValue,
      };

      let assignment: AssignmentSubmitResult | void;
      try {
        assignment = await onSubmit(basePayload);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || String(err);
        // If server complains about description, retry sending null
        if (typeof msg === "string" && msg.toLowerCase().includes("description")) {
          basePayload.descriptionHtml = null;
          assignment = await onSubmit(basePayload);
        } else {
          throw err;
        }
      }

      if (selectedFiles.length > 0 && assignment?.id && assignment?.courseId) {
        for (const file of selectedFiles) {
          await uploadAssignmentFileAPI(assignment.courseId, assignment.id, file);
        }
      } else {
        console.log("No files to upload or missing assignment/courseId.");
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[min(980px,92vw)]">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200">
          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Create New Assignment</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* body */}
          <div className="max-h-[78vh] overflow-y-auto px-6 py-5 space-y-6">
            {/* Title */}
            <div>
              <label className="block font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter 4–5"
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            {/* Description (simple) */}
            <div>
              <label className="block font-medium mb-1">
                Description
              </label>
              <textarea
                value={descriptionHtml}
                onChange={(e) => setDescriptionHtml(e.target.value)}
                placeholder="Enter assignment description..."
                className="w-full min-h-[120px] rounded border border-gray-300 px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-[#326295]"
                rows={5}
              />
            </div>
            <FileUpload
              onFilesChange={setSelectedFiles}
              acceptedTypes={["image/*", "application/pdf", ".doc", ".docx", ".txt"]}
            />

            {/* Deliverables */}
            <div>
              <label className="block font-medium mb-3">
                Deliverable <span className="text-red-500">*</span>
              </label>

              <div className="space-y-4">
                {deliverables.map((d, idx) => (
                  <DeliverableFields
                    key={d.id}
                    value={d}
                    onChange={(patch) => patchDeliverable(d.id, patch)}
                    onRemove={() => removeDeliverable(d.id)}
                    showRemove={deliverables.length > 1}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addDeliverable}
                className="mt-3 px-4 py-2 text-sm font-medium bg-[#326295] text-white rounded shadow hover:bg-[#25446b] transition"
              >
                + Add deliverable
              </button>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-medium mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                {dueAt && new Date(dueAt).getTime() < Date.now() && (
                  <p className="text-md text-red-500 mt-1">Due date cannot be before today/time</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                {endAt && new Date(endAt).getTime() < Date.now() && (
                 <p className="text-md text-red-500 mt-1">End date cannot be before today/time</p>
                )}
                {dueAt && endAt && new Date(endAt).getTime() < new Date(dueAt).getTime() && (
                  <p className="text-md text-red-500 mt-1">End date must be after Due date</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">Schedule</label>
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-5 py-2 rounded-lg text-white shadow transition ${canSubmit ? "bg-[#326295] hover:opacity-90" : "bg-gray-300"
                }`}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
