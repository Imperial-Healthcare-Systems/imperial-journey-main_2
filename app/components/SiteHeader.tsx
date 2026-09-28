"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#intro-section", label: "Intro" },
  { href: "#wonders-section", label: "Wonders" },
  { href: "#about-section", label: "About" },
  { href: "#features-section", label: "Why Us" },
  { href: "#services-section", label: "Services" },
  { href: "#contact-section", label: "Contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("intro-section");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const headerClass = scrolled
    ? "fixed top-0 left-0 right-0 z-[50] py-3.5 transition-all duration-[400ms] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "absolute top-[45px] left-0 right-0 z-[50] py-[18px] transition-all duration-[400ms]";

  return (
    <header
      className={headerClass}
      style={
        scrolled
          ? {
              background: "rgba(13,13,13,0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }
          : undefined
      }
    >
      <div className="wrap flex items-center justify-between">
        <a href="#intro-section" className="flex items-center gap-3.5">
          <Image
            src="/Imperial%20tech%20logo%20bbc.png"
            alt="Imperial Journeys"
            width={46}
            height={52}
            priority
          />
          <div className="leading-[1.1]">
            <span className="font-serif font-semibold text-[22px] text-white">
              Imperial Journeys
            </span>
            <span
              className="block mt-1 text-[9px] uppercase font-medium text-accent-soft"
              style={{ letterSpacing: "0.28em" }}
            >
              The World, Curated
            </span>
          </div>
        </a>

        <nav
          className={`flex gap-9 items-center ${
            open ? "max-[980px]:right-0" : "max-[980px]:right-[-100%]"
          } max-[980px]:fixed max-[980px]:top-0 max-[980px]:w-4/5 max-[980px]:max-w-[340px] max-[980px]:h-screen max-[980px]:flex-col max-[980px]:items-start max-[980px]:pt-[110px] max-[980px]:px-9 max-[980px]:pb-9 max-[980px]:gap-[22px] max-[980px]:transition-[right] max-[980px]:duration-[400ms] max-[980px]:z-[99]`}
          style={
            open
              ? {
                  background: "rgba(13,13,13,0.98)",
                  backdropFilter: "blur(20px)",
                }
              : undefined
          }
        >
          {NAV_LINKS.map((link) => {
            const id = link.href.slice(1);
            const isActive = activeId === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-[12px] font-medium uppercase relative py-2 transition-colors duration-300 hover:text-accent-soft ${
                  isActive ? "text-accent-soft" : "text-white/85"
                }`}
                style={{ letterSpacing: "0.18em" }}
              >
                {link.label}
                <span
                  className="absolute bottom-0 left-0 h-0.5 bg-accent transition-[width] duration-[400ms]"
                  style={{ width: isActive ? "100%" : 0 }}
                />
              </a>
            );
          })}
        </nav>

        <button
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="hidden max-[980px]:block bg-transparent border-0 p-2 z-[101]"
        >
          <span className="block w-6 h-0.5 bg-white my-[5px] transition-all duration-300" />
          <span className="block w-6 h-0.5 bg-white my-[5px] transition-all duration-300" />
          <span className="block w-6 h-0.5 bg-white my-[5px] transition-all duration-300" />
        </button>
      </div>
    </header>
  );
}
