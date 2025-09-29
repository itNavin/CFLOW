"use client";
import React, { useRef, useState, useEffect } from "react";
import { MoreHorizontal, Plus, Download, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAllFileByCourseIdAPI } from "@/api/file/getAllFileByCourseId";
import { uploadCourseFileAPI } from "@/api/storage/uploadCourseFile";
import { File } from "@/types/api/file";
import { getUserRole } from "@/util/cookies";
import { isCanUpload } from "@/util/RoleHelper";

export function formatUploadAt(
  iso: string,
  locale: string = "en-GB" // change to "th-TH" for Thai
) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  });
}

export default function FilePage() {
  const role = getUserRole();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const courseId = useSearchParams().get("courseId") || "";
  const [files, setFiles] = useState<File.Files[]>([]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const fetchFiles = async () => {
    try {
      if (!courseId) return;
      const res = await getAllFileByCourseIdAPI(courseId);
      const list = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
      setFiles(list);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    if (!courseId) {
      console.error("Missing courseId");
      return;
    }

    try {
      setUploading(true);
      await uploadCourseFileAPI(courseId, Array.from(selectedFiles));
      await fetchFiles();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (file: File.Files) => {
    window.open(file.filepath, "_blank");
    setOpenDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    fetchFiles();
    setCanUpload(isCanUpload());
  }, [courseId]);

  return (
    <main className="min-h-screen bg-white p-6 pb-28 font-dbheavent">
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full text-base">
          <thead>
            <tr className="text-left text-gray-600 border-b border-gray-300">
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Modified</th>
              <th className="py-3 px-4 font-semibold">Modified By</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={file.id ?? idx}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-xl truncate max-w-[400px]">{file.name}</span>

                  {/* Wrap the button + menu so outside-click works */}
                  <div className="ml-auto relative dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === idx ? null : idx);
                      }}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      type="button"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>

                    {openDropdown === idx && (
                      <div
                        className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px]"
                        style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)", transform: "translateY(2px)" }}
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            type="button"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>

                          {(role === "ADMIN" || role === "ADVISOR" || role === "SUPER_ADMIN") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Delete file:", file.name);
                                setOpenDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              type="button"
                            >
                              <span className="w-4 h-4">🗑️</span>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                <td className="text-xl py-3 px-4 text-gray-700">
                  {formatUploadAt(file.uploadAt)}
                </td>
                <td className="text-xl py-3 px-4 text-gray-700">
                  {file.createdBy.name} {file.createdBy.surname}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canUpload && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className={`inline-flex items-center gap-3 rounded-full px-4 py-3 shadow-lg
              bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-lg font-medium
              hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
              active:scale-[0.98] transition ${uploading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <Plus className="h-6 w-6" />
            <span>{uploading ? "Uploading..." : "Add New Files"}</span>
          </button>
        </div>
      )}

      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </main>
  );
}
