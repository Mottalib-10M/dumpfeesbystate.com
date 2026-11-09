import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'inland-empire-dump-fees',
  group: 'metro',
  order: 590,
  tool: { kind: 'dump', props: { facility: 'riverside', also: 'san-bernardino' } },
  related: ['mattress-disposal', 'tire-disposal', 'orange-county-dump-fees', 'home'],
  sources: ['f_riverside', 'f_san_bernardino'],
  slug: 'inland-empire-dump-fees',
  nav: 'Riverside and San Bernardino',
  card: 'Riverside County’s flat rates and its higher rate for a load with a mattress, and San Bernardino County’s 300 lb small-load fee.',
  title: 'Inland Empire Dump Fees: Riverside and San Bernardino 2026',
  description: 'Inland Empire dump fees in 2026: Riverside County’s flat rate for a car or pickup and its hard-to-handle rate, and San Bernardino’s fee up to 300 lbs.',
  h1: 'Inland Empire dump fees: Riverside County and San Bernardino County',
  intro: (h) => h.areaIntro('riverside', ['san-bernardino']),
  resume: (h) => {
    const r = h.F('riverside'); const s = h.F('san-bernardino');
    return `The two counties of the Inland Empire both run their own landfills and both publish low rates for household loads, built in different ways. Riverside County’s Department of Waste Resources charges, under its schedule effective July 1, 2026, a flat ${h.fee(r.flat!.pickup!)} for a car, van, SUV or pickup with a bed up to eight feet, and ${h.fee(r.flat!.trailer!)} for a pickup with a trailer. A load with a mattress or a box spring, which the ordinance counts as hard to handle, moves to a higher flat rate of ${h.fee(r.htFlat!.pickup!)}. San Bernardino County charges ${h.fee(s.smallLoad!.fee)} for up to ${h.num(s.smallLoad!.maxLbs)} lbs of ordinary household waste and ${h.fee(s.perTon!)} a ton, prorated, above that, under pricing effective July 1, 2023 that was still the posted schedule on ${h.D.read}. Both are well below the Miramar and Orange County rates nearer the coast.`;
  },
  faqs: (h) => [
    { q: 'What counts as hard-to-handle in Riverside County?', a: 'Riverside County’s ordinance sets a separate hard-to-handle flat rate for loads carrying items that are awkward to handle at the landfill, and defines which items count. The calculator applies that rate when a mattress is in the load. One such item or several pays the same flat rate, so ask at the gate whether yours qualify.' },
    { q: 'Is San Bernardino County’s 300 lb fee per vehicle?', a: `Yes. A load of ordinary residential waste up to ${h.num(h.F('san-bernardino').smallLoad!.maxLbs)} lbs pays ${h.fee(h.F('san-bernardino').smallLoad!.fee)}. From 301 lbs the load is weighed and prorated at ${h.fee(h.F('san-bernardino').perTon!)} a ton, so 600 lbs costs about ${h.fee(h.tot('san-bernardino', { lbs: 600 }))}. Hard-to-handle items carry a further charge per ton with its own minimum.` },
    { q: 'How many tires can I bring to a Riverside County landfill?', a: `Residents may bring passenger tires at ${h.fee(h.F('riverside').tire!)} each, five a day at most. San Bernardino County takes tires off the rim, up to nine a load, at ${h.fee(h.F('san-bernardino').tire!)} each. Larger numbers are treated as commercial loads and priced differently, so split them over several days or take them to a tire shop.` },
  ],
  body: (h) => `
<h2>Riverside County landfills</h2>
${h.schedule('riverside')}
<p>Riverside County runs the Badlands, Blythe, Lamb Canyon and El Sobrante landfills under one schedule. A pickup of routine trash pays the flat rate whatever it weighs, so a heavy load is cheap here. Vehicles that are not on the flat-rate list pay ${h.fee(h.F('riverside').perTon!)} a ton with a ${h.fee(h.F('riverside').minCharge!)} minimum. Green waste has its own flat rates, a few dollars above the routine ones. An uncovered load pays a surcharge.</p>

<h2>San Bernardino County</h2>
${h.schedule('san-bernardino')}
<p>The county’s schedule has not changed since July 2023, according to its own page. Hard-to-handle and special handling items cost an extra ${h.fee(53.14)} a ton, with a ${h.fee(26.57)} minimum below one ton, and an uncovered load pays double. For a small load, San Bernardino is the cheaper county; for a heavy load in a pickup, Riverside’s flat rate wins.</p>
`,
});
