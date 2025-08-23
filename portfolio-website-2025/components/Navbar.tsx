// /components/blocks/Navbar.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

type Item = { label: string; href: string };

export default async function Navbar() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pages")
    .select("title, slug, kind, published")
    .eq("published", true);

  if (error) {
    console.error("Navbar query error:", error);
    return (
      <NavbarClient
        projects={[{ label: "All Projects", href: "/projects" }]}
        experience={[{ label: "All Experience", href: "/experience" }]}
      />
    );
  }

  const rows = (data ?? []).filter(
    (r) => r.kind === "project" || r.kind === "experience"
  );

  const byTitle = (a: any, b: any) =>
    String(a.title ?? "").localeCompare(String(b.title ?? ""));

  const projects: Item[] = [
    { label: "All Projects", href: "/projects" },
    ...rows
      .filter((r) => r.kind === "project")
      .sort(byTitle)
      .map((r) => ({ label: r.title as string, href: `/${r.slug}` })),
  ];

  const experience: Item[] = [
    { label: "All Experience", href: "/experience" },
    ...rows
      .filter((r) => r.kind === "experience")
      .sort(byTitle)
      .map((r) => ({ label: r.title as string, href: `/${r.slug}` })),
  ];

  return <NavbarClient projects={projects} experience={experience} />;
}