// app/admin/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPage(formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const raw = String(formData.get("kind") ?? "standalone");
  const allowed = new Set(["project", "experience", "additional", "standalone"]);
  const kind = allowed.has(raw)
    ? (raw as "project" | "experience" | "additional" | "standalone")
    : ("standalone" as const);

  const { data: last } = await supabase
    .from("pages")
    .select("nav_order")
    .eq("kind", kind)
    .order("nav_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (last?.nav_order ?? -1) + 1;

  await supabase
    .from("pages")
    .insert({ title, slug, kind, published: false, nav_order: nextOrder });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function deleteDraft(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { data: page } = await supabase
    .from("pages")
    .select("published")
    .eq("id", id)
    .maybeSingle();

  if (!page || page.published) return;

  await supabase.from("content_blocks").delete().eq("page_id", id);
  await supabase.from("pages").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/");
}
