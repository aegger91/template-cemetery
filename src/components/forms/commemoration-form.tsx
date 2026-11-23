"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitForm } from "@/lib/forms";
import { formatMoney, getPaymentProvider } from "@/lib/payments";
import { useFormatters, useSite } from "../site-context";
import { OrthodoxCross } from "../orthodox-cross";
import { AmountPicker } from "./amount-picker";
import { ContactFields, DemoNotice, emptyContact, FormCard, FormSuccess, validateContact, type Errors } from "./form-kit";

const MAX_NAMES = 10;

export function CommemorationForm({
  amounts,
  candlePrice,
  lampadaPrice,
  fundId,
}: {
  amounts: number[];
  candlePrice: number;
  lampadaPrice: number;
  fundId: string;
}) {
  const { t, site, lang } = useSite();
  const f = useFormatters();
  const provider = getPaymentProvider(site.payments?.provider);
  const [names, setNames] = useState<string[]>(["", "", ""]);
  const [offering, setOffering] = useState(0);
  const [light, setLight] = useState("none");
  const [contact, setContact] = useState(emptyContact);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [demo, setDemo] = useState(false);

  const lightPrice = light === "candle" ? candlePrice : light === "lampada" ? lampadaPrice : 0;
  const total = (provider ? offering : 0) + (provider ? lightPrice : 0);
  const money = (n: number) => formatMoney(n, f.currency, lang);

  if (status === "sent")
    return (
      <FormSuccess
        title={t("commemoration.sentTitle")}
        text={t("commemoration.sentText")}
        demo={demo}
        onReset={() => {
          setNames(["", "", ""]);
          setStatus("idle");
        }}
      />
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filled = names.map((n) => n.trim()).filter(Boolean);
    const errs: Errors = { ...validateContact(contact, t) };
    if (!filled.length) errs.names = t("forms.fieldRequired");
    if (offering < 0 || Number.isNaN(offering)) errs.offering = t("donate.amountInvalid");
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setStatus("sending");
    try {
      let paymentDemo = false;
      if (provider && total > 0) {
        const r = await provider.pay({
          fundId,
          amount: total,
          currency: f.currency,
          frequency: "once",
          donor: { name: contact.name, email: contact.email },
          purpose: "commemoration",
          metadata: { light },
        });
        if (r.status === "failed") throw new Error("payment failed");
        paymentDemo = r.demo;
      }
      const sent = await submitForm(site.forms?.endpoint, "commemoration", lang, { names: filled, light, offering, total, fundId, ...contact });
      setDemo(sent.demo || paymentDemo);
      setStatus(sent.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-paper p-5 shadow-[0_20px_40px_-34px_rgb(31_59_46/0.6)] sm:p-8">
        <div className="mb-5 flex flex-col items-center gap-2 border-b border-line pb-5 text-center">
          <OrthodoxCross className="h-10 text-gold" />
          <p className="font-heading text-2xl text-green">{t("commemoration.forRepose")}</p>
        </div>
        <fieldset className="grid gap-3">
          <legend className="sr-only">{t("commemoration.namesHeading")}</legend>
          <ol className="grid gap-2.5">
            {names.map((n, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-end font-heading text-lg text-gold tabular-nums" aria-hidden>
                  {i + 1}
                </span>
                <Label htmlFor={`cm-name-${i}`} className="sr-only">
                  {t("commemoration.nameN", { n: i + 1 })}
                </Label>
                <Input
                  id={`cm-name-${i}`}
                  value={n}
                  autoComplete="off"
                  onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
                  aria-invalid={(!!errors.names && i === 0) || undefined}
                  className="h-11 border-0 border-b border-line bg-transparent font-heading text-xl shadow-none focus-visible:border-green focus-visible:ring-0 rounded-none px-1"
                />
                {names.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setNames(names.filter((_, j) => j !== i))}
                    aria-label={t("commemoration.removeName", { n: i + 1 })}
                    className="shrink-0 text-slate"
                  >
                    <XIcon />
                  </Button>
                )}
              </li>
            ))}
          </ol>
          {errors.names && (
            <p className="text-sm font-semibold text-danger" role="alert">
              {errors.names}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" disabled={names.length >= MAX_NAMES} onClick={() => setNames([...names, ""])} className="gap-1.5">
              <PlusIcon aria-hidden />
              {t("commemoration.addName")}
            </Button>
            <span className="text-sm text-slate">{t("commemoration.maxNames")}</span>
          </div>
        </fieldset>
      </div>

      <FormCard className="grid gap-6">
        {provider ? (
          <>
            <AmountPicker
              id="cm-offering"
              amounts={amounts}
              value={offering}
              onChange={setOffering}
              legend={t("commemoration.offering")}
              otherLabel={t("commemoration.otherAmount")}
              error={errors.offering}
            />
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{t("commemoration.light")}</legend>
              <RadioGroup value={light} onValueChange={(v) => setLight(String(v))} className="grid gap-2">
                {[
                  { v: "none", label: t("commemoration.none") },
                  { v: "candle", label: t("commemoration.candle", { price: money(candlePrice) }), help: t("commemoration.candleHelp") },
                  { v: "lampada", label: t("commemoration.lampada", { price: money(lampadaPrice) }), help: t("commemoration.lampadaHelp") },
                ].map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={`cm-light-${o.v}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-birch p-3.5 font-normal has-data-checked:border-green has-data-checked:bg-green-soft/50"
                  >
                    <RadioGroupItem id={`cm-light-${o.v}`} value={o.v} className="mt-0.5" />
                    <span className="grid gap-0.5">
                      <span className="font-semibold text-ink">{o.label}</span>
                      {o.help && <span className="text-sm text-slate">{o.help}</span>}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>
          </>
        ) : (
          <DemoNotice text={t("donate.notConnected")} />
        )}

        <ContactFields prefix="cm" values={contact} errors={errors} onChange={setContact} />

        <div className="grid gap-3 border-t border-line pt-5">
          {provider && (
            <p className="flex items-baseline justify-between gap-4 font-heading text-2xl text-green">
              <span>{t("commemoration.total")}</span>
              <span className="tabular-nums">{money(total)}</span>
            </p>
          )}
          {status === "failed" && (
            <p className="text-sm font-semibold text-danger" role="alert">
              {t("forms.failed")}
            </p>
          )}
          <Button type="submit" size="lg" disabled={status === "sending"} className="h-12 text-base">
            {status === "sending" ? t("donate.processing") : provider && total > 0 ? t("commemoration.submit", { amount: money(total) }) : t("forms.send")}
          </Button>
          {provider?.id === "demo" && <p className="text-sm text-slate">{t("donate.demoPayment")}</p>}
          {provider && provider.id !== "demo" && <p className="text-sm text-slate">{t("donate.secure")}</p>}
        </div>
      </FormCard>
    </form>
  );
}
