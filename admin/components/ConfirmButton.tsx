"use client";

import { useState } from "react";

/** Two-step inline confirmation instead of window.confirm(). */
export function ConfirmButton({
  onConfirm,
  children,
  confirmText = "Yes, delete",
  className = "btn btn-sm btn-outline-danger",
  disabled,
}: {
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className={className} onClick={() => setArmed(true)} disabled={disabled}>
        {children}
      </button>
    );
  }
  return (
    <span className="d-inline-flex gap-1">
      <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={async () => {
          await onConfirm();
          setArmed(false);
        }}
      >
        {confirmText}
      </button>
      <button type="button" className="btn btn-sm btn-light" onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  );
}
