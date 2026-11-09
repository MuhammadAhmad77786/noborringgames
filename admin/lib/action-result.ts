export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Wraps a server action body so thrown errors become `{ ok: false, error }`. */
export async function attempt<T extends object>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (err) {
    const e = err as { code?: number; message?: string; digest?: string };
    // Let Next redirects/notFound bubble.
    if (typeof e?.digest === "string" && e.digest.startsWith("NEXT_")) throw err;
    if (e?.code === 11000) return { ok: false, error: "That slug or email is already in use." };
    console.error(err);
    return { ok: false, error: e?.message || "Something went wrong." };
  }
}
