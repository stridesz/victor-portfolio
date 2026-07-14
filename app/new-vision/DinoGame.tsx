"use client";

import { useEffect, useRef } from "react";

type GameState = "idle" | "running" | "game-over";

const DINO_X = 30;
const DINO_GROUND_Y = 64;
const FIRST_CACTUS_X = 118;
const RUN_SPEED = 200;
const MAX_RUN_SPEED = 220;
const JUMP_VELOCITY = -275;
const GRAVITY = 850;
const CACTUS_WIDTH = 20;
const OBSTACLE_GAPS = [72, 104, 88, 120] as const;

type Game = {
  state: GameState;
  score: number;
  frameCount: number;
  paintCount: number;
  dinoY: number;
  velocityY: number;
  obstacleX: number;
  obstaclesCleared: number;
  highScore: number;
  elapsed: number;
  lastTime: number;
};

type Surface = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
};

type DinoCanvas = HTMLCanvasElement & {
  __getDinoSnapshot?: () => Pick<
    Game,
    "state" | "score" | "frameCount" | "paintCount" | "dinoY" | "obstaclesCleared"
  >;
};

function drawDino(context: CanvasRenderingContext2D, y: number, frameCount: number) {
  context.fillStyle = "#070707";
  context.fillRect(DINO_X + 5, y + 10, 17, 16);
  context.fillRect(DINO_X + 18, y + 2, 11, 18);
  context.fillRect(DINO_X + 24, y, 17, 11);
  context.fillRect(DINO_X + 37, y + 8, 8, 4);
  context.clearRect(DINO_X + 33, y + 3, 3, 3);
  context.fillRect(DINO_X, y + 14, 8, 7);
  context.fillRect(DINO_X - 4, y + 10, 5, 5);
  const stride = frameCount % 12 < 6 ? 0 : 5;
  context.fillRect(DINO_X + 9 + stride, y + 24, 5, 7);
  context.fillRect(DINO_X + 19 - stride, y + 24, 5, 7);
}

function drawCactus(context: CanvasRenderingContext2D, x: number) {
  context.fillStyle = "#070707";
  context.fillRect(x + 7, 69, 7, 25);
  context.fillRect(x, 76, 7, 6);
  context.fillRect(x, 71, 4, 11);
  context.fillRect(x + 14, 74, 6, 6);
  context.fillRect(x + 17, 69, 3, 11);
}

function rectanglesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

function hasCollision(game: Game) {
  const bodyX = DINO_X + 5;
  const bodyY = game.dinoY + 10;
  const headX = DINO_X + 18;
  const headY = game.dinoY + 2;
  const cactusX = game.obstacleX;

  return (
    rectanglesOverlap(bodyX, bodyY, 19, 20, cactusX + 7, 69, 7, 25) ||
    rectanglesOverlap(bodyX, bodyY, 19, 20, cactusX, 71, 7, 11) ||
    rectanglesOverlap(bodyX, bodyY, 19, 20, cactusX + 14, 69, 6, 11) ||
    rectanglesOverlap(headX, headY, 23, 18, cactusX + 7, 69, 7, 25) ||
    rectanglesOverlap(headX, headY, 23, 18, cactusX, 71, 7, 11) ||
    rectanglesOverlap(headX, headY, 23, 18, cactusX + 14, 69, 6, 11)
  );
}

function drawBanner(context: CanvasRenderingContext2D, width: number, label: string, y: number) {
  const bannerWidth = Math.min(width - 48, label.length * 6 + 18);
  const x = Math.round((width - bannerWidth) / 2);
  context.fillStyle = "rgba(248, 248, 245, 0.96)";
  context.fillRect(x, y, bannerWidth, 16);
  context.strokeStyle = "#070707";
  context.lineWidth = 1;
  context.strokeRect(x + 0.5, y + 0.5, bannerWidth - 1, 15);
  context.fillStyle = "#070707";
  context.textAlign = "center";
  context.fillText(label, width / 2, y + 11);
}

function paint(surface: Surface, game: Game) {
  const { context, width, height } = surface;
  game.paintCount += 1;
  context.clearRect(0, 0, width, height);

  context.fillStyle = "rgba(7, 7, 7, 0.12)";
  context.fillRect(Math.round(width * 0.2), 29, 16, 2);
  context.fillRect(Math.round(width * 0.2) + 4, 26, 7, 2);
  context.fillRect(Math.round(width * 0.72), 38, 11, 2);
  context.fillRect(Math.round(width * 0.72) + 3, 35, 5, 2);

  context.fillStyle = "#070707";
  context.fillRect(12, 94, width - 24, 2);
  const groundOffset = game.state === "running" ? Math.floor(game.elapsed / 18) % 24 : 0;
  context.fillStyle = "rgba(7, 7, 7, 0.38)";
  for (let x = 18 - groundOffset; x < width - 12; x += 24) {
    context.fillRect(x, 101, 9, 1);
  }
  context.fillRect(28, 106, 3, 2);
  context.fillRect(width - 52, 108, 5, 1);
  drawDino(context, game.dinoY, game.frameCount);
  drawCactus(context, game.obstacleX);

  context.font = "bold 9px monospace";
  context.fillStyle = "#070707";
  context.textAlign = "right";
  context.fillText(
    `HI ${String(game.highScore).padStart(5, "0")}  ${String(game.score).padStart(5, "0")}`,
    width - 12,
    16,
  );
  if (game.state === "idle") {
    drawBanner(context, width, "SPACE / TAP", 42);
  } else if (game.state === "game-over") {
    drawBanner(context, width, "GAME OVER", 32);
    context.textAlign = "center";
    context.fillText("SPACE / TAP TO RESTART", width / 2, 58);
  }
}

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as DinoCanvas | null;
    const status = statusRef.current;
    if (!canvas || !status) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let rafId = 0;
    let resolutionQuery: MediaQueryList | null = null;
    const surface: Surface = { context, width: 0, height: 0, dpr: 0 };
    const syncSurface = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (width === surface.width && height === surface.height && dpr === surface.dpr) {
        return false;
      }

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = false;
      surface.width = width;
      surface.height = height;
      surface.dpr = dpr;
      return true;
    };
    syncSurface();
    const game: Game = {
      state: "idle",
      score: 0,
      frameCount: 0,
      paintCount: 0,
      dinoY: DINO_GROUND_Y,
      velocityY: 0,
      obstacleX: FIRST_CACTUS_X,
      obstaclesCleared: 0,
      highScore: 0,
      elapsed: 0,
      lastTime: 0,
    };
    Object.defineProperty(canvas, "__getDinoSnapshot", {
      configurable: true,
      enumerable: false,
      value: () => ({
        state: game.state,
        score: game.score,
        frameCount: game.frameCount,
        paintCount: game.paintCount,
        dinoY: game.dinoY,
        obstaclesCleared: game.obstaclesCleared,
      }),
    });

    const updateStatus = (label: string) => {
      status.textContent = label;
    };
    const setState = (state: GameState) => {
      game.state = state;
    };

    const reset = () => {
      cancelAnimationFrame(rafId);
      setState("idle");
      game.score = 0;
      game.frameCount = 0;
      game.dinoY = DINO_GROUND_Y;
      game.velocityY = 0;
      game.obstacleX = FIRST_CACTUS_X;
      game.obstaclesCleared = 0;
      game.elapsed = 0;
      game.lastTime = 0;
      paint(surface, game);
      updateStatus("Ready. Score 0.");
    };

    const syncAndRepaint = () => {
      if (!syncSurface()) return;
      game.obstacleX = Math.min(game.obstacleX, surface.width + 60);
      paint(surface, game);
    };

    const tick = (time: number) => {
      if (game.state !== "running") return;
      const delta = game.lastTime
        ? Math.max(0, Math.min((time - game.lastTime) / 1000, 0.1))
        : 0;
      game.lastTime = time;
      game.frameCount += 1;
      let remaining = delta;
      while (remaining > 0) {
        const step = Math.min(remaining, 0.025);
        remaining -= step;
        game.elapsed += step * 1000;
        game.score = Math.floor(game.elapsed / 100);
        game.highScore = Math.max(game.highScore, game.score);
        game.velocityY += GRAVITY * step;
        game.dinoY = Math.min(DINO_GROUND_Y, game.dinoY + game.velocityY * step);
        if (game.dinoY === DINO_GROUND_Y && game.velocityY > 0) game.velocityY = 0;
        const speed = Math.min(MAX_RUN_SPEED, RUN_SPEED + game.score * 0.2);
        game.obstacleX -= speed * step;
        if (hasCollision(game)) {
          setState("game-over");
          paint(surface, game);
          updateStatus(
            `Game over. Score ${game.score}. Press Space or Arrow Up, or tap, to restart.`,
          );
          return;
        }
        if (game.obstacleX + CACTUS_WIDTH < 0) {
          game.obstaclesCleared += 1;
          const gap = OBSTACLE_GAPS[(game.obstaclesCleared - 1) % OBSTACLE_GAPS.length];
          game.obstacleX = surface.width + gap;
        }
      }
      paint(surface, game);
      rafId = requestAnimationFrame(tick);
    };

    const startOrJump = () => {
      if (game.state === "game-over") {
        game.score = 0;
        game.frameCount = 0;
        game.dinoY = DINO_GROUND_Y;
        game.velocityY = 0;
        game.obstacleX = FIRST_CACTUS_X;
        game.obstaclesCleared = 0;
        game.elapsed = 0;
        game.lastTime = 0;
      }
      if (game.state === "idle" || game.state === "game-over") {
        setState("running");
        game.lastTime = performance.now();
        updateStatus("Running. Score 0.");
      }
      if (game.state === "running" && game.dinoY === DINO_GROUND_Y) {
        game.velocityY = JUMP_VELOCITY;
        game.dinoY = DINO_GROUND_Y - 1;
      }
      paint(surface, game);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "ArrowUp") return;
      event.preventDefault();
      startOrJump();
    };
    const onPointerDown = () => {
      canvas.focus();
      startOrJump();
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (game.state === "running") {
        game.lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };
    const onResolutionChange = () => {
      syncAndRepaint();
      armResolutionListener();
    };
    const armResolutionListener = () => {
      resolutionQuery?.removeEventListener("change", onResolutionChange);
      resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      resolutionQuery.addEventListener("change", onResolutionChange);
    };

    reset();
    const observer = new ResizeObserver(syncAndRepaint);
    observer.observe(canvas);
    armResolutionListener();
    window.addEventListener("resize", syncAndRepaint);
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", syncAndRepaint);
      resolutionQuery?.removeEventListener("change", onResolutionChange);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      delete canvas.__getDinoSnapshot;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        role="application"
        aria-label="Dinosaur runner game. Press Space or Arrow Up, or tap, to jump."
        aria-describedby="dino-game-instructions"
        tabIndex={0}
        className="dino-game"
      />
      <span id="dino-game-instructions" hidden>
        Focus the game, then press Space or Arrow Up, or tap, to jump.
      </span>
      <span
        ref={statusRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      >
        Ready. Score 0.
      </span>
      <style jsx>{`
        .dino-game {
          position: absolute;
          z-index: 120;
          left: 62vw;
          top: 50vh;
          width: min(360px, calc(100vw - 48px));
          height: 120px;
          box-sizing: border-box;
          transform: translate(-50%, -50%);
          background: rgba(248, 248, 245, 0.92);
          border: 2px solid #070707;
          border-radius: 0;
          box-shadow: 4px 4px 0 rgba(7, 7, 7, 0.22);
          cursor: pointer;
          touch-action: manipulation;
        }

        .dino-game:focus {
          outline: 2px solid #070707;
          outline-offset: 2px;
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          clip-path: inset(50%);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 639px) {
          .dino-game {
            left: 50vw;
            top: calc(50vh + 135px);
          }
        }

        @media (max-height: 480px) and (orientation: landscape) {
          .dino-game {
            left: 75vw;
            top: 50vh;
            width: min(300px, calc(50vw - 28px));
            height: 120px;
          }
        }
      `}</style>
    </>
  );
}
