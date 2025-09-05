"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X } from "lucide-react";
import { getStudentMemberAPI } from "@/api/courseMember/getStudentMember";
import { getStudentMember } from "@/types/api/courseMember";
import { usePathname, useSearchParams } from "next/navigation";

// Mock data for available students
const mockAvailableStudents = [
  { id: 1, studentId: "65130500201", name: "John", surname: "Doe", email: "john.doe@mail.kmutt.ac.th" },
  { id: 2, studentId: "65130500202", name: "Jane", surname: "Smith", email: "jane.smith@mail.kmutt.ac.th" },
  { id: 3, studentId: "65130500203", name: "Bob", surname: "Johnson", email: "bob.johnson@mail.kmutt.ac.th" },
  { id: 4, studentId: "65130500204", name: "Alice", surname: "Brown", email: "alice.brown@mail.kmutt.ac.th" },
  { id: 5, studentId: "65130500205", name: "Charlie", surname: "Wilson", email: "charlie.wilson@mail.kmutt.ac.th" },
];

export default function StudentTab() {
  const courseId = useSearchParams().get("courseId") || "";
  const [rows, setRows] = useState<getStudentMember.StudentMember>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = parseInt(courseId);
        if (!courseId || isNaN(id)) {
          throw new Error("No course selected. Please select a course first.");
        }

        const { data } = await getStudentMemberAPI(id);
        setRows(data || []);
      } catch (e: any) {
        console.error("Error fetching students:", e);
        setError(e?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  // ...existing code for handleUploadClick, handleFileSelect, filtered, toggleAll, toggleOne...

  const handleUploadClick = () => fileInputRef.current?.click();

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
    const next: Record<number, boolean> = {};
    filtered.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };

  const toggleOne = (id: number) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <section className="min-h-[60vh]">
      {/* ...existing JSX for buttons, search, table... */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-4 h-4" />
            Add
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
                    {[r.user?.name, r.user?.surname].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">{r.user?.email || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.groupMembers?.[0]?.group?.projectName || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {r.groupMembers?.[0]?.group?.productName || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-3 pr-4 align-top text-right whitespace-nowrap">
                    {/* <Link href="#" className="text-[#326295] hover:underline mr-4 text-lg">Detail</Link> */}
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
        <div>{Object.values(selected).filter(Boolean).length} selected</div>
      </div>

      {openCreate && (
        <AddStudentModal
          availableStudents={mockAvailableStudents}
          onCancel={() => setOpenCreate(false)}
          onSave={(selectedStudents) => {
            const id = parseInt(courseId);
            if (!courseId || isNaN(id)) return;
            
            const newStudents: getStudentMember.StudentMember = selectedStudents.map(student => ({
              id: Date.now() + student.id,
              courseId: id,
              userId: student.id,
              user: {
                id: student.id,
                email: student.email,
                passwordHash: "",
                prefix: "",
                name: student.name,
                surname: student.surname,
                role: "STUDENT" as const,
                createdAt: new Date().toISOString(),
              },
              groupMembers: [],
            }));
            
            setRows((prev) => [...newStudents, ...prev]);
            setOpenCreate(false);
          }}
        />
      )}
    </section>
  );
}

/* ========================== Add Student Modal ========================== */

function AddStudentModal({
  availableStudents,
  onCancel,
  onSave,
}: {
  availableStudents: typeof mockAvailableStudents;
  onCancel: () => void;
  onSave: (students: typeof mockAvailableStudents) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Record<number, boolean>>({});

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableStudents;
    return availableStudents.filter(student =>
      student.studentId.toLowerCase().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.surname.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  }, [searchQuery, availableStudents]);

  const allSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents[s.id]);
  const someSelected = filteredStudents.some(s => selectedStudents[s.id]) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedStudents({});
    } else {
      const newSelected: Record<number, boolean> = {};
      filteredStudents.forEach(s => newSelected[s.id] = true);
      setSelectedStudents(newSelected);
    }
  };

  const toggleStudent = (id: number) => {
    setSelectedStudents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const selected = availableStudents.filter(s => selectedStudents[s.id]);
    onSave(selected);
  };

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onCancel();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onCancel]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div ref={panelRef} className="w-full max-w-4xl rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Add Students</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
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
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </div>

            <div className="overflow-x-auto rounded border bg-white max-h-96">
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
                      />
                    </th>
                    <th className="py-3 text-lg">Student ID</th>
                    <th className="py-3 text-lg">Name</th>
                    <th className="py-3 text-lg">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={!!selectedStudents[student.id]}
                          onChange={() => toggleStudent(student.id)}
                          className="accent-[#326295] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-gray-900">{student.studentId}</td>
                      <td className="py-3 text-gray-900">{student.name} {student.surname}</td>
                      <td className="py-3 text-gray-900">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCount > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                {selectedCount} student{selectedCount === 1 ? '' : 's'} selected
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button onClick={onCancel} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedCount === 0}
              className="rounded px-5 py-2 text-white disabled:opacity-60 shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            >
              Add {selectedCount} Student{selectedCount === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}