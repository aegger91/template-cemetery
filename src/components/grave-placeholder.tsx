import { useId } from "react";
import { CrossShape } from "./orthodox-cross";
import { cn } from "@/lib/utils";

type Marker = "slavic-wood" | "slavic-stone" | "byzantine-stone";

/** A quiet drawn stand-in for a grave photograph. Only Orthodox cross forms are used. */
export function GravePlaceholder({ marker = "slavic-stone", seed = 0, className }: { marker?: Marker; seed?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const shift = (seed % 5) * 14;
  return (
    <svg viewBox="0 0 400 300" className={cn("block h-auto w-full", className)} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-paper)" />
          <stop offset="1" stopColor="var(--color-birch-deep)" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9EA19B" />
          <stop offset="1" stopColor="#6F736D" />
        </linearGradient>
        <linearGradient id={`${id}-marble`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBFAF6" />
          <stop offset="1" stopColor="#D9D8D1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <path d={`M0 190 C 80 ${160 + (seed % 3) * 6} 180 170 260 160 S 360 150 400 168 V300 H0 Z`} fill="var(--color-green-soft)" />
      {[40 + shift, 78 + shift, 318 - shift, 352 - shift].map((x, i) => (
        <g key={i} opacity={i % 2 ? 0.55 : 0.8}>
          <ellipse cx={x} cy={112 + (i % 2) * 14} rx={22} ry={40} fill="var(--color-moss)" opacity="0.35" />
          <rect x={x - 2.5} y={110 + (i % 2) * 14} width="5" height={86 - (i % 2) * 10} fill="#F4F2EC" />
          <rect x={x - 2.5} y={130 + (i % 2) * 14} width="5" height="3" fill="#4A4F49" />
          <rect x={x - 2.5} y={156 + (i % 2) * 14} width="3" height="2" fill="#4A4F49" />
        </g>
      ))}
      <path d="M0 222 C 120 206 280 206 400 222 V300 H0 Z" fill="var(--color-moss)" opacity="0.55" />
      <ellipse cx="200" cy="250" rx="92" ry="22" fill="#5E6B57" opacity="0.55" />

      {marker === "slavic-wood" && (
        <g>
          <g stroke="#3F4540" strokeWidth="3" fill="none" opacity="0.8">
            <path d="M104 262 V226 M296 262 V226 M104 232 H296 M104 252 H296" />
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${124 + i * 19.5} 262 V232`} />
            ))}
          </g>
          <polygon points="170,74 200,58 230,74 226,78 200,65 174,78" fill="#6A5A48" />
          <CrossShape x={200} y={66} height={176} fill="#7C6A55" />
        </g>
      )}

      {marker === "slavic-stone" && (
        <g>
          <path d="M152 250 V112 Q152 84 200 80 Q248 84 248 112 V250 Z" fill={`url(#${id}-stone)`} />
          <rect x="136" y="246" width="128" height="14" rx="2" fill="#5C605A" />
          <CrossShape x={200} y={104} height={110} fill="#4C504A" />
        </g>
      )}

      {marker === "byzantine-stone" && (
        <g>
          <rect x="120" y="236" width="160" height="26" rx="3" fill={`url(#${id}-marble)`} stroke="#C9C8C0" />
          <path d="M160 238 V120 Q160 98 200 96 Q240 98 240 120 V238 Z" fill={`url(#${id}-marble)`} stroke="#C9C8C0" />
          <CrossShape variant="byzantine" x={200} y={118} height={66} fill="var(--color-gold)" />
          <rect x="176" y="198" width="48" height="3" fill="#BDBCB4" />
          <rect x="184" y="208" width="32" height="3" fill="#BDBCB4" />
        </g>
      )}
    </svg>
  );
}
