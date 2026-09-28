"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LEGAL_PAGES, type LegalKey } from "../data/legal";
import { SOCIAL_LINKS } from "../data/social";

const TRIGGERS: { key: LegalKey; label: string }[] = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms of Service" },
  { key: "refund", label: "Payment & Refund Policy" },
];

export default function Footer() {
  const [open, setOpen] = useState<LegalKey | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    if (overlayRef.current) overlayRef.current.scrollTop = 0;
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const page = open ? LEGAL_PAGES[open] : null;

  return (
    <>
      <footer className="bg-ink text-white/65 pt-[70px] pb-7 text-center">
        <div className="wrap">
          <div className="inline-flex items-center gap-4 mb-10">
            <Image
              src="/Imperial%20tech%20logo%20bbc.png"
              alt="Imperial Journeys"
              width={62}
              height={70}
            />
            <div className="text-left leading-[1.1]">
              <div className="font-serif font-semibold text-[28px] text-white">
                Imperial Journeys
              </div>
              <div
                className="text-[10px] uppercase text-accent mt-1.5 font-medium"
                style={{ letterSpacing: "0.3em" }}
              >
                The World, Curated
              </div>
            </div>
          </div>

          <div className="my-7 flex justify-center gap-3.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-10 h-10 border border-white/20 rounded-full grid place-items-center text-white/70 transition-all duration-300 hover:bg-accent hover:border-accent hover:text-white hover:-translate-y-0.5 [&>svg]:w-[18px] [&>svg]:h-[18px]"
              >
                {s.icon}
              </a>
            ))}
          </div>

          <div className="my-4 mb-1.5 text-xs text-white/55" style={{ letterSpacing: "0.05em" }}>
            {TRIGGERS.map((t, i) => (
              <span key={t.key}>
                <button
                  type="button"
                  onClick={() => setOpen(t.key)}
                  className="text-white/65 hover:text-accent-soft transition-colors duration-300 cursor-pointer bg-transparent border-0 p-0"
                >
                  {t.label}
                </button>
                {i < TRIGGERS.length - 1 && (
                  <span className="mx-3 text-white/25">·</span>
                )}
              </span>
            ))}
          </div>

          <div
            className="text-xs mt-7 pt-7 text-white/50 font-light"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span
              className="text-[11px] uppercase text-accent-soft mb-1.5 block"
              style={{ letterSpacing: "0.15em" }}
            >
              A Travel Brand of Imperial Healthcare Systems Pvt Ltd
            </span>
            © 2026 Imperial Journeys. All rights reserved.
          </div>
        </div>
      </footer>

      {page && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          className="modal-overlay"
          style={{ zIndex: 220 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
        >
          <button
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="fixed top-6 right-7 w-[50px] h-[50px] grid place-items-center text-white text-[26px] rounded-full cursor-pointer z-[221] transition-all duration-300 hover:bg-accent hover:rotate-90 leading-none"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            ×
          </button>
          <div className="max-w-[920px] mx-auto my-[50px] bg-paper rounded-lg overflow-hidden relative animate-modalIn max-[720px]:m-0 max-[720px]:rounded-none">
            <div className="p-[70px_60px] pb-[60px] text-ink max-[720px]:p-[50px_26px_40px]">
              <div
                className="text-[11px] uppercase text-accent mb-4 font-semibold"
                style={{ letterSpacing: "0.35em" }}
              >
                {page.eyebrow}
              </div>
              <h1
                className="font-serif font-medium mb-3.5 text-ink"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                }}
              >
                {page.title}
              </h1>
              <div className="text-muted text-[15px] mb-2.5 font-normal">
                {page.sub}
              </div>
              <div
                className="text-xs text-muted mb-12 pb-7"
                style={{ letterSpacing: "0.05em", borderBottom: "1px solid #ececec" }}
              >
                {page.meta}
              </div>

              {page.sections.map((s) => (
                <section
                  key={s.n}
                  className="mb-[38px] grid gap-6 max-[720px]:grid-cols-1 max-[720px]:gap-1"
                  style={{ gridTemplateColumns: "50px 1fr" }}
                >
                  <div
                    className="font-serif text-accent italic font-medium pt-1.5"
                    style={{ fontSize: "1.4rem", lineHeight: 1 }}
                  >
                    {s.n}
                  </div>
                  <div className="legal-body">
                    <h2
                      className="font-sans font-semibold mb-3.5 text-ink"
                      style={{ fontSize: "1.15rem", letterSpacing: "-0.005em" }}
                    >
                      {s.h}
                    </h2>
                    <div
                      dangerouslySetInnerHTML={{ __html: s.body }}
                    />
                  </div>
                </section>
              ))}

              <div
                className="mt-12 pt-7 text-[13px] text-muted leading-[1.8]"
                style={{ borderTop: "1px solid #ececec" }}
              >
                <strong className="font-serif text-ink block mb-2.5" style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  Imperial Journeys
                </strong>
                A Travel Brand of Imperial Healthcare Systems Pvt Ltd
                <br />
                Email: info@imperialtechinnovations.com
                <br />
                India: +91 73580 13585  ·  USA: +1 (859) 978-8780
                <br />
                India Office: M15, Ground Floor, Regus, Welldone Tech Park,
                Sohna Road, Sector 48, Gurugram – 122018
                <br />
                USA Office: 212 N. 2nd St. STE 100, Richmond, KY 40475
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
