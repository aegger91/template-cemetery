"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { fetchBurialRecord } from "@/lib/burial-data";
import { useQueryParam } from "@/lib/use-location";
import { useCemeteryNow, useSite } from "../site-context";
import {
  ContactFields,
  describedBy,
  emptyContact,
  Field,
  FormCard,
  FormSuccess,
  inputClass,
  SubmitRow,
  useSubmit,
  validateContact,
  type Errors,
} from "./form-kit";

export function ServiceRequestForm() {
  const { t } = useSite();
  const now = useCemeteryNow();
  const { status, demo, send, reset } = useSubmit("service-request");
  const [contact, setContact] = useState(emptyContact);
  const graveId = useQueryParam("grave");
  const typeParam = useQueryParam("service");
  const [serviceChoice, setService] = useState<string | null>(null);
  const service = serviceChoice ?? (typeParam === "litiya" ? "litiya" : "panikhida");
  const [grave, setGrave] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [names, setNames] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!graveId) return;
    fetchBurialRecord(graveId)
      .then((r) => {
        if (!r) return;
        setGrave(`${r.name.native}, ${t("search.location", { section: r.section, row: r.row, plot: r.plot })}`);
        setNames((n) => n || r.name.native.split(" ")[0]);
      })
      .catch(() => {});
  }, [graveId, t]);

  if (status === "sent") return <FormSuccess title={t("forms.sentTitle")} text={t("forms.sentText")} demo={demo} onReset={reset} />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = { ...validateContact(contact, t, true) };
    if (!grave.trim()) errs.grave = t("forms.fieldRequired");
    if (!names.trim()) errs.names = t("forms.fieldRequired");
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      document.getElementById(`sr-${Object.keys(errs).find((k) => errs[k])}`)?.focus();
      return;
    }
    send({ ...contact, service, grave, graveId, date, time, names, notes });
  };

  return (
    <FormCard>
      <form onSubmit={submit} noValidate className="grid gap-6">
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{t("forms.serviceType")}</legend>
          <RadioGroup value={service} onValueChange={(v) => setService(String(v))} className="grid gap-3 sm:grid-cols-2">
            {["panikhida", "litiya"].map((v) => (
              <Label
                key={v}
                htmlFor={`sr-type-${v}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-birch p-4 has-data-checked:border-green has-data-checked:bg-green-soft/50"
              >
                <RadioGroupItem id={`sr-type-${v}`} value={v} />
                <span className="font-heading text-xl text-green">{t(`forms.${v}`)}</span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <Field id="sr-grave" label={t("forms.grave")} help={t("forms.graveHelp")} error={errors.grave} required>
          <Input
            id="sr-grave"
            value={grave}
            onChange={(e) => setGrave(e.target.value)}
            aria-invalid={!!errors.grave || undefined}
            aria-describedby={describedBy("sr-grave", t("forms.graveHelp"), errors.grave)}
            readOnly={false}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="sr-date" label={t("forms.date")}>
            <Input id="sr-date" type="date" min={now.date} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field id="sr-time" label={t("forms.time")}>
            <Input id="sr-time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <Field id="sr-names" label={t("forms.departedNames")} help={t("forms.departedNamesHelp")} error={errors.names} required>
          <Textarea
            id="sr-names"
            rows={3}
            value={names}
            onChange={(e) => setNames(e.target.value)}
            aria-invalid={!!errors.names || undefined}
            aria-describedby={describedBy("sr-names", t("forms.departedNamesHelp"), errors.names)}
            className="bg-paper text-base"
          />
        </Field>

        <ContactFields prefix="sr" values={contact} errors={errors} onChange={setContact} phoneRequired />

        <Field id="sr-notes" label={t("forms.notes")}>
          <Textarea id="sr-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-paper text-base" />
        </Field>

        <SubmitRow sending={status === "sending"} failed={status === "failed"} label={t("forms.send")} />
      </form>
    </FormCard>
  );
}
