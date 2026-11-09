import { definePage } from '../../lib/guide-types';
import { OPEN } from '../../lib/lmop';
const MB = OPEN.find((x) => x.name === 'McCommas Bluff Landfill')!;
const TXPUB = OPEN.filter((x) => x.state === 'TX' && x.own === 'Public' && x.tpy).sort((a, b) => (b.tpy as number) - (a.tpy as number));

export default definePage({
  id: 'dallas-dump-fees',
  group: 'metro',
  order: 580,
  tool: { kind: 'dump', props: { facility: 'dallas', also: 'el-paso', lbs: 1200, mattresses: 0 } },
  related: ['mattress-disposal', 'landfills-by-state', 'landfill-prices-per-ton', 'home'],
  sources: ['f_dallas', 'f_el_paso', 'f_austin'],
  slug: 'dallas-dump-fees',
  nav: 'Dallas and Texas sites',
  card: 'McCommas Bluff Landfill’s gate rate from October 2026 plus its per-ton fees, with El Paso and Austin’s drop-off center.',
  title: 'Dallas Dump Fees: McCommas Bluff Landfill Rate from Oct 2026',
  description: 'Dallas dump fees at McCommas Bluff Landfill from October 1, 2026: the gate rate per ton, the processing and environmental fees, and El Paso’s starting price.',
  h1: 'Dallas dump fees at McCommas Bluff Landfill',
  intro: 'The calculator opens on a 1,200 lb load at McCommas Bluff. Switch to El Paso to see the only figure its city publishes.',
  resume: (h) => {
    const f = h.F('dallas');
    return `The City of Dallas owns McCommas Bluff Landfill${TXPUB[0].name === MB.name ? ', the public landfill that took the most waste in Texas on the EPA list' : ''}, about ${h.num1((MB.tpy as number) / 1e6)} million tons in ${MB.tpyYear}. From October 1, 2026, under the rates of the city’s 2026-27 budget year, the gate rate is ${h.fee(f.perTon!)} a ton, up from $43.60. Customers paying for single loads by cash, check or card also pay a customer processing fee and an environmental fee of two dollars a ton each, so a walk-up customer pays ${h.fee(f.perTon! + f.perTonExtra!)} a ton in all. The city’s page prints no minimum charge for a light load, so the calculator prices it by weight; expect the weigh station at the gate to apply its own minimum if it has one. An uncovered load costs forty dollars more. The rate page gives no separate mattress price: ask the weigh station at the gate whether it takes mattresses before you go, or ask the city about bulky-item pickup. Texas has more open landfills on the EPA list than any state but California, yet few of their gate rates are published: we read Dallas and a starting price for El Paso.`;
  },
  faqs: (h) => [
    { q: 'How much does McCommas Bluff charge for a pickup load?', a: `By weight: ${h.fee(h.F('dallas').perTon!)} a ton plus four dollars a ton in fees from October 1, 2026. A 1,200 lb load works out to about ${h.fee(h.tot('dallas', { lbs: 1200 }))}. The city’s rate page prints no minimum, so a very light load may pay more than its weight suggests if the weigh station at the gate applies one. Cover the load to avoid the forty-dollar fine.` },
    { q: 'What does the El Paso landfill charge?', a: `The City of El Paso says disposal fees at the Greater El Paso Landfill, the former Clint Landfill, begin at ${h.fee(h.F('el-paso').smallLoad!.fee)} per truckload for waste under one ton. It publishes no per-ton rate on that page, so the calculator shows that figure as a starting price only. Call the landfill for a heavy load.` },
    { q: 'Can Austin residents take trash to the city drop-off center?', a: `No. Austin’s Recycle and Reuse Drop-off Center takes recycling, reusable items and household hazardous waste, free for Austin and Travis County residents by appointment, except tires at ${h.fee(h.F('austin').tire!)} each. It does not take trash, furniture or mattresses. For those, look at the Texas list of open landfills on this site.` },
  ],
  body: (h) => `
<h2>McCommas Bluff Landfill</h2>
${h.schedule('dallas')}
<p>The $4 in added fees is two fees of $2 a ton each, a customer processing fee and an environmental fee. They apply to customers paying for single loads at the window, which is how most residents pay. The city’s landfill page also lists the Northwest Transfer Station on Bachman Lake at a higher gate rate of ${h.fee(71.28)} a ton, which makes McCommas Bluff the cheaper of the two city sites for the same load.</p>
<p><strong>A mattress or a sofa:</strong> the city’s rate page gives no separate price for them, so the calculator counts no extra fee and says so. Ask at the weigh station whether the landfill takes mattresses, or check the city’s bulky-item pickup first. The ${h.a('mattress-disposal', 'mattress page')} lists the sites that do print a mattress price.</p>

<h2>El Paso, Greater El Paso Landfill</h2>
${h.schedule('el-paso')}
<p>Our figure for El Paso comes from a city news release of December 2025 about new cells at the landfill, the only public statement of its fees we could read. It gives a starting price, not a schedule.</p>

<h2>The rest of Texas</h2>
<p>Many Texas landfills are private, and public gate rates are often not online. The fee pages of Houston and San Antonio could not be opened when we checked them, and we print no figure for them rather than one taken from a private site. The ${h.a('landfills-by-state', 'landfills by state page')} lists every open landfill in Texas on the EPA list, with its owner, so you can find the public one nearest you and call it.</p>
`,
});
