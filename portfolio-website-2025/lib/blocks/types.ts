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

export type GalleryItem = {
  path: string;
  alt?: string;
  align?: "left" | "center" | "right";
  captionAlign?: "left" | "center" | "right";
  widthPercent?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  borderWidthPx?: number;
  borderColor?: string; 
  paddingPx?: number;
};

export type CardItem = {
  title: string;
  href: string;
  img: string;
  caption?: string;
  align?: "left" | "center" | "right"; 
  widthPercent?: number;              
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  thumbMaxWidthPx?: number; 
};

export type CardGridData = {
  items: CardItem[];
  borderWidthPx?: number;
  borderColor?: string;
  paddingPx?: number;
};

export type TitleData = { text: string };
export type SubtitleData = { text: string };
export type ParagraphData = {
  html: string;
  fontSize?: number;     
  marginTop?: number;     
  marginBottom?: number;  
};
export type ImageData = {
  path: string;
  alt: string;
  displayMaxWidth?: number;
  align?: "left" | "center" | "right";
  captionAlign?: "left" | "center" | "right";
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  marginTop?: number;         
  marginBottom?: number;      
  captionMarginTop?: number;  
  captionMarginBottom?: number;
  borderWidthPx?: number;
  borderColor?: string; 
  paddingPx?: number;
};
export type GalleryData = {
  items?: GalleryItem[];   // new shape
  paths?: string[];        // legacy shape
  cols?: 2 | 3 | 4;
  gap?: number;
};
   
export type AnimationSettings = {
  type: AnimationType;
  durationMs?: number; // default 600
  delayMs?: number;    // default 0
};

export type VideoData = { url: string };
export type ColumnsData = {
  columns: 1 | 2;
  vAlignLeft?: "top" | "middle" | "bottom";
  vAlignRight?: "top" | "middle" | "bottom";
};


export type ButtonData = {
  text: string;
  href: string;
  variant?: ButtonVariant;
  paddingTop?: number;
  paddingBottom?: number; 
};

export type SlideshowData = {
  paths: string[];
  displayMaxWidth?: number;
  align?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
  aspectRatio?: string;       
  fixedHeightPx?: number;     
  borderWidthPx?: number;
  borderColor?: string; 
  paddingPx?: number;
};

export type DateData = { text: string; align?: "left" | "center" | "right" };

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
  | DateData
  | CardGridData;

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
  paragraph: { html: "Write something…", fontSize: 16, marginTop: 16, marginBottom: 16 },
  image: {
    path: "",
    alt: "",
    displayMaxWidth: 1200,
    align: "left",
    captionAlign: "left",
    intrinsicWidth: 1600,
    intrinsicHeight: 900,
    marginTop: 16,
    marginBottom: 16,
    captionMarginTop: 4,
    captionMarginBottom: 4,
    borderWidthPx: 0,
    borderColor: "#343330", 
    paddingPx: 0,
    
  },
  gallery: { items: [], cols: 3, gap: 12, },
  video_youtube: { url: "" },
  columns: { columns: 2, vAlignLeft: "top", vAlignRight: "top" },
  button: { text: "Learn more", href: "/", variant: "outline", paddingTop: 0, paddingBottom: 0 },
  slideshow: { paths: [], borderWidthPx: 0, borderColor: "#343330", paddingPx: 0,  },
  date: { text: "Feb. 2025 – Present", align: "right" },
  card_grid: { items: [], borderWidthPx: 0, borderColor: "#343330", paddingPx: 0 },
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

export function isDateData(block: Block): block is Block & { data: DateData } {
  return block.block_type === "date";
}

export function isCardGridData(block: Block): block is Block & { data: CardGridData } {
  return block.block_type === "card_grid";
}

export type WithAnim = { _anim?: AnimationSettings };