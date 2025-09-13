import Image from "next/image";
import { AnimWrapper } from "./Anim";
import type { GalleryData, GalleryItem, WithAnim } from "@/lib/blocks";

export default function Gallery({ data }: { data: GalleryData & Partial<WithAnim> }) {

    const items: GalleryItem[] =
        Array.isArray(data.items) && data.items.length
            ? data.items
            : (data.paths ?? []).map((p: string): GalleryItem => ({ path: p }));

    const cols = ("cols" in data && data.cols) || 3;
    const gap = ("gap" in data && data.gap) || 12;

    const gridCls =
        cols === 2
            ? "grid grid-cols-2"
            : cols === 3
                ? "grid grid-cols-3"
                : cols === 4
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "grid grid-cols-2 md:grid-cols-3";

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
                <div className={gridCls} style={{ gap }}>
                    {items.map((it, i) => {
                        const iw = 1200;
                        const ih = 900;
                        const ibw = it.borderWidthPx ?? 0;
                        const ibc = it.borderColor ?? "#343330";
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
                                    style={{
                                        padding: it.paddingPx ?? 0,
                                        borderStyle: ibw ? "solid" : undefined,
                                        borderWidth: ibw ? `${ibw}px` : undefined,
                                        borderColor: ibw ? ibc : undefined,
                                    }}
                                />
                                {it.alt && (
                                    <figcaption className={`mt-1 text-sm text-neutral-500 ${capAlignClass}`}>
                                        {it.alt}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    })}
                </div>
            </AnimWrapper>
        </div>
    );
}
