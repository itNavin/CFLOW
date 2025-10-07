"use client";

import React from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { getAllAnnouncementByCourseIdAPI } from "@/api/announcement/getAllAnnouncementByCourseId";
import { Announcement } from "@/types/api/announcement";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { file } from "@/types/api/announcement";
import { isCanUpload } from "@/util/RoleHelper";
import { downloadCourseFileAPI } from "@/api/file/downloadCourseFile";
import EditAnnouncementModal from "@/components/announcement/editAnnouncementModal";
import { updateAnnouncementAPI } from "@/api/announcement/updateAnnouncement";
import { deleteAnnouncementAPI } from "@/api/announcement/deleteAnnouncement";

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement.Announcements[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const courseId = useSearchParams().get("courseId") || "";
  const [canUpload, setCanUpload] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement.Announcements | null>(null);

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
      console.log(`Attempting to download file: ${file.id} from announcement by: ${announcementAuthor}`);
      const res = await downloadCourseFileAPI(file.id);
      console.log("API response:", res);

      const url = res.data.url;
      if (url) {
        window.open(url, "_blank");
        console.log("Opened download URL:", url);
      } else {
        alert("Download link not found.");
        console.error("No download URL in response:", res.data);
      }
      setOpenDropdown(null);
    } catch (error: any) {
      setOpenDropdown(null);
      if (error.response && error.response.status === 404) {
        alert("File not found (404).");
        console.error("Download failed: File not found (404)", error);
      } else {
        alert("Failed to get download link.");
        console.error("Download failed:", error);
      }
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncementAPI(announcementId);
      await fetchAnnouncements(); // Refresh the list after deletion
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

  return (
    <main className="min-h-screen p-6 pb-28 font-dbheavent space-y-8">
      {announcements.map((data) => (
        <div
          key={data.id}
          className="bg-white rounded-md shadow p-6 space-y-4 border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold justify-between">
                {data.name}
              </div>
              <div className="text-base text-gray-500">{data.createdAt}</div>
            </div>
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
                  className="flex items-center justify-between border border-gray-300 px-4 py-3 rounded-md text-base text-black bg-[#f8f8f8]"
                >
                  <div className="flex items-center gap-3 truncate w-[85%]">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">
                      {file.name || file.filepath}
                    </span>
                  </div>

                  <div className="relative dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Clicked dropdown for file ${fileIndex} in announcement ${data.id}`);
                        setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
                      }}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      type="button"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
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
      ))}

      {canUpload && <Link
        href={`/announcements/new?courseId=${courseId}`}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                   bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                   hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                   active:scale-[0.98] transition"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Add New Announcement</span>
      </Link>}

      {editOpen && selectedAnnouncement && (
        <EditAnnouncementModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          announcement={selectedAnnouncement}
          onSubmit={async (form) => {
            if (!selectedAnnouncement) return;
            try {
              await updateAnnouncementAPI(
                selectedAnnouncement.id,
                form.name,
                form.description,
                selectedAnnouncement.schedule // keep existing schedule or add a field to edit
              );
              await fetchAnnouncements(); // Refresh list after edit
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