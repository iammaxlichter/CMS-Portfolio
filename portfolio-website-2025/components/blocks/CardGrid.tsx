// components/blocks/CardGrid.tsx
import Image from "next/image";
import { AnimWrapper } from "./Anim";
import type { CardGridData, WithAnim } from "@/lib/blocks";
import { toImageSrc } from "@/lib/helpers/images";

export default function CardGrid({ data }: { data: CardGridData & Partial<WithAnim> }) {
    const items = data.items ?? [];

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
                <div className="grid grid-cols-1">
                    {items.map((it, i) => {
                        const src = toImageSrc(it.img || ""); // 🔁 works for Supabase or /public
                        const href = it.href || "#";
                        const isExternal = /^https?:\/\//i.test(href);

                        const align = it.align ?? "left";
                        const alignClass =
                            align === "center"
                                ? "justify-self-center"
                                : align === "right"
                                    ? "justify-self-end"
                                    : "justify-self-start";

                        const widthPct = Math.max(10, Math.min(100, it.widthPercent ?? 100));

                        const bw = it.borderWidthPx ?? data.borderWidthPx ?? 0;
                        const bc = it.borderColor ?? data.borderColor ?? "#343330";
                        const pad = it.paddingPx ?? data.paddingPx ?? 0;

                        return (
                            <a
                                key={i}
                                href={href}
                                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
                                        maxWidth:
                                            typeof it.thumbMaxWidthPx === "number" && it.thumbMaxWidthPx >= 80
                                                ? `${it.thumbMaxWidthPx}px`
                                                : undefined,
                                    }}
                                >
                                    {src && (
                                        <Image
                                            src={src}
                                            alt={it.title || ""}
                                            width={1200}
                                            height={900}
                                            className="h-auto w-full rounded-lg transition group-hover:opacity-90"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            style={{
                                                borderStyle: bw ? "solid" : "none",
                                                borderWidth: bw ? `${bw}px` : undefined,
                                                borderColor: bw ? bc : undefined,
                                                padding: pad,
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="mt-2 font-medium">{it.title}</div>
                                {it.caption && <div className="text-sm text-neutral-500">{it.caption}</div>}
                            </a>
                        );
                    })}
                </div>
            </AnimWrapper>
        </div>
    );
}
