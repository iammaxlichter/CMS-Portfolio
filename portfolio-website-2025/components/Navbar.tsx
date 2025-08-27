// /components/Navbar.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

type Item = { label: string; href: string };
type Row = {
  title: string;
  slug: string;
  kind: "project" | "experience" | "standalone" | "additional";
  published: boolean;
  nav_order: number | null;
};

export default async function Navbar() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pages")
    .select("title, slug, kind, published, nav_order")
    .eq("published", true);

  const rows: Row[] = (data ?? []) as Row[];

  const byOrder = (a: Row, b: Row) =>
    (a.nav_order ?? 1e9) - (b.nav_order ?? 1e9) ||
    a.title.localeCompare(b.title);

  const toItems = (kind: "project" | "experience" | "standalone"): Item[] =>
    rows
      .filter((r) => r.kind === kind)       
      .sort(byOrder)
      .map((r) => ({ label: r.title, href: `/${r.slug}` }));

  return (
    <NavbarClient
      projects={toItems("project")}
      experience={toItems("experience")}
      standalones={toItems("standalone")}
    />
  );
}
