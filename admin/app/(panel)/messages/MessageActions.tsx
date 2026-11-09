"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteMessage, markMessage } from "./actions";

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  return (
    <div className="d-flex gap-1">
      <button
        className="btn btn-sm btn-outline-dark"
        onClick={async () => {
          await markMessage(id, !read);
          router.refresh();
        }}
      >
        Mark {read ? "unread" : "read"}
      </button>
      <ConfirmButton
        onConfirm={async () => {
          await deleteMessage(id);
          router.refresh();
        }}
      >
        Delete
      </ConfirmButton>
    </div>
  );
}
