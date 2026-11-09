/**
 * One page = ONE data file in `src/content/pages/<id>.ts`: URL, snippets, H1, standfirst, citable block,
 * FAQ, body, sources, tool.
 */
import type { SourceKey } from './engine/params';
import type { Helpers } from './helpers';

export type Group = 'fees' | 'items' | 'tools' | 'metro';
export interface FAQ { q: string; a: string }
/** Tools: `mini:<spec>` (a spec of `lib/mini-specs.ts`), `dump` (the full load calculator) or `finder` (EPA landfill list). */
export interface ToolDef { kind: string; props?: Record<string, string | number | boolean> }

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Main tool, first screen: the page is a tool page (`data-outil`). */
  tool?: ToolDef;
  mini?: ToolDef;
  related: string[];
  sources: SourceKey[];
  slug: string;
  nav: string;
  card: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Citable block, 120 words or more, one paragraph (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  /** HTML. A second tool can be placed inside with `<!--tool:mini:spec-->` or `<!--tool:mini:spec|{"lbs":400}-->`. */
  body: (h: Helpers) => string;
}
export const definePage = (g: PageDef): PageDef => g;
