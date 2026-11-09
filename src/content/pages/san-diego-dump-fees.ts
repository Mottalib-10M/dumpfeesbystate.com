import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'san-diego-dump-fees',
  group: 'metro',
  order: 510,
  tool: { kind: 'dump', props: { facility: 'san-diego', mattresses: 0 } },
  related: ['orange-county-dump-fees', 'inland-empire-dump-fees', 'yard-waste-disposal', 'home'],
  sources: ['f_san_diego'],
  slug: 'san-diego-dump-fees',
  nav: 'San Diego: Miramar Landfill',
  card: 'Miramar Landfill’s flat rates for cars and pickups, the higher rate for waste from outside the city, green waste and debris.',
  title: 'San Diego Dump Fees: Miramar Landfill Rates from July 2026',
  description: 'San Diego dump fees at Miramar Landfill from July 1, 2026: the flat rate for a car or pickup, the rate for waste from outside the city, green waste and debris.',
  h1: 'San Diego dump fees at Miramar Landfill',
  intro: 'The calculator is set on Miramar. Change the vehicle, the weight or the material to see which line of the city’s schedule applies.',
  resume: (h) => {
    const f = h.F('san-diego');
    return `Miramar Landfill, run by the City of San Diego Environmental Services Department, charges people who bring their own load a flat rate per vehicle rather than by weight. Under the schedule effective July 1, 2026 through June 30, 2027, a car, SUV, pickup, van or a trailer up to five by nine by four feet pays ${h.fee(f.flat!.pickup!)} a load of city waste, and a pickup towing a trailer or a larger trailer pays ${h.fee(f.flat!.trailer!)}. Waste from outside the City of San Diego pays more: ${h.fee(f.nonRes!.flat!.pickup!)} and ${h.fee(f.nonRes!.flat!.trailer!)}. Clean green waste has its own lower flat rate of ${h.fee(f.yard!.flat!.pickup!)} for the first tier, while construction and demolition debris is weighed at ${h.fee(f.cd!.perTon!)} a ton, far above the trash rate of ${h.fee(f.perTon!)} for weighed loads. The flat rates already include the state recycling fee. Uncovered loads pay a penalty, and appliances and electronics must go elsewhere.`;
  },
  faqs: (h) => [
    { q: 'Does Miramar Landfill charge by weight?', a: `Not for an ordinary car or pickup of household waste: those pay the basic flat rate (the first vehicle-size band) of ${h.fee(h.F('san-diego').flat!.pickup!)} whatever the weight, as long as the vehicle and any trailer fit the tier. Commercial vehicles and loads that do not fit a tier go over the scale and pay ${h.fee(h.F('san-diego').perTon!)} a ton for city waste. Construction debris is always weighed.` },
    { q: 'Who pays the outside-the-city rate at Miramar?', a: 'The higher rate applies to waste generated outside the City of San Diego, whoever brings it. A resident of a neighboring city such as Poway, El Cajon or Chula Vista pays it, and so does a city resident hauling waste from a job elsewhere. The city’s schedule sets the two columns side by side; the weigh station at the gate may ask where the load comes from.' },
    { q: 'Can I take a refrigerator or a TV to Miramar?', a: 'No. The city asks that appliances, televisions and electronic waste be disposed of elsewhere before you enter the landfill. Look for an e-waste collection event or a recycler for those items, and an appliance recycler for anything with refrigerant. The calculator therefore shows no appliance fee for Miramar.' },
  ],
  body: (h) => {
    const f = h.F('san-diego');
    return `
<h2>The Miramar price list for people who bring their own load</h2>
${h.schedule('san-diego')}
<p>The two flat rates depend on the size of the vehicle and trailer, not on weight. The first covers cars, SUVs, pickups, vans and trailers up to five by nine by four feet; the second covers a pickup towing a trailer and larger trailers. “Outside the City of San Diego” means waste from a neighboring city such as Poway, El Cajon or Chula Vista. For a full pickup of heavy material, the flat rate is a bargain. For a few bags, it is expensive: the same ${h.fee(f.flat!.pickup!)} applies to a car with one bag. Neighbors in Orange County and Riverside County charge much less for a light load, as the list of other California sites under the calculator shows.</p>
<p>Green waste must be clean to get the lower rate: no trash, soil, rock or lumber. Construction debris at ${h.fee(f.cd!.perTon!)} a ton is where loads get expensive quickly; a ton of drywall and tile costs more than three flat trash loads. Sort recyclable concrete and metal out of a remodel load before you go. Fees change every July 1, and the city posts the new schedule on its ${h.fl(f, 'fee page')}.</p>
`;
  },
});
