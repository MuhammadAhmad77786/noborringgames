import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="stripe mb-4 rounded" />
        <h1 className="h3 fw-black mb-1" style={{ fontWeight: 900 }}>
          Craft room admin
        </h1>
        <p className="text-secondary mb-4">Log in to manage posts, printables and settings.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
