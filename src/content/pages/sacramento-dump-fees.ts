import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'sacramento-dump-fees',
  group: 'metro',
  order: 540,
  tool: { kind: 'dump', props: { facility: 'sac-kiefer', also: 'sac-nars' } },
  related: ['appliance-disposal', 'mattress-disposal', 'tire-disposal', 'home'],
  sources: ['f_sac_kiefer', 'f_sac_nars'],
  slug: 'sacramento-dump-fees',
  nav: 'California: Sacramento County',
  card: 'Kiefer Landfill and the North Area Recovery Station: vehicle rates, free mattresses, four free tires and two free appliances a day.',
  title: 'Sacramento Dump Fees 2026: Kiefer and North Area Station',
  description: 'Sacramento dump fees in 2026 at Kiefer Landfill and the North Area Recovery Station: flat vehicle rates, free mattresses, four free tires, two free appliances.',
  h1: 'Sacramento dump fees: Kiefer Landfill and the North Area Recovery Station',
  intro: (h) => h.areaIntro('Sacramento', 'sac-kiefer', ['sac-nars']),
  resume: (h) => {
    const k = h.F('sac-kiefer'); const n = h.F('sac-nars');
    return `Sacramento County runs two public sites for people who bring their own load, Kiefer Landfill and the North Area Recovery Station, a transfer station. Both charge a flat rate by vehicle under the fee schedule effective January 1, 2026: ${h.fee(k.flat!.car!)} for a car or small SUV at either site, ${h.fee(k.flat!.pickup!)} for a pickup at Kiefer and ${h.fee(n.flat!.pickup!)} at North Area. Small vans and large SUVs pay ${h.fee(20)} at both sites, large vans a little more than a pickup, and vehicles with trailers are weighed. What sets Sacramento apart is its item policy. Household mattresses go in free, the first ${k.freonFree} large appliances of the day are free, and the first ${k.tireFree} passenger tires a day are free, then ${h.fee(k.tire!)} each up to ${k.tireMax}. A pickup of junk with two mattresses, four tires and a fridge therefore costs the same as the pickup alone: ${h.fee(h.tot('sac-kiefer', { mattresses: 2, tires: 4, freon: 1 }))} at Kiefer.`;
  },
  faqs: (h) => [
    { q: 'Is Kiefer Landfill cheaper than the North Area Recovery Station?', a: `For a pickup, yes: ${h.fee(h.F('sac-kiefer').flat!.pickup!)} at Kiefer against ${h.fee(h.F('sac-nars').flat!.pickup!)} at North Area, and the weighed rate is ${h.fee(h.F('sac-kiefer').perTon!)} a ton at Kiefer against ${h.fee(h.F('sac-nars').perTon!)}. A car pays the same at both. The difference rarely pays for a long detour, so choose the site closer to you unless the load is heavy and weighed.` },
    { q: 'Does Sacramento County charge for mattresses?', a: 'Not for mattresses from a household. The county’s fee pages list mattresses from non-business loads at no charge at both Kiefer and North Area, Mattresses from business loads are not covered by that rule. Remember that the vehicle still pays its own flat fee.' },
    { q: 'When does Sacramento County weigh a load?', a: 'Vehicles with trailers and box trucks are weighed and pay the per-ton rate with a minimum charge, and so are loads with nine or more tires. Cars, SUVs, vans and pickups without a trailer pay the flat rate for their type. Yard waste is weighed separately at its own rate.' },
  ],
  body: (h) => {
    const n = h.F('sac-nars');
    return `
<h2>Kiefer Landfill, the Sacramento County dump</h2>
${h.schedule('sac-kiefer')}
<h2>North Area Recovery Station</h2>
${h.schedule('sac-nars')}
<p>The county gives its own example on the North Area page: a pickup with trash and three refrigerators pays ${h.fee(n.flat!.pickup!)} for the vehicle and ${h.fee(n.freon!)} for the third appliance, the first two being free, ${h.fee(h.tot('sac-nars', { freon: 3 }))} in all. The calculator reproduces that sum exactly, which is one of the tests the site runs on every build.</p>
<p>Green waste is the exception to Sacramento’s low prices. Weighed at ${h.fee(h.F('sac-kiefer').yard!.perTon!)} a ton with a minimum of ${h.fee(h.F('sac-kiefer').yard!.min!)} at Kiefer, a pickup of branches costs more than a pickup of trash at the flat rate. A curbside green waste service, where your hauler offers one, is the better route for regular yard work. Fees are reset on January 1; the ${h.fl('sac-kiefer', 'county fee page')} has the current schedule.</p>
`;
  },
});
