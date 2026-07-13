"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type Ripple = Point & { startedAt: number };


const RADIUS = 168;
const POINTER_ACTIVITY_MS = 200;

function warp(x: number, y: number, pointer: Point | null, velocity: Point, strength: number): Point {
  if (!pointer || strength < 0.001) return { x, y };
  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance >= RADIUS || distance < 0.01) return { x, y };
  const influence = Math.pow(1 - distance / RADIUS, 2) * strength;
  const pull = 26 * influence;
  const speed = Math.min(1, Math.hypot(velocity.x, velocity.y) / 18);
  return {
    x: x - (dx / distance) * pull + velocity.x * 0.48 * influence * speed,
    y: y - (dy / distance) * pull + velocity.y * 0.48 * influence * speed,
  };
}

export function AmbientGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let time = 0;
    let target: Point | null = null;
    let lastPointerMove = Number.NEGATIVE_INFINITY;
    let pointer: Point | null = null;
    const velocity: Point = { x: 0, y: 0 };
    let field = 0;
    let ripple: Ripple | null = null;
    let mood = document.documentElement.dataset.mood === "projects" ? 1 : 0;
    let moodTarget = mood;
    let hidden = document.hidden;
    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    const syncGridOrigin = () => {
      const title = document.getElementById("hero-title");
      if (!title) return;
      const rect = title.getBoundingClientRect();
      document.documentElement.style.setProperty("--hero-grid-origin-x", `${((rect.left + rect.width / 2) / width * 100).toFixed(2)}%`);
      document.documentElement.style.setProperty("--hero-grid-origin-y", `${((rect.top + rect.height / 2) / height * 100).toFixed(2)}%`);
    };

    const traceGrid = (stroke: string, spacing: number, lineWidth = 1) => {
      const step = Math.max(8, spacing / 5);
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      for (let x = -spacing; x <= width + spacing; x += spacing) {
        context.beginPath();
        for (let y = -spacing, first = true; y <= height + spacing; y += step, first = false) {
          const point = warp(x, y, pointer, velocity, field);
          if (first) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
      for (let y = -spacing; y <= height + spacing; y += spacing) {
        context.beginPath();
        for (let x = -spacing, first = true; x <= width + spacing; x += step, first = false) {
          const point = warp(x, y, pointer, velocity, field);
          if (first) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
    };


    const draw = () => {
      const baseSpacing = width <= 760 ? 56 : 64;
      const projectSpacing = width <= 760 ? 44 : 48;
      const spacing = baseSpacing + (projectSpacing - baseSpacing) * mood;
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";
      traceGrid(`rgba(${17 + mood * 12},${17 + mood * 90},${17 + mood * 57},${0.035 + mood * 0.025})`, spacing);

      const pointerFx = 1 - mood;
      if (pointer && field > 0.01 && pointerFx > 0.02) {
        context.save();
        context.beginPath();
        context.arc(pointer.x, pointer.y, RADIUS, 0, Math.PI * 2);
        context.clip();
        traceGrid(`rgba(35,65,95,${0.12 * field * pointerFx})`, spacing, 1.1);
        context.restore();

        context.fillStyle = `rgba(35,65,95,${0.16 * field * pointerFx})`;
        for (let x = Math.floor((pointer.x - RADIUS) / spacing) * spacing; x <= pointer.x + RADIUS; x += spacing) {
          for (let y = Math.floor((pointer.y - RADIUS) / spacing) * spacing; y <= pointer.y + RADIUS; y += spacing) {
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            if (distance < RADIUS) {
              const point = warp(x, y, pointer, velocity, field);
              context.beginPath();
              context.arc(point.x, point.y, Math.max(0.35, 1.4 * (1 - distance / RADIUS)), 0, Math.PI * 2);
              context.fill();
            }
          }
        }
      }

      if (ripple) {
        const progress = (time - ripple.startedAt) / 720;
        if (progress >= 1) ripple = null;
        else if (progress >= 0) {
          context.strokeStyle = `rgba(35,65,95,${0.14 * (1 - progress) * pointerFx})`;
          context.lineWidth = 1;
          context.beginPath();
          context.arc(ripple.x, ripple.y, 16 + progress * 122, 0, Math.PI * 2);
          context.stroke();
        }
      }
    };

    const tick = (now: number) => {
      time = now;
      const interactive = finePointer.matches && !reducedMotion.matches;
      const desiredField = target && interactive && now - lastPointerMove <= POINTER_ACTIVITY_MS ? 1 : 0;
      field += (desiredField - field) * 0.1;
      if (target) {
        if (!pointer) pointer = { ...target };
        const old = { ...pointer };
        pointer.x += (target.x - pointer.x) * 0.16;
        pointer.y += (target.y - pointer.y) * 0.16;
        velocity.x += (pointer.x - old.x - velocity.x) * 0.24;
        velocity.y += (pointer.y - old.y - velocity.y) * 0.24;
      } else {
        velocity.x *= 0.82;
        velocity.y *= 0.82;
      }
      mood += (moodTarget - mood) * (reducedMotion.matches ? 1 : 0.12);
      draw();
      const active = Math.abs(moodTarget - mood) > 0.003 || desiredField > 0 || field > 0.004 || ripple;
      frame = active && !hidden ? window.requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!frame && !hidden) frame = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      syncGridOrigin();
      draw();
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches || !finePointer.matches) return;
      target = { x: event.clientX, y: event.clientY };
      lastPointerMove = performance.now();
      start();
    };
    const leave = () => { target = null; start(); };
    const click = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches || !finePointer.matches) return;
      ripple = { x: event.clientX, y: event.clientY, startedAt: performance.now() };
      start();
    };
    const preferences = () => {
      if (reducedMotion.matches) {
        target = null;
        field = 0;
        ripple = null;
      } else if (!finePointer.matches) {
        target = null;
      }
      start();
    };
    const observer = new MutationObserver(() => {
      moodTarget = document.documentElement.dataset.mood === "projects" ? 1 : 0;
      start();
    });
    const visibility = () => {
      hidden = document.hidden;
      if (hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!hidden) {
        draw();
        start();
      }
    };

    resize();
    document.fonts?.ready.then(() => {
      if (!disposed) { syncGridOrigin(); draw(); }
    });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("mouseleave", leave);
    reducedMotion.addEventListener("change", preferences);
    finePointer.addEventListener("change", preferences);
    document.addEventListener("visibilitychange", visibility);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mood"] });

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("mouseleave", leave);
      reducedMotion.removeEventListener("change", preferences);
      finePointer.removeEventListener("change", preferences);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="ambient-field" aria-hidden="true"><canvas ref={canvasRef} className="ambient-grid" /></div>;
}
