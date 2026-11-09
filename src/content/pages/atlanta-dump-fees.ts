import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'atlanta-dump-fees',
  group: 'metro',
  order: 560,
  tool: { kind: 'dump', props: { facility: 'dekalb' } },
  related: ['dumpster-vs-dump-run', 'tire-disposal', 'landfill-prices-per-ton', 'home'],
  sources: ['f_dekalb'],
  slug: 'atlanta-dump-fees',
  nav: 'Atlanta: DeKalb County',
  card: 'DeKalb County’s Seminole Road Landfill: five weight bands for loads under a ton, then $99.80 a ton, with its tire and appliance fees.',
  title: 'Atlanta Dump Fees 2026: Seminole Road Landfill Weight Bands',
  description: 'Atlanta dump fees at DeKalb County’s Seminole Road Landfill in 2026: five weight bands for loads under a ton, the rate per ton above, tires and appliances.',
  h1: 'Atlanta dump fees: DeKalb County’s weight bands at Seminole Road',
  intro: (h) => h.areaIntro('Atlanta', 'dekalb'),
  resume: (h) => {
    const f = h.F('dekalb'); const t = f.tiers!;
    return `DeKalb County, on the east side of the Atlanta area, is the only public operator among those we read that prices small loads in weight bands rather than with a single minimum. At the Seminole Road Landfill in 2026, a load up to ${h.num(t[0].maxLbs)} lbs pays ${h.fee(t[0].fee)}, up to ${h.num(t[1].maxLbs)} lbs ${h.fee(t[1].fee)}, up to ${h.num(t[2].maxLbs)} lbs ${h.fee(t[2].fee)}, up to ${h.num(t[3].maxLbs)} lbs ${h.fee(t[3].fee)} and up to ${h.num(t[4].maxLbs)} lbs ${h.fee(t[4].fee)}. From one ton, the load is charged ${h.fee(f.perTon!)} a ton. The county’s three transfer stations charge more per ton than the landfill. The schedule also lists tires, from ${h.fee(f.tire!)} for a passenger tire under eighteen inches off the rim, and ${h.fee(f.freon!)} for an appliance with refrigerant. It also prints a separate minimum processing fee that we leave out, because the schedule does not say how it combines with the weight bands.`;
  },
  faqs: (h) => [
    { q: 'How much does the DeKalb County landfill charge for a pickup load?', a: `It depends on the band the scale reads. A typical pickup of household junk, 400 to 700 lbs, pays ${h.fee(h.F('dekalb').tiers![1].fee)} or ${h.fee(h.F('dekalb').tiers![2].fee)}. A heavy load of 1,800 lbs pays ${h.fee(h.F('dekalb').tiers![4].fee)}, and from one ton the per-ton rate applies. Keeping a load just under a band limit saves the step to the next one.` },
    { q: 'Can people outside DeKalb County use the Seminole Road Landfill?', a: 'The schedule we read has one price list with no separate column for non-residents, and it does not say the landfill is limited to county residents. Rules on who may use a site can change, so residents of Fulton County or other counties should call before driving a long way, and check what their own county or city offers first.' },
    { q: 'Do the DeKalb weight bands cost the same per pound?', a: 'No. At its upper limit the first band works out to about 6.6 cents a pound, the second and third to about 5 cents, the fourth to 5.6 cents and the fifth to just over 4 cents. Above a ton the per-ton rate is about 5 cents a pound. A load near the top of a band gets the best price per pound; the calculator applies the exact band.' },
  ],
  body: (h) => {
    const f = h.F('dekalb');
    return `
<h2>Atlanta dump fees at Seminole Road Landfill, 2026 schedule</h2>
${h.schedule('dekalb')}
<p>The bands mean a load of 260 lbs pays as much as one of 500 lbs, and a load of 1,001 lbs as much as one of 1,999. If you are close to a limit, it may be worth leaving a heavy item for the next trip, or adding one to fill the band you already pay for.</p>
<p>The county’s Central, East and North transfer stations take the same waste at ${h.fee(105)} a ton, a little more than the landfill gate. Tires above eighteen inches and tires on rims are priced well above passenger tires. We have not read a fee schedule for the City of Atlanta, Fulton County or Cobb County, so this page covers DeKalb only; the ${h.a('landfills-by-state', 'Georgia list of open landfills')} shows the public sites in other counties.</p>
`;
  },
});
