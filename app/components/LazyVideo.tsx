"use client";

import { useEffect, useRef } from "react";

/**
 * Muted looping background video that downloads nothing until it is about to
 * scroll into view, and pauses again when it leaves.
 */
export default function LazyVideo({
  src,
  portraitSrc,
  poster,
  className,
}: {
  src: string;
  /** alternative cut used when the element is closer to square/portrait than to wide */
  portraitSrc?: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!v.src) v.src = portraitSrc && v.clientWidth < v.clientHeight * 1.6 ? portraitSrc : src;
          v.play().catch(() => {});
        } else if (v.src) {
          v.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, portraitSrc]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback"
      className={className}
    />
  );
}
