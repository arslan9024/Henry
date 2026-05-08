/**
 * PrintLayout.test.jsx
 * Tests for src/components/PrintLayout — Redux-connected layout wrapper
 * that renders header/content/footer regions and reads policyMeta + henry
 * from the store.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import PrintLayout from './PrintLayout';
import policyMetaReducer from '../store/policyMetaSlice';
import henryReducer from '../store/henrySlice';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      policyMeta: policyMetaReducer,
      henry: henryReducer,
    },
    preloadedState,
  });

const renderWithStore = (ui, store = makeStore()) => render(<Provider store={store}>{ui}</Provider>);

// ── ARIA structure ────────────────────────────────────────────────────────────

describe('PrintLayout — ARIA structure', () => {
  it('renders a role="document" wrapper', () => {
    renderWithStore(<PrintLayout documentTitle="Test Doc" />);
    expect(screen.getByRole('document')).toBeDefined();
  });

  it('renders a role="banner" header', () => {
    renderWithStore(<PrintLayout documentTitle="Test Doc" />);
    expect(screen.getByRole('banner')).toBeDefined();
  });

  it('header has aria-label "Document header"', () => {
    renderWithStore(<PrintLayout documentTitle="Test Doc" />);
    expect(screen.getByLabelText('Document header')).toBeDefined();
  });

  it('renders a role="main" content area', () => {
    renderWithStore(<PrintLayout documentTitle="Test Doc" />);
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('renders a role="contentinfo" footer', () => {
    renderWithStore(<PrintLayout documentTitle="Test Doc" />);
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });

  it('footer has aria-label "Document footer"', () => {
    renderWithStore(<PrintLayout documentTitle="Test Doc" />);
    expect(screen.getByLabelText('Document footer')).toBeDefined();
  });
});

// ── branding content ──────────────────────────────────────────────────────────

describe('PrintLayout — branding', () => {
  it('shows White Caves company name in the header', () => {
    renderWithStore(<PrintLayout documentTitle="Invoice" />);
    expect(screen.getByText('White Caves Real Estate L.L.C')).toBeDefined();
  });

  it('shows the DED license number', () => {
    renderWithStore(<PrintLayout documentTitle="Invoice" />);
    expect(screen.getByText(/DED License.*1388443/)).toBeDefined();
  });
});

// ── policy version from store ─────────────────────────────────────────────────

describe('PrintLayout — policy version', () => {
  it('renders the policy version from the store', () => {
    const store = makeStore({
      policyMeta: {
        version: 'v2.5.0',
        reviewedAt: '2026-04-23',
        reviewedBy: 'Team',
        sources: [],
      },
    });
    renderWithStore(<PrintLayout documentTitle="Contract" />, store);
    expect(screen.getByText(/v2\.5\.0/)).toBeDefined();
  });

  it('includes the documentTitle in the footer', () => {
    renderWithStore(<PrintLayout documentTitle="Tenancy Agreement" />);
    expect(screen.getByText(/Tenancy Agreement/)).toBeDefined();
  });
});

// ── henry attribution from store ─────────────────────────────────────────────

describe('PrintLayout — henry attribution', () => {
  it('shows henry name in footer', () => {
    renderWithStore(<PrintLayout documentTitle="Doc" />);
    expect(screen.getByText(/Henry/)).toBeDefined();
  });

  it('shows henry title in footer', () => {
    renderWithStore(<PrintLayout documentTitle="Doc" />);
    expect(screen.getByText(/The Record Keeper/)).toBeDefined();
  });

  it('shows henry aiId in footer', () => {
    renderWithStore(<PrintLayout documentTitle="Doc" />);
    expect(screen.getByText(/WC-AI-003/)).toBeDefined();
  });

  it('reflects custom henry name from preloadedState', () => {
    const store = makeStore({
      henry: {
        aiId: 'WC-AI-999',
        name: 'TestBot',
        title: 'The Tester',
        module: 'Test',
        status: 'Ready to file',
        lastSyncedAt: null,
      },
    });
    renderWithStore(<PrintLayout documentTitle="Doc" />, store);
    expect(screen.getByText(/TestBot/)).toBeDefined();
    expect(screen.getByText(/WC-AI-999/)).toBeDefined();
  });
});

// ── children passthrough ──────────────────────────────────────────────────────

describe('PrintLayout — children', () => {
  it('renders children inside the main region', () => {
    renderWithStore(
      <PrintLayout documentTitle="Doc">
        <p data-testid="child-content">Hello content</p>
      </PrintLayout>,
    );
    const main = screen.getByRole('main');
    expect(main.querySelector('[data-testid="child-content"]')).toBeDefined();
  });

  it('renders multiple children', () => {
    renderWithStore(
      <PrintLayout documentTitle="Doc">
        <section data-testid="s1">One</section>
        <section data-testid="s2">Two</section>
      </PrintLayout>,
    );
    const main = screen.getByRole('main');
    expect(main.querySelectorAll('section').length).toBe(2);
  });
});
