import "server-only";
import { SiteSettings, Subscriber, SETTINGS_KEY } from "@craft/db";

/**
 * Email provider hook. Subscribers are always stored in MongoDB first; if a
 * provider is configured in admin → Settings → Email provider, they're also
 * pushed there. Failures are logged and never block the visitor.
 */
export async function syncSubscriberToProvider(sub: { _id: unknown; email: string; firstName?: string | null }) {
  const settings = await SiteSettings.findOne({ key: SETTINGS_KEY }).select("emailProvider").lean();
  const p = settings?.emailProvider;
  if (!p?.provider || p.provider === "none" || !p.apiKey) return;

  try {
    let res: Response;
    if (p.provider === "mailerlite") {
      res = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: { Authorization: `Bearer ${p.apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: sub.email,
          fields: { name: sub.firstName ?? "" },
          ...(p.listId ? { groups: [p.listId] } : {}),
        }),
      });
    } else {
      // Kit (ConvertKit) v3: subscribe to a form id.
      if (!p.listId) return;
      res = await fetch(`https://api.convertkit.com/v3/forms/${encodeURIComponent(p.listId)}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: p.apiKey, email: sub.email, first_name: sub.firstName ?? "" }),
      });
    }
    if (res.ok) await Subscriber.updateOne({ _id: sub._id }, { $set: { syncedAt: new Date() } });
    else console.error(`[email-provider] ${p.provider} responded ${res.status}`);
  } catch (err) {
    console.error("[email-provider] sync failed", err);
  }
}
