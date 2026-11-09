"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteComment, setCommentStatus } from "./actions";

export function CommentActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });
  return (
    <div className="d-flex gap-1 align-items-start">
      {status !== "approved" && (
        <button className="btn btn-sm btn-teal" disabled={pending} onClick={() => act(() => setCommentStatus(id, "approved"))}>
          Approve
        </button>
      )}
      {status !== "spam" && (
        <button className="btn btn-sm btn-outline-dark" disabled={pending} onClick={() => act(() => setCommentStatus(id, "spam"))}>
          Spam
        </button>
      )}
      {status === "approved" && (
        <button className="btn btn-sm btn-outline-dark" disabled={pending} onClick={() => act(() => setCommentStatus(id, "pending"))}>
          Unapprove
        </button>
      )}
      <ConfirmButton onConfirm={() => act(() => deleteComment(id))}>Delete</ConfirmButton>
    </div>
  );
}
