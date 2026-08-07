import { createSlice } from '@reduxjs/toolkit';

export const APP_PAGES = {
  DOCUMENT_HUB: 'documentHub',
  PAYROLL: 'payroll',
  TENANCY_BUILDER: 'tenancyBuilder',
  TITLE_DEED: 'titleDeed',
  EMIRATES_ID: 'emiratesId',
  TENANT_IDENTITY_DOCS: 'tenantIdentityDocs',
};

export const APP_PAGE_NAV_ITEMS = [
  { key: APP_PAGES.DOCUMENT_HUB, label: 'Document Hub', icon: '📄' },
  { key: APP_PAGES.TENANCY_BUILDER, label: 'Tenancy Builder', icon: '🧩' },
  { key: APP_PAGES.TENANT_IDENTITY_DOCS, label: 'Tenant Identity', icon: '🛂' },
  { key: APP_PAGES.TITLE_DEED, label: 'Title Deed', icon: '🏷️' },
  { key: APP_PAGES.EMIRATES_ID, label: 'Emirates ID', icon: '🪪' },
  { key: APP_PAGES.PAYROLL, label: 'Payroll', icon: '💳' },
];

const VALID_PAGES = new Set(APP_PAGE_NAV_ITEMS.map((item) => item.key));
const DEFAULT_PAGE = APP_PAGES.DOCUMENT_HUB;

export const isValidAppPage = (page) => VALID_PAGES.has(page);

/**
 * appRouteSlice
 * Manages current page/route state
 * Routes: 'documentHub' (default) | 'payroll' | 'tenancyBuilder' | 'titleDeed' | 'emiratesId' | 'tenantIdentityDocs'
 */
const appRouteSlice = createSlice({
  name: 'appRoute',
  initialState: {
    currentPage: DEFAULT_PAGE,
  },
  reducers: {
    navigateToPage: (state, action) => {
      state.currentPage = isValidAppPage(action.payload) ? action.payload : DEFAULT_PAGE;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = isValidAppPage(action.payload) ? action.payload : DEFAULT_PAGE;
    },
    goToDocumentHub: (state) => {
      state.currentPage = APP_PAGES.DOCUMENT_HUB;
    },
    goToPayroll: (state) => {
      state.currentPage = APP_PAGES.PAYROLL;
    },
    goToTenancyBuilder: (state) => {
      state.currentPage = APP_PAGES.TENANCY_BUILDER;
    },
    goToTitleDeed: (state) => {
      state.currentPage = APP_PAGES.TITLE_DEED;
    },
    goToEmiratesId: (state) => {
      state.currentPage = APP_PAGES.EMIRATES_ID;
    },
    goToTenantIdentityDocs: (state) => {
      state.currentPage = APP_PAGES.TENANT_IDENTITY_DOCS;
    },
  },
});

export const {
  navigateToPage,
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
export const selectAppPageNavItems = () => APP_PAGE_NAV_ITEMS;
export const selectIsPayrollPage = (state) => state.appRoute.currentPage === APP_PAGES.PAYROLL;
export const selectIsDocumentHubPage = (state) => state.appRoute.currentPage === APP_PAGES.DOCUMENT_HUB;
export const selectIsTenancyBuilderPage = (state) => state.appRoute.currentPage === APP_PAGES.TENANCY_BUILDER;
export const selectIsTitleDeedPage = (state) => state.appRoute.currentPage === APP_PAGES.TITLE_DEED;
export const selectIsEmiratesIdPage = (state) => state.appRoute.currentPage === APP_PAGES.EMIRATES_ID;
export const selectIsTenantIdentityDocsPage = (state) =>
  state.appRoute.currentPage === APP_PAGES.TENANT_IDENTITY_DOCS;
