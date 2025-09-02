// app/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Block, GalleryItem } from "@/lib/blocks/types";
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
  isDateData,
  isCardGridData,
} from "@/lib/blocks/types";

import type { AnimationSettings, WithAnim } from "@/lib/blocks/types";
import Slideshow from "@/components/admin/blocks/Slideshow";
import { JSX } from "react";
import AnimOnView from "@/components/AnimOnView";

const animClassMap = {
  slideInLeft: "anim-slideInLeft",
  slideInRight: "anim-slideInRight",
  slideInTop: "anim-slideInTop",
  slideInBottom: "anim-slideInBottom",
  fadeIn: "anim-fadeIn",
} as const;

function getAnim(b: Block): AnimationSettings | undefined {
  return (b.data as WithAnim)._anim;
}

function BlockView({ b }: { b: Block }) {
  const withPadding = (content: JSX.Element) => (
    <div className="sm:px-8">{content}</div>
  );

  function wrapWithAnim(b: Block, el: JSX.Element) {
    const a = getAnim(b);
    if (!a?.type) return el;

    const dur = a.durationMs ?? 600;
    const delay = a.delayMs ?? 0;

    return (
      <AnimOnView
        durationMs={dur}
        delayMs={delay}
        //threshold={1}
        once={true}
        className={`anim-base ${animClassMap[a.type]}`}
      >
        {el}
      </AnimOnView>
    );
  }

  switch (b.block_type) {
    case "title":
      if (isTitleData(b)) {
        return wrapWithAnim(
          b,
          <h1 className="text-[#343330] text-4xl sm:text-5xl md:text-6xl lg:text-[56px] font-bold">
            {b.data.text}
          </h1>
        );
      }
      return null;
    case "subtitle":
      if (isSubtitleData(b)) {
        return wrapWithAnim(
          b,
          <h2 className="text-base sm:text-lg md:text-xl text-[#343330]">
            {b.data.text}
          </h2>
        );
      }
      return null;
    // app/[slug]/page.tsx (inside case "paragraph")
    case "paragraph":
      if (isParagraphData(b)) {
        const fs = b.data.fontSize ?? 16;
        const mt = b.data.marginTop ?? 16;
        const mb = b.data.marginBottom ?? 16;

        return withPadding(
          wrapWithAnim(
            b,
            <div
              className="prose max-w-none prose-p:m-0"
              style={{ fontSize: fs, marginTop: mt, marginBottom: mb }}
              dangerouslySetInnerHTML={{ __html: b.data.html }}
            />
          )
        );
      }
      return null;

    // app/[slug]/page.tsx
    case "image":
      if (isImageData(b)) {
        const maxW = b.data.displayMaxWidth ?? 1200;
        const align = b.data.align ?? "left";
        const captionAlign = b.data.captionAlign ?? "left";

        const iw = b.data.intrinsicWidth ?? 1600;
        const ih = b.data.intrinsicHeight ?? 900;

        const alignClass =
          align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""; // left = default

        const captionClass =
          captionAlign === "center"
            ? "text-center"
            : captionAlign === "right"
            ? "text-right"
            : "text-left";

        return withPadding(
          wrapWithAnim(
            b,
            <figure
              className={`${alignClass}`}
              style={{
                maxWidth: `${maxW}px`,
                marginTop: b.data.marginTop ?? 16,
                marginBottom: b.data.marginBottom ?? 16,
              }}
            >
              <div
                style={{
                  marginTop: b.data.marginTop ?? 16,
                  marginBottom: b.data.marginBottom ?? 16,
                }}
              >
                <Image
                  src={`/${b.data.path}`}
                  alt={b.data.alt || ""}
                  width={iw}
                  height={ih}
                  className="rounded-xl w-full h-auto"
                />
              </div>

              {b.data.alt && (
                <figcaption
                  className={`text-sm text-neutral-500 ${captionClass}`}
                  style={{
                    marginTop: b.data.captionMarginTop ?? 4,
                    marginBottom: b.data.captionMarginBottom ?? 4,
                  }}
                >
                  {b.data.alt}
                </figcaption>
              )}
            </figure>
          )
        );
      }
      return null;

    case "gallery":
      if (isGalleryData(b)) {
        const asItems: GalleryItem[] =
          Array.isArray(b.data.items) && b.data.items.length
            ? b.data.items
            : (b.data.paths ?? []).map(
                (p: string): GalleryItem => ({ path: p })
              );

        const cols = ("cols" in b.data && b.data.cols) || 3;
        const gap = ("gap" in b.data && b.data.gap) || 12;

        const gridCls =
          cols === 2
            ? "grid grid-cols-2" // 2 on mobile
            : cols === 3
            ? "grid grid-cols-3" // ✅ 3 on mobile (and up)
            : cols === 4
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" // 2→3→4 by breakpoint
            : "grid grid-cols-2 md:grid-cols-3";

        return withPadding(
          wrapWithAnim(
            b,
            <div className={gridCls} style={{ gap }}>
              {asItems.map((it, i) => {
                const iw = 1200;
                const ih = 900;

                const alignClass =
                  (it.align ?? "left") === "center"
                    ? "justify-self-center"
                    : (it.align ?? "left") === "right"
                    ? "justify-self-end"
                    : "justify-self-start";

                const capAlignClass =
                  (it.captionAlign ?? "left") === "center"
                    ? "text-center"
                    : (it.captionAlign ?? "left") === "right"
                    ? "text-right"
                    : "text-left";

                const widthPct = it.widthPercent ?? 100;

                return (
                  <figure
                    key={i}
                    className={alignClass}
                    style={{
                      width: `${Math.max(10, Math.min(100, widthPct))}%`,
                      marginTop: it.marginTop ?? 0,
                      marginBottom: it.marginBottom ?? 0,
                      marginLeft: it.marginLeft ?? 0,
                      marginRight: it.marginRight ?? 0,
                    }}
                  >
                    <Image
                      src={`/${it.path}`}
                      alt={it.alt || ""}
                      width={iw}
                      height={ih}
                      className="w-full h-auto rounded-lg"
                    />
                    {it.alt && (
                      <figcaption
                        className={`mt-1 text-sm text-neutral-500 ${capAlignClass}`}
                      >
                        {it.alt}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          )
        );
      }
      return null;

    case "video_youtube":
      if (isVideoData(b)) {
        const url = b.data.url;
        const id = url?.match(/(?:v=|be\/)([A-Za-z0-9_-]{11})/)?.[1];
        return id
          ? withPadding(
              wrapWithAnim(
                b,
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full rounded-xl"
                    src={`https://www.youtube.com/embed/${id}`}
                    title="YouTube video"
                    allowFullScreen
                  />
                </div>
              )
            )
          : null;
      }
      return null;

    case "button":
      if (isButtonData(b)) {
        const isExternal = /^https?:\/\//i.test(b.data.href);
        return withPadding(
          wrapWithAnim(
            b,
            <a
              href={b.data.href || "#"}
              {...(isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-neutral-800"
            >
              {b.data.text || "Learn more"}
            </a>
          )
        );
      }
      return null;

    case "slideshow":
      if (isSlideshowData(b)) {
        return withPadding(
          wrapWithAnim(
            b,
            <Slideshow
              paths={b.data.paths ?? []}
              displayMaxWidth={b.data.displayMaxWidth ?? 1200}
              align={b.data.align ?? "left"}
              marginTop={b.data.marginTop ?? 16}
              marginBottom={b.data.marginBottom ?? 16}
              aspectRatio={b.data.aspectRatio}
              fixedHeightPx={b.data.fixedHeightPx}
            />
          )
        );
      }
      return null;

    case "date":
      if (isDateData(b)) {
        const align = b.data.align ?? "right";
        const alignClass =
          align === "center"
            ? "text-center"
            : align === "right"
            ? "text-right"
            : "text-left";

        const displayClass =
          align === "right"
            ? "block ml-auto"
            : align === "center"
            ? "block mx-auto"
            : "block";

        return wrapWithAnim(
          b,
          <div
            className={`${displayClass} ${alignClass} text-base sm:text-lg md:text-xl text-[#9D231B] italic`}
          >
            {b.data.text}
          </div>
        );
      }
      return null;

    case "card_grid":
      if (isCardGridData(b)) {
        const items = b.data.items ?? [];
        return withPadding(
          // ⬅ wrap the grid (once), not each card
          wrapWithAnim(
            b,
            <div className="grid grid-cols-1">
              {items.map((it, i) => {
                const src =
                  /^(https?:)?\/\//i.test(it.img) || it.img.startsWith("/")
                    ? it.img
                    : `/${it.img}`;
                const href = it.href || "#";
                const isExternal = /^https?:\/\//i.test(href);

                const width = 1200;
                const height = 900;

                const align = it.align ?? "left";
                const alignClass =
                  align === "center"
                    ? "justify-self-center"
                    : align === "right"
                    ? "justify-self-end"
                    : "justify-self-start";

                const widthPct = Math.max(
                  10,
                  Math.min(100, it.widthPercent ?? 100)
                );

                return (
                  <a
                    key={i}
                    href={href}
                    {...(isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={`group block ${alignClass}`}
                    style={{
                      width: `${widthPct}%`,
                      marginTop: it.marginTop ?? 0,
                      marginBottom: it.marginBottom ?? 0,
                      marginLeft: it.marginLeft ?? 0,
                      marginRight: it.marginRight ?? 0,
                    }}
                  >
                    <div
                      style={{
                        // ignore silly-small caps; full width by default
                        maxWidth:
                          typeof it.thumbMaxWidthPx === "number" &&
                          it.thumbMaxWidthPx >= 80
                            ? `${it.thumbMaxWidthPx}px`
                            : undefined,
                      }}
                    >
                      <Image
                        src={src}
                        alt={it.title || ""}
                        width={width}
                        height={height}
                        className="h-auto w-full rounded-lg border transition group-hover:opacity-90"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>

                    <div className="mt-2 font-medium">{it.title}</div>
                    {it.caption && (
                      <div className="text-sm text-neutral-500">
                        {it.caption}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          )
        );
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
    <div
      className={`grid ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}
    >
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
