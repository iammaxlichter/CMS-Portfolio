import type { Block, Slot } from "../../../lib/blocks/types";

export type ContainerId = "root" | `col-left:${string}` | `col-right:${string}`;

export function containerIdFor(b: Block): ContainerId {
  if (!b.parent_id) return "root";
  return (b.slot === "left" ? `col-left:${b.parent_id}` : `col-right:${b.parent_id}`) as ContainerId;
}

export function parseContainerId(id: ContainerId): { parent_id: string | null; slot: Slot } {
  if (id === "root") return { parent_id: null, slot: null };
  const [side, parent] = id.split(":");
  return { parent_id: parent, slot: side === "col-left" ? "left" : "right" };
}

export function groupIntoContainers(blocks: Block[]) {
  const map = new Map<ContainerId, Block[]>();
  map.set("root", []);
  for (const b of blocks) {
    const cid = containerIdFor(b);
    if (!map.has(cid)) map.set(cid, []);
    map.get(cid)!.push(b);
  }
  for (const arr of map.values()) arr.sort((a, b) => a.position - b.position);
  return map;
}
