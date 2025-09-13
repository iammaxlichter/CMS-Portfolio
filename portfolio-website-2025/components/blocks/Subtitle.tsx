import { AnimWrapper } from "./Anim";
import type { SubtitleData, WithAnim } from "@/lib/blocks";

export default function Subtitle({ data }: { data: SubtitleData & Partial<WithAnim> }) {
    return (
        <AnimWrapper anim={data._anim}>
            <h2 className="text-base sm:text-lg md:text-xl text-[#343330]">
                {data.text}
            </h2>
        </AnimWrapper>
    );
}
