import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'fairfax-county-dump-fees',
  group: 'metro',
  order: 600,
  tool: { kind: 'dump', props: { facility: 'fairfax' } },
  related: ['transfer-station-fees', 'mattress-disposal', 'construction-debris-disposal', 'home'],
  sources: ['f_fairfax'],
  slug: 'fairfax-county-dump-fees',
  nav: 'Fairfax County, Virginia',
  card: 'Fairfax County’s residential rates for July 2026 to June 2027 at the I-66 Transfer Station and I-95 Landfill Complex: minimums by vehicle, bags, items.',
  title: 'Fairfax County Dump Fees: I-66 and I-95 Rates for FY 2027',
  description: 'Fairfax County dump fees from July 1, 2026 at the I-66 and I-95 sites: minimums by vehicle size, bag rates, brush, debris, mattresses and appliances alike.',
  h1: 'Fairfax County dump fees: the 2026-27 residential schedule',
  intro: (h) => h.areaIntro('Fairfax County', 'fairfax'),
  resume: (h) => {
    const f = h.F('fairfax'); const b = f.bags!;
    return `Fairfax County, in the Washington, DC area, publishes one of the most detailed residential schedules we read. For its fiscal year 2027, from July 1, 2026 to June 30, 2027, trash at the I-66 Transfer Station and the I-95 Landfill Complex is ${h.fee(f.perTon!)} a ton, with three minimums by size of vehicle: ${h.fee(f.minByVehicle!.car!)}, ${h.fee(f.minByVehicle!.pickup!)} and ${h.fee(f.minByVehicle!.trailer!)}. Small amounts can be paid by the bag instead: ${h.fee(b[0].fee)} for one to ${b[0].max} bags, ${h.fee(b[1].fee)} for up to ${b[1].max}, and a lower rate for residents aged 60 and over bringing one or two. Brush, yard waste and heavy debris such as brick, concrete and shingles each have their own rate per ton. A mattress or box spring is ${h.fee(f.mattress!)}, an appliance needing refrigerant or capacitor removal ${h.fee(f.freon!)}, a tire ${h.fee(f.tire!)}. Proof of county residency may be requested.`;
  },
  faqs: (h) => [
    { q: 'Which minimum applies to my vehicle in Fairfax County?', a: `The schedule prints three weighed minimums, small, medium and large: ${h.fee(h.F('fairfax').minByVehicle!.car!)}, ${h.fee(h.F('fairfax').minByVehicle!.pickup!)} and ${h.fee(h.F('fairfax').minByVehicle!.trailer!)}. We match them to a car, a pickup and a vehicle with a trailer; the weigh station at the gate decides the category of your vehicle. Above the minimum, the load is charged ${h.fee(h.F('fairfax').perTon!)} a ton.` },
    { q: 'Can I bring just a few bags to the I-66 Transfer Station?', a: `Yes, and Fairfax County prices them without weighing the car: ${h.fee(h.F('fairfax').bags![0].fee)} for one to five bags and ${h.fee(h.F('fairfax').bags![1].fee)} for six to ten. Residents aged 60 or over pay a lower fee for one or two bags. For more than ten bags, the load is weighed and pays at least the minimum for the vehicle.` },
    { q: 'How much shingle and concrete can I bring to the I-95 complex?', a: `The county takes brick, concrete, dirt, rock and shingles from residents at ${h.fee(h.F('fairfax').cd!.perTon)} a ton, up to two cubic yards a day. At the EPA factor for broken concrete, two cubic yards weigh about ${h.num(2 * h.P.weights.concrete)} lbs, so that limit comes before the payload of most pickups.` },
  ],
  body: (h) => {
    const f = h.F('fairfax');
    return `
<h2>Fairfax County dump fees for residents, July 2026 to June 2027</h2>
${h.schedule('fairfax')}
<p>The bag rate is the cheapest way to get rid of a little trash: five bags cost less than the smallest weighed minimum. Brush is cheaper still if it is kept apart, at ${h.fee(f.brush!.perTon!)} a ton or ${h.fee(f.brush!.flat!.pickup!)} for a pickup. White goods that need no refrigerant removal, such as a washer or a stove, are charged by the ton like scrap. Ten tires a visit is the limit at the tire price.</p>
<p>The county’s schedule is a PDF updated each fiscal year; the link under the table opens the version for the county’s 2027 budget year (FY 2027). Neighboring Prince William County and the Maryland counties across the river publish their own rates, which we could not read for this site.</p>
`;
  },
});
