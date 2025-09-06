"use client";
import React, { useRef } from "react";
import { MoreHorizontal, Plus, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAllFileByCourseIdAPI } from "@/api/file/getAllFileByCourseId";
import { createFileByCourseIdAPI } from "@/api/file/createFileByCourseId";
import { File } from "@/types/api/file";
import { getUserRole } from "@/util/cookies";
import { userRole } from "@/types/api/userRole";
import { isCanUpload } from "@/util/RoleHelper";

export function formatUploadAt(
  iso: string,
  locale: string = "en-GB" // change to "th-TH" for Thai
) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // fallback if bad input

  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok", // convert from Z (UTC) → Bangkok (UTC+7)
  });
}
export type CreateFilePayload = {
  name: string;
  filepath: string;
  uploadById: number;
};

export default function FilePage() {
  const role = getUserRole();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userRole, setUserRole] = useState<userRole.UserRole | null>(null);
  const [roleReady, setRoleReady] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [canUpload, setCanUpload] = useState(false);


  
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    const id = Number(courseId);
    console.log("Selected files:", selectedFiles);

    try {
      const created = await Promise.all(
        Array.from(selectedFiles || []).map(async (f) => {
          const res = await createFileByCourseIdAPI(id);
          return res.data; // ApiFile.File
        })
      );
    } catch (error) {
    }
  };

  const courseId = useSearchParams().get("courseId") || "";
  const [files, setFiles] = useState<File.File[]>([]);
  console.log("files:", files);

  const fetchFiles = async () => {
    try {
      if (!courseId) return;

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        return;
      }

      const response = await getAllFileByCourseIdAPI(id);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleDownload = (file: File.File) => {
    alert(`Download clicked for: ${file.name}`);
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if we're not clicking on a dropdown button
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
                key={idx}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-xl truncate max-w-[400px]">
                    {file.name}
                  </span>
                  <div className="ml-auto relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Clicked dropdown for file ${idx}, current state:`, openDropdown);
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
                        style={{
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(2px)'
                        }}
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
        <div className="flex justify-center mt-6">
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center gap-3 rounded-lg px-6 py-4 shadow-lg
                       bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-lg font-medium
                       hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                       active:scale-[0.98] transition"
          >
            <Plus className="h-6 w-6" />
            <span>Add New Files</span>
          </button>
        </div>
      )}

      {/* File Upload Input (hidden) */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Upload Button */}
      {canUpload && (
        <button
          onClick={handleUploadClick}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                   bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                   hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                   active:scale-[0.98] transition"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add New Files</span>
        </button>
      )}
    </main>
  );
}
