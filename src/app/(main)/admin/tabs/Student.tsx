"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X } from "lucide-react";

export type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  projectName?: string;
  productName?: string;
};

const DATA: Student[] = [
  { id: "s1", studentId: "65130500211", name: "Navin Dansakul", email: "Navin.dans@mail.kmutt.ac.th", projectName: "Capstone Report Submission System", productName: "Twomandown" },
  { id: "s2", studentId: "65130500241", name: "Mananchai Chankhuong", email: "Mananchai.chan@mail.kmutt.ac.th", projectName: "Capstone Report Submission System", productName: "Twomandown" },
  { id: "s3", studentId: "65130500280", name: "Thanapat Thanatawee", email: "Thanapat.than@mail.kmutt.ac.th", projectName: "Capstone Report Submission System", productName: "Boklane" },
  { id: "s4", studentId: "65130500299", name: "Cristiano Ronaldo", email: "Cristiano.ronaldo@mail.kmutt.ac.th", projectName: "Capstone Report Submission System", productName: "SecureDocs" },
];

export default function StudentTab() {
  // use state so we can add new students
  const [rows, setRows] = useState<Student[]>(DATA);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [openCreate, setOpenCreate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // attach + log (same behavior as advisor page)
    console.log("Selected file:", file.name, file.type, file.size);
    e.target.value = ""; // reset so same file triggers again
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.studentId, r.name, r.email, r.projectName ?? "", r.productName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, rows]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected[r.id]);
  const someChecked = filtered.some((r) => selected[r.id]) && !allChecked;

  const toggleAll = () => {
    if (allChecked) return setSelected({});
    const next: Record<string, boolean> = { ...selected };
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

          {/* hidden file input like advisor page */}
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
                    aria-label={`Select ${r.name}`}
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={() => toggleOne(r.id)}
                    className="accent-[#326295] cursor-pointer"
                  />
                </td>
                <td className="py-3 align-top text-gray-900 text-lg whitespace-nowrap">{r.studentId}</td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.name}</td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.email}</td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.projectName || <span className="text-gray-400">-</span>}</td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.productName || <span className="text-gray-400">-</span>}</td>
                <td className="py-3 pr-4 align-top text-right whitespace-nowrap">
                  <Link href="#" className="text-[#326295] hover:underline mr-4 text-lg">Detail</Link>
                  <button onClick={() => alert(`TODO: delete ${r.name}`)} className="text-red-500 hover:underline text-lg">Delete</button>
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
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
        <div>{Object.values(selected).filter(Boolean).length} selected</div>
      </div>

      {/* Add Student Modal */}
      {openCreate && (
        <CreateStudentModal
          onCancel={() => setOpenCreate(false)}
          onSave={(s) => {
            setRows((prev) => [{ ...s, id: `s_${Date.now()}` }, ...prev]);
            setOpenCreate(false);
          }}
        />
      )}
    </section>
  );
}

/* ========================== Create Student Modal ========================== */

function CreateStudentModal({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (s: Omit<Student, "id">) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [productName, setProductName] = useState("");

  const canSave =
    studentId.trim().length > 0 &&
    name.trim().length > 0 &&
    email.trim().length > 0;

  // close on Esc & outside click
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

  const handleSave = () => {
    onSave({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
      projectName: projectName.trim() || undefined,
      productName: productName.trim() || undefined,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div ref={panelRef} className="w-full max-w-xl rounded-2xl border bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Create Student</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* body */}
          <div className="px-6 py-5 space-y-4">
            <Field label="Student ID" required>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="6513xxxxxxx"
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </Field>

            <Field label="Name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </Field>

            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mail.kmutt.ac.th"
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </Field>

            <Field label="Project name">
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Capstone Report Submission System"
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </Field>

            <Field label="Product name">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Twomandown"
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
            </Field>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button onClick={onCancel} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded px-5 py-2 text-white disabled:opacity-60 shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* --------------------------- Small Field UI --------------------------- */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-lg font-semibold text-gray-900">
        {label}
        {required && <span className="text-red-500 pl-0.5">*</span>}
      </div>
      {children}
    </label>
  );
}
