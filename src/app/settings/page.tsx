"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Search, UserPlus } from "lucide-react";
import { getAllUsersAPI } from "@/api/user/getAllUser";
import type { getAllUsers } from "@/types/api/user";
import Navbar from "@/components/navbar";
import { createStaffUserAPI } from "@/api/setting/createStaffUser";
import { createLecturerUserAPI } from "@/api/setting/createLecturerUser";
import { createSolarLecturerUserAPI } from "@/api/setting/createSolarLecturerUser";
import { fetchStudentDataAPI } from "@/api/setting/fetchStudentData";
import { fetchStudentData } from "@/types/api/setting";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type RoleFilter =
  | "ALL"
  | "STUDENT"
  | "STAFF"
  | "LECTURER"
  | "SOLAR_LECTURER"
  | "ADMIN"
  | "SUPER_ADMIN";
type ProgramFilter = "ALL" | "CS" | "DSI";
type SortKey = "name" | "role" | "program" | "createdAt";
type SortDir = "asc" | "desc";

export default function SettingsPage() {
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<getAllUsers.Response["users"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [program, setProgram] = useState<ProgramFilter>("ALL");
  const [course, setCourse] = useState<string | "ALL">("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addProgram, setAddProgram] = useState("");
  const [addRole, setAddRole] = useState<"STAFF" | "LECTURER" | "SOLAR_LECTURER">("STAFF");
  const [creating, setCreating] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<fetchStudentData.data[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsersAPI();
      setUsers(data.users ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const hasCourseField = useMemo(() => {
    return users.some((u: any) => "courseId" in u || ("course" in u && u.course && (u.course.id || u.course.name)));
  }, [users]);

  const courseOptions = useMemo(() => {
    const set = new Map<string, string>();
    users.forEach((u: any) => {
      if ("courseId" in u && u.courseId) set.set(String(u.courseId), String(u.courseId));
      if ("course" in u && u.course) {
        const id = u.course.id ? String(u.course.id) : "";
        const name = u.course.name ? String(u.course.name) : id || "";
        if (id || name) set.set(id || name, name);
      }
    });
    return Array.from(set.entries()).map(([value, label]) => ({ value, label }));
  }, [users]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const mapUiToApi = (r: RoleFilter) => {
      if (r === "LECTURER") return "advisor";
      if (r === "SOLAR_LECTURER") return "advisor";
      if (r === "STAFF") return "staff";
      if (r === "STUDENT") return "student";
      if (r === "ADMIN") return "admin";
      if (r === "SUPER_ADMIN") return "super_admin";
      return "ALL";
    };
    return users
      .filter((u) => {
        const matchText =
          !text ||
          u.name?.toLowerCase().includes(text) ||
          u.email?.toLowerCase().includes(text) ||
          u.id?.toLowerCase().includes(text) ||
          u.role?.toLowerCase().includes(text) ||
          u.program?.toLowerCase().includes(text);
        const apiRoleTarget = mapUiToApi(role);
        const matchRole = role === "ALL" ? true : u.role.toLowerCase() === apiRoleTarget;
        const matchProgram =
          role === "STUDENT"
            ? program === "ALL"
              ? true
              : (u.program || "").toLowerCase() === program.toLowerCase()
            : true;
        const matchCourse =
          !hasCourseField || course === "ALL"
            ? true
            : (() => {
              const anyU: any = u as any;
              if ("courseId" in anyU && anyU.courseId) return String(anyU.courseId) === course;
              if ("course" in anyU && anyU.course) {
                const id = anyU.course.id ? String(anyU.course.id) : "";
                const name = anyU.course.name ? String(anyU.course.name) : id;
                return course === id || course === name;
              }
              return true;
            })();
        return matchText && matchRole && matchProgram && matchCourse;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const va =
          sortKey === "createdAt"
            ? new Date(a.createdAt || 0).getTime()
            : sortKey === "program"
              ? (a.program || "").toLowerCase()
              : sortKey === "role"
                ? (a.role || "").toLowerCase()
                : (a.name || "").toLowerCase();
        const vb =
          sortKey === "createdAt"
            ? new Date(b.createdAt || 0).getTime()
            : sortKey === "program"
              ? (b.program || "").toLowerCase()
              : sortKey === "role"
                ? (b.role || "").toLowerCase()
                : (b.name || "").toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
  }, [users, q, role, program, course, sortKey, sortDir, hasCourseField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [q, role, program, course, sortKey, sortDir]);

  const onAddStudentsClick = () => fileInputRef.current?.click();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok =
      ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].some(
        (t) => f.type === t
      ) ||
      [".csv", ".xls", ".xlsx"].some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!ok) {
      alert("Please select a .csv, .xls, or .xlsx file.");
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      alert(`Add Students (stub): ${f.name}`);
      e.target.value = "";
      await fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onCreate = async () => {
    if (!addName.trim() || !addEmail.trim()) {
      alert("Please fill name and email");
      return;
    }
    try {
      setCreating(true);

      let response;
      if (addRole === "STAFF") {
        response = await createStaffUserAPI(addEmail, addName, addProgram as "CS" | "DSI");
      } else if (addRole === "LECTURER") {
        response = await createLecturerUserAPI(addEmail, addName, addProgram as "CS" | "DSI");
      } else if (addRole === "SOLAR_LECTURER") {
        response = await createSolarLecturerUserAPI(addEmail, addName, addProgram as "CS" | "DSI");
      }

      setAddOpen(false);
      setAddName("");
      setAddEmail("");
      setAddRole("STAFF");
      setAddProgram("CS");
      await fetchUsers();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const badge = (r: string) => {
    const k = r.toLowerCase();
    if (k === "student") return "border-blue-300 bg-blue-50 text-blue-700";
    if (k === "staff") return "border-violet-300 bg-violet-50 text-violet-700";
    if (k === "advisor") return "border-amber-300 bg-amber-50 text-amber-800";
    if (k === "admin") return "border-rose-300 bg-rose-50 text-rose-700";
    if (k === "super_admin") return "border-slate-400 bg-slate-100 text-slate-800";
    return "border-gray-300 bg-gray-50 text-gray-700";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5f7fb] p-6 space-y-6 text-base sm:text-lg">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Setting</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-xl px-6 py-3 rounded-2xl shadow hover:from-[#28517c] hover:to-[#071320]"
            >
              <UserPlus className="h-6 w-6 mr-2" /> Add Staff / Lecturer
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              onClick={() => setAddStudentOpen(true)}
              className={cx(
                "flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-xl px-6 py-3 rounded-2xl shadow hover:from-[#28517c] hover:to-[#071320]"
              )}
            >
              <Upload className="h-6 w-6 mr-2" />
              Add Students
            </button>
          </div>
        </header>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="relative lg:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, id…"
                className="w-full rounded-2xl border px-12 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="flex items-center gap-3 lg:col-span-8 flex-wrap">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleFilter)}
                className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
                <option value="LECTURER">Lecturer</option>
              </select>

              {role === "STUDENT" && (
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value as ProgramFilter)}
                  className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="ALL">All programs</option>
                  <option value="CS">CS</option>
                  <option value="DSI">DSI</option>
                </select>
              )}

              {hasCourseField && (
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value as any)}
                  className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="ALL">All courses</option>
                  {courseOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="createdAt">Sorted By: Created At</option>
                <option value="name">Sorted By: Fullname</option>
                <option value="role">Sorted By: Role</option>
                <option value="program">Sorted By: Program</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50 text-left text-2xl text-gray-700">
                <tr>
                  <th className="px-6 py-5">ID</th>
                  <th className="px-6 py-5">Fullname</th>
                  <th className="px-6 py-5">Email</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Program</th>
                  <th className="px-6 py-5">Created At</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading users…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && pageItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  pageItems.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-gray-50/60 text-xl">
                      <td className="px-6 py-5 align-top">{u.id}</td>
                      <td className="px-6 py-5 align-top">
                        <div className="font-semibold">{u.name || "—"}</div>
                      </td>
                      <td className="px-6 py-5 align-top">{u.email || "—"}</td>
                      <td className="px-6 py-5 align-top">
                        <span className={cx("inline-flex rounded-full border px-3 py-1", badge(u.role))}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top">{u.program || "—"}</td>
                      <td className="px-6 py-5 align-top">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !error && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t p-5 text-lg">
              <div>
                Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span>–
                <span className="font-semibold">{Math.min(page * pageSize, filtered.length)}</span> of{" "}
                <span className="font-semibold">{filtered.length}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border px-4 py-2 disabled:opacity-50"
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span>
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl border px-4 py-2 disabled:opacity-50"
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">Add Staff / Lecturer</h2>

            {/* Left-aligned stacked form */}
            <div className="space-y-4">
              <div>
                <label className="block text-left mb-1">Name</label>
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-left mb-1">Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-left mb-1">Program</label>
                <select
                  value={addProgram}
                  onChange={(e) => setAddProgram(e.target.value as any)}
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                >
                  <option value="CS">CS</option>
                  <option value="DSI">DSI</option>
                </select>
              </div>

              <div>
                <label className="block text-left mb-1">Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as any)}
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                >
                  <option value="STAFF">Staff</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="SOLAR_LECTURER">Solar Lecturer</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-start gap-3">
              <button
                onClick={() => setAddOpen(false)}
                className="rounded-xl border px-5 py-2 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={onCreate}
                disabled={creating}
                className={cx(
                  "flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-lg px-5 py-2 rounded-xl shadow hover:from-[#28517c] hover:to-[#071320]",
                  creating && "opacity-50 cursor-not-allowed"
                )}
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">Add Students by Academic Year</h2>
            <div className="mb-4">
              <label className="block mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                placeholder="e.g. 2565"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setAddStudentOpen(false)}
                className="rounded-xl border px-5 py-2 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setStudentLoading(true);
                  setStudentError(null);
                  try {
                    const res = await fetchStudentDataAPI(academicYear);
                    setStudentData(res.data);
                    alert(`Fetched ${res.data?.length || 0} students for academic year ${academicYear}`); 
                    setAddStudentOpen(false);
                  } catch (err: any) {
                    setStudentError(err?.response?.data?.message || err?.message || "Fetch failed");
                  } finally {
                    setStudentLoading(false);
                  }
                }}
                disabled={studentLoading || !academicYear.trim()}
                className={cx(
                  "flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-lg px-5 py-2 rounded-xl shadow hover:from-[#28517c] hover:to-[#071320]",
                  studentLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {studentLoading ? "Fetching…" : "Fetch"}
              </button>
            </div>
            {studentError && <div className="mt-3 text-red-600">{studentError}</div>}
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
