import { createSlice } from '@reduxjs/toolkit';
import policySources from '../data/policy-sources.json';

const initialState = {
  version: 'v1.0.0',
  reviewedAt: '2026-04-23',
  reviewedBy: 'White Caves Compliance Team',
  sources: policySources,
};

const policyMetaSlice = createSlice({
  name: 'policyMeta',
  initialState,
  reducers: {
    updatePolicyMeta: (state, action) => {
      const { version, reviewedAt, reviewedBy } = action.payload;
      if (version) state.version = version;
      if (reviewedAt) state.reviewedAt = reviewedAt;
      if (reviewedBy) state.reviewedBy = reviewedBy;
    },
  },
});

export const { updatePolicyMeta } = policyMetaSlice.actions;
export default policyMetaSlice.reducer;
