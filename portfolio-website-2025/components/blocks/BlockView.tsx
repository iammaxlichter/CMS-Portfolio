import Slideshow from "@/components/admin/blocks/Slideshow";
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
            return isSlideshowData(b) ? (
                <div className="sm:px-8">
                    <Slideshow
                        paths={b.data.paths ?? []}
                        displayMaxWidth={b.data.displayMaxWidth ?? 1200}
                        align={b.data.align ?? "left"}
                        marginTop={b.data.marginTop ?? 16}
                        marginBottom={b.data.marginBottom ?? 16}
                        aspectRatio={b.data.aspectRatio}
                        fixedHeightPx={b.data.fixedHeightPx}
                        borderColor={b.data.borderColor}
                        borderWidthPx={b.data.borderWidthPx}
                    />
                </div>
            ) : null;

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
