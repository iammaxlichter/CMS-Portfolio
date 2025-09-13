import type {
    Block,
    WithAnim,
    TitleData,
    SubtitleData,
    ParagraphData,
    ImageData,
    GalleryData,
    VideoData,
    ButtonData,
    SlideshowData,
    DateData,
    CardGridData,
} from "@/lib/blocks";
import {
    isTitleData,
    isSubtitleData,
    isParagraphData,
    isImageData,
    isGalleryData,
    isVideoData,
    isButtonData,
    isSlideshowData,
    isDateData,
    isCardGridData,
} from "@/lib/blocks";

import Title from "./Title";
import Subtitle from "./Subtitle";
import Paragraph from "./Paragraph";
import ImageBlock from "./ImageBlock";
import Gallery from "./Gallery";
import VideoYouTube from "./VideoYouTube";
import ButtonBlock from "./ButtonBlock";
import DateText from "./DateText";
import CardGrid from "./CardGrid";
import Slideshow from "./Slideshow";

export default function BlockView({ b }: { b: Block }) {
    switch (b.block_type) {
        case "title":
            return isTitleData(b) ? (
                <Title data={b.data as TitleData & WithAnim} />
            ) : null;

        case "subtitle":
            return isSubtitleData(b) ? (
                <Subtitle data={b.data as SubtitleData & WithAnim} />
            ) : null;

        case "paragraph":
            return isParagraphData(b) ? (
                <Paragraph data={b.data as ParagraphData & WithAnim} />
            ) : null;

        case "image":
            return isImageData(b) ? (
                <ImageBlock data={b.data as ImageData & WithAnim} />
            ) : null;

        case "gallery":
            return isGalleryData(b) ? (
                <Gallery data={b.data as GalleryData & WithAnim} />
            ) : null;

        case "video_youtube":
            return isVideoData(b) ? (
                <VideoYouTube data={b.data as VideoData & WithAnim} />
            ) : null;

        case "button":
            return isButtonData(b) ? (
                <ButtonBlock data={b.data as ButtonData & WithAnim} />
            ) : null;

        case "slideshow":
            return (
                <Slideshow data={b.data as SlideshowData & Partial<WithAnim>} />
            );

        case "date":
            return isDateData(b) ? (
                <DateText data={b.data as DateData & WithAnim} />
            ) : null;

        case "card_grid":
            return isCardGridData(b) ? (
                <CardGrid data={b.data as CardGridData & WithAnim} />
            ) : null;

        default:
            return null;
    }
}
