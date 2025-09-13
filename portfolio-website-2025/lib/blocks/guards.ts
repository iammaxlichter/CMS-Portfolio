// Runtime helpers: generic guard + per-type conveniences.

import type { Block } from "./core";
import type { BlockData } from "./registry";

export function isBlock<T extends BlockData>(
  b: Block,
  type: Block["block_type"]
): b is Block & { data: T } {
  return b.block_type === type;
}

// Ergonomic guards mirroring your previous API.
export const isTitleData     = (b: Block) => isBlock<import("./blocks/title").TitleData>(b, "title");
export const isSubtitleData  = (b: Block) => isBlock<import("./blocks/subtitle").SubtitleData>(b, "subtitle");
export const isParagraphData = (b: Block) => isBlock<import("./blocks/paragraph").ParagraphData>(b, "paragraph");
export const isImageData     = (b: Block) => isBlock<import("./blocks/image").ImageData>(b, "image");
export const isGalleryData   = (b: Block) => isBlock<import("./blocks/gallery").GalleryData>(b, "gallery");
export const isVideoData     = (b: Block) => isBlock<import("./blocks/video_youtube").VideoData>(b, "video_youtube");
export const isColumnsData   = (b: Block) => isBlock<import("./blocks/columns").ColumnsData>(b, "columns");
export const isButtonData    = (b: Block) => isBlock<import("./blocks/button").ButtonData>(b, "button");
export const isSlideshowData = (b: Block) => isBlock<import("./blocks/slideshow").SlideshowData>(b, "slideshow");
export const isDateData      = (b: Block) => isBlock<import("./blocks/date").DateData>(b, "date");
export const isCardGridData  = (b: Block) => isBlock<import("./blocks/card_grid").CardGridData>(b, "card_grid");
