"use client";

import { useEffect, useState } from "react";
import { getAllGroupAPI } from "@/api/group/getAllGroup";
import { getGroupAPI } from "@/api/assignment/getGroup";
import { getGroups } from "@/types/api/assignment";

interface AssignmentGroupProps {
  selectedGroup: string | undefined;
  setSelectedGroup: React.Dispatch<React.SetStateAction<string | undefined>>;
  role?: string;
  courseId: string;
}

export default function AssignmentGroup({
  selectedGroup,
  setSelectedGroup,
  role,
  courseId,
}: AssignmentGroupProps) {
  const [mounted, setMounted] = useState(false);
  const [groups, setGroups] = useState<getGroups.group[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !courseId) return;

    (async () => {
      try {
        let groupArray: getGroups.group[] = [];
        if (role === "staff") {
          const res = await getAllGroupAPI(courseId);
          groupArray = Array.isArray(res.data.groups)
            ? res.data.groups.map((g: any) => ({
                ...g,
                createdAt: g.createdAt ?? "",
                updatedAt: g.updatedAt ?? "",
              }))
            : [];
        } else if (role === "lecturer" || role === "advisor") {
          const res = await getGroupAPI(courseId);
          groupArray = Array.isArray(res.groups) ? res.groups : [];
        }
        setGroups(groupArray);

        // pick first group if none selected yet
        if (!selectedGroup && groupArray.length > 0) {
          setSelectedGroup(groupArray[0].id);
        }
      } catch (e) {
        console.error("Error fetching groups:", e);
        setGroups([]);
      }
    })();
  }, [mounted, courseId, role]); // selectedGroup is set inside, no need as a dep

  // 👇 Prevent SSR/client mismatch: render nothing until mounted
  if (!mounted) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "2rem" }}>
      <label htmlFor="group-select" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Group :
      </label>

      {groups.length > 0 && selectedGroup ? (
        <select
          id="group-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          style={{
            fontSize: "1.1rem",
            padding: "0.3rem 1.5rem 0.3rem 0.7rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
            fontWeight: 500,
            minWidth: "180px",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg fill=\"%23333\" height=\"16\" viewBox=\"0 0 24 24\" width=\"16\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.7rem center",
          }}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.projectName}
            </option>
          ))}
        </select>
      ) : (
        <span style={{ fontSize: "1rem", color: "#888" }}>Loading groups...</span>
      )}
    </div>
  );
}
