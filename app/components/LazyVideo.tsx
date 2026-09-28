"use client";

import { useEffect, useRef } from "react";

/**
 * Muted looping background video that downloads nothing until it is about to
 * scroll into view, and pauses again when it leaves.
 */
export default function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else if (v.src) {
          v.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback"
      className={className}
    />
  );
}
