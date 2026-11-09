import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { MediaLibrary } from "./MediaLibrary";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const user = await requireUser();
  return (
    <>
      <h1 className="page-title mb-3">Media library</h1>
      <MediaLibrary canDelete={user.role !== "author"} />
    </>
  );
}
