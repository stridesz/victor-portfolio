"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type Ripple = Point & { startedAt: number };
type Streak = Point & { length: number; speed: number; alpha: number };

const GRID = 96;
const STEP = 16;
const RADIUS = 190;

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
    let pointer: Point | null = null;
    const velocity: Point = { x: 0, y: 0 };
    let field = 0;
    let ripple: Ripple | null = null;
    let mood = document.documentElement.dataset.mood === "projects" ? 1 : 0;
    let moodTarget = mood;
    let streaks: Streak[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    const syncGridOrigin = () => {
      const title = document.getElementById("hero-title");
      if (!title) return;
      const rect = title.getBoundingClientRect();
      document.documentElement.style.setProperty("--hero-grid-origin-x", `${((rect.left + rect.width / 2) / width * 100).toFixed(2)}%`);
      document.documentElement.style.setProperty("--hero-grid-origin-y", `${((rect.top + rect.height / 2) / height * 100).toFixed(2)}%`);
    };

    const traceGrid = (stroke: string, lineWidth = 1) => {
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      for (let x = -GRID; x <= width + GRID; x += GRID) {
        context.beginPath();
        for (let y = -GRID, first = true; y <= height + GRID; y += STEP, first = false) {
          const point = warp(x, y, pointer, velocity, field);
          if (first) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
      for (let y = -GRID; y <= height + GRID; y += GRID) {
        context.beginPath();
        for (let x = -GRID, first = true; x <= width + GRID; x += STEP, first = false) {
          const point = warp(x, y, pointer, velocity, field);
          if (first) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
    };

    const drawStreaks = () => {
      context.save();
      context.lineCap = "round";
      for (const streak of streaks) {
        const cycle = height + streak.length + 80;
        const head = (streak.y + streak.speed * time * 0.001) % cycle;
        const alpha = mood * streak.alpha;
        const gradient = context.createLinearGradient(streak.x, head - streak.length, streak.x, head);
        gradient.addColorStop(0, "rgba(30,150,85,0)");
        gradient.addColorStop(1, `rgba(80,205,125,${alpha})`);
        context.strokeStyle = gradient;
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(streak.x, head - streak.length);
        context.lineTo(streak.x, head);
        context.stroke();
      }
      context.restore();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";
      traceGrid(`rgba(17,17,17,${0.035 - mood * 0.021})`);
      if (mood > 0.001) drawStreaks();

      const pointerFx = 1 - mood;
      if (pointer && field > 0.01 && pointerFx > 0.02) {
        context.save();
        context.beginPath();
        context.arc(pointer.x, pointer.y, RADIUS, 0, Math.PI * 2);
        context.clip();
        traceGrid(`rgba(35,65,95,${0.12 * field * pointerFx})`, 1.1);
        context.restore();

        context.fillStyle = `rgba(35,65,95,${0.16 * field * pointerFx})`;
        for (let x = Math.floor((pointer.x - RADIUS) / GRID) * GRID; x <= pointer.x + RADIUS; x += GRID) {
          for (let y = Math.floor((pointer.y - RADIUS) / GRID) * GRID; y <= pointer.y + RADIUS; y += GRID) {
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
      const desiredField = target && interactive ? 1 : 0;
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
      const streaksActive = mood > 0.01 && !reducedMotion.matches;
      const active = Math.abs(moodTarget - mood) > 0.003 || streaksActive || desiredField > 0 || field > 0.004 || ripple;
      frame = active ? window.requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
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
      streaks = Array.from({ length: Math.max(14, Math.min(46, Math.round(width / 38))) }, () => ({
        x: Math.random() * width, y: Math.random() * (height + 400), length: 80 + Math.random() * 190,
        speed: 90 + Math.random() * 230, alpha: 0.35 + Math.random() * 0.35,
      }));
      syncGridOrigin();
      draw();
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches || !finePointer.matches) return;
      target = { x: event.clientX, y: event.clientY };
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

    resize();
    document.fonts?.ready.then(() => { syncGridOrigin(); draw(); });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("mouseleave", leave);
    reducedMotion.addEventListener("change", preferences);
    finePointer.addEventListener("change", preferences);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mood"] });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("mouseleave", leave);
      reducedMotion.removeEventListener("change", preferences);
      finePointer.removeEventListener("change", preferences);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="ambient-field" aria-hidden="true"><canvas ref={canvasRef} className="ambient-grid" /></div>;
}
