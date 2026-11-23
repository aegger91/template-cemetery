"use client";

import { useState } from "react";
import { CheckCircle2Icon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isEmail, isPhoneComplete, maskPhone, submitForm, type FormId } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { useSite } from "../site-context";

export function Field({
  id,
  label,
  help,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useSite();
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={id} className="text-[0.95rem] font-semibold text-ink">
        {label}
        {!required && <span className="font-normal text-slate">({t("common.optional")})</span>}
      </Label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="text-sm text-slate">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, help?: string, error?: string) =>
  error ? `${id}-error` : help ? `${id}-help` : undefined;

export function PhoneInput({
  id,
  value,
  onChange,
  invalid,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  required?: boolean;
}) {
  const { t } = useSite();
  return (
    <Input
      id={id}
      name={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="(000)-000-0000"
      value={value}
      onChange={(e) => onChange(maskPhone(e.target.value))}
      aria-invalid={invalid || undefined}
      aria-required={required}
      aria-describedby={invalid ? `${id}-error` : `${id}-help`}
      maxLength={14}
      dir="ltr"
      className="h-11 bg-paper text-base"
      title={t("forms.phoneHelp")}
    />
  );
}

export const inputClass = "h-11 bg-paper text-base";

export type Errors = Record<string, string | undefined>;

export interface ContactValues {
  name: string;
  phone: string;
  email: string;
}

export const emptyContact: ContactValues = { name: "", phone: "", email: "" };

/** Name required, plus a phone or an email (either is enough, both are validated when filled). */
export function validateContact(v: ContactValues, t: (k: string) => string, phoneRequired = false): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = t("forms.fieldRequired");
  if (v.phone && !isPhoneComplete(v.phone)) e.phone = t("forms.phoneInvalid");
  if (phoneRequired && !v.phone) e.phone = t("forms.phoneInvalid");
  if (v.email && !isEmail(v.email)) e.email = t("forms.emailInvalid");
  if (!phoneRequired && !v.phone && !v.email) e.email = t("forms.emailInvalid");
  return e;
}

export function ContactFields({
  prefix,
  values,
  errors,
  onChange,
  phoneRequired = false,
}: {
  prefix: string;
  values: ContactValues;
  errors: Errors;
  onChange: (v: ContactValues) => void;
  phoneRequired?: boolean;
}) {
  const { t } = useSite();
  const set = (k: keyof ContactValues) => (v: string) => onChange({ ...values, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={`${prefix}-name`} label={t("forms.yourName")} error={errors.name} required className="sm:col-span-2">
        <Input
          id={`${prefix}-name`}
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          aria-invalid={!!errors.name || undefined}
          aria-describedby={describedBy(`${prefix}-name`, undefined, errors.name)}
          className={inputClass}
        />
      </Field>
      <Field id={`${prefix}-phone`} label={t("forms.phone")} help={t("forms.phoneHelp")} error={errors.phone} required={phoneRequired}>
        <PhoneInput id={`${prefix}-phone`} value={values.phone} onChange={set("phone")} invalid={!!errors.phone} required={phoneRequired} />
      </Field>
      <Field id={`${prefix}-email`} label={t("forms.email")} error={errors.email} required={!phoneRequired}>
        <Input
          id={`${prefix}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={describedBy(`${prefix}-email`, undefined, errors.email)}
          dir="ltr"
          className={inputClass}
        />
      </Field>
    </div>
  );
}

export function FormSuccess({ title, text, demo, onReset }: { title: string; text: string; demo: boolean; onReset: () => void }) {
  const { t } = useSite();
  return (
    <div className="grid justify-items-start gap-3 rounded-xl border border-green/20 bg-green-soft/50 p-6" role="status" aria-live="polite">
      <CheckCircle2Icon className="size-8 text-green" aria-hidden />
      <h3 className="font-heading text-2xl">{title}</h3>
      <p className="text-ink/85">{text}</p>
      {demo && <DemoNotice text={t("forms.demoNotice")} />}
      <Button variant="outline" onClick={onReset} className="mt-1">
        {t("forms.sendAnother")}
      </Button>
    </div>
  );
}

export function DemoNotice({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold-soft/30 px-3 py-2 text-sm text-ink">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
      {text}
    </p>
  );
}

/** Shared submit state for the plain request forms. */
export function useSubmit(form: FormId) {
  const { site, lang } = useSite();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [demo, setDemo] = useState(false);
  const send = async (data: Record<string, unknown>) => {
    setStatus("sending");
    try {
      const r = await submitForm(site.forms?.endpoint, form, lang, data);
      setDemo(r.demo);
      setStatus(r.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };
  return { status, demo, send, reset: () => setStatus("idle") };
}

export function FormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-paper p-5 sm:p-8", className)}>{children}</div>;
}

export function SubmitRow({ sending, label, failed }: { sending: boolean; label: string; failed: boolean }) {
  const { t } = useSite();
  return (
    <div className="grid gap-3">
      {failed && (
        <p className="text-sm font-semibold text-danger" role="alert">
          {t("forms.failed")}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" size="lg" disabled={sending} className="h-11 px-6 text-base">
          {sending ? t("forms.sending") : label}
        </Button>
        <p className="text-sm text-slate">{t("forms.privacy")}</p>
      </div>
    </div>
  );
}
