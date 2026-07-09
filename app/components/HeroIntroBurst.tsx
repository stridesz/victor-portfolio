"use client";

import { useEffect, useRef } from "react";

// Timing is clustered inside the first second so the burst supports the hero
// landing without delaying any of the useful content.
const BURST_DELAY_MS = 500;
const BURST_DURATION_MS = 900;
const RAY_COUNT = 14;

type RGB = [number, number, number];
type Ray = {
  angle: number;
  reach: number; // fraction of maxR this ray travels
  width: number;
  delay: number; // 0..0.3, staggered launch
  color: RGB;
};

const PALETTE: RGB[] = [
  [35, 65, 95], // accent blue
  [126, 107, 76], // warm bronze
  [17, 17, 17], // ink
];

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

export function HeroIntroBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) {
      return;
    }

    // Respect reduced-motion: no burst at all, the static grid still reveals.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let width = 0;
    let height = 0;
    let maxR = 0;
    let animationFrame = 0;
    let startTime = 0;
    let origin = { x: 0, y: 0 };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const computeOrigin = () => {
      const title = document.getElementById("hero-title");

      if (title instanceof HTMLElement) {
        const rect = title.getBoundingClientRect();
        origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      } else {
        origin = { x: width / 2, y: height * 0.43 };
      }

      // Reach far enough that the fastest rays clear the viewport.
      maxR = Math.hypot(width, height) * 0.82;
    };

    // Build the ray set once. A little jitter keeps it from looking mechanical.
    const rays: Ray[] = Array.from({ length: RAY_COUNT }, (_, i) => {
      const base = (i / RAY_COUNT) * Math.PI * 2;
      return {
        angle: base + (Math.random() - 0.5) * 0.28,
        reach: 0.55 + Math.random() * 0.5,
        width: (i % 4 === 0 ? 2.1 : 1) + Math.random() * 0.6,
        delay: Math.random() * 0.16,
        color: PALETTE[i % PALETTE.length],
      };
    });

    const drawFlash = (p: number) => {
      // Bright core bloom: quick rise, slower decay.
      const intensity = p < 0.12 ? easeOut(p / 0.12) : Math.max(0, 1 - (p - 0.12) / 0.5);

      if (intensity <= 0) {
        return;
      }

      const radius = (0.16 + easeOut(p) * 0.5) * maxR;
      const glow = context.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, radius);
      glow.addColorStop(0, `rgba(255, 255, 255, ${0.5 * intensity})`);
      glow.addColorStop(0.32, `rgba(120, 160, 205, ${0.34 * intensity})`);
      glow.addColorStop(0.7, `rgba(35, 65, 95, ${0.12 * intensity})`);
      glow.addColorStop(1, "rgba(35, 65, 95, 0)");
      context.fillStyle = glow;
      context.fillRect(origin.x - radius, origin.y - radius, radius * 2, radius * 2);
    };

    const drawRings = (p: number) => {
      const ringDelays = [0, 0.2];

      for (const delay of ringDelays) {
        const t = Math.min(1, Math.max(0, (p - delay) / (1 - delay)));

        if (t <= 0 || t >= 1) {
          continue;
        }

        const radius = easeOut(t) * maxR;
        const alpha = (1 - t) * 0.28;
        context.beginPath();
        context.arc(origin.x, origin.y, radius, 0, Math.PI * 2);
        context.lineWidth = (1 - t) * 2.6 + 0.4;
        context.strokeStyle = rgba([35, 65, 95], alpha);
        context.stroke();
      }
    };

    const drawRays = (p: number) => {
      context.lineCap = "round";

      for (const ray of rays) {
        const span = 0.82 - ray.delay;
        const t = Math.min(1, Math.max(0, (p - ray.delay) / span));

        if (t <= 0 || t >= 1) {
          continue;
        }

        const eased = easeOut(t);
        const head = eased * maxR * ray.reach;
        const tail = Math.max(0, head - maxR * 0.2 * (1 - t * 0.4));
        const cos = Math.cos(ray.angle);
        const sin = Math.sin(ray.angle);
        const headX = origin.x + cos * head;
        const headY = origin.y + sin * head;
        const tailX = origin.x + cos * tail;
        const tailY = origin.y + sin * tail;
        const fade = (1 - t) ** 1.4;

        const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
        gradient.addColorStop(0, rgba(ray.color, 0));
        gradient.addColorStop(0.55, rgba(ray.color, 0.16 * fade));
        gradient.addColorStop(1, rgba(ray.color, 0.5 * fade));

        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(headX, headY);
        context.lineWidth = ray.width * (1 - t * 0.55) + 0.35;
        context.strokeStyle = gradient;
        context.stroke();

        // Bright head spark early in the ray's life.
        if (t < 0.55) {
          context.beginPath();
          context.arc(headX, headY, (1 - t) * 2.1 + 0.4, 0, Math.PI * 2);
          context.fillStyle = rgba([255, 255, 255], 0.55 * fade);
          context.fill();
        }
      }
    };

    const frame = () => {
      const elapsed = performance.now() - startTime;
      const p = elapsed / BURST_DURATION_MS;

      context.clearRect(0, 0, width, height);

      if (p >= 1) {
        return; // burst is over; leave the canvas clear
      }

      drawFlash(p);
      drawRings(p);
      drawRays(p);

      animationFrame = window.requestAnimationFrame(frame);
    };

    const begin = () => {
      // Only play where the hero name exists (home page).
      if (!document.getElementById("hero-title")) {
        return;
      }

      computeOrigin();
      startTime = performance.now();
      animationFrame = window.requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    const startTimer = window.setTimeout(begin, BURST_DELAY_MS);

    return () => {
      window.clearTimeout(startTimer);
      window.removeEventListener("resize", resize);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-intro-burst" aria-hidden="true" />;
}
