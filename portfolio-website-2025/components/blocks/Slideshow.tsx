// components/blocks/Slideshow.tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimWrapper } from "./Anim";
import type { SlideshowData, WithAnim } from "@/lib/blocks";

export default function Slideshow({
  data,
}: {
  data: SlideshowData & Partial<WithAnim>;
}) {
  // Defaults (keep consistent with your other blocks)
  const paths = useMemo(() => (data.paths ?? []).filter(Boolean), [data.paths]);
  const maxW = data.displayMaxWidth ?? 1200;
  const align = data.align ?? "left";
  const mt = data.marginTop ?? 16;
  const mb = data.marginBottom ?? 16;
  const aspect = data.aspectRatio || "16/9";
  const fixedH = data.fixedHeightPx;

  const bw = data.borderWidthPx ?? 0;
  const bc = data.borderColor ?? "#343330";
  const pad = data.paddingPx ?? 0;

  const [i, setI] = useState(0);
  if (paths.length === 0) return null;

  const go = (d: number) => setI((prev) => (prev + d + paths.length) % paths.length);

  const alignClass =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";

  // Either fixed height or aspect-ratio
  const sizeWrapperStyle: React.CSSProperties = fixedH
    ? { height: `${fixedH}px` }
    : { aspectRatio: aspect };

  return (
    <div className="sm:px-8">
      <AnimWrapper anim={data._anim}>
        <figure
          className={alignClass + " relative w-full"}
          style={{ maxWidth: `${maxW}px`, marginTop: mt, marginBottom: mb }}
        >
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{
              padding: pad,
              borderStyle: bw ? "solid" : undefined,
              borderWidth: bw ? `${bw}px` : undefined,
              borderColor: bw ? bc : undefined,
            }}
          >
            <div className="relative" style={sizeWrapperStyle}>
              <div
                className="flex h-full w-full transition-transform duration-500"
                style={{ transform: `translateX(-${i * 100}%)` }}
              >
                {paths.map((p, idx) => (
                  <div key={idx} className="relative w-full shrink-0">
                    <Image
                      src={p.startsWith("/") ? p : `/${p}`}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 800px, 100vw"
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {paths.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/60 cursor-pointer"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/60 cursor-pointer"
                aria-label="Next slide"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {paths.map((_, dot) => (
                  <span
                    key={dot}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === dot ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </figure>
      </AnimWrapper>
    </div>
  );
}
