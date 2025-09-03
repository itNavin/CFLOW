"use client";
import React, { useRef } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAllFileByCourseIdAPI } from "@/api/file/getAllFileByCourseId";
import { createFileByCourseIdAPI } from "@/api/file/createFileByCourseId";
import { File } from "@/types/api/file";
import { getUserRole } from "@/util/cookies";
import { userRole } from "@/types/api/userRole";

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

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(role)
      .then((r) => {
        if (!cancelled) setUserRole((role ?? null) as userRole.UserRole | null);
      })
      .finally(() => {
        if (!cancelled) setRoleReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canUpload =
    role === "ADMIN" || role === "ADVISOR" || role === "SUPER_ADMIN";

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

  useEffect(() => {
    fetchFiles();
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
                  <span className="text-yellow-500">📁</span>
                  <span className="text-xl truncate max-w-[400px]">
                    {file.name}
                  </span>
                  <MoreHorizontal className="ml-auto w-4 h-4 text-gray-500 cursor-pointer" />
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

      {/* File Upload Input (hidden) */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Upload Button */}
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
    </main>
  );
}
