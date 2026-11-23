"use client";

import { useState } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatMoney, getPaymentProvider } from "@/lib/payments";
import { isEmail } from "@/lib/forms";
import { useQueryParam } from "@/lib/use-location";
import { useFormatters, useSite } from "../site-context";
import { AmountPicker } from "./amount-picker";
import { DemoNotice, describedBy, Field, FormCard, inputClass, type Errors } from "./form-kit";

interface FundOption {
  id: string;
  name: string;
  description: string;
}

export function DonateForm({ funds, amounts }: { funds: FundOption[]; amounts: number[] }) {
  const { t, site, lang } = useSite();
  const f = useFormatters();
  const provider = getPaymentProvider(site.payments?.provider);
  const preset = useQueryParam("fund");
  const [fundChoice, setFund] = useState<string | null>(null);
  const fund = fundChoice ?? (preset && funds.some((x) => x.id === preset) ? preset : (funds[0]?.id ?? ""));
  const [amount, setAmount] = useState(amounts[1] ?? amounts[0] ?? 0);
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [memory, setMemory] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "failed">("idle");
  const [demo, setDemo] = useState(false);

  const money = formatMoney(amount || 0, f.currency, lang);
  const chosen = funds.find((x) => x.id === fund);

  if (status === "done")
    return (
      <div className="grid max-w-2xl justify-items-start gap-3 rounded-xl border border-green/20 bg-green-soft/50 p-6" role="status">
        <CheckCircle2Icon className="size-8 text-green" aria-hidden />
        <h3 className="font-heading text-2xl">{t("donate.thanksTitle")}</h3>
        <p>
          {money} · {chosen?.name}
        </p>
        <p className="text-ink/85">{t("donate.thanksText")}</p>
        {demo && <DemoNotice text={t("donate.demoPayment")} />}
        <Button variant="outline" onClick={() => setStatus("idle")}>
          {t("forms.sendAnother")}
        </Button>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    const errs: Errors = {};
    if (!(amount >= 1)) errs.amount = t("donate.amountInvalid");
    if (!name.trim()) errs.name = t("forms.fieldRequired");
    if (!isEmail(email)) errs.email = t("forms.emailInvalid");
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setStatus("processing");
    try {
      const r = await provider.pay({
        fundId: fund,
        amount,
        currency: f.currency,
        frequency,
        donor: { name, email },
        inMemoryOf: memory || undefined,
        purpose: "donation",
      });
      setDemo(r.demo);
      setStatus(r.status === "failed" ? "failed" : "done");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
      <fieldset className="grid gap-3">
        <legend className="mb-3 font-heading text-2xl text-green">{t("donate.chooseFund")}</legend>
        <RadioGroup value={fund} onValueChange={(v) => setFund(String(v))} className="grid gap-3">
          {funds.map((x) => (
            <Label
              key={x.id}
              htmlFor={`fund-${x.id}`}
              className="flex cursor-pointer items-start gap-3.5 rounded-xl border border-line bg-paper p-4 font-normal transition-colors has-data-checked:border-green has-data-checked:bg-green-soft/40 sm:p-5"
            >
              <RadioGroupItem id={`fund-${x.id}`} value={x.id} className="mt-1" />
              <span className="grid gap-1">
                <span className="font-heading text-xl leading-snug text-green">{x.name}</span>
                {x.description && <span className="text-[0.95rem] text-slate">{x.description}</span>}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <FormCard className="grid gap-6">
        {!provider ? (
          <DemoNotice text={t("donate.notConnected")} />
        ) : (
          <>
            <AmountPicker id="dn-amount" amounts={amounts} value={amount} onChange={setAmount} legend={t("donate.amount")} otherLabel={t("donate.otherAmount")} error={errors.amount} />

            <fieldset>
              <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{t("donate.frequency")}</legend>
              <div className="inline-grid grid-cols-2 rounded-lg border border-line bg-birch p-1">
                {(["once", "monthly"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={frequency === v}
                    onClick={() => setFrequency(v)}
                    className={
                      frequency === v
                        ? "rounded-md bg-green px-4 py-2 text-sm font-semibold text-paper"
                        : "rounded-md px-4 py-2 text-sm font-semibold text-green hover:bg-green-soft/60"
                    }
                  >
                    {v === "once" ? t("donate.oneTime") : t("donate.monthly")}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field id="dn-memory" label={t("donate.inMemory")} help={t("donate.inMemoryHelp")}>
              <Input id="dn-memory" value={memory} onChange={(e) => setMemory(e.target.value)} aria-describedby="dn-memory-help" className={inputClass} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="dn-name" label={t("donate.donorName")} error={errors.name} required>
                <Input
                  id="dn-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={describedBy("dn-name", undefined, errors.name)}
                  className={inputClass}
                />
              </Field>
              <Field id="dn-email" label={t("forms.email")} error={errors.email} required>
                <Input
                  id="dn-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={describedBy("dn-email", undefined, errors.email)}
                  dir="ltr"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-3 border-t border-line pt-5">
              {status === "failed" && (
                <p className="text-sm font-semibold text-danger" role="alert">
                  {t("forms.failed")}
                </p>
              )}
              <Button type="submit" size="lg" disabled={status === "processing"} className="h-12 bg-gold text-base text-ink hover:bg-gold-soft">
                {status === "processing" ? t("donate.processing") : t("donate.submit", { amount: money })}
              </Button>
              <p className="text-sm text-slate">{provider.id === "demo" ? t("donate.demoPayment") : t("donate.secure")}</p>
            </div>
          </>
        )}
      </FormCard>
    </form>
  );
}
