"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { getGroup } from "@/types/api/group";
import { createGroupAPI } from "@/api/group/createGroup";
import { getStudentNotInGroupAPI } from "@/api/group/studentNotInGroup";
import { getAdvisorMemberAPI } from "@/api/courseMember/getAdvisorMembers";
import { getStaffCourseAPI } from "@/api/course/getStaffCourse";
import { useToast } from "../toast";

type Program = "CS" | "DSI";

interface Member {
  studentId: string;
  name: string;
  courseMemberId: string;
  workRole?: string | null;
}

interface Advisor {
  id: string;
  name: string;
  email?: string;
  courseMemberId: string;
}

interface CreateGroupModalProps {
  nextGroupNo: string;
  courseId: string;
  onCancel: () => void;
  onSave: (g: getGroup.Group) => void;
  courseProgram?: Program | null;
}

export default function CreateGroupModal({
  nextGroupNo,
  courseId,
  onCancel,
  onSave,
  courseProgram: propCourseProgram = null,
}: CreateGroupModalProps) {
  const { showToast } = useToast();
  const [courseProgram, setCourseProgram] = useState<Program | null>(propCourseProgram ?? null);
  const isCS = courseProgram === "CS";
  const isDSI = courseProgram === "DSI";
  const [projectTitle, setProjectTitle] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [company, setCompany] = useState("");

  const [availableStudents, setAvailableStudents] = useState<Member[]>([]);
  const [availableAdvisors, setAvailableAdvisors] = useState<Advisor[]>([]);

  const [members, setMembers] = useState<Member[]>([]);
  const [advisor, setAdvisor] = useState<string>("");
  const [coAdvisor, setCoAdvisor] = useState<string>("");

  const [qMember, setQMember] = useState("");
  const [qAdvisor, setQAdvisor] = useState("");
  const [qCoAdvisor, setQCoAdvisor] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(false);

  const [groupNo, setGroupNo] = useState(nextGroupNo);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const canSave =
    projectTitle.trim().length > 0 &&
    groupNo.trim().length > 0 &&
    members.length > 0 &&
    advisor &&
    !isCreating;

  useEffect(() => {
    const fetchAvailableStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const response = await getStudentNotInGroupAPI(courseId);
        const mappedStudents = response.data.students.map((s: any) => ({
          studentId: String(s.userId),
          name: s.name,
          courseMemberId: String(s.courseMemberId),
        }));
        setAvailableStudents(mappedStudents);
      } catch (error) {
        setAvailableStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    const fetchAvailableAdvisors = async () => {
      try {
        setIsLoadingAdvisors(true);
        const response = await getAdvisorMemberAPI(courseId);
        const mappedAdvisors: Advisor[] = response.data.advisors.map((a: any) => ({
          id: a.user.id,
          name: a.user.name,
          email: a.user.email || undefined,
          courseMemberId: a.id,
        }));
        setAvailableAdvisors(mappedAdvisors);
      } catch (error) {
        setAvailableAdvisors([]);
      } finally {
        setIsLoadingAdvisors(false);
      }
    };

    fetchAvailableStudents();
    fetchAvailableAdvisors();
    if (!propCourseProgram) {
      (async () => {
        try {
          const res = await getStaffCourseAPI();
          const found = res.data?.course?.find((c: any) => c.id === courseId);
          if (found && found.program) setCourseProgram(found.program as Program);
          else setCourseProgram(null);
        } catch (e) {
          setCourseProgram(null);
        }
      })();
    }
  }, [courseId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isCreating && onCancel();
    const onClick = (e: MouseEvent) => {
      if (!isCreating && panelRef.current && !panelRef.current.contains(e.target as Node)) onCancel();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onCancel, isCreating]);

  const memberSuggestions = useMemo(() => {
    const q = qMember.trim().toLowerCase();
    if (!q) return [];
    return availableStudents
      .filter((s) => {
        const isAlreadyMember = members.some((m) => String(m.studentId) === String(s.studentId));
        if (isAlreadyMember) return false;
        return String(s.studentId).toLowerCase().includes(q) || String(s.name).toLowerCase().includes(q);
      })
      .slice(0, 6);
  }, [qMember, availableStudents, members]);

  const advisorSuggestions = useMemo(() => {
    const q = qAdvisor.trim().toLowerCase();
    if (!q) return [];
    return availableAdvisors
      .filter((a) =>
        (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) &&
        a.name !== coAdvisor
      )
      .slice(0, 6);
  }, [qAdvisor, availableAdvisors]);

  const coAdvisorSuggestions = useMemo(() => {
    const q = qCoAdvisor.trim().toLowerCase();
    if (!q) return [];
    return availableAdvisors
      .filter((a) =>
        (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) &&
        a.name !== advisor
      ).slice(0, 6);
  }, [qCoAdvisor, availableAdvisors]);

  const addMember = (m: Member) => {
    setMembers((prev) => {
      if (prev.find((mem) => mem.studentId === m.studentId)) return prev;
      return [...prev, { ...m, workRole: m.workRole ?? "" }];
    });
    setQMember("");
  };

  const updateWorkRole = (courseMemberId: string, value: string) => {
    setMembers((prev) => prev.map((mm) => mm.courseMemberId === courseMemberId ? { ...mm, workRole: value } : mm));
  };

  const removeMember = (studentIdToRemove: string) => {
    setMembers((prev) => prev.filter((m) => m.studentId !== studentIdToRemove));
  };

  const addAdvisor = (a: Advisor) => {
    setAdvisor(a.name);
    setQAdvisor("");
  };

  const removeAdvisor = () => {
    setAdvisor("");
  };

  const addCoAdvisor = (a: Advisor) => {
    if (advisor && advisor === a.name) {
      alert("Advisor and Co-Advisor cannot be the same person.");
      return;
    }
    setCoAdvisor(a.name);
    setQCoAdvisor("");
  };

  const removeCoAdvisor = () => {
    setCoAdvisor("");
  };

  const extractAdvisorId = (advisorString: string): string[] => {
    if (!advisorString) return [];
    const advisor = availableAdvisors.find((a) => advisorString.includes(a.name));
    if (!advisor) return [];
    return [advisor.courseMemberId];
  };

  const handleSave = async () => {
    if (advisor && coAdvisor && advisor === coAdvisor) {
      showToast({ variant: "error", message: "Advisor and Co-Advisor cannot be the same person." });
      return;
    }

    try {
      setIsCreating(true);

      const memberIds = members.map((m) => ({
        id: m.courseMemberId,
        workRole: null,
      }));
      const advisorIds = extractAdvisorId(advisor).map((id) => ({ id }));
      const coAdvisorIds = extractAdvisorId(coAdvisor).map((id) => ({ id }));

      const response = await createGroupAPI(
        courseId,
        groupNo,
        projectTitle.trim(),
        (!isDSI ? (productTitle.trim() || null) : null),
        (!isCS ? (company.trim() || null) : null),
        memberIds,
        advisorIds,
        coAdvisorIds
      );

      if (response.data?.group) {
        const createdGroup: getGroup.Group = {
          ...response.data.group,
          members: [],
          advisors: [],
        };
        showToast({ variant: "success", message: "Group created successfully" });
        onSave(createdGroup);
      } else {
        throw new Error("No group data in response");
      }
    } catch (error: any) {
      showToast({ variant: "error", message: String(error?.response?.data?.message || error?.message || "Failed to create group") });
    } finally {
      setIsCreating(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div
          ref={panelRef}
          className="w-full max-w-xl rounded-2xl border bg-white shadow-xl overflow-y-auto max-h-full"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Create Group</h2>
            <button
              onClick={onCancel}
              disabled={isCreating}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <Field label="ID" required htmlFor="groupNo">
              <input
                id="groupNo"
                value={groupNo}
                onChange={(e) => setGroupNo(e.target.value)}
                disabled={isCreating}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="0001"
              />
            </Field>

            <Field label="Project Title" required htmlFor="projectTitle">
              <input
                id="projectTitle"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                disabled={isCreating}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Project Name"
              />
            </Field>
{/* 
            <Field label="Product Title" htmlFor="productTitle">
              <input
                id="productTitle"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                disabled={isCreating}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Product Name"
              />
            </Field> */}
            {!isDSI && (
              <Field label="Product Title" htmlFor="productTitle">
                <input
                  id="productTitle"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  disabled={isCreating}
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  placeholder="Product Name"
                />
              </Field>
            )}
{/* 
            <Field label="Company" htmlFor="company">
              <input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isCreating}
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Company Name"
              />
            </Field> */}
            {!isCS && (
              <Field label="Company" htmlFor="company">
                <input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isCreating}
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  placeholder="Company Name"
                />
              </Field>
            )}

            <Field label="Members">
              <div className="space-y-2">
                <div className="flex flex-col space-y-2">
                  {members.map((m) => (
                    <Chip
                      key={m.courseMemberId}
                      label={`${m.studentId} ${m.name}`}
                      onRemove={() => !isCreating && removeMember(m.studentId)}
                      disabled={isCreating}
                    >
                      {isDSI && (
                        <input
                          value={m.workRole ?? ""}
                          onChange={(e) => updateWorkRole(m.courseMemberId, e.target.value)}
                          placeholder="Work role"
                          disabled={isCreating}
                          className="w-56 rounded border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#326295]"
                        />
                      )}
                    </Chip>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={qMember}
                    onChange={(e) => setQMember(e.target.value)}
                    disabled={isCreating}
                    placeholder="Search students..."
                    className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                  {qMember && memberSuggestions.length > 0 && !isLoadingStudents && (
                    <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow max-h-40 overflow-y-auto">
                      {memberSuggestions.map((s) => (
                        <li
                          key={s.studentId}
                          className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                          onClick={() => addMember(s)}
                        >
                          <div className="font-medium">{s.studentId}</div>
                          <div className="text-gray-600 text-xs">{s.name}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Advisor">
              <div className="space-y-2">
                {advisor && (
                  <Chip
                    label={advisor}
                    onRemove={() => !isCreating && removeAdvisor()}
                    disabled={isCreating}
                  />
                )}
                <div className="relative">
                  <input
                    value={qAdvisor}
                    onChange={(e) => setQAdvisor(e.target.value)}
                    disabled={isCreating}
                    placeholder="Search advisor..."
                    className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                  {qAdvisor && advisorSuggestions.length > 0 && !isLoadingAdvisors && (
                    <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow max-h-40 overflow-y-auto">
                      {advisorSuggestions.map((a) => (
                        <li
                          key={a.id}
                          className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            addAdvisor(a);
                          }}
                        >
                          <div className="font-medium">{a.name}</div>
                          {a.email && <div className="text-gray-600 text-xs">{a.email}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Co-Advisor">
              <div className="space-y-2">
                {coAdvisor && (
                  <Chip
                    label={coAdvisor}
                    onRemove={() => !isCreating && removeCoAdvisor()}
                    disabled={isCreating}
                  />
                )}
                <div className="relative">
                  <input
                    value={qCoAdvisor}
                    onChange={(e) => setQCoAdvisor(e.target.value)}
                    disabled={isCreating}
                    placeholder="Search co-advisor..."
                    className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                  {qCoAdvisor && coAdvisorSuggestions.length > 0 && !isLoadingAdvisors && (
                    <ul className="absolute z-10 mt-1 w-full rounded border bg-white shadow max-h-40 overflow-y-auto">
                      {coAdvisorSuggestions.map((a) => (
                        <li
                          key={a.id}
                          className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            addCoAdvisor(a);
                          }}
                        >
                          <div className="font-medium">{a.name}</div>
                          {a.email && <div className="text-gray-600 text-xs">{a.email}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button
              onClick={onCancel}
              disabled={isCreating}
              className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded px-5 py-2 text-white bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320]"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Chip({
  label,
  children,
  onRemove,
  disabled = false,
}: {
  label: string;
  children?: React.ReactNode;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between w-full gap-3 rounded-full bg-gray-100 px-3 py-2 text-sm ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="font-medium">{label}</span>
        {children}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        disabled={disabled}
        className="rounded-full p-0.5 hover:bg-gray-200"
      >
        <X className="w-3.5 h-3.5 text-red-700 cursor-pointer" />
      </button>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="block">
      <label
        className="mb-1 block text-lg font-semibold text-gray-900"
        htmlFor={htmlFor}
      >
        {label}
        {required && <span className="text-red-500 pl-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}