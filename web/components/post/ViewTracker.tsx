"use client";

import { useEffect } from "react";

/** Counts one view per post per browser session. */
export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `viewed:${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked: still count */
    }
    const body = JSON.stringify({ postId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/views", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/views", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  }, [postId]);
  return null;
}
