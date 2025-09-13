import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/editor/SignOutButton";
import { cookies } from "next/headers";
import crypto from "crypto";
import CreatePageForm from "@/components/admin/editor/CreatePageForm";

export const dynamic = "force-dynamic";

function verifyMfaCookie(raw: string | undefined, userId: string): boolean {
  if (!raw) return false;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return false;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto
      .createHmac("sha256", process.env.MFA_COOKIE_SECRET!)
      .update(payload)
      .digest("hex");
    if (sig !== expected) return false;
    const { uid, iat } = JSON.parse(payload) as { uid: string; iat: number };
    if (uid !== userId) return false;
    if (Date.now() / 1000 - iat > 10 * 60) return false;
    return true;
  } catch {
    return false;
  }
}

function parseSupabaseRef(url?: string) {
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

function envBadgeClasses(env: string) {
  const e = env.toLowerCase();
  if (e === "production") return "bg-red-100 text-red-800";
  if (e === "preview") return "bg-amber-100 text-amber-800";
  if (e === "development") return "bg-blue-100 text-blue-800";
  return "bg-neutral-200 text-neutral-800";
}

export default async function AdminHome() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    const hasVerifiedTotp = factors?.totp?.some((f) => f.status === "verified");
    redirect(hasVerifiedTotp ? "/admin/mfa/verify" : "/admin/mfa/setup");
  }

  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supa = parseSupabaseRef(supabaseUrl);

  const { data: pages, error: pagesErr } = await supabase
    .from("pages")
    .select("id, title, slug, kind, published, created_at, nav_order")
    .order("created_at", { ascending: false });
  if (pagesErr) throw new Error(`pages fetch failed: ${pagesErr.message}`);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <header className="flex items-start justify-between">
        <SignOutButton />
        <div className="flex flex-col items-end gap-1 text-xs">
          <div className="text-neutral-600">
            Signed in as{" "}
            <span className="font-medium text-black">
              {user.email ?? user.id}
            </span>
          </div>
          <div className="flex gap-2">
            <span
              className={`inline-block rounded-full px-2 py-1 ${envBadgeClasses(
                env
              )}`}
              title={`VERCEL_ENV / NODE_ENV = ${env}`}
            >
              {env}
            </span>
            {supa && (
              <span
                className="inline-block rounded-full bg-neutral-200 text-neutral-800 px-2 py-1"
                title={supa.host}
              >
                DB: {supa.projectRef}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex gap-2">
        <Link
          href="/admin/resume"
          className="inline-block rounded bg-[#343330] px-3 py-2 text-white text-sm hover:bg-black"
        >
          Manage Resume
        </Link>
        <Link
          href="/admin/navreorder"
          className="inline-block rounded bg-[#343330] px-3 py-2 text-white text-sm hover:bg-black"
        >
          Reorder Navbar
        </Link>
        <Link
          href="/admin/achievements"
          className="inline-block rounded bg-[#343330] px-3 py-2 text-white text-sm hover:bg-black"
        >
          Contact Page Achievements
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Admin · Pages</h1>

      {/* Reactive Create form */}
      <CreatePageForm action={createPage} />

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
              <Link className="text-blue-600" href={`/admin/${p.id}`}>
                Edit
              </Link>
              {!p.published && (
                <form action={deleteDraft}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    className="text-red-600 hover:underline"
                    title="Delete draft"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
        {(!pages || pages.length === 0) && (
          <li className="p-4 text-sm text-neutral-500">
            No pages yet — create one above.
          </li>
        )}
      </ul>
    </main>
  );
}

async function createPage(formData: FormData) {
  "use server";
  const supabase = await (
    await import("@/lib/supabase/server")
  ).createClient();

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

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin");
  revalidatePath("/");
  const { redirect } = await import("next/navigation");
  redirect("/admin");
}

async function deleteDraft(formData: FormData) {
  "use server";
  const supabase = await (
    await import("@/lib/supabase/server")
  ).createClient();
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
