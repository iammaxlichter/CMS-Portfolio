// app/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Block } from "@/lib/blocks/types";

function RenderBlock({ b }: { b: Block }) {
  switch (b.block_type) {
    case "title":
      return <h1 className="text-3xl md:text-4xl font-bold">{b.data.text}</h1>;
    case "subtitle":
      return (
        <h2 className="text-xl md:text-2xl text-neutral-600">{b.data.text}</h2>
      );
    case "paragraph":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: b.data.html }}
        />
      );
    case "image":
      return (
        <figure className="my-4">
          <Image
            src={`/${b.data.path}`}
            alt={b.data.alt || ""}
            width={1600}
            height={900}
            className="rounded-xl w-full h-auto"
          />
          {b.data.alt && (
            <figcaption className="text-sm text-neutral-500 mt-1">
              {b.data.alt}
            </figcaption>
          )}
        </figure>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {b.data.paths.map((p: string, i: number) => (
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
      const id = b.data.url?.match(/(?:v=|be\/)([A-Za-z0-9_-]{11})/)?.[1];
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
    case "columns":
      return (
        <div
          className={`grid gap-6 ${
            b.data.columns === 2 ? "md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div className="space-y-2">
            {(b.data.left || []).map((t: string, i: number) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          {b.data.columns === 2 && (
            <div className="space-y-2">
              {(b.data.right || []).map((t: string, i: number) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!page || !page.published) return null;

  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      {(blocks ?? []).map((b: Block) => (
        <RenderBlock key={b.id} b={b} />
      ))}
    </main>
  );
}
