// /lib/blocks/types.ts
export type BlockType =
  | "title"
  | "subtitle"
  | "paragraph"
  | "image"
  | "gallery"
  | "video_youtube"
  | "columns";

export type TitleData     = { text: string };
export type SubtitleData  = { text: string };
export type ParagraphData = { html: string };
export type ImageData     = { path: string; alt: string };
export type GalleryData   = { paths: string[] };
export type VideoData     = { url: string };

export type ColumnsData   = { columns: 1 | 2 };

export type Slot = "left" | "right" | null;

export type Block = {
  id: string;
  page_id: string;
  block_type: BlockType;
  data:
    | TitleData
    | SubtitleData
    | ParagraphData
    | ImageData
    | GalleryData
    | VideoData
    | ColumnsData;
  position: number;
  parent_id: string | null;
  slot: Slot;
};

export const DefaultData: Record<BlockType, any> = {
  title: { text: "Title" },
  subtitle: { text: "Subtitle" },
  paragraph: { html: "Write something…" },
  image: { path: "", alt: "" },
  gallery: { paths: [] },
  video_youtube: { url: "" },
  columns: { columns: 2 },
};
