"use client";

import { useEffect, useRef } from "react";
import { createSpaceScene, T } from "../components/intro/spaceScene";
import { createGroundScene } from "../components/intro/groundScene";

declare global {
  interface Window {
    __ijReady?: boolean;
    __ijRender?: (t: number) => void;
  }
}

export default function RenderStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("scene") === "ground") {
      const ground = createGroundScene({
        canvas: canvasRef.current!,
        pixelRatio: 1.5,
        onReady: () => {
          window.__ijReady = true;
        },
      });
      window.__ijRender = (t) => ground.renderAt(t);
      return () => ground.dispose();
    }
    const scene = createSpaceScene({
      canvas: canvasRef.current!,
      manual: true,
      pixelRatio: 2, // supersampled, downscaled by the capture
      onReady: () => {
        window.__ijReady = true;
      },
      onTick: (t) => {
        const f = Math.min(1, Math.max(0, (t - T.whiteout) / (T.end - T.whiteout)));
        flashRef.current!.style.opacity = String(f);
      },
      onFinish: () => {},
    });
    window.__ijRender = (t) => scene.renderAt(t);
    return () => scene.dispose();
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0, background: "radial-gradient(ellipse at center, #ffffff 0%, #f1f5f8 60%, #dfe7ee 100%)" }}
      />
    </div>
  );
}
