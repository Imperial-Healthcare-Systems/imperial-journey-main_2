"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero background is one pre-rendered film:
 * deep space → Earth → Guyana → clouds → rainforest → eagles → the falls →
 * the river → the sea → (fade) → space again.
 * Both halves are 3D, rendered offline from ./intro/spaceScene.ts and
 * ./intro/groundScene.ts via the dev-only /intro-render page.
 *
 * Until the film reaches the falls the page stays put and scrolling drives
 * the film instead. The film plays by itself; the first scroll brings it to a
 * stop, and from then on each scroll pushes it forward (or back). It is always
 * really *played* — speeding up and slowing down smoothly, never jumping
 * between frames — so it reads as a film, not a slideshow.
 * At the falls the copy and site chrome appear, the page scrolls normally and
 * the film loops on its own.
 */
const FILM_SRC = "/intro/intro.mp4";
const FILM_POSTER = "/intro/intro-start.jpg";
/** Film time (s) at which the falls are framed on the right and the content appears. */
const REVEAL_AT = 61;
/** Pixels of scrolling that move the film on by one second. */
const SCROLL_PX_PER_SECOND = 90;
/** How far (s) the film may be pushed ahead of where it is now. */
const MAX_LEAD = 2.5;
/** Fastest the film plays while following the scroll (above this frames get dropped). */
const MAX_RATE = 3;
/** How quickly the playback speed eases toward the wanted speed each frame (0–1). */
const RATE_EASE = 0.12;
/** This many clicks within RAGE_WINDOW ms set the film playing on its own again. */
const RAGE_CLICKS = 3;
const RAGE_WINDOW = 2500;
/** Film speed when it plays on its own (1 = real time). */
const AUTO_SPEED = 1;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

export default function FallsHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(true);
  const finishRef = useRef<(jumpToFalls?: boolean) => void>(() => {});

  const skip = () => finishRef.current(true);

  useEffect(() => {
    const v = videoRef.current!;
    const html = document.documentElement;

    // Hold every other video on the page during the intro, so nothing
    // competes with the film for bandwidth or the decoder.
    const holdVideo = (e: Event) => {
      const t = e.target as HTMLVideoElement;
      if (t.tagName === "VIDEO" && t !== v) t.pause();
    };
    html.setAttribute("data-intro", "playing");
    document.addEventListener("play", holdVideo, true);

    // A refresh always starts the journey from the beginning: don't let the
    // browser restore the old scroll position (or a #section in the URL)
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: "instant" });
    v.currentTime = 0;

    // The page itself doesn't move until the journey is over
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    let frame = 0;
    let finished = false;
    let auto = true; // playing by itself
    let target = 0; // where the visitor's scrolling wants the film to be
    let rate = AUTO_SPEED; // current (eased) playback speed
    let lastPct = -1;

    const finish = (jumpToFalls = false) => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      if (jumpToFalls && v.currentTime < REVEAL_AT) v.currentTime = REVEAL_AT;
      v.playbackRate = 1;
      v.play().catch(() => {});
      html.style.overflow = prevOverflow;
      html.removeAttribute("data-intro");
      document.removeEventListener("play", holdVideo, true);
      setAutoPlaying(false);
      setDone(true);
    };
    finishRef.current = finish;

    // If the browser refuses to play the film at all (e.g. iOS Low Power Mode),
    // don't leave the visitor locked on a still frame: open the site
    const play = () => {
      v.play().catch((err: DOMException) => {
        if (err.name === "NotAllowedError") finish(true);
      });
    };

    const setRate = (r: number) => {
      // Chrome's lowest supported rate is 1/16
      const safe = Math.max(r, 0.0625);
      if (Math.abs(v.playbackRate - safe) > 0.01) v.playbackRate = safe;
      if (v.paused) play();
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = v.currentTime;

      const pct = Math.round((Math.min(t, REVEAL_AT) / REVEAL_AT) * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        setProgress(pct);
      }
      if (t >= REVEAL_AT - 0.05) {
        finish();
        return;
      }

      if (auto) {
        rate += (AUTO_SPEED - rate) * RATE_EASE;
        setRate(rate);
        return;
      }

      const diff = target - t;
      if (diff < -0.3) {
        // Backward: a film can't be played in reverse, so step back by seeking
        rate = 0;
        if (!v.paused) v.pause();
        if (!v.seeking) v.currentTime = Math.max(target, t + diff * 0.3);
        return;
      }
      // Forward: speed up while there is film to cover, ease to a stop at the end
      const wanted = diff > 0.02 ? clamp(0.3 + diff * 1.2, 0, MAX_RATE) : 0;
      rate += (wanted - rate) * RATE_EASE;
      if (wanted === 0 && rate < 0.08) {
        rate = 0;
        if (!v.paused) v.pause();
      } else {
        setRate(rate);
      }
    };
    // Visitors who asked for reduced motion go straight to the falls
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish(true);
    else {
      frame = requestAnimationFrame(tick);
      play();
    }

    // Scrolling during the intro moves the film, not the page
    const push = (px: number) => {
      if (finished) return;
      if (auto) {
        // First scroll: stop the film right here; from now on it follows the scroll
        auto = false;
        target = v.currentTime;
        setAutoPlaying(false);
      }
      const t = v.currentTime;
      target = clamp(target + px / SCROLL_PX_PER_SECOND, t - MAX_LEAD, t + MAX_LEAD);
      target = clamp(target, 0, REVEAL_AT);
    };

    const onWheel = (e: WheelEvent) => {
      if (finished) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
      push(e.deltaY * unit);
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (finished) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      push((touchY - y) * 1.5);
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (finished || (e.target as HTMLElement).closest?.("input, textarea, select")) return;
      const step = { ArrowDown: 100, ArrowUp: -100, PageDown: 400, PageUp: -400, " ": e.shiftKey ? -400 : 400 }[e.key];
      if (step === undefined) return;
      e.preventDefault();
      push(step);
    };

    // Rage clicks: the visitor is stuck or impatient, so let the film carry on by itself
    let clicks: number[] = [];
    const onClick = () => {
      if (finished) return;
      const now = performance.now();
      clicks = clicks.filter((t) => now - t < RAGE_WINDOW);
      clicks.push(now);
      if (clicks.length >= RAGE_CLICKS) {
        clicks = [];
        auto = true;
        setAutoPlaying(true);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    const onError = () => finish();
    v.addEventListener("error", onError);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
      v.removeEventListener("error", onError);
      html.style.overflow = prevOverflow;
      html.removeAttribute("data-intro");
      document.removeEventListener("play", holdVideo, true);
    };
  }, []);

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
        preload="auto"
        aria-label="A journey from deep space to a rainforest waterfall, its river and the sea"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* darken the left so the copy sits beside the falls */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          opacity: done ? 1 : 0,
          transition: "opacity 1.2s ease",
          background:
            "linear-gradient(90deg, rgba(5,10,12,0.82) 0%, rgba(5,10,12,0.55) 38%, rgba(5,10,12,0.05) 70%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div
        className={`wrap relative z-[2] h-full flex flex-col justify-center items-start text-left max-[720px]:pt-[170px] max-[720px]:pb-[110px] ${
          done ? "ij-hero-in" : "opacity-0 pointer-events-none"
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

      {done ? (
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
        <>
          {/* scroll prompt while the journey is still ahead */}
          <div
            className="absolute bottom-[34px] left-1/2 -translate-x-1/2 z-[3] text-center text-[10px] uppercase text-white/75 pointer-events-none"
            style={{ letterSpacing: "0.3em" }}
          >
            {autoPlaying ? "Scroll to travel at your own pace" : "Keep scrolling"}
            <span
              className="block w-px h-9 mx-auto mt-3 animate-drop"
              style={{ background: "linear-gradient(to bottom, #e8d6a8, transparent)" }}
            />
          </div>

          {/* journey progress */}
          <div className="absolute left-0 right-0 bottom-0 h-[2px] z-[3] bg-white/10">
            <div className="h-full bg-accent origin-left" style={{ transform: `scaleX(${progress / 100})` }} />
          </div>

          <button
            onClick={skip}
            className="absolute right-6 bottom-6 z-[3] text-[10px] uppercase text-white/40 hover:text-white/90 px-4 py-2 transition-colors"
            style={{ letterSpacing: "0.3em" }}
          >
            Skip
          </button>
        </>
      )}
    </section>
  );
}
