"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Search, UserPlus, Pencil } from "lucide-react";
import { getAllUsersAPI } from "@/api/user/getAllUser";
import type { getAllUsers } from "@/types/api/user";
import Navbar from "@/components/navbar";
import { createStaffUserAPI } from "@/api/setting/createStaffUser";
import { createLecturerUserAPI } from "@/api/setting/createLecturerUser";
import { createSolarLecturerUserAPI } from "@/api/setting/createSolarLecturerUser";
import { fetchStudentDataAPI } from "@/api/setting/fetchStudentData";
import { fetchStudentData } from "@/types/api/setting";
import { updateStfAndLecApi } from "@/api/setting/updateStfAndLec";
import { updateUserStatusApi } from "@/api/setting/updateUserStatus";
import { ToastProvider, useToast } from "@/components/toast";

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
type SortKey = "id" | "name" | "role" | "program" | "createdAt";
type SortDir = "asc" | "desc";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [users, setUsers] = useState<getAllUsers.Response["users"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [program, setProgram] = useState<ProgramFilter>("ALL");
  const [studentYearFilter, setStudentYearFilter] = useState<string>("");
  const [course, setCourse] = useState<string | "ALL">("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addProgram, setAddProgram] = useState<"CS" | "DSI">("CS");
  const [addRole, setAddRole] = useState<"STAFF" | "LECTURER" | "SOLAR_LECTURER">("STAFF");
  const [creating, setCreating] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<fetchStudentData.data[]>([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<"ACTIVE" | "INACTIVE" | "GRADUATED">("ACTIVE");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const selectedUsers = useMemo(() => users.filter((u) => selected.has(u.id)), [users, selected]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editProgram, setEditProgram] = useState<"CS" | "DSI">("CS");
  const [editRole, setEditRole] = useState<
    "student" | "staff" | "lecturer" | "advisor" | "admin" | "super_admin" | "solar_lecturer"
  >("staff");
  const [editIsStudent, setEditIsStudent] = useState(false);
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE" | "GRADUATED">("ACTIVE");
  const lockProgramRole = editIsStudent || ["staff", "lecturer", "solar_lecturer"].includes(String(editRole).toLowerCase());

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

  const serverToUIStatus = (s?: string | null) => {
    if (!s) return "ACTIVE";
    const up = String(s).toUpperCase();
    if (up === "ACTIVE") return "ACTIVE";
    if (up === "GRADUATED") return "GRADUATED";
    if (["RESIGNED", "RETIRED", "INACTIVE"].includes(up)) return "INACTIVE";
    return up;
  };
  const uiToServerStatus = (ui: string) => {
    const u = String(ui).toUpperCase();
    if (u === "ACTIVE") return "ACTIVE";
    if (u === "GRADUATED") return "GRADUATED";
    if (u === "INACTIVE") {
      return "INACTIVE";
    }
    return u;
  };

  const allowedForRole = (r: string) => {
    const k = (r || "").toLowerCase();
    if (k === "student") return ["ACTIVE", "GRADUATED"];
    if (["staff", "lecturer", "advisor", "solar_lecturer"].includes(k)) return ["ACTIVE", "INACTIVE"];
    return ["ACTIVE"];
  };

  const commonAllowedStatuses = useMemo(() => {
    if (selectedUsers.length === 0) return ["ACTIVE", "INACTIVE", "GRADUATED"];
    let common = new Set(allowedForRole(selectedUsers[0].role));
    for (let i = 1; i < selectedUsers.length; i++) {
      const s = new Set(allowedForRole(selectedUsers[i].role));
      common = new Set(Array.from(common).filter((x) => s.has(x)));
    }
    return Array.from(common);
  }, [selectedUsers]);

  useEffect(() => {
    if (!commonAllowedStatuses.includes(bulkStatus)) {
      setBulkStatus((commonAllowedStatuses[0] ?? "ACTIVE") as "ACTIVE" | "INACTIVE" | "GRADUATED");
    }
  }, [commonAllowedStatuses, bulkStatus]);

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
    const yearFilter = studentYearFilter.trim();
    const mapUiToApiRole = (r: RoleFilter) => {
      if (r === "LECTURER") return "lecturer";
      if (r === "SOLAR_LECTURER") return "advisor";
      if (r === "STAFF") return "staff";
      if (r === "STUDENT") return "student";
      if (r === "ADMIN") return "admin";
      if (r === "SUPER_ADMIN") return "super_admin";
      return "ALL";
    };
    return users
      .filter((u) => {
        const matchYear = role === "STUDENT" && yearFilter ? String(u.id || "").startsWith(yearFilter) : true;
        const matchText =
          !text ||
          u.name?.toLowerCase().includes(text) ||
          u.email?.toLowerCase().includes(text) ||
          u.id?.toLowerCase().includes(text);
        const apiRoleTarget = mapUiToApiRole(role);
        const matchRole = role === "ALL" ? true : u.role.toLowerCase() === apiRoleTarget;
        const roleUsesProgramFilter = role === "STUDENT" || role === "LECTURER";
        const matchProgram = roleUsesProgramFilter
          ? program === "ALL"
            ? true
            : String(u.program || "").toLowerCase() === program.toLowerCase()
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
        return matchText && matchRole && matchProgram && matchCourse && matchYear;
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
                : sortKey === "id"
                  ? (a.id || "").toLowerCase()
                  : (a.name || "").toLowerCase();
        const vb =
          sortKey === "createdAt"
            ? new Date(b.createdAt || 0).getTime()
            : sortKey === "program"
              ? (b.program || "").toLowerCase()
              : sortKey === "role"
                ? (b.role || "").toLowerCase()
                : sortKey === "id"
                  ? (b.id || "").toLowerCase()
                  : (b.name || "").toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
  }, [users, q, role, program, course, sortKey, sortDir, hasCourseField, studentYearFilter]);

  useEffect(() => {
    setPage(1);
  }, [q, role, program, course, sortKey, sortDir, studentYearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [q, role, program, course, sortKey, sortDir]);

  const isAllSelectedOnPage = pageItems.length > 0 && pageItems.every((u) => selected.has(u.id));

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const s = new Set(prev);
      const allSelected = pageItems.length > 0 && pageItems.every((u) => prev.has(u.id));
      if (allSelected) {
        pageItems.forEach((u) => s.delete(u.id));
      } else {
        pageItems.forEach((u) => s.add(u.id));
      }
      return s;
    });
  };

  useEffect(() => {
    setSelected((prev) => {
      const s = new Set<string>();
      const ids = new Set(users.map((u) => u.id));
      prev.forEach((id) => {
        if (ids.has(id)) s.add(id);
      });
      return s;
    });
  }, [users]);

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
      showToast({ variant: "error", message: "Please select a .csv, .xls, or .xlsx file." });
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      showToast({ variant: "info", message: `Add Students (stub): ${f.name}` });
      e.target.value = "";
      await fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed";
      showToast({ variant: "error", message: String(msg) });
    } finally {
      setUploading(false);
    }
  };

  const onCreate = async () => {
    if (!addName.trim() || !addEmail.trim()) {
      showToast({ variant: "error", message: "Please fill name and email" });
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
      showToast({ variant: "success", message: "User created" });
      await fetchUsers();
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.message || "Create failed";
      showToast({ variant: "error", message: String(serverMsg) });
    } finally {
      setCreating(false);
    }
  };

  const getStatusOptions = (r: string) => {
    const k = (r || "").toLowerCase();
    if (k === "student") return ["ACTIVE", "GRADUATED"];
    if (["staff", "lecturer", "advisor", "solar_lecturer"].includes(k)) return ["ACTIVE", "INACTIVE"];
    return ["ACTIVE"];
  };

  const openEdit = (u: any) => {
    setEditUserId(u.id);
    setEditName(u.name || "");
    setEditEmail(u.email || "");
    setEditProgram((u.program && (u.program === "CS" || u.program === "DSI") ? u.program : "CS") as "CS" | "DSI");
    const r = (u.role || "").toLowerCase();
    setEditRole((r as any) || "staff");
    setEditIsStudent(r === "student");
    setEditStatus(serverToUIStatus(u.status) as "ACTIVE" | "INACTIVE" | "GRADUATED");
    setEditOpen(true);
  };

  const refreshEditUser = async () => {
    if (!editUserId) return;
    try {
      setLoading(true);
      await fetchUsers();
      const updated =
        users.find((x) => x.id === editUserId) ??
        (await getAllUsersAPI()).users?.find((x) => x.id === editUserId);
      if (updated) {
        setEditName(updated.name || "");
        setEditEmail(updated.email || "");
        setEditProgram((updated.program === "CS" || updated.program === "DSI") ? updated.program : "CS");
        const r = (updated.role || "").toLowerCase();
        setEditRole((r as any) || "staff");
        setEditIsStudent(r === "student");
        setEditStatus(serverToUIStatus(updated.status) as "ACTIVE" | "INACTIVE" | "GRADUATED");
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const onSaveEdit = async () => {
    if (!editUserId) return;
    if (!editIsStudent && (!editName.trim() || !editEmail.trim())) {
      showToast({ variant: "error", message: "Please fill name and email" });
      return;
    }
    try {
      setEditing(true);

      if (!editIsStudent) {
        try {
          await updateStfAndLecApi(editUserId, editName.trim(), editEmail.trim());
        } catch (apiErr: any) {
          const msg = apiErr?.response?.data?.message || apiErr?.message || "Failed to update user";
          showToast({ variant: "error", message: String(msg) });
          return;
        }
      }

      try {
        const serverStatus = uiToServerStatus(editStatus);
        await updateUserStatusApi([editUserId], serverStatus as any);
      } catch (statusErr: any) {
        const msg = statusErr?.response?.data?.message || statusErr?.message || "Failed to update status";
        showToast({ variant: "error", message: String(msg) });
        return;
      }

      setEditOpen(false);
      setEditUserId(null);
      await fetchUsers();
  showToast({ variant: "success", message: "User updated" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Update failed";
      showToast({ variant: "error", message: String(msg) });
    } finally {
      setEditing(false);
    }
  };

  const badge = (r: string) => {
    const k = r.toLowerCase();
    if (k === "student") return "border-teal-300 bg-teal-50 text-teal-700";
    if (k === "staff") return "border-violet-300 bg-violet-50 text-violet-700";
    if (k === "lecturer") return "border-blue-300 bg-blue-50 text-blue-700";
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
            <h1 className="text-4xl font-semibold">User Management</h1>
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
              Sync Students
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

              {(role === "STUDENT" || role === "LECTURER") && (
                <>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value as ProgramFilter)}
                    className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="ALL">All Programs</option>
                    <option value="CS">CS</option>
                    <option value="DSI">DSI</option>
                  </select>
                  {role === "STUDENT" && (
                    <input
                      value={studentYearFilter}
                      onChange={(e) => setStudentYearFilter(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="Academic year (e.g. 65)"
                      className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                      style={{ width: 160 }}
                    />
                  )}
                </>
              )}

              {hasCourseField && (
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value as any)}
                  className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="ALL">All Courses</option>
                  {courseOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortKey}
                onChange={(e) => {
                  const key = e.target.value as SortKey;
                  setSortKey(key);
                  if (key === "name" || key === "id") setSortDir("asc");
                  else setSortDir("desc");
                }}
                className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="id">Sorted By: ID</option>
                <option value="name">Sorted By: Fullname</option>
                <option value="createdAt">Sorted By: Created At</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as SortDir)}
                className="rounded-2xl border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-0 shadow-sm overflow-hidden">
          {selected.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-4 border-b bg-white">
              <div className="text-lg">{selected.size} selected</div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() => setSelected(new Set())}
                  className="rounded-xl border px-4 py-2 text-lg"
                >
                  Cancel
                </button>

                {commonAllowedStatuses.length === 0 ? (
                  <div className="text-sm text-red-600">Selected users have incompatible roles — cannot bulk-change status.</div>
                ) : (
                  <>
                    <select
                      value={bulkStatus}
                      onChange={(e) => {
                        const v = e.target.value as any;
                        if (!commonAllowedStatuses.includes(v)) {
                          showToast({ variant: "error", message: "Selected users do not allow this status. Pick another." });
                          return;
                        }
                        setBulkStatus(v);
                      }}
                      className="rounded-xl border px-3 py-2"
                    >
                      {commonAllowedStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (selected.size === 0) return;
                        if (!commonAllowedStatuses.includes(bulkStatus)) {
                          showToast({ variant: "error", message: "Cannot apply this status to the selected users." });
                          return;
                        }
                        if (!confirm(`Apply status "${bulkStatus}" to ${selected.size} users?`)) return;
                        try {
                          setBulkUpdating(true);
                          const serverStatus = uiToServerStatus(bulkStatus);
                          await updateUserStatusApi(Array.from(selected), serverStatus as any);
                          await fetchUsers();
                          setSelected(new Set());
                        } catch (err: any) {
                          const msg = err?.response?.data?.message || err?.message || "Failed to update status";
                          showToast({ variant: "error", message: String(msg) });
                        } finally {
                          setBulkUpdating(false);
                        }
                      }}
                      disabled={bulkUpdating}
                      className="rounded-xl bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white px-4 py-2"
                    >
                      {bulkUpdating ? "Saving…" : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50 text-left text-2xl text-gray-700">
                <tr>
                  <th className="px-4 py-5">
                    <input
                      type="checkbox"
                      checked={isAllSelectedOnPage}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 accent-[#326295]"
                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="px-6 py-5">ID</th>
                  <th className="px-6 py-5">Fullname</th>
                  <th className="px-6 py-5">Email</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Program</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Created At</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {loading && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      Loading users…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && pageItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  pageItems.map((u) => {
                    const uiStatus = serverToUIStatus(u.status);
                    return (
                      <tr key={u.id} className="border-t hover:bg-gray-50/60 text-xl">
                        <td className="px-4 py-5 align-top">
                          <input
                            type="checkbox"
                            checked={selected.has(u.id)}
                            onChange={() => toggleRow(u.id)}
                            className="h-4 w-4 accent-[#326295]"
                            aria-label={`Select user ${u.id}`}
                          />
                        </td>
                        <td className="px-6 py-5 align-top">{u.id}</td>
                        <td className="px-6 py-5 align-top">
                          <div>{u.name || "—"}</div>
                        </td>
                        <td className="px-6 py-5 align-top">{u.email || "—"}</td>
                        <td className="px-6 py-5 align-top">
                          <span className={cx("inline-flex rounded-full border px-3 py-1", badge(u.role))}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top">{u.program || "—"}</td>
                        <td className="px-6 py-5 align-top">
                          {uiStatus ? (
                            <span
                              className={cx(
                                "text-md font-medium",
                                uiStatus === "ACTIVE" ? "text-[#4CBB17]" : "text-red-600"
                              )}
                            >
                              {uiStatus}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-5 align-top">{formatDate(u.createdAt)}</td>
                        <td className="px-6 py-5 align-top text-right">
                          <button
                            title="Edit"
                            className="inline-flex items-center justify-center rounded-md border bg-white p-2 text-gray-600 hover:bg-gray-50 cursor-pointer"
                            onClick={() => openEdit(u)}
                            aria-label={`Edit ${u.id}`}
                          >
                            <Pencil className="h-4 w-6" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!loading && !error && filtered.length > 0 && (
            <div className="flex items-center justify-center border-t p-5 text-lg">
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

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">{editIsStudent ? "View Student" : "Edit User"}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-left mb-1">Name</label>
                {editIsStudent ? (
                  <div className="w-full rounded-xl border px-3 py-2 bg-gray-50 text-gray-700">
                    {editName || "—"}
                  </div>
                ) : (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-left mb-1">Email</label>
                {editIsStudent ? (
                  <div className="w-full rounded-xl border px-3 py-2 bg-gray-50 text-gray-700">
                    {editEmail || "—"}
                  </div>
                ) : (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-left mb-1">Program</label>
                <div className="w-full rounded-xl border px-3 py-2 bg-gray-50 text-gray-700">
                  {editProgram}
                </div>
              </div>

              <div>
                <label className="block text-left mb-1">Role</label>
                <div className="w-full rounded-xl border px-3 py-2 bg-gray-50 text-gray-700">
                  {String(editRole)
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
              </div>

              <div>
                <label className="block text-left mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none cursor-pointer"
                >
                  {getStatusOptions(editRole).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {editIsStudent && (
                <div className="text-md text-gray-600">
                  Student fields above are view-only. To update student records use the "Sync Students" button on the main page — here you may only change the student's status.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-start gap-3">
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditUserId(null);
                }}
                className="rounded-xl border px-5 py-2 text-lg cursor-pointer"
              >
                {editIsStudent ? "Close" : "Cancel"}
              </button>

              <button
                onClick={onSaveEdit}
                disabled={editing}
                className={cx(
                  "flex items-center bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-lg px-5 py-2 rounded-xl shadow hover:from-[#28517c] hover:to-[#071320] cursor-pointer",
                  editing && "opacity-50 cursor-not-allowed"
                )}
              >
                {editing ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">Sync Students by Academic Year</h2>
            <div className="mb-4">
              <label className="block mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
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
                    await fetchUsers();
                    setAddStudentOpen(false);

                    const _data: any = (res as any)?.data;
                    const count = Array.isArray(_data) ? _data.length : (_data?.length ?? 0);
                    showToast({ variant: "success", message: count > 0 ? `Synced ${count} students` : "Students synced" });
                  } catch (err: any) {
                    const msg = err?.response?.data?.message || err?.message || "Fetch failed";
                    setStudentError(msg);
                    showToast({ variant: "error", message: String(msg) });
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-6">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
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