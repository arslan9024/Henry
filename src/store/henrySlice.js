/**
 * henrySlice.js
 * Redux state for Henry — The Record Keeper (AI Assistant WC-AI-003)
 *
 * This slice carries Henry's identity, current operational status, and
 * module affiliation. It is designed for future live-sync with the White Caves
 * main CRM, where the platform will dispatch setHenryStatus() to reflect
 * Henry's real-time state across all connected modules.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /** Canonical AI assistant identifier — used for cross-system identity linking */
  aiId: 'WC-AI-003',

  /** Display name */
  name: 'Henry',

  /** Official role title */
  title: 'The Record Keeper',

  /** Human-readable module this instance is deployed in */
  module: 'Henry',

  /**
   * Operational status — updated by the main CRM via dispatch(setHenryStatus())
   * Possible values: 'Ready to file', 'Filing in progress', 'Reviewing compliance',
   *                  'Awaiting input', 'Offline for maintenance'
   */
  status: 'Ready to file',

  /** ISO date of last sync from main CRM (null = standalone mode) */
  lastSyncedAt: null,
};

const henrySlice = createSlice({
  name: 'henry',
  initialState,
  reducers: {
    /**
     * setHenryStatus(status: string)
     * Update Henry's operational status — callable from the main CRM via
     * postMessage / Redux hydration when this module is embedded.
     */
    setHenryStatus: (state, action) => {
      state.status = action.payload || 'Ready to file';
    },

    /**
     * syncHenryFromCRM({ status, lastSyncedAt })
     * Full identity sync when the main CRM loads this module.
     */
    syncHenryFromCRM: (state, action) => {
      const { status, lastSyncedAt } = action.payload || {};
      if (status) state.status = status;
      if (lastSyncedAt) state.lastSyncedAt = lastSyncedAt;
    },
  },
});

export const { setHenryStatus, syncHenryFromCRM } = henrySlice.actions;
export default henrySlice.reducer;
