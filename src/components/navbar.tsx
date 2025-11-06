"use client";

import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Bell, Home, User, Settings } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import NotificationPopup from "./notification";
import Sidebar from "./sidebar";
import { getCourse, Course } from "@/types/api/course";
import { getCourseAPI } from "@/api/course/getCourseByUser";
import { getUserRole } from "@/util/cookies";
import { getCourseNameAPI } from "@/api/course/getCourseName";
import { getCoursename } from "@/types/api/course";
import { isCanUpload } from "@/util/RoleHelper";
import { getActivityLogByUserAPI } from "@/api/notification/getActivityLogByUser";
import { notification } from "@/types/api/notification";
import { getProfileAPI } from "@/api/profile/getProfile";

export default function Navbar() {
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");

  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<getCoursename.CourseName | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [notifications, setNotifications] = useState<notification.activity[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!userRole || !courseId || courseId.trim() === "") {
      setLoading(false);
      setCourseData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);


      const res = await getCourseNameAPI(courseId);
      setCourseData(res.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses");
      setCourseData(null);
    } finally {
      setLoading(false);
    }
  }, [userRole, courseId]);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    // fetch profile name for navbar display
    let mounted = true;
    getProfileAPI()
      .then((res) => {
        if (!mounted) return;
        const u = res?.data?.profile?.user;
        const n = u?.name ?? u?.id ?? null;
        setUserName(n);
      })
      .catch((e) => {
        // fail silently — navbar can continue without name
        console.debug("Failed to load profile for navbar:", e);
        setUserName(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchCourses();
    setCanUpload(isCanUpload());
  }, [fetchCourses]);

  useEffect(() => {
    if (showNotification) {
      setNotifLoading(true);
      setNotifError(null);
      getActivityLogByUserAPI()
        .then(data => setNotifications(data.activities))
        .catch(e => setNotifError("Failed to fetch notifications"))
        .finally(() => setNotifLoading(false));
    }
  }, [showNotification]);

  return (
    <>
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm font-dbheavent">
        {/* LEFT: logo + hamburger */}
        <div className="flex items-center gap-4 shrink-0 hidden lg:block">
          {courseId && (
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Open main menu"
              aria-controls="mobile-sidebar"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <span aria-hidden className="text-2xl leading-none">☰</span>
            </button>
          )}

          <Image
            src="/image/blue-logo.svg"
            alt="CFLOW Logo"
            width={160}
            height={48}
            className="h-18 w-auto"
          />
        </div>

        {/* MIDDLE: course title (only when courseId) */}
        {courseId && (
          <div className="flex-1 min-w-0 px-4">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
              {courseData?.coursename ?? ""}
            </div>
          </div>
        )}

        {/* RIGHT: user + icons */}
        <div className="flex items-center gap-5 shrink-0">
          {userName && (
            <span className="hidden md:inline text-3xl font-bold text-slate-700 pr-2 border-r border-slate-100">
              {userName}
            </span>
          )}
          {userRole === "staff" && (
            <Settings
              className="w-6 h-6 text-black cursor-pointer"
              onClick={() => router.push("/settings")}
            />
          )}
          <div
            className="relative cursor-pointer"
            onClick={() => setShowNotification(!showNotification)}
          >
            <Bell className="w-6 h-6 text-black" />
          </div>
          <Home className="w-6 h-6 text-black cursor-pointer" onClick={() => router.push("/course")} />
          <User className="w-6 h-6 text-black cursor-pointer" onClick={() => router.push("/profile")} />
        </div>
      </div>


      {/* Mobile sidebar instance (slide-in) */}
      {courseId && <Sidebar mobile open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}

      {showNotification && (
        <div className="absolute right-6 top-16 z-50 bg-white rounded-lg shadow-lg w-96 max-h-[60vh] overflow-y-auto border">
          <div className="sticky top-0 z-10 bg-white flex justify-between items-center px-4 py-2 border-b">
            <span className="font-bold text-lg">Notifications</span>
            <button className="text-gray-500 cursor-pointer text-3xl text-red-500" onClick={() => setShowNotification(false)}>×</button>
          </div>
          {notifLoading && <div className="p-4 text-gray-500">Loading...</div>}
          {notifError && <div className="p-4 text-red-500">{notifError}</div>}
          {!notifLoading && !notifError && notifications.length === 0 && (
            <div className="p-4 text-gray-500">No notifications.</div>
          )}
          {!notifLoading && !notifError && notifications.map(n => (
            <div key={n.id} className="px-4 py-3 border-b last:border-b-0">
              <div className="text-xl font-semibold">{n.title}</div>
              <div className="text-lg text-gray-600">{n.description}</div>
              <div className="text-base text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}