import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'construction-debris-disposal',
  group: 'items',
  order: 150,
  tool: { kind: 'mini:cd' },
  related: ['load-weight-calculator', 'dumpster-vs-dump-run', 'fairfax-county-dump-fees', 'home'],
  sources: ['f_fairfax', 'f_san_diego', 'f_salt_lake', 'f_orange_fl', 'f_swaco', 'f_washington_ut', 'f_dekalb', 'f_broome', 'epa_vw'],
  slug: 'construction-debris-disposal-fee',
  nav: 'Construction debris disposal',
  card: 'What public landfills charge per ton for drywall, shingles, concrete and other remodeling debris, and how heavy those loads get.',
  title: 'Construction Debris Disposal Fee: C&D Rates per Ton, 2026',
  description: 'Construction debris disposal fee at public landfills in 2026: the C&D rate per ton of each site, and what drywall, shingles and concrete weigh in a pickup.',
  h1: 'Construction debris disposal fee: heavy loads, separate rates',
  intro: 'Pick a site, a weight and a vehicle: the tool works out the construction debris disposal fee at the site’s own rate and, for comparison, what the same load pays as trash.',
  resume: (h) => {
    const sd = h.F('san-diego'); const sl = h.F('salt-lake'); const of = h.F('orange-fl');
    return `A construction debris disposal fee is the rate a landfill charges for remodeling waste such as drywall, lumber, roofing shingles, tile, brick and concrete, often called C&D. Because this material is heavy, the rate per ton matters far more than for household trash: a pickup bed of shingles can weigh over a ton. Public schedules read on ${h.D.read} show wide gaps. ${sl.name} takes clean concrete, asphalt, soil or sod at ${h.fee(sl.cd!.perTon!)} a ton, and Orange County in Florida takes Class III debris (the Florida name for construction debris) at its landfill for ${h.fee(of.cd!.perTon!)}. ${sd.name} weighs construction debris at ${h.fee(sd.cd!.perTon!)} a ton, more than twice its trash rate. Several sites limit what a homeowner may bring: Fairfax County takes brick, concrete, dirt and shingles up to two cubic yards a day.`;
  },
  faqs: (h) => [
    { q: 'How much does a load of drywall weigh?', a: `On the EPA conversion factors, drywall scrap weighs about ${h.num(h.P.weights.drywall)} lbs a cubic yard and asphalt shingles about ${h.num(h.P.weights.roofing)}. A pickup bed six and a half by five feet filled one foot high holds about 1.2 cubic yards: some 560 lbs of drywall or 880 lbs of shingles. Broken concrete is about ${h.num(h.P.weights.concrete)} lbs a cubic yard, so a bed of it can exceed a light pickup’s payload.` },
    { q: 'Can I mix construction debris with household trash?', a: 'You can at many sites, but the whole load is then charged at whichever rate the site applies to mixed loads, and some refuse mixed loads at the debris lane. Where the debris rate is lower, as in Salt Lake County for concrete and soil, sort before you go. Where it is higher, as at Miramar, sorting will not lower the price, but recycling the clean material elsewhere may.' },
    { q: 'Does a homeowner need a permit to dump remodeling waste?', a: 'Not usually for small amounts from your own home, but some sites cap the quantity a resident may bring as household debris and treat larger loads as contractor waste, at a commercial rate or account. Asbestos, lead-painted material and treated wood have their own rules nearly everywhere. Read the acceptance page of the site before a demolition job.' },
  ],
  body: (h) => {
    const rows = h.E.DUMPS.filter((f) => f.cd).map((f) => [h.fl(f), f.metro, `${h.fee(f.cd!.perTon)} a ton`, f.cd!.label, h.fee(h.tot(f.id, { material: 'cd', lbs: 2000 }))]).sort((a, b) => parseFloat(String(a[4]).replace(/[$,]/g, '')) - parseFloat(String(b[4]).replace(/[$,]/g, '')));
    const D = h.E.DENSITY;
    const wrows = ['cd', 'drywall', 'lumber', 'roofing', 'concrete', 'dirt', 'carpet'].map((k) => [D[k].label, h.num(D[k].lbs), h.num(D[k].lbs * 2.4)]);
    return `
<h2>Construction debris disposal fees on public schedules</h2>
${h.table(['Site', 'Area', 'Rate', 'What the rate covers', 'One ton'], rows, `Schedules read on ${h.D.read}, resident rates.`, ['l', 'l', 'r', 'l', 'r'])}
<p>The label column matters as much as the price. Salt Lake County’s low rate is for clean concrete, asphalt, soil or sod only; drywall and lumber go with mixed trash at the flat rate. The Solid Waste Authority of Central Ohio (SWACO) has taken construction debris at its landfill only since September 29, 2025. Orange County in Florida takes Class III material at the landfill, not at its transfer stations.</p>

<h2>What the materials weigh</h2>
${h.table(['Material', 'Lbs per cubic yard', 'Lbs in 2.4 cubic yards'], wrows, 'Volume-to-weight factors of the federal environment agency (EPA), April 2016. 2.4 cubic yards is a bed 6.5 by 5 feet, filled 2 feet high.', ['l', 'r', 'r'])}
<p>That is why a bathroom tear-out can cost more at the scale than a whole garage clean-out. If the job is large, set the cost of several trips, with their weight, against a quote for a roll-off container (the open dumpster a truck drops at your home) on the ${h.a('dumpster-vs-dump-run', 'dumpster comparison page')}, which uses the price you were quoted and not a price we made up.</p>
`;
  },
});
