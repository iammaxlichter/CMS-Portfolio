"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  paths: string[];
  displayMaxWidth?: number;
  align?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
  aspectRatio?: string;   // e.g. "16/9"
  fixedHeightPx?: number; // e.g. 420
};

export default function Slideshow({
  paths,
  displayMaxWidth = 1200,
  align = "left",
  marginTop = 16,
  marginBottom = 16,
  aspectRatio = "16/9",
  fixedHeightPx,
}: Props) {
  const imgs = useMemo(() => (paths ?? []).filter(Boolean), [paths]);
  const [i, setI] = useState(0);
  if (imgs.length === 0) return null;

  const go = (d: number) => setI((prev) => (prev + d + imgs.length) % imgs.length);

  const alignClass =
    align === "center" ? "mx-auto"
    : align === "right" ? "ml-auto"
    : ""; // left default

  // size wrapper: either fixed height or aspect-ratio
  const sizeWrapperStyle: React.CSSProperties = fixedHeightPx
    ? { height: `${fixedHeightPx}px` }
    : { aspectRatio: aspectRatio || "16/9" };

  return (
    <figure
      className={`relative w-full ${alignClass}`}
      style={{
        maxWidth: `${displayMaxWidth}px`,
        marginTop,
        marginBottom,
      }}
    >
      <div className="relative w-full overflow-hidden rounded-xl">
        <div className="relative" style={sizeWrapperStyle}>
          <div
            className="flex h-full w-full transition-transform duration-500"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {imgs.map((p, idx) => (
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

      {imgs.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/60"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/60"
            aria-label="Next slide"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, dot) => (
              <span
                key={dot}
                className={`h-1.5 w-1.5 rounded-full ${i === dot ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </figure>
  );
}
