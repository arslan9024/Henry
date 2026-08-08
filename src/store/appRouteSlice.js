import { createSlice } from '@reduxjs/toolkit';

export const APP_PAGES = {
  DOCUMENT_WORKSPACE: 'documentWorkspace',
  DOCUMENT_HUB: 'documentHub',
  PAYROLL: 'payroll',
  TENANCY_BUILDER: 'tenancyBuilder',
  TITLE_DEED: 'titleDeed',
  EMIRATES_ID: 'emiratesId',
  TENANT_IDENTITY_DOCS: 'tenantIdentityDocs',
  VALIDATION_DASHBOARD: 'validationDashboard',
};

export const APP_PAGE_NAV_ITEMS = [
  { key: APP_PAGES.DOCUMENT_WORKSPACE, label: 'Task Workspace', icon: '🗂️' },
  { key: APP_PAGES.DOCUMENT_HUB, label: 'Document Hub', icon: '📄' },
  { key: APP_PAGES.TENANCY_BUILDER, label: 'Tenancy Builder', icon: '🧩' },
  { key: APP_PAGES.TENANT_IDENTITY_DOCS, label: 'Tenant Identity', icon: '🛂' },
  { key: APP_PAGES.TITLE_DEED, label: 'Title Deed', icon: '🏷️' },
  { key: APP_PAGES.EMIRATES_ID, label: 'Emirates ID', icon: '🪪' },
  { key: APP_PAGES.PAYROLL, label: 'Payroll', icon: '💳' },
  { key: APP_PAGES.VALIDATION_DASHBOARD, label: 'Validation', icon: '✅' },
];

const VALID_PAGES = new Set(APP_PAGE_NAV_ITEMS.map((item) => item.key));
const DEFAULT_PAGE = APP_PAGES.DOCUMENT_WORKSPACE;
const VALID_OWNER_TAGS = new Set(['tenant', 'landlord']);
const VALID_DOCUMENT_TYPES = new Set(['passport', 'residence-permit']);
const VALID_REQUIREMENTS = new Set([
  'title-deed',
  'landlord-emirates-id',
  'tenant-emirates-id',
  'passport',
  'residence-permit',
]);

export const isValidAppPage = (page) => VALID_PAGES.has(page);

export const normalizeRouteContext = (context) => {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return null;

  const normalized = {};
  if (isValidAppPage(context.returnTo)) normalized.returnTo = context.returnTo;
  if (context.source === 'tenancy-builder') normalized.source = context.source;
  if (VALID_OWNER_TAGS.has(context.ownerTag)) normalized.ownerTag = context.ownerTag;
  if (VALID_DOCUMENT_TYPES.has(context.documentType)) normalized.documentType = context.documentType;
  if (VALID_REQUIREMENTS.has(context.requirement)) normalized.requirement = context.requirement;
  if (context.autoReturn === true) normalized.autoReturn = true;

  return Object.keys(normalized).length ? normalized : null;
};

const resolveNavigationPayload = (payload) => {
  if (typeof payload === 'string') {
    return { page: isValidAppPage(payload) ? payload : DEFAULT_PAGE, context: null };
  }

  const page = isValidAppPage(payload?.page) ? payload.page : DEFAULT_PAGE;
  return { page, context: normalizeRouteContext(payload?.context) };
};

/**
 * appRouteSlice
 * Manages current page/route state
 * Routes: 'documentWorkspace' (default) | 'documentHub' | 'payroll' | 'tenancyBuilder' | 'titleDeed' | 'emiratesId' | 'tenantIdentityDocs'
 */
const appRouteSlice = createSlice({
  name: 'appRoute',
  initialState: {
    currentPage: DEFAULT_PAGE,
    context: null,
  },
  reducers: {
    navigateToPage: (state, action) => {
      const navigation = resolveNavigationPayload(action.payload);
      state.currentPage = navigation.page;
      state.context = navigation.context;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = isValidAppPage(action.payload) ? action.payload : DEFAULT_PAGE;
      state.context = null;
    },
    clearRouteContext: (state) => {
      state.context = null;
    },
    goToDocumentHub: (state) => {
      state.currentPage = APP_PAGES.DOCUMENT_HUB;
      state.context = null;
    },
    goToDocumentWorkspace: (state) => {
      state.currentPage = APP_PAGES.DOCUMENT_WORKSPACE;
      state.context = null;
    },
    goToPayroll: (state) => {
      state.currentPage = APP_PAGES.PAYROLL;
      state.context = null;
    },
    goToTenancyBuilder: (state) => {
      state.currentPage = APP_PAGES.TENANCY_BUILDER;
      state.context = null;
    },
    goToTitleDeed: (state) => {
      state.currentPage = APP_PAGES.TITLE_DEED;
      state.context = null;
    },
    goToEmiratesId: (state) => {
      state.currentPage = APP_PAGES.EMIRATES_ID;
      state.context = null;
    },
    goToTenantIdentityDocs: (state) => {
      state.currentPage = APP_PAGES.TENANT_IDENTITY_DOCS;
      state.context = null;
    },
    goToValidationDashboard: (state) => {
      state.currentPage = APP_PAGES.VALIDATION_DASHBOARD;
      state.context = null;
    },
  },
});

export const {
  navigateToPage,
  setCurrentPage,
  clearRouteContext,
  goToDocumentHub,
  goToDocumentWorkspace,
  goToPayroll,
  goToTenancyBuilder,
  goToTitleDeed,
  goToEmiratesId,
  goToTenantIdentityDocs,
  goToValidationDashboard,
} = appRouteSlice.actions;
export default appRouteSlice.reducer;

// Selectors
export const selectCurrentPage = (state) => state.appRoute.currentPage;
export const selectRouteContext = (state) => state.appRoute.context || null;
export const selectAppPageNavItems = () => APP_PAGE_NAV_ITEMS;
export const selectIsDocumentWorkspacePage = (state) =>
  state.appRoute.currentPage === APP_PAGES.DOCUMENT_WORKSPACE;
export const selectIsPayrollPage = (state) => state.appRoute.currentPage === APP_PAGES.PAYROLL;
export const selectIsDocumentHubPage = (state) => state.appRoute.currentPage === APP_PAGES.DOCUMENT_HUB;
export const selectIsTenancyBuilderPage = (state) => state.appRoute.currentPage === APP_PAGES.TENANCY_BUILDER;
export const selectIsTitleDeedPage = (state) => state.appRoute.currentPage === APP_PAGES.TITLE_DEED;
export const selectIsEmiratesIdPage = (state) => state.appRoute.currentPage === APP_PAGES.EMIRATES_ID;
export const selectIsTenantIdentityDocsPage = (state) =>
  state.appRoute.currentPage === APP_PAGES.TENANT_IDENTITY_DOCS;
export const selectIsValidationDashboardPage = (state) =>
  state.appRoute.currentPage === APP_PAGES.VALIDATION_DASHBOARD;
