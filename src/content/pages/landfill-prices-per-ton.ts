import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'landfill-prices-per-ton',
  group: 'fees',
  order: 10,
  tool: { kind: 'mini:perton' },
  related: ['transfer-station-fees', 'truckload-dump-cost', 'load-weight-calculator', 'home'],
  sources: ['f_seattle', 'f_king_county', 'f_wake', 'f_swaco', 'f_dallas', 'f_miami_dade', 'f_orange_fl', 'f_dekalb'],
  slug: 'landfill-prices-per-ton',
  nav: 'Landfill prices per ton',
  card: 'The price per ton at the gate of every public landfill and transfer station we read, from the lowest to the highest, and what a weighed load pays.',
  title: 'Landfill Prices per Ton 2026: Public Gate Rates Compared',
  description: 'Landfill prices per ton in 2026, read on county and city fee schedules: the gate rate of each public site, its minimum charge, and what your weighed load pays.',
  h1: 'Landfill prices per ton: the rate printed by each public site',
  intro: 'To compare landfill prices per ton, pick the public dump nearest you and a weight. The fee comes from that site’s own price list, then the same load is priced at every other site we checked. A site that charges a flat fee per vehicle shows that fee instead.',
  resume: (h) => {
    const t = h.E.perTonTable(); const lo = t[0]; const hi = t[t.length - 1];
    return `A landfill price per ton, also called the tipping fee or gate rate, is what the weigh station at the gate charges for each ton of waste you bring, and almost every public site adds a minimum charge for light loads. On the ${t.length} public schedules we read on ${h.D.read}, the per-ton rate for household trash runs from ${h.fee(lo.all)} at ${lo.f.name} (${lo.f.metro}) to ${h.fee(hi.all)} at ${hi.f.name} (${hi.f.metro}). Transfer stations in large cities charge the most, because the waste is trucked again to a distant landfill. Most loads from a household weigh well under a ton, so the minimum charge, not the per-ton rate, usually sets the bill: a 400 lb load at ${h.F('seattle').name} pays the ${h.fee(h.F('seattle').minCharge!)} minimum, not 0.2 tons at ${h.fee(h.F('seattle').perTon!)}. The calculator applies the right rule for the site you pick.`;
  },
  faqs: (h) => [
    { q: 'What is a tipping fee?', a: 'It is the charge a landfill or transfer station makes for accepting waste, usually quoted per ton and measured on a truck scale as you drive in and out. Public schedules add rules around it: a minimum charge for light loads, flat rates for cars and pickups at some sites, a higher rate for hard-to-handle items, and separate fees for tires, mattresses and appliances.' },
    { q: 'Why is a transfer station more expensive than a landfill?', a: `A transfer station is a place where waste is unloaded, compacted and loaded onto larger trucks or trains for a landfill further away, so its rate carries that second trip. On our list, ${h.F('king-county').name} charge ${h.fee(h.F('king-county').perTon!)} a ton in 2026, while ${h.F('wake').name}, a landfill, charges ${h.fee(h.F('wake').perTon!)}. Where a county runs both, the landfill gate is usually cheaper if you can drive there.` },
    { q: 'Is the price per ton prorated for small loads?', a: `Usually yes, down to the minimum charge. ${h.F('swaco').operator.replace(' (public)', '')} prorates its ${h.fee(h.F('swaco').perTon!)} rate below one ton with a ${h.fee(h.F('swaco').minCharge!)} minimum, so a 300 lb load pays about six dollars. Other sites skip the scale for cars and pickups and charge a flat fee, which can cost more than the prorated rate for a light load and much less for a heavy one.` },
  ],
  body: (h) => {
    const t = h.E.perTonTable();
    const rows = t.map((x) => [h.fl(x.f), x.f.metro, `${h.fee(x.rate)}${x.f.perTonExtra ? ` + ${h.fee(x.f.perTonExtra)}` : ''}`, x.f.minByVehicle ? `${h.fee(x.f.minByVehicle.car!)} to ${h.fee(x.f.minByVehicle.trailer!)}` : x.f.minCharge != null ? h.fee(x.f.minCharge) : 'none printed', h.eff(x.f)]);
    const half = t[Math.floor(t.length / 2)];
    const dal = h.F('dallas'); const kc = h.F('king-county');
    return `
<h2>Every landfill price per ton we read, lowest first</h2>
<p>The table lists the rate for household trash brought by a resident. Flat-rate sites appear with the rate they charge once a load is too heavy or too large for the flat fee. The middle of the list is ${h.fee(half.all)} a ton, at ${half.f.name}.</p>
${h.table(['Site', 'Area', 'Per ton', 'Minimum', 'Price list dated'], rows, `Price lists checked on the official pages on ${h.D.read}. Tap a site name to open its page.`, ['l', 'l', 'r', 'r', 'l'])}

<h2>What the rate includes, and what it does not</h2>
<p>Most schedules fold state fees into the gate rate. ${h.F('wake').name} states that its ${h.fee(h.F('wake').perTon!)} includes the North Carolina excise tax of two dollars a ton, and the Miramar flat rates include a California state recycling fee. Others add charges at the window. ${dal.name} in Dallas adds a processing fee and an environmental fee of two dollars a ton each to its ${h.fee(dal.perTon!)} gate rate for walk-up customers, which the table shows as a second figure. Penalties for an uncovered load sit outside the rate everywhere: from three dollars in Seattle to forty in Dallas, and double the fee in San Bernardino County.</p>
<p>Rates also change on a fixed date, often July 1 for a county fiscal year, October 1 for a city, or January 1. ${kc.name} have already announced their 2027 rates: the minimum goes to ${h.fee(kc.next!.minCharge!)} and the rate to ${h.fee(kc.next!.perTon!)} a ton on January 1, 2027. When a page printed no date, the table says so rather than guessing.</p>

<h2>Turning a load into tons</h2>
<p>A ton is 2,000 pounds. Household trash, loose, weighs about 250 to 300 lbs a cubic yard on the conversion factors of the federal environment agency (EPA), so an eight-foot pickup bed of loose trash, level with the rails, stays well under half a ton. Concrete, dirt and roofing shingles are three to four times heavier for the same space. The ${h.a('load-weight-calculator', 'load weight calculator')} turns the size of a pile into pounds, and the ${h.a('truckload-dump-cost', 'truckload page')} prices a pickup bed directly.</p>
<p>Below the minimum, weight does not matter at all. Above it, every extra hundred pounds costs one twentieth of the per-ton rate: about ${h.fee(t[0].all / 20)} at the cheapest site on the list and ${h.fee(t[t.length - 1].all / 20)} at the most expensive.</p>
`;
  },
});
