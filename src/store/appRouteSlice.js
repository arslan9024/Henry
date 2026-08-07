import { createSlice } from '@reduxjs/toolkit';

/**
 * appRouteSlice
 * Manages current page/route state
 * Routes: 'documentHub' (default) | 'payroll' | 'tenancyBuilder' | 'titleDeed' | 'emiratesId' | 'tenantIdentityDocs'
 */
const appRouteSlice = createSlice({
  name: 'appRoute',
  initialState: {
    currentPage: 'documentHub', // 'documentHub' | 'payroll' | 'tenancyBuilder' | 'titleDeed' | 'emiratesId' | 'tenantIdentityDocs'
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
    goToTenancyBuilder: (state) => {
      state.currentPage = 'tenancyBuilder';
    },
    goToTitleDeed: (state) => {
      state.currentPage = 'titleDeed';
    },
    goToEmiratesId: (state) => {
      state.currentPage = 'emiratesId';
    },
    goToTenantIdentityDocs: (state) => {
      state.currentPage = 'tenantIdentityDocs';
    },
  },
});

export const {
  setCurrentPage,
  goToDocumentHub,
  goToPayroll,
  goToTenancyBuilder,
  goToTitleDeed,
  goToEmiratesId,
  goToTenantIdentityDocs,
} = appRouteSlice.actions;
export default appRouteSlice.reducer;

// Selectors
export const selectCurrentPage = (state) => state.appRoute.currentPage;
export const selectIsPayrollPage = (state) => state.appRoute.currentPage === 'payroll';
export const selectIsDocumentHubPage = (state) => state.appRoute.currentPage === 'documentHub';
export const selectIsTenancyBuilderPage = (state) => state.appRoute.currentPage === 'tenancyBuilder';
export const selectIsTitleDeedPage = (state) => state.appRoute.currentPage === 'titleDeed';
export const selectIsEmiratesIdPage = (state) => state.appRoute.currentPage === 'emiratesId';
export const selectIsTenantIdentityDocsPage = (state) => state.appRoute.currentPage === 'tenantIdentityDocs';
