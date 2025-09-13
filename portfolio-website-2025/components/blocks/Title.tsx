import { AnimWrapper } from "./Anim";
import type { TitleData, WithAnim } from "@/lib/blocks";

export default function Title({ data }: { data: TitleData & Partial<WithAnim> }) {
    return (
        <AnimWrapper anim={data._anim}>
            <h1 className="text-[#343330] text-4xl sm:text-5xl md:text-6xl lg:text-[56px] font-bold">
                {data.text}
            </h1>
        </AnimWrapper>
    );
}
