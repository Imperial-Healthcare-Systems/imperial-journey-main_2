"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { target: number; suffix: string; label: string };

const STATS: Stat[] = [
  { target: 48, suffix: "+", label: "Destinations" },
  { target: 1200, suffix: "+", label: "Happy Travellers" },
  { target: 320, suffix: "+", label: "Curated Stays" },
  { target: 98, suffix: "%", label: "Would Recommend" },
];

function Counter({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered.current) {
            triggered.current = true;
            const dur = 1800;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.floor(target * eased));
              if (t < 1) requestAnimationFrame(tick);
              else setValue(target);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export default function Stats() {
  return (
    <section
      className="bg-ink py-20"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="wrap">
        <div className="grid grid-cols-4 gap-10 text-center max-[720px]:grid-cols-2 max-[720px]:gap-y-[50px]">
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                className="font-serif font-medium text-accent-soft mb-3"
                style={{
                  fontSize: "4rem",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                <Counter target={s.target} />
                <span className="text-accent italic">{s.suffix}</span>
              </div>
              <div
                className="text-[11px] uppercase text-white/60 font-medium"
                style={{ letterSpacing: "0.3em" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
