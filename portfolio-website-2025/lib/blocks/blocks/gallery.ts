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

export type GalleryData = {
  items?: GalleryItem[]; 
  paths?: string[];      
  cols?: 2 | 3 | 4;
  gap?: number;
};

export const galleryDefault: GalleryData = {
  items: [],
  cols: 3,
  gap: 12,
};
