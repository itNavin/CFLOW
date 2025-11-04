"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
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
    const [originalDueIso, setOriginalDueIso] = useState<string | null>(null);
    const [originalEndIso, setOriginalEndIso] = useState<string | null>(null);
    const [originalScheduleIso, setOriginalScheduleIso] = useState<string | null>(null);
    const [dueChanged, setDueChanged] = useState(false);
    const [endChanged, setEndChanged] = useState(false);
    const [scheduleChanged, setScheduleChanged] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<any[]>([]);
    const [keepFileIds, setKeepFileIds] = useState<string[]>([]);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const isoToBangkokInput = (iso?: string | null) => {
        if (!iso) return "";
        const d = new Date(iso);
        const thMs = d.getTime() + 7 * 3600 * 1000; // shift UTC -> Bangkok
        const t = new Date(thMs);
        return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}T${pad(t.getHours())}:${pad(t.getMinutes())}`;
    };
    const bangkokInputToIso = (input?: string) => {
        if (!input) return null;
        const [date, time] = input.split("T");
        if (!date || !time) return null;
        const [y, m, d] = date.split("-").map(Number);
        const [hh, mm] = time.split(":").map(Number);
        // Treat input as Bangkok local -> compute UTC ms by subtracting +7h
        const utcMs = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0) - 7 * 3600 * 1000;
        return new Date(utcMs).toISOString();
    };

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
                setDueAt(isoToBangkokInput(a.dueDate ?? null));
                setEndAt(isoToBangkokInput(a.endDate ?? null));
                setScheduleAt(isoToBangkokInput(a.schedule ?? null));
                setOriginalDueIso(a.dueDate ?? null);
                setOriginalEndIso(a.endDate ?? null);
                setOriginalScheduleIso(a.schedule ?? null);
                setDueChanged(false);
                setEndChanged(false);
                setScheduleChanged(false);
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
        const hasValidDeliv =
            deliverables.length > 0 &&
            deliverables.every((d) => d.name.trim() && d.requiredTypes.length > 0);
        const dueIso = bangkokInputToIso(dueAt);
        const endIso = bangkokInputToIso(endAt);
        const hasDates = !!dueIso && !!endIso;
        let datesValid = false;
        if (hasDates) {
            const dueTs = dueIso ? new Date(dueIso).getTime() : NaN;
            const endTs = endIso ? new Date(endIso).getTime() : NaN;
            const nowTs = Date.now();
            datesValid =
                !isNaN(dueTs) &&
                !isNaN(endTs) &&
                dueTs >= nowTs &&
                endTs >= nowTs &&
                endTs >= dueTs;
        }
        return hasTitle && hasValidDeliv && !!hasDates && !submitting;
    }, [title, deliverables, dueAt, endAt, submitting]);

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
            const keepUrls = existingFiles
                .filter((f) => keepFileIds.includes(f.id))
                .map((f) => f.filepath);
            const EXTENSION_TO_MIME: Record<string, string> = {
                pdf: "application/pdf",
                docx: "application/docx",
                xlsx: "application/xlsx",
                pptx: "application/pptx",
                zip: "application/zip",
                txt: "text/txt",
                csv: "text/csv",
                png: "image/png",
                jpg: "image/jpg",
                jpeg: "image/jpeg",
            };
            const payload = {
                assignmentId,
                name: title,
                description: (descriptionHtml ?? "").trim() === "" ? null : (descriptionHtml ?? "").trim(),
                endDate: endChanged ? bangkokInputToIso(endAt) : originalEndIso,
                dueDate: dueChanged ? bangkokInputToIso(dueAt) : originalDueIso,
                schedule: scheduleChanged ? bangkokInputToIso(scheduleAt) : originalScheduleIso,
                deliverables: deliverables.map((d) => ({
                    name: d.name,
                    allowedFileTypes: Array.from(new Set(
                        d.requiredTypes
                            .map((t) => {
                                switch (t) {
                                    case "PDF": return EXTENSION_TO_MIME["pdf"];
                                    case "DOCX": return EXTENSION_TO_MIME["docx"];
                                    case "XLSX": return EXTENSION_TO_MIME["xlsx"];
                                    case "PPTX": return EXTENSION_TO_MIME["pptx"];
                                    case "ZIP": return EXTENSION_TO_MIME["zip"];
                                    default: return String(t).toLowerCase();
                                }
                            })
                            .filter((mime) => Object.values(EXTENSION_TO_MIME).includes(mime))
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
                                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium rounded-full shadow
                  bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white
                  hover:from-[#28517c] hover:to-[#071320]
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                  active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span className="hidden sm:inline text-base">Add deliverable</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block font-medium mb-1">
                                            Due Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={dueAt}
                                            onChange={(e) => { setDueAt(e.target.value); setDueChanged(true); }}
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                        {dueAt && new Date(dueAt).getTime() < Date.now() && (
                                            <p className="text-md text-red-500 mt-1">Due date cannot be before now</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-medium mb-1">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={endAt}
                                            onChange={(e) => { setEndAt(e.target.value); setEndChanged(true); }}
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                        {endAt && new Date(endAt).getTime() < Date.now() && (
                                            <p className="text-md text-red-500 mt-1">End date cannot be before now</p>
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
                                            onChange={(e) => { setScheduleAt(e.target.value); setScheduleChanged(true); }}
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