// HandGuide.tsx (or inline in the same file)
import React from "react";

type Hand = "right" | "left";
type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";

interface HandGuideProps {
  hand: Hand;
  highlightFinger: Finger;
  className?: string;
  animate?: boolean;
}

export function HandGuide({
  hand,
  highlightFinger,
  className = "w-48 h-64",
  animate = true,
}: HandGuideProps) {
  const isLeft = hand === "left";
  const on = "text-blue-500 opacity-100";
  const off = "text-muted-foreground opacity-40";

  return (
    <div
      className={`relative ${className} mx-auto ${
        animate ? "animate-pulse" : ""
      }`}
    >
      <div className={`relative w-full h-full ${isLeft ? "scale-x-[-1]" : ""}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Palm */}
          <path
            d="M60 100 Q65 85 80 80 Q120 75 140 80 Q155 85 160 100 L160 170 Q160 185 140 195 L80 195 Q60 185 60 170 Z"
            fill="currentColor"
            className="text-muted-foreground/30 fill-current"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Thumb */}
          <ellipse
            cx="45"
            cy="120"
            rx="12"
            ry="35"
            className={`${
              highlightFinger === "thumb" ? on : off
            } fill-current transition-colors`}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            transform="rotate(-20 45 120)"
          />

          {/* Index */}
          <ellipse
            cx="85"
            cy="55"
            rx="12"
            ry="40"
            className={`${
              highlightFinger === "index" ? on : off
            } fill-current transition-colors`}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Middle */}
          <ellipse
            cx="110"
            cy="45"
            rx="12"
            ry="45"
            className={`${
              highlightFinger === "middle" ? on : off
            } fill-current transition-colors`}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Ring */}
          <ellipse
            cx="135"
            cy="50"
            rx="12"
            ry="42"
            className={`${
              highlightFinger === "ring" ? on : off
            } fill-current transition-colors`}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Pinky */}
          <ellipse
            cx="155"
            cy="65"
            rx="10"
            ry="35"
            className={`${
              highlightFinger === "pinky" ? on : off
            } fill-current transition-colors`}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
