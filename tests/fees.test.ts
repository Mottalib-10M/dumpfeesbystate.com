/** Each case below is worked by hand from the official schedule cited in fees-2026.json. */
import { describe, it, expect } from 'vitest';
import { byId, estimate, baseFee, cubicYards, DENSITY, compare, versusQuote, rankPhrase, isFreeResident, missingText, type Load } from '../src/lib/engine/fees';

const L = (o: Partial<Load>): Load => ({ vehicle: 'pickup', lbs: 600, material: 'trash', mattresses: 0, tires: 0, freon: 0, resident: true, ...o });

describe('flat rates', () => {
  it('Salt Lake: any pickup load is $17, plus $18 a mattress and $4 a tire', () => {
    expect(estimate(byId('salt-lake'), L({ mattresses: 1, tires: 2 })).total).toBe(17 + 18 + 8);
  });
  it('Miramar: Tier 1 pickup $75 city, $86 outside the city; pickup with trailer $148', () => {
    expect(estimate(byId('san-diego'), L({})).total).toBe(75);
    expect(estimate(byId('san-diego'), L({ resident: false })).total).toBe(86);
    expect(estimate(byId('san-diego'), L({ vehicle: 'trailer' })).total).toBe(148);
  });
  it('OC landfills: pickup under 880 lbs $30, +$15 with a mattress; 1,000 lbs weighed at $92.70', () => {
    expect(estimate(byId('oc-ca'), L({ lbs: 879 })).total).toBe(30);
    expect(estimate(byId('oc-ca'), L({ lbs: 500, mattresses: 1 })).total).toBe(45);
    expect(estimate(byId('oc-ca'), L({ lbs: 1000 })).total).toBeCloseTo(46.35, 2);
    expect(estimate(byId('oc-ca'), L({ lbs: 1000, mattresses: 1 })).total).toBeCloseTo(53.85, 2);
  });
  it('Riverside: pickup $15.70, hard-to-handle $21.10 when a mattress is in it, trailer $43.20, 5 tires $30', () => {
    expect(estimate(byId('riverside'), L({})).total).toBe(15.7);
    expect(estimate(byId('riverside'), L({ mattresses: 1 })).total).toBe(21.1);
    expect(estimate(byId('riverside'), L({ vehicle: 'trailer' })).total).toBe(43.2);
    expect(estimate(byId('riverside'), L({ tires: 5 })).total).toBe(15.7 + 30);
  });
  it('Sacramento NARS: the county example, pickup with trash and three refrigerators = $80', () => {
    expect(estimate(byId('sac-nars'), L({ freon: 3 })).total).toBe(80);
  });
  it('Kiefer: 4 tires free, the 5th $10; mattresses free', () => {
    expect(estimate(byId('sac-kiefer'), L({ tires: 5, mattresses: 2 })).total).toBe(35 + 10);
  });
});

describe('weighed loads', () => {
  it('Seattle: 300 lbs pays the $37 minimum, 1,000 lbs pays $87', () => {
    expect(estimate(byId('seattle'), L({ lbs: 300 })).total).toBe(37);
    expect(estimate(byId('seattle'), L({ lbs: 1000 })).total).toBe(87);
  });
  it('Phoenix: $55 a ton, $40 minimum; a resident load under a ton is free', () => {
    expect(estimate(byId('phoenix'), L({ resident: false, lbs: 1000 })).total).toBe(40);
    expect(estimate(byId('phoenix'), L({ resident: false, lbs: 3000 })).total).toBe(82.5);
    expect(estimate(byId('phoenix'), L({ resident: true, lbs: 1500 })).total).toBe(0);
  });
  it('Dallas: $45.78 + $4 of fees a ton', () => {
    expect(estimate(byId('dallas'), L({ lbs: 2000 })).total).toBeCloseTo(49.78, 2);
  });
  it('DeKalb: weight bands below 2,000 lbs', () => {
    expect(estimate(byId('dekalb'), L({ lbs: 240 })).total).toBe(16.5);
    expect(estimate(byId('dekalb'), L({ lbs: 900 })).total).toBe(55.69);
    expect(estimate(byId('dekalb'), L({ lbs: 3000 })).total).toBeCloseTo(149.7, 2);
  });
  it('Fairfax: pickup minimum $49, then $98 a ton', () => {
    expect(estimate(byId('fairfax'), L({ lbs: 600 })).total).toBe(49);
    expect(estimate(byId('fairfax'), L({ lbs: 1500 })).total).toBe(73.5);
  });
  it('Tucson: $18 a load up to 2,000 lbs plus the $2 environmental fee', () => {
    expect(estimate(byId('tucson'), L({ lbs: 1900 })).total).toBe(20);
    expect(estimate(byId('tucson'), L({ lbs: 3000 })).total).toBe(57 + 2);
  });
  it('San Bernardino: $13.71 up to 300 lbs, then $61.49 a ton', () => {
    expect(estimate(byId('san-bernardino'), L({ lbs: 300 })).total).toBe(13.71);
    expect(estimate(byId('san-bernardino'), L({ lbs: 1000 })).total).toBeCloseTo(30.75, 2);
  });
  it('Blount: $15 up to 500 lbs, then $60 a ton', () => {
    expect(estimate(byId('blount'), L({ lbs: 500 })).total).toBe(15);
    expect(estimate(byId('blount'), L({ lbs: 1000 })).total).toBe(30);
  });
});

describe('gaps are never filled', () => {
  it('Larimer prints no price for a trailer, El Paso none above a ton', () => {
    expect(estimate(byId('larimer'), L({ vehicle: 'trailer' })).total).toBeNull();
    expect(estimate(byId('el-paso'), L({ lbs: 2500 })).total).toBeNull();
    expect(estimate(byId('el-paso'), L({ lbs: 800 })).from).toBe(true);
  });
  it('Wake prints no tire fee: the estimate says so', () => {
    expect(estimate(byId('wake'), L({ tires: 2 })).missing).toContain('tire fee not printed');
  });
  it('Miramar has no construction debris flat rate but a weighed one', () => {
    expect(baseFee(byId('san-diego'), L({ material: 'cd', lbs: 2000 })).fee).toBe(241);
  });
});

describe('helpers', () => {
  it('a 6.5 x 5 x 2 ft bed is 2.41 cubic yards', () => { expect(cubicYards(6.5, 5, 2)).toBeCloseTo(2.407, 3); });
  it('EPA: loose trash 275 lbs a cubic yard (midpoint of 250-300)', () => { expect(DENSITY.msw.lbs).toBe(275); });
  it('compare() is sorted from cheapest', () => {
    const c = compare(L({}));
    for (let i = 1; i < c.length; i++) expect(c[i].e.total as number).toBeGreaterThanOrEqual(c[i - 1].e.total as number);
  });
  it('two trips of 800 lbs to Seattle (0.4 t × $174 each), 30 miles each at 76 cents, against a $450 quote', () => {
    const v = versusQuote(byId('seattle'), L({ lbs: 1600 }), 2, 30, 76, 450)!;
    expect(v.fees).toBeCloseTo(139.2, 2); expect(v.driving).toBeCloseTo(45.6, 2); expect(v.diff).toBeCloseTo(265.2, 2);
  });
});

describe('plain-words result (naive test of 2026-11-08)', () => {
  it('says “most expensive” in the dearer half, never “24th cheapest of 24”', () => {
    expect(rankPhrase(1, 24)).toBe('The cheapest of the 24 public sites we priced for this load.');
    expect(rankPhrase(5, 24)).toBe('5th cheapest of the 24 public sites we priced for this load.');
    expect(rankPhrase(23, 24)).toBe('2nd most expensive of the 24 public sites we priced for this load.');
    expect(rankPhrase(24, 24)).toBe('The most expensive of the 24 public sites we priced for this load.');
    expect(rankPhrase(12, 24)).toBe('12th cheapest of the 24 public sites we priced for this load.');
    expect(rankPhrase(13, 24)).toBe('12th most expensive of the 24 public sites we priced for this load.');
  });
  it('a Phoenix resident load is a free allowance, a Dallas load is not', () => {
    expect(isFreeResident(estimate(byId('phoenix'), L({})))).toBe(true);
    expect(isFreeResident(estimate(byId('dallas'), L({})))).toBe(false);
  });
  it('a mattress at Dallas is reported as not priced, in plain words', () => {
    const e = estimate(byId('dallas'), L({ mattresses: 1 }));
    expect(e.missing).toContain('mattress fee not printed');
    expect(missingText(e.missing[0])).toEqual(['Mattress', 'no price on this site’s list, so not counted. Ask at the gate.']);
  });
});

describe('naive test, 4th round (2026-11-09)', () => {
  it('rank in the state first, then a plain national count', async () => {
    const { rankInState } = await import('../src/lib/engine/fees');
    const L = { vehicle: 'pickup' as const, lbs: 600, material: 'trash' as const, mattresses: 0, tires: 0, freon: 0, resident: true };
    const all = compare(L);
    const sd = rankInState(byId('san-diego'), all);
    expect(sd.state).toMatch(/^The highest of the \d+ California sites we priced\. Badlands, Blythe, Lamb Canyon and El Sobrante landfills \(Riverside County\) charges \$15\.70 for the same load\.$/);
    // The free site gets its own verb, never “charges $0” after “most expensive” (naive test, 2026-11-09).
    expect(rankInState(byId('salt-lake'), all).state).toMatch(/^The highest of the 2 Utah sites we priced\. .+ is free for its qualifying residents for the same load\.$/);
    const rv = rankInState(byId('riverside'), all);
    expect(rv.state).toMatch(/^Cheapest of the \d+ California sites we priced\.$/);
    expect(rankInState(byId('dallas'), all).national).toMatch(/^\d+ of the 24 public sites we priced nationwide charge less for this load\.$/);
  });
  it('Riverside and San Bernardino carry distinct area names', () => {
    expect(byId('riverside').metro).toBe('Riverside County');
    expect(byId('san-bernardino').metro).toBe('San Bernardino County');
  });
  it('a couch triggers Orange County’s fee for items over six feet, not Riverside’s mattress rate', () => {
    const L = { vehicle: 'pickup' as const, lbs: 600, material: 'trash' as const, mattresses: 0, tires: 0, freon: 0, resident: true };
    expect(estimate(byId('oc-ca'), { ...L, bulky: 1 }).total).toBe(45);
    expect(estimate(byId('riverside'), { ...L, bulky: 1 }).total).toBe(15.7);
    expect(estimate(byId('salt-lake'), { ...L, bulky: 1 }).total).toBe(17);
  });
  it('one couch wording and one mattress count everywhere (naive test, 2026-11-09)', async () => {
    const { couchRule, couchWithLoad, mattressRuleSites, mattressPriceSites, DUMPS } = await import('../src/lib/engine/fees');
    expect(couchRule(byId('salt-lake'))).toBe('no fee of its own on this price list: priced with the load');
    expect(couchRule(byId('riverside'))).toMatch(/names mattresses only/);
    expect(couchWithLoad().length + 2).toBe(DUMPS.length);
    expect(mattressRuleSites().length).toBe(mattressPriceSites().length + 2);
  });
  it('per-ton added fees are said to be per ton', () => {
    const L = { vehicle: 'pickup' as const, lbs: 600, material: 'trash' as const, mattresses: 0, tires: 0, freon: 0, resident: true };
    expect(estimate(byId('dallas'), L).rule).toMatch(/a ton plus \$4 a ton in added fees/);
  });
  it('price list dated in plain words', async () => {
    const { priceListLine, residentHelp, hasResidentRule } = await import('../src/lib/engine/fees');
    expect(priceListLine(byId('salt-lake'))).toBe('Salt Lake County price list (no date printed on it)');
    expect(priceListLine(byId('dallas'))).toBe('City of Dallas price list (effective October 1, 2026)');
    expect(residentHelp(byId('san-diego'))).toContain('Poway, El Cajon, Chula Vista');
    expect(hasResidentRule(byId('salt-lake'))).toBe(false);
  });
});
