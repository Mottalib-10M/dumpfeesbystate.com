/** Counts drawn from the EPA LMOP list of open landfills (data/landfills.json). */
import RAW from '../data/landfills.json';
import { STATE_NAMES } from './states';
export const LMOP = RAW.meta;
export const OPEN = RAW.landfills;
export function byState() {
  const m = new Map<string, { st: string; name: string; open: number; pub: number }>();
  for (const x of OPEN) {
    const r = m.get(x.state) ?? { st: x.state, name: STATE_NAMES[x.state] ?? x.state, open: 0, pub: 0 };
    r.open += 1; if (x.own === 'Public') r.pub += 1; m.set(x.state, r);
  }
  return [...m.values()].sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));
}
