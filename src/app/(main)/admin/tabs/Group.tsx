"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Download, Pencil, X } from "lucide-react";
import { getAllGroupAPI } from "@/api/group/getAllGroup";
import { getGroup } from "@/types/api/group";
import { User } from "@/types/api/user";
import { getUserById } from "@/api/user/getUserById";
import { createGroupAPI } from "@/api/group/createGroup";
import CreateGroupModal from "@/components/group/createGroup";
import UpdateGroupModal from "@/components/group/updateGroupModal";

export default function GroupTab() {
  const courseId = useSearchParams().get("courseId") || "";
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<getGroup.Group[]>([]);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<getGroup.Group | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!courseId) {
        setError("No course ID provided");
        setGroup([]);
        return;
      }

      const response = await getAllGroupAPI(courseId);
      console.log("API Response:", response.data);

      if (response.data?.groups && Array.isArray(response.data.groups)) {
        setGroup(response.data.groups);
      } else {
        console.warn("No groups found or unexpected structure");
        setGroup([]);
      }
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      setError(error?.message || "Failed to load groups");
      setGroup([]);
    } finally {
      setLoading(false);
    }
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

  const handleCreate = async (newGroup: getGroup.Group) => {
    setGroup((prev) => [newGroup, ...prev]);
    setOpenCreate(false);

    await fetchGroup();
  };



  const nextGroupNo = useMemo(() => {
    if (!Array.isArray(group) || group.length === 0) {
      return "0001";
    }

    const maxNo = group.reduce((max, g) => {
      const num = parseInt(g.codeNumber) || 0;
      return num > max ? num : max;
    }, 0);

    return String(maxNo + 1).padStart(4, '0');
  }, [group]);

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
        {Array.isArray(filtered) && filtered.length > 0 ? (
          filtered.map((data) => (
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
          ))
        ) : (
          <div className="rounded border bg-white p-8 text-center text-gray-500">
            {loading ? "Loading groups..." : "No groups found."}
          </div>
        )}
      </div>

      {openCreate && (
        <CreateGroupModal
          nextGroupNo={nextGroupNo}
          courseId={courseId}
          onCancel={() => setOpenCreate(false)}
          onSave={handleCreate}
        />
      )}

      {editTarget && (
        <UpdateGroupModal
          group={editTarget}
          onCancel={() => setEditTarget(null)}
          onSave={() => {
            fetchGroup();
            setEditTarget(null);
          }}
        />
      )}
    </section>
  );
}