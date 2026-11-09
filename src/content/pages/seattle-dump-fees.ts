import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'seattle-dump-fees',
  group: 'metro',
  order: 520,
  tool: { kind: 'dump', props: { facility: 'seattle', also: 'king-county' } },
  related: ['transfer-station-fees', 'yard-waste-disposal', 'appliance-disposal', 'home'],
  sources: ['f_seattle', 'f_king_county', 'f_king_county_next'],
  slug: 'seattle-dump-fees',
  nav: 'Seattle and King County',
  card: 'The minimum charge and per-ton rate at Seattle’s two city transfer stations and the King County stations, 2026 and 2027.',
  title: 'Seattle Dump Fees 2026: City Stations and King County Rates',
  description: 'Seattle dump fees in 2026: the $37 minimum and per-ton rate at the North and South transfer stations, King County station rates, and the 2027 rise announced.',
  h1: 'Seattle dump fees: city stations and King County stations',
  intro: (h) => h.areaIntro('seattle', ['king-county']),
  resume: (h) => {
    const s = h.F('seattle'); const k = h.F('king-county');
    return `Seattle residents hauling their own waste use the city’s North and South transfer stations, run by Seattle Public Utilities. Since April 1, 2026 they charge ${h.fee(s.minCharge!)} for a load of garbage up to ${h.num(s.minCoversLbs!)} lbs and ${h.fee(s.perTon!)} a ton above it; yard waste pays ${h.fee(s.yard!.perTon!)} a ton with a ${h.fee(s.yard!.min!)} minimum. Outside the city, King County’s Solid Waste Division runs its own stations at a higher rate: ${h.fee(k.minCharge!)} per vehicle and ${h.fee(k.perTon!)} a ton in 2026. King County has already announced its 2027 rates for people who bring their own load, ${h.fee(k.next!.minCharge!)} minimum and ${h.fee(k.next!.perTon!)} a ton from January 1, 2027. These are the highest per-ton rates among the public schedules we read, so the scale and the minimum matter more here than almost anywhere else in the country.`;
  },
  faqs: (h) => [
    { q: 'How much does the Seattle transfer station charge for a small load?', a: `A load of garbage up to ${h.num(h.F('seattle').minCoversLbs!)} lbs pays the ${h.fee(h.F('seattle').minCharge!)} minimum at the North or South station. Above that weight the load is billed at ${h.fee(h.F('seattle').perTon!)} a ton, so 600 lbs comes to about ${h.fee(h.tot('seattle', { lbs: 600 }))}. Secure the load: an unsecured one adds a fee from three to ten dollars depending on its weight.` },
    { q: 'Can Seattle residents use King County transfer stations?', a: 'The two systems are run separately, by the city and by the county, and each posts its own rates and rules on who may use its stations, so check the page of the station you plan to visit. For a light load, Seattle’s minimum is lower than King County’s; for a heavy load, Seattle’s per-ton rate is much lower too. Hours and accepted materials differ too.' },
    { q: 'What does Seattle charge for tires and refrigerators?', a: `Vehicle tires pay ${h.fee(h.F('seattle').tire!)} per load, four tires at most. A refrigerator or other appliance with refrigerant pays ${h.fee(h.F('seattle').freon!)} plus the weight when it comes with other material; an appliance-only load pays a higher fee per appliance, two at most. The calculator applies the mixed-load rule.` },
  ],
  body: (h) => {
    const k = h.F('king-county');
    return `
<h2>Seattle Public Utilities, North and South stations</h2>
${h.schedule('seattle')}
<p>The minimum is generous in weight: ${h.num(h.F('seattle').minCoversLbs!)} lbs covers most car loads and many pickups of light junk. The per-ton rate takes over above it, and a heavy load of roofing or soil adds up fast. Yard waste, kept clean, pays a lower rate and a lower minimum, so a pickup of brush costs well under the same weight of garbage.</p>

<h2>King County stations, 2026 and 2027</h2>
${h.schedule('king-county')}
<p>King County charges one minimum per vehicle and one rate for all garbage. Sedans and two-door hatchbacks bringing only yard or wood waste pay a flat ${h.fee(k.yard!.min!)}; other vehicles pay the yard waste rate per ton. The county council approved the 2026 rates in September 2025, and the ${h.src('f_king_county_next', '2027 rates')} were announced in September 2026, a rise of about ${h.pc(k.next!.perTon! / k.perTon! - 1)} in the per-ton rate. Bring the load before the new year if you can.</p>
`;
  },
});
