// app/admin/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import NavOrderBoard from "@/components/admin/NavOrderBoard";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const { data: profile } = await supabase.from('profiles')
    .select('role').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== 'admin') redirect('/');

  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, slug, kind, published, created_at, nav_order')
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Admin · Pages</h1>

      <form action={createPage} className="flex flex-wrap items-center gap-3">
        <input name="title" placeholder="Page title" className="rounded border p-2" required />
        <input name="slug" placeholder="slug (e.g. my-project)" className="rounded border p-2" required />

        <label className="text-sm flex items-center gap-2">
          <input type="radio" name="kind" value="project" /> Project
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="radio" name="kind" value="experience" /> Experience
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="radio" name="kind" value="additional" /> Additional
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="radio" name="kind" value="standalone" defaultChecked /> Standalone
        </label>

        <button className="rounded bg-black px-3 py-2 text-white">Create</button>
      </form>


      {/* List (unchanged) */}
      <ul className="divide-y rounded border bg-white">
        {(pages ?? []).map((p) => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-black">{p.title}</div>
              <div className="text-xs text-neutral-500">
                {p.kind} · /{p.slug} · {p.published ? "published" : "draft"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link className="text-blue-600" href={`/admin/${p.id}`}>Edit</Link>
              {!p.published && (
                <form action={deleteDraft}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-red-600 hover:underline" title="Delete draft">Delete</button>
                </form>
              )}
            </div>
          </li>
        ))}
        {(!pages || pages.length === 0) && (
          <li className="p-4 text-sm text-neutral-500">No pages yet — create one above.</li>
        )}
      </ul>

      {/* NEW: Reorder board */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Reorder items in the navbar</h2>
        <p className="mb-3 text-sm text-neutral-500">
          Drag items to change order inside Projects and Experience. Only published pages appear in the menus.
        </p>
        <NavOrderBoard initialPages={(pages ?? []) as any} action={saveNavOrder} />
      </section>
    </main>
  );
}

/* ---------------- Server actions ---------------- */

async function createPage(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  const title = String(formData.get("title") ?? "");
  const slug  = String(formData.get("slug") ?? "");
  const raw   = String(formData.get("kind") ?? "standalone");
  const allowed = new Set(["project", "experience", "additional", "standalone"]);
  const kind = allowed.has(raw) ? (raw as "project"|"experience"|"additional"|"standalone") : "standalone";

  // seed nav_order at end of its group
  const { data: last } = await supabase
    .from("pages")
    .select("nav_order")
    .eq("kind", kind)
    .order("nav_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (last?.nav_order ?? -1) + 1;

  await supabase.from("pages").insert({ title, slug, kind, published: false, nav_order: nextOrder });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin");
  revalidatePath("/");
  const { redirect } = await import("next/navigation");
  redirect("/admin");
}


async function deleteDraft(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const id = String(formData.get("id"));

  const { data: page } = await supabase
    .from("pages")
    .select("published")
    .eq("id", id)
    .maybeSingle();

  if (!page || page.published) return;

  await supabase.from("content_blocks").delete().eq("page_id", id);
  await supabase.from("pages").delete().eq("id", id);

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin");
  revalidatePath("/");
}

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

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");      // navbar
  revalidatePath("/admin"); // board
}
