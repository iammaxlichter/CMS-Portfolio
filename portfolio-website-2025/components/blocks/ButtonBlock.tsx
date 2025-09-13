import { AnimWrapper } from "./Anim";
import type { ButtonData, WithAnim } from "@/lib/blocks";

export default function ButtonBlock({ data }: { data: ButtonData & Partial<WithAnim> }) {

    const isExternal = /^https?:\/\//i.test(data.href);
    const v = data.variant ?? "outline";
    const mt = data.paddingTop ?? 0;
    const mb = data.paddingBottom ?? 0;

    const base =
        "inline-flex items-center rounded-lg px-6 py-3 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
    const outline =
        "border border-[#9D231B] text-[#9D231B] bg-transparent hover:bg-[#9D231B]/10 focus-visible:ring-[#9D231B]";
    const solid =
        "bg-[#9D231B] text-[#FBFBFB] hover:brightness-95 focus-visible:ring-[#9D231B]";

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
                <div style={{ marginTop: mt, marginBottom: mb }}>
                    <a
                        href={data.href || "#"}
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`${base} ${v === "solid" ? solid : outline}`}
                    >
                        {data.text || "Learn more"}
                    </a>
                </div>
            </AnimWrapper>
        </div>
    );
}
