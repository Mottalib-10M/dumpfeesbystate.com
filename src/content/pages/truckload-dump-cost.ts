import { definePage } from '../../lib/guide-types';
import { PICKUP_LBS } from '../../lib/mini-specs';

export default definePage({
  id: 'truckload-dump-cost',
  group: 'fees',
  order: 20,
  tool: { kind: 'mini:pickup' },
  related: ['load-weight-calculator', 'landfill-prices-per-ton', 'dumpster-vs-dump-run', 'home'],
  sources: ['epa_vw', 'f_san_diego', 'f_oc_ca', 'f_riverside', 'f_salt_lake', 'f_sac_kiefer', 'f_larimer'],
  slug: 'cost-to-dump-a-truck-load',
  nav: 'Cost to dump a truckload',
  card: 'Measure the pile in your pickup bed, turn it into pounds with the EPA factors, and price it at the landfill you will drive to.',
  title: 'Cost to Dump a Truck Load: Pickup Bed Priced at 24 Sites',
  description: 'Cost to dump a truck load at a public landfill: measure the pile in your pickup, get its weight from EPA factors and the fee from the site’s own 2026 schedule.',
  h1: 'Cost to dump a truck load: measure the bed, then read the schedule',
  intro: (h) => {
    const lbs = h.E.cubicYards(6.5, 5, 2) * h.E.DENSITY.msw.lbs; const all = h.E.compare({ ...h.LOAD, lbs }); const pay = all.filter((x) => (x.e.total as number) > 0);
    // Says why this range is not the home page's (naive test, 2026-11-09: 600 lbs, “about 660” and 662 read as three answers).
    return `A standard pickup bed (6½ × 5 ft) piled 2 ft high holds about ${h.num(Math.round(lbs))} lbs of household junk, a little more than the ${h.num(PICKUP_LBS)} lb load of the home page, so the cost to dump that truck load is ${h.fee(pay[0].e.total as number)} to ${h.fee(all[all.length - 1].e.total as number)} at the public dumps we checked. Type the size of your own pile below.`;
  },
  resume: (h) => {
    const sd = h.F('san-diego'); const rv = h.F('riverside'); const oc = h.F('oc-ca'); const sl = h.F('salt-lake');
    return `The cost to dump a pickup truck load at a public landfill depends less on the size of the pile than on the rule the site uses. Some sites charge a flat fee per vehicle and never weigh a pickup: ${h.fee(sl.flat!.pickup!)} at ${sl.name}, ${h.fee(rv.flat!.pickup!)} at the Riverside County landfills and ${h.fee(sd.flat!.pickup!)} at ${sd.name} in San Diego, on schedules read on ${h.D.read}. Others weigh every load and charge by the ton above a minimum. A few combine the two: ${oc.name.replace(' landfills', '')} in Orange County charge ${h.fee(oc.flat!.pickup!)} for a pickup under ${h.num(oc.flatMaxLbs!.pickup!)} lbs, then weigh anything heavier. Loose household trash weighs about ${h.num(h.E.DENSITY.msw.lbs)} lbs a cubic yard on the EPA factors, so a typical bed holds a few hundred pounds, and on a weighed schedule that usually means the minimum charge.`;
  },
  faqs: (h) => [
    { q: 'How much does a pickup truck load of trash weigh?', a: `It depends on the bed and how high you pile it. A bed six and a half feet long and five feet wide, filled two feet high, holds about 2.4 cubic yards. At the EPA factor of ${h.num(h.E.DENSITY.msw.lbs)} lbs a cubic yard for loose household trash, that is about ${h.num(Math.round(h.E.cubicYards(6.5, 5, 2) * h.E.DENSITY.msw.lbs))} lbs. The same space filled with broken concrete would weigh over a ton, more than many half-ton pickups are rated to carry.` },
    { q: 'Is it cheaper to dump by weight or at a flat rate?', a: 'For light, bulky loads such as furniture, boxes or brush, a weighed schedule is often cheaper because the load pays only the minimum. For heavy loads such as roofing, tile or dirt, a flat vehicle rate wins, which is why flat-rate sites often weigh trailers or send dense material to another lane. You cannot choose the method at a given site; you can choose the site.' },
    { q: 'Do I need to cover my load?', a: 'Yes, almost everywhere, and the penalty is written into the schedules we read. Seattle adds a few dollars, Riverside County twenty-five, Dallas forty, and San Bernardino County charges double the normal fee. A tarp tied down at the corners is enough. Loose items that fly off on the highway can also lead to a separate traffic fine under state law.' },
  ],
  body: (h) => {
    // Same weight as the calculator above: 6.5 × 5 × 2 ft of loose household trash.
    const LBS = Math.round(h.E.cubicYards(6.5, 5, 2) * h.E.DENSITY.msw.lbs);
    const L = (o: Record<string, number | string> = {}) => ({ lbs: LBS, ...o });
    // Every public site (naive test, 4th round: Dallas was missing from a selection of twelve).
    const ids = h.E.DUMPS.map((f) => f.id);
    const rows = ids.map((id) => { const e = h.est(id, L()); const e2 = h.est(id, { lbs: 1600 }); return { k: e.total ?? 1e9, r: [h.fl(id), h.F(id).metro, e.total == null ? 'n/a' : `${e.from ? 'from ' : ''}${h.fee(e.total)}${h.E.isFreeResident(e) ? ' (free resident load)' : ''}`, e2.total == null ? 'n/a' : `${e2.from ? 'from ' : ''}${h.fee(e2.total)}`, e.rule] }; }).sort((a, b) => a.k - b.k).map((x) => x.r);
    return `
<h2>What it costs to dump this truck load at every public site we read, cheapest first</h2>
<p>All ${h.E.DUMPS.length} public sites we checked, which price a pickup by a flat fee, by weight, or both. Two loads, priced at the resident rate: ${h.num(LBS)} lbs of mixed household trash, the bed in the calculator above, and 1,600 lbs, the same bed piled higher with heavier material. The last line of each site gives the rule for the ${h.num(LBS)} lb load.</p>
<details class="plie not-prose my-4"><summary class="font-semibold text-accent-700 underline underline-offset-2">Show the ${h.E.DUMPS.length} sites</summary>
${h.table(['Site', 'Area', `${h.num(LBS)} lbs`, '1,600 lbs', `Rule for the ${h.num(LBS)} lb load`], rows, `Price lists checked on ${h.D.read}. Resident rates, no mattress, tire or appliance in the load.`, ['l', 'l', 'r', 'r', 'l'])}
</details>
<p>The flat-rate sites charge the same for both loads. The weighed sites charge the minimum, or close to it, for the light one and two to three times more for the heavy one. Phoenix charges its residents nothing for one load a month up to a ton, provided they pay for city trash service.</p>

<h2>Measuring the bed</h2>
<p>Measure the floor of the bed between the wheel wells, or the floor of the trailer, and the average height of the pile, not its peak. A short bed on a full-size pickup is usually about five and a half feet long, a standard bed six and a half and a long bed eight, but check your own truck: the calculator multiplies whatever you type, divides by 27 to get cubic yards, and applies the ${h.src('epa_vw', 'EPA conversion factor')} for the material. Mixed construction debris is about ${h.num(h.E.DENSITY.cd.lbs)} lbs a cubic yard, yard waste ${h.num(h.E.DENSITY.yard.lbs)}. Wet material is heavier than these factors.</p>

<h2>What the flat rate covers</h2>
<p>Flat rates have limits printed beside them. The Riverside County rate covers a pickup or a trailer with a bed up to eight feet; ${h.F('salt-lake').name} weighs trailers towed by a one-ton truck or bigger; the Sacramento County stations weigh any vehicle with a trailer and any load with nine or more tires. Miramar puts a pickup towing a trailer in a second tier at ${h.fee(h.F('san-diego').flat!.trailer!)}. Read the line for your vehicle on the site’s page, linked in the table, before you go.</p>
<p>Mattresses, tires and refrigerators cost extra at many sites, sometimes a lot more than the load itself. The ${h.a('home', 'full calculator')} adds them line by line.</p>
`;
  },
});
