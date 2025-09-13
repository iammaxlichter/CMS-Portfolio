"use client";
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import type { Block } from "@/lib/blocks";
import { supabase } from "@/lib/supabase/client";
import { between } from "@/components/admin/utils/positions";
import {
  containerIdFor,
  parseContainerId,
  groupIntoContainers,
  type ContainerId,
} from "@/components/admin/utils/blocks";

export default function useBlockDnd(
  blocks: Block[], 
  setBlocks: (updater: (prev: Block[]) => Block[]) => void
) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to determine the container ID from various drop targets
  function getContainerFromOverId(overId: string, blocks: Block[]): ContainerId {
    // Handle root drop
    if (overId === 'root') {
      return 'root' as ContainerId;
    }
    
    // Handle column container drops (col-left:parentId, col-right:parentId)
    if (overId.startsWith('col-')) {
      return overId as ContainerId;
    }
    
    // Handle legacy column naming (column-left-parentId, column-right-parentId)
    if (overId.startsWith('column-')) {
      const parts = overId.split('-');
      if (parts.length >= 3) {
        const slot = parts[1]; // 'left' or 'right'
        const parentId = parts.slice(2).join('-'); // rejoin in case ID has dashes
        return `col-${slot}:${parentId}` as ContainerId;
      }
    }
    
    // Check if dropping on another block - inherit its container
    const targetBlock = blocks.find((b) => b.id === overId);
    if (targetBlock) {
      if (targetBlock.parent_id && targetBlock.slot) {
        return `col-${targetBlock.slot}:${targetBlock.parent_id}` as ContainerId;
      } else {
        return 'root' as ContainerId;
      }
    }
    
    // If the overId contains a colon, it might be a container ID itself
    if (overId.includes(':')) {
      return overId as ContainerId;
    }
    
    // Fallback to root
    console.warn(`Could not determine container for overId: ${overId}, defaulting to root`);
    return 'root' as ContainerId;
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeBlock = blocks.find((b) => b.id === activeId);
    
    if (!activeBlock) {
      console.warn(`Active block not found: ${activeId}`);
      return;
    }

    // Determine source container
    const activeContainer: ContainerId = activeBlock.parent_id && activeBlock.slot
      ? `col-${activeBlock.slot}:${activeBlock.parent_id}` as ContainerId
      : 'root' as ContainerId;

    // Determine target container
    const overContainer = getContainerFromOverId(overId, blocks);

    console.log(`Drag: ${activeId} from ${activeContainer} to ${overContainer} (over: ${overId})`);

    const containers = groupIntoContainers(blocks);
    const srcArr = containers.get(activeContainer) || [];
    const dstArr = containers.get(overContainer) || [];

    const fromIndex = srcArr.findIndex((b) => b.id === activeId);
    
    // Determine insertion index
    let toIndex: number;
    
    if (overId.startsWith('col-') || overId.startsWith('column-') || overId === 'root') {
      // Dropping on a container or drop zone - append to end
      toIndex = dstArr.length;
    } else {
      // Dropping on a specific block - insert before or after it
      toIndex = dstArr.findIndex((b) => b.id === overId);
      if (toIndex < 0) {
        toIndex = dstArr.length; // Fallback to end
      }
    }

    // Same container reordering
    if (activeContainer === overContainer) {
      if (fromIndex === toIndex || fromIndex === toIndex - 1) {
        return; // No meaningful change
      }
      
      const reordered = [...srcArr];
      const [moved] = reordered.splice(fromIndex, 1);
      
      // Adjust toIndex if we removed an item before it
      const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      reordered.splice(adjustedToIndex, 0, moved);
      
      const prev = reordered[adjustedToIndex - 1]?.position;
      const next = reordered[adjustedToIndex + 1]?.position;
      const newPos = between(prev, next);

      setBlocks((prev) => prev.map((b) => (b.id === activeId ? { ...b, position: newPos } : b)));
      
      try {
        await supabase.from("content_blocks").update({ position: newPos }).eq("id", activeId);
      } catch (error) {
        console.error('Failed to update block position:', error);
      }
      
      return;
    }

    // Cross-container move
    const before = dstArr[toIndex - 1]?.position;
    const after = dstArr[toIndex]?.position;
    const newPos = between(before, after);
    const { parent_id, slot } = parseContainerId(overContainer);

    // Update local state optimistically
    setBlocks((prev) =>
      prev.map((b) => (b.id === activeId ? { ...b, parent_id, slot, position: newPos } : b))
    );
    
    // Persist to database
    try {
      await supabase
        .from("content_blocks")
        .update({ parent_id, slot, position: newPos })
        .eq("id", activeId);
    } catch (error) {
      console.error('Failed to update block container:', error);
      // TODO: Consider reverting optimistic update on error
    }
  }

  return { sensors, onDragEnd };
}