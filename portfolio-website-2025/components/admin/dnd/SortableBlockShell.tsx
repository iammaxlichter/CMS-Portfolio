"use client";
import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AnimationPanel from "@/components/admin/AnimationPanel";
import type { Block } from "@/lib/blocks/types";

type Props = {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  children?: React.ReactNode;
  /** Hide the AnimationPanel (e.g., when used inside columns) */
  showAnimationPanel?: boolean;
};

function SortableBlockShellImpl({
  block,
  onChange,
  onDelete,
  children,
  showAnimationPanel = true,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      block,
      type: "block",
      parentId: block.parent_id || null,
      slot: block.slot || null,
      sortable: {
        containerId:
          block.parent_id && block.slot ? `col-${block.slot}:${block.parent_id}` : "root",
      },
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 120ms ease" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  } as const;

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span
          className="cursor-grab select-none hover:text-neutral-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          ⋮⋮ Drag
        </span>
        <button type="button" onClick={onDelete} className="text-red-600 hover:text-red-800">
          Delete
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {children}
        {showAnimationPanel && <AnimationPanel block={block} onChange={onChange} />}
      </div>
    </div>
  );
}

const SortableBlockShell = memo(SortableBlockShellImpl);
export default SortableBlockShell;
