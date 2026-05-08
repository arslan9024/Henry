/**
 * complianceSlice + templateSlice — unit tests
 *
 * complianceSlice covers:
 *   initial state shape
 *   setWarningsForTemplate — creates a new bucket
 *   setWarningsForTemplate — overwrites an existing bucket
 *   acknowledgeChecklist   — sets acknowledged = true
 *   acknowledgeChecklist   — sets acknowledged = false (toggle back)
 *   multiple templates stored independently
 *
 * templateSlice covers:
 *   initial state (activeTemplate = 'booking')
 *   setActiveTemplate      — changes to a known key
 *   setActiveTemplate      — accepts any string (no guard)
 */
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import complianceReducer, { setWarningsForTemplate, acknowledgeChecklist } from './complianceSlice';
import templateReducer, { setActiveTemplate } from './templateSlice';

// ── complianceSlice ───────────────────────────────────────────────────────────

describe('complianceSlice', () => {
  const makeStore = () => configureStore({ reducer: { compliance: complianceReducer } });

  it('initial state has expected shape', () => {
    const { compliance } = makeStore().getState();
    expect(compliance.mode).toBe('warnings-only');
    expect(compliance.warningsByTemplate).toEqual({});
    expect(compliance.checklistAcknowledgedByTemplate).toEqual({});
  });

  it('setWarningsForTemplate creates a bucket for a new template key', () => {
    const store = makeStore();
    const warnings = [{ id: 'W1', severity: 'critical', message: 'Missing tenant ID' }];
    store.dispatch(setWarningsForTemplate({ templateKey: 'viewing', warnings }));

    expect(store.getState().compliance.warningsByTemplate.viewing).toEqual(warnings);
  });

  it('setWarningsForTemplate replaces an existing bucket', () => {
    const store = makeStore();
    store.dispatch(setWarningsForTemplate({ templateKey: 'viewing', warnings: [{ id: 'old' }] }));
    store.dispatch(
      setWarningsForTemplate({ templateKey: 'viewing', warnings: [{ id: 'new1' }, { id: 'new2' }] }),
    );

    const bucket = store.getState().compliance.warningsByTemplate.viewing;
    expect(bucket).toHaveLength(2);
    expect(bucket[0].id).toBe('new1');
  });

  it('setWarningsForTemplate stores empty array (clear warnings)', () => {
    const store = makeStore();
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [{ id: 'X' }] }));
    store.dispatch(setWarningsForTemplate({ templateKey: 'booking', warnings: [] }));

    expect(store.getState().compliance.warningsByTemplate.booking).toEqual([]);
  });

  it('acknowledgeChecklist sets acknowledged true for a template', () => {
    const store = makeStore();
    store.dispatch(acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));

    expect(store.getState().compliance.checklistAcknowledgedByTemplate.viewing).toBe(true);
  });

  it('acknowledgeChecklist can set acknowledged back to false', () => {
    const store = makeStore();
    store.dispatch(acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    store.dispatch(acknowledgeChecklist({ templateKey: 'viewing', acknowledged: false }));

    expect(store.getState().compliance.checklistAcknowledgedByTemplate.viewing).toBe(false);
  });

  it('stores warnings and acknowledgement for multiple templates independently', () => {
    const store = makeStore();
    store.dispatch(setWarningsForTemplate({ templateKey: 'viewing', warnings: [{ id: 'V1' }] }));
    store.dispatch(setWarningsForTemplate({ templateKey: 'tenancy', warnings: [] }));
    store.dispatch(acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    store.dispatch(acknowledgeChecklist({ templateKey: 'tenancy', acknowledged: false }));

    const { warningsByTemplate, checklistAcknowledgedByTemplate } = store.getState().compliance;
    expect(warningsByTemplate.viewing).toHaveLength(1);
    expect(warningsByTemplate.tenancy).toHaveLength(0);
    expect(checklistAcknowledgedByTemplate.viewing).toBe(true);
    expect(checklistAcknowledgedByTemplate.tenancy).toBe(false);
  });
});

// ── templateSlice ─────────────────────────────────────────────────────────────

describe('templateSlice', () => {
  const makeStore = () => configureStore({ reducer: { template: templateReducer } });

  it('initial activeTemplate is "booking"', () => {
    const { template } = makeStore().getState();
    expect(template.activeTemplate).toBe('booking');
  });

  it('setActiveTemplate updates activeTemplate to the given key', () => {
    const store = makeStore();
    store.dispatch(setActiveTemplate('viewing'));
    expect(store.getState().template.activeTemplate).toBe('viewing');
  });

  it('setActiveTemplate can switch between multiple templates', () => {
    const store = makeStore();
    store.dispatch(setActiveTemplate('tenancy'));
    expect(store.getState().template.activeTemplate).toBe('tenancy');
    store.dispatch(setActiveTemplate('keyHandover'));
    expect(store.getState().template.activeTemplate).toBe('keyHandover');
  });

  it('setActiveTemplate accepts any string (no whitelist guard)', () => {
    const store = makeStore();
    store.dispatch(setActiveTemplate('unknownTemplate'));
    expect(store.getState().template.activeTemplate).toBe('unknownTemplate');
  });

  it('is independent of complianceSlice state', () => {
    const store = configureStore({
      reducer: {
        template: templateReducer,
        compliance: complianceReducer,
      },
    });
    store.dispatch(setActiveTemplate('addendum'));
    store.dispatch(setWarningsForTemplate({ templateKey: 'addendum', warnings: [{ id: 'A1' }] }));

    expect(store.getState().template.activeTemplate).toBe('addendum');
    expect(store.getState().compliance.warningsByTemplate.addendum).toHaveLength(1);
  });
});
