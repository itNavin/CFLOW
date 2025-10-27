"use client";

import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X, Trash2 } from "lucide-react";
import { getStaffMembersAPI } from "@/api/courseMember/getStaffMembers";
import { getStaffMember, getStaffNotInCourse } from "@/types/api/courseMember";
import { useSearchParams } from "next/navigation";
import { addCourseMemberAPI } from "@/api/courseMember/addCourseMember";
import { deleteCourseMemberAPI } from "@/api/courseMember/deleteCourseMember";
import { getStaffNotInCourseAPI } from "@/api/courseMember/getStaffNotInCourse";
import { create } from "domain";
import { useToast } from "@/components/toast";
import ConfirmModal from "@/components/confirmModal";
import { title } from "process";

function AdminTabContent() {
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<getStaffMember.staffMember[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [addingStaff, setAddingStaff] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const { showToast } = useToast();
  const courseId = searchParams.get("courseId") || "";
  const [staffNotInCourse, setStaffNotInCourse] = useState<getStaffNotInCourse.staffNotInCourse[]>([]);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    action?: "deleteSingle" | "deleteSelected";
    payload?: any;
    loading?: boolean;
  }>({ open: false });

  const openDeleteSingleConfirm = (staff: getStaffMember.staffMember) => {
    const staffName = staff.user?.name || staff.user?.id || "-";
    setConfirmState({
      open: true,
      title: "Remove staff",
      message: `Are you sure you want to remove ${staffName} from this course?`,
      action: "deleteSingle",
      payload: staff,
      loading: false,
    });
  };
  const openDeleteSelectedConfirm = (ids: string[]) => {
    setConfirmState({
      open: true,
      title: "Remove selected staff",
      message: `Are you sure you want to remove ${ids.length} staff member(s) from this course?`,
      action: "deleteSelected",
      payload: ids,
      loading: false,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState.action) return setConfirmState({ open: false });
    setConfirmState((s) => ({ ...s, loading: true }));
    try {
      if (confirmState.action === "deleteSingle") {
        const staff: getStaffMember.staffMember = confirmState.payload;
        const resp = await deleteCourseMemberAPI(staff.id);
        if (resp.data?.result?.deletedIds?.includes(staff.id)) {
          showToast({ variant: "success", message: `Removed ${staff.user?.name || "-"} from the course.` });
          await fetchStaff();
        } else {
          showToast({ variant: "error", message: `Failed to remove ${staff.user?.name || "-"}.` });
        }
      } else if (confirmState.action === "deleteSelected") {
        const ids: string[] = confirmState.payload || [];
        const resp = await deleteCourseMemberAPI(ids);
        if (resp.data?.result?.deletedIds?.length > 0) {
          showToast({ variant: "success", message: `Removed ${resp.data.result.deletedIds.length} staff member(s).` });
          setSelected({});
          await fetchStaff();
        } else {
          showToast({ variant: "error", message: "Failed to remove selected staff members." });
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      showToast({ variant: "error", message: String(msg) });
    } finally {
      setConfirmState({ open: false });
    }
  };

  const fetchStaffNotInCourse = async () => {
    try {
      setLoading(true);
      if (!courseId) return;
      const response = await getStaffNotInCourseAPI(courseId);
      if (response.staff && Array.isArray(response.staff)) {
        const mapped = response.staff.map((s: any) => ({
          id: s.id,
          name: s.name ?? s.user?.name ?? "",
          email: s.email ?? s.user?.email ?? "",
          role: s.role ?? s.user?.role ?? "",
          program: s.program ?? s.user?.program ?? "",
          createdAt: s.createdAt ?? "",
          user: s.user,
        }));
        setStaffNotInCourse(mapped);
        console.log("Fetched staff not in course:", mapped);
      } else {
        setStaffNotInCourse([]);
      }
    } catch (error) {
      setError("Failed to load available staff");
      setStaffNotInCourse([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!courseId) {
        setError("No course ID provided");
        return;
      }
      const response = await getStaffMembersAPI(courseId);

      if (response.staff && Array.isArray(response.staff)) {
        setRows(response.staff);
      } else {
        setRows([]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load staff members");
      setRows([]);
      console.error("fetchStaff error:", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteSingleStaff = (staff: getStaffMember.staffMember) => {
    openDeleteSingleConfirm(staff);
  };

  const deleteSelectedStaff = () => {
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    if (selectedIds.length === 0) {
      showToast({ variant: "info", message: "Please select staff to delete" });
      return;
    }
    openDeleteSelectedConfirm(selectedIds);
  };

  // Add staff to course
  const addStaffToCourse = async (selectedStaff: getStaffMember.staffMember[]) => {
    try {
      setAddingStaff(true);
      if (!courseId) throw new Error("Invalid course ID");
      const staffIds = selectedStaff.map(staff => staff.user?.id);
      const response = await addCourseMemberAPI(courseId, staffIds);
      if (response.status === 200 || response.status === 201) {
        showToast({ variant: "success", message: `Added ${staffIds.length} staff member(s) to the course.` });
        await fetchStaff();
        setOpenCreate(false);
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to add staff to course";
      showToast({ variant: "error", message: String(msg) });
    } finally {
      setAddingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [courseId]);

  useEffect(() => {
    if (openCreate && courseId) {
      fetchStaffNotInCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate, courseId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      if (!r) return false;
      return (
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.user?.role?.toLowerCase().includes(q) ||
        r.user?.program?.toLowerCase().includes(q)
      );
    });
  }, [query, rows]);

  const safeFiltered = Array.isArray(filtered) ? filtered : [];
  const allChecked = safeFiltered.length > 0 && safeFiltered.every((a) => a.user?.id != null && selected[a.user.id]);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const toggleAll = () => {
    if (allChecked) setSelected({});
    else {
      const next: Record<string, boolean> = {};
      safeFiltered.forEach((r) => {
        if (r.user?.id != null) {
          next[r.user.id] = true;
        }
      });
      setSelected(next);
    }
  };

  const toggleOne = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <section className="min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition cursor-pointer"
            onClick={() => setOpenCreate(true)}
            disabled={addingStaff || deletingStaff}
          >
            <Plus className="w-4 h-4" />
            {addingStaff ? "Adding..." : "Add"}
          </button>
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
          <div className="p-6 text-center text-gray-600 text-lg">Loading staff...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-lg">
            {error}
            <div className="mt-2 text-sm text-gray-500">
              Debug: rows type: {typeof rows}, is array: {Array.isArray(rows) ? 'yes' : 'no'}
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
                    disabled={deletingStaff}
                  />
                </th>
                <th className="py-3 text-xl">Name</th>
                <th className="py-3 text-xl">Email</th>
                <th className="py-3 text-xl">Role</th>
                <th className="py-3 text-xl">Program</th>
                <th className="py-3 pr-4 text-right text-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeFiltered.map((r, index) => (
                <tr key={r.user?.id || `staff-${index}`} className={`border-t ${deletingStaff ? 'opacity-50' : ''}`}>
                  <td className="py-3 pl-4 align-top">
                    <input
                      type="checkbox"
                      checked={!!(r.user?.id != null && selected[r.user.id])}
                      onChange={() => r.user?.id != null && toggleOne(r.user.id)}
                      className="accent-[#326295] mt-1.5"
                      disabled={deletingStaff}
                    />
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.user?.name || "-"}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.user?.email || "-"}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.user?.role || "-"}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.user?.program || "-"}
                  </td>
                  <td className="py-3 pr-4 align-top text-right whitespace-nowrap">
                    <button
                      title="Delete"
                      className="inline-flex items-center justify-center bg-white p-3 text-xl text-red-600 hover:bg-red-50 cursor-pointer"
                      onClick={() => deleteSingleStaff(r)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {safeFiltered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-lg">
                    {loading ? "Loading..." : "No staff members found."}
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
            className="inline-flex items-center justify-center bg-white p-3 text-xl text-red-600 hover:bg-red-50 mr-4 cursor-pointer"
            onClick={deleteSelectedStaff}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {openCreate && (
        <AddStaffModal
          availableStaff={staffNotInCourse.map((s) => ({
            id: s.id,
            courseId: "", // You may set this to courseId if available
            userId: s.id ?? "",
            createdAt: s.createdAt || "",
            user: {
              id: s.id,
              name: s.name,
              email: s.email,
              role: s.role,
              program: s.program,
              createdAt: s.createdAt || "",
            },
          }))}
          loading={loading}
          adding={addingStaff}
          onCancel={() => setOpenCreate(false)}
          onSave={addStaffToCourse}
        />
      )}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        loading={confirmState.loading}
        onCancel={() => setConfirmState({ open: false })}
        onConfirm={handleConfirm}
      />
    </section>
  );
}

function AddStaffModal({
  availableStaff,
  loading,
  adding,
  onCancel,
  onSave,
}: {
  availableStaff: getStaffMember.staffMember[];
  loading: boolean;
  adding: boolean;
  onCancel: () => void;
  onSave: (staff: getStaffMember.staffMember[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Record<string, boolean>>({});

  const safeAvailableStaff = Array.isArray(availableStaff) ? availableStaff : [];

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return safeAvailableStaff;
    return safeAvailableStaff.filter(staff =>
      staff.user?.id?.toString().includes(q) ||
      staff.user?.name?.toLowerCase().includes(q) ||
      staff.user?.email?.toLowerCase().includes(q)
    );
  }, [searchQuery, safeAvailableStaff]);

  const allSelected = filteredStaff.length > 0 && filteredStaff.every(a => selectedStaff[a.user?.id]);
  const someSelected = filteredStaff.some(a => selectedStaff[a.user?.id]) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedStaff({});
    } else {
      const newSelected: Record<string, boolean> = {};
      filteredStaff.forEach(a => a.user?.id && (newSelected[a.user.id] = true));
      setSelectedStaff(newSelected);
    }
  };

  const toggleStaff = (id: string) => {
    setSelectedStaff(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const selected = safeAvailableStaff.filter(a => selectedStaff[a.user?.id]);
    onSave(selected);
  };

  const selectedCount = Object.values(selectedStaff).filter(Boolean).length;

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
            <h2 className="text-2xl font-semibold">Add Staff</h2>
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
                placeholder="Search staff..."
                disabled={adding}
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#326295] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="overflow-x-auto rounded border bg-white max-h-96">
              {loading ? (
                <div className="p-8 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#326295] mx-auto mb-2"></div>
                  Loading available staff...
                </div>
              ) : adding ? (
                <div className="p-8 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#326295] mx-auto mb-2"></div>
                  Adding staff to course...
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-gray-900 border-b">
                      <th className="w-10 py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => { if (el) el.indeterminate = someSelected; }}
                          onChange={toggleAll}
                          className="accent-[#326295] cursor-pointer"
                          disabled={filteredStaff.length === 0}
                        />
                      </th>
                      <th className="py-3 text-lg">Staff ID</th>
                      <th className="py-3 text-lg">Name</th>
                      <th className="py-3 text-lg">Email</th>
                      <th className="py-3 text-lg">Role</th>
                      <th className="py-3 text-lg">Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length > 0 ? (
                      filteredStaff.map((staff, index) => (
                        <tr key={staff.user?.id || `staff-${index}`} className="border-t hover:bg-gray-50">
                          <td className="py-3 pl-4">
                            <input
                              type="checkbox"
                              checked={!!selectedStaff[staff.user?.id]}
                              onChange={() => staff.user?.id && toggleStaff(staff.user.id)}
                              className="accent-[#326295] cursor-pointer"
                            />
                          </td>
                          <td className="py-3 text-gray-900">{staff.user?.id}</td>
                          <td className="py-3 text-gray-900">{staff.user?.name}</td>
                          <td className="py-3 text-gray-900">{staff.user?.email}</td>
                          <td className="py-3 text-gray-900">{staff.user?.role}</td>
                          <td className="py-3 text-gray-900">{staff.user?.program}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          {safeAvailableStaff.length === 0
                            ? "No staff available to add to this course."
                            : "No staff match your search."
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {selectedCount > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                {selectedCount} staff member{selectedCount === 1 ? '' : 's'} selected
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button
              onClick={onCancel}
              disabled={adding}
              className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedCount === 0 || loading || adding}
              className="rounded px-5 py-2 text-white disabled:opacity-60 shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : `Add ${selectedCount} Staff`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminTab() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading admin tab...</div>}>
      <AdminTabContent />
    </Suspense>
  );
}
