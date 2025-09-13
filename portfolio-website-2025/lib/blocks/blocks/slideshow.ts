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

export const slideshowDefault: SlideshowData = {
  paths: [],
  borderWidthPx: 0,
  borderColor: "#343330",
  paddingPx: 0,
};
