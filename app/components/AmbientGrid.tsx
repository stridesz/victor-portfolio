"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

type Streak = {
  x: number;
  startY: number;
  len: number;
  speed: number;
  phase: number;
  width: number;
  bright: number;
};

const GRID_SIZE = 96;
const SAMPLE_STEP = 18;
const BEND_RADIUS = 178;
const PUSH_STRENGTH = 34;
const TWIST_STRENGTH = 8;

function warpPoint(x: number, y: number, pointer: Point | null, strength: number): [number, number] {
  if (!pointer || strength <= 0) {
    return [x, y];
  }

  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= BEND_RADIUS || distance < 0.001) {
    return [x, y];
  }

  const reach = 1 - distance / BEND_RADIUS;
  const influence = reach * reach;
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  const push = PUSH_STRENGTH * influence * strength;
  const twist = TWIST_STRENGTH * influence * strength;

  return [
    x + normalizedX * push - normalizedY * twist,
    y + normalizedY * push + normalizedX * twist,
  ];
}

export function AmbientGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) {
      return;
    }

    let width = 0;
    let height = 0;
    let pointer: Point | null = null;
    let animationFrame = 0;
    let streaks: Streak[] = [];
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");

    // Section tween: 0 = default (faint ink grid), 1 = projects section (green
    // rain streaks over light suede). Driven by data-mood="projects" on <html>,
    // which ScrollMood toggles while Featured Projects owns the viewport.
    let sectionT = document.documentElement.getAttribute("data-mood") === "projects" ? 1 : 0;
    let sectionTarget = sectionT;
    let motionFrame = 0;
    let animTime = 0; // rAF timestamp driving laser drift/pulse
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

    const syncGridOrigin = () => {
      const title = document.getElementById("hero-title");

      if (!(title instanceof HTMLElement)) {
        document.documentElement.style.removeProperty("--hero-grid-origin-x");
        document.documentElement.style.removeProperty("--hero-grid-origin-y");
        return;
      }

      let x = title.offsetWidth / 2;
      let y = title.offsetHeight / 2;
      let element: HTMLElement | null = title;

      while (element) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent as HTMLElement | null;
      }

      x -= window.scrollX;
      y -= window.scrollY;

      const originX = Math.max(8, Math.min(92, (x / window.innerWidth) * 100));
      const originY = Math.max(12, Math.min(88, (y / window.innerHeight) * 100));

      document.documentElement.style.setProperty("--hero-grid-origin-x", `${originX.toFixed(2)}%`);
      document.documentElement.style.setProperty("--hero-grid-origin-y", `${originY.toFixed(2)}%`);
    };

    const initStreaks = () => {
      // Roughly one streak per ~38px of width, so density scales with the screen.
      const count = Math.max(14, Math.min(46, Math.round(width / 38)));

      streaks = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        startY: Math.random() * (height + 400),
        len: 80 + Math.random() * 190,
        speed: 90 + Math.random() * 230, // px/s; varied so they fall at different rates
        phase: Math.random() * Math.PI * 2,
        width: 1 + Math.random() * 1.4,
        bright: 0.6 + Math.random() * 0.55,
      }));
    };

    const traceGrid = (activePointer: Point | null, strength: number) => {
      for (let x = -GRID_SIZE; x <= width + GRID_SIZE; x += GRID_SIZE) {
        context.beginPath();
        let firstPoint = true;

        for (let y = -GRID_SIZE; y <= height + GRID_SIZE; y += SAMPLE_STEP) {
          const [warpedX, warpedY] = warpPoint(x, y, activePointer, strength);

          if (firstPoint) {
            context.moveTo(warpedX, warpedY);
            firstPoint = false;
          } else {
            context.lineTo(warpedX, warpedY);
          }
        }

        context.stroke();
      }

      for (let y = -GRID_SIZE; y <= height + GRID_SIZE; y += GRID_SIZE) {
        context.beginPath();
        let firstPoint = true;

        for (let x = -GRID_SIZE; x <= width + GRID_SIZE; x += SAMPLE_STEP) {
          const [warpedX, warpedY] = warpPoint(x, y, activePointer, strength);

          if (firstPoint) {
            context.moveTo(warpedX, warpedY);
            firstPoint = false;
          } else {
            context.lineTo(warpedX, warpedY);
          }
        }

        context.stroke();
      }
    };

    const drawStreaks = () => {
      const t = animTime;

      context.save();
      context.lineCap = "round";

      for (const streak of streaks) {
        // The bright head falls from above the top edge to below the bottom,
        // then wraps. topY trails behind it by the streak length.
        const cycle = height + streak.len + 60;
        let head = (streak.startY + streak.speed * t * 0.001) % cycle;

        if (head < 0) {
          head += cycle;
        }

        const topY = head - streak.len;
        const flicker = 0.82 + 0.18 * Math.sin(t * 0.004 + streak.phase);
        const alpha = sectionT * streak.bright * 0.8 * flicker;

        if (alpha <= 0.004) {
          continue;
        }

        // Bright green head trailing up into transparency.
        const gradient = context.createLinearGradient(streak.x, topY, streak.x, head);
        gradient.addColorStop(0, "rgba(30, 150, 85, 0)");
        gradient.addColorStop(0.72, `rgba(33, 165, 92, ${alpha * 0.55})`);
        gradient.addColorStop(1, `rgba(120, 240, 165, ${alpha})`);

        context.strokeStyle = gradient;
        context.lineWidth = streak.width;
        context.shadowBlur = 5;
        context.shadowColor = `rgba(60, 210, 130, ${alpha * 0.7})`;
        context.beginPath();
        context.moveTo(streak.x, topY);
        context.lineTo(streak.x, head);
        context.stroke();

        // Hot glint at the leading head.
        context.beginPath();
        context.fillStyle = `rgba(200, 255, 220, ${alpha})`;
        context.arc(streak.x, head, streak.width * 0.9 + 0.5, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      context.shadowColor = "transparent";
      context.restore();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 1;

      // Faint ink grid, dimming a little as the laser field takes over.
      context.strokeStyle = `rgba(17, 17, 17, ${lerp(0.035, 0.014, sectionT)})`;
      traceGrid(pointer, pointer ? 1 : 0);

      if (sectionT > 0.001) {
        drawStreaks();
      }

      // Pointer glow (default mood only); fades out as the streaks arrive.
      const pointerFx = 1 - sectionT;

      if (!pointer || pointerFx <= 0.02 || reducedMotionQuery.matches || !finePointerQuery.matches) {
        return;
      }

      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, BEND_RADIUS * 1.3);
      glow.addColorStop(0, `rgba(35, 65, 95, ${0.085 * pointerFx})`);
      glow.addColorStop(0.48, `rgba(35, 65, 95, ${0.032 * pointerFx})`);
      glow.addColorStop(1, "rgba(35, 65, 95, 0)");
      context.fillStyle = glow;
      context.fillRect(pointer.x - BEND_RADIUS * 1.35, pointer.y - BEND_RADIUS * 1.35, BEND_RADIUS * 2.7, BEND_RADIUS * 2.7);

      context.save();
      context.beginPath();
      context.arc(pointer.x, pointer.y, BEND_RADIUS * 1.08, 0, Math.PI * 2);
      context.clip();
      context.lineWidth = 1.12;
      context.strokeStyle = `rgba(35, 65, 95, ${0.14 * pointerFx})`;
      traceGrid(pointer, 1);
      context.restore();

      context.beginPath();
      context.fillStyle = `rgba(35, 65, 95, ${0.2 * pointerFx})`;
      context.arc(pointer.x, pointer.y, 2.2, 0, Math.PI * 2);
      context.fill();
    };

    const scheduleDraw = () => {
      if (animationFrame || motionFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        draw();
      });
    };

    // Single loop: eases the section tween toward its target and keeps the laser
    // field animating while it is on screen, then stops so the default grid stays
    // static and cheap.
    const tick = (now: number) => {
      animTime = now;
      const delta = sectionTarget - sectionT;

      if (Math.abs(delta) < 0.004) {
        sectionT = sectionTarget;
      } else {
        sectionT += delta * 0.12;
      }

      draw();

      const settling = sectionT !== sectionTarget;
      const streaksActive = sectionT > 0.01;

      if (settling || streaksActive) {
        motionFrame = window.requestAnimationFrame(tick);
      } else {
        motionFrame = 0;
        draw();
      }
    };

    const applyMood = () => {
      sectionTarget = document.documentElement.getAttribute("data-mood") === "projects" ? 1 : 0;

      if (reducedMotionQuery.matches) {
        sectionT = sectionTarget;
        draw();
        return;
      }

      if (!motionFrame) {
        motionFrame = window.requestAnimationFrame(tick);
      }
    };

    const moodObserver = new MutationObserver(applyMood);

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      initStreaks();
      syncGridOrigin();
      draw();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotionQuery.matches || !finePointerQuery.matches || event.pointerType !== "mouse") {
        return;
      }

      pointer = { x: event.clientX, y: event.clientY };
      scheduleDraw();
    };

    const clearPointer = () => {
      pointer = null;
      scheduleDraw();
    };

    const handlePreferenceChange = () => {
      if (reducedMotionQuery.matches || !finePointerQuery.matches) {
        pointer = null;
      }

      scheduleDraw();
    };

    resize();
    document.fonts?.ready.then(() => {
      syncGridOrigin();
      scheduleDraw();
    });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.documentElement.addEventListener("mouseleave", clearPointer);
    reducedMotionQuery.addEventListener("change", handlePreferenceChange);
    finePointerQuery.addEventListener("change", handlePreferenceChange);
    moodObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mood"] });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", clearPointer);
      document.documentElement.removeEventListener("mouseleave", clearPointer);
      reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
      finePointerQuery.removeEventListener("change", handlePreferenceChange);
      moodObserver.disconnect();

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      if (motionFrame) {
        window.cancelAnimationFrame(motionFrame);
      }
    };
  }, []);

  return (
    <div className="ambient-field" aria-hidden="true">
      <canvas ref={canvasRef} className="ambient-grid" />
    </div>
  );
}
