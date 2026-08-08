import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import appRouteReducer, { APP_PAGES, navigateToPage } from '../store/appRouteSlice';
import documentReducer from '../store/documentSlice';
import EmiratesIdModulePage from './emiratesId/EmiratesIdModulePage';
import TenantIdentityDocsPage from './tenantIdentity/TenantIdentityDocsPage';
import TitleDeedModulePage from './titleDeed/TitleDeedModulePage';

const makeStore = ({ page, context }) => {
  const store = configureStore({
    reducer: {
      appRoute: appRouteReducer,
      document: documentReducer,
    },
  });

  store.dispatch(navigateToPage({ page, context }));
  return store;
};

const renderWithStore = (component, store) => render(<Provider store={store}>{component}</Provider>);

describe('extractor route context', () => {
  it('preselects landlord owner tag when Emirates ID is opened from the landlord gate', () => {
    const store = makeStore({
      page: APP_PAGES.EMIRATES_ID,
      context: {
        source: 'tenancy-builder',
        returnTo: APP_PAGES.TENANCY_BUILDER,
        ownerTag: 'landlord',
        requirement: 'landlord-emirates-id',
        autoReturn: true,
      },
    });

    renderWithStore(<EmiratesIdModulePage />, store);

    expect(screen.getByRole('combobox', { name: /owner tag/i })).toHaveValue('landlord');
    expect(screen.getByRole('button', { name: /back to tenancy builder/i })).toBeInTheDocument();
  });

  it('preselects residence permit when scanner is opened from that missing requirement', () => {
    const store = makeStore({
      page: APP_PAGES.TENANT_IDENTITY_DOCS,
      context: {
        source: 'tenancy-builder',
        returnTo: APP_PAGES.TENANCY_BUILDER,
        documentType: 'residence-permit',
        requirement: 'residence-permit',
        autoReturn: true,
      },
    });

    renderWithStore(<TenantIdentityDocsPage />, store);

    expect(screen.getByRole('combobox', { name: /document type/i })).toHaveValue('residence-permit');
  });

  it('returns to the tenancy builder and clears route context from a contextual title deed flow', () => {
    const store = makeStore({
      page: APP_PAGES.TITLE_DEED,
      context: {
        source: 'tenancy-builder',
        returnTo: APP_PAGES.TENANCY_BUILDER,
        requirement: 'title-deed',
        autoReturn: true,
      },
    });

    renderWithStore(<TitleDeedModulePage />, store);
    fireEvent.click(screen.getByRole('button', { name: /back to tenancy builder/i }));

    expect(store.getState().appRoute).toEqual({
      currentPage: APP_PAGES.TENANCY_BUILDER,
      context: null,
    });
  });
});
