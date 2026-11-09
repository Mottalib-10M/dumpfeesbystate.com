import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'orange-county-dump-fees',
  group: 'metro',
  order: 610,
  tool: { kind: 'dump', props: { facility: 'oc-ca', lbs: 600, mattresses: 1 } },
  related: ['mattress-disposal', 'san-diego-dump-fees', 'inland-empire-dump-fees', 'home'],
  sources: ['f_oc_ca'],
  slug: 'orange-county-dump-fees',
  nav: 'Orange County, California',
  card: 'OC Waste & Recycling: $15 for a car under 360 lbs, $30 for a pickup under 880 lbs, then by the ton, and the hard-to-handle fee.',
  title: 'Orange County Dump Fees 2026: Olinda Alpha, Prima Deshecha',
  description: 'Orange County dump fees in 2026 at the Olinda Alpha and Prima Deshecha landfills: flat rates for light car and pickup loads, a rate per ton, and bulky items.',
  h1: 'Orange County dump fees: Olinda Alpha and Prima Deshecha',
  intro: 'The calculator opens on a 600 lb pickup load with a mattress at the OC Waste & Recycling landfills.',
  resume: (h) => {
    const f = h.F('oc-ca');
    return `OC Waste & Recycling runs the public landfills of Orange County, California, and its schedule effective July 1, 2026 through June 30, 2027 has a flat rate for light loads and a per-ton rate for the rest. Autos, minivans and SUVs pay ${h.fee(f.flat!.car!)} for a load under ${h.num(f.flatMaxLbs!.car!)} lbs; pickups and vans pay ${h.fee(f.flat!.pickup!)} for a load under ${h.num(f.flatMaxLbs!.pickup!)} lbs. Heavier loads are weighed at ${h.fee(f.perTon!)} a ton, or ${h.fee(f.htPerTon!)} if they hold hard-to-handle items. On a flat-rate load, items longer than six feet, such as wood, furniture or a mattress, add ${h.fee(f.htAdd!)}. This page covers Olinda Alpha and Prima Deshecha, the two landfills named on the schedule we read. Orange County sits in the Los Angeles area, where the sanitation districts that serve Los Angeles County could not be opened when we checked them, so we print no figure for them.`;
  },
  faqs: (h) => [
    { q: 'What does it cost to dump a pickup load in Orange County?', a: `${h.fee(h.F('oc-ca').flat!.pickup!)} if the load weighs under ${h.num(h.F('oc-ca').flatMaxLbs!.pickup!)} lbs, plus ${h.fee(h.F('oc-ca').htAdd!)} if it includes items longer than six feet. A heavier load is weighed: 1,200 lbs of routine trash costs about ${h.fee(h.tot('oc-ca', { lbs: 1200 }))}. The fee schedule is the same at both landfills open to the public.` },
    { q: 'Is a mattress hard-to-handle at the OC landfills?', a: 'The schedule names items longer than six feet, including wood, furniture and mattresses, as hard-to-handle. On a flat-rate load they add a fixed fee once per load. On a weighed load the whole load moves to the hard-to-handle rate per ton. Either way, one mattress costs the same as several.' },
    { q: 'Do Los Angeles County residents pay the Orange County rates?', a: 'The OC schedule we read does not print a separate rate for residents of other counties. The fee pages of the Los Angeles County Sanitation Districts could not be opened when we checked them, so we cannot compare their rates here. Call the site before driving across the county line.' },
  ],
  body: (h) => `
<h2>OC Waste & Recycling, from July 1, 2026</h2>
${h.schedule('oc-ca')}
<p>The weight limits make the scale decisive. A car under ${h.num(h.F('oc-ca').flatMaxLbs!.car!)} lbs and a pickup under ${h.num(h.F('oc-ca').flatMaxLbs!.pickup!)} lbs pay the flat rate; one pound more and the whole load is priced per ton. At ${h.fee(h.F('oc-ca').perTon!)} a ton, a pickup just above the limit pays about ${h.fee(h.tot('oc-ca', { lbs: 900 }))}, more than the flat ${h.fee(h.F('oc-ca').flat!.pickup!)}. If your load is near the limit, two lighter trips can cost less than one heavy one.</p>
<p>Paint, batteries and other household hazardous waste do not belong in a trash load anywhere; ask the county where to take them. Compare with ${h.a('inland-empire-dump-fees', 'Riverside County')}, where a pickup pays a flat rate at any weight, and with ${h.a('san-diego-dump-fees', 'Miramar')}, where the flat rate is higher but covers a full load.</p>
`,
});
