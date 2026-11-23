"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSite } from "../site-context";
import { ContactFields, emptyContact, Field, FormCard, FormSuccess, SubmitRow, useSubmit, validateContact, type Errors } from "./form-kit";

export function PreplanningForm({ sections }: { sections: { id: string; name: string }[] }) {
  const { t } = useSite();
  const { status, demo, send, reset } = useSubmit("preplanning");
  const [contact, setContact] = useState(emptyContact);
  const [timeframe, setTimeframe] = useState("future");
  const [plots, setPlots] = useState("2");
  const [section, setSection] = useState("any");
  const [questions, setQuestions] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  if (status === "sent") return <FormSuccess title={t("forms.sentTitle")} text={t("forms.sentText")} demo={demo} onReset={reset} />;

  const sectionItems = [{ value: "any", label: t("plots.noPreference") }, ...sections.map((s) => ({ value: s.id, label: s.name }))];
  const plotItems = ["1", "2", "3", "4"].map((v) => ({ value: v, label: v }));

  return (
    <FormCard className="max-w-3xl">
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const errs = validateContact(contact, t);
          setErrors(errs);
          if (Object.values(errs).some(Boolean)) return;
          send({ ...contact, timeframe, plots, section, questions });
        }}
      >
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{t("plots.timeframe")}</legend>
          <RadioGroup value={timeframe} onValueChange={(v) => setTimeframe(String(v))} className="grid gap-2">
            {[
              ["now", t("plots.timeframeNow")],
              ["year", t("plots.timeframeYear")],
              ["future", t("plots.timeframeFuture")],
            ].map(([v, label]) => (
              <Label key={v} htmlFor={`pp-tf-${v}`} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-birch p-3.5 font-normal has-data-checked:border-green has-data-checked:bg-green-soft/50">
                <RadioGroupItem id={`pp-tf-${v}`} value={v} />
                {label}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="pp-plots" label={t("plots.numberOfPlots")} required>
            <Select items={plotItems} value={plots} onValueChange={(v) => setPlots(String(v))}>
              <SelectTrigger id="pp-plots" className="h-11! w-full bg-paper text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plotItems.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="pp-section" label={t("plots.preferredSection")} required>
            <Select items={sectionItems} value={section} onValueChange={(v) => setSection(String(v))}>
              <SelectTrigger id="pp-section" className="h-11! w-full bg-paper text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectionItems.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <ContactFields prefix="pp" values={contact} errors={errors} onChange={setContact} />

        <Field id="pp-questions" label={t("plots.questions")}>
          <Textarea id="pp-questions" rows={4} value={questions} onChange={(e) => setQuestions(e.target.value)} className="bg-paper text-base" />
        </Field>

        <SubmitRow sending={status === "sending"} failed={status === "failed"} label={t("forms.send")} />
      </form>
    </FormCard>
  );
}
