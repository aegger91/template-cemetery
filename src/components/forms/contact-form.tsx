"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useSite } from "../site-context";
import { ContactFields, describedBy, emptyContact, Field, FormCard, FormSuccess, SubmitRow, useSubmit, validateContact, type Errors } from "./form-kit";

export function ContactForm() {
  const { t } = useSite();
  const { status, demo, send, reset } = useSubmit("contact");
  const [contact, setContact] = useState(emptyContact);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  if (status === "sent") return <FormSuccess title={t("forms.sentTitle")} text={t("forms.sentText")} demo={demo} onReset={reset} />;

  return (
    <FormCard>
      <form
        noValidate
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          const errs: Errors = { ...validateContact(contact, t) };
          if (!message.trim()) errs.message = t("forms.fieldRequired");
          setErrors(errs);
          if (Object.values(errs).some(Boolean)) return;
          send({ ...contact, message });
        }}
      >
        <ContactFields prefix="ct" values={contact} errors={errors} onChange={setContact} />
        <Field id="ct-message" label={t("forms.message")} error={errors.message} required>
          <Textarea
            id="ct-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={!!errors.message || undefined}
            aria-describedby={describedBy("ct-message", undefined, errors.message)}
            className="bg-paper text-base"
          />
        </Field>
        <SubmitRow sending={status === "sending"} failed={status === "failed"} label={t("forms.send")} />
      </form>
    </FormCard>
  );
}
