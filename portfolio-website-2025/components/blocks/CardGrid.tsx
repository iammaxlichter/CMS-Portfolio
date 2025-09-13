import Image from "next/image";
import { AnimWrapper } from "./Anim";
import type { CardGridData, WithAnim } from "@/lib/blocks";

export default function CardGrid({ data }: { data: CardGridData & Partial<WithAnim> }) {

    const items = data.items ?? [];
    const bw = data.borderWidthPx ?? 0;
    const bc = data.borderColor ?? "#343330";
    const pad = data.paddingPx ?? 0;

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
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

                        const widthPct = Math.max(10, Math.min(100, it.widthPercent ?? 100));

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
                                    <Image
                                        src={src}
                                        alt={it.title || ""}
                                        style={{
                                            borderStyle: bw ? "solid" : undefined,
                                            borderWidth: bw ? `${bw}px` : undefined,
                                            borderColor: bw ? bc : undefined,
                                            padding: pad,
                                        }}
                                        width={width}
                                        height={height}
                                        className="h-auto w-full rounded-lg border transition group-hover:opacity-90"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
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
