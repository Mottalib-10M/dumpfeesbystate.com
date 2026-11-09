import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'tire-disposal',
  group: 'items',
  order: 120,
  tool: { kind: 'mini:tires' },
  related: ['mattress-disposal', 'appliance-disposal', 'inland-empire-dump-fees', 'home'],
  sources: ['f_riverside', 'f_san_bernardino', 'f_sac_kiefer', 'f_seattle', 'f_fairfax', 'f_salt_lake', 'f_jacksonville', 'f_dekalb', 'f_austin'],
  slug: 'tire-disposal-fee',
  nav: 'Tire disposal fee',
  card: 'What public landfills charge per tire, how many they take in one load, and the counties where the first tires are free.',
  title: 'Tire Disposal Fee 2026: Per-Tire Rates and Limits by Site',
  description: 'Tire disposal fee at public landfills and transfer stations in 2026: the price per passenger tire, the limit per load, and the sites where four tires are free.',
  h1: 'Tire disposal fee: the price per tire and how many you can bring',
  intro: 'Pick a site and the number of tires: the tool works out the tire disposal fee from its price per tire, its free allowance and its limit per load.',
  resume: (h) => {
    const t = h.E.FACILITIES.filter((f) => f.tire != null && f.tireMode !== 'load').sort((a, b) => a.tire! - b.tire!);
    return `A tire disposal fee is charged per tire at most public landfills, because tires do not compact, trap air and water, and are usually set aside from the rest of the load. On the schedules we read on ${h.D.read}, the price for a car or light-truck tire off the rim runs from ${h.fee(t[0].tire!)} at ${t[0].name} to ${h.fee(t[t.length - 1].tire!)} at ${t[t.length - 1].name}. Two sites price tires differently: ${h.F('seattle').name} charge ${h.fee(h.F('seattle').tire!)} per load of up to ${h.F('seattle').tireMax} tires, and the Sacramento County sites take ${h.F('sac-kiefer').tireFree} tires a day free, then charge ${h.fee(h.F('sac-kiefer').tire!)} each up to ${h.F('sac-kiefer').tireMax}. Almost every schedule caps the count per load, often between four and fifteen, and charges more for a tire on its rim or for a truck tire. A tire shop usually takes old tires when it fits new ones, and the fee is then on its invoice.`;
  },
  faqs: (h) => [
    { q: 'How much does it cost to dispose of four tires?', a: `At the public sites we read, four passenger tires off the rim cost nothing in Sacramento County, ${h.fee(4 * h.F('jacksonville').tire!)} in Jacksonville, ${h.fee(4 * h.F('salt-lake').tire!)} in Salt Lake County, ${h.fee(4 * h.F('riverside').tire!)} in Riverside County and ${h.fee(4 * h.F('fairfax').tire!)} in Fairfax County. In Seattle the four together pay one load fee of ${h.fee(h.F('seattle').tire!)}. These are the tire fees alone; a load of other trash pays its own fee.` },
    { q: 'Does it cost more to dump a tire on its rim?', a: 'Usually yes, because the steel rim has to be removed before the tire can be shredded. Larimer County prints a higher price for a tire with its rim, DeKalb County charges far more for a tire on a rim than without, and Phoenix asks residents to remove rims before they bring tires. Take the tire off the rim if you can, or ask a tire shop to do it.' },
    { q: 'Why is there a limit on tires per load?', a: 'The tire price on a public schedule is set for a household cleaning out a garage, not for a business. Above the limit, a load is treated as commercial tire waste and charged by the ton or sent to a tire processor. Riverside County takes five a day from a resident, San Bernardino County nine per load, Salt Lake County twelve, Broome County fifteen.' },
  ],
  body: (h) => {
    const rows = h.E.FACILITIES.filter((f) => f.tire != null).map((f) => [h.fl(f), f.metro, f.tireMode === 'load' ? `${h.fee(f.tire!)} per load` : `${h.fee(f.tire!)} each`, f.tireFree ? `${f.tireFree} free` : 'none', f.tireMax ? String(f.tireMax) : 'not printed', f.noTrash ? h.fee(4 * f.tire!) : h.fee(h.est(f.id, { tires: 4 }).total! - h.est(f.id, {}).total!)]);
    return `
<h2>Tire fees on public schedules</h2>
${h.table(['Site', 'Area', 'Price', 'Free tires', 'Limit per load', 'Four tires add'], rows, `Schedules read on ${h.D.read}. Car and light-truck tires off the rim, resident rates. The last column is what four tires add to a 600 lb pickup load of trash.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>Read the limit as carefully as the price. A resident who brings more tires than the schedule allows is no longer a household customer for that load: the extra tires are charged by the ton, refused, or sent to a commercial tire lane. Austin’s drop-off center takes tires from residents at ${h.fee(h.F('austin').tire!)} each, but no trash, so a mixed load needs two stops there.</p>

<h2>Before you pay at the gate</h2>
<p>The cheapest tire disposal is usually the shop that fits your new set: shops take the old tires back, and any charge for it appears on their invoice. Some counties also hold free tire collection days. We have not read state tire programs for this site, so we print none of their rules; your state environmental agency publishes them. For tires already at home, the table shows which public site near you takes them and what it charges.</p>
<p>Truck, tractor and oversized tires are priced apart, often much higher, or refused. DeKalb County lists a separate price above eighteen inches, Larimer County limits the per-tire price to sizes up to 16.5 inches, and Orange County in Florida charges a larger tire load by the ton.</p>
`;
  },
});
