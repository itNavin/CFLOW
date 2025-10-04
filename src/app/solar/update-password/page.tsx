import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default async function Page({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams?.token ?? "";
  if (!token) redirect("/solar/invalid-link");

  const res = await fetch(
    `${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  ).catch(() => null);

  const data = await res?.json().catch(() => null);
  if (!data?.valid) redirect("/solar/link-expired");

  return (
    <UpdatePasswordForm
      token={token}
      user={{ id: data.user.id as string, name: data.user.name as string }}
    />
  );
}

// Import the client form
import UpdatePasswordForm from "./updatePasswordForm";
