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
import * as XLSX from "xlsx-js-style";
import { Course } from "@/types/api/course";
import { getStaffCourse } from "@/types/api/course";
import { getStaffCourseAPI } from "@/api/course/getStaffCourse";

export default function GroupTab() {
  const courseId = useSearchParams().get("courseId") || "";
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<getGroup.Group[]>([]);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<getGroup.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);

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

  const fetchCourse = async () => {
    try {
      if (!courseId) return;
      const response = await getStaffCourseAPI();
      const found = response.data.course.find(c => c.id === courseId);
      setCourse(found || null);

      console.log("course", found);
    } catch (error) {
      console.error("Error fetching course info:", error);
      setCourse(null);
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchCourse();
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

  useEffect(() => {
    console.log("openCreate changed:", openCreate);
  }, [openCreate]);

  const handleDownloadAll = () => {
  const pageTitle = course?.program
    ? `${course.program.toUpperCase()} ${course.name} Student Group Data`
    : "Student Group Data";

  const fullNameUpper = (u?: { name?: string; surname?: string }) =>
    [u?.name, u?.surname].filter(Boolean).join(" ").toUpperCase();

  const formatMember = (m: any, idx: number) => {
    const sid = String(m?.courseMember?.user?.id ?? "");
    const nm = fullNameUpper(m?.courseMember?.user);
    return `${idx + 1}. ${sid} ${nm}`.trim();
  };

  const maxMembers = group.reduce((mx, g) => Math.max(mx, g.members?.length ?? 0), 0);

  const front = ["ID", "Project Title", "Product Title", "Company"];
  const membersHeader = ["Members", ...Array(Math.max(0, maxMembers - 1)).fill("")];
  const tail = ["Advisor", "Co-Advisor"];
  const headerRow = [...front, ...membersHeader, ...tail];

  const dataRows = group.map((g) => {
    const members = g.members ?? [];
    const memberCells = Array.from({ length: maxMembers }, (_, i) =>
      members[i] ? formatMember(members[i], i) : ""
    );
    return [
      String(g.codeNumber ?? ""),
      g.projectName ?? "",
      g.productName ?? "",
      g.company ?? "",
      ...memberCells,
      fullNameUpper(g.advisors?.[0]?.courseMember?.user) || "",
      fullNameUpper(g.advisors?.[1]?.courseMember?.user) || "",
    ];
  });

  const excelData = [[pageTitle], headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  const totalCols = headerRow.length;
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  const membersStartCol = front.length;
  const membersEndCol = front.length + Math.max(0, maxMembers - 1);
  if (maxMembers > 0) {
    ws["!merges"].push({
      s: { r: 1, c: membersStartCol },
      e: { r: 1, c: membersEndCol },
    });
  }

  ws["!cols"] = headerRow.map((_, colIdx) => {
    const colValues = [headerRow[colIdx], ...dataRows.map((r) => r[colIdx] ?? "")];
    const maxLen = Math.max(12, ...colValues.map((v) => (v ? String(v).length : 0)));
    return { wch: Math.min(maxLen, 80) };
  });

  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][0] = { hpt: 28 };
  ws["!rows"][1] = { hpt: 22 }; 

  const titleCellRef = "A1";
  if (ws[titleCellRef]) {
    ws[titleCellRef].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
    };
  }

  headerRow.forEach((_, c) => {
    const ref = XLSX.utils.encode_cell({ r: 1, c });
    if (ws[ref]) {
      ws[ref].s = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top:    { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left:   { style: "thin", color: { rgb: "CCCCCC" } },
          right:  { style: "thin", color: { rgb: "CCCCCC" } },
        },
        fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } }, // light gray header bg
      };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Groups");
  XLSX.writeFile(wb, `Course_${course?.name ?? "Unknown"}_Groups_Data.xlsx`);
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

  useEffect(() => {
    console.log("openCreate changed:", openCreate);
  }, [openCreate]);

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
            onClick={handleDownloadAll}
          >
            <Download className="w-4 h-4" />
            Download
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
                    <ol className="list-decimal ml-3 space-y-1 text-xl">
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
                    </ol>
                  </dd>
                </div>

                <div className="grid grid-cols-[110px_1fr]">
                  <dt className="text-gray-900 text-xl">Advisor :</dt>
                  <dd className="text-xl">
                    {data.advisors[0]?.courseMember.user.name}
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