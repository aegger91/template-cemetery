"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { useFormatters, useSite } from "../site-context";

export function AmountPicker({
  id,
  amounts,
  value,
  onChange,
  legend,
  otherLabel,
  error,
}: {
  id: string;
  amounts: number[];
  value: number;
  onChange: (n: number) => void;
  legend: string;
  otherLabel: string;
  error?: string;
}) {
  const { lang } = useSite();
  const f = useFormatters();
  const [other, setOther] = useState(amounts.includes(value) ? "" : String(value || ""));
  const otherActive = !amounts.includes(value) || other !== "";
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{legend}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {amounts.map((a) => {
          const active = value === a && other === "";
          return (
            <button
              key={a}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setOther("");
                onChange(a);
              }}
              className={cn(
                "h-12 rounded-lg border font-heading text-xl tabular-nums transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                active ? "border-green bg-green text-paper" : "border-line bg-birch text-green hover:border-green/50",
              )}
            >
              {formatMoney(a, f.currency, lang)}
            </button>
          );
        })}
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-other`} className="text-sm text-slate">
          {otherLabel}
        </label>
        <Input
          id={`${id}-other`}
          inputMode="decimal"
          value={other}
          placeholder={formatMoney(0, f.currency, lang).replace(/0/, "")}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
            setOther(raw);
            onChange(raw ? Number(raw) || 0 : amounts[0] ?? 0);
          }}
          aria-invalid={!!error || undefined}
          className={cn("h-11 max-w-48 bg-paper text-base tabular-nums", otherActive && other && "border-green")}
          dir="ltr"
        />
        {error && (
          <p className="text-sm font-semibold text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}
