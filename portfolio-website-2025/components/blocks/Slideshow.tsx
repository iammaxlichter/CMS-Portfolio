"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function Slideshow({ paths }: { paths: string[] }) {
  const imgs = useMemo(() => (paths ?? []).filter(Boolean), [paths]);
  const [i, setI] = useState(0);
  if (imgs.length === 0) return null;

  const go = (d: number) => setI((prev) => (prev + d + imgs.length) % imgs.length);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="relative aspect-[16/9]">
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
    </div>
  );
}
