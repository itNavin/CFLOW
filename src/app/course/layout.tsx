'use client'

import { getAuthToken } from "@/util/cookies";
import { startTokenRefresh } from "@/util/TokenRefreshInterval";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const navigator = useRouter()
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      // Redirect to login if no token is found
      navigator.replace("/auth/login");
    }
    if (token) {
      // Token is valid, continue with the layout
      startTokenRefresh()
    }
  },[])
  return (
    <div className="bg-white font-dbheavent min-h-screen">
      {children}
    </div>
  );
}