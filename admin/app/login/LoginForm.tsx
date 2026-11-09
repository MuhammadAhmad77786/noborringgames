"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, { error: "", email: "" });
  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="email">
          Email
        </label>
        <input className="form-control form-control-lg" id="email" name="email" type="email" autoComplete="username" required autoFocus defaultValue={state.email} />
      </div>
      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="password">
          Password
        </label>
        <input className="form-control form-control-lg" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <div className="alert alert-danger py-2" role="alert">
          {state.error}
        </div>
      )}
      <button className="btn btn-primary btn-lg w-100" type="submit" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
