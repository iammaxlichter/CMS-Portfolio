// lib/admin/pages.ts
import { createClient } from "@/lib/supabase/server";

export const ALL_KINDS = ["project", "experience", "additional", "standalone"] as const;
export type Kind = (typeof ALL_KINDS)[number];

export function parseKindsParam(raw?: string): Kind[] {
  if (!raw) return [];
  const set = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is Kind => (ALL_KINDS as readonly string[]).includes(s))
  );
  return Array.from(set) as Kind[];
}

export function buildHref(nextKinds: Kind[], sort: "asc" | "desc"): string {
  const usp = new URLSearchParams();
  if (nextKinds.length > 0) usp.set("kinds", nextKinds.join(","));
  if (sort === "desc") usp.set("sort", "desc");
  const q = usp.toString();
  return q ? `/admin?${q}` : "/admin";
}

export async function getPages({
  kinds = [],
  sort = "asc",
}: {
  kinds?: Kind[];
  sort?: "asc" | "desc";
}) {
  const supabase = await createClient();
  let query = supabase
    .from("pages")
    .select("id, title, slug, kind, published, created_at, nav_order");

  if (kinds.length > 0) query = query.in("kind", kinds as string[]);
  query = query.order("title", { ascending: sort === "asc" });

  const { data, error } = await query;
  if (error) throw new Error(`pages fetch failed: ${error.message}`);
  return data ?? [];
}
