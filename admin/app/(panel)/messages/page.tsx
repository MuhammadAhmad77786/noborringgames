import type { Metadata } from "next";
import { ContactMessage } from "@craft/db";
import { ADMINS, requireUser } from "@/lib/auth";
import { MessageActions } from "./MessageActions";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireUser(ADMINS);
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  return (
    <>
      <h1 className="page-title mb-3">Contact messages</h1>
      {messages.length === 0 && <div className="card-x text-secondary">No messages yet.</div>}
      {messages.map((m) => (
        <div className="card-x" key={String(m._id)} style={m.read ? { opacity: 0.75 } : undefined}>
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div>
              {!m.read && <span className="badge text-bg-warning me-2">New</span>}
              <strong>{m.subject || "(no subject)"}</strong>
              <div className="small text-secondary">
                {m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {(m as { createdAt?: Date }).createdAt?.toLocaleString()}
              </div>
            </div>
            <MessageActions id={String(m._id)} read={!!m.read} />
          </div>
          <p className="mt-2 mb-0" style={{ whiteSpace: "pre-line" }}>
            {m.message}
          </p>
        </div>
      ))}
    </>
  );
}
