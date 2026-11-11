import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'transfer-station-fees',
  group: 'fees',
  order: 30,
  tool: { kind: 'mini:small' },
  related: ['landfill-prices-per-ton', 'seattle-dump-fees', 'fairfax-county-dump-fees', 'home'],
  sources: ['f_seattle', 'f_king_county', 'f_king_county_next', 'f_fairfax', 'f_phoenix', 'f_sac_nars', 'f_swaco', 'f_dekalb'],
  slug: 'transfer-station-fees',
  nav: 'Transfer station fees',
  card: 'What a small load pays at a transfer station or landfill: the minimum charge, flat vehicle rates and bag rates, site by site.',
  title: 'Transfer Station Fees 2026: Minimum Charges for Small Loads',
  description: 'Transfer station fees for a small load in 2026: the minimum charge, flat vehicle rates and bag prices at public stations and landfills, from their schedules.',
  h1: 'Transfer station fees: what a small load really pays',
  intro: 'Choose a vehicle and a weight: the tool ranks the transfer station fees and landfill gate fees of every public schedule we read for that load, from the cheapest to the most expensive.',
  resume: (h) => {
    const s = h.F('seattle'); const k = h.F('king-county'); const fx = h.F('fairfax');
    return `Transfer station fees for a household load are set mostly by the minimum charge, because a car or a pickup of trash rarely weighs more than the few hundred pounds that the minimum covers. On schedules read on ${h.D.read}, Seattle’s two city stations charge ${h.fee(s.minCharge!)}, which covers up to ${h.num(s.minCoversLbs!)} lbs, and ${h.fee(s.perTon!)} a ton above it; the King County stations around the city charge ${h.fee(k.minCharge!)} per vehicle and ${h.fee(k.perTon!)} a ton. Fairfax County in Virginia sets three minimums by size of vehicle, from ${h.fee(fx.minByVehicle!.car!)} to ${h.fee(fx.minByVehicle!.trailer!)}, and also prices a few bags without weighing the car. A transfer station is not a landfill: waste is tipped on a floor, reloaded and hauled to a distant landfill, which is why its rates are higher than the gate of a landfill in the same region.`;
  },
  faqs: (h) => [
    { q: 'What is the minimum charge at a transfer station?', a: `It is the fee for any load below a set weight, charged even if you bring a single bag. On the public schedules we read, it ranges from ${h.fee(h.F('swaco').minCharge!)} at the Franklin County landfill in Columbus to ${h.fee(h.F('king-county').minCharge!)} at the King County stations. Some schedules print how much weight the minimum covers, such as ${h.num(h.F('seattle').minCoversLbs!)} lbs in Seattle; others leave you to work it out from the per-ton rate.` },
    { q: 'Can I take a few bags of trash to a transfer station?', a: `Usually yes, but a few bags pay the same minimum as a much larger load. Fairfax County is one of the few public operators that prices bags: ${h.fee(h.F('fairfax').bags![0].fee)} for one to five bags and ${h.fee(h.F('fairfax').bags![1].fee)} for six to ten, with a lower rate for residents aged 60 and over bringing one or two. Elsewhere, wait until you have a fuller load or check whether the county runs free convenience centers.` },
    { q: 'Do transfer stations take mattresses and appliances?', a: 'Most of the stations we read take them, with an item fee on top of the load. Seattle charges a small fee per appliance with refrigerant plus the weight, Fairfax County a fixed fee per mattress and per appliance, and Sacramento County takes two large appliances a day and household mattresses at no charge. Hazardous waste, paint and electronics usually go to a separate drop-off.' },
  ],
  body: (h) => {
    const all = h.E.compare({ vehicle: 'car', lbs: 150, material: 'trash', mattresses: 0, tires: 0, freon: 0, resident: true });
    const rows = all.map((x) => [h.fl(x.f), x.f.metro, x.f.kind === 'transfer' ? 'Transfer station' : 'Landfill', `${x.e.from ? 'from ' : ''}${h.fee(x.e.total as number)}`, x.e.rule]);
    const kc = h.F('king-county');
    return `
<h2>A car with 150 lbs of trash, at every site</h2>
<p>The smallest load a household brings: a few bags and a broken chair in the back of a car. Here is what each schedule charges for it, resident rate, cheapest first.</p>
${h.table(['Site', 'Area', 'Type', 'Fee', 'Rule applied'], rows, `Schedules read on ${h.D.read}. El Paso prints only a starting price per truckload.`, ['l', 'l', 'l', 'r', 'l'])}
<p>Three rules produce these figures. A prorated rate with a small minimum, as in Columbus or Binghamton, makes a light load almost free. A flat fee per vehicle, as in Salt Lake County or Riverside County, charges the same whatever the weight. A high minimum, as in the Seattle area, charges a light load the same as a medium one. Phoenix and Washington County in Utah charge their residents nothing for a monthly load under a ton.</p>

<h2>Transfer station or landfill</h2>
<p>Large cities have few landfills left inside their limits, so the public sites closest to most homes are transfer stations. Waste unloaded there is pushed onto a tipping floor, loaded into bigger trucks, containers or rail cars and carried to a landfill or another disposal plant further away. That second trip shows in the rate. Where a county runs both kinds of site, as Orange County in Florida and Fairfax County in Virginia do, the schedules name both, and the landfill gate is often the cheaper of the two for the same load, at the cost of a longer drive.</p>
<p>Rates move on fixed dates. King County has announced that its minimum goes to ${h.fee(kc.next!.minCharge!)} and its rate to ${h.fee(kc.next!.perTon!)} a ton on January 1, 2027, ${h.src('f_king_county_next', 'in its own announcement')}. The ${h.a('landfill-prices-per-ton', 'per-ton table')} gives the effective date of every schedule.</p>
`;
  },
});
