/**
 * Main tool: what one landfill or transfer station charges for a load, from its own published schedule,
 * line by line (load, per-load fee, mattresses, tires, refrigerant appliances), then the same load at
 * every other schedule read. All arithmetic is `lib/engine/fees.ts`. Hydration (RECETTE §17.5): first
 * render = props defaults, link parameters applied in an effect.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { DUMPS, READ_ON, facilityLabel, VEHICLE_LABEL, MATERIAL_LABEL, EXAMPLE_ID, DENSITY, cubicYards, estimate, compare, missingText, rankPhrase, isFreeResident, freeCondition, type Vehicle, type Material, type Estimate, type Facility } from '../../lib/engine/fees';
import { P } from '../../lib/engine/params';
import { STATE_NAMES } from '../../lib/states';
import { formatMoney, formatNumber, displayDate } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

interface Props { facility?: string; vehicle?: Vehicle; lbs?: number; material?: Material; mattresses?: number; tires?: number; freon?: number; methodHref: string; weightHref?: string; idPrefix?: string }
const fee = (n: number) => (Math.abs(n - Math.round(n)) < 0.005 ? formatMoney(Math.round(n), 0) : formatMoney(n, 2));
// Sorted by state, then area, so a reader finds their own state at a glance.
// The state comes first, then the sites of that state only (naive test, 2nd round: “by state” in the
// title, but no state question, and long site names cut in a 24-line list).
const SORTED = [...DUMPS].sort((a, b) => a.state.localeCompare(b.state) || a.metro.localeCompare(b.metro));
const STATES = [...new Set(SORTED.map((f) => f.state))].sort((a, b) => (STATE_NAMES[a] ?? a).localeCompare(STATE_NAMES[b] ?? b));
const STATE_OPTS = STATES.map((c) => ({ value: c, label: STATE_NAMES[c] ?? c }));
const facOpts = (st: string) => SORTED.filter((f) => f.state === st).map((f) => ({ value: f.id, label: facilityLabel(f) }));
/** Price shown in a comparison list: “$0 for residents” rather than a bare zero; the condition is printed under it. */
const listFee = (e: Estimate) => `${e.from ? 'from ' : ''}${fee(e.total as number)}${isFreeResident(e) ? ' for residents' : ''}${e.missing.length ? ' *' : ''}`;
const where = (f: Facility) => `${f.metro}, ${f.state}`;
// Weight hint from the EPA factors already used by the truckload page: a 6.5 × 5 ft bed piled 2 ft high.
const BED_LBS = Math.round(cubicYards(6.5, 5, 2) * DENSITY.msw.lbs / 10) * 10;
const VEH_OPTS = (Object.keys(VEHICLE_LABEL) as Vehicle[]).map((v) => ({ value: v, label: VEHICLE_LABEL[v] }));
const MAT_OPTS = (Object.keys(MATERIAL_LABEL) as Material[]).map((v) => ({ value: v, label: MATERIAL_LABEL[v] }));

export default function DumpCalc(p: Props) {
  const example = p.facility == null;
  const d = { facility: EXAMPLE_ID, vehicle: 'pickup' as Vehicle, lbs: 600, material: 'trash' as Material, mattresses: 0, tires: 0, freon: 0, ...p };
  const [fid, setFid] = useState(d.facility);
  // “Example” until the reader picks a state or a site, or opens a link to a load.
  const [picked, setPicked] = useState(!example);
  const pickFac = (x: string) => { setFid(x); setPicked(true); };
  const pickState = (st: string) => { const first = SORTED.find((f) => f.state === st); if (first) pickFac(first.id); };
  const [vehicle, setVehicle] = useState<Vehicle>(d.vehicle);
  const [lbs, setLbs] = useState(d.lbs);
  const [material, setMaterial] = useState<Material>(d.material);
  const [mattresses, setMattresses] = useState(d.mattresses);
  const [tires, setTires] = useState(d.tires);
  const [freon, setFreon] = useState(d.freon);
  const [resident, setResident] = useState(true);
  const [copied, setCopied] = useState(false);
  // Bar at the bottom of a phone screen: only once the reader has changed a field and while the
  // result card is off screen, so it never covers a field of the untouched form.
  const [touched, setTouched] = useState(false);
  const [resultSeen, setResultSeen] = useState(true);
  const [toolSeen, setToolSeen] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const o1 = new IntersectionObserver(([x]) => setResultSeen(x.isIntersecting));
    const o2 = new IntersectionObserver(([x]) => setToolSeen(x.isIntersecting));
    if (resRef.current) o1.observe(resRef.current);
    if (rootRef.current) o2.observe(rootRef.current);
    return () => { o1.disconnect(); o2.disconnect(); };
  }, []);

  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    const f = str(u, 'f', d.facility); if (DUMPS.some((x) => x.id === f)) { setFid(f); setPicked(true); }
    const v = str(u, 'v', d.vehicle); if (v in VEHICLE_LABEL) setVehicle(v as Vehicle);
    const m = str(u, 'm', d.material); if (m in MATERIAL_LABEL) setMaterial(m as Material);
    setLbs(num(u, 'w', d.lbs)); setMattresses(num(u, 'mt', d.mattresses)); setTires(num(u, 't', d.tires)); setFreon(num(u, 'r', d.freon));
    setResident(str(u, 'res', '1') === '1');
  }, []);
  useEffect(() => {
    updateURL({ f: fid, v: vehicle, w: lbs, m: material, mt: mattresses, t: tires || undefined, r: freon || undefined, res: resident ? undefined : 0 });
  }, [fid, vehicle, lbs, material, mattresses, tires, freon, resident]);

  const f = DUMPS.find((x) => x.id === fid) ?? DUMPS[0];
  const load = { vehicle, lbs, material, mattresses, tires, freon, resident };
  const e = useMemo(() => estimate(f, load), [f, vehicle, lbs, material, mattresses, tires, freon, resident]);
  const all = useMemo(() => compare(load), [vehicle, lbs, material, mattresses, tires, freon, resident]);
  const rank = all.findIndex((x) => x.f.id === f.id);
  const share = () => { try { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard refused */ } };
  const id = (x: string) => `${p.idPrefix ?? 'dc'}-${x}`;
  const eff = f.effective ? `effective ${displayDate(f.effective, 'en-US')}` : f.effectiveText;
  const others = all.filter((x) => x.f.id !== f.id);
  const near = others.filter((x) => x.f.state === f.state).slice(0, 4);
  const far = others.filter((x) => !near.includes(x)).slice(0, 6);
  const shown = [...near, ...far];
  const isEx = example && !picked;
  const line = (x: { f: Facility; e: Estimate }, withState: boolean) => (
    <li key={x.f.id} className="grid grid-cols-[1fr_auto] gap-x-3">
      <span className="text-navy-700">{x.f.name} ({withState ? where(x.f) : x.f.metro})</span><span className="tabular-nums text-right text-navy-900">{listFee(x.e)}</span>
      {isFreeResident(x.e) && <span className="col-span-2 text-xs text-navy-600">Free only for: {freeCondition(x.f)}.</span>}
    </li>
  );

  return (
    <div ref={rootRef} data-chrome className="rechner border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <form className="grid content-start gap-4" onSubmit={(ev) => ev.preventDefault()} onChangeCapture={() => setTouched(true)} onClickCapture={(ev) => { if ((ev.target as HTMLElement).closest('button')) setTouched(true); }}>
          {isEx && <p className="text-sm font-medium text-navy-900">Example shown: {f.name}, {where(f)}. Pick your state and your dump to see your own price.</p>}
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <SelectField id={id('st')} label="Your state" value={f.state} onChange={pickState} options={STATE_OPTS} help={`${STATES.length} states on our list`} />
            <SelectField id={id('fac')} label="Public dump" value={fid} onChange={pickFac} options={facOpts(f.state)} help="Landfill, or transfer station: a drop-off site that trucks the waste on to a landfill" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <SelectField id={id('veh')} label="Vehicle" value={vehicle} onChange={(v) => setVehicle(v as Vehicle)} options={VEH_OPTS} />
            <NumberField id={id('lbs')} label="Weight of the load" value={lbs} onChange={setLbs} unit="lbs" max={40000} help="A guess is fine; the scale decides" />
          </div>
          <p className="-mt-2 text-xs text-navy-600">Not sure of the weight? A standard pickup bed (6½ × 5 ft) piled 2 ft high with household junk is about {formatNumber(BED_LBS, 0)} lbs on the federal EPA factors; a fridge alone is about {formatNumber(P.weights.refrigerator, 0)} lbs.{p.weightHref ? <> <a href={p.weightHref} className="underline underline-offset-2">Measure your load instead</a>.</> : null}</p>
          <SelectField id={id('mat')} label="What the load is" value={material} onChange={(v) => setMaterial(v as Material)} options={MAT_OPTS} />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3 sm:gap-y-0">
            <NumberField id={id('mt')} label="Mattresses" value={mattresses} onChange={setMattresses} max={20} help="Box springs too" />
            <NumberField id={id('tires')} label="Tires" value={tires} onChange={setTires} max={50} />
            <NumberField id={id('freon')} label="Fridges, air conditioners" value={freon} onChange={setFreon} max={20} help="Freezers too" />
          </div>
          <Toggle id={id('res')} label="You live in the area it serves" value={resident ? '1' : '0'} onChange={(v) => setResident(v === '1')} options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }]} />
        </form>
        <div ref={resRef} data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <p className="text-sm font-medium text-navy-700">{isEx ? `Example: ${f.name}, ${where(f)}` : `At ${f.name}, ${where(f)}`}</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{e.total == null ? 'Not priced' : `${e.from ? 'from ' : ''}${fee(e.total)}`}</p>
          {e.total == null
            ? <p className="mt-1 text-sm text-navy-800">{e.rule}. Pick another site or another kind of load.</p>
            : <p className="mt-1 text-sm text-navy-800">{rank >= 0 ? <strong className="font-semibold">{rankPhrase(rank + 1, all.length)}</strong> : null}</p>}
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {e.lines.map((x) => <tr key={x.label}><td className="pr-2 text-navy-700">{x.label}</td><td className="tabular-nums text-right text-navy-900">{fee(x.amount)}</td></tr>)}
            {e.missing.map((x) => { const [what, why] = missingText(x); return <tr key={x}><td className="pr-2 text-navy-700">{what}</td><td className="text-right text-navy-900">{why}</td></tr>; })}
            {e.total != null && <tr className="total"><td className="pr-2 text-navy-700">Total</td><td className="tabular-nums text-right text-navy-900">{fee(e.total)}</td></tr>}
          </tbody></table>
          <p className="mt-2 text-xs text-navy-600">{f.operator}, price list {eff}, checked on {displayDate(READ_ON, 'en-US')} on <a href={f.url} target="_blank" rel="nofollow noopener noreferrer" className="underline">the official page</a>. {f.notes[0]}</p>
        </div>
      </div>
      {shown.length > 0 && (
        <div className="mt-4 border-t border-navy-200 pt-3">
          {near.length > 0
            ? <>
              <p className="text-sm font-semibold text-navy-900">Same load at other public sites in {STATE_NAMES[f.state] ?? f.state}</p>
              <ul className="mt-2 mb-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">{near.map((x) => line(x, false))}</ul>
            </>
            : <p className="mb-2 text-sm text-navy-700">No other public site in {STATE_NAMES[f.state] ?? f.state} on our list.</p>}
          {/* Other states, folded: nobody drives to another state to dump a pickup (naive test, 2nd round). */}
          <details className="plie text-sm">
            <summary className="cursor-pointer font-medium text-accent-700 underline underline-offset-2">For comparison only: the cheapest sites in other states</summary>
            <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">{far.map((x) => line(x, true))}</ul>
          </details>
          {shown.some((x) => x.e.missing.length) && <p className="mt-1 text-xs text-navy-600">* That site’s price list has no price for an item in your load (a mattress, for example). The item is not counted: ask at the gate.</p>}
        </div>
      )}
      <div aria-hidden="true" hidden={!touched || resultSeen || !toolSeen} className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-300 bg-white/95 px-4 py-2 text-sm text-navy-900 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] lg:hidden print:hidden">{f.name}: <strong className="tabular-nums">{e.total == null ? 'not priced' : fee(e.total)}</strong> · {formatNumber(lbs, 0)} lbs</div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to this load'}</button>
        <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        <a href={p.methodHref} className="text-accent-700 underline underline-offset-2">How this is calculated</a>
        <span className="text-xs text-navy-600">Fees from official price lists. No quote form, no ZIP code.</span>
      </div>
    </div>
  );
}
