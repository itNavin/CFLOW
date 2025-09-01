"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

// read role from localStorage
const readRoleFromLocalStorage = (): UserRole | null => {
  if (typeof window === "undefined") return null;
  try {
    const userData = localStorage.getItem("userData");
    if (!userData) return null;
    const user = JSON.parse(userData);

    const candidates = [
      user?.role,
      user?.role?.name,
      user?.user?.role,
      user?.user?.role?.name,
    ];

    for (const c of candidates) {
      const norm = normalizeRole(c);
      if (norm) return norm;
    }
  } catch (e) {
    console.error("Error getting user role:", e);
  }
  return null;
};

// project name for student
const getProjectName = (): string => {
  try {
    const courseApiData = localStorage.getItem("courseApiResponse");
    if (courseApiData) {
      const response = JSON.parse(courseApiData);
      if (response.courses && response.courses.length > 0) {
        for (const courseItem of response.courses) {
          if (courseItem.groupsAsMember?.length > 0) {
            const group = courseItem.groupsAsMember[0];
            if (group.projectName) return group.projectName;
          }
        }
      }
    }
    const courseData = localStorage.getItem("selectedCourse");
    if (courseData) {
      const course = JSON.parse(courseData);
      return course.name || "Dashboard";
    }
  } catch (err) {
    console.error("Error getting project name:", err);
  }
  return "Dashboard";
};

const getMenuItems = (role: UserRole | null) => {
  switch (role) {
    case "STUDENT":
      return [
        { name: getProjectName(), href: "/student" },
        { name: "Announcements", href: "/announcements" },
        { name: "Files", href: "/files" },
        { name: "Assignments", href: "/assignments/student" },
      ];
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
        { name: "Admin", href: "/admin" },
        { name: "Announcements", href: "/announcements" },
        { name: "Files", href: "/files" },
        { name: "Assignments", href: "/assignments" },
      ];
    default:
      return [];
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [menuItems, setMenuItems] = useState<
    Array<{ name: string; href: string }>
  >([]);

  useEffect(() => {
    let role = readRoleFromLocalStorage();
    if (!role) {
      if (pathname.startsWith("/student")) role = "STUDENT";
      else if (pathname.startsWith("/advisor")) role = "ADVISOR";
      else if (pathname.startsWith("/admin")) role = "ADMIN";
    }
    setUserRole(role);
  }, [pathname]);

  useEffect(() => {
    setMenuItems(getMenuItems(userRole));
  }, [userRole]);

  if (menuItems.length === 0) {
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
              href={item.href}
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
