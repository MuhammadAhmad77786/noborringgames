import { Subscriber, connectDB } from "@craft/db";
import { getCurrentUser } from "@/lib/auth";

function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return new Response("Forbidden", { status: 403 });
  await connectDB();
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 100);
  const source = url.searchParams.get("source");
  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ email: rx }, { firstName: rx }];
  }
  if (source === "newsletter" || source === "printable") filter.source = source;

  const subs = await Subscriber.find(filter).sort({ createdAt: -1 }).populate("post", "title slug").lean();
  const lines = [
    ["email", "first_name", "source", "post", "created_at"].join(","),
    ...subs.map((s) =>
      [
        s.email,
        s.firstName,
        s.source,
        (s.post as unknown as { slug?: string })?.slug ?? "",
        (s as { createdAt?: Date }).createdAt?.toISOString() ?? "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
