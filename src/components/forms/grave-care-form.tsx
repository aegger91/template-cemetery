"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { fetchBurialRecord } from "@/lib/burial-data";
import { useQueryParam } from "@/lib/use-location";
import { useSite } from "../site-context";
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

export function GraveCareForm({ tasks }: { tasks: { id: string; label: string }[] }) {
  const { t } = useSite();
  const { status, demo, send, reset } = useSubmit("grave-care");
  const [contact, setContact] = useState(emptyContact);
  const graveId = useQueryParam("grave");
  const [grave, setGrave] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("once");
  const [photo, setPhoto] = useState(true);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!graveId) return;
    fetchBurialRecord(graveId)
      .then((r) => r && setGrave(`${r.name.native}, ${t("search.location", { section: r.section, row: r.row, plot: r.plot })}`))
      .catch(() => {});
  }, [graveId, t]);

  if (status === "sent") return <FormSuccess title={t("forms.sentTitle")} text={t("forms.sentText")} demo={demo} onReset={reset} />;

  return (
    <FormCard className="max-w-3xl">
      <form
        noValidate
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const errs: Errors = { ...validateContact(contact, t) };
          if (!grave.trim()) errs.grave = t("forms.fieldRequired");
          if (!chosen.length) errs.tasks = t("care.selectTask");
          setErrors(errs);
          if (Object.values(errs).some(Boolean)) return;
          send({ ...contact, grave, graveId, tasks: chosen, frequency, photo, notes });
        }}
      >
        <Field id="gc-grave" label={t("forms.grave")} help={t("forms.graveHelp")} error={errors.grave} required>
          <Input
            id="gc-grave"
            value={grave}
            onChange={(e) => setGrave(e.target.value)}
            aria-invalid={!!errors.grave || undefined}
            aria-describedby={describedBy("gc-grave", t("forms.graveHelp"), errors.grave)}
            className={inputClass}
          />
        </Field>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{t("care.tasks")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {tasks.map((task) => (
              <Label
                key={task.id}
                htmlFor={`gc-task-${task.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-birch p-3.5 font-normal has-data-checked:border-green has-data-checked:bg-green-soft/50"
              >
                <Checkbox
                  id={`gc-task-${task.id}`}
                  checked={chosen.includes(task.id)}
                  onCheckedChange={(c) => setChosen(c ? [...chosen, task.id] : chosen.filter((x) => x !== task.id))}
                />
                {task.label}
              </Label>
            ))}
          </div>
          {errors.tasks && (
            <p className="text-sm font-semibold text-danger" role="alert">
              {errors.tasks}
            </p>
          )}
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[0.95rem] font-semibold text-ink">{t("care.frequency")}</legend>
          <RadioGroup value={frequency} onValueChange={(v) => setFrequency(String(v))} className="grid gap-2 sm:grid-cols-3">
            {["once", "seasonal", "yearly"].map((v) => (
              <Label key={v} htmlFor={`gc-f-${v}`} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-birch p-3.5 font-normal has-data-checked:border-green has-data-checked:bg-green-soft/50">
                <RadioGroupItem id={`gc-f-${v}`} value={v} />
                {t(`care.${v}`)}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        <Label htmlFor="gc-photo" className="flex cursor-pointer items-center gap-3 font-normal">
          <Checkbox id="gc-photo" checked={photo} onCheckedChange={(c) => setPhoto(!!c)} />
          {t("care.photoUpdate")}
        </Label>

        <ContactFields prefix="gc" values={contact} errors={errors} onChange={setContact} />

        <Field id="gc-notes" label={t("forms.notes")}>
          <Textarea id="gc-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-paper text-base" />
        </Field>

        <SubmitRow sending={status === "sending"} failed={status === "failed"} label={t("forms.send")} />
      </form>
    </FormCard>
  );
}
