"use client";

import React, { Suspense, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X, Trash2 } from "lucide-react";
import { getStudentMemberAPI } from "@/api/courseMember/getStudentMember";
import { getStudentMember, getStudentNotInCourse, studentMember, studentNotInCourse } from "@/types/api/courseMember";
import { usePathname, useSearchParams } from "next/navigation";
import { getStudentNotInCourseAPI } from "@/api/courseMember/getStudentNotInCourse";
import { addCourseMember } from "@/types/api/courseMember";
import { addCourseMemberAPI } from "@/api/courseMember/addCourseMember";
import { deleteCourseMemberAPI } from "@/api/courseMember/deleteCourseMember";
import { getStaffCourseAPI } from "@/api/course/getStaffCourse";
import DownloadTemplateButton from "@/components/downloadTemplateButton";
import { uploadTemplateAPI } from "@/api/excel/uploadTemplate";
import { useToast } from "@/components/toast";
import ConfirmModal from "@/components/confirmModal";

type Program = "CS" | "DSI";

function StudentTabContent() {
  const { showToast } = useToast();
  const courseId = useSearchParams().get("courseId") || "";
  const [rows, setRows] = useState<studentMember[]>([]);
  const [studentNotInCourse, setStudentNotInCourse] = useState<studentNotInCourse[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingStudents, setAddingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [courseProgram, setCourseProgram] = useState<Program | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title?: string;
    message?: string;
    action?: "deleteSingle" | "deleteSelected";
    payload?: any;
    loading?: boolean;
  }>({ open: false });

  const sortByIdAsc = (aId?: string | number, bId?: string | number) => {
    const a = String(aId ?? "").trim();
    const b = String(bId ?? "").trim();
    const an = a.replace(/\D/g, "");
    const bn = b.replace(/\D/g, "");
    if (/^\d+$/.test(an) && /^\d+$/.test(bn)) {
      try {
        const ai = BigInt(an);
        const bi = BigInt(bn);
        if (ai < bi) return -1;
        if (ai > bi) return 1;
        return 0;
      } catch {
      }
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  };

  const fetchStudentNotInCourse = async (courseId: string) => {
    try {
      setLoadingAvailable(true);
      if (!courseId) return;
      const response = await getStudentNotInCourseAPI(courseId);
      const list = Array.isArray(response.data?.students) ? response.data.students.slice() : [];
      list.sort((x, y) => sortByIdAsc(x.id, y.id));
      setStudentNotInCourse(list);
    } catch (error) {
      console.error("Failed to load students not in course:", error);
      setError("Failed to load available students");
      setStudentNotInCourse([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!courseId) {
        throw new Error("No course selected. Please select a course first.");
      }

      const response = await getStudentMemberAPI(courseId);
      if (response.data?.students && Array.isArray(response.data.students)) {
        setRows(response.data.students);
      } else {
        console.warn("Unexpected response structure:", response.data);
        setRows([]);
      }
    } catch (e: any) {
      console.error("Error fetching students:", e);
      setError(e?.message || "Failed to load students");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourseProgram = async () => {
      if (!courseId) return;
      try {
        const response = await getStaffCourseAPI();
        const found = response.data?.course?.find((c: any) => c.id === courseId);
        if (found && found.program) {
          setCourseProgram(found.program as Program);
        } else {
          setCourseProgram(null);
        }
      } catch (error) {
        console.error("Failed to fetch course program:", error);
        setCourseProgram(null);
      }
    };
    fetchCourseProgram();
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  useEffect(() => {
    if (openCreate && courseId) {
      fetchStudentNotInCourse(courseId);
    }
  }, [openCreate, courseId]);

  // const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   if (!files.length || !courseId) return;

  //   try {
  //     setLoading(true);

  //     const res = await uploadTemplateAPI(courseId, files);

  //     // if the API returns an HTTP-like status, treat non-2xx as error
  //     const status = (res && (res as any).status) ?? (res && (res as any).statusCode) ?? null;
  //     if (typeof status === "number" && status >= 400) {
  //       throw new Error("Upload failed");
  //     }

  //     // simple success toast only
  //     showToast({ variant: "success", message: "Files uploaded successfully" });

  //     await fetchStudents();
  //     if (openCreate) await fetchStudentNotInCourse(courseId);

  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   } catch (error) {
  //     console.error("Error uploading files:", error);
  //     showToast({ variant: "error", message: "Upload failed. Please try again." });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !courseId) return;

    try {
      setUploadingExcel(true);
      setLoading(true);

      const res = await uploadTemplateAPI(courseId, files);

      const status = (res && (res as any).status) ?? (res && (res as any).statusCode) ?? null;
      const data = (res && (res as any).data) ?? (res as any) ?? {};

      if (typeof status === "number" && status >= 400) {
        console.error("[uploadTemplate] http status error:", status, data);
        showToast({ variant: "error", message: "Upload failed. Please try again." });
        return;
      }

      const bodyMsg = data?.message ?? data?.error ?? "";
      if (bodyMsg && /error|invalid|failed|forbidden|required/i.test(String(bodyMsg))) {
        showToast({ variant: "error", message: "Upload failed. Please try again." });
        return;
      }

      const details = Array.isArray(data?.result?.details) ? data.result.details : [];
      const hasFailures = details.some((d: any) => d?.error || d?.ok === false);
      if (hasFailures) {
        console.log("[uploadTemplate] validation details:", details);
        showToast({ variant: "error", message: "Upload failed due to validation errors. Check console for details." });
        return;
      }

      showToast({ variant: "success", message: "Files uploaded successfully" });

      await fetchStudents();
      if (openCreate) await fetchStudentNotInCourse(courseId);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      showToast({ variant: "error", message: "Upload failed. Please try again." });
    } finally {
      setUploadingExcel(false);
      setLoading(false);
    }
  };

  const addStudentsToCourse = async (selectedStudents: studentNotInCourse[]) => {
    try {
      setAddingStudents(true);

      if (!courseId) {
        throw new Error("Invalid course ID");
      }

      const userIds = selectedStudents.map((student) => student.id);

      const response = await addCourseMemberAPI(courseId, userIds);

      if (response.data?.message) {
        showToast({ variant: "success", message: `Successfully processed ${selectedStudents.length} student(s).` });
      } else {
        showToast({ variant: "success", message: `Added ${selectedStudents.length} student(s) to the course.` });
      }

      await fetchStudents();
      setOpenCreate(false);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        showToast({ variant: "error", message: "Error: API endpoint not found. Please check configuration." });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to add students to course";
        showToast({ variant: "error", message: String(errorMessage) });
      }
    } finally {
      setAddingStudents(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.user?.id?.toString().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.groupMembers?.[0]?.group?.projectName?.toLowerCase().includes(q) ||
        r.groupMembers?.[0]?.group?.productName?.toLowerCase().includes(q)
    );
  }, [query, rows]);

  const allChecked = filtered.length > 0 && filtered.every((r) => r.id != null && selected[r.id]);
  const someChecked = filtered.some((r) => selected[r.id]) && !allChecked;

  const toggleAll = () => {
    if (allChecked) return setSelected({});
    const next: Record<string, boolean> = {};
    filtered.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };

  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const handleUploadClick = () => fileInputRef.current?.click();
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const openDeleteSingleConfirm = (student: studentMember) => {
    const studentName = student.user?.name || `ID: ${student.id}`;
    setConfirmState({
      open: true,
      title: "Remove student",
      message: `Are you sure you want to remove ${studentName} from this course?`,
      action: "deleteSingle",
      payload: student,
      loading: false,
    });
  };

  const openDeleteSelectedConfirm = () => {
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    if (selectedIds.length === 0) {
      showToast({ variant: "info", message: "Please select students to delete" });
      return;
    }
    const selectedStudents = rows.filter((s) => selectedIds.includes(s.id));
    const studentNames = selectedStudents.map((s) => s.user?.name || `ID: ${s.id}`);
    setConfirmState({
      open: true,
      title: "Remove selected students",
      message: `Are you sure you want to remove ${selectedIds.length} student(s)?\n\n${studentNames.join(", ")}`,
      action: "deleteSelected",
      payload: selectedIds,
      loading: false,
    });
  };

  const deleteSingleStudentApi = async (student: studentMember) => {
    setDeletingStudent(true);
    try {
      const response = await deleteCourseMemberAPI(student.id);
      if (response.data?.result) {
        const { deletedIds, notFoundIds, blocked } = response.data.result;
        if (deletedIds && deletedIds.includes(student.id)) {
          showToast({ variant: "success", message: `Successfully removed ${student.user?.name || `ID: ${student.id}`} from the course.` });
        } else if (blocked && blocked.includes(student.id)) {
          showToast({ variant: "error", message: `Cannot remove student - they may be assigned to groups or have submissions.` });
        } else if (notFoundIds && notFoundIds.includes(student.id)) {
          showToast({ variant: "error", message: `Student was not found in the course.` });
        } else {
          showToast({ variant: "error", message: `Failed to remove student.` });
        }
      } else if (response.data?.message) {
        showToast({ variant: "error", message: String(response.data.message) });
      } else {
        showToast({ variant: "success", message: `Successfully removed ${student.user?.name || `ID: ${student.id}`} from the course.` });
      }
      await fetchStudents();
    } catch (error: any) {
      console.error("Error deleting student from course:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to remove student from course";
      showToast({ variant: "error", message: String(errorMessage) });
    } finally {
      setDeletingStudent(false);
    }
  };

  const deleteSelectedStudentsApi = async (ids: string[]) => {
    setDeletingStudent(true);
    try {
      const response = await deleteCourseMemberAPI(ids);
      if (response.data?.result) {
        const { deletedIds, notFoundIds, blocked } = response.data.result;
        let message = "";
        if (deletedIds && deletedIds.length > 0) {
          message += `Successfully removed ${deletedIds.length} student(s). `;
        }
        if (blocked && blocked.length > 0) {
          message += `${blocked.length} student(s) could not be removed (may be assigned to groups or have submissions). `;
        }
        if (notFoundIds && notFoundIds.length > 0) {
          message += `${notFoundIds.length} student(s) were not found. `;
        }
        showToast({ variant: "info", message: message || "Operation completed." });
      } else if (response.data?.message) {
        showToast({ variant: "error", message: String(response.data.message) });
      } else {
        showToast({ variant: "success", message: `Successfully removed ${ids.length} student(s) from the course.` });
      }
      setSelected({});
      await fetchStudents();
    } catch (error: any) {
      console.error("Error deleting students from course:", error);
      let errorMessage = "Failed to remove students from course";
      if (error?.response?.status === 400) {
        errorMessage = error?.response?.data?.message || "Bad request - check if students can be removed";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showToast({ variant: "error", message: String(errorMessage) });
    } finally {
      setDeletingStudent(false);
    }
  };

  return (
    <section className="min-h-[60vh]">
      {uploadingExcel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
          <div className="rounded-lg bg-white/95 p-6 flex items-center gap-4 shadow-xl">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#326295]" />
            <div className="text-lg font-medium">Uploading excel…</div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}
            disabled={addingStudents}
          >
            <Plus className="w-4 h-4" />
            {addingStudents ? "Adding..." : "Add"}
          </button>

          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={handleUploadClick}
            disabled={uploadingExcel}
            aria-disabled={uploadingExcel}
          >
            {uploadingExcel ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploadingExcel ? "Uploading..." : "Upload excel"}
          </button>

          <DownloadTemplateButton program={courseProgram} />

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploadingExcel}
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
          <div className="p-6 text-center text-gray-600 text-lg">Loading students...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-lg">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-900 border-b">
                <th className="w-10 py-3 pl-4">
                  <input
                    aria-label="Select all"
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="accent-[#326295] cursor-pointer mt-2"
                  />
                </th>
                <th className="py-3 text-xl">Student ID</th>
                <th className="py-3 text-xl">Name</th>
                <th className="py-3 text-xl">Mail</th>
                <th className="py-3 text-xl">Project name</th>
                <th className="py-3 text-xl">Product name</th>
                <th className="py-3 pr-4 text-right text-xl">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 pl-4 align-top">
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={() => toggleOne(r.id)}
                      className="accent-[#326295] cursor-pointer mt-1.5"
                    />
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg whitespace-nowrap">{r.user?.id || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {[r.user?.name].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">{r.user?.email || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.groupMembers?.[0]?.group?.projectName || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.groupMembers?.[0]?.group?.productName || <span className="text-gray-400">-</span>}
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

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-lg">No students found.</td>
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
        <AddStudentModal
          availableStudents={studentNotInCourse}
          loading={loadingAvailable}
          adding={addingStudents}
          onCancel={() => setOpenCreate(false)}
          onSave={addStudentsToCourse}
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
              const student: studentMember = confirmState.payload;
              await deleteSingleStudentApi(student);
            } else if (confirmState.action === "deleteSelected") {
              const ids: string[] = confirmState.payload || [];
              await deleteSelectedStudentsApi(ids);
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

/* ------------------------- Add Student Modal ------------------------- */
function AddStudentModal({
  availableStudents,
  loading,
  adding,
  onCancel,
  onSave,
}: {
  availableStudents: studentNotInCourse[];
  loading: boolean;
  adding: boolean;
  onCancel: () => void;
  onSave: (students: studentNotInCourse[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});

  const safeAvailableStudents = Array.isArray(availableStudents) ? availableStudents : [];

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return safeAvailableStudents;
    return safeAvailableStudents.filter((student) =>
      student.id.toString().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  }, [searchQuery, safeAvailableStudents]);

  const allSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents[s.id]);
  const someSelected = filteredStudents.some((s) => selectedStudents[s.id]) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedStudents({});
    } else {
      const newSelected: Record<string, boolean> = {};
      filteredStudents.forEach((s) => (newSelected[s.id] = true));
      setSelectedStudents(newSelected);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const selected = safeAvailableStudents.filter((s) => selectedStudents[s.id]);
    onSave(selected);
  };

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

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
            <h2 className="text-2xl font-semibold">Add Students</h2>
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
                placeholder="Search students..."
                disabled={adding}
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#326295] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="overflow-x-auto rounded border bg-white max-h-96">
              {loading ? (
                <div className="p-8 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#326295] mx-auto mb-2"></div>
                  Loading available students...
                </div>
              ) : adding ? (
                <div className="p-8 text-center text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#326295] mx-auto mb-2"></div>
                  Adding students to course...
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
                          disabled={filteredStudents.length === 0}
                        />
                      </th>
                      <th className="py-3 text-lg">Student ID</th>
                      <th className="py-3 text-lg">Name</th>
                      <th className="py-3 text-lg">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="border-t hover:bg-gray-50">
                          <td className="py-3 pl-4 align-top">
                            <input
                              type="checkbox"
                              checked={!!selectedStudents[student.id]}
                              onChange={() => toggleStudent(student.id)}
                              className="accent-[#326295] cursor-pointer mt-2"
                            />
                          </td>
                          <td className="py-3 text-gray-900">{student.id}</td>
                          <td className="py-3 text-gray-900">{student.name}</td>
                          <td className="py-3 text-gray-900">{student.email}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          {safeAvailableStudents.length === 0
                            ? "No students available to add to this course."
                            : "No students match your search."
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
                {selectedCount} student{selectedCount === 1 ? '' : 's'} selected
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
              {adding ? "Adding..." : `Add ${selectedCount} Student${selectedCount === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function StudentTab() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading student tab...</div>}>
      <StudentTabContent />
    </Suspense>
  );
}