"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X } from "lucide-react";
import { getStudentMemberAPI } from "@/api/courseMember/getStudentMember";
import { getStudentMember, getStudentNotInCourse, studentMember, studentNotInCourse } from "@/types/api/courseMember";
import { usePathname, useSearchParams } from "next/navigation";
import { getStudentNotInCourseAPI } from "@/api/courseMember/getStudentNotInCourse";
import { addCourseMember } from "@/types/api/courseMember";
import { addCourseMemberAPI } from "@/api/courseMember/addCourseMember";

export default function StudentTab() {
  const courseId = useSearchParams().get("courseId") || "";
  const [rows, setRows] = useState<studentMember[]>([]);
  const [studentNotInCourse, setStudentNotInCourse] = useState<studentNotInCourse[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingStudents, setAddingStudents] = useState(false); // New state for adding students
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);

  const fetchStudentNotInCourse = async (courseId: string) => {
  try {
    setLoadingAvailable(true);
    if (!courseId) return;

    const response = await getStudentNotInCourseAPI(courseId);
    console.log("Students not in course response:", response.data);
    
    // Handle the correct response structure
    if (response.data?.students && Array.isArray(response.data.students)) {
      setStudentNotInCourse(response.data.students);
    } else {
      console.warn("Unexpected response structure:", response.data);
      setStudentNotInCourse([]);
    }
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
      console.log("Students response:", response.data);

      // Handle the correct response structure
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

  const addStudentsToCourse = async (selectedStudents: studentNotInCourse[]) => {
    try {
      setAddingStudents(true);

      if (!courseId || isNaN(Number(courseId))) {
        throw new Error("Invalid course ID");
      }

      const userIds = selectedStudents.map(student => student.id);

      console.log("Adding students to course:", {
        courseId: courseId,
        userIds,
        selectedStudents
      });

      const response = await addCourseMemberAPI(courseId, userIds);

      console.log("Add students response:", response.data);

      const { insertedCount, skippedAsDuplicate, requestedCount } = response.data;

      let message = "";
      if (insertedCount > 0) {
        message += `Successfully added ${insertedCount} student(s) to the course.`;
      }
      if (skippedAsDuplicate > 0) {
        message += ` ${skippedAsDuplicate} student(s) were already in the course.`;
      }

      alert(message || `Processed ${requestedCount} student(s).`);

      // Refresh the student list to show new additions
      await fetchStudents();

      // Close the modal
      setOpenCreate(false);

    } catch (error: any) {
      console.error("Error adding students to course:", error);

      // Show error message
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to add students to course";
      alert(`Error: ${errorMessage}`);
    } finally {
      setAddingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  // Fetch available students when modal opens
  useEffect(() => {
    if (openCreate && courseId) {
      fetchStudentNotInCourse(courseId);
    }
  }, [openCreate, courseId]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const deleteSelectedStudents = async () => {
    try {
      const selectedIds = Object.keys(selected)
        .filter(id => selected[Number(id)])

      if (selectedIds.length === 0) {
        alert("Please select advisors to delete");
        return;
      }

      const selectedStudents = rows.filter(student => selectedIds.includes(student.id));
      const studentNames = selectedStudents.map(s =>
        [s.user?.name].filter(Boolean).join(" ") || `ID: ${s.id}`
      );

      const confirmMessage = `Are you sure you want to remove ${selectedIds.length} student(s) from this course?\n\n${studentNames.join(", ")}`;

      if (!confirm(confirmMessage)) {
        return;
      }

      setDeletingStudent(true);

      const courseIdNum = Number(courseId);
      if (!courseIdNum || isNaN(courseIdNum)) {
        throw new Error("Invalid course ID");
      }

      console.log("Deleting students from course:", {
        courseId: courseIdNum,
        studentIds: selectedIds,
        selectedStudents
      });

      // TODO: Replace with actual delete API call when available
      // const response = await deleteCourseMemberAPI(courseIdNum, selectedIds);

      // Mock API call - replace this with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert(`Successfully removed ${selectedIds.length} advisor(s) from the course.`);

      // Clear selection
      setSelected({});

      // Refresh the advisor list
      await fetchStudents();

    } catch (error: any) {
      console.error("Error deleting advisors from course:", error);

      let errorMessage = "Failed to remove advisors from course";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setDeletingStudent(false);
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Selected file:", file.name, file.type, file.size);
    e.target.value = "";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
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

  const toggleOne = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <section className="min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}
            disabled={addingStudents} // Disable while adding students
          >
            <Plus className="w-4 h-4" />
            {addingStudents ? "Adding..." : "Add"}
          </button>

          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={handleUploadClick}
          >
            <Upload className="w-4 h-4" />
            Upload excel
          </button>

          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => alert("TODO: download template")}
          >
            <Download className="w-4 h-4" />
            Download template
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
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="accent-[#326295] cursor-pointer"
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
                      aria-label={`Select ${r.user?.name || 'student'}`}
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={() => toggleOne(r.id)}
                      className="accent-[#326295] cursor-pointer"
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
                    <button onClick={() => alert(`TODO: delete ${r.user?.name || 'student'}`)} className="text-red-500 hover:underline text-lg">Delete</button>
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
            className="inline-flex items-center gap-1 px-3 py-1 text-lg text-red-600  rounded bordertransition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={deleteSelectedStudents}
            disabled={addingStudents || deletingStudent}
          >
            {deletingStudent ? "Removing..." : `Delete`}
          </button>
        )}
      </div>

      {openCreate && (
        <AddStudentModal
          availableStudents={studentNotInCourse}
          loading={loadingAvailable}
          adding={addingStudents} // Pass adding state to modal
          onCancel={() => setOpenCreate(false)}
          onSave={addStudentsToCourse} // Use the real API function
        />
      )}
    </section>
  );
}

function AddStudentModal({
  availableStudents,
  loading,
  adding,
  onCancel,
  onSave,
}: {
  availableStudents: studentNotInCourse[];
  loading: boolean;
  adding: boolean; // New prop for adding state
  onCancel: () => void;
  onSave: (students: studentNotInCourse[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});

  const safeAvailableStudents = Array.isArray(availableStudents) ? availableStudents : [];

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return safeAvailableStudents;
    return safeAvailableStudents.filter(student =>
      student.id.toString().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  }, [searchQuery, safeAvailableStudents]);

  const allSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents[s.id]);
  const someSelected = filteredStudents.some(s => selectedStudents[s.id]) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedStudents({});
    } else {
      const newSelected: Record<string, boolean> = {};
      filteredStudents.forEach(s => newSelected[s.id] = true);
      setSelectedStudents(newSelected);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const selected = safeAvailableStudents.filter(s => selectedStudents[s.id]);
    onSave(selected);
  };

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !adding && onCancel(); // Prevent closing while adding
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
                          <td className="py-3 pl-4">
                            <input
                              type="checkbox"
                              checked={!!selectedStudents[student.id]}
                              onChange={() => toggleStudent(student.id)}
                              className="accent-[#326295] cursor-pointer"
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