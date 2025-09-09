// app/admin/[id]/page.tsx 
import { createClient } from "@/lib/supabase/server";
import BlockEditor from "@/components/admin/editor/BlockEditor";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function EditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return null;

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("id,page_id,block_type,data,position,parent_id,slot")
    .eq("page_id", id)
    .order("position", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <Link
        href="/admin"
        className="inline-block rounded bg-neutral-200 px-3 py-2 text-sm text-black hover:bg-neutral-300"
      >
        ← Back to Admin
      </Link>

      


      <form action={saveMeta} className="space-y-3">
        <input type="hidden" name="id" defaultValue={page?.id} />
        <input
          name="title"
          defaultValue={page?.title}
          placeholder="Page title"
          className="w-full rounded border p-2"
        />
        <input
          name="slug"
          defaultValue={page?.slug}
          placeholder="Page slug"
          className="w-full rounded border p-2"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">Page Type:</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kind"
                value="project"
                defaultChecked={page?.kind === "project"}
              />
              Project
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kind"
                value="experience"
                defaultChecked={page?.kind === "experience"}
              />
              Experience
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kind"
                value="additional"
                defaultChecked={page?.kind === "additional"}
              />
              Additional
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kind"
                value="standalone"
                defaultChecked={page?.kind === "standalone"}
              />
              Standalone
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={page?.published}
          />
          Published
        </label>
        <button className="rounded bg-black text-white px-3 py-2 hover:bg-neutral-800">
          Save
        </button>
      </form>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Content</h2>
        <BlockEditor pageId={id} initial={blocks ?? []} />
      </section>
    </main>
  );
}

async function saveMeta(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  const id = String(formData.get("id"));
  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const rawKind = String(formData.get("kind"));
  const published = !!formData.get("published");

  // Validate the kind field
  const allowedKinds = new Set(["project", "experience", "additional", "standalone"]);
  const kind = allowedKinds.has(rawKind) ? rawKind as "project" | "experience" | "additional" | "standalone" : "standalone";

  await supabase
    .from("pages")
    .update({ title, slug, kind, published })
    .eq("id", id);

  // Revalidate all relevant paths
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin"); // Admin list page
  revalidatePath("/"); // Homepage/navbar

  // Also revalidate the specific page route if it's published
  if (published && slug) {
    revalidatePath(`/${slug}`);
  }

  redirect(`/admin/${id}`);
}