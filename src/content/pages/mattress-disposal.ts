import { definePage } from '../../lib/guide-types';
import { PICKUP_LBS } from '../../lib/mini-specs';

export default definePage({
  id: 'mattress-disposal',
  group: 'items',
  order: 110,
  tool: { kind: 'mini:mattress' },
  related: ['couch-disposal', 'appliance-disposal', 'tire-disposal', 'home'],
  sources: ['mrc_bbm', 'f_fairfax', 'f_salt_lake', 'f_wake', 'f_larimer', 'f_blount', 'f_oc_ca', 'f_riverside', 'f_sac_kiefer'],
  slug: 'mattress-disposal-fee',
  nav: 'Mattress disposal fee',
  card: 'What a public landfill or transfer station charges for a mattress or a box spring, from nothing to forty dollars, site by site.',
  title: 'Mattress Disposal Fee at the Dump: 2026 Public Site Rates',
  description: 'Mattress disposal fee at public landfills and transfer stations in 2026: from free in Sacramento County to $40 each, and the bulky-load rules of some sites.',
  h1: 'Mattress disposal fee: what the dump adds for each mattress',
  intro: (h) => {
    const has = h.E.mattressPriceSites().sort((a, b) => a.mattress! - b.mattress!); const rule = h.E.mattressRuleSites().length;
    // One count everywhere (naive test, 2026-11-09: “7 print a mattress price”, “15 print none” and “9 sites with a mattress rule”).
    return `${has[0].mattress === 0 ? `Nothing extra in ${has[0].place}` : `From ${h.fee(has[0].mattress!)} each in ${has[0].place}`}, up to ${h.fee(has[has.length - 1].mattress!)} each in ${has[has.length - 1].place}. Of the ${h.E.DUMPS.length} public dumps we checked, ${rule} have a mattress rule (${has.length} a price per mattress, ${rule - has.length} a higher rate for the load); the other ${h.E.DUMPS.length - rule} print no mattress price, so ask at the gate.`;
  },
  resume: (h) => {
    const hasFee = h.E.DUMPS.filter((f) => f.mattress != null && f.mattress > 0).sort((a, b) => a.mattress! - b.mattress!);
    const lo = hasFee[0]; const hi = hasFee[hasFee.length - 1];
    return `A mattress disposal fee is the extra charge a landfill or transfer station adds for each mattress or box spring, on top of the fee for the rest of the load. Mattresses are bulky, springs tangle in compaction equipment, and several counties send them to a recycler, so many public schedules list them as a separate item. On the schedules we read on ${h.D.read}, the fee runs from ${h.fee(lo.mattress!)} at ${lo.name} to ${h.fee(hi.mattress!)} at ${hi.name}, where mattresses are recycled. The two Sacramento County sites take household mattresses at no charge. Riverside County does not price the mattress itself: a load with one pays a higher flat rate. Orange County in California adds ${h.fee(h.F('oc-ca').htAdd!)} to a light pickup load carrying an item longer than six feet, such as a mattress. Many other price lists give no mattress price at all: ask the site whether it takes mattresses and what it charges before you go.`;
  },
  faqs: (h) => [
    { q: 'Can I put a mattress in my regular trash?', a: 'That depends on the city, not on this site. Many cities collect mattresses as a bulky item on request, some for a fee, and some refuse them at the curb. The fee schedules we read cover the landfill or transfer station gate, so check the curbside rules of your own city first: a free bulk pickup beats any gate fee.' },
    { q: 'Why does the dump charge extra for mattresses?', a: 'A mattress takes a lot of space for its weight, does not compact, and its springs can wrap around the shafts of landfill compactors. Some counties pay a recycler to take them apart for steel, foam and wood. The extra fee covers that handling. Where the fee is zero, the mattress is still accepted, it simply rides at the price of the load.' },
    { q: 'Is a box spring charged like a mattress?', a: `On the schedules we read, yes: the counties that list a fee give the same amount for a mattress and for a box spring, ${h.fee(h.F('fairfax').mattress!)} each in Fairfax County and ${h.fee(h.F('salt-lake').mattress!)} each in Salt Lake County, for example. Count a queen set as two items in the calculator.` },
  ],
  body: (h) => {
    // Every public site, the ones with no mattress price included (naive test, 4th round: Dallas was lost in a
    // paragraph of sixteen names). Same load as the calculator: a pickup with 600 lbs of household junk.
    const LBS = PICKUP_LBS;
    const rows = h.E.DUMPS.map((f) => {
      const one = h.est(f.id, { mattresses: 1, lbs: LBS }); const none = h.est(f.id, { lbs: LBS });
      if (one.total == null || none.total == null) return null;
      const priced = !h.E.noMattressRule(f);
      const rule = f.mattress != null ? (f.mattress === 0 ? 'Household mattresses free' : `${h.fee(f.mattress)} each`) : f.htFlat ? `The load pays ${h.fee(f.htFlat.pickup!)} instead of ${h.fee(f.flat!.pickup!)} with a mattress` : f.htAdd != null ? `${h.fee(f.htAdd)} extra for items over six feet` : 'No mattress price on the list: ask at the gate';
      return { priced, k: priced ? one.total - none.total : none.total, row: priced ? [h.fl(f), f.metro, rule, h.fee(one.total - none.total), `${one.from ? 'from ' : ''}${h.fee(one.total)}${h.E.isFreeResident(one) ? ' (residents)' : ''}`] : [h.fl(f), f.metro, `${one.from ? 'from ' : ''}${h.fee(one.total)}${h.E.isFreeResident(one) ? ' (residents)' : ''}`] };
    }).filter((x): x is { priced: boolean; k: number; row: string[] } => x != null).sort((a, b) => a.k - b.k);
    // The sites with no mattress price folded apart (naive test, 2026-11-09: fifteen cards saying “ask at the gate”).
    const withRule = rows.filter((x) => x.priced).map((x) => x.row); const without = rows.filter((x) => !x.priced).map((x) => x.row);
    const n = withRule.length;
    return `
<h2>Cheaper ways to get rid of a mattress</h2>
<p>Before paying at the gate, three things are worth a call. Your city may collect bulky items at the curb, sometimes free a few times a year. A store delivering a new mattress may take the old one away, often for a fee printed at checkout. And California, Connecticut, Oregon and Rhode Island run state mattress recycling programs, funded by a small fee paid when a new mattress is sold, with drop-off sites that take used mattresses from residents at no charge; the ${h.src('mrc_bbm', 'Bye Bye Mattress site')} of the Mattress Recycling Council finds the nearest one. We have not read the terms of each drop-off site, so check its page before you go.</p>
<p>If you do take it to the dump, put the mattress on top of the load and keep it dry: a soaked mattress weighs far more, and at a weighed site you pay for the water.</p>

<h2>Mattress fees at the ${n} sites with a mattress rule</h2>
<p>For each site: its mattress rule, what one mattress adds to a pickup with ${h.num(LBS)} lbs of household junk (the load of the main calculator), and the total. Sorted by what one mattress adds, lowest first.</p>
${h.table(['Site', 'Area', 'Mattress rule', 'One mattress adds', 'Load with it'], withRule, `Price lists checked on ${h.D.read}, resident rates.`, ['l', 'l', 'l', 'r', 'r'])}
<p>The other ${without.length} public sites print no mattress price. Ask at the gate whether they take mattresses and what they charge; the load alone costs:</p>
<details class="plie not-prose my-4"><summary class="font-semibold text-accent-700 underline underline-offset-2">Show the ${without.length} sites with no mattress price</summary>
${h.table(['Site', 'Area', `Pickup, ${h.num(LBS)} lbs, without the mattress`], without, `Price lists checked on ${h.D.read}, resident rates.`, ['l', 'l', 'r'])}
</details>
<p>Two California counties use a bulky-load rule instead of a price per mattress. In Riverside County a pickup with a mattress pays a higher flat rate, ${h.fee(h.F('riverside').htFlat!.pickup!)} instead of ${h.fee(h.F('riverside').flat!.pickup!)}, so one mattress or three cost the same (the county’s word for it is the “hard-to-handle” rate). At the Orange County landfills, a pickup under ${h.num(h.F('oc-ca').flatMaxLbs!.pickup!)} lbs pays ${h.fee(h.F('oc-ca').htAdd!)} more if it carries items longer than six feet, and a heavier load is weighed at ${h.fee(h.F('oc-ca').htPerTon!)} a ton instead of ${h.fee(h.F('oc-ca').perTon!)}.</p>

`;
  },
});
