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

export const imageDefault: ImageData = {
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
};
