// Core primitives shared everywhere (types only).

export type BlockType =
  | "title"
  | "subtitle"
  | "paragraph"
  | "image"
  | "gallery"
  | "video_youtube"
  | "columns"
  | "button"
  | "slideshow"
  | "date"
  | "card_grid";

export type AnimationType =
  | "slideInLeft"
  | "slideInRight"
  | "slideInTop"
  | "slideInBottom"
  | "fadeIn";

export type ButtonVariant = "outline" | "solid";
export type VAlign = "top" | "middle" | "bottom";
export type Slot = "left" | "right" | null;

export type AnimationSettings = {
  type: AnimationType;
  durationMs?: number;
  delayMs?: number;
};

export type Block<BD = unknown> = {
  id: string;
  page_id: string;
  block_type: BlockType;
  data: BD;
  position: number;
  parent_id: string | null;
  slot: Slot;
};

// Helper wrapper used by blocks that optionally include animation config.
export type WithAnim = { _anim?: AnimationSettings };
