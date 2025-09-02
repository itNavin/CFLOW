"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Download, Pencil, X } from "lucide-react";
import { getAllGroupAPI } from "@/api/group/getAllGroup";
import { getGroup } from "@/types/api/group";
import { User } from "@/types/api/user";
import { getUserById } from "@/api/user/getUserById";

/* ------------------------------- PAGE LIST ------------------------------- */
export default function GroupTab() {
  const courseId = useSearchParams().get("courseId") || "";
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<getGroup.GroupList>([]);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<getGroup.Group | null>(null);

  const fetchGroup = async () => {
    try {
      if (!courseId) return;

      const id = Number(courseId);
      if (Number.isNaN(id)) {
        setError("Invalid courseId in URL");
        return;
      }
      const response = await getAllGroupAPI(id);
      // console.log("Response:", response.data);
      setGroup(response.data);
    } catch (error) { }
  };

  useEffect(() => {
    fetchGroup();
  }, [courseId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return group;
    return group.filter(g =>
      [g.codeNumber, g.projectName, g.productName, g.company]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [group, query]);

  // const handleCreate = (g: Omit<getGroup.Group, "id" | "codeNumber">) => {
  //   setRows((prev) => [
  //     { id: `g${Date.now()}`, codeNumber: nextGroupNo, ...g },
  //     ...prev,
  //   ]);
  //   setOpenCreate(false);
  // };

  return (
    <section className="min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
          <button
            className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            onClick={() => alert("TODO: download all data")}
          >
            <Download className="w-4 h-4" />
            Download All Data
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

      <div className="space-y-5">
        {group.map((data) => (
          <article
            key={data.id}
            className="relative rounded-lg border bg-white p-5 shadow-sm"
          >
            <button
              title="Edit"
              className="absolute right-3 top-3 inline-flex items-center justify-center rounded-md border bg-white p-2 text-gray-600 hover:bg-gray-50"
              onClick={() => setEditTarget(data)}
            >
              <Pencil className="h-4 w-4" />
            </button>

            <h3 className="font-semibold text-xl text-gray-800 mb-2">{data.projectName}</h3>

            <dl className="text-sm leading-6 text-gray-700">
              <div className="grid grid-cols-[110px_1fr]">
                <dt className="text-gray-900 text-xl">ID :</dt>
                <dd className="text-xl">{data.codeNumber}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr]">
                <dt className="text-gray-900 text-xl">Project Title :</dt>
                <dd className="text-xl">{data.projectName}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr]">
                <dt className="text-gray-900 text-xl">Product Title :</dt>
                <dd className="text-xl">{data.productName}</dd>
              </div>

              <div className="grid grid-cols-[110px_1fr]">
                <dt className="text-gray-900 text-xl">Member :</dt>
                <dd>
                  <ul className="list-none space-y-1 text-xl">
                    {data.members.map((members) => (
                      <li key={members.id}>
                        <span className="text-gray-900 text-xl mr-2">
                          {members.courseMember.user.id}
                        </span>
                        <span className="text-gray-900 text-xl mr-2">
                          {members.courseMember.user.name}
                        </span>
                        {members.courseMember.user.surname}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              <div className="grid grid-cols-[110px_1fr]">
                <dt className="text-gray-900 text-xl">Advisor :</dt>
                <dd className="text-xl">
                  {data.advisors[0]?.courseMember.id}
                  <span className="text-gray-900 text-xl ml-2 mr-2">
                    {data.advisors[0]?.courseMember.user.name}
                  </span>
                  {data.advisors[0]?.courseMember.user.surname}
                </dd>
              </div>

              {data.advisors[1] && (
                <div className="grid grid-cols-[110px_1fr]">
                  <dt className="text-gray-900 text-xl">Co-Advisor :</dt>
                  <dd className="text-xl">{data.advisors[1]?.courseMember.user.name}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="rounded border bg-white p-8 text-center text-gray-500">
            No groups found.
          </div>
        )}
      </div>

      {openCreate && (
        <CreateGroupModal
          nextGroupNo={nextGroupNo}
          onCancel={() => setOpenCreate(false)}
          onSave={handleCreate}
        />
      )}

      {editTarget && (
        <EditGroupModal
          group={editTarget}
          onCancel={() => setEditTarget(null)}
          onSave={(updated) => {
            setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setEditTarget(null);
          }}
        />
      )}
    </section>
  );
}

/* ---------------------------- CREATE GROUP MODAL ---------------------------- */

function CreateGroupModal({
  nextGroupNo,
  onCancel,
  onSave,
}: {
  nextGroupNo: string;
  onCancel: () => void;
  onSave: (g: Omit<Group, "id" | "codeNumber">) => void;
}) {
  const [projectTitle, setProjectTitle] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [membersText, setMembersText] = useState(""); // "6513.. John, 6513.. Jane"
  const [advisor, setAdvisor] = useState("");
  const [coAdvisor, setCoAdvisor] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const canSave = projectTitle.trim().length > 0;

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

  const parseMembers = (): Member[] =>
    membersText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((token) => {
        const m = token.match(/^([0-9]{6,})\s+(.+)$/);
        return m ? { studentId: m[1], name: m[2] } : { studentId: "", name: token };
      });

  const handleSave = () => {
    onSave({
      name: (productTitle || projectTitle).trim(),
      projectTitle: projectTitle.trim(),
      productTitle: productTitle.trim(),
      members: parseMembers(),
      advisor: advisor.trim(),
      coAdvisor: coAdvisor.trim() || undefined,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div ref={panelRef} className="w-full max-w-xl rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Create Group</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <Field label="Project Title" required>
              <input
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="HelloHello"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </Field>

            <Field label="Product Title">
              <input
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Twomandown"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
              />
            </Field>

            <Field label="Member">
              <div className="relative">
                <input
                  className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  placeholder='Search (comma separated: "6513.. John, 6513.. Jane")'
                  value={membersText}
                  onChange={(e) => setMembersText(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </Field>

            <Field label="Advisor">
              <div className="relative">
                <input
                  className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  placeholder="Search"
                  value={advisor}
                  onChange={(e) => setAdvisor(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </Field>

            <Field label="Co-Advisor">
              <div className="relative">
                <input
                  className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  placeholder="Search"
                  value={coAdvisor}
                  onChange={(e) => setCoAdvisor(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </Field>

            <div className="text-sm text-gray-500">
              <span className="font-medium">Next Group ID:</span> {nextGroupNo}
            </div>
          </div>

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

/* ------------------------------ EDIT GROUP MODAL ------------------------------ */

function EditGroupModal({
  group,
  onCancel,
  onSave,
}: {
  group: Group;
  onCancel: () => void;
  onSave: (updated: Group) => void;
}) {
  const [groupNo, setGroupNo] = useState(group.groupNo);
  const [projectTitle, setProjectTitle] = useState(group.projectTitle);
  const [productTitle, setProductTitle] = useState(group.productTitle);
  const [members, setMembers] = useState<Member[]>(group.members || []);
  const [advisor, setAdvisor] = useState<string>(group.advisor || "");
  const [coAdvisor, setCoAdvisor] = useState<string>(group.coAdvisor || "");

  const [qMember, setQMember] = useState("");
  const [qAdvisor, setQAdvisor] = useState("");
  const [qCoAdvisor, setQCoAdvisor] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const canSave = projectTitle.trim().length > 0 && groupNo.trim().length > 0;

  // directories (for demo suggestions)
  const STUDENTS: Member[] = [
    { studentId: "65130500211", name: "Navin Dansakul" },
    { studentId: "65130500241", name: "Mananchai Chankhuong" },
    { studentId: "65130500299", name: "Cristiano Ronaldo" },
    { studentId: "65130500212", name: "Lamine Yamal" },
    { studentId: "65130500213", name: "Lionel Messi" },
    { studentId: "65130500214", name: "Rafael Leao" },
    { studentId: "65130500271", name: "Harry Maguire" },
    { studentId: "65130500272", name: "Marcus Rashford" },
    { studentId: "65130500273", name: "Antony Santos" },
  ];
  const ADVISORS: { id: string; name: string }[] = [
    { id: "65130500255", name: "Dr. Vithida Chongsuphajaisiddhi" },
    { id: "65130500256", name: "Dr. Chonlameth Apninkanondt" },
    { id: "65130500257", name: "Dr. Tuul Triyason" },
  ];

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

  const memberSuggestions = useMemo(() => {
    const q = qMember.trim().toLowerCase();
    if (!q) return [] as Member[];
    return STUDENTS.filter(
      (s) => s.studentId.includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [qMember]);

  const advisorSuggestions = useMemo(() => {
    const q = qAdvisor.trim().toLowerCase();
    if (!q) return [] as { id: string; name: string }[];
    return ADVISORS.filter(
      (a) => a.id.includes(q) || a.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [qAdvisor]);

  const coAdvisorSuggestions = useMemo(() => {
    const q = qCoAdvisor.trim().toLowerCase();
    if (!q) return [] as { id: string; name: string }[];
    return ADVISORS.filter(
      (a) => a.id.includes(q) || a.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [qCoAdvisor]);

  const addMember = (m: Member) => {
    setMembers((prev) => {
      const exists = prev.some((x) => x.studentId === m.studentId);
      if (exists) return prev;
      return [...prev, m];
    });
    setQMember("");
  };
  const removeMember = (sid: string) =>
    setMembers((prev) => prev.filter((m) => m.studentId !== sid));

  const fmtAdvisor = (a: { id: string; name: string }) => `${a.id} ${a.name}`;

  const handleSave = () => {
    onSave({
      ...group,
      groupNo: groupNo.trim(),
      projectTitle: projectTitle.trim(),
      productTitle: productTitle.trim(),
      name: (productTitle || projectTitle).trim(),
      members,
      advisor: advisor.trim(),
      coAdvisor: coAdvisor.trim() || undefined,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div ref={panelRef} className="w-full max-w-xl rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Edit Group</h2>
            <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <Field label="ID" required>
              <input
                value={groupNo}
                onChange={(e) => setGroupNo(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="0001"
              />
            </Field>

            <Field label="Project Title" required>
              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="HelloHello"
              />
            </Field>

            <Field label="Product Title">
              <input
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Twomandown"
              />
            </Field>

            <legend className="text-lg font-semibold text-gray-900">Member</legend>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <Chip
                  key={m.studentId}
                  label={`${m.studentId} ${m.name}`}
                  onRemove={() => removeMember(m.studentId)}
                />
              ))}
            </div>
            <div className="relative">
              <input
                value={qMember}
                onChange={(e) => setQMember(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && qMember.trim()) {
                    // Accept "6513.. Full Name"
                    const m = qMember.match(/^([0-9]{6,})\s+(.+)$/);
                    if (m) addMember({ studentId: m[1], name: m[2] });
                    setQMember("");
                  }
                }}
                placeholder='Search (type "6513.. Full Name" and Enter)'
                className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              {qMember && memberSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                  {memberSuggestions.map((s) => (
                    <li
                      key={s.studentId}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => addMember(s)}
                    >
                      {s.studentId} {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <legend className="text-lg font-semibold text-gray-900">Advisor</legend>
            <div className="flex flex-wrap gap-2">
              {advisor && <Chip label={advisor} onRemove={() => setAdvisor("")} />}
            </div>
            <div className="relative">
              <input
                value={qAdvisor}
                onChange={(e) => setQAdvisor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && qAdvisor.trim()) {
                    setAdvisor(qAdvisor.trim());
                    setQAdvisor("");
                  }
                }}
                placeholder="Search"
                className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              {qAdvisor && advisorSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                  {advisorSuggestions.map((a) => (
                    <li
                      key={a.id}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setAdvisor(`${a.id} ${a.name}`);
                        setQAdvisor("");
                      }}
                    >
                      {a.id} {a.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <legend className="text-lg font-semibold text-gray-900">Co-Advisor</legend>
            <div className="flex flex-wrap gap-2">
              {coAdvisor && <Chip label={coAdvisor} onRemove={() => setCoAdvisor("")} />}
            </div>
            <div className="relative">
              <input
                value={qCoAdvisor}
                onChange={(e) => setQCoAdvisor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && qCoAdvisor.trim()) {
                    setCoAdvisor(qCoAdvisor.trim());
                    setQCoAdvisor("");
                  }
                }}
                placeholder="Search"
                className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              {qCoAdvisor && coAdvisorSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow">
                  {coAdvisorSuggestions.map((a) => (
                    <li
                      key={a.id}
                      className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setCoAdvisor(`${a.id} ${a.name}`);
                        setQCoAdvisor("");
                      }}
                    >
                      {a.id} {a.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

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

/* ------------------------------ SHARED UI -------------------------------- */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-gray-200" aria-label="Remove">
        <X className="w-3.5 h-3.5 text-gray-700" />
      </button>
    </span>
  );
}

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
