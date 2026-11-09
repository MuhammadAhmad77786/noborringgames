"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ROLES, type Role } from "@craft/shared";
import { ImageField } from "@/components/ImageField";
import { useToast } from "@/components/Toast";
import { changeOwnPassword, resetPassword, saveUser, type UserInput } from "./actions";

export function UserForm({ initial, isSelf }: { initial: UserInput; isSelf: boolean }) {
  const [u, setU] = useState(initial);
  const [temp, setTemp] = useState<string | null>(null);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const set = <K extends keyof UserInput>(k: K, v: UserInput[K]) => setU((x) => ({ ...x, [k]: v }));

  return (
    <>
      {toast.node}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await saveUser(u);
            if (!r.ok) return toast.show("err", r.error);
            toast.show("ok", "User saved");
            if (r.tempPassword) setTemp(r.tempPassword);
            if (!initial.id) router.replace(`/users/${r.id}`);
            else router.refresh();
          });
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="page-title">{initial.id ? initial.name : "Add user"}</h1>
          <button className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
        {temp && (
          <div className="alert alert-warning">
            Temporary password (shown once — share it securely): <code className="fs-6">{temp}</code>
          </div>
        )}
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card-x">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label fw-bold small" htmlFor="u-name">
                    Name
                  </label>
                  <input id="u-name" className="form-control" required value={u.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small" htmlFor="u-email">
                    Email
                  </label>
                  <input id="u-email" type="email" className="form-control" required value={u.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small" htmlFor="u-role">
                    Role
                  </label>
                  <select id="u-role" className="form-select text-capitalize" value={u.role} disabled={isSelf} onChange={(e) => set("role", e.target.value as Role)}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 pt-4">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="u-active" checked={u.active} disabled={isSelf} onChange={(e) => set("active", e.target.checked)} />
                    <label className="form-check-label" htmlFor="u-active">
                      Active (can log in)
                    </label>
                  </div>
                </div>
                {!initial.id && (
                  <div className="col-12">
                    <label className="form-label fw-bold small" htmlFor="u-pw">
                      Password
                    </label>
                    <input id="u-pw" type="password" autoComplete="new-password" className="form-control" value={u.password ?? ""} onChange={(e) => set("password", e.target.value)} placeholder="Leave blank to generate a temporary password" />
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-bold small" htmlFor="u-bio">
                    Bio (shown in author boxes)
                  </label>
                  <textarea id="u-bio" className="form-control" rows={3} value={u.bio} onChange={(e) => set("bio", e.target.value)} />
                </div>
                {(["website", "pinterest", "instagram", "facebook"] as const).map((k) => (
                  <div className="col-md-6" key={k}>
                    <label className="form-label small fw-bold text-capitalize" htmlFor={`u-${k}`}>
                      {k}
                    </label>
                    <input id={`u-${k}`} type="url" className="form-control" value={u.socialLinks[k] ?? ""} onChange={(e) => set("socialLinks", { ...u.socialLinks, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card-x">
              <ImageField label="Avatar" folder="authors" value={u.avatar} onChange={(v) => set("avatar", v)} />
            </div>
            {initial.id && !isSelf && (
              <div className="card-x">
                <h2>Reset password</h2>
                <p className="small text-secondary">Generates a new temporary password and logs the user out everywhere.</p>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await resetPassword(initial.id!);
                      if (r.ok) setTemp(r.tempPassword);
                      else toast.show("err", r.error);
                    })
                  }
                >
                  Reset password
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {isSelf && (
        <form
          className="card-x mt-3"
          style={{ maxWidth: 520 }}
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await changeOwnPassword(pw.current, pw.next);
              if (r.ok) {
                toast.show("ok", "Password changed");
                setPw({ current: "", next: "" });
              } else toast.show("err", r.error);
            });
          }}
        >
          <h2>Change my password</h2>
          <input aria-label="Current password" type="password" autoComplete="current-password" className="form-control mb-2" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          <input aria-label="New password" type="password" autoComplete="new-password" className="form-control mb-2" placeholder="New password (10+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          <button className="btn btn-teal" disabled={pending}>
            Change password
          </button>
        </form>
      )}
    </>
  );
}
