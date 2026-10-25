import type { Metadata } from "next";
import { RegisterPage } from "@/components/templates/RegisterPage";

export const metadata: Metadata = {
  title: "Crear cuenta | Quiizzer",
};

interface RegisterRouteProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function RegisterRoute({ searchParams }: RegisterRouteProps) {
  const params = await searchParams;
  const requestedNext = typeof params.next === "string" ? params.next : "/";
  const next = requestedNext.startsWith("/") ? requestedNext : "/";

  return <RegisterPage next={next} />;
}
