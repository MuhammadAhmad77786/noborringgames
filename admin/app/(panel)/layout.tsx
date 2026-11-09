import { Comment, ContactMessage, SiteSettings, SETTINGS_KEY } from "@craft/db";
import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "../login/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isEditor = user.role !== "author";
  const [pending, unread, settings] = await Promise.all([
    isEditor ? Comment.countDocuments({ status: "pending" }) : 0,
    user.role === "admin" ? ContactMessage.countDocuments({ read: false }) : 0,
    SiteSettings.findOne({ key: SETTINGS_KEY }).select("siteTitle").lean(),
  ]);
  const siteUrl = process.env.SITE_URL ?? "/";

  return (
    <div className="admin-shell">
      <Sidebar role={user.role} siteTitle={settings?.siteTitle ?? "Craft Blog"} pendingComments={pending} unreadMessages={unread} />
      <div className="admin-main">
        <header className="admin-topbar">
          <a href={siteUrl} target="_blank" rel="noopener" className="small fw-bold text-decoration-none">
            View site ↗
          </a>
          <div className="d-flex align-items-center gap-3">
            <a href="/account" className="small text-decoration-none text-dark">
              {user.name} · <span className="text-secondary text-capitalize">{user.role}</span>
            </a>
            <form action={logoutAction}>
              <button className="btn btn-sm btn-outline-secondary" type="submit">
                Log out
              </button>
            </form>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
