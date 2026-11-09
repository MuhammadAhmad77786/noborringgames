import Link from "next/link";
import type { Metadata } from "next";
import { Post, User } from "@craft/db";
import { ADMINS, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireUser(ADMINS);
  const [users, counts] = await Promise.all([
    User.find().sort({ name: 1 }).lean(),
    Post.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$author", n: { $sum: 1 } } }]),
  ]);
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Users</h1>
        <Link href="/users/new" className="btn btn-primary">
          + Add user
        </Link>
      </div>
      <div className="table-x">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Posts</th>
              <th>Last login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u._id)}>
                <td>
                  <Link href={`/users/${u._id}`} className="fw-bold text-decoration-none">
                    {u.name}
                  </Link>
                </td>
                <td className="small">{u.email}</td>
                <td className="text-capitalize">{u.role}</td>
                <td>{u.active ? <span className="badge-status badge-approved">active</span> : <span className="badge-status badge-spam">deactivated</span>}</td>
                <td className="text-end">{counts.find((c) => String(c._id) === String(u._id))?.n ?? 0}</td>
                <td className="small">{u.lastLoginAt?.toLocaleString() ?? "never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-x mt-3 small text-secondary">
        <strong>Roles:</strong> Admin — everything. Editor — all posts, categories, tags and comments. Author — only their own posts.
      </div>
    </>
  );
}
