// app/admin/reorder/page.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import NavOrderBoard from "@/components/admin/editor/NavOrderBoard";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ReorderNavPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return null;

  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, kind, published, created_at, nav_order")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="rounded bg-neutral-200 px-3 py-2 text-sm text-black hover:bg-neutral-300">
          ← Back to Admin
        </Link>
        <h1 className="text-xl font-semibold">Reorder Navbar Items</h1>
      </div>

      <p className="text-sm text-neutral-500">
        Drag items to change order inside Projects, Experience, and Standalone.
        Only published pages appear in the menus.
      </p>

      <NavOrderBoard initialPages={(pages ?? []) as any} action={saveNavOrder} />
    </main>
  );
}

/* ---------- server action (local to this page) ---------- */
async function saveNavOrder(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  const projects    = JSON.parse(String(formData.get("projects") ?? "[]")) as string[];
  const experience  = JSON.parse(String(formData.get("experience") ?? "[]")) as string[];
  const standalones = JSON.parse(String(formData.get("standalones") ?? "[]")) as string[];

  const updateGroup = async (ids: string[]) => {
    for (let i = 0; i < ids.length; i++) {
      await supabase.from("pages").update({ nav_order: i }).eq("id", ids[i]);
    }
  };

  await Promise.all([updateGroup(projects), updateGroup(experience), updateGroup(standalones)]);

  // refresh navbar + this page
  revalidatePath("/");
  revalidatePath("/admin/reorder");
}
