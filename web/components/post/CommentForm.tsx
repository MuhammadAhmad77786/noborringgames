"use client";

import { useState } from "react";

export function CommentForm({ postId }: { postId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), postId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not post your comment.");
      setState("ok");
      setMsg("Thanks! Your comment is waiting for a quick review and will appear soon.");
      form.reset();
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="form-x mt-4" onSubmit={onSubmit}>
      <h3 className="h4">Leave a comment</h3>
      <p className="small text-secondary">Your email is never published. Comments are moderated.</p>
      <div className="row g-3">
        <div className="col-12 col-sm-6 field">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" name="name" required maxLength={80} autoComplete="name" />
        </div>
        <div className="col-12 col-sm-6 field">
          <label htmlFor="c-email">Email</label>
          <input id="c-email" name="email" type="email" required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-body">Comment</label>
        <textarea id="c-body" name="body" rows={5} required maxLength={4000} />
      </div>
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn-x btn-teal" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Posting…" : "Post comment"}
      </button>
      <p className={`form-msg ${state === "error" ? "text-danger" : ""}`} role="status" aria-live="polite">
        {state === "ok" || state === "error" ? msg : ""}
      </p>
    </form>
  );
}
