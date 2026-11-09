/**
 * Dump fee engine. Pure functions over `data/fees-2026.json`: every amount is a fee printed on an
 * official schedule. When a schedule does not print the fee a load needs, the engine returns null for
 * that part and says why; it never fills a gap with a guess.
 */
import RAW from '../../data/fees-2026.json';
import { P } from './params';
import { displayDate, formatMoney } from '../format';
import { STATE_NAMES } from '../states';

export type Vehicle = 'car' | 'pickup' | 'trailer';
export type Material = 'trash' | 'yard' | 'cd';
type ByVehicle = Partial<Record<Vehicle, number>>;
export interface Facility {
  id: string; metro: string; state: string; place: string; name: string; operator: string; kind: 'landfill' | 'transfer' | 'center';
  url: string; via?: string; effective: string | null; effectiveText: string; noTrash?: boolean;
  flat?: ByVehicle; flatNote?: string; flatMaxLbs?: ByVehicle; htFlat?: ByVehicle; htAdd?: number; htPerTon?: number;
  tiers?: Array<{ maxLbs: number; fee: number }>;
  smallLoad?: { maxLbs: number; fee: number; label: string; from?: boolean };
  perTon?: number; minCharge?: number; minCoversLbs?: number; minByVehicle?: ByVehicle; minNote?: string;
  perTonExtra?: number; perTonExtraLabel?: string; perLoadExtra?: number; perLoadExtraLabel?: string;
  nonRes?: { flat?: ByVehicle; perTon?: number; label: string };
  residentFree?: { maxLbs: number; label: string };
  yard?: { perTon?: number; min?: number; flat?: ByVehicle };
  brush?: { perTon?: number; flat?: ByVehicle };
  cd?: { perTon: number; label: string };
  bags?: Array<{ max: number; fee: number }>;
  mattress?: number; freon?: number; freonFree?: number; freonNote?: string;
  tire?: number; tireMode?: 'each' | 'load'; tireFree?: number; tireMax?: number;
  next?: { effective: string; url: string; minCharge?: number; perTon?: number; note: string };
  /** Who answers Yes or No to “You live in the area it serves”, in the site's own terms. */
  residentHelp?: string;
  notes: string[];
}
export const FACILITIES = RAW.facilities as Facility[];
export const READ_ON = RAW.read;
/** Facilities that take household trash (the Austin drop-off center does not). */
export const DUMPS = FACILITIES.filter((f) => !f.noTrash);
/**
 * Libellé d'un site dans les listes déroulantes. La liste de la trame affiche maintenant le choix en
 * entier (report de trame du 2026-11-08) : au-delà de deux lignes sur un téléphone de 320 px, le champ
 * grandissait (check-layout). Les noms officiels les plus longs ont donc un libellé court ; le nom
 * complet reste dans le résultat et dans les tableaux.
 */
const SHORT_LABEL: Record<string, string> = {
  phoenix: 'Phoenix: 27th Ave and N. Gateway stations',
  'orange-fl': 'Orlando: Orange County sites',
  'oc-ca': 'Orange County: Olinda, Prima Deshecha',
  fairfax: 'Fairfax County: I-66 and I-95 sites',
  'san-bernardino': 'San Bernardino County sites',
  riverside: 'Riverside County landfills',
  'miami-dade': 'Miami: Miami-Dade County sites',
  blount: 'Knoxville: Blount County landfill',
};
export const facilityLabel = (f: Facility) => SHORT_LABEL[f.id] ?? `${f.metro}: ${f.name}`;
export const byId = (id: string) => {
  const f = FACILITIES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown facility ${id}`);
  return f;
};
/**
 * Site the generic tools open on (home, truckload, mattress, dumpster, tires, appliances), shown as an
 * example until the reader picks their own. One site everywhere, near the middle of the list for a
 * pickup load, so the first figure seen neither scares nor flatters (naive test, 2nd round, 2026-11-08).
 */
export const EXAMPLE_ID = 'salt-lake';
export const facilityIndex = (id: string) => DUMPS.findIndex((f) => f.id === id);
export const LBS_PER_TON = 2000;
export const VEHICLE_LABEL: Record<Vehicle, string> = { car: 'Car, SUV or minivan', pickup: 'Pickup or cargo van', trailer: 'Pickup towing a trailer' };
export const MATERIAL_LABEL: Record<Material, string> = { trash: 'Household trash and junk', yard: 'Yard waste and brush', cd: 'Construction debris' };

export interface Load { vehicle: Vehicle; lbs: number; material: Material; mattresses: number; tires: number; freon: number; resident: boolean;
  /** Couches, sofas and other large furniture: no fee of their own, but they trigger a bulky-load rule where the schedule has one. */
  bulky?: number }
export interface Line { label: string; amount: number }
export interface Estimate {
  /** null when the schedule prints no fee for this kind of load. */
  total: number | null; base: number | null; rule: string; lines: Line[]; missing: string[]; from: boolean;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const tons = (lbs: number) => Math.max(0, lbs) / LBS_PER_TON;
const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, '')}`;

/** Price of a weighed load: per-ton rate times weight, never below the minimum that applies. */
export function weighed(f: Facility, lbs: number, rate: number, min: number | undefined): { fee: number; rule: string } {
  const raw = rate * tons(lbs) + (f.perTonExtra ?? 0) * tons(lbs);
  const all = rate + (f.perTonExtra ?? 0);
  const extra = f.perTonExtra ? ` (${money(rate)} + ${money(f.perTonExtra)} in added fees)` : '';
  if (min != null && raw < min) return { fee: min, rule: `Minimum charge ${money(min)}, the least any load pays${f.minCoversLbs ? ` (covers up to ${f.minCoversLbs} lbs)` : ''}` };
  return { fee: r2(raw), rule: `${(tons(lbs)).toFixed(2)} tons at ${money(all)} a ton${extra}` };
}

/** Base fee for the load itself, before items. */
export function baseFee(f: Facility, L: Load): { fee: number | null; rule: string; from?: boolean } {
  if (f.noTrash) return { fee: null, rule: 'This site takes no trash' };
  const lbs = Math.max(0, L.lbs);
  if (L.resident && f.residentFree && lbs <= f.residentFree.maxLbs && L.material !== 'cd') return { fee: 0, rule: `Resident allowance: ${f.residentFree.label}` };
  const nr = !L.resident && f.nonRes ? f.nonRes : null;
  if (L.material === 'cd') {
    if (!f.cd) return { fee: null, rule: 'No construction debris rate on this schedule' };
    return weighed(f, lbs, f.cd.perTon, f.minCharge);
  }
  if (L.material === 'yard') {
    const y = f.yard;
    if (!y) return { fee: null, rule: 'No yard waste rate on this schedule' };
    const fl = y.flat?.[L.vehicle];
    if (fl != null) return { fee: fl, rule: `Flat yard waste fee for this vehicle, whatever the weight` };
    if (y.perTon != null) return weighed(f, lbs, y.perTon, y.min ?? f.minCharge);
    return { fee: null, rule: 'No yard waste rate for this vehicle on this schedule' };
  }
  // Household trash.
  // Furniture triggers the bulky rule only where the schedule names it: OC's “items longer than six feet (wood,
  // furniture, mattresses)”. Riverside's ordinance names mattresses only, so a couch is left to the gate there.
  const ht = L.mattresses > 0 || ((L.bulky ?? 0) > 0 && f.htAdd != null);
  if (f.smallLoad && lbs <= f.smallLoad.maxLbs) return { fee: f.smallLoad.fee, rule: f.smallLoad.label, from: f.smallLoad.from };
  if (f.tiers && lbs < 2000) {
    const t = f.tiers.find((x) => lbs <= x.maxLbs);
    if (t) return { fee: t.fee, rule: `Weight band up to ${t.maxLbs} lbs` };
  }
  const flatTable = nr?.flat ?? f.flat;
  const flat = (ht && f.htFlat?.[L.vehicle] != null ? f.htFlat[L.vehicle] : flatTable?.[L.vehicle]);
  const flatMax = f.flatMaxLbs?.[L.vehicle];
  if (flat != null && (flatMax == null || lbs < flatMax)) {
    const label = ht && f.htFlat?.[L.vehicle] != null ? 'Flat bulky-load rate: a mattress or other bulky item puts the whole load on it' : `${flatMax != null ? `Flat fee for this vehicle under ${flatMax.toLocaleString('en-US')} lbs; heavier loads are weighed` : 'Flat fee for this vehicle, whatever the weight'}${nr?.flat ? ` (${nr.label})` : ''}`;
    return { fee: flat, rule: label };
  }
  const rate = ht && f.htPerTon ? f.htPerTon : (nr?.perTon ?? f.perTon);
  if (rate == null) return { fee: null, rule: 'This schedule prints no rate for this vehicle or weight' };
  const min = f.minByVehicle?.[L.vehicle] ?? f.minCharge;
  return weighed(f, lbs, rate, min);
}

/** Full estimate: the load, then mattresses, tires and refrigerant appliances at the schedule's item fees. */
export function estimate(f: Facility, L: Load): Estimate {
  const b = baseFee(f, L);
  const lines: Line[] = [];
  const missing: string[] = [];
  if (b.fee != null) lines.push({ label: `Load: ${b.rule}`, amount: b.fee });
  if (b.fee != null && f.perLoadExtra) lines.push({ label: `${f.perLoadExtraLabel ?? 'Per-load fee'}`, amount: f.perLoadExtra });
  const m = Math.max(0, Math.round(L.mattresses));
  if (m > 0) {
    if (f.mattress != null) lines.push({ label: `${m} mattress${m > 1 ? 'es' : ''} or box spring${m > 1 ? 's' : ''}`, amount: r2(f.mattress * m) });
    else if (f.htAdd != null && b.rule.startsWith('Flat')) lines.push({ label: 'Bulky item fee (item over six feet, such as a mattress)', amount: f.htAdd });
    else if (!(f.htFlat || f.htPerTon)) missing.push('mattress fee not printed');
  }
  const k = Math.max(0, Math.round(L.bulky ?? 0));
  if (k > 0 && m === 0 && f.htAdd != null && b.rule.startsWith('Flat')) lines.push({ label: 'Bulky item fee (item over six feet, such as a couch)', amount: f.htAdd });
  const t = Math.max(0, Math.round(L.tires));
  if (t > 0) {
    if (f.tire == null) missing.push('tire fee not printed');
    else if (f.tireMode === 'load') lines.push({ label: `Tires (per load, up to ${f.tireMax ?? t})`, amount: f.tire });
    else { const paid = Math.max(0, t - (f.tireFree ?? 0)); lines.push({ label: `${t} tire${t > 1 ? 's' : ''}${f.tireFree ? ` (first ${f.tireFree} free)` : ''}`, amount: r2(paid * f.tire) }); }
    if (f.tireMax != null && t > f.tireMax) missing.push(`more than ${f.tireMax} tires is charged by weight`);
  }
  const z = Math.max(0, Math.round(L.freon));
  if (z > 0) {
    if (f.freon == null) missing.push('appliance fee not printed');
    else { const paid = Math.max(0, z - (f.freonFree ?? 0)); lines.push({ label: `${z} refrigerant appliance${z > 1 ? 's' : ''}${f.freonFree ? ` (first ${f.freonFree} free)` : ''}`, amount: r2(paid * f.freon) }); }
  }
  const total = b.fee == null ? null : r2(lines.reduce((s, x) => s + x.amount, 0));
  return { total, base: b.fee, rule: b.rule, lines, missing, from: !!b.from };
}

/** Plain-words version of an item the schedule does not price: [what, what it means]. */
export function missingText(m: string): [string, string] {
  const item = m.startsWith('mattress') ? 'Mattress' : m.startsWith('tire') ? 'Tires' : m.startsWith('appliance') ? 'Fridge or air conditioner' : null;
  if (item) return [item, 'no price on this site’s list, so not counted. Ask at the gate.'];
  return ['Tires', m.replace(' is charged by weight', ': the extra ones are weighed')];
}

const ord = (n: number) => { const t = n % 100; const s = t >= 11 && t <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'; return `${n}${s}`; };
/** Rank of a site for a load in words: “cheapest” in the cheaper half, “most expensive” in the other. */
export function rankPhrase(rank: number, n: number): string {
  if (n <= 1) return 'The only public site we priced for this load.';
  if (rank <= 1) return `The cheapest of the ${n} public sites we priced for this load.`;
  if (rank >= n) return `The most expensive of the ${n} public sites we priced for this load.`;
  if (rank <= n / 2) return `${ord(rank)} cheapest of the ${n} public sites we priced for this load.`;
  return `${ord(n - rank + 1)} most expensive of the ${n} public sites we priced for this load.`;
}
/** True when the load is free under a resident allowance (Phoenix, Washington County). */
export const isFreeResident = (e: Estimate) => e.total === 0 && e.rule.startsWith('Resident allowance');
/** Who gets the free load, in the site's words, to print beside every $0 (naive test, 2nd round). */
export const freeCondition = (f: Facility) => { const t = (f.residentFree?.label ?? '').replace(/,\s*free$/, ''); return t.charAt(0).toUpperCase() + t.slice(1); };

/** Cheapest and dearest facility for the same load, among those that price it. */
export function compare(L: Load) {
  return DUMPS.map((f) => ({ f, e: estimate(f, L) })).filter((x) => x.e.total != null).sort((a, b) => (a.e.total as number) - (b.e.total as number));
}

/** Weight of a load from its volume (cubic yards) and an EPA density in lbs per cubic yard. */
export const cubicYards = (lengthFt: number, widthFt: number, heightFt: number) => Math.max(0, lengthFt) * Math.max(0, widthFt) * Math.max(0, heightFt) / 27;
export const DENSITY: Record<string, { lbs: number; label: string }> = {
  msw: { lbs: (P.weights.msw_loose_lo + P.weights.msw_loose_hi) / 2, label: 'Household trash, loose' },
  yard: { lbs: P.weights.yard_loose, label: 'Yard waste, loose' },
  branches: { lbs: P.weights.branches, label: 'Branches and prunings' },
  cd: { lbs: P.weights.cd_mixed, label: 'Mixed construction debris' },
  drywall: { lbs: P.weights.drywall, label: 'Drywall (gypsum board)' },
  lumber: { lbs: P.weights.lumber, label: 'Clean lumber' },
  roofing: { lbs: P.weights.roofing, label: 'Asphalt roofing shingles' },
  concrete: { lbs: P.weights.concrete, label: 'Broken concrete' },
  dirt: { lbs: P.weights.dirt_sand, label: 'Dirt and sand' },
  carpet: { lbs: P.weights.carpet, label: 'Carpet' },
};
export const DENSITY_KEYS = Object.keys(DENSITY);

/** Per-ton rates of every facility that prints one, sorted. */
export const perTonTable = () => DUMPS.filter((f) => f.perTon != null).map((f) => ({ f, rate: f.perTon as number, all: (f.perTon as number) + (f.perTonExtra ?? 0) })).sort((a, b) => a.all - b.all);

/** Self-haul versus a quote (dumpster or junk removal) typed by the user. */
export function versusQuote(f: Facility, L: Load, trips: number, milesRound: number, centsPerMile: number, quote: number) {
  const one = estimate(f, { ...L, lbs: L.lbs / Math.max(1, trips) });
  const tripsN = Math.max(1, Math.round(trips));
  if (one.total == null) return null;
  // Items are charged once, the load fee on every trip.
  const items = one.lines.filter((x) => !x.label.startsWith('Load') && x.label !== (f.perLoadExtraLabel ?? '')).reduce((s, x) => s + x.amount, 0);
  const perTrip = (one.total - items);
  const fees = r2(perTrip * tripsN + items);
  const driving = r2(tripsN * Math.max(0, milesRound) * Math.max(0, centsPerMile) / 100);
  const self = r2(fees + driving);
  return { trips: tripsN, fees, driving, self, quote, diff: r2(quote - self) };
}

/** Date of a price list in plain words: “effective July 1, 2026” or “no date printed on it”. */
export const effPhrase = (f: Facility) => (f.effective ? `effective ${displayDate(f.effective, 'en-US')}` : f.effectiveText);
/** “Salt Lake County price list (no date printed on it)” (naive test, 4th round: “price list current schedule, no effective date printed”). */
export const priceListLine = (f: Facility) => `${f.place} price list (${effPhrase(f)})`;
/** True when the Yes/No resident question changes the price at this site. */
export const hasResidentRule = (f: Facility) => !!(f.nonRes || f.residentFree);
/** Help under the resident question, in the site's own terms. */
export function residentHelp(f: Facility): string | undefined {
  if (f.residentHelp) return f.residentHelp;
  if (f.residentFree) return `Yes = ${f.residentFree.label.replace(/,\s*free$/, '')}: free. No = everyone else.`;
  if (f.nonRes) return `No = ${f.nonRes.label}, which pays more.`;
  return undefined;
}
/** True when the price list has no mattress rule at all (no fee, no bulky-load rate). */
export const noMattressRule = (f: Facility) => f.mattress == null && f.htAdd == null && !f.htFlat && !f.htPerTon;
/** True when the price list has a bulky-load rule that a couch or large furniture triggers. */
export const hasBulkyRule = (f: Facility) => f.htAdd != null;

const money0 = (n: number) => (Math.abs(n - Math.round(n)) < 0.005 ? formatMoney(Math.round(n), 0) : formatMoney(n, 2));
/**
 * Rank of a site in its own state first (naive test, 4th round: “the most expensive of the 24” worried a San Diego
 * reader without telling him where to go), then a plain national count instead of an ordinal.
 */
export function rankInState(f: Facility, all: Array<{ f: Facility; e: Estimate }>): { state: string; national: string } {
  const mine = all.find((x) => x.f.id === f.id);
  const st = STATE_NAMES[f.state] ?? f.state;
  if (!mine || mine.e.total == null) return { state: '', national: '' };
  const same = all.filter((x) => x.f.state === f.state);
  const less = all.filter((x) => (x.e.total as number) < (mine.e.total as number) - 0.004).length;
  const national = less === 0 ? `No public site we priced in any state charges less for this load.` : `${less} of the ${all.length} public sites we priced nationwide charge less for this load.`;
  if (same.length <= 1) return { state: `The only ${st} site we priced.`, national };
  const lessHere = same.filter((x) => (x.e.total as number) < (mine.e.total as number) - 0.004);
  const lo = same[0];
  const free = (x: { e: Estimate }) => (isFreeResident(x.e) ? ' for residents' : '');
  if (lessHere.length === 0) return { state: `Cheapest of the ${same.length} ${st} sites we priced.`, national };
  if (same[same.length - 1].f.id === f.id || same.filter((x) => (x.e.total as number) > (mine.e.total as number) + 0.004).length === 0) return { state: `Most expensive of the ${same.length} ${st} sites we priced: ${lo.f.name} (${lo.f.metro}) charges ${money0(lo.e.total as number)}${free(lo)} for the same load.`, national };
  return { state: `${lessHere.length} of the ${same.length} ${st} sites we priced charge less: ${lo.f.name} (${lo.f.metro}) charges ${money0(lo.e.total as number)}${free(lo)}.`, national };
}
