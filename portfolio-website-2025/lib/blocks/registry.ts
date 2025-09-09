// Central mapping of BlockType -> data type. This is the single source of truth.

import type { BlockType } from "./core";
import type { TitleData } from "./blocks/title";
import type { SubtitleData } from "./blocks/subtitle";
import type { ParagraphData } from "./blocks/paragraph";
import type { ImageData } from "./blocks/image";
import type { GalleryData } from "./blocks/gallery";
import type { VideoData } from "./blocks/video_youtube";
import type { ColumnsData } from "./blocks/columns";
import type { ButtonData } from "./blocks/button";
import type { SlideshowData } from "./blocks/slideshow";
import type { DateData } from "./blocks/date";
import type { CardGridData } from "./blocks/card_grid";

export interface BlockRegistry {
  title: TitleData;
  subtitle: SubtitleData;
  paragraph: ParagraphData;
  image: ImageData;
  gallery: GalleryData;
  video_youtube: VideoData;
  columns: ColumnsData;
  button: ButtonData;
  slideshow: SlideshowData;
  date: DateData;
  card_grid: CardGridData;
}

export type BlockData = BlockRegistry[BlockType];
