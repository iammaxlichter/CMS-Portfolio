import type { VAlign } from "../core";

export type ColumnsData = {
  columns: 1 | 2;
  vAlignLeft?: VAlign;
  vAlignRight?: VAlign;
};

export const columnsDefault: ColumnsData = {
  columns: 2,
  vAlignLeft: "top",
  vAlignRight: "top",
};
