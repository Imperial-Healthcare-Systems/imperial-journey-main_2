"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide scroll effects:
 * - `.reveal` / `.reveal-left` / `.reveal-right` / `.reveal-zoom` fade in once on entering the viewport
 * - `.reveal-stagger` reveals its children one after another
 * - `[data-parallax="0.2"]` drifts against the scroll (speed relative to its parent)
 * - `[data-scroll-fade]` lifts and fades out as the hero scrolls away
 * - `[data-scroll-zoom]` slowly zooms in as the hero scrolls away
 * - a thin gold progress bar across the top
 *
 * Moving effects use the CSS `translate` / `scale` properties so they compose
 * with any Tailwind `transform` already on the element.
 */
export default function RevealOnScroll() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- reveal on enter ----
    document.querySelectorAll<HTMLElement>(".reveal-stagger").forEach((group) => {
      Array.from(group.children).forEach((child, i) =>
        (child as HTMLElement).style.setProperty("--i", String(i)),
      );
    });

    const els = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-stagger",
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));

    // ---- scroll-linked motion ----
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const fades = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-fade]"));
    const zooms = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-zoom]"));

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;

      const max = document.documentElement.scrollHeight - vh;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      if (reduced) return;

      // hero: 0 at the top, 1 once scrolled a full screen
      const p = Math.min(Math.max(y / vh, 0), 1);
      fades.forEach((el) => {
        el.style.translate = `0 ${p * 140}px`;
        el.style.opacity = String(Math.max(1 - p * 1.4, 0));
      });
      zooms.forEach((el) => {
        el.style.scale = String(1 + p * 0.15);
      });

      parallax.forEach((el) => {
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax || "0.2");
        const offset = (box.top + box.height / 2 - vh / 2) * speed;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[300] bg-accent origin-left pointer-events-none"
      style={{ transform: "scaleX(0)", boxShadow: "0 0 10px rgba(200,164,90,0.6)" }}
    />
  );
}
