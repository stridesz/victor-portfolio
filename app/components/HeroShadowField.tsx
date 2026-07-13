"use client";

import { useEffect, useRef, useState } from "react";

export function HeroShadowField() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const updateDocumentVisibility = () => setIsDocumentVisible(!document.hidden);
    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(field);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateDocumentVisibility);
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      className="hero-shadow-field"
      aria-hidden="true"
      data-active={isIntersecting && isDocumentVisible ? "true" : "false"}
    >
      <div className="hero-shadow-field__mask" />
    </div>
  );
}
