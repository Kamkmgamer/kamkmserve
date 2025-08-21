import React from "react";

export default function AnimatedLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#34d399" />
          <animate attributeName="x1" values="0%;100%;0%" dur="8s" repeatCount="indefinite" />
          <animate attributeName="x2" values="100%;0%;100%" dur="8s" repeatCount="indefinite" />
        </linearGradient>
      </defs>

      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="url(#logo-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 24 24"
          to="360 24 24"
          dur="14s"
          repeatCount="indefinite"
        />
      </circle>

      <path
        d="M16 12 L16 36 M16 24 L30 12 M16 24 L30 36"
        stroke="url(#logo-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <animate attributeName="stroke-dashoffset" values="60;0;60" dur="6s" repeatCount="indefinite" />
        <animate attributeName="stroke-dasharray" values="0,100;30,100;0,100" dur="6s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
