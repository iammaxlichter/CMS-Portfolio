// lib/blocks/blocks/card_grid.ts
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
  borderWidthPx?: number;
  borderColor?: string;
  paddingPx?: number;
};

export type CardGridData = {
  items: CardItem[];
  borderWidthPx?: number;
  borderColor?: string;
  paddingPx?: number;
};
