import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'warnings-only',
  warningsByTemplate: {},
  checklistAcknowledgedByTemplate: {},
};

const complianceSlice = createSlice({
  name: 'compliance',
  initialState,
  reducers: {
    setWarningsForTemplate: (state, action) => {
      const { templateKey, warnings } = action.payload;
      state.warningsByTemplate[templateKey] = warnings;
    },
    acknowledgeChecklist: (state, action) => {
      const { templateKey, acknowledged } = action.payload;
      state.checklistAcknowledgedByTemplate[templateKey] = acknowledged;
    },
  },
});

export const { setWarningsForTemplate, acknowledgeChecklist } = complianceSlice.actions;
export default complianceSlice.reducer;
