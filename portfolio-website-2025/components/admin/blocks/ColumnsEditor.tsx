"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Block, BlockType, ColumnsData } from "@/lib/blocks/types";
import { isColumnsData } from "@/lib/blocks/types";
import DropZone from "@/components/admin/dnd/DropZone";
import SortableBlockShell from "@/components/admin/dnd/SortableBlockShell";
import BlockEditors from "@/components/admin/blocks/registry";

/* Small inline add-menu used for left/right columns */
function AddMenu({ onAdd }: { onAdd: (t: BlockType) => void }) {
  const [open, setOpen] = useState(false);

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
    // no nested "columns"
  ];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="rounded-2xl border bg-white px-3 py-2 text-sm text-black hover:bg-neutral-100"
        onClick={() => setOpen((p) => !p)}
      >
        + Add block
      </button>

      {open && (
        <div
          className="absolute z-20 mt-2 w-48 rounded-xl border bg-white p-2 shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="max-h-64 overflow-auto">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-sm text-black hover:bg-neutral-100"
                onClick={() => {
                  onAdd(t);
                  setOpen(false);
                }}
              >
                <span className="capitalize">{t.replace("_", " ")}</span>
                <span className="text-neutral-500">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ColumnsEditor({
  block,
  allBlocks,
  onChange,
  onDelete,
  addChild,
  del,
}: {
  block: Block;
  allBlocks: Block[];
  onChange: (b: Block) => void;
  onDelete: () => void;
  addChild: (parentId: string, slot: "left" | "right", t: BlockType) => void;
  del: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      block,
      type: "columns",
      parentId: null,
      slot: null,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 120ms ease" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  } as const;

  if (!isColumnsData(block)) return null;

  const cols = block.data.columns;
  const vLeft = block.data.vAlignLeft ?? "top";
  const vRight = block.data.vAlignRight ?? "top";

  const left = allBlocks
    .filter((x) => x.parent_id === block.id && x.slot === "left")
    .sort((a, b) => a.position - b.position);

  const right = allBlocks
    .filter((x) => x.parent_id === block.id && x.slot === "right")
    .sort((a, b) => a.position - b.position);

  const vClass = (v: "top" | "middle" | "bottom") =>
    v === "middle" ? "justify-center" : v === "bottom" ? "justify-end" : "justify-start";

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-sm text-neutral-500">
        <span
          className="cursor-grab select-none hover:text-neutral-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          ⋮⋮ Drag Columns
        </span>
        <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-800">
          Delete
        </button>
      </div>

      {/* Column options */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm flex items-center gap-2 text-black">
          Columns:
          <select
            className="rounded border p-1 text-black"
            value={cols}
            onChange={(e) =>
              onChange({
                ...block,
                data: {
                  ...(block.data as ColumnsData),
                  columns: Number(e.target.value) as 1 | 2,
                },
              })
            }
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>

        <label className="text-sm flex items-center gap-2 text-black">
          Left v-align:
          <select
            className="rounded border p-1 text-black"
            value={vLeft}
            onChange={(e) =>
              onChange({
                ...block,
                data: { ...(block.data as ColumnsData), vAlignLeft: e.target.value as any },
              })
            }
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>

        {cols === 2 && (
          <label className="text-sm flex items-center gap-2 text-black">
            Right v-align:
            <select
              className="rounded border p-1 text-black"
              value={vRight}
              onChange={(e) =>
                onChange({
                  ...block,
                  data: { ...(block.data as ColumnsData), vAlignRight: e.target.value as any },
                })
              }
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        )}
      </div>

      {/* Columns */}
      <div className={`grid gap-6 mt-4 ${cols === 2 ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {/* Left column */}
        <div className={`flex h-full min-h-[200px] flex-col space-y-3 ${vClass(vLeft)}`}>
          <div className="text-xs text-neutral-500 font-medium">Left Column</div>
          <SortableContext
            id={`col-left:${block.id}`}
            items={left.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 flex-1">
              {left.map((child) => {
                const Editor = BlockEditors[child.block_type];
                return (
                  <SortableBlockShell
                    key={child.id}
                    block={child}
                    onChange={onChange}
                    onDelete={() => del(child.id)}
                  >
                    {Editor ? <Editor block={child} onChange={onChange} /> : null}
                  </SortableBlockShell>
                );
              })}
              <DropZone id={`col-left:${block.id}`} />
            </div>
          </SortableContext>

          <AddMenu onAdd={(t) => addChild(block.id, "left", t)} />
        </div>

        {/* Right column */}
        {cols === 2 && (
          <div className={`flex h-full min-h-[200px] flex-col space-y-3 ${vClass(vRight)}`}>
            <div className="text-xs text-neutral-500 font-medium">Right Column</div>
            <SortableContext
              id={`col-right:${block.id}`}
              items={right.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 flex-1">
                {right.map((child) => {
                  const Editor = BlockEditors[child.block_type];
                  return (
                    <SortableBlockShell
                      key={child.id}
                      block={child}
                      onChange={onChange}
                      onDelete={() => del(child.id)}
                    >
                      {Editor ? <Editor block={child} onChange={onChange} /> : null}
                    </SortableBlockShell>
                  );
                })}
                <DropZone id={`col-right:${block.id}`} />
              </div>
            </SortableContext>

            <AddMenu onAdd={(t) => addChild(block.id, "right", t)} />
          </div>
        )}
      </div>
    </div>
  );
}
