"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Announcement } from "@/types/api/announcement";
import { FileUpload } from "@/components/uploadFile";

type Props = {
  open: boolean;
  onClose: () => void;
  announcement: Announcement.Announcements;
  onSubmit: (data: {
    name: string;
    description: string;
    schedule?: string | null;
    keepUrls?: string[];
    files?: File[];
  }) => Promise<void>;
};

export default function EditAnnouncementModal({
  open,
  onClose,
  announcement,
  onSubmit,
}: Props) {
  const [name, setName] = useState(announcement.name);
  const [description, setDescription] = useState(announcement.description);
  const [scheduleAt, setScheduleAt] = useState(
    announcement.schedule && announcement.schedule !== "1970-01-01T00:00:00.000Z"
      ? announcement.schedule.slice(0, 16)
      : ""
  );
  const [isScheduled, setIsScheduled] = useState(
    !!(
      announcement.schedule &&
      announcement.schedule !== "1970-01-01T00:00:00.000Z"
    )
  );
  const [keepUrls, setKeepUrls] = useState<string[]>(
    announcement.files?.map((f) => f.filepath) ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(announcement.name);
    setDescription(announcement.description);
    setIsScheduled(
      !!(
        announcement.schedule &&
        announcement.schedule !== "1970-01-01T00:00:00.000Z"
      )
    );
    setScheduleAt(
      announcement.schedule &&
      announcement.schedule !== "1970-01-01T00:00:00.000Z"
        ? announcement.schedule.slice(0, 16)
        : ""
    );
    setKeepUrls(announcement.files?.map((f) => f.filepath) ?? []);
    setNewFiles([]);
  }, [announcement]);

  if (!open) return null;

  const canSubmit =
    name.trim() &&
    description.trim() &&
    (!isScheduled || scheduleAt) &&
    !submitting;

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const scheduleISO =
        isScheduled && scheduleAt ? new Date(scheduleAt).toISOString() : null;
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        schedule: scheduleISO,
        keepUrls,
        files: newFiles,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to save announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[min(900px,92vw)] font-dbheavent">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200 flex flex-col max-h-[90vh]">
          {/* ===== Header ===== */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Edit Announcement</h2>
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

          {/* ===== Body ===== */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#326295]"
                disabled={submitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                rows={6}
                disabled={submitting}
                required
              />
            </div>

            {/* Existing Files */}
            <div>
              <label className="block font-medium mb-2">Existing Files</label>
              {announcement.files?.length ? (
                <ul className="space-y-2">
                  {announcement.files.map((f) => {
                    const kept = keepUrls.includes(f.filepath);
                    return (
                      <li
                        key={f.filepath}
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
                            setKeepUrls((prev) =>
                              kept
                                ? prev.filter((u) => u !== f.filepath)
                                : [...prev, f.filepath]
                            )
                          }
                          disabled={submitting}
                          className={`text-sm px-3 py-1 rounded border transition ${
                            kept
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

            {/* Add New Files */}
            <div>
              <label className="block font-medium mb-2">Add New Files</label>
              <FileUpload
                onFilesChange={(files) => setNewFiles(files)}
                maxFiles={10}
                maxFileSize={20}
                disabled={submitting}
              />
            </div>

            {/* Scheduling */}
            <div>
              <label className="block font-medium mb-3">Post Timing</label>
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postTimingEdit"
                    checked={!isScheduled}
                    onChange={() => setIsScheduled(false)}
                    className="mr-2"
                    disabled={submitting}
                  />
                  Post Immediately
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postTimingEdit"
                    checked={isScheduled}
                    onChange={() => setIsScheduled(true)}
                    className="mr-2"
                    disabled={submitting}
                  />
                  Schedule for Later
                </label>
              </div>

              {isScheduled && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-medium mb-1">
                        Select Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select when you want this announcement to post
                      </p>
                    </div>
                    <div className="hidden lg:block" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== Footer ===== */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSubmit}
              className="px-6 py-2 rounded bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
