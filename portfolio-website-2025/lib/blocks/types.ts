// lib/blocks/types.ts  (no "use client")

export type BlockType =
  | 'title'
  | 'subtitle'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'video_youtube'
  | 'columns';

export type TitleData = { text: string };
export type SubtitleData = { text: string };
export type ParagraphData = { html: string };
export type ImageData = { path: string; alt: string };
export type GalleryData = { paths: string[] };
export type VideoData = { url: string };
export type ColumnsData = { columns: 1 | 2; left: string[]; right: string[] };

/** Common fields for every block.
 *  `position` is the new fractional ordering key.
 *  `sort_index` stays optional for backward compatibility during migration.
 */
type Base = {
  id: string;
  position: number;
  sort_index?: number; // deprecated
};

export type TitleBlock       = Base & { block_type: 'title';         data: TitleData };
export type SubtitleBlock    = Base & { block_type: 'subtitle';      data: SubtitleData };
export type ParagraphBlock   = Base & { block_type: 'paragraph';     data: ParagraphData };
export type ImageBlock       = Base & { block_type: 'image';         data: ImageData };
export type GalleryBlock     = Base & { block_type: 'gallery';       data: GalleryData };
export type VideoBlock       = Base & { block_type: 'video_youtube'; data: VideoData };
export type ColumnsBlock     = Base & { block_type: 'columns';       data: ColumnsData };

export type Block =
  | TitleBlock
  | SubtitleBlock
  | ParagraphBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | ColumnsBlock;

export const DefaultData: Record<
  BlockType,
  TitleData | SubtitleData | ParagraphData | ImageData | GalleryData | VideoData | ColumnsData
> = {
  title: { text: 'Title' },
  subtitle: { text: 'Subtitle' },
  paragraph: { html: 'Write something…' },
  image: { path: '', alt: '' },
  gallery: { paths: [] },
  video_youtube: { url: '' },
  columns: { columns: 2, left: [], right: [] },
};
