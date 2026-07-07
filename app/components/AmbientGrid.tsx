"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
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
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");

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

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 1;
      context.strokeStyle = "rgba(17, 17, 17, 0.035)";
      traceGrid(pointer, pointer ? 1 : 0);

      if (!pointer || reducedMotionQuery.matches || !finePointerQuery.matches) {
        return;
      }

      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, BEND_RADIUS * 1.3);
      glow.addColorStop(0, "rgba(35, 65, 95, 0.085)");
      glow.addColorStop(0.48, "rgba(35, 65, 95, 0.032)");
      glow.addColorStop(1, "rgba(35, 65, 95, 0)");
      context.fillStyle = glow;
      context.fillRect(pointer.x - BEND_RADIUS * 1.35, pointer.y - BEND_RADIUS * 1.35, BEND_RADIUS * 2.7, BEND_RADIUS * 2.7);

      context.save();
      context.beginPath();
      context.arc(pointer.x, pointer.y, BEND_RADIUS * 1.08, 0, Math.PI * 2);
      context.clip();
      context.lineWidth = 1.12;
      context.strokeStyle = "rgba(35, 65, 95, 0.14)";
      traceGrid(pointer, 1);
      context.restore();

      context.beginPath();
      context.fillStyle = "rgba(35, 65, 95, 0.2)";
      context.arc(pointer.x, pointer.y, 2.2, 0, Math.PI * 2);
      context.fill();
    };

    const scheduleDraw = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        draw();
      });
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
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", clearPointer);
    document.documentElement.addEventListener("mouseleave", clearPointer);
    reducedMotionQuery.addEventListener("change", handlePreferenceChange);
    finePointerQuery.addEventListener("change", handlePreferenceChange);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", clearPointer);
      document.documentElement.removeEventListener("mouseleave", clearPointer);
      reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
      finePointerQuery.removeEventListener("change", handlePreferenceChange);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="ambient-field__glow ambient-field__glow--one" />
      <span className="ambient-field__glow ambient-field__glow--two" />
      <canvas ref={canvasRef} className="ambient-grid" />
    </div>
  );
}
