import { describe, it, expect } from 'vitest';
import reducer, { setOcrProcessing, setOcrDraft, clearOcrDraft, approveOcrDraft } from './ocrSlice';

describe('ocrSlice', () => {
  it('initial state has no draft, not processing', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ processing: false, draft: null, lastApproved: null });
  });

  it('setOcrProcessing flips the processing flag', () => {
    const on = reducer(undefined, setOcrProcessing(true));
    expect(on.processing).toBe(true);
    const off = reducer(on, setOcrProcessing(false));
    expect(off.processing).toBe(false);
  });

  it('setOcrDraft stores the draft payload', () => {
    const draft = { tenant: { fullName: 'Jane' }, _meta: { source: 'emirates-id' } };
    const state = reducer(undefined, setOcrDraft(draft));
    expect(state.draft).toEqual(draft);
  });

  it('clearOcrDraft drops the draft AND resets processing', () => {
    let state = reducer(undefined, setOcrProcessing(true));
    state = reducer(state, setOcrDraft({ x: 1 }));
    state = reducer(state, clearOcrDraft());
    expect(state.draft).toBeNull();
    expect(state.processing).toBe(false);
    // lastApproved is unaffected
    expect(state.lastApproved).toBeNull();
  });

  it('approveOcrDraft moves draft → lastApproved AND clears draft + processing', () => {
    let state = reducer(undefined, setOcrProcessing(true));
    state = reducer(state, setOcrDraft({ x: 1 }));
    const approval = { tenant: { fullName: 'Jane' } };
    state = reducer(state, approveOcrDraft(approval));
    expect(state.lastApproved).toEqual(approval);
    expect(state.draft).toBeNull();
    expect(state.processing).toBe(false);
  });
});
