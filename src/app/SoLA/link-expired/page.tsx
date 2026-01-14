// app/solar/link-expired/page.tsx
"use client";

import * as React from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function LinkExpired() {
  const [userIdOrEmail, setUserIdOrEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<null | { type: "success" | "error"; text: string }>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!userIdOrEmail.trim()) {
      setMsg({ type: "error", text: "Please enter your Solar ID (e.g., Sol#name) or your email." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-reset-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdOrEmail: userIdOrEmail.trim() }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (res.ok) {
        setMsg({ type: "success", text: data?.message ?? "A new link has been sent to your email." });
      } else {
        setMsg({ type: "error", text: data?.message ?? "Failed to send a new link." });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: String(e?.message ?? e) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-2">This reset link has expired</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your <strong>Solar ID</strong> (e.g., <code>Sol#someone</code>) or your <strong>email</strong> and we'll send a new link.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Sol#yourid or you@example.com"
            value={userIdOrEmail}
            onChange={(e) => setUserIdOrEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send me a new link"}
          </button>
          {msg && (
            <p className={`text-sm ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
