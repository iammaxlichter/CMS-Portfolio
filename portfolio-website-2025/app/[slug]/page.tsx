// app/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Block } from "@/lib/blocks";
import BlockView from "@/components/blocks/BlockView";
import ColumnsView from "@/components/blocks/ColumnsView";

export default async function Page({
  params,
}: {
  // params can be async and values can be string | string[]
  params: Promise<{ slug: string | string[] }>;
}) {
  const p = await params;
  const slug = Array.isArray(p.slug) ? p.slug[0] : p.slug;
  if (!slug) return notFound();

  const supabase = await createClient();

  const { data: page, error: pageErr } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (pageErr) throw new Error(`Supabase pages fetch failed: ${pageErr.message}`);
  if (!page || !page.published) return notFound();

  const { data: blocks, error: blocksErr } = await supabase
    .from("content_blocks")
    .select("id,page_id,block_type,data,position,parent_id,slot")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  if (blocksErr) throw new Error(`Supabase blocks fetch failed: ${blocksErr.message}`);

  const all = (blocks ?? []) as Block[];
  const root = all
    .filter((b) => !b.parent_id)
    .sort((a, b) => a.position - b.position);

  return (
    <main className="mx-auto max-w-5xl p-6 pt-15 space-y-6">
      {root.map((b) =>
        b.block_type === "columns" ? (
          <ColumnsView key={b.id} block={b} all={all} />
        ) : (
          <BlockView key={b.id} b={b} />
        )
      )}
    </main>
  );
}
