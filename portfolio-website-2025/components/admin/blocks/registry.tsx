// components/admin/blocks/registry.tsx
"use client";
import type { JSX } from "react";
import type { Block } from "@/lib/blocks/types";
import TitleEditor from "@/components/admin/blocks/Title";
import SubtitleEditor from "@/components/admin/blocks/Subtitle";
import Paragraph from "@/components/admin/blocks/Paragraph";
import ImageEditor from "@/components/admin/blocks/Image";
import GalleryEditor from "@/components/admin/blocks/Gallery";
import VideoYouTubeEditor from "@/components/admin/blocks/VideoYouTube";
import ButtonEditor from "@/components/admin/blocks/Button";
import SlideshowEditor from "@/components/admin/blocks/Slideshow"; // editor, not viewer
import DateEditor from "@/components/admin/blocks/Date";
import CardGridEditor from "@/components/admin/blocks/CardGrid";

export interface BlockEditorProps {
  block: Block;
  onChange: (b: Block) => void;
}
export type EditorComponent = (props: BlockEditorProps) => JSX.Element | null;

// adapter to erase narrow prop types
const wrap = (Comp: any): EditorComponent => (p) => <Comp {...(p as any)} />;

const BlockEditors = {
  title: wrap(TitleEditor),
  subtitle: wrap(SubtitleEditor),
  paragraph: wrap(Paragraph),
  image: wrap(ImageEditor),
  gallery: wrap(GalleryEditor),
  video_youtube: wrap(VideoYouTubeEditor),
  button: wrap(ButtonEditor),
  slideshow: wrap(SlideshowEditor),
  date: wrap(DateEditor),
  card_grid: wrap(CardGridEditor),
  columns: () => null,
} satisfies Record<Block["block_type"], EditorComponent>;

export default BlockEditors;
