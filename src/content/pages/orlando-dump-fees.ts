import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'orlando-dump-fees',
  group: 'metro',
  order: 570,
  tool: { kind: 'dump', props: { facility: 'orange-fl', also: 'miami-dade,jacksonville' } },
  related: ['construction-debris-disposal', 'yard-waste-disposal', 'landfill-prices-per-ton', 'home'],
  sources: ['f_orange_fl', 'f_miami_dade', 'f_jacksonville'],
  slug: 'orlando-dump-fees',
  nav: 'Orlando and Florida sites',
  card: 'Orange County’s landfill and transfer station rates from October 2026, with Miami-Dade and Jacksonville beside them.',
  title: 'Orlando Dump Fees: Orange County Landfill Rates, Oct 2026',
  description: 'Orlando dump fees at the Orange County Landfill and transfer stations from October 1, 2026: garbage, debris, yard waste, plus Miami-Dade and Jacksonville.',
  h1: 'Orlando dump fees: Orange County’s landfill and transfer stations',
  intro: (h) => h.areaIntro('orange-fl', ['miami-dade', 'jacksonville']),
  resume: (h) => {
    const f = h.F('orange-fl'); const md = h.F('miami-dade'); const j = h.F('jacksonville');
    return `Orange County Utilities runs the Orange County Landfill and two transfer stations, Porter and McLeod Road, and under the rates effective October 1, 2026 all three charge ${h.fee(f.perTon!)} a ton for Class I household garbage, with a ${h.fee(f.minCharge!)} minimum. A light pickup load therefore costs little more than the minimum. Yard waste is ${h.fee(f.yard!.perTon!)} a ton at the landfill, but pays the garbage rate at a transfer station. Class III material, meaning construction debris, furniture and clean fill, goes to the landfill only, at ${h.fee(f.cd!.perTon!)} a ton. Passenger tires are ${h.fee(f.tire!)} each up to ${f.tireMax}. Elsewhere in Florida the spread is wide: Miami-Dade charges ${h.fee(md.perTon!)} a ton to non-contract customers, while Jacksonville’s Trail Ridge Landfill lists ${h.fee(j.perTon!)} a ton, with a one-dollar charge for the first ${h.num(j.smallLoad!.maxLbs)} lbs.`;
  },
  faqs: (h) => [
    { q: 'Where should Orlando residents take furniture and construction debris?', a: 'To the Orange County Landfill, which takes Class III material: construction and demolition debris, furniture and clean fill, at its own per-ton rate. The two transfer stations take Class I garbage; Class III loads go to the landfill only. A mixed load of trash and furniture is classed by the weigh station at the gate; sorting it may let part of it go at the lower rate.' },
    { q: 'What does the Miami-Dade landfill charge a homeowner?', a: `The county lists a non-contract disposal rate of ${h.fee(h.F('miami-dade').perTon!)} a ton, the rate that applies to anyone without a hauler contract. Waste delivered to a regional transfer station adds a further charge per ton. The page says the rates are effective as of October 1 without printing the year, so confirm at the weigh station at the gate. Cash is not accepted.` },
    { q: 'Is it really one dollar to dump in Jacksonville?', a: `The City of Jacksonville lists a ${h.fee(h.F('jacksonville').smallLoad!.fee)} charge for the first ${h.num(h.F('jacksonville').smallLoad!.maxLbs)} lbs at the Trail Ridge Landfill and ${h.fee(h.F('jacksonville').perTon!)} a ton above it, for household garbage and building materials. Yard waste is ${h.fee(h.F('jacksonville').yard!.perTon!)} a ton. The page prints no effective date, so check it before going.` },
  ],
  body: (h) => `
<h2>Orange County, from October 1, 2026</h2>
${h.schedule('orange-fl')}
<p>Orange County charges the same garbage rate at the landfill and at the transfer stations, so the nearest site is the right one for ordinary trash. The landfill is the only one of the three that takes construction debris and furniture at the Class III rate and yard waste at its own rate, so for those loads the drive may be worth it. More than eight tires, or truck tires, are charged by the ton at a much higher rate.</p>

<h2>Miami-Dade County</h2>
${h.schedule('miami-dade')}
<p>Miami-Dade’s rate is the highest of the Florida schedules we read, and its contract rate is reserved for permitted haulers and cities. Waste tires are charged by the ton.</p>

<h2>Jacksonville, Trail Ridge</h2>
${h.schedule('jacksonville')}
`,
});
