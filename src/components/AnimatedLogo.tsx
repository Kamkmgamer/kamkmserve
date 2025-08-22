// src/components/AnimatedLogo.tsx
import React, { forwardRef, useId, memo } from 'react';
import type { SVGProps } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export interface AnimatedLogoProps
  extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** Diameter (px or any CSS unit) */
  size?: number | string;
  /** Gradient stops (must be exactly 3) */
  colors?: readonly [string, string, string];
  /** Circle rotation duration in seconds */
  rotationDuration?: number;
  /** Gradient animation duration in seconds */
  gradientDuration?: number;
  /** Dash‐offset/array animation duration in seconds */
  dashAnimationDuration?: number;
  /** Accessible title for the SVG */
  title?: string;
}

/**
 * An animated, rotating SVG logo with a dynamic gradient.
 */
const AnimatedLogo = forwardRef<
  SVGSVGElement,
  AnimatedLogoProps
>((props, ref) => {
  const {
    size = 28,
    colors = ['#60A5FA', '#A78BFA', '#34D399'],
    rotationDuration = 14,
    gradientDuration = 8,
    dashAnimationDuration = 6,
    className,
    title = 'Animated Logo',
    ...rest
  } = props;

  const id = useId();
  const gradientId = `animated-logo-gradient-${id}`;
  const titleId = `animated-logo-title-${id}`;
  const descId = `animated-logo-desc-${id}`;
  const reduce = usePrefersReducedMotion();

  // build <stop>s automatically
  const stops = colors.map((color, idx) => {
    const offset = (idx / (colors.length - 1)) * 100;
    return (
      <stop
        key={idx}
        offset={`${offset}%`}
        stopColor={color}
      />
    );
  });

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-labelledby={`${titleId} ${descId}`}
      role="img"
      className={className}
      {...rest}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>
        A rotating circle with dynamic gradient and moving path.
      </desc>
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          {stops}
          {!reduce && (
            <>
              <animate
                attributeName="x1"
                values="0%;100%;0%"
                dur={`${gradientDuration}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="100%;0%;100%"
                dur={`${gradientDuration}s`}
                repeatCount="indefinite"
              />
            </>
          )}
        </linearGradient>
      </defs>

      <circle
        cx="24"
        cy="24"
        r="18"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      >
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 24 24"
            to="360 24 24"
            dur={`${rotationDuration}s`}
            repeatCount="indefinite"
          />
        )}
      </circle>

      <path
        d="M16 12 L16 36 M16 24 L30 12 M16 24 L30 36"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {!reduce && (
          <>
            <animate
              attributeName="stroke-dashoffset"
              values="60;0;60"
              dur={`${dashAnimationDuration}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-dasharray"
              values="0,100;30,100;0,100"
              dur={`${dashAnimationDuration}s`}
              repeatCount="indefinite"
            />
          </>
        )}
      </path>
    </svg>
  );
});

AnimatedLogo.displayName = 'AnimatedLogo';
export default memo(AnimatedLogo);