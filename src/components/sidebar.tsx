"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { getUserRole } from "@/util/cookies";
import { myProject } from "@/types/api/myProject";
import { getMyProjectByCourseAPI } from "@/api/projectName/getMyProjectByCourse";

type UserRole = "STUDENT" | "ADVISOR" | "ADMIN" | "SUPER_ADMIN";

const normalizeRole = (val: unknown): UserRole | null => {
  if (!val) return null;
  const s = String(val).toUpperCase();
  const map: Record<string, UserRole> = {
    STUDENT: "STUDENT",
    ADVISOR: "ADVISOR",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
  };
  return map[s] ?? null;
};

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

  // useEffect(() => {
  //   (async () => {
  //     if (!courseId) {
  //       setProjectName(null);
  //       return;
  //     }
  //     try {
  //       const id = Number(courseId);
  //       if (Number.isFinite(id)) {
  //         const { data } = await getMyProjectByCourseAPI(id);
  //         setProjectName(data ?? null);
  //       } else {
  //         setProjectName(null);
  //       }
  //     } catch {
  //       setProjectName(null);
  //     }
  //   })();
  // }, [courseId]);

  const fetchProjectName = async () => {
    try {
      if (!courseId) return;
      const id = Number(courseId);
      const response = await getMyProjectByCourseAPI(id);
      console.log("Project response:", response.data);
      setProject(response.data);
      console.log("Project name:", response.data.group.projectName);
    } catch (error) {}
  };
  // console.log("User Role:", userRole);
  const getMenuItems = (role: UserRole): MenuItems => {
    switch (role) {
      case "STUDENT": {
        if (project === undefined) {
           console.log("projectName is undefined");
          return [];
        }
        return [
          { name: project?.group.projectName ?? "Unknown", href: "/student" },
          { name: "Announcements", href: "/announcements" },
          { name: "Files", href: "/files" },
          { name: "Assignments", href: "/assignments/student" },
        ];
      }
      case "ADVISOR":
        return [
          { name: "Advisor", href: "/advisor" },
          { name: "Announcements", href: "/announcements" },
          { name: "Files", href: "/files" },
          { name: "Assignments", href: "/assignments/advisor" },
        ];
      case "ADMIN":
      case "SUPER_ADMIN":
        return [
          { name: "Admin", href: `/admin` },
          {
            name: "Announcements",
            href: `/announcements`,
          },
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

  // useEffect(() => {
  //   let role = readRoleFromLocalStorage();
  //   if (!role) {
  //     if (pathname.startsWith("/student")) role = "STUDENT";
  //     else if (pathname.startsWith("/advisor")) role = "ADVISOR";
  //     else if (pathname.startsWith("/admin")) role = "ADMIN";
  //   }
  //   setUserRole(role);
  // }, [pathname]);

  useEffect(() => {
    if (!userRole) {
      setMenuItems([]);
      return;
    }
    setMenuItems(getMenuItems(userRole as UserRole));
  }, [userRole, project]);

  if (menuItems.length === 0) {
    console.log("No menu items, hiding sidebar"); // Debug log
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
              href={`${item.href}?courseId=${id}`}
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