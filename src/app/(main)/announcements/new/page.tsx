"use client";

import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAnnouncementByCourseIdAPI } from "@/api/announcement/createAnnouncementByCourseId";
import { FileUpload } from "@/components/uploadFile";
import { getUserId } from "@/util/cookies";
import { uploadCourseFile } from "@/types/api/storage";
import { uploadCourseFileAPI } from "@/api/storage/uploadCourseFile";
import { uploadAnnouncementFileAPI } from "@/api/storage/uploadAnnouncementFile";

export default function NewAnnouncement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("09:00"); // Add time state
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScheduled, setIsScheduled] = useState(false); // Add scheduling toggle
  const [userId, setUserId] = useState<string>("1");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("courseId") || "";
    setCourseId(id);
    console.log("CourseId for new announcement:", id);
  }, [searchParams]);

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const getScheduledDateTime = (): Date => {
    if (!date) return new Date();

    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    return scheduledDate;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      if (!courseId) {
        throw new Error("Invalid course ID");
      }

      const scheduleDate = isScheduled
        ? getScheduledDateTime().toISOString()
        : null;

      const res = await createAnnouncementByCourseIdAPI(
        courseId,
        title.trim(),
        description.trim(),
        scheduleDate,
      );
      const announcementId =
        res.data.announcement.id ??
        null;

      const isUuid = (v: unknown) =>
        typeof v === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

      if (!isUuid(announcementId)) {
        throw new Error("Announcement created, but announcementId is missing or not a UUID.");
      }

      let uploadedFiles: uploadCourseFile.uploadCourseFileResponse[] = [];
      if (selectedFiles.length > 0) {
        try {
          uploadedFiles = await uploadAnnouncementFileAPI(
            courseId,
            announcementId,
            selectedFiles
          );

          console.log("Uploaded files response:", uploadedFiles);

          uploadedFiles.forEach((file, index) => {
            console.log(`File ${index}:`, file);
          });

        } catch (fileUploadError: any) {
          console.error("File upload failed:", fileUploadError);

          if (fileUploadError?.response?.data?.error?.includes('ADVISOR and ADMIN only')) {
            setError("You don't have permission to upload files. Only ADVISOR and ADMIN can upload files.");
          } else {
            setError("Announcement created but file upload failed: " + (fileUploadError?.response?.data?.error || fileUploadError?.message));
          }

        }
      }

      console.log("Announcement created successfully!");
      console.log("Scheduled for:", scheduleDate);
      console.log("Files attached:", uploadedFiles.length);

      router.push(`/announcements?courseId=${courseId}`);

    } catch (err: any) {
      console.error("Error creating announcement:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create announcement"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = title.trim().length > 0 &&
    description.trim().length > 0 &&
    courseId &&
    (!isScheduled || (date && time)) &&
    !isSubmitting;

  return (
    <div className="flex min-h-screen font-dbheavent">
      <div className="flex-1 p-6 bg-white">
        <div className="text-xl font-semibold mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          Create New Announcement
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full min-h-[150px] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295] resize-vertical"
              placeholder="Enter announcement description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
              rows={6}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Attach Files (Optional)
            </label>
            <FileUpload
              onFilesChange={handleFilesChange}
              maxFiles={5}
              maxFileSize={10}
              disabled={isSubmitting}
              acceptedTypes={[
                "application/pdf",
                "text/plain",
                "text/csv",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "image/png",
                "image/jpeg",
                "image/webp",
                "text/markdown",
                "application/json",
                "application/zip"
              ]}
            />
          </div>

          <div>
            <label className="block font-medium mb-3">
              Post Timing
            </label>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="postTiming"
                    checked={!isScheduled}
                    onChange={() => setIsScheduled(false)}
                    className="mr-2"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  Schedule for Later
                </label>
              </div>

              {isScheduled && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-medium mb-2">
                        Select Date <span className="text-red-500">*</span>
                      </label>
                      <DayPicker
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="border rounded shadow bg-white"
                        showOutsideDays
                        weekStartsOn={0}
                        disabled={[
                          { before: new Date() }, 
                          ...(isSubmitting ? [{ after: new Date('2099-12-31') }] : [])
                        ]}
                        fromDate={new Date()}
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">
                        Select Time <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295] bg-white"
                            disabled={isSubmitting}
                          >
                            {timeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setTime("09:00")}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                            disabled={isSubmitting}
                          >
                            9:00 AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setTime("12:00")}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                            disabled={isSubmitting}
                          >
                            12:00 PM
                          </button>
                          <button
                            type="button"
                            onClick={() => setTime("15:00")}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                            disabled={isSubmitting}
                          >
                            3:00 PM
                          </button>
                          <button
                            type="button"
                            onClick={() => setTime("18:00")}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                            disabled={isSubmitting}
                          >
                            6:00 PM
                          </button>
                        </div>

                        {date && time && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <strong>Scheduled for:</strong>{" "}
                            {getScheduledDateTime().toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-[#326295] text-white px-6 py-2 rounded shadow hover:bg-[#28517c] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canSubmit}
            >
              {isSubmitting
                ? "Creating..."
                : isScheduled
                  ? "Schedule Announcement"
                  : "Post Announcement"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}