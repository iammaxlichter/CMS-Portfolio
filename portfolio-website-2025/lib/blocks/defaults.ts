// Strongly-typed defaults aggregated from each block module.

import type { BlockRegistry } from "./registry";
import { titleDefault } from "./blocks/title";
import { subtitleDefault } from "./blocks/subtitle";
import { paragraphDefault } from "./blocks/paragraph";
import { imageDefault } from "./blocks/image";
import { galleryDefault } from "./blocks/gallery";
import { videoDefault } from "./blocks/video_youtube";
import { columnsDefault } from "./blocks/columns";
import { buttonDefault } from "./blocks/button";
import { slideshowDefault } from "./blocks/slideshow";
import { dateDefault } from "./blocks/date";
import { cardGridDefault } from "./blocks/card_grid";

export const DefaultData: BlockRegistry = {
  title: titleDefault,
  subtitle: subtitleDefault,
  paragraph: paragraphDefault,
  image: imageDefault,
  gallery: galleryDefault,
  video_youtube: videoDefault,
  columns: columnsDefault,
  button: buttonDefault,
  slideshow: slideshowDefault,
  date: dateDefault,
  card_grid: cardGridDefault,
};
