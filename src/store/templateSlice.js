import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTemplate: 'booking',
};

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setActiveTemplate: (state, action) => {
      state.activeTemplate = action.payload;
    },
  },
});

export const { setActiveTemplate } = templateSlice.actions;
export default templateSlice.reducer;
