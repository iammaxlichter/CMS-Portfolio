// components/admin/editor/BlockEditor.tsx
"use client";

import { useEffect, useState, type JSX } from "react";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DroppableContainer,
  useSensor,
  useSensors,
  PointerSensor,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Block, BlockType } from "@/lib/blocks";
import BlockEditors from "@/components/admin/blocks/registry";
import ColumnsEditor from "@/components/admin/blocks/ColumnsEditor";
import DropZone from "@/components/admin/dnd/DropZone";
import SortableBlockShell from "@/components/admin/dnd/SortableBlockShell";
import useBlocks from "@/components/admin/hooks/useBlocks";
import useDebounce from "@/components/admin/hooks/useDebounce";
import useBlockDnd from "@/components/admin/hooks/useBlockDnd";

/** ---------- Cross-version helpers (v6/v7) ---------- */
function getContainerById(
  containers: any,
  id: UniqueIdentifier
): DroppableContainer | undefined {
  if (!containers) return undefined;
  if (typeof containers.get === "function") return containers.get(id);
  if (Array.isArray(containers)) return containers.find((c: any) => c?.id === id);
  return containers[id as any];
}

type RectLike = { top: number; bottom: number; height: number };
function getRectForId(
  rects: any,
  containers: any,
  id: UniqueIdentifier
): RectLike | undefined {
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
/** --------------------------------------------------- */

// Stricter collision detection: trigger only when pointer is in edge bands
const EDGE_BAND = 0.1;
function isDropZone(c: DroppableContainer) {
  return c.data?.current?.type === "dropzone";
}

const edgeBandCollision: CollisionDetection = (args) => {
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

  const candidates = candidatesFrom(pointerCoordinates.y, candidateList, droppableRects, droppableContainers);
  if (!candidates.length) return [];
  return closestCenter({ ...args, droppableContainers: candidates as any });
};

function candidatesFrom(
  y: number,
  list: DroppableContainer[],
  rects: any,
  containers: any
) {
  return list.filter((c) => {
    if (isDropZone(c)) return true;
    const rect = getRectForId(rects, containers, c.id);
    if (!rect) return false;
    const topBand = rect.top + rect.height * EDGE_BAND;
    const bottomBand = rect.bottom - rect.height * EDGE_BAND;
    return y <= topBand || y >= bottomBand;
  });
}

export default function BlockEditor({
  pageId,
  initial,
}: {
  pageId: string;
  initial: Block[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []); // avoid hydration mismatch from DnD a11y IDs

  const { blocks, setBlocks, addRoot, addChild, updateBlock, del } = useBlocks(pageId, initial);
  const { onDragEnd } = useBlockDnd(blocks, setBlocks);
  const debounced = useDebounce(updateBlock, 300);

  // Small drag threshold prevents accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const AddRow = ({ onAdd }: { onAdd: (t: BlockType) => void }) => {
    const types: BlockType[] = [
      "title",
      "subtitle",
      "paragraph",
      "image",
      "gallery",
      "video_youtube",
      "button",
      "slideshow",
      "date",
      "card_grid",
      "columns",
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

  // Use a single, consistently sorted roots array for items + rendering
  const roots = blocks
    .filter((b) => !b.parent_id)
    .sort((a, b) => a.position - b.position);

  if (!mounted) {
    // Optional: a tiny skeleton to avoid layout shift
    return (
      <div>
        <div className="mb-6">
          <AddRow onAdd={(t) => { /* no-op before mount */ }} />
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
      // Defensive: if Enter bubbles up from editors, don't trigger any parent behaviors
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // Let TEXTAREA handle newlines; otherwise no-op
          const tag = (e.target as HTMLElement)?.tagName;
          if (tag !== "TEXTAREA") e.preventDefault();
        }
      }}
    >
      <div className="mb-6">
        <AddRow onAdd={(t) => addRoot(t)} />
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
                  onDelete={() => del(b.id)}
                  addChild={addChild}
                  del={del}
                />
              ) : (
                <SortableBlockShell
                  key={b.id}
                  block={b}
                  onChange={debounced}
                  onDelete={() => del(b.id)}
                >
                  {(() => {
                    const Editor = BlockEditors[b.block_type];
                    return Editor ? <Editor block={b} onChange={debounced} /> : null;
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
