"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { track } from "@/data/about";

const DEFAULT_VOLUME = 0.7;

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function MusicNoteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M9 18V5l10-2v13" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 6.25h2L7.25 4v8l-2.75-2.25h-2z" />
      {muted ? (
        <>
          <path d="m10.25 6.25 3.5 3.5" />
          <path d="m13.75 6.25-3.5 3.5" />
        </>
      ) : (
        <path d="M10.25 5.5a3.25 3.25 0 0 1 0 5" />
      )}
    </svg>
  );
}

export default function AboutPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(DEFAULT_VOLUME);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const hasTrack = Boolean(track.src);

  useEffect(() => {
    if (!hasTrack) return;
    const audio = new Audio(track.src);
    audio.preload = "metadata";
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const onTime = () => setElapsed(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
  }, [hasTrack]);

  const toggle = () => {
    if (!hasTrack) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setElapsed(value);
  };

  const changeVolume = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    audio.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
    if (value > 0) previousVolumeRef.current = value;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (muted || volume === 0) {
      const nextVolume = volume === 0 ? previousVolumeRef.current : volume;
      audio.volume = nextVolume;
      audio.muted = false;
      setVolume(nextVolume);
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
  };

  const fillPct = duration > 0 ? (elapsed / duration) * 100 : 0;
  const volumePct = volume * 100;
  const isVisuallyMuted = muted || volume === 0;

  return (
    <div className="flex items-center gap-4 md:gap-5">
      {/* Album art (neutral placeholder with a music note until supplied) */}
      <div className="flex w-36 shrink-0 justify-center md:w-72">
        <div className="relative aspect-[835/729] w-36 overflow-hidden bg-placeholder md:w-64">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={`${track.title} album art`}
              fill
              unoptimized
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-meta">
              <MusicNoteIcon />
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium">{track.title}</p>
        <p className="mt-0.5 text-[13px] text-meta md:text-sm">
          {track.artist}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            aria-disabled={!hasTrack}
            className={`shrink-0 transition-colors ${
              hasTrack
                ? "text-ink hover:text-meta"
                : "cursor-not-allowed text-meta/50"
            }`}
          >
            {playing ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                aria-hidden
              >
                <rect x="3" y="2" width="3" height="10" />
                <rect x="8" y="2" width="3" height="10" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                aria-hidden
              >
                <path d="M4 2.5v9l8-4.5-8-4.5z" />
              </svg>
            )}
          </button>
          <span className="w-9 text-right text-[12px] tabular-nums text-meta">
            {formatTime(elapsed)}
          </span>
          <input
            type="range"
            aria-label="Seek"
            className="seek flex-1"
            min={0}
            max={duration || 0}
            step={0.1}
            value={elapsed}
            disabled={!hasTrack}
            onChange={(e) => seek(Number(e.target.value))}
            style={{ "--seek-fill": `${fillPct}%` } as CSSProperties}
          />
          <span className="w-9 text-[12px] tabular-nums text-meta">
            {formatTime(duration)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isVisuallyMuted ? "Unmute" : "Mute"}
            aria-disabled={!hasTrack}
            className={`-m-1 flex size-7 shrink-0 items-center justify-center transition-colors ${
              hasTrack
                ? "text-ink hover:text-meta"
                : "cursor-not-allowed text-meta/50"
            }`}
          >
            <SpeakerIcon muted={isVisuallyMuted} />
          </button>
          <input
            type="range"
            aria-label="Volume"
            className="seek w-24"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            disabled={!hasTrack}
            onChange={(e) => changeVolume(Number(e.target.value))}
            style={{ "--seek-fill": `${volumePct}%` } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
