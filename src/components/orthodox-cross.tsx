import geometry from "./cross-geometry.json";
import { cn } from "@/lib/utils";

export type CrossVariant = keyof typeof geometry;

interface CrossProps extends React.SVGProps<SVGSVGElement> {
  variant?: CrossVariant;
  title?: string;
}

/** The one cross used across the site. Never replace it with the Unicode cross character or a Latin cross. */
export function OrthodoxCross({ variant = "slavic", title, className, ...rest }: CrossProps) {
  const g = geometry[variant];
  return (
    <svg
      viewBox={g.viewBox}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
      fill="currentColor"
      {...rest}
    >
      {g.rects.map((r, i) => (
        <rect key={i} {...r} />
      ))}
      {g.polygons.map((p, i) => (
        <polygon key={i} points={p} />
      ))}
    </svg>
  );
}

/** Same geometry as an SVG group, for placing a cross inside a larger drawing. */
export function CrossShape({
  variant = "slavic",
  x,
  y,
  height,
  fill = "currentColor",
}: {
  variant?: CrossVariant;
  x: number;
  y: number;
  height: number;
  fill?: string;
}) {
  const g = geometry[variant];
  const [, , vw, vh] = g.viewBox.split(" ").map(Number);
  const s = height / vh;
  return (
    <g transform={`translate(${x - (vw * s) / 2} ${y}) scale(${s})`} fill={fill}>
      {g.rects.map((r, i) => (
        <rect key={i} {...r} />
      ))}
      {g.polygons.map((p, i) => (
        <polygon key={i} points={p} />
      ))}
    </g>
  );
}
