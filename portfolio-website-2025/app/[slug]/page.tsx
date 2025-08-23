// app/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type {
  Block
} from "@/lib/blocks/types";

import {
  isTitleData,
  isSubtitleData,
  isParagraphData,
  isImageData,
  isGalleryData,
  isVideoData,
  isColumnsData,
  isButtonData,
  isSlideshowData,
} from "@/lib/blocks/types";

import Slideshow from "@/components/blocks/Slideshow";


function BlockView({ b }: { b: Block }) {
  switch (b.block_type) {
    case "title":
      if (isTitleData(b)) {
        return <h1 className="text-3xl md:text-4xl font-bold">{b.data.text}</h1>;
      }
      return null;
    case "subtitle":
      if (isSubtitleData(b)) {
        return <h2 className="text-xl md:text-2xl text-neutral-600">{b.data.text}</h2>;
      }
      return null;
    case "paragraph":
      if (isParagraphData(b)) {
        return (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: b.data.html }}
          />
        );
      }
      return null;
    case "image":
      if (isImageData(b)) {
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
      }
      return null;
    case "gallery":
      if (isGalleryData(b)) {
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(b.data.paths ?? []).map((p: string, i: number) => (
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
      }
      return null;
    case "video_youtube":
      if (isVideoData(b)) {
        const url = b.data.url;
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
      return null;

    case "button":
      if (isButtonData(b)) {
        const isExternal = /^https?:\/\//i.test(b.data.href);
        return (
          <a
            href={b.data.href || "#"}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-neutral-800"
          >
            {b.data.text || "Learn more"}
          </a>
        );
      }
      return null;

    case "slideshow":
      if (isSlideshowData(b)) {
        return <Slideshow paths={b.data.paths ?? []} />;
      }
      return null;


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
  if (!isColumnsData(block)) return null;

  const cols = block.data.columns;
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
  // Await the params Promise
  const { slug } = await params;

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