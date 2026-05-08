import { createSlice } from '@reduxjs/toolkit';
import { loadArchiveEntries, persistArchiveEntries } from '../records/archiveService';

const initialState = {
  entries: loadArchiveEntries(),
};

const archiveSlice = createSlice({
  name: 'archive',
  initialState,
  reducers: {
    addArchiveEntry: (state, action) => {
      state.entries.unshift(action.payload);
      state.entries = state.entries.slice(0, 100);
      // Side effect (localStorage + backend persistence) handled by listener middleware.
    },
    clearArchiveEntries: (state) => {
      state.entries = [];
      // Side effect handled by listener middleware.
    },
  },
});

export const { addArchiveEntry, clearArchiveEntries } = archiveSlice.actions;
export default archiveSlice.reducer;
