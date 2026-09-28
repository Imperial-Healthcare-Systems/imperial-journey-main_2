"use client";

import { useEffect, useRef } from "react";

type Moment = { src: string; poster: string; cap: string };

const MOMENTS: Moment[] = [
  {
    src: "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
    poster:
      "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cap: "Waterfall · Greenery",
  },
  {
    src: "https://videos.pexels.com/video-files/2169880/2169880-uhd_3840_2160_30fps.mp4",
    poster:
      "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cap: "Mountain Light",
  },
  {
    src: "https://videos.pexels.com/video-files/4205697/4205697-uhd_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cap: "Infinity Pool",
  },
  {
    src: "https://videos.pexels.com/video-files/3018669/3018669-uhd_3840_2160_24fps.mp4",
    poster:
      "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cap: "Boat at Sunrise",
  },
  {
    src: "https://videos.pexels.com/video-files/3214448/3214448-uhd_3840_2160_25fps.mp4",
    poster:
      "https://images.pexels.com/photos/1133505/pexels-photo-1133505.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cap: "Jungle Canopy",
  },
  {
    src: "https://videos.pexels.com/video-files/14922466/14922466-uhd_2560_1440_24fps.mp4",
    poster:
      "https://images.pexels.com/videos/14922466/beautiful-landscape-blue-sky-landscape-mountains-14922466.jpeg?auto=compress&cs=tinysrgb&w=1200",
    cap: "Snow on the Pines",
  },
];

export default function Moments() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = stripRef.current;
    if (!root) return;
    const tiles = root.querySelectorAll<HTMLDivElement>(".moment-tile");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const tile = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            let v = tile.querySelector("video");
            if (!v) {
              v = document.createElement("video");
              v.muted = true;
              v.loop = true;
              v.playsInline = true;
              v.preload = "auto";
              v.className =
                "absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000";
              const source = document.createElement("source");
              source.src = tile.dataset.src || "";
              source.type = "video/mp4";
              v.appendChild(source);
              v.addEventListener("loadeddata", () => {
                if (v) v.style.opacity = "1";
              });
              tile.insertBefore(v, tile.firstChild);
            }
            v.play().catch(() => {});
          } else {
            const v = tile.querySelector("video");
            if (v) v.pause();
          }
        });
      },
      { threshold: 0.3 },
    );

    tiles.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <section id="moments-section" className="bg-ink py-[110px] pb-[130px] overflow-hidden max-[720px]:py-[80px] max-[720px]:pb-[90px]">
      <div className="reveal text-center mb-[60px] px-8">
        <div className="eyebrow" style={{ color: "#c8a45a" }}>
          A Few Moments
        </div>
        <h2
          className="font-serif text-white font-medium italic"
          style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", margin: "16px 0 18px" }}
        >
          Pause, just for a second.
        </h2>
        <p className="text-white/65 max-w-[540px] mx-auto text-base">
          Greenery, water, light. The kind of moments that earn the price of a
          plane ticket.
        </p>
      </div>

      <div
        ref={stripRef}
        className="moments-strip flex gap-4 px-8 overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {MOMENTS.map((m) => (
          <div
            key={m.src}
            className="moment-tile relative overflow-hidden rounded bg-black flex-shrink-0 max-[720px]:!w-[280px] max-[720px]:!h-[380px]"
            style={{
              flex: "0 0 420px",
              height: 540,
              scrollSnapAlign: "start",
              backgroundImage: `url('${m.poster}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            data-src={m.src}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85), transparent 40%)",
              }}
            />
            <span
              className="absolute bottom-7 left-7 z-[2] text-white font-serif italic"
              style={{
                fontSize: "1.25rem",
                letterSpacing: "0.02em",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {m.cap}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
