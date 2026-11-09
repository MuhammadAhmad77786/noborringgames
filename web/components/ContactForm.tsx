"use client";

import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send your message.");
      setState("ok");
      setMsg("Message sent! I read every note and usually reply within a few days.");
      form.reset();
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="form-x" onSubmit={onSubmit}>
      <div className="row g-3">
        <div className="col-12 col-sm-6 field">
          <label htmlFor="ct-name">Your name</label>
          <input id="ct-name" name="name" required maxLength={120} autoComplete="name" />
        </div>
        <div className="col-12 col-sm-6 field">
          <label htmlFor="ct-email">Email</label>
          <input id="ct-email" name="email" type="email" required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="ct-subject">Subject</label>
        <input id="ct-subject" name="subject" maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="ct-message">Message</label>
        <textarea id="ct-message" name="message" rows={6} required maxLength={5000} />
      </div>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="ct-website">Website</label>
        <input id="ct-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn-x btn-orange" disabled={state === "loading"}>
        {state === "loading" ? "Sending…" : "Send message"}
      </button>
      <p className={`form-msg ${state === "error" ? "text-danger" : ""}`} role="status" aria-live="polite">
        {state === "ok" || state === "error" ? msg : ""}
      </p>
    </form>
  );
}
