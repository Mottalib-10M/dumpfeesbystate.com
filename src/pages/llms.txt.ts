/** llms.txt (RECETTE §21): what the site is, where its figures come from, its main pages. Built from the data. */
import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, LAST_UPDATED } from '../data/site-config';
import * as E from '../lib/engine/fees';
import { LMOP } from '../lib/lmop';
import { fee } from '../lib/helpers';
export const GET: APIRoute = () => {
  const pt = E.perTonTable();
  const lines = [
    '# Dump Fees by State',
    '',
    `> What a household load costs at a public landfill or transfer station in the United States, from the fee schedule each county, city or public waste authority publishes: ${E.FACILITIES.length} schedules in ${new Set(E.FACILITIES.map((f) => f.metro)).size} areas, each with its link and effective date, read on ${E.READ_ON}. Per-ton rates for household trash run from ${fee(pt[0].all)} (${pt[0].f.name}) to ${fee(pt[pt.length - 1].all)} (${pt[pt.length - 1].f.name}); most household loads pay a minimum charge or a flat vehicle rate instead. Mattress, tire and refrigerant appliance fees are added line by line. Landfill list: EPA Landfill Methane Outreach Program database, ${LMOP.open} open landfills (public domain; no EPA endorsement). Weights: EPA volume-to-weight factors (2016). No fee is shown for a place whose schedule we have not read, and no dumpster prices are shown: the comparison uses the quote the user types. Published by Radif Partners, an independent publisher; not a waste hauler, landfill operator, dumpster company or government agency. Figures read on ${LAST_UPDATED}.`,
    '',
    '## Calculators',
    `- [Dump fee calculator](${SITE_URL}${route('home', 'en')}): a load priced at one public site, line by line, then at every other schedule read.`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`),
    '',
    '## Method',
    `- [How the fees are read and priced](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
