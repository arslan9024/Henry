import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  processing: false,
  draft: null,
  lastApproved: null,
};

const ocrSlice = createSlice({
  name: 'ocr',
  initialState,
  reducers: {
    setOcrProcessing: (state, action) => {
      state.processing = action.payload;
    },
    setOcrDraft: (state, action) => {
      state.draft = action.payload;
    },
    clearOcrDraft: (state) => {
      state.draft = null;
      state.processing = false;
    },
    approveOcrDraft: (state, action) => {
      state.lastApproved = action.payload;
      state.draft = null;
      state.processing = false;
    },
  },
});

export const { setOcrProcessing, setOcrDraft, clearOcrDraft, approveOcrDraft } = ocrSlice.actions;
export default ocrSlice.reducer;
