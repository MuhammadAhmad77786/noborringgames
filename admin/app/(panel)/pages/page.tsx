import Link from "next/link";
import type { Metadata } from "next";
import { Page } from "@craft/db";
import { ADMINS, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Pages" };
export const dynamic = "force-dynamic";

export default async function PagesList() {
  await requireUser(ADMINS);
  const pages = await Page.find().sort({ title: 1 }).select("title slug updatedAt").lean();
  const site = process.env.SITE_URL ?? "";
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Pages</h1>
        <Link href="/pages/new" className="btn btn-primary">
          + New page
        </Link>
      </div>
      <p className="text-secondary small">About and Contact use their page content as the intro text; legal pages are rendered in full.</p>
      <div className="table-x">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>URL</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={String(p._id)}>
                <td>
                  <Link href={`/pages/${p._id}`} className="fw-bold text-decoration-none">
                    {p.title}
                  </Link>
                </td>
                <td className="small">
                  <a href={`${site}/${p.slug}`} target="_blank" rel="noopener">
                    /{p.slug}
                  </a>
                </td>
                <td className="small">{(p as { updatedAt?: Date }).updatedAt?.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
