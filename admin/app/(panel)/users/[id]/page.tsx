import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { User, toPlain } from "@craft/db";
import type { ImageAsset, Role } from "@craft/shared";
import { ADMINS, requireUser } from "@/lib/auth";
import type { UserInput } from "../actions";
import { UserForm } from "../UserForm";

export const metadata: Metadata = { title: "User" };
export const dynamic = "force-dynamic";

export default async function UserEditPage({ params }: PageProps<"/users/[id]">) {
  const me = await requireUser(ADMINS);
  const { id } = await params;
  let initial: UserInput = { name: "", email: "", role: "author", bio: "", avatar: null, socialLinks: {}, active: true, password: "" };
  if (id !== "new") {
    if (!Types.ObjectId.isValid(id)) notFound();
    const u = await User.findById(id).lean();
    if (!u) notFound();
    const x = toPlain<Record<string, unknown>>(u);
    initial = {
      id,
      name: String(x.name),
      email: String(x.email),
      role: x.role as Role,
      bio: String(x.bio ?? ""),
      avatar: (x.avatar as ImageAsset) ?? null,
      socialLinks: (x.socialLinks as UserInput["socialLinks"]) ?? {},
      active: !!x.active,
    };
  }
  return <UserForm initial={initial} isSelf={initial.id === me.id} />;
}
