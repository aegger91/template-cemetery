"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isEmail, submitForm } from "@/lib/forms";
import { useSite } from "./site-context";

export function NewsletterForm() {
  const { t, lang, site } = useSite();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [invalid, setInvalid] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setInvalid(true);
      return;
    }
    setState("sending");
    try {
      const r = await submitForm(site.forms?.endpoint, "newsletter", lang, {
        email,
        organizationId: site.orthodoxConnect?.organizationId,
      });
      setState(r.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="text-paper">
        {t("footer.subscribed")}
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        {t("forms.email")}
      </label>
      <Input
        id="newsletter-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setInvalid(false);
        }}
        placeholder={t("footer.newsletterPlaceholder")}
        aria-invalid={invalid}
        aria-describedby={invalid ? "newsletter-error" : undefined}
        className="h-11 border-paper/25 bg-paper text-ink"
      />
      <Button type="submit" disabled={state === "sending"} className="h-11 bg-gold px-5 text-paper hover:bg-gold/90">
        {state === "sending" ? t("forms.sending") : t("footer.subscribe")}
      </Button>
      {invalid && (
        <p id="newsletter-error" className="text-sm text-gold-soft sm:sr-only">
          {t("forms.emailInvalid")}
        </p>
      )}
      {state === "error" && <p className="text-sm text-gold-soft">{t("forms.failed")}</p>}
    </form>
  );
}
