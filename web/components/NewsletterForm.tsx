"use client";

import { useState } from "react";

export function NewsletterForm({ buttonText = "SEND ME CRAFTS" }: { buttonText?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "newsletter" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState("ok");
      setMsg("You're in! Check your inbox for your first printable. ✂️");
      form.reset();
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <>
      <form className="newsletter-form" onSubmit={onSubmit} noValidate={false}>
        <label htmlFor="nl-first" className="visually-hidden-x">
          First name
        </label>
        <input id="nl-first" name="firstName" placeholder="First name" autoComplete="given-name" maxLength={80} />
        <label htmlFor="nl-email" className="visually-hidden-x">
          Email address
        </label>
        <input id="nl-email" name="email" type="email" placeholder="Email address" autoComplete="email" required />
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="nl-website">Website</label>
          <input id="nl-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <button type="submit" className="btn-x btn-orange" disabled={state === "loading"}>
          {state === "loading" ? "Sending…" : buttonText}
        </button>
      </form>
      <p className="form-msg" role="status" aria-live="polite">
        {state === "ok" || state === "error" ? msg : ""}
      </p>
    </>
  );
}
