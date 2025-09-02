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

// read role from localStorage
// const readRoleFromLocalStorage = (): UserRole | null => {
//   if (typeof window === "undefined") return null;
//   try {
//     const userData = localStorage.getItem("userData");
//     if (!userData) return null;
//     const user = JSON.parse(userData);

//     const candidates = [
//       user?.role,
//       user?.role?.name,
//       user?.user?.role,
//       user?.user?.role?.name,
//     ];

//     for (const c of candidates) {
//       const norm = normalizeRole(c);
//       if (norm) return norm;
//     }
//   } catch (e) {
//     console.error("Error getting user role:", e);
//   }
//   return null;
// };

// project name for student
// const getProjectName = (): string => {
//   try {
//     const courseApiData = localStorage.getItem("courseApiResponse");
//     if (courseApiData) {
//       const response = JSON.parse(courseApiData);
//       if (response.courses && response.courses.length > 0) {
//         for (const courseItem of response.courses) {
//           if (courseItem.groupsAsMember?.length > 0) {
//             const group = courseItem.groupsAsMember[0];
//             if (group.projectName) return group.projectName;
//           }
//         }
//       }
//     }
//     const courseData = localStorage.getItem("selectedCourse");
//     if (courseData) {
//       const course = JSON.parse(courseData);
//       return course.name || "Dashboard";
//     }
//   } catch (err) {
//     console.error("Error getting project name:", err);
//   }
//   return "Dashboard";
// };
// const { courseId } = useParams<{ courseId: string  }>();
// const id = Number(courseId);
// const getMenuItems = (role: UserRole | null) => {
//   switch (role) {
//     case "STUDENT":
//       return [
//         { name: getProjectName(), href: "/student" },
//         { name: "Announcements", href: "/announcements" },
//         { name: "Files", href: "/files" },
//         { name: "Assignments", href: "/assignments/student" },
//       ];
//     case "ADVISOR":
//       return [
//         { name: "Advisor", href: "/advisor" },
//         { name: "Announcements", href: "/announcements" },
//         { name: "Files", href: "/files" },
//         { name: "Assignments", href: "/assignments/advisor" },
//       ];
//     case "ADMIN":
//     case "SUPER_ADMIN":
//       return [
//         { name: "Admin", href: "/admin" },
//         { name: "Announcements", href: `/announcements/${courseId}` },
//         { name: "Files", href: "/files" },
//         { name: "Assignments", href: "/assignments" },
//       ];
//     default:
//       return [];
//   }
// };

type MenuItems = {
  name: string;
  href: string;
}[];

export default function Sidebar() {
  const pathname = usePathname();
  const [projectName, setProjectName] = useState<myProject.MyProject>();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItems>([]);
  const courseId = useSearchParams().get("courseId") || "";
  const id = Number(courseId);

  const fetchProjectName = async () => {
    try {
      if (!courseId) return;
      const id = Number(courseId);
      const response = await getMyProjectByCourseAPI(id);
      setProjectName(response.data);
    } catch (error) {}
  };

  const getMenuItems = (role: UserRole): MenuItems => {
    switch (role) {
      case "STUDENT": {
        if (projectName === undefined) {
          console.log("projectName is undefined");
          return [];
        }
        return [
          { name: projectName.projectname, href: "/student" },
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
