/**
 * Mini-calculator (RECETTE §9.3): a few fields, the figure of the page's subject in large type, two to
 * four lines of detail and a link to the full calculator. The arithmetic is the engine's, through
 * `lib/mini-specs.ts`. First render = build defaults (§17.5). `primary`: main tool of a tool page
 * (result marked `data-resultat`, first screen); otherwise the form is `data-simulateur-secondaire`.
 *
 * Testeurs naïfs du 2026-11-08 (report de la trame, RECETTE §15.8) :
 * - le composant retient les champs modifiés par le lecteur (`touched`, passé à `spec.run`) ; tant
 *   qu'il n'en a modifié aucun, le résultat porte « Example, not your result yet » (MentionExemple),
 *   sauf tant que la ligne du site (« Example: Salt Lake City, Utah. Pick your own dump ») est affichée ;
 *   `saisiParLeLecteur` : valeurs venues d'un lien partagé, donc déjà les siennes, sans mention ;
 * - `title` : deux calculateurs empilés sur une page reçoivent chacun leur titre ; `idPrefix` garde des
 *   id uniques ; `defaults` : valeurs de la page ;
 * - champs `avance` : rangés dans un repli dont le titre montre la valeur actuelle de chacun.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { getSpec } from '../../lib/mini-specs';
import MentionExemple from './MentionExemple';
import { libellesTrame, resumeRepli } from '../../lib/libelles-trame';
import { formatNumber } from '../../lib/format';
import type { MiniInput } from '../../lib/mini-types';
import { DUMPS } from '../../lib/engine/fees';
import { STATE_NAMES } from '../../lib/states';
import { savedDump, saveDump } from '../../lib/choice';

interface Props { kind: string; lang?: string; href?: string; title?: string; defaults?: Record<string, number>; primary?: boolean; idPrefix?: string; saisiParLeLecteur?: boolean; findHref?: string }

export default function MiniSim({ kind, lang = 'en', href, title, defaults = {}, primary = false, idPrefix = 'm', saisiParLeLecteur = false, findHref }: Props) {
  const spec = getSpec(kind);
  const [v, setV] = useState<Record<string, number>>(() => Object.fromEntries(spec.inputs.map((i) => [i.id, defaults[i.id] ?? i.def])));
  const [touched, setTouched] = useState<Record<string, boolean>>(() => (saisiParLeLecteur ? Object.fromEntries(spec.inputs.map((i) => [i.id, true])) : {}));
  const out = useMemo(() => spec.run(v, touched), [v, spec, touched]);
  const [picked, setPicked] = useState(defaults.fac != null);
  const set = (id: string) => (x: number) => { if (id === 'fac') { setPicked(true); if (DUMPS[x]) saveDump(DUMPS[x].id); } setV((o) => ({ ...o, [id]: x })); setTouched((o) => (o[id] ? o : { ...o, [id]: true })); };
  // Same form as the main calculator: the state first, then the dumps of that state only (naive test, 4th round).
  const facInput = spec.inputs.find((i) => i.id === 'fac' && i.options);
  const facOf = (o: { value: string }) => DUMPS[Number(o.value)];
  const states = facInput ? [...new Set(facInput.options!.map((o) => facOf(o)?.state).filter(Boolean) as string[])].sort((a, b) => (STATE_NAMES[a] ?? a).localeCompare(STATE_NAMES[b] ?? b)) : [];
  const curState = facInput ? DUMPS[v.fac]?.state ?? states[0] : '';
  const pickState = (st: string) => { const o = facInput?.options!.find((x) => facOf(x)?.state === st); if (o) set('fac')(Number(o.value)); };
  // The dump picked on an earlier page of this visit (this tab only), instead of the example.
  useEffect(() => {
    if (!facInput || defaults.fac != null || saisiParLeLecteur) return;
    const kept = savedDump(); const idx = kept ? DUMPS.findIndex((x) => x.id === kept) : -1;
    if (idx >= 0 && facInput.options!.some((o) => o.value === String(idx))) { setPicked(true); setV((o) => ({ ...o, fac: idx })); setTouched((o) => ({ ...o, fac: true })); }
  }, []);
  // The site a tool opens on is marked as an example until the reader picks one (naive test, 2nd round).
  const exFac = spec.inputs.some((i) => i.id === 'fac') && !picked ? DUMPS[v.fac] : null;
  const fid = (id: string) => `${idPrefix}-${kind}-${id}`;
  const champ = (i: MiniInput) => (i === facInput
    ? <div key="fac" className="grid gap-3">
      <div>
        <SelectField id={fid('st')} label={exFac ? 'First, pick your state' : 'Your state'} value={curState} onChange={pickState} options={states.map((c) => ({ value: c, label: STATE_NAMES[c] ?? c }))} />
        {exFac && <p className="mt-1 text-sm font-medium text-navy-900">Until you do, the figures are an example for {exFac.metro}, {STATE_NAMES[exFac.state] ?? exFac.state}.</p>}
      </div>
      <SelectField id={fid(i.id)} label="Public dump" value={String(v[i.id])} onChange={(x) => set(i.id)(Number(x))} options={i.options!.filter((o) => facOf(o)?.state === curState).map((o) => ({ ...o, label: o.label.replace(/^[A-Z]{2} · /, '') }))} help={i.help} />
      {findHref && <a href={findHref} className="-mt-1 text-sm text-accent-700 underline underline-offset-2">Not sure which dump serves you?</a>}
    </div>
    : i.options
    ? <SelectField key={i.id} id={fid(i.id)} label={i.label} value={String(v[i.id])} onChange={(x) => set(i.id)(Number(x))} options={i.options} help={i.help} />
    : <NumberField key={i.id} id={fid(i.id)} label={i.label} value={v[i.id]} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} help={i.help} />);
  const avances = spec.inputs.filter((i) => i.avance);
  // The full calculator opens on the site picked here, so the reader does not pick it twice.
  const link = href && spec.ctaPage === 'home' && v.fac != null && DUMPS[v.fac] ? `${href}?f=${DUMPS[v.fac].id}` : href;
  return (
    <div data-chrome data-mini={kind} className={`not-prose rechner ${primary ? '' : 'my-8'} border border-navy-300 bg-white p-4 sm:p-5`}>
      <p className="font-serif text-lg font-semibold text-navy-900">{title ?? spec.title}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        <form className="grid content-start gap-3" onSubmit={(e) => e.preventDefault()} {...(primary ? {} : { 'data-simulateur-secondaire': '' })}>
          {spec.inputs.filter((i) => !i.avance).map(champ)}
          {avances.length > 0 && (
            <details data-repli className="rounded-lg border border-navy-200 px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-navy-700">{libellesTrame(lang).plusDeReglages}
                <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli(lang, avances.map((i) => ({ label: i.label, valeur: valeurAffichee(i, v[i.id]) })))}</span></summary>
              <div className="mt-3 space-y-3">{avances.map(champ)}</div>
            </details>
          )}
        </form>
        <div aria-live="polite" {...(primary ? { 'data-resultat': '' } : {})} className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          {exFac && <p data-exemple className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-800">Example, not your price yet: {exFac.metro}, {STATE_NAMES[exFac.state] ?? exFac.state}</p>}
          {!exFac && <MentionExemple lang={lang} touched={touched} />}
          <p className="text-sm font-medium text-navy-700">{out.head[0]}</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{out.head[1]}</p>
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {out.rows.map(([l, x]) => <tr key={l}><td className="pr-3 text-navy-700">{l}</td><td className="tabular-nums text-right text-navy-900">{x}</td></tr>)}
          </tbody></table>
          {out.note && <p className="mt-2 text-xs text-navy-600">{out.note}</p>}
        </div>
      </div>
      {link && spec.cta && <a href={link} className="mt-4 inline-block text-sm font-medium text-accent-700 underline underline-offset-2 hover:text-accent-900">{spec.cta}</a>}
    </div>
  );
}

/** Valeur d'un champ telle que le lecteur la lit : libellé de l'option choisie, ou nombre et unité. */
export function valeurAffichee(i: MiniInput, x: number): string {
  if (i.options) return i.options.find((o) => o.value === String(x))?.label ?? String(x);
  return `${formatNumber(x, Number.isInteger(x) ? 0 : (i.decimals ?? 0))}${i.unit ? `\u00a0${i.unit}` : ''}`;
}
