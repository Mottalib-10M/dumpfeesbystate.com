import { definePage } from '../../lib/guide-types';
import { byState, LMOP } from '../../lib/lmop';

export default definePage({
  id: 'landfills-by-state',
  group: 'fees',
  order: 40,
  tool: { kind: 'finder', props: { state: 'UT' } },
  related: ['landfill-prices-per-ton', 'transfer-station-fees', 'method', 'home'],
  sources: ['lmop', 'epa_disclaimers'],
  slug: 'landfills-by-state',
  nav: 'Landfills by state',
  card: 'Every open landfill on the EPA list, state by state, with public or private ownership and a link to the fee schedule where we read one.',
  title: 'Landfills by State: 1,266 Open Sites on the EPA List, 2026',
  description: 'Landfills by state from the EPA LMOP database: the open municipal landfills of each state, who owns them, and where a public fee schedule can be read online.',
  h1: 'Landfills by state: the open sites on the EPA list, and who owns them',
  intro: (h) => `The federal Environmental Protection Agency (EPA) lists ${h.num(LMOP.open)} open landfills for household trash in ${LMOP.states} states and territories, about ${h.pc(byState().reduce((a, x) => a + x.pub, 0) / LMOP.open)} of them run by a county, a city or another public body. Pick your state to see its list, with a link to the price list when we have read one.`,
  resume: (h) => {
    const s = byState(); const pub = s.reduce((a, x) => a + x.pub, 0);
    return `The federal Environmental Protection Agency (EPA), through its Landfill Methane Outreach Program (a program that tracks the gas landfills give off), keeps the most complete public list of municipal solid waste landfills in the United States. Its database, on the page updated ${h.date(LMOP.pageUpdated)}, counts ${h.num(LMOP.uniqueLandfills)} landfills, of which ${h.num(LMOP.open)} are marked open, across ${LMOP.states} states and territories. ${h.num(pub)} of the open ones belong to a county, a city, a regional authority or another public body; most of the rest belong to waste companies. That split matters for anyone hauling their own load. A public landfill normally prints its fees on the county or city website and takes residents with a car or a pickup, while a private site may quote only on request or serve only commercial haulers. The finder above lists the open landfills of each state and marks who owns them.`;
  },
  faqs: (h) => [
    { q: 'Which state has the most landfills?', a: `On the EPA list, ${byState()[0].name} has the most open municipal landfills, ${byState()[0].open}, followed by ${byState()[1].name} with ${byState()[1].open}. A count of sites says nothing about capacity: the EPA records how many tons a year each landfill accepts, and one large regional site can take more than many small county ones together. Small states may have a single open landfill, or none that takes household loads from the public.` },
    { q: 'Can anyone drive to a landfill and dump?', a: 'Not always. Many public landfills take loads from residents of the county or the district only and ask for proof of address; Broome County in New York and Blount County in Tennessee say so on their fee pages. Some landfills serve only commercial haulers, and private sites may not open a public lane at all. Check the page or call the scale house before you load the truck.' },
    { q: 'Is the EPA list complete?', a: 'It is the most complete public list, but it was built to track landfill gas, so it covers municipal solid waste landfills and leaves out most transfer stations, construction debris landfills and rural convenience centers. The file we use was published in September 2024. A site that has closed since may still appear, and a new one may be missing.' },
  ],
  body: (h) => {
    const s = byState();
    const rows = s.slice(0, 15).map((x) => [x.name, x.open, x.pub, h.pc(x.pub / x.open)]);
    const priv = s.filter((x) => x.open >= 15).sort((a, b) => a.pub / a.open - b.pub / b.open).slice(0, 5);
    return `
<details class="section"><summary><h2>States with the most open landfills</h2></summary>
${h.table(['State', 'Open landfills', 'Publicly owned', 'Public share'], rows, `EPA landfill database (file of September 2024, page updated ${h.date(LMOP.pageUpdated)}), landfills marked open. Ownership as recorded by the EPA.`, ['l', 'r', 'r', 'r'])}
<p>The public share varies far more than the count. Among states with at least fifteen open landfills, the lowest public shares are in ${priv.map((x) => `${x.name} (${x.pub} of ${x.open})`).join(', ')}. In those states a resident is more likely to deal with a private landfill, a private transfer station or a hauler, and fewer gate rates are published. In states where most landfills are public, the county fee page is usually the place to look.</p>
</details>

<h2>When there is no published fee</h2>
<p>We print a fee only when we have read it on the site’s own page, with its date. For your own site, three steps:</p>
<ol>
<li>Find the public landfill or transfer station (a drop-off site) that serves your county in the list above.</li>
<li>Open the solid waste page of that county or city and look for “disposal fees”, “gate rate” or “tipping fee” (the price per ton).</li>
<li>Note the minimum charge, the price per ton, any flat price for a pickup and the fees for mattresses, tires and appliances, or call the site and ask.</li>
</ol>
<p>The ${h.a('home', 'calculator')} shows how those lines combine on the schedules we have read.</p>

<h2>What the list covers</h2>
<p>The EPA collects these records to track the gas landfills give off, so the database includes municipal solid waste landfills of every size, with their owner and operator, and leaves out sites that do not take household waste. It is a U.S. government work and in the public domain; ${h.src('epa_disclaimers', 'the EPA says so in its disclaimers')} and does not endorse this or any other site. The ${h.a('method', 'method page')} explains how we filtered it.</p>
`;
  },
});
