"use client";
import type { Block, TitleData } from "@/lib/blocks/types";
import { isTitleData } from "@/lib/blocks/types";

export default function TitleEditor({
  block,
  onChange,
}: { block: Block; onChange: (b: Block) => void }) {
  if (!isTitleData(block)) return null;
  return (
    <>
      <input
        className="w-full rounded border p-2 text-xl font-bold text-black"
        value={block.data.text}
        onChange={(e) =>
          onChange({ ...block, data: { ...block.data, text: e.target.value } as TitleData })
        }
        placeholder="Page title"
      />
      <div className="text-xs text-neutral-400">This will render as an H1.</div>
    </>
  );
}
