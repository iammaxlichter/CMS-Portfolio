"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Block, BlockType } from "@/lib/blocks";
import { DefaultData } from "@/lib/blocks";

export default function useBlocks(pageId: string, initial: Block[]) {
  const [blocks, setBlocks] = useState<Block[]>(
    [...initial].sort((a, b) => a.position - b.position)
  );

  async function addRoot(type: BlockType) {
    const def = DefaultData[type];
    const roots = blocks.filter((b) => !b.parent_id);
    const last = roots.length ? Math.max(...roots.map((b) => b.position)) : 0;
    const nextPos = last + 1000;

    const { data, error } = await supabase
      .from("content_blocks")
      .insert({
        page_id: pageId,
        block_type: type,
        data: def,
        parent_id: null,
        slot: null,
        position: nextPos,
      })
      .select("*")
      .single();

    if (!error && data) setBlocks((p) => [...p, data as Block]);
  }

  async function addChild(parentId: string, slot: "left" | "right", type: BlockType) {
    const def = DefaultData[type];
    const siblings = blocks.filter((b) => b.parent_id === parentId && b.slot === slot);
    const last = siblings.length ? Math.max(...siblings.map((b) => b.position)) : 0;
    const nextPos = last + 1000;

    const { data, error } = await supabase
      .from("content_blocks")
      .insert({
        page_id: pageId,
        block_type: type,
        data: def,
        parent_id: parentId,
        slot,
        position: nextPos,
      })
      .select("*")
      .single();

    if (!error && data) setBlocks((p) => [...p, data as Block]);
  }

  async function updateBlock(nb: Block) {
    setBlocks((prev) => prev.map((x) => (x.id === nb.id ? nb : x)));
    await supabase.from("content_blocks").update({ data: nb.data }).eq("id", nb.id);
  }

  async function del(id: string) {
    await supabase.from("content_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return { blocks, setBlocks, addRoot, addChild, updateBlock, del };
}
