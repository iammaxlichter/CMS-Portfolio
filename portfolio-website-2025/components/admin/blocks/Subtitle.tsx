"use client";
import type { Block, SubtitleData } from "@/lib/blocks/types";
import { isSubtitleData } from "@/lib/blocks/types";

export default function SubtitleEditor({
  block,
  onChange,
}: { block: Block; onChange: (b: Block) => void }) {
  if (!isSubtitleData(block)) return null;
  return (
    <input
      className="w-full rounded border p-2 text-lg text-black"
      value={block.data.text}
      onChange={(e) =>
        onChange({ ...block, data: { ...block.data, text: e.target.value } as SubtitleData })
      }
      placeholder="Subtitle"
    />
  );
}
