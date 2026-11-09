import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'appliance-disposal',
  group: 'items',
  order: 130,
  tool: { kind: 'mini:freon', props: { n: 1 } },
  related: ['mattress-disposal', 'sacramento-dump-fees', 'load-weight-calculator', 'home'],
  sources: ['epa_608', 'f_sac_nars', 'f_sac_kiefer', 'f_seattle', 'f_dekalb', 'f_larimer', 'f_washington_ut', 'f_fairfax', 'f_tucson', 'epa_vw'],
  slug: 'refrigerator-disposal-fee',
  nav: 'Refrigerator disposal fee',
  card: 'What public landfills charge to take a refrigerator, freezer or air conditioner whose refrigerant must be recovered, site by site.',
  title: 'Refrigerator Disposal Fee: Freon Appliance Rates at the Dump',
  description: 'Refrigerator disposal fee at public landfills in 2026: what each site charges for a fridge, freezer or AC unit with refrigerant, and where two a day are free.',
  h1: 'Refrigerator disposal fee: what the dump charges for an appliance with refrigerant',
  intro: 'Pick a site and the number of refrigerators, freezers or air conditioners. The tool adds the appliance fee, alone or with a load of trash.',
  resume: (h) => {
    const t = h.E.DUMPS.filter((f) => f.freon != null).sort((a, b) => a.freon! - b.freon!);
    return `A refrigerator disposal fee pays for recovering the refrigerant before the appliance is crushed for scrap. Under the EPA’s Section 608 rules, the last person in the disposal chain, such as a landfill owner or a scrap recycler, must make sure the refrigerant in a fridge, freezer or window air conditioner is recovered before final disposal, or keep a signed statement saying who recovered it. So public landfills either charge a fixed fee per unit or ask for that statement. On the schedules we read on ${h.D.read}, the fee runs from ${h.fee(t[0].freon!)} at ${t[0].name} to ${h.fee(t[t.length - 1].freon!)} at ${t[t.length - 1].name}. The Sacramento County sites take two large appliances a day at no charge, then charge per unit. A refrigerator weighs about ${h.num(h.P.weights.refrigerator)} lbs on the EPA conversion factors, so at a weighed site it also adds to the load.`;
  },
  faqs: (h) => [
    { q: 'Can I take a refrigerator to the dump myself?', a: 'Yes, at most public landfills and transfer stations, if you tell the weigh station at the gate it holds refrigerant. Remove food, shelves you want to keep, and tape the doors shut for the drive. Do not cut the lines or try to empty the system yourself: the site or its contractor recovers the refrigerant with proper equipment, which is what the fee pays for.' },
    { q: 'Is a washer or a stove charged the same as a fridge?', a: 'No. The refrigerant fee applies only to appliances that cool: refrigerators, freezers, air conditioners, dehumidifiers and water coolers. A washer, dryer, stove or water heater is scrap metal; most sites charge it by weight with the rest of the load or take it in a separate metal pile, sometimes free. Fairfax County charges white goods without refrigerant by the ton.' },
    { q: 'Will the store take my old refrigerator?', a: 'Many appliance retailers haul the old unit away when they deliver a new one, often for a fee shown at checkout, and some electric utilities run programs that pick up working second refrigerators. Those offers change often, so we print none of them. Ask before delivery day; it can save a trip and the landfill fee.' },
  ],
  body: (h) => {
    const rows = h.E.DUMPS.filter((f) => f.freon != null).map((f) => [h.fl(f), f.metro, `${h.fee(f.freon!)} each`, f.freonFree ? `${f.freonFree} a day free` : 'none', h.fee(h.est(f.id, { freon: 1 }).total! - h.est(f.id, {}).total!)]).sort((a, b) => parseFloat(String(a[4]).slice(1)) - parseFloat(String(b[4]).slice(1)));
    const s = h.F('seattle'); const nars = h.F('sac-nars');
    const W = h.P.weights;
    return `
<h2>Refrigerator and appliance fees on public schedules</h2>
${h.table(['Site', 'Area', 'Refrigerant appliance', 'Free allowance', 'One fridge adds to a pickup load'], rows, `Schedules read on ${h.D.read}, resident rates.`, ['l', 'l', 'r', 'r', 'r'])}
<p>Seattle’s rule is worth reading in full: ${s.freonNote}. Sacramento County gives its own worked example on the North Area Recovery Station page, a pickup with trash and three refrigerators: the ${h.fee(nars.flat!.pickup!)} pickup rate, two appliances free and ${h.fee(nars.freon!)} for the third, ${h.fee(h.tot('sac-nars', { freon: 3 }))} in all. The calculator reproduces it.</p>

<h2>What an appliance weighs</h2>
<p>At a site that weighs the load, an appliance counts like any other material. The EPA’s volume-to-weight factors give a refrigerator about ${h.num(W.refrigerator)} lbs, a washer ${h.num(W.washer)}, a dryer ${h.num(W.dryer)}, a range ${h.num(W.stove)} and a dishwasher ${h.num(W.dishwasher)}. A kitchen clear-out with a fridge, a range and a dishwasher adds over 500 lbs to the scale, enough to push a pickup past the minimum charge at most weighed sites.</p>
<p>Some sites refuse appliances at the trash lane and send them to a separate area. Miramar in San Diego asks for appliances, televisions and electronics to be dropped elsewhere before entering the landfill. The ${h.a('home', 'calculator')} marks a fee as not printed when a schedule has no appliance line, rather than guessing one.</p>
`;
  },
});
