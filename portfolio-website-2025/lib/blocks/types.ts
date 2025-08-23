// /lib/blocks/types.ts
export type BlockType =
  | "title"
  | "subtitle"
  | "paragraph"
  | "image"
  | "gallery"
  | "video_youtube"
  | "columns"
  | "button"
  | "slideshow"; 

export type TitleData = { text: string };
export type SubtitleData = { text: string };
export type ParagraphData = { html: string };
export type ImageData = { path: string; alt: string };
export type GalleryData = { paths: string[] };
export type VideoData = { url: string };
export type ColumnsData = { columns: 1 | 2 };
export type ButtonData = { text: string; href: string };
export type SlideshowData = { paths: string[] };

export type BlockData =
  | TitleData
  | SubtitleData
  | ParagraphData
  | ImageData
  | GalleryData
  | VideoData
  | ColumnsData
  | ButtonData
  | SlideshowData

export type Slot = "left" | "right" | null;

export type Block = {
  id: string;
  page_id: string;
  block_type: BlockType;
  data: BlockData;
  position: number;
  parent_id: string | null;
  slot: Slot;
};

export const DefaultData: Record<BlockType, BlockData> = {
  title: { text: "Title" },
  subtitle: { text: "Subtitle" },
  paragraph: { html: "Write something…" },
  image: { path: "", alt: "" },
  gallery: { paths: [] },
  video_youtube: { url: "" },
  columns: { columns: 2 },
  button: { text: "Learn more", href: "/" },
  slideshow: { paths: [] },
};

// Type guard functions
export function isTitleData(block: Block): block is Block & { data: TitleData } {
  return block.block_type === "title";
}

export function isSubtitleData(block: Block): block is Block & { data: SubtitleData } {
  return block.block_type === "subtitle";
}

export function isParagraphData(block: Block): block is Block & { data: ParagraphData } {
  return block.block_type === "paragraph";
}

export function isImageData(block: Block): block is Block & { data: ImageData } {
  return block.block_type === "image";
}

export function isGalleryData(block: Block): block is Block & { data: GalleryData } {
  return block.block_type === "gallery";
}

export function isVideoData(block: Block): block is Block & { data: VideoData } {
  return block.block_type === "video_youtube";
}

export function isColumnsData(block: Block): block is Block & { data: ColumnsData } {
  return block.block_type === "columns";
}

export function isButtonData(block: Block): block is Block & { data: ButtonData } {
  return block.block_type === "button";
}

export function isSlideshowData(block: Block): block is Block & { data: SlideshowData } {
  return block.block_type === "slideshow";
}