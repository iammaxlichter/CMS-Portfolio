// app/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Block, ColumnsData } from "@/lib/blocks/types";

function BlockView({ b }: { b: Block }) {
  switch (b.block_type) {
    case "title":
      return <h1 className="text-3xl md:text-4xl font-bold">{(b.data as any).text}</h1>;
    case "subtitle":
      return <h2 className="text-xl md:text-2xl text-neutral-600">{(b.data as any).text}</h2>;
    case "paragraph":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: (b.data as any).html }}
        />
      );
    case "image":
      return (
        <figure className="my-4">
          <Image
            src={`/${(b.data as any).path}`}
            alt={(b.data as any).alt || ""}
            width={1600}
            height={900}
            className="rounded-xl w-full h-auto"
          />
          {(b.data as any).alt && (
            <figcaption className="text-sm text-neutral-500 mt-1">
              {(b.data as any).alt}
            </figcaption>
          )}
        </figure>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {((b.data as any).paths ?? []).map((p: string, i: number) => (
            <Image
              key={i}
              src={`/${p}`}
              alt=""
              width={800}
              height={600}
              className="rounded-lg w-full h-auto"
            />
          ))}
        </div>
      );
    case "video_youtube": {
      const url = (b.data as any).url as string;
      const id = url?.match(/(?:v=|be\/)([A-Za-z0-9_-]{11})/)?.[1];
      return id ? (
        <div className="aspect-video">
          <iframe
            className="w-full h-full rounded-xl"
            src={`https://www.youtube.com/embed/${id}`}
            title="YouTube video"
            allowFullScreen
          />
        </div>
      ) : null;
    }
    default:
      return null;
  }
}

function ColumnsView({
  block,
  all,
}: {
  block: Block; // columns
  all: Block[];
}) {
  const cols = (block.data as ColumnsData).columns;
  const left = all
    .filter((x) => x.parent_id === block.id && x.slot === "left")
    .sort((a, b) => a.position - b.position);
  const right = all
    .filter((x) => x.parent_id === block.id && x.slot === "right")
    .sort((a, b) => a.position - b.position);

  return (
    <div className={`grid gap-6 ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}>
      <div className="space-y-6">
        {left.map((child) =>
          child.block_type === "columns" ? (
            <ColumnsView key={child.id} block={child} all={all} />
          ) : (
            <BlockView key={child.id} b={child} />
          )
        )}
      </div>
      {cols === 2 && (
        <div className="space-y-6">
          {right.map((child) =>
            child.block_type === "columns" ? (
              <ColumnsView key={child.id} block={child} all={all} />
            ) : (
              <BlockView key={child.id} b={child} />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;  // 👈 unwrap

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!page || !page.published) return null;

  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("id,page_id,block_type,data,position,parent_id,slot")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  const all = (blocks ?? []) as Block[];
  const root = all.filter((b) => !b.parent_id).sort((a, b) => a.position - b.position);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
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
