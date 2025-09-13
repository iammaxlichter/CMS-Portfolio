import type { Block, VAlign } from "@/lib/blocks";
import BlockView from "./BlockView";

const vClass = (v?: VAlign) =>
    v === "middle" ? "justify-center" : v === "bottom" ? "justify-end" : "justify-start";

export default function ColumnsView({
    block,
    all,
}: {
    block: Block;
    all: Block[];
}) {
    if (block.block_type !== "columns") return null;
    const { columns: cols, vAlignLeft, vAlignRight } = block.data as any;

    const left = all
        .filter((x) => x.parent_id === block.id && x.slot === "left")
        .sort((a, b) => a.position - b.position);

    const right = all
        .filter((x) => x.parent_id === block.id && x.slot === "right")
        .sort((a, b) => a.position - b.position);

    return (
        <div className={`grid ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"} items-stretch gap-6`}>
            <div className={`flex flex-col h-full ${vClass(vAlignLeft)} space-y-6`}>
                {left.map((child) =>
                    child.block_type === "columns" ? (
                        <ColumnsView key={child.id} block={child} all={all} />
                    ) : (
                        <BlockView key={child.id} b={child} />
                    )
                )}
            </div>

            {cols === 2 && (
                <div className={`flex flex-col h-full ${vClass(vAlignRight)} space-y-6`}>
                    {right.map((child) =>
                        child.block_type === "columns" ? (
                            <ColumnsView key={child.id} block={child} all={all} />
                        ) : (
                            <BlockView key={child.id} b={child} />
                        )
                    )}
                </div>
            )}
        </div>
    );
}
