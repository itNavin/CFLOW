"use client";

import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X, Trash2 } from "lucide-react";
import { getAdvisorMemberAPI } from "@/api/courseMember/getAdvisorMembers";
import { getAdvisorMember } from "@/types/api/courseMember";
import { useSearchParams } from "next/navigation";
import { getAdvisorNotInCourse } from "@/types/api/courseMember";
import { getAdvisorNotInCourseAPI } from "@/api/courseMember/getAdvisorNotInCourse";
import { addCourseMember } from "@/types/api/courseMember";
import { addCourseMemberAPI } from "@/api/courseMember/addCourseMember";
import { deleteCourseMemberAPI } from "@/api/courseMember/deleteCourseMember";
import { useToast } from "@/components/toast";
import ConfirmModal from "@/components/confirmModal";

function AdvisorTabContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingAdvisors, setAddingAdvisors] = useState(false);
  const [deletingAdvisors, setDeletingAdvisors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const courseId = searchParams.get("courseId") || "";
  const [advisorsNotInCourse, setAdvisorsNotInCourse] = useState<any[]>([]);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    action?: "deleteSingle" | "deleteSelected";
    payload?: any;
    loading?: boolean;
  }>({ open: false });

  const fetchAdvisorsNotInCourse = async () => {
    try {
      setLoadingAvailable(true);
      if (!courseId) return;

      const response = await getAdvisorNotInCourseAPI(courseId);

      if (response.data && response.data.advisors && Array.isArray(response.data.advisors)) {
        setAdvisorsNotInCourse(response.data.advisors);
      } else {
        console.error("Unexpected response structure:", response.data);
        setAdvisorsNotInCourse([]);
      }
    } catch (error) {
      console.error("Failed to load advisors not in course:", error);
      setError("Failed to load available advisors");
      setAdvisorsNotInCourse([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!courseId) {
        setError("No course ID provided");
        return;
      }
      const response = await getAdvisorMemberAPI(courseId);
      if (response.data?.advisors && Array.isArray(response.data.advisors)) {
        setRows(response.data.advisors);
      } else if (Array.isArray(response.data)) {
        setRows(response.data);
      } else {
        console.warn("Unexpected response structure:", response.data);
        setRows([]);
      }
    } catch (e: any) {
      console.error("Error fetching advisors:", e);
      setError(e?.message || "Failed to load advisors");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, [courseId]);

  useEffect(() => {
    if (openCreate && courseId) {
      fetchAdvisorsNotInCourse();
    }
  }, [openCreate, courseId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(rows)) {
      console.warn("rows is not an array:", rows);
      return [];
    }

    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      if (!r) return false;

      return (
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        (Array.isArray(r.projects) && r.projects.some((p: any) => p.projectName?.toLowerCase().includes(q)))
      );
    });
  }, [query, rows]);

  const safeFiltered = Array.isArray(filtered) ? filtered : [];
  const allChecked = safeFiltered.length > 0 && safeFiltered.every((a) => a.id != null && selected[a.id]);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const toggleAll = () => {
    if (allChecked) setSelected({});
    else {
      const next: Record<string, boolean> = {};
      safeFiltered.forEach((r) => {
        if (r.id != null) {
          next[r.id] = true;
        }
      });
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const openDeleteSingleConfirm = (advisor: any) => {
    const advisorName = advisor.user?.name || advisor.name || `ID: ${advisor.id}`;
    setConfirmState({
      open: true,
      title: "Remove advisor",
      message: `Are you sure you want to remove ${advisorName} from this course?`,
      action: "deleteSingle",
      payload: advisor,
      loading: false,
    });
  };

  const openDeleteSelectedConfirm = () => {
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    if (selectedIds.length === 0) {
      showToast({ variant: "info", message: "Please select advisors to delete" });
      return;
    }
    const selectedAdvisors = rows.filter((advisor) => selectedIds.includes(advisor.id));
    const advisorNames = selectedAdvisors.map((a) => a.user?.name || a.name || `ID: ${a.id}`);
    setConfirmState({
      open: true,
      title: "Remove selected advisors",
      message: `Are you sure you want to remove ${selectedIds.length} advisor(s)?\n\n${advisorNames.join(", ")}`,
      action: "deleteSelected",
      payload: selectedIds,
      loading: false,
    });
  };

  const deleteSelectedAdvisors = async (ids: string[]) => {
    setDeletingAdvisors(true);
    try {
      const response = await deleteCourseMemberAPI(ids);
      if (response.data?.result) {
        const { deletedIds, notFoundIds, blocked } = response.data.result;
        let message = "";
        if (deletedIds && deletedIds.length > 0) {
          message += `Removed ${deletedIds.length} advisor(s). `;
        }
        if (blocked && blocked.length > 0) {
          message += `${blocked.length} advisor(s) could not be removed (may supervise groups or have assignments). `;
        }
        if (notFoundIds && notFoundIds.length > 0) {
          message += `${notFoundIds.length} advisor(s) were not found. `;
        }
        showToast({ variant: "info", message: message || "Operation completed." });
      } else if (response.data?.message) {
        showToast({ variant: "error", message: String(response.data.message) });
      } else {
        showToast({ variant: "success", message: `Removed ${ids.length} advisor(s) from the course.` });
      }
      setSelected({});
      await fetchAdvisors();
    } catch (error: any) {
      console.error("Error deleting advisors from course:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to remove advisors from course";
      showToast({ variant: "error", message: String(errorMessage) });
    } finally {
      setDeletingAdvisors(false);
    }
  };

  const deleteSingleAdvisor = async (advisor: any) => {
    setDeletingAdvisors(true);
    try {
      const response = await deleteCourseMemberAPI(advisor.id);
      if (response.data?.result) {
        const { deletedIds, notFoundIds, blocked } = response.data.result;
        if (deletedIds && deletedIds.includes(advisor.id)) {
          showToast({ variant: "success", message: `Removed ${advisor.user?.name || advisor.name || "-"} from the course.` });
        } else if (notFoundIds && notFoundIds.includes(advisor.id)) {
          showToast({ variant: "error", message: `Advisor was not found in the course.` });
        } else if (blocked && blocked.includes(advisor.id)) {
          showToast({ variant: "error", message: `Cannot remove advisor - they may supervise groups or have assignments.` });
        } else {
          showToast({ variant: "error", message: `Failed to remove advisor.` });
        }
      } else if (response.data?.message) {
        showToast({ variant: "error", message: String(response.data.message) });
      } else {
        showToast({ variant: "success", message: `Removed ${advisor.user?.name || advisor.name || "-"} from the course.` });
      }
      await fetchAdvisors();
    } catch (error: any) {
      console.error("Error deleting advisor from course:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to remove advisor from course";
      showToast({ variant: "error", message: String(errorMessage) });
    } finally {
      setDeletingAdvisors(false);
    }
  };

  const addAdvisorsToCourse = async (selectedAdvisors: any[]) => {
    try {
      setAddingAdvisors(true);

      if (!courseId) {
        throw new Error("Invalid course ID");
      }

      const advisorsIds = selectedAdvisors.map((advisor) => advisor.id);
      const response = await addCourseMemberAPI(courseId, advisorsIds);

      if (response.status === 200 || response.status === 201) {
        let message = "";

        if (response.data) {
          const { insertedCount, skippedAsDuplicate, requestedCount, message: apiMessage } = response.data;
          if (apiMessage) {
            message = apiMessage;
          } else {
            if (insertedCount !== undefined && insertedCount > 0) {
              message += `Successfully added ${insertedCount} advisor(s) to the course.`;
            }
            if (skippedAsDuplicate !== undefined && skippedAsDuplicate > 0) {
              message += ` ${skippedAsDuplicate} advisor(s) were already in the course.`;
            }

            if (!message) {
              message = `Successfully processed ${selectedAdvisors.length} advisor(s).`;
            }
          }
        } else {
          message = `Successfully added ${selectedAdvisors.length} advisor(s) to the course.`;
        }

        showToast({ variant: "success", message });

        await fetchAdvisors();
        setOpenCreate(false);
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error adding advisors to course:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);

      let errorMessage = "Failed to add advisors to course";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showToast({ variant: "error", message: String(errorMessage) });
    } finally {
      setAddingAdvisors(false);
    }
  };

  return (
    <section className="min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}
            disabled={addingAdvisors || deletingAdvisors}
          >
            <Plus className="w-4 h-4" />
            {addingAdvisors ? "Adding..." : "Add"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#326295]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded border bg-white">
        {loading ? (
          <div className="p-6 text-center text-gray-600 text-lg">Loading advisors...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-lg">
            {error}
            <div className="mt-2 text-sm text-gray-500">
              Debug: rows type: {typeof rows}, is array: {Array.isArray(rows) ? "yes" : "no"}
            </div>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-900 border-b">
                <th className="w-10 py-3 pl-4">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="accent-[#326295] mt-2"
                    disabled={deletingAdvisors}
                  />
                </th>
                <th className="py-3 text-xl">Name</th>
                <th className="py-3 text-xl">Email</th>
                <th className="py-3 text-xl">Project name</th>
                <th className="py-3 pr-4 text-right text-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeFiltered.map((r, index) => (
                <tr key={r.id || `advisor-${index}`} className={`border-t ${deletingAdvisors ? "opacity-50" : ""}`}>
                  <td className="py-3 pl-4 align-top">
                    <input
                      type="checkbox"
                      checked={!!(r.id != null && selected[r.id])}
                      onChange={() => r.id != null && toggleOne(r.id)}
                      className="accent-[#326295] mt-1.5"
                      disabled={deletingAdvisors}
                    />
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">{r.user?.name || r.name || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">{r.user?.email || r.email || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {Array.isArray(r.projects) && r.projects.length ? (
                      <ol className="list-decimal ml-4 space-y-0.5">
                        {r.projects.map((p: any, i: any) => (
                          <li key={p.id ?? `${r.id}-${i}`}>{p.projectName || "(untitled)"}</li>
                        ))}
                      </ol>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="py-3 pr-4 align-top text-right whitespace-nowrap">
                    <button
                      title="Delete"
                      className="inline-flex items-center justify-center bg-white p-3 text-xl text-red-600 hover:bg-red-50"
                      onClick={() => openDeleteSingleConfirm(r)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {safeFiltered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-lg">
                    {loading ? "Loading..." : "No advisors found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
        <div>{selectedCount} selected</div>

        {selectedCount > 0 && (
          <button
            title="Delete"
            className="inline-flex items-center justify-center bg-white p-3 text-xl text-red-600 hover:bg-red-50 mr-4"
            onClick={openDeleteSelectedConfirm}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {openCreate && (
        <AddAdvisorModal
          availableAdvisors={advisorsNotInCourse}
          loading={loadingAvailable}
          adding={addingAdvisors}
          onCancel={() => setOpenCreate(false)}
          onSave={addAdvisorsToCourse}
        />
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        loading={confirmState.loading}
        onCancel={() => setConfirmState({ open: false })}
        onConfirm={async () => {
          if (!confirmState.action) return setConfirmState({ open: false });
          setConfirmState((s) => ({ ...s, loading: true }));
          try {
            if (confirmState.action === "deleteSingle") {
              const advisor = confirmState.payload;
              await deleteSingleAdvisor(advisor);
            } else if (confirmState.action === "deleteSelected") {
              const ids: string[] = confirmState.payload || [];
              await deleteSelectedAdvisors(ids);
            }
          } catch (err: any) {
            console.error("Confirm delete error:", err);
            const msg = err?.response?.data?.message || err?.message || "Delete failed";
            showToast({ variant: "error", message: String(msg) });
          } finally {
            setConfirmState({ open: false });
          }
        }}
      />
    </section>
  );
}

/* ------------------------- Add Advisor Modal ------------------------- */
function AddAdvisorModal({
  availableAdvisors,
  loading,
  adding,
  onCancel,
  onSave,
}: {
  availableAdvisors: any[];
  loading: boolean;
  adding: boolean;
  onCancel: () => void;
  onSave: (advisors: any[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvisors, setSelectedAdvisors] = useState<Record<string, boolean>>({});

  const safeAvailableAdvisors = Array.isArray(availableAdvisors) ? availableAdvisors : [];

  const filteredAdvisors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return safeAvailableAdvisors;
    return safeAvailableAdvisors.filter(
      (advisor) =>
        advisor?.id?.toString().includes(q) ||
        advisor?.name?.toLowerCase().includes(q) ||
        advisor?.email?.toLowerCase().includes(q)
    );
  }, [searchQuery, safeAvailableAdvisors]);

  const allSelected = filteredAdvisors.length > 0 && filteredAdvisors.every((a) => selectedAdvisors[a.id]);
  const someSelected = filteredAdvisors.some((a) => selectedAdvisors[a.id]) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedAdvisors({});
    } else {
      const newSelected: Record<string, boolean> = {};
      filteredAdvisors.forEach((a) => (newSelected[a.id] = true));
      setSelectedAdvisors(newSelected);
    }
  };

  const toggleAdvisor = (id: string) => {
    setSelectedAdvisors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const selected = safeAvailableAdvisors.filter((a) => selectedAdvisors[a.id]);
    onSave(selected);
  };

  const selectedCount = Object.values(selectedAdvisors).filter(Boolean).length;

  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !adding && onCancel();
    const onClick = (e: MouseEvent) => {
      if (!adding && panelRef.current && !panelRef.current.contains(e.target as Node)) onCancel();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onCancel, adding]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div ref={panelRef} className="w-full max-w-4xl rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Add Advisors</h2>
            <button
              onClick={onCancel}
              disabled={adding}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advisors..."
                disabled={adding}
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#326295] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="overflow-x-auto rounded border bg-white max-h-96">
              {loading ? (
                <div className="p-8 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#326295] mx-auto mb-2"></div>
                  Loading available advisors...
                </div>
              ) : adding ? (
                <div className="p-8 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#326295] mx-auto mb-2"></div>
                  Adding advisors to course...
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-gray-900 border-b">
                      <th className="w-10 py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected;
                          }}
                          onChange={toggleAll}
                          className="accent-[#326295] cursor-pointer"
                          disabled={filteredAdvisors.length === 0}
                        />
                      </th>
                      <th className="py-3 text-lg">Advisor ID</th>
                      <th className="py-3 text-lg">Name</th>
                      <th className="py-3 text-lg">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdvisors.length > 0 ? (
                      filteredAdvisors.map((advisor, index) => (
                        <tr key={advisor.id || `advisor-${index}`} className="border-t hover:bg-gray-50">
                          <td className="py-3 pl-4">
                            <input
                              type="checkbox"
                              checked={!!selectedAdvisors[advisor.id]}
                              onChange={() => toggleAdvisor(advisor.id)}
                              className="accent-[#326295] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 text-gray-900">{advisor.id}</td>
                          <td className="py-3 text-gray-900">{advisor.name}</td>
                          <td className="py-3 text-gray-900">{advisor.email}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          {safeAvailableAdvisors.length === 0 ? "No advisors available to add to this course." : "No advisors match your search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {selectedCount > 0 && <div className="mt-3 text-sm text-gray-600">{selectedCount} advisor{selectedCount === 1 ? "" : "s"} selected</div>}
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button onClick={onCancel} disabled={adding} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedCount === 0 || loading || adding}
              className="rounded px-5 py-2 text-white disabled:opacity-60 shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : `Add ${selectedCount} Advisor${selectedCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdvisorTab() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading advisor tab...</div>}>
      <AdvisorTabContent />
    </Suspense>
  );
}