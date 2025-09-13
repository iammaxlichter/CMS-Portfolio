import { AnimWrapper } from "./Anim";
import type { DateData, WithAnim } from "@/lib/blocks";

export default function DateText({ data }: { data: DateData & Partial<WithAnim> }) {
    
    const align = data.align ?? "right";
    const alignClass =
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    const displayClass =
        align === "right" ? "block ml-auto" : align === "center" ? "block mx-auto" : "block";

    return (
        <AnimWrapper anim={data._anim}>
            <div className={`${displayClass} ${alignClass} text-base sm:text-lg md:text-xl text-[#9D231B] italic`}>
                {data.text}
            </div>
        </AnimWrapper>
    );
}
