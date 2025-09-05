"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Search, X } from "lucide-react";
import { getAdvisorMemberAPI } from "@/api/courseMember/getAdvisorMembers";
import { getAdvisorMember } from "@/types/api/courseMember";
import { useSearchParams } from "next/navigation";

// Mock data for available advisors
const mockAvailableAdvisors = [
  { id: 1, prefix: "Asst.Prof.Dr.", name: "Jane", surname: "Smith", email: "jane.smith@mail.kmutt.ac.th" },
  { id: 2, prefix: "Prof.Dr.", name: "John", surname: "Wilson", email: "john.wilson@mail.kmutt.ac.th" },
  { id: 3, prefix: "Dr.", name: "Sarah", surname: "Johnson", email: "sarah.johnson@mail.kmutt.ac.th" },
  { id: 4, prefix: "Asst.Prof.", name: "Michael", surname: "Brown", email: "michael.brown@mail.kmutt.ac.th" },
  { id: 5, prefix: "Prof.", name: "Emily", surname: "Davis", email: "emily.davis@mail.kmutt.ac.th" },
];

export default function AdvisorTab() {
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<getAdvisorMember.AdvisorMember>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const courseId = searchParams.get("courseId") || "";

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = parseInt(courseId);
        if (!courseId || isNaN(id)) {
          throw new Error("No course selected. Please select a course first.");
        }

        const { data } = await getAdvisorMemberAPI(id);
        setRows(data || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load advisors");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [courseId]);

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
    return rows.filter(
      (r) =>
        r.user?.prefix?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.surname?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.projects.some((p) => p.projectName?.toLowerCase().includes(q))
    );
  }, [query, rows]);

  const allChecked = filtered.length > 0 && filtered.every((a) => a.id != null && selected[a.id]);

  const toggleAll = () => {
    if (allChecked) setSelected({});
    else {
      const next: Record<number, boolean> = {};
      filtered.forEach((r) => {
        if (r.id != null) {
          next[r.id] = true;
        }
      });
      setSelected(next);
    }
  };

  const toggleOne = (id: number) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <section className="min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-4 h-4" />
            Add
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
          </div>
        ) : (
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
                    <input
                      type="checkbox"
                      checked={!!(r.id != null && selected[r.id])}
                      onChange={() => r.id != null && toggleOne(r.id)}
                      className="accent-[#326295]"
                    />
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">{r.user?.prefix || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {[r.user?.name, r.user?.surname].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="py-3 align-top text-gray-900 text-lg">{r.user?.email || "-"}</td>
                  <td className="py-3 align-top text-gray-900 text-lg">
                    {(r.projects ?? []).length ? (
                      <ol className="list-decimal ml-4 space-y-0.5">
                        {(r.projects ?? []).map((p, i) => (
                          <li key={p.id ?? `${r.id}-${i}`}>{p.projectName || "(untitled)"}</li>
                        ))}
                      </ol>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="py-3 pr-4 align-top text-right whitespace-nowrap">
                    {/* <Link href="#" className="text-[#326295] hover:underline mr-4 text-lg">Detail</Link> */}
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
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
        <div>{Object.values(selected).filter(Boolean).length} selected</div>
      </div>

      {openCreate && (
        <AddAdvisorModal
          availableAdvisors={mockAvailableAdvisors}
          onCancel={() => setOpenCreate(false)}
          onSave={(selectedAdvisors) => {
            const id = parseInt(courseId);
            if (!courseId || isNaN(id)) return;

            const newAdvisors: getAdvisorMember.AdvisorMember = selectedAdvisors.map(advisor => ({
              id: Date.now() + advisor.id,
              courseId: id,
              user: {
                id: advisor.id,
                email: advisor.email,
                passwordHash: "",
                prefix: advisor.prefix,
                name: advisor.name,
                surname: advisor.surname,
                role: "ADVISOR" as const,
                createdAt: new Date().toISOString(),
              },
              projects: [],
            }));

            setRows((prev) => [...newAdvisors, ...prev]);
            setOpenCreate(false);
          }}
        />
      )}
    </section>
  );
}

/* ------------------------- Add Advisor Modal ------------------------- */
function AddAdvisorModal({
  availableAdvisors,
  onCancel,
  onSave,
}: {
  availableAdvisors: typeof mockAvailableAdvisors;
  onCancel: () => void;
  onSave: (advisors: typeof mockAvailableAdvisors) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvisors, setSelectedAdvisors] = useState<Record<number, boolean>>({});

  const filteredAdvisors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableAdvisors;
    return availableAdvisors.filter(advisor =>
      advisor.prefix.toLowerCase().includes(q) ||
      advisor.name.toLowerCase().includes(q) ||
      advisor.surname.toLowerCase().includes(q) ||
      advisor.email.toLowerCase().includes(q)
    );
  }, [searchQuery, availableAdvisors]);

  const allSelected = filteredAdvisors.length > 0 && filteredAdvisors.every(a => selectedAdvisors[a.id]);
  const someSelected = filteredAdvisors.some(a => selectedAdvisors[a.id]) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedAdvisors({});
    } else {
      const newSelected: Record<number, boolean> = {};
      filteredAdvisors.forEach(a => newSelected[a.id] = true);
      setSelectedAdvisors(newSelected);
    }
  };

  const toggleAdvisor = (id: number) => {
    setSelectedAdvisors(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const selected = availableAdvisors.filter(a => selectedAdvisors[a.id]);
    onSave(selected);
  };

  const selectedCount = Object.values(selectedAdvisors).filter(Boolean).length;

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
            <h2 className="text-2xl font-semibold">Add Advisors</h2>
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
                placeholder="Search advisors..."
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
                    <th className="py-3 text-lg">Prefix</th>
                    <th className="py-3 text-lg">Name</th>
                    <th className="py-3 text-lg">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdvisors.map((advisor) => (
                    <tr key={advisor.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          checked={!!selectedAdvisors[advisor.id]}
                          onChange={() => toggleAdvisor(advisor.id)}
                          className="accent-[#326295] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-gray-900">{advisor.prefix}</td>
                      <td className="py-3 text-gray-900">{advisor.name} {advisor.surname}</td>
                      <td className="py-3 text-gray-900">{advisor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCount > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                {selectedCount} advisor{selectedCount === 1 ? '' : 's'} selected
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
              Add {selectedCount} Advisor{selectedCount === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}