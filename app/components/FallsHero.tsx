"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero background is one pre-rendered 1080p film that loops:
 * deep space → Earth → Guyana → clouds → rainforest → eagles → the falls →
 * the river → the sea → (fade) → space again.
 * Both halves are 3D, rendered offline from ./intro/spaceScene.ts and
 * ./intro/groundScene.ts via the dev-only /intro-render page.
 *
 * On first play the site chrome stays hidden; it fades in once the camera
 * reaches the falls, and the film keeps playing behind the content.
 */
const FILM_SRC = "/intro/intro.mp4";
const FILM_POSTER = "/intro/intro-poster.jpg";
/** Film time (s) at which the falls are framed on the right and the content appears. */
const REVEAL_AT = 72.3;

export default function FallsHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  // Hold every other video on the page during the first play, so nothing
  // competes with the film for bandwidth or the decoder.
  const holdVideo = useRef((e: Event) => {
    const v = e.target as HTMLVideoElement;
    if (v.tagName === "VIDEO" && v !== videoRef.current) v.pause();
  }).current;

  const reveal = () => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    document.documentElement.removeAttribute("data-intro");
    document.removeEventListener("play", holdVideo, true);
  };

  const skip = () => {
    const v = videoRef.current;
    if (v && v.currentTime < REVEAL_AT) v.currentTime = REVEAL_AT;
    reveal();
  };

  useEffect(() => {
    const v = videoRef.current!;
    const html = document.documentElement;
    html.setAttribute("data-intro", "playing");
    document.addEventListener("play", holdVideo, true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.currentTime = REVEAL_AT;
      reveal();
    }

    const onTime = () => {
      if (!revealedRef.current && v.currentTime >= REVEAL_AT) reveal();
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("error", reveal);
    v.play().catch(() => reveal());
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("error", reveal);
      html.removeAttribute("data-intro");
      document.removeEventListener("play", holdVideo, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No scrolling until the journey has arrived
  useEffect(() => {
    if (revealed) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [revealed]);

  return (
    <section
      id="intro-section"
      className="relative h-screen min-h-[620px] overflow-hidden bg-black max-[720px]:min-h-[100svh]"
    >
      <video
        ref={videoRef}
        src={FILM_SRC}
        poster={FILM_POSTER}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-label="A journey from deep space to a rainforest waterfall, its river and the sea"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* darken the left so the copy sits beside the falls */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          opacity: revealed ? 1 : 0,
          transition: "opacity 2s ease",
          background:
            "linear-gradient(90deg, rgba(5,10,12,0.82) 0%, rgba(5,10,12,0.55) 38%, rgba(5,10,12,0.05) 70%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div
        className={`wrap relative z-[2] h-full flex flex-col justify-center items-start text-left max-[720px]:pt-[170px] max-[720px]:pb-[110px] ${
          revealed ? "ij-hero-in" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="flex items-center gap-[18px] mb-[26px] text-[12px] font-medium uppercase text-accent-soft"
          style={{ letterSpacing: "0.5em" }}
        >
          <span className="w-[50px] h-px bg-accent-soft opacity-60" />
          Imperial Journeys
        </div>

        <h1
          className="font-sans font-semibold text-white mb-8 max-w-[720px]"
          style={{
            fontSize: "clamp(2.8rem, 6.5vw, 6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            textShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        >
          The world,
          <br />
          <span className="font-serif italic font-medium text-accent-soft">beautifully curated.</span>
        </h1>

        <p className="text-[1.1rem] text-white/90 max-w-[540px] mb-11 font-light leading-[1.7]">
          From the silence of a Himalayan dawn to the roar of an Amazonian waterfall — we craft the
          journeys you&apos;ll spend a lifetime telling stories about.
        </p>

        <div className="flex gap-4 flex-wrap">
          <a href="#wonders-section" className="btn btn-primary">
            Discover Wonders <span className="arrow">→</span>
          </a>
          <a href="#contact-section" className="btn btn-outline">
            Plan Your Journey
          </a>
        </div>
      </div>

      {revealed ? (
        <div
          className="absolute bottom-[30px] left-1/2 -translate-x-1/2 text-[10px] uppercase text-white/65 z-[3] max-[720px]:hidden"
          style={{ letterSpacing: "0.3em" }}
        >
          Scroll to Explore
          <span
            className="block w-px h-9 mx-auto mt-3 animate-drop"
            style={{ background: "linear-gradient(to bottom, #e8d6a8, transparent)" }}
          />
        </div>
      ) : (
        <button
          onClick={skip}
          className="absolute right-6 bottom-6 z-[3] text-[10px] uppercase text-white/40 hover:text-white/90 px-4 py-2 transition-colors"
          style={{ letterSpacing: "0.3em" }}
        >
          Skip
        </button>
      )}
    </section>
  );
}
