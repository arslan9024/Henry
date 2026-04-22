import { createSlice } from '@reduxjs/toolkit';
import guidance from '../data/realEstateGuidance.json';

const initialState = {
  guidance,
  lastUpdated: '2026-04-23',
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    refreshSidebarTimestamp: (state, action) => {
      state.lastUpdated = action.payload || new Date().toISOString().slice(0, 10);
    },
  },
});

export const { refreshSidebarTimestamp } = sidebarSlice.actions;
export default sidebarSlice.reducer;
