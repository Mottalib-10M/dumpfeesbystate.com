import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'phoenix-dump-fees',
  group: 'metro',
  order: 530,
  tool: { kind: 'dump', props: { facility: 'phoenix' } },
  related: ['dumpster-vs-dump-run', 'transfer-station-fees', 'load-weight-calculator', 'home'],
  sources: ['f_phoenix', 'f_tucson'],
  slug: 'phoenix-dump-fees',
  nav: 'Phoenix transfer stations',
  card: 'Phoenix residents’ free monthly load up to a ton, the $55 a ton rate above it, and Tucson’s Los Reales for comparison.',
  title: 'Phoenix Dump Fees: One Free Load a Month and $55 a Ton After',
  description: 'Phoenix dump fees at the 27th Avenue and North Gateway transfer stations: one free load a month up to a ton for residents, then $55 a ton, and Tucson beside it.',
  h1: 'Phoenix dump fees: the free monthly load and what comes after',
  intro: (h) => h.areaIntro('phoenix'),
  resume: (h) => {
    const f = h.F('phoenix'); const t = h.F('tucson');
    return `Phoenix lets its residents dump for free once a month. A household that pays for full city trash service may bring one load of up to one ton, once per calendar month, to the 27th Avenue or North Gateway transfer station at no charge. Anything above one ton is charged at ${h.fee(f.perTon!)} a ton, and other customers pay ${h.fee(f.perTon!)} a ton with a ${h.fee(f.minCharge!)} minimum. The city also takes up to five automobile tires a year from a resident, rims removed. Phoenix’s page prints no effective date for these rates; we read it on ${h.D.read}. In Tucson, the city’s Los Reales Sustainability Campus charges residents who bring their own load ${h.fee(t.smallLoad!.fee)} a load up to ${h.num(t.smallLoad!.maxLbs)} lbs plus a ${h.fee(t.perLoadExtra!)} environmental fee, under a schedule effective July 1, 2026.`;
  },
  faqs: (h) => [
    { q: 'Who qualifies for the free load at Phoenix transfer stations?', a: 'A Phoenix residential customer who pays for full monthly trash service, according to the city’s page. Be ready to show that you are that customer; the page says what the weigh station at the gate accepts. The free load is limited to one per calendar month and one ton; a heavier load leaves a cash deposit and pays for the excess by weight.' },
    { q: 'What does a non-resident pay at a Phoenix transfer station?', a: `The city’s page lists ${h.fee(h.F('phoenix').perTon!)} a ton with a ${h.fee(h.F('phoenix').minCharge!)} minimum. A 600 lb pickup load therefore pays the minimum, and a full ton pays ${h.fee(h.F('phoenix').perTon!)}. Residents of neighboring cities such as Glendale, Tempe or Scottsdale should check what their own city offers before driving to Phoenix.` },
    { q: 'Is the free load free for tires and electronics too?', a: 'Tires have their own allowance: up to five automobile tires a year per resident, without rims. Old CRT televisions and monitors are limited to two per household a month, then charged per unit plus disposal. Other household junk rides with the free load, within the one-ton limit.' },
  ],
  body: (h) => {
    return `
<h2>City of Phoenix transfer stations</h2>
${h.schedule('phoenix')}
<p>For a Phoenix household with city service, the arithmetic is simple: plan your clean-outs so that each month’s load stays under a ton. A garage of boxes and furniture rarely reaches that weight; a pickup of concrete or dirt can pass it. Above the ton, the city collects a cash deposit and charges the excess by weight, which at ${h.fee(h.F('phoenix').perTon!)} a ton is still among the lower rates we read.</p>
<p>The free load changes how to compare a dumpster quote. Ten pickup loads spread over ten months cost nothing at the gate, so the only real cost is your time and driving. A dumpster makes sense when the job cannot wait. The ${h.a('dumpster-vs-dump-run', 'comparison tool')} lets you type the quote and the number of trips.</p>

<h2>Tucson, Los Reales</h2>
${h.schedule('tucson')}
<p>Tucson does not offer a free load but keeps the residential rate flat up to a ton, so a heavy pickup and a light one pay the same. Above a ton, the commercial per-ton rate applies with an ${h.fee(h.F('tucson').minCharge!)} minimum. Tires from residents and refrigerant appliances have their own prices.</p>
`;
  },
});
