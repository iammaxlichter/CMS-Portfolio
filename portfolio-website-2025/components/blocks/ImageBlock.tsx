import Image from "next/image";
import { AnimWrapper } from "./Anim";
import type { ImageData, WithAnim } from "@/lib/blocks";
import { toImageSrc } from "@/lib/helpers/images";

export default function ImageBlock({ data }: { data: ImageData & Partial<WithAnim> }) {
    const maxW = data.displayMaxWidth ?? 1200;
    const align = data.align ?? "left";
    const captionAlign = data.captionAlign ?? "left";

    const iw = data.intrinsicWidth ?? 1600;
    const ih = data.intrinsicHeight ?? 900;

    const bw = data.borderWidthPx ?? 0;
    const bc = data.borderColor ?? "#343330";
    const pad = data.paddingPx ?? 0;

    const alignClass = align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";
    const captionClass =
        captionAlign === "center" ? "text-center" : captionAlign === "right" ? "text-right" : "text-left";

    const src = toImageSrc(data.path); // <-- works for Supabase URLs or repo paths

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
                <figure
                    className={alignClass}
                    style={{
                        maxWidth: `${maxW}px`,
                        marginTop: data.marginTop ?? 16,
                        marginBottom: data.marginBottom ?? 16,
                    }}
                >
                    <div
                        className="rounded-xl overflow-hidden transition-transform duration-300 ease-out hover:scale-105"
                        style={{
                            padding: pad,
                            borderStyle: bw ? "solid" : undefined,
                            borderWidth: bw ? `${bw}px` : undefined,
                            borderColor: bw ? bc : undefined,
                        }}
                    >
                        {src && (
                            <Image
                                src={src}
                                alt={data.alt || ""}
                                width={iw}
                                height={ih}
                                className="w-full h-auto"
                            />
                        )}
                    </div>

                    {data.alt && (
                        <figcaption
                            className={`text-sm text-neutral-500 ${captionClass}`}
                            style={{
                                marginTop: data.captionMarginTop ?? 4,
                                marginBottom: data.captionMarginBottom ?? 4,
                            }}
                        >
                            {data.alt}
                        </figcaption>
                    )}
                </figure>
            </AnimWrapper>
        </div>
    );
}