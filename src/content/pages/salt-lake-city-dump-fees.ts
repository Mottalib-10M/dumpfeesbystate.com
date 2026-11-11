import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'salt-lake-city-dump-fees',
  group: 'metro',
  order: 550,
  tool: { kind: 'dump', props: { facility: 'salt-lake', also: 'washington-ut' } },
  related: ['construction-debris-disposal', 'tire-disposal', 'truckload-dump-cost', 'home'],
  sources: ['f_salt_lake', 'f_washington_ut'],
  slug: 'salt-lake-city-dump-fees',
  nav: 'Utah: Salt Lake City and St. George',
  card: 'The $17 flat rate for cars, pickups and hand-unloaded trailers at Salt Lake Valley Landfill, item fees, and St. George’s free resident loads.',
  title: 'Salt Lake City Dump Fees: The Valley Landfill Flat Rate 2026',
  description: 'Salt Lake City dump fees at the Salt Lake Valley Landfill: one flat rate for a car, pickup or hand-unloaded trailer, item fees, and St. George’s free loads.',
  h1: 'Salt Lake City dump fees: one flat rate for most household loads',
  intro: (h) => h.areaIntro('Salt Lake City', 'salt-lake', ['washington-ut']),
  resume: (h) => {
    const f = h.F('salt-lake');
    return `The Salt Lake Valley Landfill, owned by Salt Lake County, has one of the simplest schedules we read: ${h.fee(f.flat!.pickup!)} for a car, an SUV, a pickup up to a one-ton truck, or a trailer unloaded by hand, whatever the weight. Heavier trailers towed by trucks of one ton or more are weighed at ${h.fee(f.perTon!)} a ton with a ${h.fee(f.minCharge!)} minimum. Mixed household trash may include green waste, concrete, asphalt, soil and sod at the flat rate, and clean loads of concrete, asphalt, soil or sod alone have a lower weighed rate of ${h.fee(f.cd!.perTon!)} a ton. Items are added on top: ${h.fee(f.mattress!)} per mattress or box spring for residents, ${h.fee(f.freon!)} per refrigerant appliance and ${h.fee(f.tire!)} per tire, ${f.tireMax} a load at most. The county’s page prints no effective date for this schedule; we read it on ${h.D.read}.`;
  },
  faqs: (h) => [
    { q: 'Is the Salt Lake Valley Landfill flat rate the same for a full pickup?', a: `Yes. The ${h.fee(h.F('salt-lake').flat!.pickup!)} rate covers a car, an SUV or a pickup up to a one-ton truck, and trailers that you unload by hand, without weighing them. A heavy pickup of dirt or concrete pays the same as a car with a few bags. Only trailers towed by one-ton or larger trucks go over the scale.` },
    { q: 'What does the landfill charge for a mattress in Salt Lake County?', a: `Residents pay ${h.fee(h.F('salt-lake').mattress!)} for each mattress and each box spring, on top of the vehicle’s flat rate. A queen set is therefore two items. The flat rate for the load itself does not change, so a pickup carrying a set and other junk pays the flat rate plus the two item fees.` },
    { q: 'Are dump fees lower in St. George?', a: `For residents, yes. The Washington County Solid Waste District takes residential loads of less than one ton a month at no charge; other waste pays ${h.fee(h.F('washington-ut').perTon!)} a ton under the 2026 column of its fee schedule. Refrigerant appliances and tires have their own fees there, listed in the second table on this page.` },
  ],
  body: (h) => {
    const f = h.F('salt-lake');
    return `
<h2>Salt Lake City dump fees at the Salt Lake Valley Landfill</h2>
${h.schedule('salt-lake')}
<p>The flat rate rewards heavy loads. A pickup of broken concrete from a patio, weighed at many other sites, pays the same ${h.fee(f.flat!.pickup!)} as a load of cardboard here. Where it costs more is items: a load with two mattresses and four tires adds ${h.fee(2 * f.mattress! + 4 * f.tire!)} to the vehicle rate, more than the load itself. If you can, take tires back to a tire shop and check whether your city offers a bulky waste pickup for mattresses.</p>
<p>Because flat-rate vehicles are not weighed, there is no minimum charge to plan around here. Items are counted at the window instead, so tell the attendant how many mattresses, tires and appliances are in the load; they are added to the vehicle rate one by one.</p>

<h2>Washington County, St. George</h2>
${h.schedule('washington-ut')}
<p>Washington County’s free allowance is generous for a household: a monthly load under a ton covers almost any clean-out. The 2026 column of the district’s approved master fee schedule sets the per-ton rate, and the construction debris rate is slightly lower. Uncovered loads pay double the municipal solid waste rate.</p>
`;
  },
});
