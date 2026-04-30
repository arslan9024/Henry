import { createSlice, nanoid } from '@reduxjs/toolkit';
import { STORAGE_KEY_AUDIT } from '../constants/storageKeys';

const MAX_ENTRIES = 100;

export const loadInitialAuditLogs = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_AUDIT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
};

export const persistAuditLogs = (logs) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
  } catch {
    /* quota exceeded or private mode — silently drop persistence */
  }
};

const initialState = {
  logs: loadInitialAuditLogs(),
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    addAuditLog: {
      reducer: (state, action) => {
        state.logs.unshift(action.payload);
        if (state.logs.length > MAX_ENTRIES) {
          state.logs = state.logs.slice(0, MAX_ENTRIES);
        }
        // Side effect (localStorage persistence) handled by listener middleware.
      },
      // Automatically add a unique `id` to every audit entry so deduplication
      // on import can use `id` instead of the collision-prone `timestamp|type` key.
      prepare: (payload) => ({ payload: { id: nanoid(), ...payload } }),
    },
    clearAuditLogs: (state) => {
      state.logs = [];
      // Side effect handled by listener middleware.
    },
    /**
     * Restore a previously-captured snapshot. Used to power the "Undo"
     * toast after a Clear, and could be reused for JSON re-import.
     */
    restoreAuditLogs: (state, action) => {
      const snapshot = Array.isArray(action.payload) ? action.payload : [];
      state.logs = snapshot.slice(0, MAX_ENTRIES);
      // Side effect handled by listener middleware.
    },
  },
});

export const { addAuditLog, clearAuditLogs, restoreAuditLogs } = auditSlice.actions;
export default auditSlice.reducer;
