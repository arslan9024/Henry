import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'henry.field-sources.v1';

export const loadFieldSources = () => {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

export const persistFieldSources = (byField) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(byField || {}));
  } catch {
    // Local persistence is best effort; audit events retain the apply operation.
  }
};

const fieldSourceSlice = createSlice({
  name: 'fieldSources',
  initialState: { byField: loadFieldSources() },
  reducers: {
    recordFieldSources: (state, action) => {
      const { section, values, source } = action.payload || {};
      if (!section || !values || typeof values !== 'object' || !source) return;
      const appliedAt = source.appliedAt || new Date().toISOString();
      Object.entries(values).forEach(([field, value]) => {
        if (value === undefined || value === null || value === '') return;
        state.byField[`${section}.${field}`] = { ...source, appliedAt };
      });
    },
    clearFieldSources: (state) => {
      state.byField = {};
    },
  },
});

export const { clearFieldSources, recordFieldSources } = fieldSourceSlice.actions;
export const selectFieldSources = (state) => state.fieldSources?.byField || {};
export const selectFieldSource = (state, path) => state.fieldSources?.byField?.[path] || null;
export default fieldSourceSlice.reducer;
