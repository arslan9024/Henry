import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    addAuditLog: (state, action) => {
      state.logs.unshift(action.payload);
      if (state.logs.length > 100) {
        state.logs = state.logs.slice(0, 100);
      }
    },
  },
});

export const { addAuditLog } = auditSlice.actions;
export default auditSlice.reducer;
