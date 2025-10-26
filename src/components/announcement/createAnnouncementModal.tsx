"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { createAnnouncementByCourseIdAPI } from "@/api/announcement/createAnnouncementByCourseId";
import { FileUpload } from "@/components/uploadFile";
import { uploadAnnouncementFileAPI } from "@/api/storage/uploadAnnouncementFile";

type Props = {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSubmit?: () => Promise<void>;
};

export default function CreateAnnouncementModal({ open, onClose, courseId, onSubmit }: Props) {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");

  if (!open) return null;

  const handleFilesChange = (files: File[]) => setSelectedFiles(files);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const scheduleDate = isScheduled && scheduleAt ? new Date(scheduleAt).toISOString() : null;
      const descToSend = (description || "").trim();
      let res;
      try {
        res = await createAnnouncementByCourseIdAPI(
          courseId,
          title.trim(),
          descToSend,
          scheduleDate
        );
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? "";
        if (typeof msg === "string" && msg.toLowerCase().includes("description")) {
          try {
            res = await createAnnouncementByCourseIdAPI(
              courseId,
              title.trim(),
              null as any,
              scheduleDate
            );
          } catch (err2: any) {
            throw err2;
          }
        } else {
          throw err;
        }
      }

      const announcementId = res.data?.announcement?.id;
      if (!announcementId) throw new Error("Missing announcementId");
      // const announcementId =
      //   res?.data?.announcement?.id;

      // if (!announcementId) {
      //   // show server response to help debugging instead of throwing generic error
      //   const payload = res?.data ? JSON.stringify(res.data, null, 2) : "no response body";
      //   setError(`Missing announcementId in server response:\n${payload}`);
      //   setIsSubmitting(false);
      //   return;
      // }

      if (selectedFiles.length > 0) {
        await uploadAnnouncementFileAPI(courseId, announcementId, selectedFiles);
      }
      window.location.reload();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = title.trim() && courseId && (!isScheduled || scheduleAt) && !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[min(900px,92vw)] font-dbheavent">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Create New Announcement</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100"
              aria-label="Close"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
          >
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Enter announcement description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Attach Files (Optional)</label>
              <FileUpload
                onFilesChange={handleFilesChange}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block font-medium mb-3">Post Timing</label>
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postTiming"
                    checked={!isScheduled}
                    onChange={() => setIsScheduled(false)}
                    className="mr-2"
                  />
                  Post Immediately
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postTiming"
                    checked={isScheduled}
                    onChange={() => setIsScheduled(true)}
                    className="mr-2"
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
          </form>
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 rounded bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting
                ? "Creating..."
                : isScheduled
                ? "Schedule"
                : "Post Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
