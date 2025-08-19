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

export type TitleBlock       = { id: string; block_type: 'title';         data: TitleData;     sort_index: number };
export type SubtitleBlock    = { id: string; block_type: 'subtitle';      data: SubtitleData;  sort_index: number };
export type ParagraphBlock   = { id: string; block_type: 'paragraph';     data: ParagraphData; sort_index: number };
export type ImageBlock       = { id: string; block_type: 'image';         data: ImageData;     sort_index: number };
export type GalleryBlock     = { id: string; block_type: 'gallery';       data: GalleryData;   sort_index: number };
export type VideoBlock       = { id: string; block_type: 'video_youtube'; data: VideoData;     sort_index: number };
export type ColumnsBlock     = { id: string; block_type: 'columns';       data: ColumnsData;   sort_index: number };

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
