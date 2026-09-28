"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { WONDERS, type Wonder } from "../data/wonders";

export default function Wonders() {
  const [active, setActive] = useState<Wonder | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    if (overlayRef.current) overlayRef.current.scrollTop = 0;
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <section
        id="wonders-section"
        className="section-dark py-[130px] bg-ink text-white max-[600px]:py-[90px]"
      >
        <div className="wrap">
          <div className="reveal text-center mb-20">
            <div className="eyebrow">A Premium Edit of Planet Earth</div>
            <h2 className="my-4 mx-auto max-w-[820px]">
              Twelve{" "}
              <span className="font-serif italic font-medium text-accent-soft">
                wonders
              </span>{" "}
              we&apos;ll send you to.
            </h2>
            <p className="max-w-[640px] mx-auto text-base">
              Each tile is a real journey we plan. Click any to step inside —
              full itinerary, hero film, and a gallery of moments from the
              trip.
            </p>
          </div>

          <div
            className="reveal grid gap-4 grid-cols-4 max-[980px]:grid-cols-2 max-[540px]:grid-cols-1"
            style={{ gridAutoRows: "220px" }}
          >
            {WONDERS.map((w) => {
              const layoutCls = w.layout ? w.layout : "";
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActive(w)}
                  className={`wonder ${layoutCls} relative overflow-hidden bg-ink rounded cursor-pointer group p-0 border-0 text-left`}
                  style={{ transform: "translateZ(0)" }}
                >
                  <Image
                    src={w.image}
                    alt={w.title}
                    fill
                    sizes="(max-width: 540px) 100vw, (max-width: 980px) 50vw, 25vw"
                    className="object-cover transition-[transform,filter] duration-[800ms] group-hover:scale-[1.06]"
                    style={{ filter: "brightness(0.88)" }}
                  />

                  <span
                    className="absolute top-[22px] right-[22px] z-[3] text-[10px] uppercase bg-white/95 text-ink px-3 py-1.5 rounded-full font-semibold opacity-0 -translate-y-1.5 transition-all duration-[400ms] group-hover:opacity-100 group-hover:translate-y-0"
                    style={{ letterSpacing: "0.25em" }}
                  >
                    Explore →
                  </span>

                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] w-[70px] h-[70px] rounded-full grid place-items-center opacity-0 scale-[0.8] transition-all duration-[400ms] group-hover:opacity-100 group-hover:scale-100 pointer-events-none"
                    style={{ background: "rgba(200,164,90,0.95)" }}
                  >
                    <span
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "16px solid #fff",
                        borderTop: "10px solid transparent",
                        borderBottom: "10px solid transparent",
                        marginLeft: 4,
                      }}
                    />
                  </span>

                  <span
                    className="absolute inset-0 z-[2] transition-opacity duration-[400ms]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                    }}
                  />

                  <span className="absolute left-7 right-7 bottom-[26px] z-[3] text-white">
                    <span
                      className="flex items-center gap-2 text-[10px] uppercase text-accent-soft mb-2 font-medium"
                      style={{ letterSpacing: "0.3em" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-accent animate-pulseDot"
                        style={{ boxShadow: "0 0 8px #c8a45a" }}
                      />
                      {w.label}
                    </span>
                    <span
                      className={`block font-serif text-white font-medium leading-[1.2] ${
                        w.layout === "feature" ? "text-[2.4rem]" : "text-[1.6rem]"
                      }`}
                    >
                      {w.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {active && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActive(null);
          }}
        >
          <button
            aria-label="Close"
            onClick={() => setActive(null)}
            className="fixed top-6 right-7 w-[50px] h-[50px] grid place-items-center text-white text-[26px] rounded-full cursor-pointer z-[201] transition-all duration-300 hover:bg-accent hover:rotate-90 leading-none"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            ×
          </button>

          <div className="max-w-wrap mx-auto my-[50px] bg-paper rounded-lg overflow-hidden relative animate-modalIn max-[880px]:m-0 max-[880px]:rounded-none">
            <div className="relative h-[60vh] min-h-[460px] bg-ink overflow-hidden">
              <video
                ref={heroVideoRef}
                autoPlay
                muted
                loop
                playsInline
                poster={active.image}
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={active.heroVideo} type="video/mp4" />
              </video>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4))",
                }}
              />
              <div className="absolute bottom-12 left-[60px] right-[60px] z-[2] text-white max-[880px]:left-7 max-[880px]:right-7 max-[880px]:bottom-8">
                <div
                  className="text-[11px] uppercase text-accent-soft mb-3.5 font-medium"
                  style={{ letterSpacing: "0.35em" }}
                >
                  {active.label}
                </div>
                <h2
                  className="font-serif text-white font-medium mb-4 max-w-[800px]"
                  style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
                >
                  {active.title}
                </h2>
                <div className="text-white/85 text-[1.1rem] font-light max-w-[600px]">
                  {active.tagline}
                </div>
              </div>
            </div>

            <div
              className="grid gap-[60px] p-[70px_60px] max-[880px]:grid-cols-1 max-[880px]:gap-10 max-[880px]:p-[40px_28px]"
              style={{ gridTemplateColumns: "1.5fr 1fr" }}
            >
              <div>
                <h3 className="font-serif font-medium text-[1.8rem] mb-6 text-ink">
                  About this{" "}
                  <span className="italic text-accent">journey</span>
                </h3>
                <p className="mb-6 leading-[1.85] text-muted">{active.intro}</p>
                <p className="mb-6 leading-[1.85] text-muted">{active.body}</p>

                <div
                  className="my-9 px-[30px] py-7 bg-offwhite rounded"
                  style={{ borderLeft: "3px solid #c8a45a" }}
                >
                  <h4
                    className="text-[11px] uppercase text-accent mb-4 font-semibold"
                    style={{ letterSpacing: "0.3em" }}
                  >
                    What&apos;s Included
                  </h4>
                  <ul className="list-none">
                    {[
                      "All accommodations at hand-picked properties",
                      "Private transfers and in-country flights",
                      "Senior planner from Imperial Journeys assigned to your trip",
                      "24×7 concierge on a single WhatsApp line",
                      "Curated experiences not bookable elsewhere",
                    ].map((item, i, arr) => (
                      <li
                        key={item}
                        className="py-2.5 pl-7 relative font-serif text-[1.05rem] text-ink"
                        style={{
                          borderBottom:
                            i === arr.length - 1
                              ? "none"
                              : "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <span className="absolute left-0 top-2.5 text-accent text-[14px]">
                          ◆
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="bg-ink text-white p-9 rounded-md mb-6">
                  <h4
                    className="text-[11px] uppercase text-accent-soft mb-6 font-semibold"
                    style={{ letterSpacing: "0.3em" }}
                  >
                    At a Glance
                  </h4>
                  {[
                    { k: "Duration", v: active.days, gold: true },
                    { k: "Best Season", v: active.season },
                    { k: "Style", v: active.style },
                    { k: "From", v: active.from, gold: true },
                  ].map((row, i, arr) => (
                    <div
                      key={row.k}
                      className="py-3.5 flex justify-between items-baseline gap-3"
                      style={{
                        borderBottom:
                          i === arr.length - 1
                            ? "none"
                            : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span
                        className="text-[11px] uppercase text-white/55 font-medium"
                        style={{ letterSpacing: "0.15em" }}
                      >
                        {row.k}
                      </span>
                      <span
                        className={`font-serif text-[1.05rem] text-right ${
                          row.gold ? "text-accent-soft italic" : "text-white"
                        }`}
                      >
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href="#contact-section"
                  onClick={() => setActive(null)}
                  className="btn btn-primary w-full justify-center mt-3"
                >
                  Plan This Journey <span className="arrow">→</span>
                </a>
              </div>
            </div>

            <div className="px-[60px] pb-[60px] max-[880px]:px-7 max-[880px]:pb-[50px]">
              <h3 className="font-serif font-medium text-[1.6rem] mb-7 text-ink">
                Moments from the{" "}
                <span className="italic text-accent">trip</span>
              </h3>
              <div className="grid grid-cols-3 gap-4 max-[880px]:grid-cols-1">
                {active.gallery.map((g) => (
                  <div
                    key={g.img}
                    className="relative overflow-hidden rounded bg-ink cursor-pointer group"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={g.img}
                      alt={g.cap}
                      fill
                      sizes="(max-width: 880px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.06]"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)",
                      }}
                    />
                    <div
                      className="absolute bottom-3 left-4 right-4 text-white font-serif z-[2]"
                      style={{
                        fontSize: "0.95rem",
                        textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                      }}
                    >
                      {g.cap}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
