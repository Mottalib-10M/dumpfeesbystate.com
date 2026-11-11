/**
 * Mini-calculators, one per subject (RECETTE §9.3). Each one calls the tested engine of
 * `lib/engine/fees.ts`; none computes a fee on its own. Facility options carry the index of the facility
 * in DUMPS, so a page sets its default with `facilityIndex(id)`. Every fee comes from a schedule read on
 * the facility's own page; a quote (dumpster, junk removal) appears only when the user types it.
 */
import type { MiniSpec, MiniInput } from './mini-types';
import { P } from './engine/params';
import * as E from './engine/fees';
import type { Facility, Load, Material, Vehicle } from './engine/fees';
import { formatNumber, formatMoney, displayDate } from './format';

const fee = (n: number) => (Math.abs(n - Math.round(n)) < 0.005 ? formatMoney(Math.round(n), 0) : formatMoney(n, 2));
const ft = (n: number) => formatNumber(n, Number.isInteger(n) ? 0 : 1);
const lbsTxt = (n: number) => `${formatNumber(Math.round(n), 0)} lbs`;
const short = (f: Facility) => `${f.name} (${f.metro})`;
const VEH: Vehicle[] = ['car', 'pickup', 'trailer'];
const MAT: Material[] = ['trash', 'yard', 'cd'];
const VEH_OPT = VEH.map((v, i) => ({ value: String(i), label: E.VEHICLE_LABEL[v] }));
const MAT_OPT = MAT.map((v, i) => ({ value: String(i), label: E.MATERIAL_LABEL[v] }));
const YESNO = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
const pick = <T,>(arr: T[], v: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.round(v)))];
const facIn = (keep: (f: Facility) => boolean = () => true, def = 'seattle', label = 'Landfill or transfer station'): MiniInput => {
  // Sorted by state, then area: the reader looks for their own state first.
  const opts = E.DUMPS.map((f, i) => ({ f, i })).filter((x) => keep(x.f)).sort((a, b) => a.f.state.localeCompare(b.f.state) || a.f.metro.localeCompare(b.f.metro)).map((x) => ({ value: String(x.i), label: `${x.f.state} · ${E.facilityLabel(x.f)}` }));
  return { id: 'fac', label, def: E.facilityIndex(def), options: opts, help: 'Pick the public dump nearest you. A transfer station is a drop-off site that trucks the waste on to a landfill' };
};
const freeTag = (e: E.Estimate) => (E.isFreeResident(e) ? ' (free resident load)' : '');
const fac = (v: number) => pick(E.DUMPS, v);
const base = (o: Partial<Load>): Load => ({ vehicle: 'pickup', lbs: 300, material: 'trash', mattresses: 0, tires: 0, freon: 0, resident: true, ...o });
const total = (f: Facility, L: Load) => E.estimate(f, L).total;
const effNote = (f: Facility) => `${E.priceListLine(f)}, checked on ${displayDate(E.READ_ON, 'en-US')}.`;
/** Weight of “a pickup load of trash” everywhere on the site: the main calculator's default (naive test, 4th round). */
export const PICKUP_LBS = 600;
/** Example of the dumpster comparison: two pickup loads (naive test, 2026-11-09: 3,000 lbs was far from a couch, a mattress and some debris). */
export const VERSUS_LBS = 2 * PICKUP_LBS;
const lbsIn = (def: number, label = 'Weight of the load') => ({ id: 'lbs', label, def, unit: 'lbs', max: 20000, help: 'The scale weighs it; a guess is fine here' });

const ONE: Record<string, string> = { 'mattresses or box springs': 'mattress or box spring', tires: 'tire', appliances: 'appliance' };
/** Items (mattresses, tires, appliances): the total the reader pays, then what the items add. */
function itemSpec(kind: 'mattresses' | 'tires' | 'freon', title: string, has: (f: Facility) => boolean, def: string, label: string, unit: string, noun: string): MiniSpec {
  return {
    title, cta: 'Price the whole load', ctaPage: 'home',
    inputs: [facIn(has, def), { id: 'n', label, def: 1, unit, max: 50 }, { id: 'withLoad', label: `With a pickup load of junk (${PICKUP_LBS} lbs)?`, def: 1, options: YESNO, help: 'Not sure? Keep Yes: most people bring other junk in the same trip' }],
    run: (v) => {
      const f = fac(v.fac); const n = Math.max(0, Math.round(v.n)); const lbs = v.withLoad === 1 ? PICKUP_LBS : 0;
      const L0 = base({ lbs }); const L1 = { ...L0, [kind]: n };
      const e1 = E.estimate(f, L1); const t0 = total(f, L0) ?? 0; const t1 = e1.total ?? 0;
      const unpriced = e1.missing.length > 0;
      // Each figure once (naive test, 2nd round: “add $34” then “$34”, “$49” then “without them $49”).
      // The two extra lines appear only when the items have no line of their own (a higher rate for
      // the whole load, as in Riverside County).
      const rows: Array<[string, string]> = e1.lines.map((x) => [x.label, fee(x.amount)]);
      for (const m of e1.missing) { const [what, why] = E.missingText(m); rows.push([what, why]); }
      const ownLine = e1.lines.some((x) => !x.label.startsWith('Load') && x.label !== (f.perLoadExtraLabel ?? 'Per-load fee'));
      if (v.withLoad === 1 && !unpriced && !ownLine && n > 0) { rows.push(['Same load without them', fee(t0)]); rows.push([`So the ${formatNumber(n, 0)} ${noun} add`, fee(t1 - t0)]); }
      const nn = n === 1 ? (ONE[noun] ?? noun) : noun;
      const head = v.withLoad === 1 ? (unpriced ? `You pay for the load (${noun} not priced)` : `You pay, load and ${formatNumber(n, 0)} ${nn}`) : `${formatNumber(n, 0)} ${nn} at ${f.name}`;
      // The free routes under the price, not ten screens down (naive test, 2026-11-09).
      const free = kind === 'mattresses' ? ' Before you pay: your city may pick up a mattress at the curb, sometimes free. In California, Connecticut, Oregon and Rhode Island, state drop-off sites take used mattresses free (Bye Bye Mattress program).' : '';
      return { head: [head, fee(t1)], rows, note: `${effNote(f)}${free}`, assumes: `For one trip: ${formatNumber(n, 0)} ${nn}${v.withLoad === 1 ? ` and a pickup with ${lbsTxt(PICKUP_LBS)} of junk` : ', nothing else'}, resident rate.` };
    },
  };
}

const SPECS: Record<string, MiniSpec> = {
  perton: {
    title: 'A weighed load at one landfill, and at the others', cta: 'Price mattresses and tires in the same load', ctaPage: 'home',
    inputs: [facIn((f) => f.perTon != null, 'seattle'), lbsIn(800), { id: 'veh', label: 'Vehicle', def: 1, options: VEH_OPT }],
    run: (v) => {
      const f = fac(v.fac); const L = base({ lbs: v.lbs, vehicle: pick(VEH, v.veh) }); const e = E.estimate(f, L);
      const all = E.compare(L); const lo = all[0]; const hi = all[all.length - 1];
      return { head: [`At ${f.name}`, e.total == null ? 'not priced' : fee(e.total)], rows: [['Rule applied', e.rule], ['Per-ton rate printed', f.perTon != null ? `${fee(f.perTon)} a ton` : 'none'], [`Cheapest of ${all.length} sites for this load`, `${fee(lo.e.total as number)}${freeTag(lo.e)}, ${short(lo.f)}`], [`Most expensive for this load`, `${fee(hi.e.total as number)}, ${short(hi.f)}`]], note: effNote(f) };
    },
  },
  pickup: {
    title: 'A pickup bed measured, weighed and priced', cta: 'Add a couch, a mattress or tires on the main calculator', ctaPage: 'home',
    inputs: [facIn(() => true, E.EXAMPLE_ID), { id: 'len', label: 'Length of the pile', def: 6.5, unit: 'ft', max: 40, decimals: 1, help: 'Measure your bed or trailer' }, { id: 'wid', label: 'Width', def: 5, unit: 'ft', max: 10, decimals: 1 }, { id: 'hei', label: 'Average height', def: 2, unit: 'ft', max: 10, decimals: 1 }, { id: 'mat', label: 'What is in it', def: 0, options: MAT_OPT }],
    run: (v) => {
      const f = fac(v.fac); const mat = pick(MAT, v.mat); const cy = E.cubicYards(v.len, v.wid, v.hei);
      const dens = E.DENSITY[mat === 'trash' ? 'msw' : mat].lbs; const lbs = cy * dens; const e = E.estimate(f, base({ lbs, material: mat }));
      return { head: [`Dump fee at ${f.name}`, e.total == null ? 'not priced' : `${e.from ? 'from ' : ''}${fee(e.total)}`], rows: [['Volume', `${formatNumber(cy, 1)} cubic yards (a cubic yard is a box 3 ft on each side)`], ['Estimated weight', `${lbsTxt(lbs)} (${formatNumber(dens, 0)} lbs a cubic yard, the factor of the federal environment agency, EPA)`], ['Rule applied', e.rule]], note: effNote(f), assumes: `For one trip: a pile ${ft(v.len)} × ${ft(v.wid)} ft, ${ft(v.hei)} ft high, about ${lbsTxt(lbs)}, resident rate.` };
    },
  },
  weight: {
    title: 'How much a load weighs, from its size', cta: 'Price that weight at your dump', ctaPage: 'landfill-prices-per-ton',
    inputs: [{ id: 'mat', label: 'Material', def: 0, options: E.DENSITY_KEYS.map((k, i) => ({ value: String(i), label: E.DENSITY[k].label })) }, { id: 'len', label: 'Length', def: 8, unit: 'ft', max: 60, decimals: 1 }, { id: 'wid', label: 'Width', def: 5, unit: 'ft', max: 20, decimals: 1 }, { id: 'hei', label: 'Height', def: 1.5, unit: 'ft', max: 20, decimals: 1 }],
    run: (v) => {
      const k = pick(E.DENSITY_KEYS, v.mat); const d = E.DENSITY[k]; const cy = E.cubicYards(v.len, v.wid, v.hei); const lbs = cy * d.lbs;
      return { head: ['Estimated weight', lbsTxt(lbs)], rows: [['Volume', `${formatNumber(cy, 2)} cubic yards`], ['In tons', `${formatNumber(lbs / 2000, 2)} tons`], ['EPA factor used', `${formatNumber(d.lbs, 0)} lbs a cubic yard`]], note: 'EPA volume-to-weight conversion factors (April 2016). Loose material; a packed or wet load weighs more.' };
    },
  },
  couch: {
    title: 'A couch or large furniture at the dump', cta: 'Add a mattress, tires or remodel debris to this load', ctaPage: 'home',
    inputs: [facIn(() => true, E.EXAMPLE_ID), { id: 'n', label: 'Couches and large furniture', def: 1, unit: 'items', max: 20 }, lbsIn(PICKUP_LBS, 'Weight of the load, furniture included'), { id: 'veh', label: 'Vehicle', def: 1, options: VEH_OPT }],
    run: (v) => {
      const f = fac(v.fac); const n = Math.max(0, Math.round(v.n)); const L0 = base({ lbs: v.lbs, vehicle: pick(VEH, v.veh) });
      const e1 = E.estimate(f, { ...L0, bulky: n }); const e0 = E.estimate(f, L0);
      if (e1.total == null) return { head: ['You pay', 'not priced'], rows: [['Reason', e1.rule]], note: effNote(f) };
      const rows: Array<[string, string]> = e1.lines.map((x) => [x.label, fee(x.amount)]);
      if (n > 0 && E.hasBulkyRule(f) && e0.total != null && e1.total !== e0.total) { rows.push(['Same load without the furniture', fee(e0.total)]); rows.push(['So the furniture adds', fee(e1.total - e0.total)]); }
      // One wording on every page (engine `couchRule`), naive test, 2026-11-09.
      else if (n > 0) rows.push(['Couch or furniture', E.couchRule(f)]);
      return { head: [n > 0 ? 'You pay, load and furniture' : 'You pay for the load', `${e1.from ? 'from ' : ''}${fee(e1.total)}`], rows, assumes: `For one trip: ${formatNumber(n, 0)} couch${n === 1 ? '' : 'es'} in a load of ${lbsTxt(v.lbs)} in all, resident rate.`, note: `Some sites refuse upholstered furniture: ask at the gate. Before you pay: your city may pick up a couch at the curb, sometimes free, and a charity may take one in good condition. ${effNote(f)}` };
    },
  },
  // Every site, so a reader whose dump prints no mattress price still finds it and is told so.
  mattress: itemSpec('mattresses', 'Mattresses and box springs at the dump', () => true, E.EXAMPLE_ID, 'Mattresses and box springs', 'items', 'mattresses or box springs'),
  tires: itemSpec('tires', 'Tires dropped off with or without a load', (f) => f.tire != null, E.EXAMPLE_ID, 'Tires (car or light truck)', 'tires', 'tires'),
  freon: itemSpec('freon', 'Refrigerators, freezers and air conditioners', (f) => f.freon != null, E.EXAMPLE_ID, 'Appliances with refrigerant', 'appliances', 'appliances'),
  yard: {
    title: 'Yard waste and brush against the trash rate', cta: 'Construction debris rates', ctaPage: 'construction-debris-disposal',
    inputs: [facIn((f) => !!f.yard, 'king-county'), { id: 'veh', label: 'Vehicle', def: 1, options: VEH_OPT }, lbsIn(500)],
    run: (v) => {
      const f = fac(v.fac); const L = base({ lbs: v.lbs, vehicle: pick(VEH, v.veh), material: 'yard' }); const y = E.estimate(f, L); const t = E.estimate(f, { ...L, material: 'trash' });
      return { head: ['Yard waste fee', y.total == null ? 'not priced' : fee(y.total)], rows: [['Rule applied', y.rule], ['Same weight as trash', t.total == null ? 'not priced' : fee(t.total)], ['Kept by sorting it out', y.total != null && t.total != null ? fee(Math.max(0, t.total - y.total)) : 'n/a']], note: effNote(f) };
    },
  },
  cd: {
    title: 'Construction debris at the scale', cta: 'Weight of drywall, shingles and concrete', ctaPage: 'load-weight-calculator',
    inputs: [facIn((f) => !!f.cd, 'fairfax'), lbsIn(1500), { id: 'veh', label: 'Vehicle', def: 1, options: VEH_OPT }],
    run: (v) => {
      const f = fac(v.fac); const L = base({ lbs: v.lbs, vehicle: pick(VEH, v.veh), material: 'cd' }); const c = E.estimate(f, L); const t = E.estimate(f, { ...L, material: 'trash' });
      return { head: ['Debris fee', c.total == null ? 'not priced' : fee(c.total)], rows: [['Rate used', f.cd ? `${fee(f.cd.perTon)} a ton, ${f.cd.label}` : 'none'], ['Rule applied', c.rule], ['Same weight as trash', t.total == null ? 'not priced' : fee(t.total)]], note: effNote(f) };
    },
  },
  small: {
    title: 'A small load: the minimum charge decides', cta: 'Per-ton rates side by side', ctaPage: 'landfill-prices-per-ton',
    inputs: [{ id: 'veh', label: 'Vehicle', def: 0, options: VEH_OPT }, lbsIn(150)],
    run: (v) => {
      const L = base({ lbs: v.lbs, vehicle: pick(VEH, v.veh) }); const all = E.compare(L); const mid = all[Math.floor(all.length / 2)];
      const rows: Array<[string, string]> = all.slice(0, 3).map((x) => [short(x.f), `${x.e.from ? 'from ' : ''}${fee(x.e.total as number)}${freeTag(x.e)}`]);
      rows.push(['Middle of the list', `${fee(mid.e.total as number)}, ${short(mid.f)}`]);
      rows.push([`Most expensive of ${all.length}`, `${fee(all[all.length - 1].e.total as number)}, ${short(all[all.length - 1].f)}`]);
      return { head: ['Cheapest schedule for this load', fee(all[0].e.total as number)], rows, note: `Resident rates, trash only. Schedules read on ${displayDate(E.READ_ON, 'en-US')}.` };
    },
  },
  versus: {
    title: 'Hauling it yourself against a quote', cta: 'How much your load weighs', ctaPage: 'load-weight-calculator',
    inputs: [facIn(() => true, E.EXAMPLE_ID), { id: 'veh', label: 'Vehicle', def: 1, options: VEH_OPT }, lbsIn(VERSUS_LBS, 'Total weight to get rid of'), { id: 'trips', label: 'Trips to the dump', def: 2, max: 30 }, { id: 'miles', label: 'Miles there and back, per trip', def: 30, unit: 'mi', max: 500 }, { id: 'cents', label: 'Cost of driving, per mile', def: P.mileage.businessCents, unit: '¢', max: 300, help: `The federal standard rate for a car, gas and wear included (IRS, the tax agency, ${P.mileage.period}). Lower it if you count gas only` }, { id: 'rental', label: 'Truck or trailer rental, in dollars', def: 0, max: 10000, help: 'Leave empty if you drive your own' }, { id: 'quote', label: 'Dumpster or junk removal quote, in dollars', def: 0, max: 100000, help: 'Type the price you were quoted; leave empty until you have one' }, { id: 'mat', label: 'What the load is', def: 0, options: MAT_OPT, help: 'Junk and remodel debris together? The main calculator prices them in one trip' }, { id: 'cb', label: 'Couches and large furniture', def: 0, max: 20, help: 'Priced with the load at most sites' }, { id: 'mt', label: 'Mattresses in the load', def: 0, max: 20, help: 'Charged once in total, not on every trip, at the site’s mattress price' }],
    run: (v) => {
      const f = fac(v.fac); const r = E.versusQuote(f, base({ lbs: v.lbs, vehicle: pick(VEH, v.veh), material: pick(MAT, v.mat ?? 0), mattresses: Math.max(0, Math.round(v.mt ?? 0)), bulky: Math.max(0, Math.round(v.cb ?? 0)) }), v.trips, v.miles, v.cents, v.quote);
      if (!r) return { head: ['Hauling it yourself', 'not priced'], rows: [['Reason', E.estimate(f, base({ lbs: v.lbs, material: pick(MAT, v.mat ?? 0) })).rule]] };
      const assumes = `${lbsTxt(v.lbs)} of ${E.MATERIAL_LABEL[pick(MAT, v.mat ?? 0)].toLowerCase()} in ${r.trips} trip${r.trips > 1 ? 's' : ''} of ${formatNumber(v.miles, 0)} miles there and back, resident rate. Your time is not counted.`;
      const rental = Math.max(0, v.rental || 0); const self = Math.round((r.self + rental) * 100) / 100; const diff = Math.round((r.quote - self) * 100) / 100;
      const rows: Array<[string, string]> = [[`Dump fees, ${r.trips} trip${r.trips > 1 ? 's' : ''}`, fee(r.fees)], ['Driving', fee(r.driving)]];
      if (rental > 0) rows.push(['Truck or trailer rental', fee(rental)]);
      rows.push(['Total, doing it yourself', fee(self)]);
      if (!(r.quote > 0)) return { head: ['Doing it yourself costs', fee(self)], rows: [...rows, ['Quote you were given', 'type it above to compare']], note: effNote(f), assumes };
      rows.push(['Quote you typed', fee(r.quote)]);
      return { head: [diff >= 0 ? 'Hauling it yourself saves' : 'The quote saves', fee(Math.abs(diff))], rows, note: effNote(f), assumes };
    },
  },
};
export function getSpec(kind: string): MiniSpec {
  const s = SPECS[kind];
  if (!s) throw new Error(`Unknown mini-spec ${kind}`);
  return s;
}
export const SPEC_KINDS = Object.keys(SPECS);
