/**
 * knowledgeBase.js — evaluateKnowledgeBaseRules unit tests
 *
 * Each of the four evaluator functions is exercised via the public
 * `evaluateKnowledgeBaseRules(templateKey, documentData)` entry-point
 * so the tests match exactly what the ruleEngine calls.
 *
 * Evaluators under test:
 *   KB-RENT-NOTICE-90       → minimumNoticeDays (booking / bookingGov / tenancy)
 *   KB-RENT-RERA-TIER       → reraTierFormula   (booking / bookingGov / tenancy)
 *   KB-SHARED-HOUSING-PERMIT→ sharedHousingPermit (booking / bookingGov / tenancy / keyHandover)
 *   KB-EVICTION-PERSONAL-USE→ notarizedEvictionNotice (tenancy / addendum)
 */
import { describe, it, expect } from 'vitest';
import { evaluateKnowledgeBaseRules, knowledgeBaseMeta } from './knowledgeBase';
import { makeDoc } from '../test/factories';

// ── helpers ───────────────────────────────────────────────────────────────────
const has = (warnings, id) => warnings.some((w) => w.id === id);

// Build a date string N days from today (positive = future, negative = past)
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// ── knowledgeBaseMeta export ──────────────────────────────────────────────────

describe('knowledgeBaseMeta', () => {
  it('exports metadata with version and jurisdiction', () => {
    expect(knowledgeBaseMeta.version).toBe('2026.04');
    expect(knowledgeBaseMeta.jurisdiction).toBe('Dubai, UAE');
    expect(knowledgeBaseMeta.verificationStatus).toBe('pending-official-review');
  });
});

// ── evaluateKnowledgeBaseRules — unknown template ─────────────────────────────

describe('evaluateKnowledgeBaseRules — unknown template', () => {
  it('returns empty array for a template key not in any KB rule', () => {
    const result = evaluateKnowledgeBaseRules('offer', makeDoc());
    expect(result).toEqual([]);
  });

  it('returns empty array for an unrecognised template key', () => {
    expect(evaluateKnowledgeBaseRules('nonExistent', makeDoc())).toEqual([]);
  });
});

// ── KB-RENT-NOTICE-90 (minimumNoticeDays) ────────────────────────────────────

describe('KB-RENT-NOTICE-90 — 90-day rent increase notice window', () => {
  // Rule only fires when proposed rent > current rent.
  // NOTE: makeDoc does NOT spread top-level 'renewal' overrides — must spread at top level.
  const docWithIncrease = (renewalOverrides = {}) => ({
    ...makeDoc(),
    renewal: {
      currentRent: 80000,
      proposedRent: 90000,
      marketRent: 100000,
      noticeSentDate: '',
      renewalDate: '',
      ...renewalOverrides,
    },
  });

  it('does NOT fire when no rent increase is proposed (proposedRent ≤ currentRent)', () => {
    const doc = { ...makeDoc(), renewal: { currentRent: 90000, proposedRent: 90000, marketRent: 100000 } };
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-NOTICE-90')).toBe(false);
  });

  it('fires with a notice message when noticeSentDate is absent and renewal is far away', () => {
    const doc = docWithIncrease({
      noticeSentDate: '',
      renewalDate: daysFromNow(180), // well ahead — no countdown warning
    });
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-NOTICE-90')).toBe(true);
    const w = result.find((r) => r.id === 'KB-RENT-NOTICE-90');
    expect(w.message).toMatch(/notice date should be recorded/i);
  });

  it('fires with days-remaining message when renewal is < 90 days away and no notice recorded', () => {
    const doc = docWithIncrease({
      noticeSentDate: '',
      renewalDate: daysFromNow(30),
    });
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-NOTICE-90')).toBe(true);
    const w = result.find((r) => r.id === 'KB-RENT-NOTICE-90');
    expect(w.message).toMatch(/\d+ day\(s\) away/i);
  });

  it('fires when the notice gap from noticeSentDate to renewalDate is < 90 days', () => {
    const renewalDate = daysFromNow(200);
    const noticeSentDate = daysFromNow(200 - 60); // only 60 days before renewal
    const doc = docWithIncrease({ renewalDate, noticeSentDate });
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-NOTICE-90')).toBe(true);
  });

  it('does NOT fire when notice gap is ≥ 90 days', () => {
    const renewalDate = daysFromNow(200);
    const noticeSentDate = daysFromNow(200 - 100); // 100 days before renewal
    const doc = docWithIncrease({ renewalDate, noticeSentDate });
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-NOTICE-90')).toBe(false);
  });

  it('applies to bookingGov and tenancy templates', () => {
    const doc = docWithIncrease({ noticeSentDate: '' });
    ['bookingGov', 'tenancy'].forEach((tmpl) => {
      expect(has(evaluateKnowledgeBaseRules(tmpl, doc), 'KB-RENT-NOTICE-90')).toBe(true);
    });
  });
});

// ── KB-RENT-RERA-TIER (reraTierFormula) ──────────────────────────────────────

describe('KB-RENT-RERA-TIER — RERA tiered increase formula', () => {
  // RERA tiers: gap ≤10% → 0%, ≤20% → 5%, ≤30% → 10%, ≤40% → 15%, >40% → 20%
  // Market 100k, current 80k → gap (100-80)/100 = 20% → 5% tier → max 84k

  it('fires a "data incomplete" warning when all rent figures are zero', () => {
    const doc = { ...makeDoc(), renewal: { currentRent: 0, proposedRent: 0, marketRent: 0 } };
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-RERA-TIER')).toBe(true);
    const w = result.find((r) => r.id === 'KB-RENT-RERA-TIER');
    expect(w.message).toMatch(/current rent.*proposed rent.*market rent/i);
  });

  it('does NOT fire when proposed rent does not exceed current rent', () => {
    const doc = { ...makeDoc(), renewal: { currentRent: 80000, proposedRent: 75000, marketRent: 100000 } };
    expect(has(evaluateKnowledgeBaseRules('booking', doc), 'KB-RENT-RERA-TIER')).toBe(false);
  });

  it('fires when proposed rent exceeds the RERA tier allowance (5% → max 84k; proposed 95k)', () => {
    const doc = { ...makeDoc(), renewal: { currentRent: 80000, proposedRent: 95000, marketRent: 100000 } };
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-RENT-RERA-TIER')).toBe(true);
    const w = result.find((r) => r.id === 'KB-RENT-RERA-TIER');
    expect(w.message).toMatch(/exceeds/i);
  });

  it('does NOT fire when proposed rent is within the tier allowance (5% → max 84k; proposed 82k)', () => {
    const doc = { ...makeDoc(), renewal: { currentRent: 80000, proposedRent: 82000, marketRent: 100000 } };
    expect(has(evaluateKnowledgeBaseRules('booking', doc), 'KB-RENT-RERA-TIER')).toBe(false);
  });

  it('applies to tenancy and bookingGov templates', () => {
    const doc = { ...makeDoc(), renewal: { currentRent: 0, proposedRent: 0, marketRent: 0 } };
    ['tenancy', 'bookingGov'].forEach((tmpl) => {
      expect(has(evaluateKnowledgeBaseRules(tmpl, doc), 'KB-RENT-RERA-TIER')).toBe(true);
    });
  });
});

// ── KB-SHARED-HOUSING-PERMIT (sharedHousingPermit) ───────────────────────────

describe('KB-SHARED-HOUSING-PERMIT — shared housing permit', () => {
  it('does NOT fire when isSharedHousing is falsy', () => {
    const doc = makeDoc({ occupancy: { isSharedHousing: false } });
    expect(has(evaluateKnowledgeBaseRules('booking', doc), 'KB-SHARED-HOUSING-PERMIT')).toBe(false);
  });

  it('fires a "no permit" warning when sharedHousingPermitNumber is absent', () => {
    const doc = makeDoc({
      occupancy: { isSharedHousing: true, sharedHousingPermitNumber: '', ejariOccupantsRegistered: false },
    });
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-SHARED-HOUSING-PERMIT')).toBe(true);
    expect(result.find((r) => r.id === 'KB-SHARED-HOUSING-PERMIT').message).toMatch(/no permit/i);
  });

  it('fires an "occupants not registered" warning when permit exists but Ejari flag is false', () => {
    const doc = makeDoc({
      occupancy: {
        isSharedHousing: true,
        sharedHousingPermitNumber: 'SHPA-2026-0042',
        ejariOccupantsRegistered: false,
      },
    });
    const result = evaluateKnowledgeBaseRules('booking', doc);
    expect(has(result, 'KB-SHARED-HOUSING-PERMIT')).toBe(true);
    expect(result.find((r) => r.id === 'KB-SHARED-HOUSING-PERMIT').message).toMatch(/ejari/i);
  });

  it('does NOT fire when permit is set AND Ejari occupants are registered', () => {
    const doc = makeDoc({
      occupancy: {
        isSharedHousing: true,
        sharedHousingPermitNumber: 'SHPA-2026-0042',
        ejariOccupantsRegistered: true,
      },
    });
    expect(has(evaluateKnowledgeBaseRules('booking', doc), 'KB-SHARED-HOUSING-PERMIT')).toBe(false);
  });

  it('applies to keyHandover template', () => {
    const doc = makeDoc({
      occupancy: { isSharedHousing: true, sharedHousingPermitNumber: '', ejariOccupantsRegistered: false },
    });
    expect(has(evaluateKnowledgeBaseRules('keyHandover', doc), 'KB-SHARED-HOUSING-PERMIT')).toBe(true);
  });
});

// ── KB-EVICTION-PERSONAL-USE (notarizedEvictionNotice) ───────────────────────

describe('KB-EVICTION-PERSONAL-USE — 12-month notarized eviction notice', () => {
  // NOTE: makeDoc does NOT spread top-level 'eviction' overrides — must spread at top level.
  // Evaluator order: (1) bad method → notarized warning, (2) missing/short date → 365-day warning.

  it('does NOT fire when eviction reason is not "personal-use"', () => {
    const doc = { ...makeDoc(), eviction: { reason: 'renovation', noticeDate: '', noticeMethod: '' } };
    expect(has(evaluateKnowledgeBaseRules('tenancy', doc), 'KB-EVICTION-PERSONAL-USE')).toBe(false);
  });

  it('fires when reason is personal-use but no notice date recorded', () => {
    const doc = { ...makeDoc(), eviction: { reason: 'personal-use', noticeDate: '', noticeMethod: '' } };
    const result = evaluateKnowledgeBaseRules('tenancy', doc);
    expect(has(result, 'KB-EVICTION-PERSONAL-USE')).toBe(true);
    expect(result.find((r) => r.id === 'KB-EVICTION-PERSONAL-USE').message).toMatch(/365 day/i);
  });

  it('fires when notice method is disallowed (WhatsApp-style) — fires notarized warning first', () => {
    // endDate = 0 days from now, noticeDate = 400 days ago → gap 400 >= 365, BUT bad method fires first
    const doc = {
      ...makeDoc(),
      eviction: { reason: 'personal-use', noticeMethod: 'whatsapp', noticeDate: daysFromNow(-400) },
      payments: { ...makeDoc().payments, contractEndDate: daysFromNow(0) },
    };
    const result = evaluateKnowledgeBaseRules('tenancy', doc);
    expect(has(result, 'KB-EVICTION-PERSONAL-USE')).toBe(true);
    expect(result.find((r) => r.id === 'KB-EVICTION-PERSONAL-USE').message).toMatch(/notarized/i);
  });

  it('fires 365-day warning when notice gap < 365 days even with a valid method', () => {
    const endDate = daysFromNow(200);
    const noticeDate = daysFromNow(0); // only ~200 days before end
    const doc = {
      ...makeDoc(),
      eviction: { reason: 'personal-use', noticeMethod: 'notarized', noticeDate },
      payments: { ...makeDoc().payments, contractEndDate: endDate },
    };
    const result = evaluateKnowledgeBaseRules('tenancy', doc);
    expect(has(result, 'KB-EVICTION-PERSONAL-USE')).toBe(true);
    expect(result.find((r) => r.id === 'KB-EVICTION-PERSONAL-USE').message).toMatch(/365 day/i);
  });

  it('does NOT fire when notice method is valid and gap ≥ 365 days', () => {
    const endDate = daysFromNow(400);
    const noticeDate = daysFromNow(0); // 400 days before end
    const doc = {
      ...makeDoc(),
      eviction: { reason: 'personal-use', noticeMethod: 'notarized', noticeDate },
      payments: { ...makeDoc().payments, contractEndDate: endDate },
    };
    expect(has(evaluateKnowledgeBaseRules('tenancy', doc), 'KB-EVICTION-PERSONAL-USE')).toBe(false);
  });

  it('accepts court-notice and registered-mail as valid notice methods', () => {
    const endDate = daysFromNow(400);
    const noticeDate = daysFromNow(0);
    ['court-notice', 'registered-mail'].forEach((noticeMethod) => {
      const doc = {
        ...makeDoc(),
        eviction: { reason: 'personal-use', noticeMethod, noticeDate },
        payments: { ...makeDoc().payments, contractEndDate: endDate },
      };
      expect(has(evaluateKnowledgeBaseRules('tenancy', doc), 'KB-EVICTION-PERSONAL-USE')).toBe(false);
    });
  });

  it('applies to addendum template', () => {
    const doc = { ...makeDoc(), eviction: { reason: 'personal-use', noticeDate: '', noticeMethod: '' } };
    expect(has(evaluateKnowledgeBaseRules('addendum', doc), 'KB-EVICTION-PERSONAL-USE')).toBe(true);
  });
});
