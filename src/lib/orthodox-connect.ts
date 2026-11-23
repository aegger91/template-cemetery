import type { SiteConfig } from "./types";

type Destination = "volunteer" | "newsletter" | "events";

/**
 * Placeholder deep links into the OrthodoxConnect app. The app link is tried first and the
 * web link is used when the app is not installed.
 * TODO(builder): replace the path scheme once OrthodoxConnect publishes its link format.
 */
export function connectLinks(config: SiteConfig["orthodoxConnect"], destination: Destination) {
  if (!config?.enabled) return null;
  const app = config.appLink ? `${config.appLink}/${destination}` : undefined;
  const web = config.webLink ? `${config.webLink}/${destination}` : undefined;
  return { app, web };
}

export function openDeepLink(app: string | undefined, web: string | undefined) {
  if (!app && web) {
    window.location.href = web;
    return;
  }
  if (!app) return;
  const timer = window.setTimeout(() => {
    if (web && document.visibilityState === "visible") window.location.href = web;
  }, 1200);
  window.addEventListener("pagehide", () => window.clearTimeout(timer), { once: true });
  window.location.href = app;
}
