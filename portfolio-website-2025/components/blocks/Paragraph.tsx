import { AnimWrapper } from "./Anim";
import type { ParagraphData, WithAnim } from "@/lib/blocks";

export default function Paragraph({ data }: { data: ParagraphData & Partial<WithAnim> }) {
    
    const fs = data.fontSize ?? 16;
    const mt = data.marginTop ?? 16;
    const mb = data.marginBottom ?? 16;

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
                <div
                    className="prose max-w-none prose-p:m-0 [&_a]:text-[#9D231B] [&_a:hover]:underline [&_a:visited]:text-[#9D231B]"
                    style={{ fontSize: fs, marginTop: mt, marginBottom: mb }}
                    dangerouslySetInnerHTML={{ __html: data.html }}
                />
            </AnimWrapper>
        </div>
    );
}
