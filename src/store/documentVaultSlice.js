/**
 * [Category 3: In-Memory State]
 * White Caves Real Estate - Document Vault Slice (documentVaultSlice.js)
 * Manages saved document records, active preview modal, and vault search query (< 110 lines).
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: [],
  isLoading: false,
  searchQuery: '',
  activePreviewDoc: null,
  isVaultModalOpen: false,
  lastSavedAt: null,
};

export const documentVaultSlice = createSlice({
  name: 'documentVault',
  initialState,
  reducers: {
    setVaultLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setVaultDocuments: (state, action) => {
      state.documents = action.payload;
    },
    addVaultDocument: (state, action) => {
      state.documents.unshift(action.payload);
      state.lastSavedAt = new Date().toISOString();
    },
    removeVaultDocument: (state, action) => {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
    },
    setVaultSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActivePreviewDoc: (state, action) => {
      state.activePreviewDoc = action.payload;
    },
    toggleVaultModal: (state, action) => {
      state.isVaultModalOpen = typeof action.payload === 'boolean' ? action.payload : !state.isVaultModalOpen;
    },
    clearActivePreviewDoc: (state) => {
      state.activePreviewDoc = null;
    },
  },
});

export const {
  setVaultLoading,
  setVaultDocuments,
  addVaultDocument,
  removeVaultDocument,
  setVaultSearchQuery,
  setActivePreviewDoc,
  toggleVaultModal,
  clearActivePreviewDoc,
} = documentVaultSlice.actions;

export default documentVaultSlice.reducer;
