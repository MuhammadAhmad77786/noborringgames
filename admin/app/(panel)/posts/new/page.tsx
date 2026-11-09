import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { emptyPost } from "../empty";
import { PostEditor } from "../PostEditor";
import { loadEditorContext } from "../load";

export const metadata: Metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await requireUser();
  const ctx = await loadEditorContext();
  return <PostEditor initial={{ ...emptyPost(), author: user.id }} ctx={ctx} role={user.role} />;
}
