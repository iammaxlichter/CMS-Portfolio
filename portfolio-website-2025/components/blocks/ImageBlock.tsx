import Image from "next/image";
import { AnimWrapper } from "./Anim";
import type { ImageData, WithAnim } from "@/lib/blocks";

export default function ImageBlock({ data }: { data: ImageData & Partial<WithAnim> }) {
    
    const maxW = data.displayMaxWidth ?? 1200;
    const align = data.align ?? "left";
    const captionAlign = data.captionAlign ?? "left";

    const iw = data.intrinsicWidth ?? 1600;
    const ih = data.intrinsicHeight ?? 900;

    const bw = data.borderWidthPx ?? 0;
    const bc = data.borderColor ?? "#343330";

    const alignClass = align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";
    const captionClass =
        captionAlign === "center" ? "text-center" : captionAlign === "right" ? "text-right" : "text-left";

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
                        style={{
                            marginTop: data.marginTop ?? 16,
                            marginBottom: data.marginBottom ?? 16,
                        }}
                    >
                        <Image
                            src={`/${data.path}`}
                            alt={data.alt || ""}
                            width={iw}
                            height={ih}
                            className="rounded-xl w-full h-auto"
                            style={{
                                padding: data.paddingPx ?? 0,
                                borderStyle: bw ? "solid" : undefined,
                                borderWidth: bw ? `${bw}px` : undefined,
                                borderColor: bw ? bc : undefined,
                            }}
                        />
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
