import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'yard-waste-disposal',
  group: 'items',
  order: 140,
  tool: { kind: 'mini:yard' },
  related: ['construction-debris-disposal', 'load-weight-calculator', 'seattle-dump-fees', 'home'],
  sources: ['f_king_county', 'f_seattle', 'f_san_diego', 'f_orange_fl', 'f_broome', 'f_jacksonville', 'f_tucson', 'f_larimer', 'f_fairfax', 'f_sac_kiefer', 'epa_vw'],
  slug: 'yard-waste-disposal-fee',
  nav: 'Yard waste disposal fee',
  card: 'What a load of branches, leaves and grass pays at public landfills, against the trash rate for the same weight.',
  title: 'Yard Waste Disposal Fee: Brush and Leaves at the Dump, 2026',
  description: 'Yard waste disposal fee at public landfills and transfer stations in 2026: the green waste rate of each site against its trash rate, and what sorting saves.',
  h1: 'Yard waste disposal fee: a separate rate, often a lower one',
  intro: 'Pick a site, a vehicle and a weight. The tool prices the load as yard waste and as trash, and shows what keeping it clean saves.',
  resume: (h) => {
    const kc = h.F('king-county'); const br = h.F('broome'); const sk = h.F('sac-kiefer');
    return `A yard waste disposal fee is the rate a landfill or transfer station charges for branches, brush, leaves and grass clippings kept apart from trash, because that material goes to a compost or mulch pile instead of the landfill cell. On most public schedules it is lower than the trash rate. At the King County stations it is ${h.fee(kc.yard!.perTon!)} a ton against ${h.fee(kc.perTon!)} for garbage, and a sedan with yard waste pays a ${h.fee(kc.yard!.min!)} minimum instead of ${h.fee(kc.minCharge!)}. ${br.name} charges ${h.fee(br.yard!.perTon!)} a ton for yard waste against ${h.fee(br.perTon!)}. It is not always cheaper: at ${sk.name} in Sacramento County, green waste is weighed at ${h.fee(sk.yard!.perTon!)} a ton, while a pickup of trash pays a flat ${h.fee(sk.flat!.pickup!)}. Schedules read on ${h.D.read}. A load counts as yard waste only if it is clean: a bag of trash or a piece of lumber in it moves the whole load to the trash rate.`;
  },
  faqs: (h) => [
    { q: 'What counts as clean yard waste?', a: 'Leaves, grass clippings, branches, brush, shrubs and small stumps, with no trash, plastic bags, rocks, soil, lumber or painted wood mixed in. Many sites ask for loose material or paper yard bags rather than plastic ones, and some limit the length or diameter of branches. Read the acceptance list of your site; the fee pages we link spell it out.' },
    { q: 'How much does a pickup load of brush weigh?', a: `Less than people expect. The EPA factors give about ${h.num(h.P.weights.branches)} lbs a cubic yard for loose branches and prunings, and ${h.num(h.P.weights.yard_loose)} for mixed yard waste. A bed six and a half feet by five, heaped three feet high, is about 3.6 cubic yards of brush, under 500 lbs. Wet grass clippings weigh much more for the same space.` },
    { q: 'Is yard waste free to drop off?', a: 'At some county sites and city composting yards it is, especially for residents bringing leaves in the fall, and many cities collect it at the curb in a separate cart. Phoenix and Washington County in Utah take one resident load a month under a ton at no charge, whatever it holds; most other schedules we read price green waste below trash. Your city’s curbside cart is almost always the cheapest option for regular amounts.' },
  ],
  body: (h) => {
    const rows = h.E.DUMPS.filter((f) => f.yard).map((f) => { const y = h.est(f.id, { material: 'yard', lbs: 500 }); const t = h.est(f.id, { lbs: 500 }); const yr = f.yard!; const rule = yr.flat?.pickup != null ? `${h.fee(yr.flat.pickup)} flat for a pickup` : `${h.fee(yr.perTon!)} a ton${yr.min ? `, ${h.fee(yr.min)} minimum` : ''}`; return [h.fl(f), f.metro, rule, y.total == null ? 'n/a' : h.fee(y.total), t.total == null ? 'n/a' : h.fee(t.total)]; });
    const sd = h.F('san-diego'); const fx = h.F('fairfax');
    return `
<h2>Yard waste against trash, 500 lbs in a pickup</h2>
${h.table(['Site', 'Area', 'Yard waste rule', 'As yard waste', 'As trash'], rows, `Schedules read on ${h.D.read}, resident rates.`, ['l', 'l', 'l', 'r', 'r'])}
<p>Flat-rate sites often have a separate flat rate for green waste. Miramar charges a pickup ${h.fee(sd.yard!.flat!.pickup!)} for clean green waste against ${h.fee(sd.flat!.pickup!)} for trash, and Larimer County ${h.fee(h.F('larimer').yard!.flat!.pickup!)} against ${h.fee(h.F('larimer').flat!.pickup!)}. Fairfax County splits further: brush pays ${h.fee(fx.brush!.perTon!)} a ton, or ${h.fee(fx.brush!.flat!.pickup!)} for a pickup, while leaves and grass pay ${h.fee(fx.yard!.perTon!)}.</p>

<h2>Sorting pays at most sites</h2>
<p>The saving is largest where trash is expensive and green waste is not: in the Seattle area, a pickup of brush can cost half as much as the same weight of garbage. Where a site charges trash at a flat vehicle rate, green waste weighed by the ton can cost more for a heavy load, as the Sacramento County line shows. The ${h.a('load-weight-calculator', 'weight calculator')} estimates what your pile weighs before you go, and the ${h.a('construction-debris-disposal', 'debris page')} covers the other material that has its own rate.</p>
<p>Stumps, large logs and soil may be refused on the yard waste pile or charged as other material, and treated or painted wood is never yard waste. If the site prints a size limit for branches, cut them to it at home: a load sent back to the trash lane pays the trash rate.</p>
`;
  },
});
