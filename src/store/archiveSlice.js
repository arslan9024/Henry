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
      persistArchiveEntries(state.entries);
    },
    clearArchiveEntries: (state) => {
      state.entries = [];
      persistArchiveEntries(state.entries);
    },
  },
});

export const { addArchiveEntry, clearArchiveEntries } = archiveSlice.actions;
export default archiveSlice.reducer;
