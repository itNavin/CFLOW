"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getGroup } from "@/types/api/group";
import { createGroupAPI } from "@/api/group/createGroup";

interface CreateGroupModalProps {
  nextGroupNo: string;
  courseId: string;
  onCancel: () => void;
  onSave: (g: getGroup.Group) => void;
}

export default function CreateGroupModal({
  nextGroupNo,
  courseId,
  onCancel,
  onSave,
}: CreateGroupModalProps) {
  const [projectTitle, setProjectTitle] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [company, setCompany] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]); 
  const [selectedCoAdvisors, setSelectedCoAdvisors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [advisorQuery, setAdvisorQuery] = useState("");
  const [coAdvisorQuery, setCoAdvisorQuery] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const canSave = projectTitle.trim().length > 0 && selectedMembers.length > 0 && selectedAdvisors.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onCancel();
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onCancel();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onCancel, loading]);

  const handleSave = async () => {
    if (!canSave) return;

    try {
      setLoading(true);

      // Call the API
      const response = await createGroupAPI(
        courseId,
        nextGroupNo,
        projectTitle.trim(),
        productTitle.trim() || null,
        company.trim() || null,
        selectedMembers,
        selectedAdvisors,
        selectedCoAdvisors.length > 0 ? selectedCoAdvisors : null
      );

      console.log("Create group response:", response.data);

      // Pass the created group back to parent
      if (response.data?.group) {
        const createdGroup: getGroup.Group = {
          ...response.data.group,
          members: [],
          advisors: [],
        };
        
        onSave(createdGroup);
      } else {
        throw new Error("No group data in response");
      }

    } catch (error: any) {
      console.error("Error creating group:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create group";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const addMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeMember = (id: string) => {
    setSelectedMembers(prev => prev.filter(x => x !== id));
  };

  const addAdvisor = (id: string) => {
    setSelectedAdvisors(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeAdvisor = (id: string) => {
    setSelectedAdvisors(prev => prev.filter(x => x !== id));
  };

  const addCoAdvisor = (id: string) => {
    setSelectedCoAdvisors(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const removeCoAdvisor = (id: string) => {
    setSelectedCoAdvisors(prev => prev.filter(x => x !== id));
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
                disabled={loading}
              />
            </Field>

            <Field label="Product Title">
              <input
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Twomandown"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field label="Company">
              <input
                className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                placeholder="Enter company name (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field label="Members" required>
              <div className="space-y-2">
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((id) => (
                      <Chip
                        key={id}
                        label={`Member ID: ${id}`}
                        onRemove={() => removeMember(id)}
                      />
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                    placeholder="Enter member ID and press Enter"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && memberQuery.trim()) {
                        addMember(memberQuery.trim());
                        setMemberQuery("");
                      }
                    }}
                    disabled={loading}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            </Field>

            <Field label="Advisors" required>
              <div className="space-y-2">
                {selectedAdvisors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAdvisors.map((id) => (
                      <Chip
                        key={id}
                        label={`Advisor ID: ${id}`}
                        onRemove={() => removeAdvisor(id)}
                      />
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                    placeholder="Enter advisor ID and press Enter"
                    value={advisorQuery}
                    onChange={(e) => setAdvisorQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && advisorQuery.trim()) {
                        addAdvisor(advisorQuery.trim());
                        setAdvisorQuery("");
                      }
                    }}
                    disabled={loading}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            </Field>

            <Field label="Co-Advisors">
              <div className="space-y-2">
                {selectedCoAdvisors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCoAdvisors.map((id) => (
                      <Chip
                        key={id}
                        label={`Co-Advisor ID: ${id}`}
                        onRemove={() => removeCoAdvisor(id)}
                      />
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    className="w-full rounded border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                    placeholder="Enter co-advisor ID and press Enter"
                    value={coAdvisorQuery}
                    onChange={(e) => setCoAdvisorQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && coAdvisorQuery.trim()) {
                        addCoAdvisor(coAdvisorQuery.trim());
                        setCoAdvisorQuery("");
                      }
                    }}
                    disabled={loading}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
            </Field>

            <div className="text-sm text-gray-500">
              <span className="font-medium">Next Group ID:</span> {nextGroupNo}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button 
              onClick={onCancel} 
              className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || loading}
              className="rounded px-5 py-2 text-white disabled:opacity-60 shadow bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320] transition"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
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