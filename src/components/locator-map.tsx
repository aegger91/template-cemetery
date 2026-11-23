import { ExternalLinkIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CrossShape } from "./orthodox-cross";

/**
 * Shows the map from site.json contact.mapEmbedUrl when one is set (for example an
 * OpenStreetMap embed). Without it, a drawn locator stands in so no third party loads.
 */
export function LocatorMap({
  embedUrl,
  directionsUrl,
  label,
  openLabel,
  name,
}: {
  embedUrl?: string;
  directionsUrl?: string;
  label: string;
  openLabel: string;
  name: string;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-paper">
      {embedUrl ? (
        <iframe src={embedUrl} title={label} loading="lazy" className="aspect-[4/3] w-full border-0" referrerPolicy="no-referrer" />
      ) : (
        <svg viewBox="0 0 400 260" className="block h-auto w-full" role="img" aria-label={label}>
          <rect width="400" height="260" fill="#E9ECE3" />
          <path d="M0 70 C 120 60 220 110 400 90" stroke="#FFFEFB" strokeWidth="16" fill="none" />
          <path d="M0 70 C 120 60 220 110 400 90" stroke="#D8D8D2" strokeWidth="1" fill="none" />
          <path d="M150 0 C 160 90 170 170 140 260" stroke="#FFFEFB" strokeWidth="12" fill="none" />
          <path d="M290 260 C 280 200 250 150 262 96" stroke="#FFFEFB" strokeWidth="9" fill="none" />
          <rect x="200" y="120" width="150" height="100" rx="14" fill="#DCE5DC" stroke="#6E8A70" strokeDasharray="3 5" strokeWidth="2" />
          {[220, 245, 270, 295, 320].map((x) =>
            [138, 162, 186].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#6E8A70" opacity="0.45" />),
          )}
          <path d="M0 210 C 60 200 90 230 120 260 L0 260 Z" fill="#C9D9DD" />
          <g transform="translate(275 150)">
            <path d="M0 26 L-12 6 A 15 15 0 1 1 12 6 Z" fill="#1F3B2E" />
            <svg x="-5" y="-12" width="10" height="17" viewBox="0 0 60 100">
              <CrossShape x={30} y={0} height={100} fill="#D9C9A0" />
            </svg>
          </g>
          <text x="275" y="236" textAnchor="middle" fontSize="13" fill="#1F3B2E" style={{ fontFamily: "var(--tk-font-heading)" }}>
            {name}
          </text>
        </svg>
      )}
      {directionsUrl && (
        <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="text-sm text-slate">{label}</span>
          <a href={directionsUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
            {openLabel}
            <ExternalLinkIcon className="size-3.5" aria-hidden />
          </a>
        </figcaption>
      )}
    </figure>
  );
}
