import { ContactMessage, connectDB } from "@craft/db";
import { clientIp, isEmail, json, rateLimit, str } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
  if (str(body.website, 200)) return json({ ok: true }); // honeypot
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60_000)) return json({ error: "Too many messages, try again later." }, 429);

  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const message = str(body.message, 5000);
  if (!name || !message) return json({ error: "Please fill in your name and message." }, 400);
  if (!isEmail(email)) return json({ error: "Please enter a valid email address." }, 400);

  await connectDB();
  await ContactMessage.create({ name, email, subject: str(body.subject, 200), message });
  return json({ ok: true });
}
