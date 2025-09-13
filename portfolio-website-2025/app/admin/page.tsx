// app/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/editor/SignOutButton";
import CreatePageForm from "@/components/admin/editor/CreatePageForm";
import PageToolbar from "@/components/admin/PageToolbar";
import { envBadgeClasses, parseSupabaseRef } from "@/lib/env";
import { verifyMfaCookie } from "@/lib/auth/mfa";
import { getPages, type Kind, parseKindsParam } from "@/lib/admin/pages";
import { createPage, deleteDraft } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome({
  searchParams,
}: {
  // Next.js async searchParams (can be a Promise and values may be string[])
  searchParams?: Promise<{ sort?: string | string[]; kinds?: string | string[] }>;
}) {
  // ✅ await searchParams first
  const sp = await searchParams;
  const sortParam = Array.isArray(sp?.sort) ? sp?.sort[0] : sp?.sort;
  const kindsParam = Array.isArray(sp?.kinds) ? sp?.kinds.join(",") : sp?.kinds;

  const sort: "asc" | "desc" = sortParam === "desc" ? "desc" : "asc";
  const selectedKinds: Kind[] = parseKindsParam(kindsParam);

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

  const pages = await getPages({ sort, kinds: selectedKinds });

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

      {/* Filter + Sort toolbar */}
      <PageToolbar sort={sort} kinds={selectedKinds} />

      {/* Reactive Create form */}
      <CreatePageForm action={createPage} />

      <ul className="divide-y rounded border bg-white">
        {pages.length > 0 ? (
          pages.map((p) => (
            <li key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-black">{p.title}</div>
                <div className="text-xs text-neutral-500">
                  {p.kind} · /{p.slug} · {p.published ? "published" : "draft"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  className="text-blue-600 hover:underline cursor-pointer"
                  href={`/admin/${p.id}`}
                >
                  Edit
                </Link>

                {!p.published && (
                  <form action={deleteDraft}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      className="text-red-600 hover:underline cursor-pointer"
                      title="Delete draft"
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-neutral-500">
            No pages yet — create one above.
          </li>
        )}
      </ul>
    </main>
  );
}
