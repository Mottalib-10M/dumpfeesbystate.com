import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'load-weight-calculator',
  group: 'tools',
  order: 310,
  tool: { kind: 'mini:weight' },
  related: ['truckload-dump-cost', 'landfill-prices-per-ton', 'construction-debris-disposal', 'home'],
  sources: ['epa_vw'],
  slug: 'load-weight-calculator',
  nav: 'Load weight calculator',
  card: 'Turn the length, width and height of a pile into cubic yards and pounds, with the EPA factor for ten common materials.',
  title: 'Load Weight Calculator: Cubic Yards to Pounds, EPA Factors',
  description: 'Load weight calculator for a dump run: turn the size of a pile into cubic yards, pounds and tons with the EPA factors for trash, brush, drywall and concrete.',
  h1: 'Load weight calculator: from the size of a pile to pounds',
  intro: 'Choose the material and type the size of the pile in feet. The tool gives cubic yards, pounds and tons, using the EPA conversion factor for that material.',
  resume: (h) => {
    const D = h.E.DENSITY;
    return `A load weight calculator turns the volume of a pile into the weight a landfill scale will read, so you can tell in advance whether a load stays under the minimum charge or how many tons you will pay for. The volume is length times width times height in feet, divided by 27 to get cubic yards. The weight is that volume times a density for the material. This tool uses the factors the EPA published in April 2016 for converting waste volumes to weights: about ${h.num(D.msw.lbs)} lbs a cubic yard for loose household trash, ${h.num(D.yard.lbs)} for yard waste, ${h.num(D.drywall.lbs)} for drywall, ${h.num(D.roofing.lbs)} for asphalt shingles and ${h.num(D.concrete.lbs)} for broken concrete. The same space can therefore weigh three or four times more depending on what fills it. Wet or compacted material weighs more than these loose figures.`;
  },
  faqs: (h) => [
    { q: 'How many pounds is a cubic yard of trash?', a: `The EPA conversion factors put loose residential trash at ${h.num(h.P.weights.msw_loose_lo)} to ${h.num(h.P.weights.msw_loose_hi)} lbs a cubic yard; this site uses the middle, ${h.num(h.E.DENSITY.msw.lbs)}. Compacted trash in a garbage truck weighs much more for the same volume. Bags thrown loosely into a pickup bed are close to the loose figure, with a lot of air between them.` },
    { q: 'How do I measure a pile that is not square?', a: 'Take the average height rather than the peak, and the length and width of the base. For a mound, multiply length by width by height and take about half: a cone or heap fills roughly half the box around it. For a full trailer or bed, measure the inside floor and the height of the load at its level part.' },
    { q: 'How many cubic yards fit in a pickup bed?', a: 'Multiply the inside length and width of the bed by the height you fill it to, all in feet, and divide by 27. A bed six and a half feet by five feet, filled to the top of rails about one and a half feet high, holds about 1.8 cubic yards. Heaping it higher adds more, as long as the load stays secured and covered.' },
  ],
  body: (h) => {
    const D = h.E.DENSITY;
    const rows = h.E.DENSITY_KEYS.map((k) => [D[k].label, h.num(D[k].lbs), h.num(D[k].lbs * 2), h.pc(D[k].lbs / 2000 * 2)]);
    const s = h.F('seattle');
    return `
<h2>The ten EPA factors used here</h2>
${h.table(['Material', 'Lbs per cubic yard', 'Lbs in 2 cubic yards', 'Share of a ton in 2 cubic yards'], rows, `${'EPA'}, Volume-to-Weight Conversion Factors, April 2016, loose material.`, ['l', 'r', 'r', 'r'])}
<p>Two cubic yards is a pickup bed of average size filled a little above the rails. Filled with household trash, it stays around a quarter of a ton; filled with dirt, it would be close to a ton, which is more than many pickups are rated to carry. Check the payload printed on the door pillar of your truck before loading heavy material.</p>

<h2>Why weight decides the bill</h2>
<p>At a weighed site the scale reads the full vehicle on the way in and the empty vehicle on the way out, and the difference is billed. Below the minimum, weight changes nothing: at ${s.name} in Seattle, the ${h.fee(s.minCharge!)} minimum covers up to ${h.num(s.minCoversLbs!)} lbs. Above it, each extra hundred pounds costs a twentieth of the per-ton rate. At flat-rate sites weight matters only when the load is too heavy for the flat lane. The ${h.a('landfill-prices-per-ton', 'per-ton page')} applies these rules to each site, and the ${h.a('truckload-dump-cost', 'truckload page')} prices a pickup bed in one step.</p>
<p>The EPA factors were compiled from several studies and describe typical loose material. They are good enough to choose between sites or between one trip and two. They are not the scale: a pile of wet leaves, soaked carpet or packed soil can weigh far more than its loose factor. The ${h.src('epa_vw', 'EPA memo')} lists the original sources of each factor.</p>
`;
  },
});
