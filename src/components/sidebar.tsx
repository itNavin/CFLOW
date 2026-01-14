"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { getUserRole } from "@/util/cookies";
import { myProject } from "@/types/api/myProject";
import { getMyProjectByCourseAPI } from "@/api/projectName/getMyProjectByCourse";
import { log } from "console";

type UserRole = "student" | "lecturer" | "staff" | "super_admin";

type MenuItems = {
  name: string;
  href: string;
}[];

type SidebarProps = {
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ mobile = false, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [project, setProject] = useState<myProject.MyProject | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItems>([]);
  const courseId = useSearchParams().get("courseId") || "";
  const id = courseId;
  const role = getUserRole();
  const isStudent = role === "student";

  const fetchProjectName = async () => {
    try {
      if (!courseId) return;
      const response = await getMyProjectByCourseAPI(courseId);
      setProject(response.data);    
    } catch (error) {}
  };

  const getMenuItems = (role: UserRole): MenuItems => {
    switch (role) {
      case "student": {
        if (!project || !project.group) {
        return [];
      }
        return [
          { name: project?.group?.productName ?? project?.group.projectName ?? "Unknown", href: "/student" },
          { name: "Announcements", href: "/announcements" },
          { name: "Files", href: "/files" },
          { name: "Assignments", href: "/assignments" },
        ];
      }
      case "lecturer":
        return [
          { name: "Advisor", href: "/advisor" },
          { name: "Announcements", href: "/announcements" },
          { name: "Files", href: "/files" },
          { name: "Assignments", href: "/assignments" },
        ];
      case "staff":
      case "super_admin":
        return [
          { name: "Admin", href: `/admin` },
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

  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  // Mobile variant: render overlay + slide-in panel, visible only when `open` is true
  if (mobile) {
    return (
      <>
        {open && (
          <button
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => onClose && onClose()}
          />
        )}
        <div
          id="mobile-sidebar"
          className={
            "fixed inset-y-0 left-0 z-50 w-64 border-r bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden " +
            (open ? "translate-x-0" : "-translate-x-full")
          }
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <span className="font-semibold">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={() => onClose && onClose()}
            >
              <span aria-hidden className="text-xl">×</span>
            </button>
          </div>
          <nav className="p-4 pb-3 space-y-2 font-dbheavent">
            {menuItems.map((item) => {
              const groupId = project?.group?.id ? String(project.group.id) : "";
              const href = `${item.href}?courseId=${id}${project?.group?.id ? `&groupId=${project.group.id}` : ''}`;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={() => onClose && onClose()}
                  className={`block rounded px-3 py-2 transition text-xl ${
                    isActive
                      ? "bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white"
                      : "hover:bg-gray-100 text-black"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  // Desktop/default variant
  return (
    <aside className="relative hidden lg:flex w-50 h-full bg-white border-r">
      <nav className="flex flex-col py-6 space-y-2 font-dbheavent">
        {menuItems.map((item) => {
          const groupId = project?.group?.id ? String(project.group.id) : "";

          const linkHref = isStudent
            ? {
                pathname: item.href,
                query: {
                  courseId: String(id),
                  groupId: groupId,
                },
              }
            : { pathname: item.href, query: { courseId: String(id) } };
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={`${item.href}?courseId=${id}${project?.group?.id ? `&groupId=${project.group.id}` : ''}`}
              className={`block w-50 h-[59px] flex items-center text-left px-6 text-2xl font-semibold transition ${
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