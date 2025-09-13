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

export const cardGridDefault: CardGridData = {
  items: [],
  borderWidthPx: 0,
  borderColor: "#343330",
  paddingPx: 0,
};
