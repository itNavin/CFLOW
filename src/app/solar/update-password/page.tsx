// app/solar/update-password/page.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function UpdateSolarPasswordPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId") ?? "";

  const [userId, setUserId] = React.useState(initialUserId);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<null | { type: "success" | "error"; text: string }>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!userId.trim() || !oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/auth/update-solar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ type: "success", text: data?.message ?? "Password updated successfully." });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data?.message ?? "Failed to update password." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: String(err?.message ?? err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Update Solar Password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">User ID</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. Sol#solar08"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Old Password (Temporary)</label>
            <input
              className="w-full rounded border px-3 py-2"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Temporary password from email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              className="w-full rounded border px-3 py-2"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <input
              className="w-full rounded border px-3 py-2"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>

          {message && (
            <p className={`text-sm mt-2 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
