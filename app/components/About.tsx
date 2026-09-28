"use client";

import { useEffect, useRef, useState } from "react";
import LazyVideo from "./LazyVideo";

const ABOUT_VIDEO_URL =
  "https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4";

export default function About() {
  const [open, setOpen] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    if (modalVideoRef.current) {
      modalVideoRef.current.play().catch(() => {});
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
    setOpen(false);
  };

  return (
    <>
      <section
        id="about-section"
        className="py-[130px] bg-offwhite max-[600px]:py-[90px]"
      >
        <div className="wrap">
          <div className="grid grid-cols-2 gap-20 items-center max-[880px]:grid-cols-1 max-[880px]:gap-[50px]">
            <div className="reveal">
              <div className="eyebrow">Behind Every Journey</div>
              <h2 className="font-serif font-medium mt-4 mb-7">
                A decade of{" "}
                <span className="italic text-accent">
                  operational discipline,
                </span>
                <br />
                brought to a craft that runs on charm.
              </h2>
              <p className="mb-[22px] leading-[1.85]">
                Imperial Journeys is the travel arm of Imperial Healthcare
                Systems Pvt Ltd — a group that&apos;s spent the last decade
                building dependable, detail-obsessed services across healthcare
                and technology. We brought the same instinct to travel.
              </p>
              <p className="mb-[22px] leading-[1.85]">
                Every itinerary you see was sketched by a real planner who has
                stayed in the rooms they&apos;re sending you to, eaten in the
                kitchens they&apos;re recommending, and trusted the drivers on
                the road. The work happens behind the scenes — what you
                experience is just the journey.
              </p>
              <a href="#contact-section" className="btn btn-dark mt-4">
                Plan Your Journey <span className="arrow">→</span>
              </a>
            </div>

            <button
              type="button"
              aria-label="Play story film"
              onClick={() => setOpen(true)}
              className="reveal relative aspect-[4/5] w-full overflow-hidden rounded-md cursor-pointer bg-ink border-0 p-0 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4"
            >
              <LazyVideo src={ABOUT_VIDEO_URL} className="absolute inset-0 w-full h-full object-cover" />
              <span
                className="absolute pointer-events-none rounded-sm z-[2]"
                style={{
                  inset: 24,
                  border: "1px solid rgba(255,255,255,0.4)",
                }}
              />
              <span
                className="absolute inset-0 z-[1]"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.4))",
                }}
              />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-accent rounded-full grid place-items-center z-[3] transition-transform duration-[400ms] group-hover:scale-[1.08]">
                <span className="absolute -inset-2.5 rounded-full border border-white/60 animate-ripple" />
                <span
                  className="block ml-1.5"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "22px solid #fff",
                    borderTop: "14px solid transparent",
                    borderBottom: "14px solid transparent",
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </section>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] grid place-items-center p-8"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-[1080px] aspect-video bg-black relative">
            <button
              aria-label="Close"
              onClick={close}
              className="absolute -top-12 right-0 bg-transparent border-0 text-white text-[38px] cursor-pointer leading-none"
            >
              ×
            </button>
            <video
              ref={modalVideoRef}
              controls
              preload="auto"
              className="w-full h-full block"
            >
              <source
                src="https://videos.pexels.com/video-files/1851190/1851190-uhd_3840_2160_25fps.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      )}
    </>
  );
}
