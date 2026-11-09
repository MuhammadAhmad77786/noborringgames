import dns from "node:dns";
import mongoose from "mongoose";

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { __craftMongoose?: Cached };
const cached: Cached = globalForMongoose.__craftMongoose ?? { conn: null, promise: null };
globalForMongoose.__craftMongoose = cached;

/**
 * Connects once per server instance (re-used across hot reloads and
 * serverless invocations). Both apps share the same MONGODB_URI.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  // No `await` may happen before cached.promise is set, otherwise concurrent
  // callers (e.g. Promise.all in a layout) would each start their own connect().
  if (!cached.promise) {
    // Optional local fix for ISPs whose DNS can't resolve Atlas "mongodb+srv" records
    // (error: queryTxt ETIMEOUT). e.g. MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 — leave unset on Vercel.
    const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",").map((s) => s.trim()).filter(Boolean);
    if (dnsServers?.length) dns.setServers(dnsServers);
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 10 });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

/** Converts lean docs (ObjectIds, Dates) into plain JSON for Server -> Client props. */
export function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
