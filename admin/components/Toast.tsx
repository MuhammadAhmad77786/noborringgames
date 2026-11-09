"use client";

import { useCallback, useEffect, useState } from "react";

export type ToastMsg = { kind: "ok" | "err"; text: string } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastMsg>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "ok" ? 2500 : 6000);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((kind: "ok" | "err", text: string) => setToast({ kind, text }), []);
  const node = toast ? (
    <div className={`toast-x ${toast.kind}`} role={toast.kind === "err" ? "alert" : "status"}>
      {toast.text}
    </div>
  ) : null;
  return { show, node };
}
