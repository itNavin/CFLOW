import UpdatePasswordForm from "./updatePasswordForm";
import { redirect } from "next/navigation";

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

  return <UpdatePasswordForm token={token} />;
}
