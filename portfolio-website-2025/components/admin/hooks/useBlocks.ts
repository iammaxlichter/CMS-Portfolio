// components/admin/hooks/useBlocks.ts
"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Block, BlockType, Slot } from "@/lib/blocks";
import { DefaultData } from "@/lib/blocks";

function jsonSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v ?? {})) as T;
}

export default function useBlocks(pageId: string, initial: Block[]) {
  const sorted = (initial ?? []).slice().sort((a, b) => a.position - b.position);
  const [blocks, setBlocks] = useState<Block[]>(sorted);
  const dirtyRef = useRef<Set<string>>(new Set());
  const [dirtyCount, setDirtyCount] = useState(0);
  const hasDirty = dirtyCount > 0;

  function markDirty(id: string) {
    if (!dirtyRef.current.has(id)) {
      dirtyRef.current.add(id);
      setDirtyCount(dirtyRef.current.size);
    }
  }
  function clearDirty(ids?: string[]) {
    if (ids && ids.length) {
      ids.forEach((id) => dirtyRef.current.delete(id));
      setDirtyCount(dirtyRef.current.size);
    } else {
      dirtyRef.current.clear();
      setDirtyCount(0);
    }
  }

  async function addRoot(type: BlockType) {
    const def = DefaultData[type];
    const roots = blocks.filter((b) => !b.parent_id);
    const last = roots.length ? Math.max(...roots.map((b) => b.position)) : 0;
    const nextPos = last + 1000;

    const payload = {
      page_id: pageId,
      block_type: type,
      data: jsonSafe(def),
      parent_id: null,
      slot: null as Slot,
      position: nextPos,
    };

    const { data, error } = await supabase
      .from("content_blocks")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("content_blocks insert failed:", JSON.stringify(error, null, 2), payload);
      return;
    }
    setBlocks((p) => [...p, data as Block]);
  }

  async function addChild(parentId: string, slot: "left" | "right", type: BlockType) {
    const def = DefaultData[type];
    const siblings = blocks.filter((b) => b.parent_id === parentId && b.slot === slot);
    const last = siblings.length ? Math.max(...siblings.map((b) => b.position)) : 0;
    const nextPos = last + 1000;

    const payload = {
      page_id: pageId,
      block_type: type,
      data: jsonSafe(def),
      parent_id: parentId,
      slot,
      position: nextPos,
    };

    const { data, error } = await supabase
      .from("content_blocks")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("content_blocks insert failed (child):", JSON.stringify(error, null, 2), payload);
      return;
    }
    setBlocks((p) => [...p, data as Block]);
  }

  function updateBlock(nb: Block) {
    setBlocks((prev) => prev.map((x) => (x.id === nb.id ? nb : x)));
    markDirty(nb.id);
  }

  async function saveChanges() {
    const dirtyIds = Array.from(dirtyRef.current);
    if (dirtyIds.length === 0) return;

    const byId = new Map(blocks.map((b) => [b.id, b]));
    const results = await Promise.all(
      dirtyIds.map(async (id) => {
        const b = byId.get(id);
        if (!b) return { id, error: "missing" };
        const { error } = await supabase
          .from("content_blocks")
          .update({
            data: jsonSafe(b.data),
            position: b.position,
            parent_id: b.parent_id,
            slot: b.slot,
          })
          .eq("id", id);
        return { id, error };
      })
    );

    const failed = results.filter((r) => r.error);
    if (failed.length) {
      console.error("saveChanges: some updates failed", failed);
      const succeeded = results.filter((r) => !r.error).map((r) => r.id);
      clearDirty(succeeded);
    } else {
      clearDirty();
    }
  }

  async function deleteBlock(id: string) {
    const { error } = await supabase.from("content_blocks").delete().eq("id", id);
    if (error) {
      console.error("content_blocks delete failed:", JSON.stringify(error, null, 2));
      return;
    }
    dirtyRef.current.delete(id);
    setDirtyCount(dirtyRef.current.size);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return {
    blocks,
    setBlocks,
    addRoot,
    addChild,
    updateBlock,
    deleteBlock,
    saveChanges,
    hasDirty,
  };
}
