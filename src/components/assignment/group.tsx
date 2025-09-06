"use client";

import { useSearchParams } from "next/navigation";
import { getGroupByLecturerAPI } from "@/api/assignment/getGroupByLecturer";
import { useEffect, useState } from "react";
import { getAllAssignments } from "@/types/api/assignment";

export default function AssignmentGroup() {
  const courseId = useSearchParams().get("courseId") || "";
  const [groups, setGroups] = useState<getAllAssignments.getGroupByLecturer>();
  console.log("groups", groups);
  const [selectedGroup, setSelectedGroup] = useState<number>();

  const fetchGroupByAdvisor = async () => {
    try {
      const cid = Number(courseId);

      if (Number.isNaN(cid)) {
        console.error("Invalid courseId in URL");
        return;
      }
      const response = await getGroupByLecturerAPI(cid);
      console.log("response", response.data);
      setGroups(response.data);
      setSelectedGroup(response.data[0]?.id);
    } catch (e) {
      console.error("Error fetching group by advisor:", e);
    }
  };
  useEffect(() => {
    fetchGroupByAdvisor();
  }, [courseId]);

  useEffect(() => {
    if (!selectedGroup) return;
    // TODO: fetch selected group data
  }, [selectedGroup]);

  return (
    <div>
      <select>
        {groups?.map((group) => (
          <option
            key={group.id}
            value={group.id}
            onClick={() => setSelectedGroup(group.id)}
          >
            {group.projectName}
          </option>
        ))}
      </select>
    </div>
  );
}
