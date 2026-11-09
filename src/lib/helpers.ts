/** Writing helpers handed to every page: links, fees from the engine, tables, sources. */
import { route, ROUTES } from '../i18n/routes';
import { P, type SourceKey } from './engine/params';
import * as E from './engine/fees';
import type { Facility, Load } from './engine/fees';
import { formatMoney, formatNumber, displayDate } from './format';
import { pct } from './pct';
export { pct };

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
/**
 * Content table. With three columns or more it turns into one card per row on a phone (class `empile`,
 * global.css): the first cell is the card title, each other cell shows its column name before the
 * value, so no price ever sits off screen to the right (naive test of 2026-11-08).
 */
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = []) {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  const cards = headers.length >= 3;
  const lab = (i: number) => (cards ? ` data-label="${headers[i].replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}"` : '');
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm${cards ? ' empile' : ''}">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-700 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${lab(i)} class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/** $36 when whole, $16.50 otherwise. */
export const fee = (n: number) => (Math.abs(n - Math.round(n)) < 0.005 ? formatMoney(Math.round(n), 0) : formatMoney(n, 2));
export const LOAD: Load = { vehicle: 'pickup', lbs: 600, material: 'trash', mattresses: 0, tires: 0, freon: 0, resident: true };

/** The lines of one facility's schedule, as printed (resident rates), for a table on its area page. */
export function scheduleRows(f: Facility): Array<[string, string]> {
  const r: Array<[string, string]> = [];
  const V = E.VEHICLE_LABEL;
  if (f.residentFree) r.push(['Resident allowance', f.residentFree.label]);
  if (f.smallLoad) r.push([`Load up to ${formatNumber(f.smallLoad.maxLbs, 0)} lbs`, `${f.smallLoad.from ? 'from ' : ''}${fee(f.smallLoad.fee)}`]);
  if (f.tiers) for (const x of f.tiers) r.push([`Load up to ${formatNumber(x.maxLbs, 0)} lbs`, fee(x.fee)]);
  for (const v of ['car', 'pickup', 'trailer'] as const) if (f.flat?.[v] != null) r.push([`${V[v]}, flat${f.flatMaxLbs?.[v] ? ` (under ${formatNumber(f.flatMaxLbs[v]!, 0)} lbs)` : ''}`, fee(f.flat[v]!)]);
  // One line per vehicle: “$86 / $86 / $156” read as a riddle (naive test, 2nd round).
  if (f.nonRes?.flat) for (const v of ['car', 'pickup', 'trailer'] as const) if (f.nonRes.flat[v] != null) r.push([`${V[v]}, flat, ${f.nonRes.label}`, fee(f.nonRes.flat[v]!)]);
  if (f.htFlat) r.push(['Bulky-load flat rate (a mattress in the load), car or pickup', fee(f.htFlat.pickup!)]);
  if (f.perTon != null) r.push(['Trash, per ton', f.perTonExtra ? `${fee(f.perTon + f.perTonExtra)}: ${fee(f.perTon)} rate + ${f.perTonExtraLabel ?? `${fee(f.perTonExtra)} in fees`}` : fee(f.perTon)]);
  if (f.nonRes?.perTon) r.push([`Per ton, ${f.nonRes.label}`, fee(f.nonRes.perTon)]);
  if (f.htPerTon) r.push(['Per ton with bulky items (over six feet)', fee(f.htPerTon)]);
  if (f.minByVehicle) { for (const v of ['car', 'pickup', 'trailer'] as const) if (f.minByVehicle[v] != null) r.push([`Minimum charge, ${V[v].toLowerCase()}`, fee(f.minByVehicle[v]!)]); }
  else if (f.minCharge != null) r.push(['Minimum charge (the least any load pays)', `${fee(f.minCharge)}${f.minCoversLbs ? ` (up to ${formatNumber(f.minCoversLbs, 0)} lbs)` : ''}`]);
  if (f.perLoadExtra) r.push([f.perLoadExtraLabel ?? 'Per-load fee', fee(f.perLoadExtra)]);
  if (f.yard) r.push(['Yard waste', [f.yard.flat?.pickup != null ? `${fee(f.yard.flat.pickup)} pickup flat` : '', f.yard.perTon != null ? `${fee(f.yard.perTon)} a ton` : '', f.yard.min ? `${fee(f.yard.min)} minimum` : ''].filter(Boolean).join(', ')]);
  if (f.cd) r.push([`Construction debris (${f.cd.label})`, `${fee(f.cd.perTon)} a ton`]);
  if (f.mattress != null) r.push(['Mattress or box spring', f.mattress === 0 ? 'no charge (household)' : `${fee(f.mattress)} each`]);
  if (f.htAdd != null) r.push(['Item over six feet (furniture, mattress) on a flat load', fee(f.htAdd)]);
  if (f.tire != null) r.push(['Passenger tire', `${f.tireMode === 'load' ? `${fee(f.tire)} per load` : `${fee(f.tire)} each`}${f.tireFree ? `, first ${f.tireFree} free` : ''}${f.tireMax ? `, ${f.tireMax} at most` : ''}`]);
  if (f.freon != null) r.push(['Appliance with refrigerant', `${fee(f.freon)} each${f.freonFree ? `, first ${f.freonFree} free` : ''}`]);
  return r;
}

export function helpers(strict = false) {
  const a = (id: string, text: string) => {
    if (!ROUTES.some((r) => r.id === id)) { if (strict) throw new Error(`Unknown page id in a link: ${id}`); return text; }
    return `<a href="${route(id, 'en')}">${text}</a>`;
  };
  const F = (id: string) => E.byId(id);
  /** Link to a facility's own fee page, the label being its name. */
  const fl = (f: Facility | string, text?: string) => { const x = typeof f === 'string' ? F(f) : f; return `<a href="${x.url}" target="_blank" rel="nofollow noopener noreferrer" class="underline underline-offset-2">${text ?? x.name}</a>`; };
  /** Total of a load at a facility, or null when the schedule prints no fee for it. */
  const est = (id: string, o: Partial<Load> = {}) => E.estimate(F(id), { ...LOAD, ...o });
  const tot = (id: string, o: Partial<Load> = {}) => { const e = est(id, o); if (e.total == null) throw new Error(`${id}: no fee for this load`); return e.total; };
  return {
    P,
    E,
    /** The calculator's default load: a pickup with 600 lbs of household junk. */
    LOAD,
    a,
    F,
    fl,
    est,
    tot,
    /** $36 or $16.50. */
    fee,
    /** $2,363 (rounded to the dollar). */
    m: (n: number) => formatMoney(Math.round(n), 0),
    num: (n: number) => formatNumber(n, 0),
    num1: (n: number) => formatNumber(n, 1),
    pc: pct,
    date: (iso: string) => displayDate(iso, 'en-US'),
    D: { read: displayDate(P.retrieved_at, 'en-US') },
    /** “July 1, 2026” or the schedule's own wording when it prints no date. */
    eff: (f: Facility | string) => { const x = typeof f === 'string' ? F(f) : f; return x.effective ? displayDate(x.effective, 'en-US') : x.effectiveText; },
    table,
    /** Table of one facility's schedule with its link and date. */
    schedule: (id: string) => { const f = E.byId(id); return table(['Line of the price list', 'Fee'], scheduleRows(f).map(([a, b]) => [a, b]), `${f.operator}: <a href="${f.url}" target="_blank" rel="nofollow noopener noreferrer">${f.name} fee schedule</a>, ${f.effective ? `effective ${displayDate(f.effective, 'en-US')}` : f.effectiveText}, read on ${displayDate(P.retrieved_at, 'en-US')}.`, ['l', 'r']); },
    /**
     * Standfirst of an area page: the answer in one sentence, for the same load as the calculator's default
     * (a pickup with 600 lbs of household junk), from the engine (brief of 2026-11-09). It opens with the
     * searched term (“Atlanta dump fees”, RECETTE §13); other areas of the page follow in a second sentence.
     */
    areaIntro: (area: string, id: string, also: string[] = []) => {
      const who = (f: Facility) => f.place.replace(/^City of/, 'the City of');
      const say = (x: string) => {
        const f = F(x); const e = est(x); const w = who(f);
        if (e.total == null) return `${w} prints no price for it at ${f.name}`;
        if (E.isFreeResident(e)) return `${w} charges qualifying residents nothing at ${f.name}`;
        return `${w} charges ${e.from ? 'from ' : ''}${fee(e.total)} at ${f.name}`;
      };
      return `${area} dump fees for a pickup with ${formatNumber(LOAD.lbs, 0)} lbs of household junk: ${say(id)}.${also.length ? ` Also on this page: ${also.map((x) => say(x)).join('; ')}.` : ''} Change the weight or add a mattress below.`;
    },
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label.en}</a>`; },
    box: (title: string, html: string, kind: 'info' | 'tip' | 'warning' | 'example' = 'info') => `<div class="callout callout-${kind}"><span class="callout-title">${title}</span>${html}</div>`,
  };
}
export type Helpers = ReturnType<typeof helpers>;
