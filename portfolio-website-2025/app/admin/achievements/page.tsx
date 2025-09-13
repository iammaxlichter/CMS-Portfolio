// app/admin/achievements/page.tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AchievementsManager, { type Row as AchRow } from "@/components/admin/achievements/AchievementsManager";

type Row = {
  id: string;
  text: string;
  position: number;
  published: boolean;
};

export default async function AchievementsAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/admin/achievements");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  const { data: rowsData } = await supabase
    .from("contact_achievements")
    .select("id,text,position,published")
    .order("position", { ascending: true });

  const rows: Row[] = rowsData ?? [];

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-7">
      <Link
        href="/admin"
        className="inline-block rounded bg-neutral-200 px-3 py-2 text-sm text-black hover:bg-neutral-300"
      >
        ← Back to Admin
      </Link>

      <h1 className="text-2xl font-semibold">Contact Page Achievements</h1>

      {/* Create */}
      <form action={createAchievement} className="flex gap-2">
        <input
          name="text"
          placeholder="New achievement text"
          className="flex-1 rounded border p-2 bg-white text-sm"
          required
        />
        <button className="rounded bg-black text-white px-3 py-2 text-sm">Add</button>
      </form>

      {/* Mass edit + reorder + single save */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Edit & Reorder</h2>
        <AchievementsManager
          initial={rows as AchRow[]}
          saveAllAction={saveAllAchievements}
          deleteAction={deleteAchievement}
        />
      </section>
    </main>
  );
}

async function createAchievement(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const text = String(formData.get("text") || "").trim();
  if (!text) return;

  const { data: max } = await supabase
    .from("contact_achievements")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos = (max?.position ?? 0) + 1;

  await supabase
    .from("contact_achievements")
    .insert({ text, position: nextPos, published: true });

  revalidatePath("/admin/achievements");
  revalidatePath("/contact");
  redirect("/admin/achievements");
}

async function saveAllAchievements(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return;

  const ids = formData.getAll("ids").map(String);

  const target = ids.map((id, i) => {
    const text = String(formData.get(`text-${id}`) ?? "").trim();
    const published = formData.get(`published-${id}`) != null;
    const position = i + 1; 
    return { id, text, published, position };
  });

  const OFFSET = 1000; 
  for (let i = 0; i < target.length; i++) {
    const { id } = target[i];
    const tempPos = OFFSET + i + 1;
    const { error } = await supabase
      .from("contact_achievements")
      .update({ position: tempPos })
      .eq("id", id);
    if (error) {
      console.error("temp position update error:", error);
      return;
    }
  }

  // --- PHASE 2: write final text/published/position ---
  for (const row of target) {
    const { error } = await supabase
      .from("contact_achievements")
      .update({
        text: row.text,
        published: row.published,
        position: row.position,
      })
      .eq("id", row.id);
    if (error) {
      console.error("final update error:", error);
      return;
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/achievements");
  revalidatePath("/contact");
}


async function deleteAchievement(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  const id = String(formData.get("id"));

  const { data: row } = await supabase
    .from("contact_achievements")
    .select("position")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("contact_achievements").delete().eq("id", id);

  if (row?.position != null) {
    const { data: rest } = await supabase
      .from("contact_achievements")
      .select("id,position")
      .gt("position", row.position)
      .order("position", { ascending: true });
    if (rest) {
      for (const r of rest) {
        await supabase
          .from("contact_achievements")
          .update({ position: r.position - 1 })
          .eq("id", r.id);
      }
    }
  }

  revalidatePath("/admin/achievements");
  revalidatePath("/contact");
  redirect("/admin/achievements");
}
