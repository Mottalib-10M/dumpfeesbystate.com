import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'dumpster-vs-dump-run',
  group: 'tools',
  order: 320,
  tool: { kind: 'mini:versus' },
  related: ['load-weight-calculator', 'construction-debris-disposal', 'phoenix-dump-fees', 'home'],
  sources: ['irs_mileage', 'f_dekalb', 'f_phoenix', 'epa_vw'],
  slug: 'dumpster-vs-dump-run',
  nav: 'Dumpster or dump run',
  card: 'Set the dump fees and driving cost of hauling it yourself against the dumpster or junk removal quote you were given.',
  title: 'Dumpster vs Dump Run: Your Quote Against Hauling It Yourself',
  description: 'Dumpster vs dump run: set the price you were quoted for a dumpster or junk removal against public dump fees and the driving cost of making the trips yourself.',
  h1: 'Dumpster vs dump run: is the quote worth it?',
  intro: 'Type the quote you received, the weight to get rid of, the number of trips and the distance. The tool adds the dump fees from the site’s price list, the driving cost and any truck rental, then tells you which costs less.',
  resume: (h) => `Choosing between a dumpster and a dump run comes down to three numbers: the quote you have for a roll-off container (the open dumpster a truck drops in your driveway) or a junk removal crew, the fees the public landfill will charge for the same waste split into trips, and what those trips cost you to drive. This site has no dumpster prices: rental companies quote by ZIP code, size and length of hire, and we found no public price list that could be reused. So the tool asks for the quote you were given and compares it with the dump fees from the official schedule of the site you pick and a driving cost per mile. The default is the federal business mileage rate set by the IRS (the tax agency), ${h.P.mileage.businessCents} cents a mile for ${h.P.mileage.period}, which counts fuel, wear and depreciation; change it if you see your costs differently. A rented truck or trailer can be typed in; your time and help with lifting are not counted, and they often decide the matter.`,
  faqs: (h) => [
    { q: 'When is a dumpster cheaper than hauling it yourself?', a: 'When the waste is heavy or the trips are many. A remodel, a roof or a whole-house clean-out can mean five or more pickup loads, each with a fee and a long drive, while a dumpster comes and goes once. For a single load of light junk, a public dump is almost always cheaper, especially where residents get a free monthly load or a low minimum.' },
    { q: 'Is the federal mileage rate the right cost of driving?', a: `It is a fair default because it covers fuel, maintenance, insurance and depreciation, which is what a trip really costs a car owner. The rate is ${h.P.mileage.businessCents} cents a mile for ${h.P.mileage.period}. If you count only fuel, the cost per mile falls a lot; type your own figure. For a rented pickup, type the rental in its own field and count its mileage charge in the cost per mile.` },
    { q: 'What should a dumpster quote include?', a: 'Ask for the container size, the rental period, the weight included in the price and the charge per ton above it, the delivery and pickup fees, and the items refused, such as mattresses, tires or appliances, or charged extra. Compare quotes on the same terms. A low headline price with a small weight allowance can end up more expensive than a dump run.' },
  ],
  body: (h) => {
    const ph = h.F('phoenix'); const dk = h.F('dekalb'); const W = h.P.weights;
    return `
<h2>How the comparison is made</h2>
<p>The total weight is split evenly over the trips. Each trip pays the load fee of the site for its share of the weight, then items such as mattresses or tires are added once. Driving is trips times miles there and back times the cost per mile. The difference with the quote is shown either way: when the quote is lower, the tool says so.</p>
<p>The example loaded is 3,000 lbs in two pickup trips of 30 miles. The quote field is at 0, so the tool first shows what doing it yourself costs; type the quote you were given to see which is cheaper.</p>
<p>Fewer trips do not always mean lower fees. Take ${dk.name} in DeKalb County, near Atlanta: each 1,500 lb trip falls in the county’s last weight band below one ton, ${h.fee(dk.tiers![dk.tiers!.length - 1].fee)}, so the fees come to ${h.fee(2 * dk.tiers![dk.tiers!.length - 1].fee)} before driving. Send it in one trip of 3,000 lbs and the load is weighed at ${h.fee(dk.perTon!)} a ton instead, ${h.fee(h.tot('dekalb', { lbs: 3000 }))}, against ${h.fee(2 * dk.tiers![dk.tiers!.length - 1].fee)} for the two trips.</p>
<p>Some cities change the sum entirely. A Phoenix resident paying for city trash service may bring one load up to a ton a month at no charge, at the ${h.fl(ph, 'city’s transfer stations')}. The tool counts every trip under a ton as free there, so spread such trips over separate months, or the second one pays the ${h.fee(ph.minCharge!)} minimum or ${h.fee(ph.perTon!)} a ton.</p>

<h2>Estimating the weight first</h2>
<p>The comparison is only as good as the weight. A garage clean-out of boxes, furniture and bags is mostly air: at the EPA factor for loose trash, ten cubic yards weigh about ${h.num(10 * h.E.DENSITY.msw.lbs)} lbs, under a ton and a half. A kitchen with its cabinets, counter and tile, or a roof of shingles, weighs several times more for the same volume. Use the ${h.a('load-weight-calculator', 'load weight calculator')} with your own measurements, and remember a refrigerator alone weighs around ${h.num(W.refrigerator)} lbs.</p>

<h2>What the tool cannot see</h2>
<p>Your time and your back. Junk removal crews price the labor of carrying things down stairs, which a fee schedule never shows. A dumpster can damage a driveway and needs a permit on a public street in many cities. On the other side, a quote is a starting price: the final bill can add overweight, extra days or refused items. The tool sets one known cost against one stated price and leaves those judgments to you.</p>
`;
  },
});
