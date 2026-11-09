/** Data guards: every facility cites an official page and a reading; every fee is a positive number. */
import { describe, it, expect } from 'vitest';
import { FACILITIES } from '../src/lib/engine/fees';
import LF from '../src/data/landfills.json';
describe('fees-2026.json', () => {
  it('every facility has a URL, a place and notes', () => {
    for (const f of FACILITIES) { expect(f.url).toMatch(/^https:\/\//); expect(f.notes.length).toBeGreaterThan(0); expect(f.state).toMatch(/^[A-Z]{2}$/); }
  });
  it('per-ton rates are plausible public gate rates', () => {
    for (const f of FACILITIES) if (f.perTon != null) { expect(f.perTon).toBeGreaterThan(20); expect(f.perTon).toBeLessThan(300); }
  });
});
describe('landfills.json (EPA LMOP)', () => {
  it('1,266 open landfills in 53 states and territories', () => { expect(LF.meta.open).toBe(1266); expect(LF.landfills.length).toBe(1266); expect(LF.meta.states).toBe(53); });
});
