import UpdatePasswordForm from "./updatePasswordForm";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type PageSearchParams = {
  token?: string | string[];
};

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawToken = resolvedSearchParams?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] ?? "" : rawToken ?? "";

  if (!token) redirect("/solar/invalid-link");

  const res = await fetch(
    `${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  ).catch(() => null);

  const data = await res?.json().catch(() => null);

  if (!data?.valid || !data?.user) {
    redirect("/solar/link-expired");
  }

  return (
    <UpdatePasswordForm
      token={token}
      user={{ id: data.user.id as string, name: data.user.name as string }}
    />
  );
}
