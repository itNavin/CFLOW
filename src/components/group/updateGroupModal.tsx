"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { getGroup } from "@/types/api/group";

// Define interfaces for the component
interface Member {
  studentId: string;
  name: string;
}

interface UpdateGroupModalProps {
  group: getGroup.Group;
  onCancel: () => void;
  onSave: (updated: getGroup.Group) => void;
}

export default function UpdateGroupModal({
  group,
  onCancel,
  onSave,
}: UpdateGroupModalProps) {
  // Extract the current values from the group data
  const [groupNo, setGroupNo] = useState(group.codeNumber || "");
  const [projectTitle, setProjectTitle] = useState(group.projectName || "");
  const [productTitle, setProductTitle] = useState(group.productName || "");
  const [company, setCompany] = useState(group.company || "");
  
  // Convert API data to local format
  const [members, setMembers] = useState<Member[]>(
    group.members?.map(m => ({
      studentId: m.courseMember.user.id,
      name: `${m.courseMember.user.name} ${m.courseMember.user.surname}`.trim()
    })) || []
  );
  
  const [advisor, setAdvisor] = useState<string>(
    group.advisors?.[0] 
      ? `${group.advisors[0].courseMember.user.email} ${group.advisors[0].courseMember.user.name} ${group.advisors[0].courseMember.user.surname}`.trim()
      : ""
  );
  
  const [coAdvisor, setCoAdvisor] = useState<string>(
    group.advisors?.[1] 
      ? `${group.advisors[1].courseMember.user.email} ${group.advisors[1].courseMember.user.name} ${group.advisors[1].courseMember.user.surname}`.trim()
      : ""
  );

  const [qMember, setQMember] = useState("");
  const [qAdvisor, setQAdvisor] = useState("");
  const [qCoAdvisor, setQCoAdvisor] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const canSave = projectTitle.trim().length > 0 && groupNo.trim().length > 0;

  // Mock data - replace with actual API calls
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

  const handleSave = () => {
    // Create updated group object with the same structure as the original
    const updatedGroup: getGroup.Group = {
      ...group,
      codeNumber: groupNo.trim(),
      projectName: projectTitle.trim(),
      productName: productTitle.trim(),
      company: company.trim() || null,
      // Note: In a real implementation, you'd need to handle the members and advisors
      // conversion back to the API format here
    };

    onSave(updatedGroup);
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

            <Field label="Company">
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Enter company name (optional)"
              />
            </Field>

            <Field label="Member">
              <div className="space-y-2">
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
              </div>
            </Field>

            <Field label="Advisor">
              <div className="space-y-2">
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
                    placeholder="Search advisor"
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
              </div>
            </Field>

            <Field label="Co-Advisor">
              <div className="space-y-2">
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
                    placeholder="Search co-advisor"
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
            </Field>
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