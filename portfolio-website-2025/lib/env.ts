// lib/env.ts
export function parseSupabaseRef(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.host;
    const m = host.match(/^([a-z0-9]{15,})\.supabase\.co$/i);
    return { host, projectRef: m?.[1] ?? host };
  } catch {
    return null;
  }
}

export function envBadgeClasses(env: string) {
  const e = env.toLowerCase();
  if (e === "production") return "bg-red-100 text-red-800";
  if (e === "preview") return "bg-amber-100 text-amber-800";
  if (e === "development") return "bg-blue-100 text-blue-800";
  return "bg-neutral-200 text-neutral-800";
}
