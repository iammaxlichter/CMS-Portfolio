"use client";

import AnimOnView from "@/components/ui/AnimOnView";
import type { AnimationSettings } from "@/lib/blocks";

export const animClassMap = {
    slideInLeft: "anim-slideInLeft",
    slideInRight: "anim-slideInRight",
    slideInTop: "anim-slideInTop",
    slideInBottom: "anim-slideInBottom",
    fadeIn: "anim-fadeIn",
} as const;

export function AnimWrapper({
    anim,
    className = "",
    children,
}: {
    anim?: AnimationSettings;
    className?: string;
    children: React.ReactNode;
}) {
    if (!anim?.type) return <>{children}</>;
    const dur = anim.durationMs ?? 600;
    const delay = anim.delayMs ?? 0;
    return (
        <AnimOnView
            durationMs={dur}
            delayMs={delay}
            once
            className={`anim-base ${animClassMap[anim.type]} ${className}`}
        >
            {children}
        </AnimOnView>
    );
}
