/**
 * The dump the reader picked, kept for this browser tab only (sessionStorage), so the next tool opens
 * on it instead of the example (naive test, 4th round: “Utah again on every page”). Only the site's
 * id is kept; it never leaves the browser and is erased when the tab is closed. Read after the first
 * render only (RECETTE §17.5).
 */
const KEY = 'dfbs-dump';
export function savedDump(): string | null {
  try { return typeof window === 'undefined' ? null : window.sessionStorage.getItem(KEY); } catch { return null; }
}
export function saveDump(id: string): void {
  try { window.sessionStorage.setItem(KEY, id); } catch { /* storage blocked: the choice lasts for this page */ }
}
