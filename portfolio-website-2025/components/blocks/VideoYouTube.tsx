import { AnimWrapper } from "./Anim";
import type { VideoData, WithAnim } from "@/lib/blocks";

export default function VideoYouTube({ data }: { data: VideoData & Partial<WithAnim> }) {
    const id = data.url?.match(/(?:v=|be\/)([A-Za-z0-9_-]{11})/)?.[1];
    if (!id) return null;

    return (
        <div className="sm:px-8">
            <AnimWrapper anim={data._anim}>
                <div className="aspect-video">
                    <iframe
                        className="w-full h-full rounded-xl"
                        src={`https://www.youtube.com/embed/${id}`}
                        title="YouTube video"
                        allowFullScreen
                    />
                </div>
            </AnimWrapper>
        </div>
    );
}
