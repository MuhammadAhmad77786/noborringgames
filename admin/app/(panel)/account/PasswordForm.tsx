"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { changeOwnPassword } from "../users/actions";

export function PasswordForm() {
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <form
      className="card-x"
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
      {toast.node}
      <h2>Change password</h2>
      <label className="form-label small fw-bold" htmlFor="pw-cur">
        Current password
      </label>
      <input id="pw-cur" type="password" autoComplete="current-password" className="form-control mb-2" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
      <label className="form-label small fw-bold" htmlFor="pw-new">
        New password (10+ characters)
      </label>
      <input id="pw-new" type="password" autoComplete="new-password" minLength={10} className="form-control mb-3" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
      <button className="btn btn-teal" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
