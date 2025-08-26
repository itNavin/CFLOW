"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X } from "lucide-react";

type Advisor = {
  id: string;
  prefix: string;
  name: string;
  email: string;
  projects: string[];
};

const DATA: Advisor[] = [
  { id: "a1", prefix: "Asst.Prof.Dr.", name: "Chonlameth Apnikanondt", email: "Chonlamethapn@mail.kmutt.ac.th", projects: ["Spacezoo", "Location Smart System"] },
  { id: "a2", prefix: "Asst.Prof.Dr.", name: "Vithida Chongsuphajaisiddhi", email: "Vithidach@mail.kmutt.ac.th", projects: ["Capstone Report Submission System"] },
  { id: "a3", prefix: "Asst.Prof.Dr.", name: "Tuul Triyason", email: "Tuultri@mail.kmutt.ac.th", projects: ["Grab food application"] },
  { id: "a4", prefix: "Asst.Prof.Dr.", name: "Worarut Krathu", email: "Worarut@mail.kmutt.ac.th", projects: [] },
];

export default function AdvisorTab() {
  const [rows, setRows] = useState<Advisor[]>(DATA);         // ← use rows, not DATA
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openCreate, setOpenCreate] = useState(false);        // ← modal state

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // keep as-is (just attach)
    console.log("Selected file:", file.name, file.type, file.size);
    e.target.value = "";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.prefix.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.projects.some((p) => p.toLowerCase().includes(q))
    );
  }, [query, rows]);

  const allChecked = filtered.length > 0 && filtered.every((a) => selected[a.id]);

  const toggleAll = () => {
    if (allChecked) setSelected({});
    else {
      const next: Record<string, boolean> = {};
      filtered.forEach((r) => (next[r.id] = true));
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
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}                    // ← open modal
          >
            <Plus className="w-4 h-4" />
            Add
          </button>

          <button
            onClick={handleUploadClick}
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
          >
            <Upload className="w-4 h-4" />
            Upload excel
          </button>

          <button className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition">
            <Download className="w-4 h-4" />
            Download template
          </button>

          {/* hidden file input */}
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
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[#326295]" />
              </th>
              <th className="py-3 text-xl">Prefix</th>
              <th className="py-3 text-xl">Name</th>
              <th className="py-3 text-xl">Mail</th>
              <th className="py-3 text-xl">Project name</th>
              <th className="py-3 pr-4 text-right text-xl">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-3 pl-4 align-top">
                  <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleOne(r.id)} className="accent-[#326295]" />
                </td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.prefix}</td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.name}</td>
                <td className="py-3 align-top text-gray-900 text-lg">{r.email}</td>
                <td className="py-3 align-top text-gray-900 text-lg">
                  {r.projects.length ? (
                    <ol className="list-decimal ml-4 space-y-0.5">
                      {r.projects.map((p, i) => <li key={i}>{p}</li>)}
                    </ol>
                  ) : <span className="text-gray-400">-</span>}
                </td>
                <td className="py-3 pr-4 align-top text-right whitespace-nowrap">
                  <Link href="#" className="text-[#326295] hover:underline mr-4 text-lg">Detail</Link>
                  <button className="text-red-500 hover:underline text-lg">Delete</button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-lg">No advisors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
        <div>{Object.values(selected).filter(Boolean).length} selected</div>
      </div>

      {openCreate && (
        <CreateAdvisorModal
          onCancel={() => setOpenCreate(false)}
          onSave={(a) => {
            setRows((prev) => [{ ...a, id: `a_${Date.now()}` }, ...prev]);   // ← add to list
            setOpenCreate(false);
          }}
        />
      )}
    </section>
  );
}

/* ------------------------- Add Advisor Modal ------------------------- */
function CreateAdvisorModal({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (a: Omit<Advisor, "id">) => void;
}) {
  const [prefix, setPrefix] = useState("Asst.Prof.Dr.");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectsText, setProjectsText] = useState("");

  const canSave = name.trim() && email.trim();

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

  const parseProjects = (t: string) =>
    t.split(/[\n;,]+/).map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div ref={panelRef} className="w-full max-w-xl rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Add Advisor</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <Field label="Prefix">
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Asst.Prof.Dr." className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]" />
            </Field>

            <Field label="Name" required>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]" />
            </Field>

            <Field label="Email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.doe@mail.kmutt.ac.th" className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]" />
            </Field>

            <Field label="Projects (comma/semicolon/newline)">
              <textarea value={projectsText} onChange={(e) => setProjectsText(e.target.value)} rows={3} placeholder="Capstone System; DemoProject" className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295] resize-y" />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button onClick={onCancel} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">Cancel</button>
            <button
              onClick={() => onSave({ prefix: prefix.trim(), name: name.trim(), email: email.trim(), projects: parseProjects(projectsText) })}
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-lg font-semibold text-gray-900">
        {label}{required && <span className="text-red-500 pl-0.5">*</span>}
      </div>
      {children}
    </label>
  );
}
