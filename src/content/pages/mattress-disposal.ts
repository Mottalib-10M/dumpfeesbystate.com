import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'mattress-disposal',
  group: 'items',
  order: 110,
  tool: { kind: 'mini:mattress' },
  related: ['appliance-disposal', 'tire-disposal', 'orange-county-dump-fees', 'home'],
  sources: ['f_fairfax', 'f_salt_lake', 'f_wake', 'f_larimer', 'f_blount', 'f_oc_ca', 'f_riverside', 'f_sac_kiefer'],
  slug: 'mattress-disposal-fee',
  nav: 'Mattress disposal fee',
  card: 'What a public landfill or transfer station charges for a mattress or a box spring, from nothing to forty dollars, site by site.',
  title: 'Mattress Disposal Fee at the Dump: 2026 Public Site Rates',
  description: 'Mattress disposal fee at public landfills and transfer stations in 2026: from free in Sacramento County to $40 each, and the hard-to-handle rules of some sites.',
  h1: 'Mattress disposal fee: what the dump adds for each mattress',
  intro: 'Pick the public dump nearest you and the number of mattresses or box springs. The tool shows what you pay in all and what the mattresses add. Where the site’s price list gives no mattress price, it says so.',
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
    const rows = h.E.DUMPS.filter((f) => f.mattress != null || f.htAdd != null || f.htFlat != null).map((f) => {
      const one = h.est(f.id, { mattresses: 1, lbs: 300 }).total!; const none = h.est(f.id, { lbs: 300 }).total!;
      const rule = f.mattress != null ? (f.mattress === 0 ? 'Household mattresses free' : `${h.fee(f.mattress)} each`) : f.htFlat ? 'Load moved to the hard-to-handle flat rate' : `${h.fee(f.htAdd!)} hard-to-handle fee on a flat load`;
      return [h.fl(f), f.metro, rule, h.fee(one - none), h.fee(one)];
    }).sort((a, b) => parseFloat(String(a[3]).replace(/[$,]/g, '')) - parseFloat(String(b[3]).replace(/[$,]/g, '')));
    return `
<h2>Mattress fees on public price lists</h2>
<p>For each site whose price list has a mattress rule: the rule, what one mattress adds to a 300 lb pickup load of trash, and the total for that load.</p>
${h.table(['Site', 'Area', 'Rule', 'One mattress adds', 'Load with it'], rows, `Price lists checked on ${h.D.read}, resident rates.`, ['l', 'l', 'l', 'r', 'r'])}
${(() => { const none = h.E.DUMPS.filter((f) => f.mattress == null && f.htAdd == null && f.htFlat == null && f.htPerTon == null); return `<p>Not in the table: ${none.map((f) => `${f.name} (${f.metro})`).join(', ')}. Their price lists give no mattress price. The calculator prices the rest of the load and marks the mattress as not priced: call the site before you go, or ask your city about bulky-item pickup.</p>`; })()}
<p>Some sites use a “hard-to-handle” rule instead: a higher price for a load with bulky items. In Riverside County a pickup with a mattress pays the hard-to-handle flat rate of ${h.fee(h.F('riverside').htFlat!.pickup!)} instead of ${h.fee(h.F('riverside').flat!.pickup!)}, so one mattress or three cost the same. At the Orange County landfills in California, a pickup under ${h.num(h.F('oc-ca').flatMaxLbs!.pickup!)} lbs pays ${h.fee(h.F('oc-ca').htAdd!)} more if it carries items longer than six feet, and a heavier load is weighed at ${h.fee(h.F('oc-ca').htPerTon!)} a ton instead of ${h.fee(h.F('oc-ca').perTon!)}.</p>

<h2>Cheaper ways to get rid of a mattress</h2>
<p>Before paying at the gate, three things are worth a call. Your city may collect bulky items at the curb, sometimes free a few times a year. A store delivering a new mattress may take the old one away, often for a fee printed at checkout. And a few states run mattress recycling programs funded by a small fee paid when a new mattress is sold, with drop-off sites that take used mattresses from residents at no charge. We have not read the rules of those programs for this site, so we print none of their terms: look up the state environmental agency page before you go.</p>
<p>If you do take it to the dump, put the mattress on top of the load and keep it dry: a soaked mattress weighs far more, and at a weighed site you pay for the water.</p>
`;
  },
});
