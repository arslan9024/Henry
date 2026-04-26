import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'henry.audit.logs';
const MAX_ENTRIES = 100;

const loadInitial = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
};

const persist = (logs) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    /* quota exceeded or private mode — silently drop persistence */
  }
};

const initialState = {
  logs: loadInitial(),
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    addAuditLog: (state, action) => {
      state.logs.unshift(action.payload);
      if (state.logs.length > MAX_ENTRIES) {
        state.logs = state.logs.slice(0, MAX_ENTRIES);
      }
      persist(state.logs);
    },
    clearAuditLogs: (state) => {
      state.logs = [];
      persist(state.logs);
    },
    /**
     * Restore a previously-captured snapshot. Used to power the "Undo"
     * toast after a Clear, and could be reused for JSON re-import.
     */
    restoreAuditLogs: (state, action) => {
      const snapshot = Array.isArray(action.payload) ? action.payload : [];
      state.logs = snapshot.slice(0, MAX_ENTRIES);
      persist(state.logs);
    },
  },
});

export const { addAuditLog, clearAuditLogs, restoreAuditLogs } = auditSlice.actions;
export default auditSlice.reducer;
