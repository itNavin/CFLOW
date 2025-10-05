"use client";

import { useSearchParams } from "next/navigation";
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
  const [groups, setGroups] = useState<getGroups.group[]>([]);

  const fetchGroups = async () => {
    try {
      if (!courseId) return;
      let groupArray: getGroups.group[] = [];
      if (role === "staff") {
        const response = await getAllGroupAPI(courseId);
        groupArray = Array.isArray(response.data.groups) ? response.data.groups : [];
      } else if (role === "lecturer" || role === "advisor") {
        const response = await getGroupAPI(courseId);
        groupArray = Array.isArray(response.groups) ? response.groups : [];
      }
      setGroups(groupArray);
      if (!selectedGroup && groupArray.length > 0) {
        setSelectedGroup(groupArray[0].id);
      }
    } catch (e) {
      console.error("Error fetching groups:", e);
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, role]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <label htmlFor="group-select" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        Group :
      </label>
      <select
        id="group-select"
        value={selectedGroup}
        onChange={e => setSelectedGroup(e.target.value)}
        style={{
          fontSize: "1.1rem",
          padding: "0.3rem 1.5rem 0.3rem 0.7rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#fff",
          fontWeight: "500",
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
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.projectName}
          </option>
        ))}
      </select>
    </div>
  );
}