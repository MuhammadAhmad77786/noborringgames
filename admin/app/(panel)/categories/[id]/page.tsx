import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { Category, toPlain } from "@craft/db";
import type { Facet, ImageAsset } from "@craft/shared";
import { EDITORS, requireUser } from "@/lib/auth";
import type { CategoryInput } from "../actions";
import { CategoryForm } from "../CategoryForm";

export const metadata: Metadata = { title: "Category" };
export const dynamic = "force-dynamic";

/** `/categories/new` and `/categories/<id>` share this page. */
export default async function CategoryEditPage({ params }: PageProps<"/categories/[id]">) {
  await requireUser(EDITORS);
  const { id } = await params;
  const all = await Category.find().select("name facet").sort({ name: 1 }).lean();
  const parents = all.map((c) => ({ id: String(c._id), name: c.name, facet: c.facet as Facet }));

  let initial: CategoryInput = {
    name: "",
    slug: "",
    facet: "craftType",
    description: "",
    emoji: "",
    cardColor: "#FDE3D3",
    image: null,
    parentCategory: "",
    showInNavbar: false,
    showInFooter: false,
    sortOrder: 0,
    seo: {},
  };

  if (id !== "new") {
    if (!Types.ObjectId.isValid(id)) notFound();
    const c = await Category.findById(id).lean();
    if (!c) notFound();
    const p = toPlain<Record<string, unknown>>(c);
    initial = {
      id,
      name: String(p.name ?? ""),
      slug: String(p.slug ?? ""),
      facet: p.facet as Facet,
      description: String(p.description ?? ""),
      emoji: String(p.emoji ?? ""),
      cardColor: String(p.cardColor ?? "#FDE3D3"),
      image: (p.image as ImageAsset) ?? null,
      parentCategory: p.parentCategory ? String(p.parentCategory) : "",
      showInNavbar: !!p.showInNavbar,
      showInFooter: !!p.showInFooter,
      sortOrder: Number(p.sortOrder ?? 0),
      seo: (p.seo as CategoryInput["seo"]) ?? {},
    };
  }

  return <CategoryForm initial={initial} parents={parents.filter((x) => x.id !== initial.id)} />;
}
