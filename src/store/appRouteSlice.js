import { createSlice } from '@reduxjs/toolkit';

/**
 * appRouteSlice
 * Manages current page/route state
 * Routes: 'documentHub' (default) | 'payroll'
 */
const appRouteSlice = createSlice({
  name: 'appRoute',
  initialState: {
    currentPage: 'documentHub', // 'documentHub' | 'payroll'
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    goToDocumentHub: (state) => {
      state.currentPage = 'documentHub';
    },
    goToPayroll: (state) => {
      state.currentPage = 'payroll';
    },
  },
});

export const { setCurrentPage, goToDocumentHub, goToPayroll } = appRouteSlice.actions;
export default appRouteSlice.reducer;

// Selectors
export const selectCurrentPage = (state) => state.appRoute.currentPage;
export const selectIsPayrollPage = (state) => state.appRoute.currentPage === 'payroll';
export const selectIsDocumentHubPage = (state) => state.appRoute.currentPage === 'documentHub';
