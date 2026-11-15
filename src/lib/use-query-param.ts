"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a query param on the client. Returns `undefined` during prerender and
 * hydration, then the real value (string | null). Lets fully client-rendered
 * app pages stay in the static shell without a useSearchParams Suspense
 * boundary and without hydration mismatches.
 */
export function useQueryParam(name: string) {
  const value = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => undefined,
  );
  return [value ?? null, value !== undefined] as const;
}
