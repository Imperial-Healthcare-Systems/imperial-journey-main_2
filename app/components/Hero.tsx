"use client";

import { useEffect, useRef, useState } from "react";

type Scene = { name: string; poster: string; src: string };

const SCENES: Scene[] = [
  {
    name: "Coastal Cliffs · Ireland",
    poster: "https://images.pexels.com/videos/1851190/free-video-1851190.jpg",
    src: "https://videos.pexels.com/video-files/1851190/1851190-uhd_3840_2160_25fps.mp4",
  },
  {
    name: "Mountains · Switzerland",
    poster:
      "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=2000",
    src: "https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4",
  },
  {
    name: "Aerial Wilderness",
    poster:
      "https://images.pexels.com/photos/2566826/pexels-photo-2566826.jpeg?auto=compress&cs=tinysrgb&w=2000",
    src: "https://videos.pexels.com/video-files/3018669/3018669-hd_1920_1080_24fps.mp4",
  },
  {
    name: "Waterfall · Iceland",
    poster:
      "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=2000",
    src: "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
  },
  {
    name: "Golden Dunes · Sahara",
    poster:
      "https://images.pexels.com/videos/8397876/pexels-photo-8397876.jpeg?auto=compress&cs=tinysrgb&w=2000",
    src: "https://videos.pexels.com/video-files/8397876/8397876-uhd_2560_1440_25fps.mp4",
  },
  {
    name: "Snow Peaks · Alpine",
    poster:
      "https://images.pexels.com/videos/14922466/beautiful-landscape-blue-sky-landscape-mountains-14922466.jpeg?auto=compress&cs=tinysrgb&w=2000",
    src: "https://videos.pexels.com/video-files/14922466/14922466-uhd_2560_1440_24fps.mp4",
  },
];

const SCENE_DURATION = 4500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;

    const preloadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const v = videoRefs.current[i];
        if (!v) return resolve();
        v.preload = "auto";
        try {
          v.load();
        } catch {}
        let timeout: ReturnType<typeof setTimeout>;
        const done = () => {
          v.removeEventListener("loadeddata", done);
          v.removeEventListener("error", done);
          clearTimeout(timeout);
          resolve();
        };
        v.addEventListener("loadeddata", done);
        v.addEventListener("error", done);
        timeout = setTimeout(done, 12000);
      });

    const startChain = async () => {
      await new Promise((r) => setTimeout(r, 1500));
      for (let i = 1; i < SCENES.length; i++) {
        if (cancelled) return;
        await preloadOne(i);
        await new Promise((r) => setTimeout(r, 800));
      }
    };

    if (document.readyState === "complete") {
      startChain();
    } else {
      const onLoad = () => startChain();
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.play().catch(() => {});
      } else {
        try {
          v.pause();
        } catch {}
      }
    });
  }, [index]);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, SCENE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="intro-section"
      className="relative h-screen min-h-[720px] overflow-hidden bg-ink max-[720px]:h-auto max-[720px]:pt-[160px] max-[720px]:pb-[100px] max-[720px]:min-h-[620px]"
    >
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {SCENES.map((s, i) => (
          <video
            key={s.src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "none"}
            poster={s.poster}
            autoPlay={i === 0}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url('${s.poster}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <source src={s.src} type="video/mp4" />
          </video>
        ))}
      </div>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div className="wrap relative z-[2] h-full flex flex-col justify-center items-center text-center">
        <div
          className="flex items-center gap-[18px] mb-[30px] text-[12px] font-medium uppercase text-accent-soft"
          style={{ letterSpacing: "0.5em" }}
        >
          <span className="w-[50px] h-px bg-accent-soft opacity-60" />
          Imperial Journeys
          <span className="w-[50px] h-px bg-accent-soft opacity-60" />
        </div>

        <h1
          className="font-sans font-semibold text-white mb-9 max-w-[1100px]"
          style={{
            fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            textShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        >
          The world,
          <br />
          <span className="font-serif italic font-medium text-accent-soft">
            beautifully curated.
          </span>
        </h1>

        <p className="text-[1.1rem] text-white/90 max-w-[620px] mx-auto mb-12 font-light leading-[1.7]">
          From the silence of a Himalayan dawn to the roar of an African
          savannah — we craft the journeys you&apos;ll spend a lifetime telling
          stories about.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <a href="#wonders-section" className="btn btn-primary">
            Discover Wonders <span className="arrow">→</span>
          </a>
          <a href="#contact-section" className="btn btn-outline">
            Plan Your Journey
          </a>
        </div>
      </div>

      <div
        className="absolute left-10 bottom-10 z-[3] flex items-center gap-3.5 text-white/85 text-[11px] uppercase font-medium max-[720px]:hidden"
        style={{ letterSpacing: "0.25em" }}
      >
        <span
          className="w-2 h-2 rounded-full bg-accent animate-pulseDot"
          style={{ boxShadow: "0 0 12px #c8a45a" }}
        />
        <span>{SCENES[index].name}</span>
      </div>

      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[3] max-[720px]:hidden">
        {SCENES.map((_, i) => (
          <button
            key={i}
            aria-label={`Scene ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full border-0 cursor-pointer transition-all duration-300 ${
              i === index
                ? "bg-accent-soft scale-[1.4]"
                : "bg-white/40 hover:bg-white/70"
            }`}
            style={
              i === index
                ? { boxShadow: "0 0 12px rgba(232,214,168,0.6)" }
                : undefined
            }
          />
        ))}
      </div>

      <div
        className="absolute bottom-[30px] left-1/2 -translate-x-1/2 text-[10px] uppercase text-white/65 z-[3] max-[720px]:hidden"
        style={{ letterSpacing: "0.3em" }}
      >
        Scroll to Explore
        <span
          className="block w-px h-9 mx-auto mt-3 animate-drop"
          style={{
            background: "linear-gradient(to bottom, #e8d6a8, transparent)",
          }}
        />
      </div>
    </section>
  );
}
