import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <h1 className="page-title mb-3">My account</h1>
      <div className="card-x" style={{ maxWidth: 520 }}>
        <p className="mb-1">
          <strong>{user.name}</strong>
        </p>
        <p className="text-secondary small">
          {user.email} · <span className="text-capitalize">{user.role}</span>
        </p>
      </div>
      <PasswordForm />
    </>
  );
}
