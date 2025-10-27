"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Plus, Download, FileText, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getAllFileByCourseIdAPI } from "@/api/file/getAllFileByCourseId";
import { uploadCourseFileAPI } from "@/api/storage/uploadCourseFile";
import { File } from "@/types/api/file";
import { getUserRole } from "@/util/cookies";
import { isCanUpload } from "@/util/RoleHelper";
import { downloadCourseFileAPI } from "@/api/file/downloadCourseFile";
import { deleteCourseFileAPI } from "@/api/file/deleteCourseFile";
import { useToast } from "@/components/toast";
import ConfirmModal from "@/components/confirmModal";

function formatUploadAt(iso: string, locale: string = "en-GB") {
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

function FilePageContent() {
  const { showToast } = useToast();
  const role = getUserRole();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmState, setConfirmState] = React.useState<{
    open: boolean;
    file?: File.Files | null;
    loading?: boolean;
  }>({ open: false, file: null, loading: false });

  const [canUpload, setCanUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File.Files[]>([]);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // NEW: portal dropdown state
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const courseId = useSearchParams().get("courseId") || "";

  const closeMenu = () => {
    setOpenIdx(null);
    setMenuPos(null);
  };

  const openMenu = (btn: HTMLButtonElement, idx: number) => {
    const rect = btn.getBoundingClientRect();
    const MENU_WIDTH = 180; // adjust as needed
    const MENU_HEIGHT = 96;
    const GAP = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < MENU_HEIGHT + GAP;

    const x = Math.min(
      Math.max(rect.right - MENU_WIDTH, 8),
      window.innerWidth - MENU_WIDTH - 8 
    );
    const y = above ? rect.top - MENU_HEIGHT - GAP : rect.bottom + GAP;

    setOpenIdx(idx);
    setMenuPos({ x, y, above });
  };

  useEffect(() => {
    if (openIdx === null) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
      closeMenu();
    };
    const onScrollOrResize = () => closeMenu();

    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [openIdx]);

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
      showToast({ variant: "success", message: "Files uploaded successfully." });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      showToast({ variant: "error", message: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: File.Files) => {
    try {
      const res = await downloadCourseFileAPI(file.id);
      const url = (res as any).data?.url ?? (res as any).url; // support either helper shape
      if (url) {
        window.open(url, "_blank");
      } else {
        showToast({ variant: "error", message: "Download link not found." });
      }
      closeMenu();
    } catch (error: any) {
      closeMenu();
      if (error?.response?.status === 404) {
        showToast({ variant: "error", message: "File not found (404)." });
      } else {
        showToast({ variant: "error", message: "Failed to get download link." });
      }
    }
  };

  const handleDelete = (file: File.Files) => {
    setConfirmState({ open: true, file, loading: false });
  };

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
              <tr key={file.id ?? idx} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#326295] flex-shrink-0" />
                  <span
                    className="text-xl truncate max-w-[400px] cursor-pointer text-[#326295] hover:underline"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await downloadCourseFileAPI(file.id);
                        const url = (res as any).data?.url ?? (res as any).url;
                        if (url) {
                          window.open(url, "_blank");
                        } else {
                          showToast({ variant: "error", message: "Open link not found." });
                        }
                      } catch (error) {
                        alert("Failed to get open link.");
                      }
                    }}
                  >
                    {file.name}
                  </span>
                  <div className="ml-auto">
                    <button
                      ref={openIdx === idx ? buttonRef : null}
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget as HTMLButtonElement;
                        if (openIdx === idx) {
                          closeMenu();
                        } else {
                          buttonRef.current = btn;
                          openMenu(btn, idx);
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={openIdx === idx}
                      aria-controls={openIdx === idx ? `file-menu-${idx}` : undefined}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>

                <td className="text-xl py-3 px-4 text-gray-700">{formatUploadAt(file.uploadAt)}</td>
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
            className={`inline-flex items-center gap-3 rounded-full px-4 py-3 shadow-lg cursor-pointer
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

      {openIdx !== null && menuPos &&
        createPortal(
          <div
            id={`file-menu-${openIdx}`}
            ref={menuRef}
            role="menu"
            className="fixed z-[1000] min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-xl"
            style={{ left: menuPos.x, top: menuPos.y }}
          >
            <div className="py-1">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await downloadCourseFileAPI(files[openIdx].id);
                    const url = (res as any).data?.url ?? (res as any).url;
                    if (url) {
                      window.open(url, "_blank");
                    } else {
                      showToast({ variant: "error", message: "Open link not found." });
                    }
                  } catch (error) {
                    alert("Failed to get open link.");
                  }
                  closeMenu();
                }}
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                type="button"
              >
                <FileText className="w-4 h-4" />
                Open
              </button>

              {/* Download button */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleDownload(files[openIdx]);
                }}
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                type="button"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              {(role === "staff" || role === "lecturer" || role === "SUPER_ADMIN") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                    setConfirmState({ open: true, file: files[openIdx], loading: false });
                  }}
                  role="menuitem"
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-red-600 hover:bg-red-50`}
                  disabled={confirmState.loading || deletingFileId === files[openIdx].id}
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>,
          document.body
        )
      }

      <ConfirmModal
        open={confirmState.open}
        title="Delete file"
        message={`Are you sure you want to delete "${confirmState.file?.name ?? "this file"}"? This action cannot be undone.`}
        loading={confirmState.loading}
        onCancel={() => setConfirmState({ open: false, file: null, loading: false })}
        onConfirm={async () => {
          if (!confirmState.file) return setConfirmState({ open: false, file: null, loading: false });
          setConfirmState((s) => ({ ...s, loading: true }));
          try {
            setDeletingFileId(confirmState.file.id);
            const res = await deleteCourseFileAPI(confirmState.file.id);
            setFiles((prev) => prev.filter((f) => f.id !== confirmState.file!.id));
            showToast({ variant: "success", message: (res as any).message || "File deleted." });
          } catch (error: any) {
            if (error?.response?.status === 404) {
              showToast({ variant: "error", message: "File not found (404). It may have been already deleted." });
            } else if (error?.response?.status === 403) {
              showToast({ variant: "error", message: "You do not have permission to delete this file." });
            } else {
              showToast({ variant: "error", message: "Failed to delete the file." });
            }
          } finally {
            setDeletingFileId(null);
            setConfirmState({ open: false, file: null, loading: false });
            closeMenu();
          }
        }}
      />
    </main>
  );
}

export default function FilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-6">Loading files...</div>}>
      <FilePageContent />
    </Suspense>
  );
}
