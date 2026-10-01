"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Contact section entrance. The film tells the story: a parrot flies in from across the bay
 * carrying a page, throws it at the viewer and it opens. On top of it we add a sparkle as he
 * lets go, a golden trail and paper flecks behind the flying page, a few feathers, and at the
 * moment the page fills the screen the film dissolves into the real contact section, whose
 * content settles into place. Plays once per visit; it can be skipped.
 */

const FILM = "/contact/parrot.mp4";
const POSTER = "/contact/parrot-poster.jpg";
const THROW = 5.62; // he flings the page
const HANDOFF = 6.45; // the page fills the screen: hand over to the real section
const DISSOLVE = 0.75;

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  s: number;
  kind: 0 | 1 | 2;
  rot: number;
  vr: number;
  hue: number;
};

function ParrotFilm({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const layer = layerRef.current!;
    const section = layer.parentElement!;
    const video = videoRef.current!;
    const fx = fxRef.current!;
    const fctx = fx.getContext("2d")!;
    const flash = flashRef.current!;
    const bars = barsRef.current!;
    const frame = frameRef.current!;
    const vignette = vignetteRef.current!;
    const flare = flareRef.current!;
    const caption = captionRef.current!;
    // ambient golden motes drifting in the sunlight
    const dust = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.6 + Math.random() * 1.6,
      sp: 0.2 + Math.random() * 0.6,
      ph: Math.random() * 6.28,
    }));
    const skipBtn = skipRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDoneRef.current();
      return;
    }

    const lite = window.innerWidth < 900;
    if (lite) {
      // phones: the film fills the first screen of the (tall) section
      // phones: the whole film layer (vignette, skip button, effects) covers just the first screen
      layer.style.bottom = "auto";
      layer.style.height = `${Math.min(section.clientHeight, Math.round(window.innerHeight * 0.85))}px`;
    }
    section.setAttribute("data-parrot", "cover");

    let motes: Mote[] = [];
    let raf = 0,
      started = false,
      done = false,
      last = 0,
      thrown = false,
      handoff = -1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      video.pause();
      section.setAttribute("data-parrot", "open");
      onDoneRef.current();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const W = section.clientWidth,
        H = layer.clientHeight;
      const FH = video.clientHeight || H; // where the film is shown
      const t = video.currentTime;

      // the release: a sparkle burst where his feet let go of the page
      if (!thrown && t >= THROW) {
        thrown = true;
        const x = W * 0.5,
          y = FH * 0.62;
        for (let i = 0; i < (lite ? 16 : 34); i++) {
          const a = Math.random() * Math.PI * 2,
            v = 80 + Math.random() * 260;
          motes.push({
            x,
            y,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            life: 0.5 + Math.random() * 0.6,
            age: 0,
            s: 1 + Math.random() * 2.2,
            kind: 0,
            rot: 0,
            vr: 0,
            hue: 0,
          });
        }
        for (let i = 0; i < (lite ? 4 : 8); i++)
          motes.push({
            x: W * (0.3 + Math.random() * 0.4),
            y: FH * (0.3 + Math.random() * 0.3),
            vx: (Math.random() - 0.5) * 80,
            vy: -40 - Math.random() * 60,
            life: 2.4,
            age: 0,
            s: 9 + Math.random() * 8,
            kind: 2,
            rot: Math.random() * 6,
            vr: (Math.random() - 0.5) * 2,
            hue: 100 + Math.random() * 20,
          });
        skipBtn.style.opacity = "0";
      }
      // the page in flight: a golden trail and paper flecks streaming past
      if (thrown && t < HANDOFF) {
        const k = clamp01((t - THROW) / (HANDOFF - THROW));
        const cx = W * (0.5 + 0.08 * k),
          cy = FH * (0.6 - 0.12 * k);
        const spread = W * (0.08 + 0.35 * k);
        for (let i = 0; i < (lite ? 2 : 5); i++)
          motes.push({
            x: cx + (Math.random() - 0.5) * spread,
            y: cy + (Math.random() - 0.5) * spread * 0.6,
            vx: (Math.random() - 0.5) * 140 * (1 + k),
            vy: (Math.random() - 0.5) * 100,
            life: 0.6 + Math.random() * 0.5,
            age: 0,
            s: 0.8 + Math.random() * 1.8 + k * 1.5,
            kind: 0,
            rot: 0,
            vr: 0,
            hue: 0,
          });
        if (Math.random() < (lite ? 0.2 : 0.5))
          motes.push({
            x: cx + (Math.random() - 0.5) * spread,
            y: cy + (Math.random() - 0.5) * spread * 0.5,
            vx: (Math.random() - 0.5) * 300,
            vy: -60 + Math.random() * 160,
            life: 1.3,
            age: 0,
            s: 3 + Math.random() * 5 + k * 4,
            kind: 1,
            rot: Math.random() * 6,
            vr: (Math.random() - 0.5) * 9,
            hue: 0,
          });
      }

      // bars and caption frame the part of the film you can actually see
      const visible = Math.max(
        200,
        Math.min(
          FH,
          window.innerHeight - Math.max(0, section.getBoundingClientRect().top),
        ),
      );
      frame.style.height = `${visible}px`;
      if (handoff < 0) {
        // slow motion for the throw itself
        video.playbackRate = t > THROW - 0.25 && t < THROW + 0.55 ? 0.55 : 1;
        // slow camera push-in and a warm cinematic grade
        video.style.transform = `scale(${(1.02 + 0.06 * clamp01(t / HANDOFF)).toFixed(4)})`;
        video.style.filter = "contrast(1.06) saturate(1.08) sepia(0.08)";
        // the film rises softly out of darkness at the start
        bars.style.opacity = (1 - smooth((t - 0.1) / 1.1)).toFixed(3);
        // a slow lens flare from the sun
        flare.style.opacity = (0.55 + 0.25 * Math.sin(now / 900)).toFixed(3);
        flare.style.transform = `translate(${(-40 * clamp01(t / HANDOFF)).toFixed(1)}px, ${(12 * clamp01(t / HANDOFF)).toFixed(1)}px)`;
        // caption in, then out before the throw
        const c = smooth((t - 0.9) / 0.8) * (1 - smooth((t - 4.4) / 0.6));
        caption.style.opacity = c.toFixed(3);
        caption.style.transform = `translateY(${((1 - c) * 14).toFixed(1)}px)`;
      }

      // hand-over: the page opens from the centre into the real section
      if (handoff < 0 && (t >= HANDOFF || video.ended)) {
        handoff = now;
        section.setAttribute("data-parrot", "open");
        layer.style.pointerEvents = "none";
      }
      const since = handoff >= 0 ? (now - handoff) / 1000 : 0;
      if (handoff >= 0) {
        const k = smooth(since / DISSOLVE);
        // an iris opens from the centre, edged with golden light
        const r = k * 85;
        const iris = `radial-gradient(circle at 50% 50%, transparent ${r.toFixed(1)}%, #000 ${(r + 14).toFixed(1)}%)`;
        video.style.maskImage = iris;
        video.style.webkitMaskImage = iris;
        video.style.opacity = (
          1 - smooth((since - DISSOLVE * 0.6) / (DISSOLVE * 0.6))
        ).toFixed(3);
        video.style.filter = `blur(${(k * 4).toFixed(2)}px) brightness(${(1 + k * 0.15).toFixed(3)})`;
        flash.style.setProperty("--r", `${(r + 7).toFixed(1)}%`);
        flash.style.opacity = (
          Math.sin(Math.PI * clamp01(since / DISSOLVE)) * 0.9
        ).toFixed(3);
        vignette.style.opacity = (1 - k).toFixed(3);
        flare.style.opacity = (0.55 * (1 - k)).toFixed(3);
        caption.style.opacity = "0";
      }

      if (
        fx.width !== Math.round(W * dpr) ||
        fx.height !== Math.round(H * dpr)
      ) {
        fx.width = Math.round(W * dpr);
        fx.height = Math.round(H * dpr);
      }
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.clearRect(0, 0, W, H);
      if (handoff < 0) {
        fctx.globalCompositeOperation = "lighter";
        for (const d of dust) {
          const x = (d.x + Math.sin((now / 4000) * d.sp + d.ph) * 0.03) * W;
          const y = ((((d.y - (now / 30000) * d.sp) % 1) + 1) % 1) * FH;
          const a = 0.25 + 0.25 * Math.sin((now / 600) * d.sp + d.ph);
          const g = fctx.createRadialGradient(x, y, 0, x, y, d.s * 3);
          g.addColorStop(0, `rgba(255,236,190,${a})`);
          g.addColorStop(1, "rgba(255,220,150,0)");
          fctx.fillStyle = g;
          fctx.fillRect(x - d.s * 3, y - d.s * 3, d.s * 6, d.s * 6);
        }
        fctx.globalCompositeOperation = "source-over";
      }
      motes = motes.filter((m) => {
        m.age += dt;
        if (m.age > m.life) return false;
        const a = 1 - m.age / m.life;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rot += m.vr * dt;
        if (m.kind === 0) {
          m.vx *= 1 - dt * 2;
          m.vy *= 1 - dt * 2;
          fctx.globalCompositeOperation = "lighter";
          const g = fctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.s * 3);
          g.addColorStop(0, `rgba(255,238,190,${0.95 * a})`);
          g.addColorStop(0.35, `rgba(214,174,92,${0.6 * a})`);
          g.addColorStop(1, "rgba(200,164,90,0)");
          fctx.fillStyle = g;
          fctx.fillRect(m.x - m.s * 3, m.y - m.s * 3, m.s * 6, m.s * 6);
          fctx.globalCompositeOperation = "source-over";
          return true;
        }
        m.vy = Math.min(m.vy + 70 * dt, 55);
        m.x += Math.sin(m.age * 3 + m.rot) * 22 * dt;
        fctx.save();
        fctx.translate(m.x, m.y);
        fctx.rotate(m.rot);
        fctx.globalAlpha = Math.min(1, m.age * 5) * a;
        if (m.kind === 1) {
          // a fleck of paper
          fctx.fillStyle = "#fbf7ee";
          fctx.strokeStyle = "rgba(150,120,70,0.3)";
          fctx.lineWidth = 0.6;
          fctx.beginPath();
          fctx.moveTo(-m.s, -m.s * 0.6);
          fctx.lineTo(m.s * 0.9, -m.s * 0.75);
          fctx.lineTo(m.s, m.s * 0.6);
          fctx.lineTo(-m.s * 0.8, m.s * 0.7);
          fctx.closePath();
          fctx.fill();
          fctx.stroke();
        } else {
          // a green feather
          const s = m.s;
          const gr = fctx.createLinearGradient(-s * 0.4, 0, s * 0.4, 0);
          gr.addColorStop(0, `hsl(${m.hue} 55% 28%)`);
          gr.addColorStop(0.5, `hsl(${m.hue + 6} 60% 46%)`);
          gr.addColorStop(1, `hsl(${m.hue} 50% 32%)`);
          fctx.fillStyle = gr;
          fctx.beginPath();
          fctx.moveTo(0, -s);
          fctx.bezierCurveTo(
            s * 0.42,
            -s * 0.6,
            s * 0.36,
            s * 0.45,
            0.6,
            s * 0.78,
          );
          fctx.bezierCurveTo(-s * 0.3, s * 0.4, -s * 0.44, -s * 0.55, 0, -s);
          fctx.fill();
          fctx.strokeStyle = "rgba(245,240,215,0.75)";
          fctx.lineWidth = 0.8;
          fctx.beginPath();
          fctx.moveTo(0, -s * 0.95);
          fctx.lineTo(0, s * 1.15);
          fctx.stroke();
        }
        fctx.restore();
        return true;
      });

      if (
        handoff >= 0 &&
        since > DISSOLVE + 0.3 &&
        (motes.length === 0 || since > 2.6)
      ) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const startPlay = () =>
      video.play().then(() => {
        last = 0;
        raf = requestAnimationFrame(tick);
      });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        io.disconnect();
        startPlay().catch((err: Error) => {
          // an interrupted load is not a refusal: try again once the film can play
          if (err.name === "AbortError")
            video.addEventListener("canplay", () => startPlay().catch(finish), {
              once: true,
            });
          else finish();
        });
      },
      { rootMargin: "-25% 0px -25% 0px" },
    );
    io.observe(section);
    const pre = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!started) {
            video.preload = "auto";
            video.load();
          }
          pre.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    pre.observe(section);

    const skip = () => {
      if (!thrown) video.currentTime = Math.max(video.currentTime, THROW - 0.5);
    };
    layer.addEventListener("click", skip);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      pre.disconnect();
      layer.removeEventListener("click", skip);
      section.removeAttribute("data-parrot");
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 z-20 cursor-pointer overflow-hidden"
    >
      <video
        ref={videoRef}
        src={FILM}
        poster={POSTER}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      />
      {/* fade in from darkness */}
      <div
        ref={barsRef}
        aria-hidden="true"
        className="absolute inset-0 bg-[#0b0a08] pointer-events-none"
      />
      {/* vignette */}
      <div
        ref={vignetteRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(10,8,4,0.45) 100%)",
        }}
      />
      {/* lens flare from the low sun */}
      <div
        ref={flareRef}
        aria-hidden="true"
        className="absolute right-[12%] top-[6%] w-[520px] h-[520px] pointer-events-none mix-blend-screen"
        style={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,226,170,0.55), rgba(255,190,110,0.12) 35%, transparent 65%)",
          }}
        />
        <div
          className="absolute left-[-60%] top-[55%] w-[60px] h-[60px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,214,150,0.35), transparent 70%)",
          }}
        />
        <div
          className="absolute left-[-120%] top-[95%] w-[26px] h-[26px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(200,220,255,0.35), transparent 70%)",
          }}
        />
      </div>
      {/* golden ring of light at the edge of the opening page */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background:
            "radial-gradient(circle at 50% 50%, transparent calc(var(--r, 0%) - 6%), rgba(255,236,190,0.9) var(--r, 0%), rgba(214,174,92,0.35) calc(var(--r, 0%) + 3%), transparent calc(var(--r, 0%) + 9%))",
        }}
      />
      <div
        ref={frameRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
      >
        {/* caption */}
        <div
          ref={captionRef}
          aria-hidden="true"
          className="absolute left-[6%] bottom-[12%] text-white pointer-events-none"
          style={{ opacity: 0, textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}
        >
          <div
            className="text-[11px] uppercase text-accent-soft font-semibold mb-2"
            style={{ letterSpacing: "0.4em" }}
          >
            Imperial Journeys
          </div>
          <div className="font-serif text-[clamp(1.4rem,2.6vw,2.4rem)] leading-tight">
            Your next journey{" "}
            <span className="italic text-accent-soft">has arrived.</span>
          </div>
        </div>
        {/* sparkle, golden trail, paper flecks, feathers */}
        <canvas
          ref={fxRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
      <button
        ref={skipRef}
        type="button"
        className="absolute right-6 bottom-6 px-4 py-2 rounded-full text-[10px] uppercase font-semibold text-white/90 bg-black/25 backdrop-blur-sm border border-white/30 transition-opacity duration-500 hover:bg-black/40"
        style={{ letterSpacing: "0.25em" }}
      >
        Skip
      </button>
    </div>
  );
}

/**
 * Plays the parrot film when the contact section comes into view, and again each time the
 * visitor scrolls away and comes back - unless they have started filling in the form.
 */
export default function ParrotReveal() {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (active) return;
    const section = anchorRef.current?.parentElement;
    if (!section) return;
    // re-arm once the section has completely left the screen
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) return;
      const typed = [
        ...section.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          "input, textarea",
        ),
      ].some((f) => f.type !== "hidden" && f.value.trim() !== "");
      if (typed) return;
      io.disconnect();
      section.setAttribute("data-parrot", "cover");
      setRun((r) => r + 1);
      setActive(true);
    });
    io.observe(section);
    return () => io.disconnect();
  }, [active]);

  return (
    <>
      <span ref={anchorRef} hidden />
      {active && <ParrotFilm key={run} onDone={() => setActive(false)} />}
    </>
  );
}
