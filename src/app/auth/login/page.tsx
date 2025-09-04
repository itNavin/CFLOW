"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginAPI } from "@/api/auth/login";
import { setAuthToken, setUserRole } from "@/util/cookies";
import { startTokenRefresh } from "@/util/TokenRefreshInterval";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!email.trim() || !password) {
      setErr("Please enter Email and Password.");
      return;
    }

    setLoading(true);
    try {
      const response = await LoginAPI(email, password)
      if (response.status != 200) {
        throw new Error(response.data.message)
      }
      setAuthToken(response.data.token)
      setUserRole(response.data.user.role)
      startTokenRefresh();
      router.push("/course");
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-neutral-200">
        <div className="p-8 sm:p-10">
          <h1 className="text-4xl font-semibold leading-snug text-neutral-900 font-dbheavent">
            Login to Capstone Report Submission System
          </h1>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              autoComplete="username"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
            />

            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-neutral-400"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-neutral-100"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.98 8.223A10.477 10.477 0 001.458 12c1.632 3.876 5.786 7 10.542 7 
                      1.7 0 3.3-.35 4.73-.98M6.228 6.228A10.45 10.45 0 0112 5c4.756 0 8.91 
                      3.124 10.542 7-.387.958-.939 1.842-1.635 2.61M6.228 6.228 3 3m3.228 
                      3.228l11.544 11.544M21 21l-3.093-3.093"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C4.09 8.124 8.244 5 12 5c3.756 0 7.91 3.124 
                      9.542 7-1.632 3.876-5.786 7-9.542 7-3.756 
                      0-7.91-3.124-9.542-7z"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#3B5C86] px-5 py-2.5 text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
