/**
 * Temporary debug/admin switch.
 *
 * On when the URL carries a `debug` or `admin` query param, with or without a
 * value: `/?debug`, `/?admin`, `/?admin=1`.
 *
 * NOTE: a path segment (`/admin`, `/debug`) deliberately does not work. The
 * router has a catch-all that renders the 404 page for unknown paths, so
 * `/admin` would never reach MainPage at all. A query param rides along on
 * whatever route you are already on, which also means it survives on the
 * detail pages if that is ever wanted.
 *
 * Meant to be replaced by a real mechanism later — keep callers going through
 * isDebugMode() rather than reading the URL directly, so there is one place to
 * swap.
 */
export const DEBUG_PARAMS = ['debug', 'admin'] as const;

export function isDebugMode(search: string = window.location.search): boolean {
  const params = new URLSearchParams(search);
  return DEBUG_PARAMS.some((name) => params.has(name));
}
