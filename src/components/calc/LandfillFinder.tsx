/**
 * Open landfills of a state, from the EPA LMOP database (public domain), with public or private
 * ownership and, where we read one, a link to the fee schedule of a public site in that state.
 * Data: `data/landfills-lite.json`, built by scripts/data/build-landfills.py. First render = defaults.
 */
import { useEffect, useMemo, useState } from 'react';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import LITE from '../../data/landfills-lite.json';
import { STATE_NAMES } from '../../lib/states';
import { savedDump } from '../../lib/choice';
import { DUMPS } from '../../lib/engine/fees';

type Row = [string, string, string, string, string, string];
const ROWS = LITE as Row[];
const CODES = [...new Set(ROWS.map((r) => r[3]))].sort((a, b) => (STATE_NAMES[a] ?? a).localeCompare(STATE_NAMES[b] ?? b));
const OPTS = CODES.map((c) => ({ value: c, label: STATE_NAMES[c] ?? c }));
// Owner names carried EPA abbreviations (“SSD #5”, “NUERA”) that told the reader nothing (naive test, 2026-11-09):
// the column says who runs the site in plain words, and the name opens a map search, the only way to a phone
// number and hours, which the EPA file does not hold.
const OWN: Record<string, string> = { P: 'Public body', R: 'Private company', O: 'Other' };
const mapHref = (r: Row) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([spell(r[0]), r[1], STATE_NAMES[r[3]] ?? r[3]].filter(Boolean).join(', '))}`;
/** “Arlington LF” → “Arlington Landfill”: the EPA abbreviation spelled out. */
const spell = (name: string) => name.replace(/\bLF\b/g, 'Landfill').replace(/\bSLF\b/g, 'Sanitary Landfill').replace(/\bMSW\b/g, 'Municipal Solid Waste');
const FIRST = 20;
interface Props { state?: string; idPrefix?: string; schedules?: Record<string, Array<{ name: string; href: string }>> }

export default function LandfillFinder({ state = 'TX', idPrefix = 'lf', schedules = {} }: Props) {
  const [st, setSt] = useState(state);
  const [picked, setPicked] = useState(false);
  const pickState = (x: string) => { setSt(x); setAll(false); setPicked(true); };
  const [own, setOwn] = useState('all');
  const [all, setAll] = useState(false);
  // The state of the dump picked on an earlier page of this visit, instead of the example.
  useEffect(() => { const k = savedDump(); const f = k ? DUMPS.find((x) => x.id === k) : null; if (f && ROWS.some((r) => r[3] === f.state)) { setSt(f.state); setPicked(true); } }, []);
  const sch0 = schedules[st] ?? [];
  // Sites whose price list we read come first, then public ones, then the rest. The EPA writes “LF” for
  // “Landfill”: compare spelled-out names (naive test, 4th round: Salt Lake Valley came 14th).
  const norm = (x: string) => spell(x).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const known = (r: Row) => sch0.some((s) => norm(s.name) === norm(r[0]) || (norm(r[0]).length > 12 && norm(s.name).includes(norm(r[0]))) || (norm(s.name).length > 12 && norm(r[0]).includes(norm(s.name))));
  const list = useMemo(() => ROWS.filter((r) => r[3] === st && (own === 'all' || r[4] === 'P')).map((r, i) => ({ r, i, k: (known(r) ? 0 : 2) + (r[4] === 'P' ? 0 : 1) })).sort((a, b) => a.k - b.k || a.i - b.i).map((x) => x.r), [st, own]);
  const visible = all ? list : list.slice(0, FIRST);
  const pub = ROWS.filter((r) => r[3] === st && r[4] === 'P').length;
  const tot = ROWS.filter((r) => r[3] === st).length;
  const sch = schedules[st] ?? [];
  const nKnown = list.filter(known).length;
  const order = nKnown > 0 ? 'sites with a price list we checked first, then public ones' : 'public ones first';
  return (
    <div data-chrome className="rechner border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          <SelectField id={`${idPrefix}-st`} label="State or territory" value={picked ? st : ''} onChange={(x) => { if (x) pickState(x); }} options={picked ? OPTS : [{ value: '', label: 'Choose your state' }, ...OPTS]} help={picked ? 'Pick another state' : `Until you do, the list below is an example: ${STATE_NAMES[st] ?? st}`} />
          <Toggle id={`${idPrefix}-own`} label="Show" value={own} onChange={setOwn} options={[{ value: 'all', label: 'All open' }, { value: 'pub', label: 'Public only' }]} />
        </form>
        <div data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          {!picked && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-800">Example: {STATE_NAMES[st] ?? st}. Pick your state.</p>}
          <p className="text-sm font-medium text-navy-700">Open landfills in {STATE_NAMES[st] ?? st} on the EPA list</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{tot}</p>
          <p className="mt-1 text-sm text-navy-800"><strong className="tabular-nums">{pub}</strong> owned by a county, city, district or other public body.</p>
          {sch.length > 0
            ? <p className="mt-2 text-sm text-navy-800">Fee schedule read in this state: {sch.map((s, i) => <span key={s.href}>{i > 0 ? ', ' : ''}<a className="underline" href={s.href}>{s.name}</a></span>)}.</p>
            : <p className="mt-2 text-sm text-navy-800">We have not read a fee schedule in this state: call the site or open its page for the current gate rate.</p>}
        </div>
      </div>
      <div className="mt-4 border-t border-navy-200 pt-3">
        <p className="mb-2 text-sm text-navy-800">{list.length > FIRST && !all ? `Showing ${FIRST} of ${list.length}: ${order}.` : `All ${list.length} shown: ${order}.`} Some landfills take loads only from trucking companies, and the EPA list has no phone numbers: tap a name to find it on a map, with its phone and hours, and call before you go.</p>
        <table className="w-full text-sm"><thead><tr><th scope="col" className="py-1 pr-2 text-left text-xs uppercase text-navy-700">Landfill</th><th scope="col" className="py-1 pr-2 text-left text-xs uppercase text-navy-700">City, county</th><th scope="col" className="py-1 text-left text-xs uppercase text-navy-700">Run by</th></tr></thead>
          <tbody>{visible.map((r) => <tr key={r[0] + r[1]} className="border-b border-navy-100"><td className="py-1 pr-2 text-navy-900"><a href={mapHref(r)} target="_blank" rel="nofollow noopener noreferrer" className="text-accent-700 underline underline-offset-2">{spell(r[0])}</a></td><td className="py-1 pr-2 text-navy-700">{[r[1], r[2] && `${r[2]} County`].filter(Boolean).join(', ')}</td><td className="py-1 text-navy-700">{OWN[r[4]]}</td></tr>)}</tbody>
        </table>
        {list.length > FIRST && <button type="button" onClick={() => setAll(!all)} className="mt-3 rounded border border-navy-300 px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-navy-50">{all ? `Show the first ${FIRST} only` : `Show all ${list.length}`}</button>}
      </div>
      <p className="mt-2 text-xs text-navy-600">Source: U.S. EPA, Landfill Methane Outreach Program database, landfills marked open (public domain; no EPA endorsement). The list covers municipal solid waste landfills, not every transfer station or drop-off site, and some do not take loads from residents.</p>
    </div>
  );
}
