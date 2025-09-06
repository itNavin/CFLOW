"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { getUserRole } from "@/util/cookies";
import { myProject } from "@/types/api/myProject";
import { getMyProjectByCourseAPI } from "@/api/projectName/getMyProjectByCourse";

type UserRole = "student" | "lecturer" | "staff" | "super_admin";

type MenuItems = {
  name: string;
  href: string;
}[];

export default function Sidebar() {
  const pathname = usePathname();
  const [project, setProject] = useState<myProject.MyProject | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItems>([]);
  const courseId = useSearchParams().get("courseId") || "";
  const id = Number(courseId);

  const fetchProjectName = async () => {
    try {
      if (!courseId) return;
      const id = Number(courseId);
      const response = await getMyProjectByCourseAPI(id);
      console.log("Project response:", response.data);
      setProject(response.data);
      console.log("Project name:", response.data.group.projectName);
    } catch (error) { }
  };

  const getMenuItems = (role: UserRole): MenuItems => {
    switch (role) {
      case "student": {
        if (project === undefined) {
          console.log("projectName is undefined");
          return [];
        }
        return [
          { name: project?.group?.projectName ?? "Unknown", href: "/student" },
          { name: "Announcements", href: "/announcements" },
          { name: "Files", href: "/files" },
          { name: "Assignments", href: "/assignments" },
        ];
      }
      case "lecturer":
        return [
          { name: "Lecturer", href: "/advisor" },
          { name: "Announcements", href: "/announcements" },
          { name: "Files", href: "/files" },
          { name: "Assignments", href: "/assignments" },
        ];
      case "staff":
      case "super_admin":
        return [
          { name: "Staff", href: `/admin` },
          { name: "Announcements", href: `/announcements` },
          { name: "Files", href: `/files` },
          { name: "Assignments", href: `/assignments` },
        ];
      default:
        return [];
    }
  };
  useEffect(() => {
    fetchProjectName();
  }, [courseId]);

  useEffect(() => {
    setUserRole(getUserRole());
  }, [userRole]);

  useEffect(() => {
    if (!userRole) {
      setMenuItems([]);
      return;
    }
    setMenuItems(getMenuItems(userRole as UserRole));
  }, [userRole, project]);

  if (menuItems.length === 0) {
    console.log("No menu items, hiding sidebar"); 
    return null;
  }
  
  return (
    <aside className="w-60 h-screen bg-white border-r">
      <nav className="flex flex-col py-6 space-y-2 font-dbheavent">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={`${item.href}?courseId=${id}${project?.group?.id ? `&groupId=${project.group.id}` : ''}`}
              className={`px-6 py-3 text-2xl font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}