// components/admin/editor/BlockEditor.tsx
"use client";

import { useEffect, useState, type JSX } from "react";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  type CollisionDetection,
  type DroppableContainer,
  type UniqueIdentifier,
  pointerWithin,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Block, BlockType } from "@/lib/blocks";
import BlockEditors from "@/components/admin/blocks/registry";
import ColumnsEditor from "@/components/admin/blocks/ColumnsEditor";
import DropZone from "@/components/admin/dnd/DropZone";
import SortableBlockShell from "@/components/admin/dnd/SortableBlockShell";
import useBlocks from "@/components/admin/hooks/useBlocks";
import useBlockDnd from "@/components/admin/hooks/useBlockDnd";

type RectLike = { top: number; bottom: number; height: number };

function getContainerById(containers: any, id: UniqueIdentifier): DroppableContainer | undefined {
  if (!containers) return undefined;
  if (typeof containers.get === "function") return containers.get(id);
  if (Array.isArray(containers)) return containers.find((c: any) => c?.id === id);
  return containers[id as any];
}

function getRectForId(rects: any, containers: any, id: UniqueIdentifier): RectLike | undefined {
  if (rects && typeof rects.get === "function") {
    const r = rects.get(id);
    if (r) return r;
  }
  const cont = getContainerById(containers, id) as any;
  const r = cont?.rect?.current;
  if (r) return r;
  const node: HTMLElement | null = cont?.node?.current ?? null;
  if (node) return node.getBoundingClientRect();
  return undefined;
}

const EDGE_BAND = 0.1;

function isDropZone(c: DroppableContainer) {
  return c.data?.current?.type === "dropzone";
}

export const edgeBandCollision: CollisionDetection = (args) => {
  const { droppableRects, droppableContainers, pointerCoordinates } = args;
  if (!pointerCoordinates) return [];

  const hits = pointerWithin(args).filter(({ id }) => {
    const container = getContainerById(droppableContainers, id);
    if (!container) return false;
    if (isDropZone(container)) return true;

    const rect = getRectForId(droppableRects, droppableContainers, id);
    if (!rect) return false;

    const topBand = rect.top + rect.height * EDGE_BAND;
    const bottomBand = rect.bottom - rect.height * EDGE_BAND;
    const y = pointerCoordinates.y;
    return y <= topBand || y >= bottomBand;
  });

  if (hits.length) return hits;

  const candidateList: DroppableContainer[] = Array.isArray(droppableContainers)
    ? droppableContainers
    : typeof (droppableContainers as any).forEach === "function"
      ? (() => {
          const arr: DroppableContainer[] = [];
          (droppableContainers as any).forEach((v: DroppableContainer) => arr.push(v));
          return arr;
        })()
      : (Object.values(droppableContainers ?? {}) as DroppableContainer[]);

  const candidates = candidateList.filter((c) => {
    if (isDropZone(c)) return true;
    const rect = getRectForId(droppableRects, droppableContainers, c.id);
    if (!rect) return false;
    const topBand = rect.top + rect.height * EDGE_BAND;
    const bottomBand = rect.bottom - rect.height * EDGE_BAND;
    return pointerCoordinates.y <= topBand || pointerCoordinates.y >= bottomBand;
  });

  if (!candidates.length) return [];
  return closestCenter({ ...args, droppableContainers: candidates as any });
};

export default function BlockEditor({
  pageId,
  initial,
}: {
  pageId: string;
  initial: Block[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    blocks,
    setBlocks,
    addRoot,
    addChild,
    updateBlock,
    deleteBlock,
    saveChanges,
    hasDirty,
  } = useBlocks(pageId, initial);

  const { onDragEnd } = useBlockDnd(blocks, setBlocks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const AddRow = ({ onAdd }: { onAdd: (t: BlockType) => void }) => {
    const types: BlockType[] = [
      "title","subtitle","paragraph","image","gallery",
      "video_youtube","button","slideshow","date","card_grid","columns",
    ];
    return (
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            className="rounded-2xl border bg-white px-3 py-2 text-sm text-black hover:bg-neutral-100 transition-colors"
            onClick={() => onAdd(t)}
          >
            + {t.replace("_", " ")}
          </button>
        ))}
      </div>
    );
  };

  const roots = blocks
    .filter((b) => !b.parent_id)
    .sort((a, b) => a.position - b.position);

  if (!mounted) {
    return (
      <div>
        <div className="mb-6">
          <AddRow onAdd={() => {}} />
        </div>
        <div className="space-y-4">
          <div className="h-24 rounded-xl border bg-neutral-50" />
          <div className="h-24 rounded-xl border bg-neutral-50" />
        </div>
      </div>
    );
  }

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const tag = (e.target as HTMLElement)?.tagName;
          if (tag !== "TEXTAREA") e.preventDefault();
        }
      }}
    >
      <div className="mb-6 flex items-center gap-1">
        <AddRow onAdd={(t) => addRoot(t)} />
        <button
          type="button"
          onClick={saveChanges}
          disabled={!hasDirty}
          className={`px-2 py-2 rounded-sm text-sm ${
            hasDirty
              ? "bg-black text-white hover:bg-neutral-800"
              : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
          }`}
          title={hasDirty ? "Save content changes" : "No changes to save"}
        >
          Save Content
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={edgeBandCollision} onDragEnd={onDragEnd}>
        <SortableContext
          id="root"
          items={roots.map((b) => b.id as UniqueIdentifier)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {roots.map((b) =>
              b.block_type === "columns" ? (
                <ColumnsEditor
                  key={b.id}
                  block={b}
                  allBlocks={blocks}
                  onChange={updateBlock}
                  onDelete={() => deleteBlock(b.id)}
                  addChild={addChild}
                  del={deleteBlock}
                />
              ) : (
                <SortableBlockShell
                  key={b.id}
                  block={b}
                  onChange={updateBlock}
                  onDelete={() => deleteBlock(b.id)}
                >
                  {(() => {
                    const Editor = BlockEditors[b.block_type];
                    return Editor ? <Editor block={b} onChange={updateBlock} /> : null;
                  })()}
                </SortableBlockShell>
              )
            )}
            <DropZone id="root" />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
