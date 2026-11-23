export type FormId =
  | "service-request"
  | "commemoration"
  | "preplanning"
  | "grave-care"
  | "contact"
  | "newsletter";

export interface SubmitResult {
  ok: boolean;
  demo: boolean;
}

/**
 * Sends a form as JSON to the endpoint set in content/site.json (forms.endpoint).
 * The builder points this at OrthodoxConnect or any service that accepts
 * { form, language, data, submittedAt }. With no endpoint the site runs in demo mode
 * and nothing leaves the browser.
 */
export async function submitForm(
  endpoint: string | undefined,
  form: FormId,
  language: string,
  data: Record<string, unknown>,
): Promise<SubmitResult> {
  const payload = { form, language, data, submittedAt: new Date().toISOString() };
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 600));
    if (typeof window !== "undefined") console.info("[demo form]", payload);
    return { ok: true, demo: true };
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, demo: false };
}

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Formats up to 10 digits as (000)-000-0000 while the visitor types. */
export function maskPhone(input: string): string {
  const d = digitsOnly(input).slice(0, 10);
  if (!d) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)})-${d.slice(3)}`;
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`;
}

export const isPhoneComplete = (s: string) => /^\(\d{3}\)-\d{3}-\d{4}$/.test(s);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
