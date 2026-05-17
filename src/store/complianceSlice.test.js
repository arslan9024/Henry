/**
 * complianceSlice.test.js
 * Unit tests for complianceSlice reducers and initial state.
 */
import { describe, it, expect } from 'vitest';
import reducer, { setWarningsForTemplate, acknowledgeChecklist } from './complianceSlice';

const initialState = {
  mode: 'warnings-only',
  warningsByTemplate: {},
  checklistAcknowledgedByTemplate: {},
};

// ── initial state ─────────────────────────────────────────────────────────────

describe('complianceSlice — initial state', () => {
  it('returns initial state when called with undefined', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('initial mode is "warnings-only"', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('warnings-only');
  });

  it('initial warningsByTemplate is empty object', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.warningsByTemplate).toEqual({});
  });

  it('initial checklistAcknowledgedByTemplate is empty object', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.checklistAcknowledgedByTemplate).toEqual({});
  });
});

// ── setWarningsForTemplate ────────────────────────────────────────────────────

describe('complianceSlice — setWarningsForTemplate', () => {
  it('stores warnings under the given template key', () => {
    const warnings = [{ severity: 'critical', message: 'Missing RERA ref' }];
    const state = reducer(initialState, setWarningsForTemplate({ templateKey: 'viewing', warnings }));
    expect(state.warningsByTemplate.viewing).toEqual(warnings);
  });

  it('stores warnings for multiple template keys independently', () => {
    let state = reducer(
      initialState,
      setWarningsForTemplate({
        templateKey: 'viewing',
        warnings: [{ severity: 'critical', message: 'A' }],
      }),
    );
    state = reducer(
      state,
      setWarningsForTemplate({
        templateKey: 'booking',
        warnings: [{ severity: 'important', message: 'B' }],
      }),
    );
    expect(state.warningsByTemplate.viewing).toHaveLength(1);
    expect(state.warningsByTemplate.booking).toHaveLength(1);
  });

  it('overwrites existing warnings for the same key', () => {
    const first = [{ severity: 'critical', message: 'Old' }];
    const second = [{ severity: 'info', message: 'New' }];
    let state = reducer(initialState, setWarningsForTemplate({ templateKey: 'tenancy', warnings: first }));
    state = reducer(state, setWarningsForTemplate({ templateKey: 'tenancy', warnings: second }));
    expect(state.warningsByTemplate.tenancy).toEqual(second);
  });

  it('can set an empty warnings array (clears warnings)', () => {
    let state = reducer(
      initialState,
      setWarningsForTemplate({
        templateKey: 'viewing',
        warnings: [{ severity: 'critical', message: 'Something' }],
      }),
    );
    state = reducer(state, setWarningsForTemplate({ templateKey: 'viewing', warnings: [] }));
    expect(state.warningsByTemplate.viewing).toEqual([]);
  });

  it('does not affect mode or checklistAcknowledgedByTemplate', () => {
    const state = reducer(
      initialState,
      setWarningsForTemplate({
        templateKey: 'viewing',
        warnings: [],
      }),
    );
    expect(state.mode).toBe('warnings-only');
    expect(state.checklistAcknowledgedByTemplate).toEqual({});
  });

  it('preserves other template warnings when updating one key', () => {
    let state = reducer(
      initialState,
      setWarningsForTemplate({
        templateKey: 'viewing',
        warnings: [{ severity: 'critical', message: 'View warning' }],
      }),
    );
    state = reducer(
      state,
      setWarningsForTemplate({
        templateKey: 'booking',
        warnings: [{ severity: 'info', message: 'Book info' }],
      }),
    );
    // Now update viewing — booking should be untouched
    state = reducer(state, setWarningsForTemplate({ templateKey: 'viewing', warnings: [] }));
    expect(state.warningsByTemplate.booking).toHaveLength(1);
    expect(state.warningsByTemplate.viewing).toHaveLength(0);
  });
});

// ── acknowledgeChecklist ──────────────────────────────────────────────────────

describe('complianceSlice — acknowledgeChecklist', () => {
  it('sets acknowledged=true for a template', () => {
    const state = reducer(initialState, acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    expect(state.checklistAcknowledgedByTemplate.viewing).toBe(true);
  });

  it('sets acknowledged=false for a template', () => {
    let state = reducer(initialState, acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    state = reducer(state, acknowledgeChecklist({ templateKey: 'viewing', acknowledged: false }));
    expect(state.checklistAcknowledgedByTemplate.viewing).toBe(false);
  });

  it('stores acknowledgement for multiple templates independently', () => {
    let state = reducer(initialState, acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    state = reducer(state, acknowledgeChecklist({ templateKey: 'booking', acknowledged: false }));
    expect(state.checklistAcknowledgedByTemplate.viewing).toBe(true);
    expect(state.checklistAcknowledgedByTemplate.booking).toBe(false);
  });

  it('does not affect warningsByTemplate', () => {
    const state = reducer(initialState, acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    expect(state.warningsByTemplate).toEqual({});
  });

  it('does not affect mode', () => {
    const state = reducer(initialState, acknowledgeChecklist({ templateKey: 'viewing', acknowledged: true }));
    expect(state.mode).toBe('warnings-only');
  });

  it('unknown action leaves state unchanged', () => {
    const state = reducer(initialState, { type: 'unknown/action' });
    expect(state).toEqual(initialState);
  });
});
