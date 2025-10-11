"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import DeliverableFields, { Deliverable, FileType } from "@/components/deliverableField";
import { FileUpload } from "@/components/uploadFile";
import { getAssignmentByIdAPI } from "@/api/assignment/getAssignmentById";
import { uploadAssignmentFileAPI } from "@/api/assignment/uploadAssignmentFile";

type EditAssignmentModalProps = {
    open: boolean;
    assignmentId: string;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void> | void;
};

const toDeliverable = (d: any, idx: number): Deliverable => ({
    id: `edit-${idx}-${Math.random().toString(36).slice(2)}`,
    name: d.name,
    requiredTypes: Array.isArray(d.allowedFileTypes)
        ? d.allowedFileTypes.map((aft: any) => {
            // Map backend type to UI FileType
            if (aft.type === "PDF") return "PDF";
            if (aft.type === "Word Document") return "DOCX";
            if (aft.type === "Excel Spreadsheet") return "XLSX";
            if (aft.type === "PowerPoint") return "PPTX";
            if (aft.type === "ZIP Archive" || aft.type === "ZIP") return "ZIP";
            return aft.type.toUpperCase();
        })
        : [],
});

export default function EditAssignmentModal({
    open,
    assignmentId,
    onClose,
    onSubmit,
}: EditAssignmentModalProps) {
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [descriptionHtml, setDescriptionHtml] = useState("");
    const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
    const [dueAt, setDueAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [scheduleAt, setScheduleAt] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<any[]>([]);
    const [keepFileIds, setKeepFileIds] = useState<string[]>([]);

    useEffect(() => {
        if (!open || !assignmentId) return;
        setLoading(true);
        getAssignmentByIdAPI(assignmentId)
            .then((res) => {
                const a = res.assignment;
                setTitle(a.name ?? "");
                setDescriptionHtml(a.description ?? "");
                setDeliverables(
                    a.deliverables?.length
                        ? a.deliverables.map(toDeliverable)
                        : [{ id: "edit-0", name: "", requiredTypes: [] }]
                );
                setDueAt(a.dueDate ? a.dueDate.slice(0, 16) : "");
                setEndAt(a.endDate ? a.endDate.slice(0, 16) : "");
                setScheduleAt(a.schedule ? a.schedule.slice(0, 16) : "");
                setExistingFiles(a.assignmentFiles ?? []);
                setKeepFileIds((a.assignmentFiles ?? []).map((f: any) => f.id));
            })
            .catch(() => {
                setTitle("");
                setDescriptionHtml("");
                setDeliverables([{ id: "edit-0", name: "", requiredTypes: [] }]);
                setDueAt("");
                setEndAt("");
                setScheduleAt("");
                setExistingFiles([]);
                setKeepFileIds([]);
            })
            .finally(() => setLoading(false));
    }, [open, assignmentId]);

    const canSubmit = useMemo(() => {
        const hasTitle = title.trim().length > 0;
        const hasDesc = descriptionHtml.trim().length > 0;
        const hasValidDeliv =
            deliverables.length > 0 &&
            deliverables.every((d) => d.name.trim() && d.requiredTypes.length > 0);
        const hasDates = dueAt && endAt;
        return hasTitle && hasDesc && hasValidDeliv && !!hasDates && !submitting;
    }, [title, descriptionHtml, deliverables, dueAt, endAt, submitting]);

    const patchDeliverable = (id: string, patch: Partial<Deliverable>) => {
        setDeliverables((prev) =>
            prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
        );
    };

    const removeDeliverable = (id: string) => {
        setDeliverables((prev) => prev.filter((d) => d.id !== id));
    };

    const addDeliverable = () =>
        setDeliverables((prev) => [
            ...prev,
            { id: Math.random().toString(36).slice(2), name: "", requiredTypes: [] },
        ]);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            // Map keepUrls from existingFiles using keepFileIds
            const keepUrls = existingFiles
                .filter((f) => keepFileIds.includes(f.id))
                .map((f) => f.filepath);

            // Prepare deliverables with valid extensions
            const payload = {
                assignmentId,
                name: title,
                description: descriptionHtml,
                endDate: endAt,
                dueDate: dueAt,
                schedule: scheduleAt || null,
                deliverables: deliverables.map((d) => ({
                    name: d.name,
                    allowedFileTypes: Array.from(new Set(
                        d.requiredTypes.map((t) => {
                            const s = String(t).toLowerCase();
                            if (s === "pdf") return "pdf";
                            if (s === "word document" || s === "docx" || s === "doc") return "docx";
                            if (s === "excel spreadsheet" || s === "xlsx" || s === "xls") return "xlsx";
                            if (s === "powerpoint" || s === "pptx" || s === "ppt") return "pptx";
                            if (s === "zip archive" || s === "zip") return "zip";
                            return s;
                        })
                    )),
                })),
                keepUrls,
            };

            if (selectedFiles.length > 0) {
                await onSubmit({ ...payload, files: selectedFiles });
            } else {
                await onSubmit(payload);
            }
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
                aria-hidden
            />
            {/* modal */}
            <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[min(980px,92vw)]">
                <div className="rounded-2xl bg-white shadow-xl border border-gray-200">
                    {/* header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-xl font-semibold">Edit Assignment</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded hover:bg-gray-100"
                            aria-label="Close"
                            disabled={submitting}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* body */}
                    <div className="max-h-[78vh] overflow-y-auto px-6 py-5 space-y-6">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading...</div>
                        ) : (
                            <>
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

                                {/* Description */}
                                <div>
                                    <label className="block font-medium mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={descriptionHtml}
                                        onChange={(e) => setDescriptionHtml(e.target.value)}
                                        placeholder="Enter assignment description..."
                                        className="w-full min-h-[120px] rounded border border-gray-300 px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-[#326295]"
                                        rows={5}
                                    />
                                </div>

                                {/* Existing Assignment Files */}
                                <div>
                                    <label className="block font-medium mb-2">Existing Files</label>
                                    {existingFiles.length ? (
                                        <ul className="space-y-2">
                                            {existingFiles.map((f) => {
                                                const kept = keepFileIds.includes(f.id);
                                                return (
                                                    <li
                                                        key={f.id}
                                                        className="flex items-center justify-between gap-3 border rounded px-3 py-2"
                                                    >
                                                        <div className="truncate">
                                                            <span className="font-medium">{f.name}</span>
                                                            <span className="ml-2 text-xs text-gray-500 truncate">
                                                                {f.filepath}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setKeepFileIds((prev) =>
                                                                    kept
                                                                        ? prev.filter((id) => id !== f.id)
                                                                        : [...prev, f.id]
                                                                )
                                                            }
                                                            disabled={submitting}
                                                            className={`text-sm px-3 py-1 rounded border transition ${kept
                                                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                                }`}
                                                        >
                                                            {kept ? "Remove" : "Keep"}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="text-gray-400 text-sm">No existing files</div>
                                    )}
                                </div>

                                {/* File Upload */}
                                <FileUpload
                                    onFilesChange={setSelectedFiles}
                                    maxFiles={5}
                                    maxFileSize={10}
                                    acceptedTypes={["image/*", "application/pdf", ".doc", ".docx", ".txt"]}
                                    disabled={submitting}
                                />

                                {/* Deliverables */}
                                <div>
                                    <label className="block font-medium mb-3">
                                        Deliverable <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-4">
                                        {deliverables.map((d) => (
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
                                        className="mt-3 text-sm text-[#326295] hover:underline"
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
                            </>
                        )}
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
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}