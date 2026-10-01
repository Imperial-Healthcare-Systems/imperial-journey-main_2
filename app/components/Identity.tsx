"use client";

import { useEffect, useRef } from "react";
import { createLionPortal } from "./identity/lionPortal";

const FILM = "/identity/lion-approach.mp4"; // he walks from the dark right up to the viewer

// room above and below the section that the lion can step out into
const OUT = 420;

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * A lion walks out of the dark towards the visitor. As he closes in he grows bigger than the
 * section and his mane rises out past its top edge, with embers flying out at the viewer,
 * as if he is about to step out of the section.
 */
export default function Identity() {
  const sectionRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const video = videoRef.current!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const portal = createLionPortal(portalRef.current!, video);
    const glCanvas = portalRef.current!;
    const front = frontRef.current!;
    const fctx = front.getContext("2d")!;

    // embers that fly out of the screen towards the viewer
    type Spark = { a: number; r: number; v: number; s: number; seed: number };
    let sparks: Spark[] = [];
    let lastT = 0;
    // the moment he breaks out: a flash, a ring of light and a burst of embers
    let burstAt = -1e9,
      burst = false;
    const text = textRef.current!;
    const glow = glowRef.current!;

    let raf = 0,
      running = false;
    const frame = (now: number) => {
      if (portal) {
        const W = section.clientWidth,
          H = section.clientHeight;
        const narrow = W < 1100;
        // where he stands when far away: a tall area in the middle of the section
        const ph = H - (narrow ? 120 : 130);
        const pw = Math.min(narrow ? W * 0.62 : 300, ph * 0.6);
        const px = (W - pw) / 2,
          py = OUT + (H - ph) / 2;
        const D = video.duration || 7.4,
          t = video.currentTime;
        // loop by hand: a hidden video can stall on its last frame instead of looping
        if (!reduced && video.duration && (video.ended || t >= D - 0.06)) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
        const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000));
        lastT = now;
        // how close he is: 0 far away, 1 nose to the glass
        const near = reduced ? 0 : smooth((t - 2.8) / (D - 3.4));
        // he grows towards the camera until he is bigger than the section itself
        let fh = ph * (1.15 + 1.55 * near * near);
        if (narrow) fh = Math.min(fh, (W * 1.05) / (9 / 16)); // on phones he never gets wider than the screen
        const fw = fh * (9 / 16);
        const fx = (W - fw) / 2;
        const fyFar = py + ph - fh * 0.93; // paws on the floor
        const fyNear = OUT + H * 0.62 - fh * 0.42; // face in the middle of the section
        const fy = fyFar + (fyNear - fyFar) * near;
        const fade = smooth(t / 0.5) * (1 - smooth((t - (D - 0.6)) / 0.55));
        const rect: [number, number, number, number] = [px, py, pw, ph];
        const band: [number, number] = [OUT, OUT + H];
        const film: [number, number, number, number] = [fx, fy, fw, fh];

        // he breaks out past the section's top edge once he is close
        const out = smooth((near - 0.45) / 0.35);
        portal.draw(rect, film, reduced ? 1 : fade, band, out);

        // the text steps aside while he comes out, and returns when he starts again far away
        const hide = reduced
          ? 0
          : smooth((near - 0.25) / 0.25) * smooth((t - 0.3) / 0.3);
        text.style.opacity = (1 - hide).toFixed(3);
        text.style.transform =
          hide > 0.001 ? `scale(${(1 - hide * 0.04).toFixed(4)})` : "";
        text.style.filter =
          hide > 0.001 ? `blur(${(hide * 6).toFixed(2)}px)` : "";
        // firelight behind him grows as he approaches
        glow.style.opacity = ((0.25 + 0.75 * near) * fade).toFixed(3);
        glow.style.transform = `translateX(-50%) scale(${(0.8 + 0.5 * near).toFixed(3)})`;

        if (t < 1) burst = false;
        if (!reduced && !burst && out > 0.05) {
          burst = true;
          burstAt = now;
          for (let i = 0; i < 90; i++) {
            sparks.push({
              a: Math.random() * Math.PI * 2,
              r: 30 + Math.random() * 40,
              v: 250 + Math.random() * 450,
              s: 0.8 + Math.random() * 1.6,
              seed: Math.random() * 9,
            });
          }
        }
        const since = (now - burstAt) / 1000;

        if (
          front.width !== glCanvas.width ||
          front.height !== glCanvas.height
        ) {
          front.width = glCanvas.width;
          front.height = glCanvas.height;
        }
        const sx = front.width / W;
        fctx.setTransform(1, 0, 0, 1, 0, 0);
        fctx.clearRect(0, 0, front.width, front.height);
        fctx.setTransform(sx, 0, 0, sx, 0, 0);

        // flash and an expanding ring of light as he breaks out
        if (burst && since < 1.4) {
          const cx = W / 2,
            cy = OUT + H * 0.48;
          fctx.globalCompositeOperation = "lighter";
          const f = Math.exp(-since / 0.18);
          const fl = fctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.9);
          fl.addColorStop(0, `rgba(255,220,160,${0.45 * f})`);
          fl.addColorStop(0.4, `rgba(255,140,40,${0.25 * f})`);
          fl.addColorStop(1, "rgba(255,90,10,0)");
          fctx.fillStyle = fl;
          fctx.fillRect(0, OUT, W, H);
          const k = since / 1.4;
          const R = 60 + k * W * 0.55;
          fctx.lineWidth = 2 + 10 * (1 - k);
          fctx.shadowColor = "rgba(255,150,50,0.9)";
          fctx.shadowBlur = 24;
          fctx.strokeStyle = `rgba(255,190,110,${0.35 * (1 - k) * (1 - k)})`;
          fctx.save();
          fctx.beginPath();
          fctx.rect(0, OUT, W, H);
          fctx.clip();
          fctx.beginPath();
          fctx.ellipse(cx, cy, R, R * 0.55, 0, 0, Math.PI * 2);
          fctx.stroke();
          fctx.shadowBlur = 0;
          fctx.restore();
          fctx.globalCompositeOperation = "source-over";
        }

        // embers
        if (!reduced) {
          const cx = W / 2,
            cy = OUT + H * 0.55;
          let n = (6 + 50 * near) * fade * dt;
          while (n > 0) {
            if (Math.random() < n) {
              sparks.push({
                a: Math.random() * Math.PI * 2,
                r: 10 + Math.random() * 60,
                v: 60 + Math.random() * 160,
                s: 0.6 + Math.random() * 1.2,
                seed: Math.random() * 9,
              });
            }
            n -= 1;
          }
          fctx.globalCompositeOperation = "lighter";
          sparks = sparks.filter((p) => {
            p.v *= 1 + dt * 1.6; // speeding up as they come at you
            p.r += p.v * dt;
            const x = cx + Math.cos(p.a) * p.r,
              y = cy + Math.sin(p.a) * p.r * 0.7;
            if (x < -40 || x > W + 40 || y < OUT + 8 || y > OUT + H - 8)
              return false;
            const size = Math.min(7, p.s * (1 + p.r / 160));
            const a =
              Math.min(1, (p.r + 20) / 120) *
              (0.6 + 0.4 * Math.sin(now / 70 + p.seed * 5));
            const g = fctx.createRadialGradient(x, y, 0, x, y, size * 2);
            g.addColorStop(0, `rgba(255,225,160,${a})`);
            g.addColorStop(0.25, `rgba(255,150,50,${a * 0.7})`);
            g.addColorStop(1, "rgba(255,80,0,0)");
            fctx.fillStyle = g;
            fctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);
            return true;
          });
          fctx.globalCompositeOperation = "source-over";
        }
        fctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      if (running) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!video.src) video.src = FILM;
          if (reduced) {
            video.addEventListener("loadeddata", () => frame(0), {
              once: true,
            });
          } else {
            video.play().catch(() => {});
            start();
          }
        } else {
          video.pause();
          stop();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);

    return () => {
      stop();
      io.disconnect();
      portal?.dispose();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-[5] py-[160px] text-center text-white min-[1100px]:h-[612px] min-[1100px]:py-0 min-[1100px]:flex min-[1100px]:flex-col min-[1100px]:justify-center"
      style={{ background: "#0a0705" }}
    >
      {/* firelight behind the lion, kept inside the section */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      >
        <div
          ref={glowRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 w-[900px] h-[700px] -mt-[350px] rounded-full pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,120,30,0.32) 0%, rgba(255,80,15,0.12) 40%, transparent 70%)",
            opacity: 0,
            transform: "translateX(-50%)",
          }}
        />
      </div>
      <canvas
        ref={portalRef}
        aria-hidden="true"
        className="absolute left-0 w-full -top-[420px] h-[calc(100%+840px)] z-[1] pointer-events-none"
      />
      {/* embers */}
      <canvas
        ref={frontRef}
        aria-hidden="true"
        className="absolute left-0 w-full -top-[420px] h-[calc(100%+840px)] z-[2] pointer-events-none"
      />
      {/* the film is only a texture source for the canvases */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute w-px h-px opacity-0 pointer-events-none"
      />

      <div
        ref={textRef}
        className="wrap relative z-[6] w-full transition-none"
        style={{
          textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        <h2
          className="font-serif text-white font-medium max-w-[880px] mx-auto mb-12"
          style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)" }}
        >
          We craft journeys that{" "}
          <span className="italic text-accent-soft">
            tell people who you are.
          </span>
        </h2>
        {/* the two paragraphs flank the lion on wide screens */}
        <div className="grid grid-cols-2 gap-20 max-w-[980px] mx-auto text-left min-[1100px]:max-w-[1216px] min-[1100px]:grid-cols-[1fr_400px_1fr] min-[1100px]:gap-0 max-[720px]:grid-cols-1 max-[720px]:gap-[30px]">
          <p className="text-white/85 font-light text-base leading-[1.85] min-[1100px]:text-right">
            Imperial Journeys is a travel brand of Imperial Healthcare Systems
            Pvt Ltd, with operations across India and the United States. We
            bring a decade of operational discipline to a craft that usually
            runs on charm.
          </p>
          <span aria-hidden="true" className="hidden min-[1100px]:block" />
          <p className="text-white/85 font-light text-base leading-[1.85]">
            We design successful, memorable trips from the first conversation
            through the last airport farewell — the kind of travel where every
            detail has been handled before you knew it needed to be.
          </p>
        </div>
      </div>
    </section>
  );
}
