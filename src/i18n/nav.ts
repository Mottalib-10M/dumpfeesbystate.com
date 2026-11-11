import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Dump fee calculator', method: 'How the fees are read and priced', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
const GROUP_LABEL: Record<Group, string> = { fees: 'Landfill and transfer station fees', items: 'Couches, mattresses, tires and appliances', tools: 'Dumpster or dump run, load weight', metro: 'Fees in your area' };
export const GROUPS_ORDER: Group[] = ['fees', 'items', 'metro', 'tools'];
export const groupLabel = (g: Group) => GROUP_LABEL[g];
export const label = (id: string, _lang: Locale = 'en') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
// Areas sorted by state, with the home list of all states at the end (naive test, 2026-11-10: Colorado, New York,
// North Carolina, Ohio and Tennessee had no entry, and readers thought their state was not covered).
const inGroup = (g: Group, lang: Locale) => {
  const xs = PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
  return g === 'metro' ? [...xs.sort((a, b) => a.label.localeCompare(b.label)), { href: `${route('home', lang)}#areas-title`, label: 'Other states: Colorado, New York, North Carolina, Ohio, Tennessee' }] : xs;
};
function categoriesCompletes(lang: Locale): NavCategory[] {
  return GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
// Top menu: short labels, never on two lines (full labels stay in the footer).
const COURT: Record<string, string> = { 'Landfill and transfer station fees': 'Dump fees', 'Couches, mattresses, tires and appliances': 'Items', 'Dumpster or dump run, load weight': 'Tools', 'Fees in your area': 'By area' };
export const navCategories = (lang: Locale, court = true): NavCategory[] =>
  categoriesCompletes(lang).map((c) => (court ? { ...c, label: COURT[c.label] ?? c.label } : c));
export const navDirect = (_lang: Locale): NavLink[] => [];
export const footerColumns = (lang: Locale): NavCategory[] => [...GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length), { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
