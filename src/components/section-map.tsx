"use client";

import { useMemo, useState } from "react";
import { MinusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Grounds, GroundsSection } from "@/lib/types";
import { CrossShape } from "./orthodox-cross";
import { useSite } from "./site-context";

export interface MapTarget {
  section: string;
  row: number;
  plot: number;
}

const PAD = 28;

function fit(grounds: Grounds, s: GroundsSection | undefined) {
  if (!s) return { k: 1, x: 0, y: 0 };
  const k = Math.min(grounds.width / (s.w + PAD * 2), grounds.height / (s.h + PAD * 2));
  const x = grounds.width / 2 - (s.x + s.w / 2) * k;
  const y = grounds.height / 2 - (s.y + s.h / 2) * k;
  return { k, x, y };
}

function Plots({ s, target, active }: { s: GroundsSection; target?: MapTarget; active: boolean }) {
  const cw = s.w / s.plotsPerRow;
  const ch = s.h / s.rows;
  const gap = Math.min(cw, ch) * 0.18;
  const cells = [];
  for (let r = 1; r <= s.rows; r++) {
    for (let p = 1; p <= s.plotsPerRow; p++) {
      const isTarget = target?.section === s.id && target.row === r && target.plot === p;
      cells.push(
        <rect
          key={`${r}-${p}`}
          x={s.x + (p - 1) * cw + gap / 2}
          y={s.y + (r - 1) * ch + gap / 2}
          width={cw - gap}
          height={ch - gap}
          rx={Math.min(cw, ch) * 0.12}
          className={cn(isTarget ? "fill-gold" : active ? "fill-paper/90" : "fill-paper/45")}
        />,
      );
    }
  }
  return <g aria-hidden>{cells}</g>;
}

function TargetMarker({ s, target, k }: { s: GroundsSection; target: MapTarget; k: number }) {
  const cw = s.w / s.plotsPerRow;
  const ch = s.h / s.rows;
  const cx = s.x + (target.plot - 0.5) * cw;
  const cy = s.y + (target.row - 0.5) * ch;
  const r = Math.min(cw, ch) * 0.8 + 6 / k;
  return (
    <g aria-hidden>
      <circle cx={cx} cy={cy} r={r} className="map-pulse fill-none stroke-gold" strokeWidth={2.2 / k} />
      <g transform={`translate(${cx} ${cy - r - 26 / k})`}>
        <path d={`M0 ${20 / k} L${-7 / k} ${8 / k} A ${9 / k} ${9 / k} 0 1 1 ${7 / k} ${8 / k} Z`} className="fill-green" />
        <circle cx={0} cy={2 / k} r={3.2 / k} className="fill-gold-soft" />
      </g>
    </g>
  );
}

function Landmarks({ grounds, label }: { grounds: Grounds; label: (l: GroundsSection["name"]) => string }) {
  return (
    <g>
      {grounds.landmarks?.map((m) => {
        const cx = m.x + m.w / 2;
        const text = (
          <text x={cx} y={m.y + m.h + 20} textAnchor="middle" className="fill-slate text-[17px] max-sm:hidden" style={{ fontFamily: "var(--tk-font-body)" }}>
            {label(m.label)}
          </text>
        );
        if (m.kind === "chapel")
          return (
            <g key={m.id}>
              <rect x={m.x} y={m.y + 30} width={m.w} height={m.h - 30} rx={4} className="fill-paper stroke-green" strokeWidth={2} />
              <path d={`M${m.x - 6} ${m.y + 34} L${cx} ${m.y + 4} L${m.x + m.w + 6} ${m.y + 34} Z`} className="fill-green" />
              <svg x={cx - 9} y={m.y - 26} width={18} height={30} viewBox="0 0 60 100" overflow="visible">
                <CrossShape x={30} y={0} height={100} fill="var(--color-gold)" />
              </svg>
              <rect x={cx - 9} y={m.y + m.h - 26} width={18} height={26} rx={9} className="fill-green-mid" />
              <text x={cx} y={m.y + m.h + 22} textAnchor="middle" className="fill-green text-[19px] font-semibold" style={{ fontFamily: "var(--tk-font-heading)" }}>
                {label(m.label)}
              </text>
            </g>
          );
        if (m.kind === "gate")
          return (
            <g key={m.id}>
              <rect x={m.x} y={m.y} width={8} height={m.h} className="fill-slate" />
              <rect x={m.x + m.w - 8} y={m.y} width={8} height={m.h} className="fill-slate" />
              <path d={`M${m.x + 8} ${m.y + 6} Q ${cx} ${m.y - 6} ${m.x + m.w - 8} ${m.y + 6}`} className="fill-none stroke-slate" strokeWidth={3} />
              <text x={cx} y={m.y - 10} textAnchor="middle" className="fill-slate text-[17px] max-sm:hidden" style={{ fontFamily: "var(--tk-font-body)" }}>
                {label(m.label)}
              </text>
            </g>
          );
        if (m.kind === "parking")
          return (
            <g key={m.id}>
              <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6} className="fill-stone/70" />
              {Array.from({ length: Math.floor(m.w / 30) - 1 }, (_, i) => (
                <rect key={i} x={m.x + 30 * (i + 1)} y={m.y + 6} width={2} height={m.h / 2 - 6} className="fill-paper" />
              ))}
              <text x={cx} y={m.y + m.h / 2 + 22} textAnchor="middle" className="fill-slate text-[17px]" style={{ fontFamily: "var(--tk-font-body)" }}>
                {label(m.label)}
              </text>
            </g>
          );
        if (m.kind === "water")
          return (
            <g key={m.id}>
              <circle cx={cx} cy={m.y + m.h / 2} r={m.w / 2} className="fill-[#C9D9DD] stroke-[#8EAAB1]" strokeWidth={2} />
              {text}
            </g>
          );
        return (
          <g key={m.id}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={4} className="fill-stone-deep/60" />
            {text}
          </g>
        );
      })}
    </g>
  );
}

export function SectionMap({ grounds, target, className }: { grounds: Grounds; target?: MapTarget; className?: string }) {
  const { t, L } = useSite();
  const [selected, setSelected] = useState<string | null>(target?.section ?? null);
  const current = grounds.sections.find((s) => s.id === selected);
  const view = useMemo(() => fit(grounds, current), [grounds, current]);
  const label = (l: GroundsSection["name"]) => L(l);

  const birches = useMemo(() => {
    const pts: [number, number][] = [];
    for (let y = 175; y < 600; y += 34) pts.push([478, y], [522, y]);
    for (let x = 70; x < 940; x += 46) if (x < 470 || x > 530) pts.push([x, 352], [x, 172]);
    return pts;
  }, []);

  return (
    <div className={cn("grid gap-5 lg:grid-cols-[1fr_19rem]", className)}>
      <div className="relative overflow-hidden rounded-xl border border-line bg-[#E6EADF]" dir="ltr">
        <svg
          viewBox={`0 0 ${grounds.width} ${grounds.height}`}
          className="block h-auto w-full touch-manipulation select-none"
          role="group"
          aria-label={t("map.title")}
        >
          <g
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
              transformOrigin: "0 0",
              transition: "transform var(--motion-duration) var(--motion-easing)",
            }}
          >
            <rect x={10} y={10} width={grounds.width - 20} height={grounds.height - 20} rx={26} className="fill-[#DCE3D4] stroke-[#B8C2AE]" strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
            <rect x={482} y={150} width={36} height={grounds.height - 160} className="fill-[#EFEBE0]" />
            <rect x={40} y={346} width={grounds.width - 80} height={14} className="fill-[#EFEBE0]" />
            <rect x={40} y={166} width={grounds.width - 80} height={10} className="fill-[#EFEBE0]" />
            {birches.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={5.5} className="fill-moss/45" />
            ))}

            <Landmarks grounds={grounds} label={label} />

            {grounds.sections.map((s) => {
              const isSel = s.id === selected;
              const open = (s.availablePlots ?? 0) > 0;
              return (
                <g
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={`${L(s.name)}. ${open ? t("map.available", { count: s.availablePlots ?? 0 }) : t("map.noneAvailable")}`}
                  onClick={() => setSelected(isSel ? null : s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(isSel ? null : s.id);
                    }
                  }}
                  className="group cursor-pointer outline-none"
                >
                  <rect
                    x={s.x - 6}
                    y={s.y - 6}
                    width={s.w + 12}
                    height={s.h + 12}
                    rx={10}
                    className={cn(
                      "transition-colors duration-200",
                      isSel ? "fill-green-mid" : "fill-green/80 group-hover:fill-green-mid",
                      "group-focus-visible:stroke-gold",
                    )}
                    strokeWidth={4}
                  />
                  <Plots s={s} target={target} active={isSel} />
                  {open && !isSel && (
                    <g aria-hidden>
                      <circle cx={s.x + s.w - 4} cy={s.y + 4} r={15} className="fill-gold" />
                      <text x={s.x + s.w - 4} y={s.y + 10} textAnchor="middle" className="fill-ink text-[16px] font-bold" style={{ fontFamily: "var(--tk-font-body)" }}>
                        {s.availablePlots}
                      </text>
                    </g>
                  )}
                  {!isSel && (
                    <g aria-hidden className="pointer-events-none">
                      <circle cx={s.x + s.w / 2} cy={s.y + s.h / 2} r={Math.min(34, s.h / 2 - 4)} className="fill-green" opacity={0.88} />
                      <text
                        x={s.x + s.w / 2}
                        y={s.y + s.h / 2}
                        dy="0.35em"
                        textAnchor="middle"
                        className="fill-paper text-[42px]"
                        style={{ fontFamily: "var(--tk-font-heading)" }}
                      >
                        {s.id}
                      </text>
                    </g>
                  )}
                  {isSel && (
                    <g aria-hidden className="pointer-events-none" style={{ fontFamily: "var(--tk-font-body)" }}>
                      {Array.from({ length: s.rows }, (_, r) => (
                        <text key={r} x={s.x - 12 / view.k} y={s.y + (r + 0.5) * (s.h / s.rows)} dy="0.35em" textAnchor="end" className="fill-slate" fontSize={22 / view.k}>
                          {r + 1}
                        </text>
                      ))}
                      {Array.from({ length: s.plotsPerRow }, (_, p) =>
                        (p + 1) % 5 === 0 || p === 0 ? (
                          <text key={p} x={s.x + (p + 0.5) * (s.w / s.plotsPerRow)} y={s.y - 12 / view.k} textAnchor="middle" className="fill-slate" fontSize={22 / view.k}>
                            {p + 1}
                          </text>
                        ) : null,
                      )}
                    </g>
                  )}
                </g>
              );
            })}

            {target && current?.id === target.section && <TargetMarker s={current} target={target} k={view.k} />}
          </g>

          <g transform={`translate(${grounds.width - 50} 50)`} aria-hidden>
            <circle r={24} className="fill-paper/85" />
            <path d="M0 -17 L7 6 L0 2 L-7 6 Z" className="fill-green" />
            <text y={19} textAnchor="middle" className="fill-green text-[12px] font-bold" style={{ fontFamily: "var(--tk-font-body)" }}>
              N
            </text>
          </g>
        </svg>

        {current && (
          <Button size="sm" variant="outline" onClick={() => setSelected(null)} className="absolute start-3 top-3 gap-1.5 bg-paper/95 shadow-sm">
            <MinusIcon className="size-4" aria-hidden />
            {t("map.wholeCemetery")}
          </Button>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-line bg-paper p-5" aria-live="polite">
          {current ? (
            <>
              <h3 className="font-heading text-2xl">{L(current.name)}</h3>
              {current.description ? <p className="mt-1 text-[0.95rem] text-slate">{L(current.description)}</p> : null}
              <p className="mt-3 text-sm text-ink/80">{t("map.rowsPlots", { rows: current.rows, plots: current.plotsPerRow })}</p>
              <p className={cn("mt-1 text-sm font-semibold", (current.availablePlots ?? 0) > 0 ? "text-green" : "text-slate")}>
                {(current.availablePlots ?? 0) > 0 ? t("map.available", { count: current.availablePlots ?? 0 }) : t("map.noneAvailable")}
              </p>
              {target && target.section === current.id && (
                <p className="mt-3 rounded-lg bg-gold-soft/40 p-3 text-sm text-ink">{t("map.highlighted", { section: target.section, row: target.row, plot: target.plot })}</p>
              )}
            </>
          ) : (
            <>
              <h3 className="font-heading text-2xl">{t("map.selectSection")}</h3>
              <p className="mt-1 text-[0.95rem] text-slate">{t("map.zoomHint")}</p>
            </>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3" role="group" aria-label={t("map.selectSection")}>
          {grounds.sections.map((s) => (
            <Button
              key={s.id}
              variant={s.id === selected ? "default" : "outline"}
              onClick={() => setSelected(s.id === selected ? null : s.id)}
              aria-pressed={s.id === selected}
              className="h-11 font-heading text-lg"
              aria-label={L(s.name)}
            >
              {s.id}
              {target?.section === s.id && <span className="size-2 rounded-full bg-gold" aria-hidden />}
            </Button>
          ))}
        </div>
        <ul className="grid gap-2 text-sm text-slate">
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-sm bg-green" aria-hidden />
            {t("map.legendPlot")}
          </li>
          {target && (
            <li className="flex items-center gap-2">
              <span className="size-3.5 rounded-sm bg-gold" aria-hidden />
              {t("map.legendTarget")}
            </li>
          )}
          <li className="flex items-center gap-2">
            <span className="grid size-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-ink" aria-hidden>
              2
            </span>
            {t("map.legendAvailable")}
          </li>
        </ul>
      </aside>
    </div>
  );
}
