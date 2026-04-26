import { describe, it, expect } from 'vitest';
import reducer, { setHenryStatus, syncHenryFromCRM } from './henrySlice';

describe('henrySlice', () => {
  it('initial state pins Henry identity (WC-AI-003 / Record Keeper)', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toMatchObject({
      aiId: 'WC-AI-003',
      name: 'Henry',
      title: 'The Record Keeper',
      module: 'Henry',
      status: 'Ready to file',
      lastSyncedAt: null,
    });
  });

  it('setHenryStatus updates status', () => {
    const state = reducer(undefined, setHenryStatus('Filing in progress'));
    expect(state.status).toBe('Filing in progress');
  });

  it('setHenryStatus with empty payload falls back to "Ready to file"', () => {
    const dirty = reducer(undefined, setHenryStatus('Offline for maintenance'));
    const cleaned = reducer(dirty, setHenryStatus(''));
    expect(cleaned.status).toBe('Ready to file');
    const cleanedNull = reducer(dirty, setHenryStatus(null));
    expect(cleanedNull.status).toBe('Ready to file');
  });

  it('syncHenryFromCRM updates only fields present in payload', () => {
    const state = reducer(
      undefined,
      syncHenryFromCRM({
        status: 'Reviewing compliance',
        lastSyncedAt: '2026-04-23T10:00:00Z',
      }),
    );
    expect(state.status).toBe('Reviewing compliance');
    expect(state.lastSyncedAt).toBe('2026-04-23T10:00:00Z');
  });

  it('syncHenryFromCRM with missing fields keeps prior values', () => {
    const seeded = reducer(
      undefined,
      syncHenryFromCRM({
        status: 'Awaiting input',
        lastSyncedAt: '2026-04-23T10:00:00Z',
      }),
    );
    const next = reducer(seeded, syncHenryFromCRM({}));
    expect(next.status).toBe('Awaiting input');
    expect(next.lastSyncedAt).toBe('2026-04-23T10:00:00Z');
  });

  it('syncHenryFromCRM with no payload at all is a no-op (covers null guard)', () => {
    const state = reducer(undefined, syncHenryFromCRM());
    expect(state.status).toBe('Ready to file');
    expect(state.lastSyncedAt).toBeNull();
  });
});
