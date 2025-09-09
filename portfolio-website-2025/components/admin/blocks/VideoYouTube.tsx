"use client";
import type { Block, VideoData } from "@/lib/blocks";
import { isVideoData } from "@/lib/blocks";

export default function VideoYouTubeEditor({
  block,
  onChange,
}: { block: Block; onChange: (b: Block) => void }) {
  if (!isVideoData(block)) return null;
  return (
    <input
      className="w-full rounded border p-2 text-black"
      value={block.data.url}
      onChange={(e) => onChange({ ...block, data: { ...block.data, url: e.target.value } as VideoData })}
      placeholder="YouTube URL"
    />
  );
}
