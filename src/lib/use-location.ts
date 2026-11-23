import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};

/** location.search on the client, null while rendering on the server or hydrating. */
export function useLocationSearch(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null,
  );
}

export function useQueryParam(name: string): string | null {
  const search = useLocationSearch();
  return search === null ? null : new URLSearchParams(search).get(name);
}
