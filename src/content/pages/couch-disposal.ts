import { definePage } from '../../lib/guide-types';

/**
 * Couch and furniture disposal (query gap of the 2026-11-09 audit: couch disposal, cost, free, near me,
 * junk removal cost for couch). No schedule we read prints a fee per couch: Orange County (California)
 * adds a fee for items longer than six feet and names furniture; Riverside County names mattresses only
 * for its bulky-load rate; everywhere else a couch rides with the load. Every figure comes from the engine.
 */
const LBS = 600;
export default definePage({
  id: 'couch-disposal',
  group: 'items',
  order: 115,
  tool: { kind: 'mini:couch' },
  related: ['mattress-disposal', 'dumpster-vs-dump-run', 'orange-county-dump-fees', 'home'],
  sources: ['f_oc_ca', 'f_riverside', 'f_dallas', 'f_salt_lake', 'f_phoenix', 'f_washington_ut'],
  slug: 'couch-disposal-fee',
  nav: 'Couch and furniture disposal fee',
  card: 'What a public dump charges to take a couch, a sofa or other large furniture, site by site, and where it costs nothing more than the load.',
  title: 'Couch Disposal Fee at the Dump: 2026 Furniture Rates by Site',
  description: 'Couch disposal fee at public landfills in 2026: most sites charge a sofa as part of the load, Orange County adds $15 for furniture, and two offer free loads.',
  h1: 'Couch disposal fee: what a sofa or large furniture costs at the dump',
  intro: (h) => {
    const all = h.E.compare({ ...h.LOAD, lbs: LBS, bulky: 1 });
    const paid = all.filter((x) => (x.e.total as number) > 0);
    const plain = h.E.couchWithLoad().length;
    const free = all.filter((x) => h.E.isFreeResident(x.e)).map((x) => x.f.place.replace(/^City of /, ''));
    // The $0 sites named in the same sentence (naive test, 2026-11-09: “$9.09 to $75” above a list starting at $0).
    return `Usually nothing extra: ${plain} of the ${h.E.DUMPS.length} public price lists we read price a couch with the load, so a pickup of ${h.num(LBS)} lbs with a couch pays ${h.fee(paid[0].e.total as number)} to ${h.fee(all[all.length - 1].e.total as number)}, and nothing once a month for qualifying residents of ${free.join(' and ')}.`;
  },
  resume: (h) => {
    const oc = h.F('oc-ca'); const rv = h.F('riverside');
    const free = h.E.compare({ ...h.LOAD, lbs: LBS, bulky: 1 }).filter((x) => h.E.isFreeResident(x.e)).map((x) => x.f.place);
    return `A couch disposal fee is rarely a line of its own on a public price list. Of the ${h.E.DUMPS.length} landfill and transfer station schedules we read on ${h.D.read}, ${h.E.couchWithLoad().length} price a couch with the rest of the load, and two have a rule for bulky items. Only one names furniture: the Orange County landfills in California add ${h.fee(oc.htAdd!)} to a light car or pickup load carrying an item longer than six feet, and their example list says pieces of wood, furniture and mattresses. Above ${h.num(oc.flatMaxLbs!.pickup!)} lbs they weigh the load at ${h.fee(oc.htPerTon!)} a ton instead of ${h.fee(oc.perTon!)}. The other, Riverside County, has a higher flat rate for bulky loads, ${h.fee(rv.htFlat!.pickup!)} instead of ${h.fee(rv.flat!.pickup!)}, but its ordinance names mattresses and box springs, not sofas, so ask at the gate. Everywhere else the couch rides with the load: it pays the flat vehicle rate, or its weight at the per-ton rate, or nothing more than the minimum charge. ${free.join(' and ')} residents who qualify bring one load a month free. Some sites refuse upholstered furniture or send it to a separate pile, so call before you load it.`;
  },
  faqs: (h) => [
    { q: 'How much does it cost to dump a couch?', a: `At a public dump, usually the price of the load it is in. A pickup with a couch and ${h.num(LBS)} lbs in all pays ${h.fee(h.tot('salt-lake', { lbs: LBS, bulky: 1 }))} at the Salt Lake Valley Landfill, a flat rate per vehicle, and ${h.fee(h.tot('dallas', { lbs: LBS, bulky: 1 }))} at McCommas Bluff in Dallas, where it is weighed. Orange County in California adds ${h.fee(h.F('oc-ca').htAdd!)} for the couch on a light load.` },
    { q: 'Can I get rid of a couch for free?', a: `Sometimes. Phoenix and Washington County in Utah give qualifying residents one free load a month, up to a ton; ask whether the site takes furniture. Many cities also collect bulky items at the curb on request, some for free a few times a year: check your own city’s trash page first. A couch in good condition may also be taken by a charity that collects furniture; ask about their rules on stains and fire labels.` },
    { q: 'Is a couch charged like a mattress at the dump?', a: 'Not on most price lists. Mattresses often have a fee of their own because springs tangle in landfill equipment and several counties recycle them; couches have none on the schedules we read, except where a bulky-item rule names furniture, as in Orange County, California. A sofa bed holds a metal frame and mattress, so ask at the gate how it is charged.' },
    { q: 'Is junk removal worth it for one couch?', a: 'It depends on whether you can move the couch and borrow a pickup. The dump fee for a couch is often the minimum charge or a flat vehicle rate, while a junk removal crew prices the labor of carrying it down stairs. Type the quote you were given into the dumpster or dump run comparison on this site to set it against the fee and the drive.' },
  ],
  body: (h) => {
    const rows = h.E.DUMPS.map((f) => {
      const one = h.est(f.id, { lbs: LBS, bulky: 1 }); const none = h.est(f.id, { lbs: LBS });
      if (one.total == null || none.total == null) return null;
      // Same words as the calculators' result (engine couchRule).
      const r = h.E.couchRule(f); const rule = r.charAt(0).toUpperCase() + r.slice(1);
      return { t: one.total, row: [h.fl(f), f.metro, rule, `${one.from ? 'from ' : ''}${h.fee(one.total)}${h.E.isFreeResident(one) ? ' (residents)' : ''}`] };
    }).filter((x): x is { t: number; row: string[] } => x != null).sort((a, b) => a.t - b.t).map((x) => x.row);
    return `
<h2>Free and cheaper ways first</h2>
<p>Before paying at the gate, look at three cheaper routes. Your city may collect bulky items at the curb, on a schedule or on request; the rules and limits are on its trash page. A store delivering new furniture may take the old piece away. And a couch in good condition can go to a charity that picks up furniture, if it accepts it. We have read none of those programs for this site, so we print no terms for them.</p>
<p>If you do take it to the dump, take the cushions off and load them separately so nothing blows away on the road, and tie the load down: an uncovered load pays a penalty at most of these sites. ${h.a('mattress-disposal', 'A mattress')} is a different matter, with fees of its own at several sites.</p>

<h2>A couch at each public site we read</h2>
<p>Each site with its rule for a couch or sofa, and the total for a pickup carrying the couch with ${h.num(LBS)} lbs in all, the same load as the main calculator. Resident rates; cheapest first. “Priced with the load” means the price list has no couch fee; some sites still refuse upholstered furniture, so ask at the gate wherever you go.</p>
<details class="plie not-prose my-4"><summary class="font-semibold text-accent-700 underline underline-offset-2">Show the ${rows.length} sites</summary>
${h.table(['Site', 'Area', 'Couch rule', `Pickup, ${h.num(LBS)} lbs with a couch`], rows, `Price lists checked on ${h.D.read}.`, ['l', 'l', 'l', 'r'])}
</details>
<p>The order says more about the rule of each site than about couches. Flat-rate sites charge the same whether the couch is in the load or not; weighed sites charge its weight, which for a light load usually means the minimum charge anyway. A couch is mostly air and frame, so it fills a bed long before it weighs much: two couches and a few boxes can need a second trip, and a second trip is a second fee.</p>

<h2>Couch disposal or junk removal</h2>
<p>A junk removal crew charges for the labor of carrying the couch out, which no landfill schedule shows, and the quote is the price of that service. Hauling it yourself costs the gate fee and the drive. The ${h.a('dumpster-vs-dump-run', 'dumpster or dump run comparison')} takes the quote you were given and sets it against the fee of the site you pick and the cost of driving there and back.</p>
`;
  },
});
