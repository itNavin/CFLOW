"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { getAllAnnouncementByCourseIdAPI } from "@/api/announcement/getAllAnnouncementByCourseId";
import { Announcement } from "@/types/api/announcement";
import { useSearchParams } from "next/navigation";
import { file } from "@/types/api/announcement";
import { isCanUpload } from "@/util/RoleHelper";
import { downloadCourseFileAPI } from "@/api/file/downloadCourseFile";
import EditAnnouncementModal from "@/components/announcement/editAnnouncementModal";
import { updateAnnouncementAPI } from "@/api/announcement/updateAnnouncement";
import { deleteAnnouncementAPI } from "@/api/announcement/deleteAnnouncement";
import CreateAnnouncementModal from "@/components/announcement/createAnnouncementModal";

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

function AnnouncementContent() {
  const [announcements, setAnnouncements] = useState<Announcement.Announcements[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const courseId = useSearchParams().get("courseId") || "";
  const [canUpload, setCanUpload] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement.Announcements | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Replace with your actual role logic
    setRole(localStorage.getItem("role"));
  }, []);

  const fetchAnnouncements = async () => {
    try {
      if (!courseId) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getAllAnnouncementByCourseIdAPI(courseId);

      const sortedAnnouncements = (response.data.announcements || []).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setAnnouncements(sortedAnnouncements);
    } catch (e) {
      console.error("Error fetching announcements:", e);
    }
  };

  const handleDownload = async (file: file, announcementAuthor: string) => {
    try {
      const res = await downloadCourseFileAPI(file.id);
      const url = res.data.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        alert("Download link not found.");
      }
      setOpenDropdown(null);
    } catch (error: any) {
      setOpenDropdown(null);
      if (error.response && error.response.status === 404) {
        alert("File not found (404).");
      } else {
        alert("Failed to get download link.");
      }
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncementAPI(announcementId);
      await fetchAnnouncements();
    } catch (e) {
      alert("Failed to delete announcement.");
      console.error(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);

    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    fetchAnnouncements();
    setCanUpload(isCanUpload());
  }, [courseId]);

  // Filter announcements for students by schedule
  const filteredAnnouncements = role === "student"
    ? announcements.filter(a => {
      if (!a.schedule || a.schedule === "1970-01-01T00:00:00.000Z") return true;
      return new Date(a.schedule) <= new Date();
    })
    : announcements;

  return (
    <main className="min-h-screen p-6 pb-28 font-dbheavent space-y-8">
      {filteredAnnouncements.map((data) => {
        // For non-student roles, show Due Date if now is before schedule
        const showDueDate =
          role !== "student" &&
          data.schedule &&
          data.schedule !== "1970-01-01T00:00:00.000Z" &&
          new Date(data.schedule) > new Date();

        return (
          <div
            key={data.id}
            className="bg-white rounded-md shadow p-6 space-y-4 border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-semibold justify-between">
                  {data.name}
                </div>
                <div className="text-base text-gray-700 mb-1">
                  Created by: <span >{data.createdBy?.name || "Unknown"}</span>
                </div>
                <div className="text-base text-gray-500">
                  {showDueDate
                    ? <span className="font-bold">{`Post Schedule: ${formatUploadAt(data.schedule ?? "")}`}</span>
                    : <span>{formatUploadAt(data.createdAt ?? "")}</span>}
                </div>
              </div>
              {canUpload && (
                <div>
                  <button
                    className="inline-flex items-center justify-center rounded-md border bg-white p-3 text-gray-600 hover:bg-gray-50 mr-2"
                    onClick={() => {
                      setSelectedAnnouncement(data);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-6" />
                  </button>
                  <button
                    title="Delete"
                    className="inline-flex items-center justify-center rounded-md border bg-white p-3 text-xl text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteAnnouncement(data.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xl text-gray-800 leading-relaxed">
              {data.description}
            </p>

            <div className="space-y-3">
              {data.files.map((file, fileIndex) => {
                const dropdownId = `${data.id}-${fileIndex}`;

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between border border-gray-300 px-4 py-3 rounded-md text-base text-black bg-white max-w-md"
                  >
                    <div className="flex items-center gap-3 truncate w-[85%]">
                      <FileText className="w-5 h-5 text-[#326295] flex-shrink-0" />
                      <span 
                      className="truncate text-[#326295] cursor-pointer hover:underline" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await downloadCourseFileAPI(file.id);
                          const url = res.data.url;
                          if (url) {
                            window.open(url, "_blank"); // Open in new tab
                          } else {
                            alert("Open link not found.");
                          }
                        } catch (error) {
                          alert("Failed to get open link.");
                        }
                      }}>
                        {file.name || file.filepath}
                      </span>
                    </div>

                    <div className="relative dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
                        }}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                        type="button"
                      >
                        <MoreHorizontal className="w-5 h-5 text-black" />
                      </button>

                      {openDropdown === dropdownId && (
                        <div
                          className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px]"
                          style={{
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(2px)'
                          }}
                        >
                          <div className="py-1">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const res = await downloadCourseFileAPI(file.id);
                                  const url = res.data.url;
                                  if (url) {
                                    window.open(url, "_blank"); // Open in new tab
                                  } else {
                                    alert("Open link not found.");
                                  }
                                } catch (error) {
                                  alert("Failed to get open link.");
                                }
                                setOpenDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                              type="button"
                            >
                              <FileText className="w-4 h-4" />
                              Open
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file, data.createdBy.name);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              type="button"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {canUpload && (
        <>
          <button
            onClick={() => setOpenCreate(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                 bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                 hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                 active:scale-[0.98] transition"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add New Announcement</span>
          </button>

          <CreateAnnouncementModal
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            courseId={courseId}
            onSubmit={async () => {
              await fetchAnnouncements();
            }}
          />
        </>
      )}

      {editOpen && selectedAnnouncement && (
        <EditAnnouncementModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          announcement={selectedAnnouncement}
          onSubmit={async (form) => {
            if (!selectedAnnouncement) return;
            try {
              await updateAnnouncementAPI({
                announcementId: selectedAnnouncement.id,
                name: form.name,
                description: form.description,
                schedule: form.schedule,
                keepUrls: form.keepUrls,
                files: form.files,
              });
              await fetchAnnouncements();
            } catch (e) {
              alert("Failed to update announcement.");
              console.error(e);
            }
          }}
        />
      )}
    </main>
  );
}

export default function AnnouncementPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-6">Loading announcements...</div>}>
      <AnnouncementContent />
    </Suspense>
  );
}
