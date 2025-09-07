"use client";

import { useDroppable } from "@dnd-kit/core";

export default function DropZone({
  id,
  label,
}: {
  id: string;
  label?: string;
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: {
      type: "dropzone",
      containerId: id,
      accepts: ["block", "columns"],
    },
  });

  const isDragging = !!active;
  const showEnhanced = isDragging || isOver;

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded border-2 border-dashed transition-all duration-200 ease-in-out
        ${showEnhanced ? "h-12 border-blue-400 bg-blue-50" : "h-6 border-neutral-300/70"}
        ${isOver ? "border-blue-600 bg-blue-100" : ""}
        ${isDragging && !isOver ? "border-neutral-400 bg-neutral-50" : ""}
      `}
    >
      {showEnhanced && (
        <div className="flex items-center justify-center h-full text-xs text-neutral-500">
          {isOver ? "↓ Drop here" : label || "Drop zone"}
        </div>
      )}
    </div>
  );
}
