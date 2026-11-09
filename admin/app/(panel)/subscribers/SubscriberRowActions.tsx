"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteSubscriber } from "./actions";

export function SubscriberRowActions({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      onConfirm={async () => {
        const r = await deleteSubscriber(id);
        if (r.ok) router.refresh();
      }}
    >
      Delete
    </ConfirmButton>
  );
}
