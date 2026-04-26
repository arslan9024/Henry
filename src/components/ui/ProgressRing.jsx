import React from 'react';
import clsx from './clsx';

/**
 * ProgressRing — small circular progress indicator used in Disclosure
 * section headers to show "how complete is this section?" at a glance.
 *
 * Renders a 2-arc SVG: a faint track + a foreground arc whose length is
 * proportional to `value/max`. The numeric label is centered.
 *
 * Tone:
 *   'auto'    → green if 100%, amber if started, neutral if empty (default)
 *   'success' → always success-tinted
 *   'warning' → always warning-tinted
 *   'danger'  → always danger-tinted (use to signal validation errors)
 *   'neutral' → muted regardless of progress
 *
 * Sizes:
 *   'sm' → 24×24 px
 *   'md' → 32×32 px (default)
 *   'lg' → 48×48 px
 *
 * a11y: aria-valuenow / aria-valuemin / aria-valuemax via role=progressbar.
 *       The accessible label defaults to "Section progress" but consumers
 *       SHOULD pass a `label` prop ("Tenant details progress, 4 of 7").
 */
const SIZE_PX = { sm: 24, md: 32, lg: 48 };
const STROKE_PX = { sm: 3, md: 3.5, lg: 4 };
const FONT_PX = { sm: 8, md: 10, lg: 13 };

export default function ProgressRing({
  value,
  max = 100,
  tone = 'auto',
  size = 'md',
  label,
  showLabel = true,
  className,
  ...rest
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeVal = Math.max(0, Math.min(value ?? 0, safeMax));
  const ratio = safeVal / safeMax;
  const pct = Math.round(ratio * 100);

  const px = SIZE_PX[size] ?? SIZE_PX.md;
  const stroke = STROKE_PX[size] ?? STROKE_PX.md;
  const fontPx = FONT_PX[size] ?? FONT_PX.md;
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;
  // strokeDasharray = circumference; offset shrinks the foreground arc.
  const dash = c;
  const offset = c * (1 - ratio);

  const resolvedTone = tone === 'auto' ? (ratio >= 1 ? 'success' : ratio > 0 ? 'warning' : 'neutral') : tone;

  const accessibleLabel = label || 'Section progress';

  return (
    <span
      className={clsx('ui-progress-ring', className)}
      data-tone={resolvedTone}
      data-size={size}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={accessibleLabel}
      {...rest}
    >
      <svg
        className="ui-progress-ring__svg"
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="ui-progress-ring__track"
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="ui-progress-ring__bar"
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${px / 2} ${px / 2})`}
        />
      </svg>
      {showLabel && (
        <span className="ui-progress-ring__text" style={{ fontSize: fontPx }} aria-hidden="true">
          {/*
           * When the consumer passes a Y/X form (most common in Henry —
           * Disclosure section completion) we render that verbatim;
           * otherwise we fall back to a percentage.
           */}
          {value != null && max != null && max !== 100 ? `${value}/${max}` : `${pct}%`}
        </span>
      )}
    </span>
  );
}
