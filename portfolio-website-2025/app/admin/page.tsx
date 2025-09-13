// app/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/editor/SignOutButton";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyMfaCookie(raw: string | undefined, userId: string): boolean {
  if (!raw) return false;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return false;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto.createHmac("sha256", process.env.MFA_COOKIE_SECRET!).update(payload).digest("hex");
    if (sig !== expected) return false;
    const { uid, iat } = JSON.parse(payload) as { uid: string; iat: number };
    if (uid !== userId) return false;
    if (Date.now()/1000 - iat > 10 * 60) return false; 
    return true;
  } catch { return false; }
}

export default async function AdminHome() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin?next=/admin");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) throw new Error(`profiles fetch failed: ${profileErr.message}`);
  if (!profile || profile.role !== "admin") redirect("/");

  const mfaCookie = (await cookies()).get("mfa_ok")?.value;
  if (!verifyMfaCookie(mfaCookie, user.id)) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factors?.totp?.some(f => f.status === "verified");
    redirect(hasVerifiedTotp ? "/admin/mfa/verify" : "/admin/mfa/setup");
  }

  const { data: pages, error: pagesErr } = await supabase
    .from("pages")
    .select("id, title, slug, kind, published, created_at, nav_order")
    .order("created_at", { ascending: false });
  if (pagesErr) throw new Error(`pages fetch failed: ${pagesErr.message}`);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <SignOutButton />
      <div className="flex gap-2">
        <Link href="/admin/resume" className="inline-block rounded bg-[#343330] px-3 py-2 text-white text-sm hover:bg-black">Manage Resume</Link>
        <Link href="/admin/reorder" className="inline-block rounded bg-[#343330] px-3 py-2 text-white text-sm hover:bg-black">Reorder Navbar</Link>
      </div>

      <h1 className="text-2xl font-semibold">Admin · Pages</h1>

      <form action={createPage} className="flex flex-wrap items-center gap-3">
        <input name="title" placeholder="Page title" className="rounded border p-2" required />
        <input name="slug" placeholder="slug (e.g. my-project)" className="rounded border p-2" required />
        <label className="text-sm flex items-center gap-2"><input type="radio" name="kind" value="project" /> Project</label>
        <label className="text-sm flex items-center gap-2"><input type="radio" name="kind" value="experience" /> Experience</label>
        <label className="text-sm flex items-center gap-2"><input type="radio" name="kind" value="additional" /> Additional</label>
        <label className="text-sm flex items-center gap-2"><input type="radio" name="kind" value="standalone" defaultChecked /> Standalone</label>
        <button className="rounded bg-black px-3 py-2 text-white">Create</button>
      </form>

      <ul className="divide-y rounded border bg-white">
        {(pages ?? []).map(p => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-black">{p.title}</div>
              <div className="text-xs text-neutral-500">{p.kind} · /{p.slug} · {p.published ? "published" : "draft"}</div>
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
        {(!pages || pages.length === 0) && <li className="p-4 text-sm text-neutral-500">No pages yet — create one above.</li>}
      </ul>
    </main>
  );
}


async function createPage(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();

  const title = String(formData.get("title") ?? "");
  const slug  = String(formData.get("slug") ?? "");
  const raw   = String(formData.get("kind") ?? "standalone");
  const allowed = new Set(["project","experience","additional","standalone"]);
  const kind = allowed.has(raw) ? (raw as "project"|"experience"|"additional"|"standalone") : "standalone";

  const { data: last } = await supabase
    .from("pages").select("nav_order").eq("kind", kind)
    .order("nav_order", { ascending: false }).limit(1).maybeSingle();
  const nextOrder = (last?.nav_order ?? -1) + 1;

  await supabase.from("pages").insert({ title, slug, kind, published: false, nav_order: nextOrder });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin"); revalidatePath("/");
  const { redirect } = await import("next/navigation");
  redirect("/admin");
}

async function deleteDraft(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const id = String(formData.get("id"));
  const { data: page } = await supabase.from("pages").select("published").eq("id", id).maybeSingle();
  if (!page || page.published) return;
  await supabase.from("content_blocks").delete().eq("page_id", id);
  await supabase.from("pages").delete().eq("id", id);
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin"); revalidatePath("/");
}
