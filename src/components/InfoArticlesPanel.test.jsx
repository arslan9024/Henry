/**
 * InfoArticlesPanel Integration Tests
 *
 * Covers:
 * 1. Renders Henry's guidance sidebar with header and avatar
 * 2. Shows active document label from Redux / useSidebarContent
 * 3. Shows lastUpdated date from sidebar slice
 * 4. Renders DocumentSelector inside a Disclosure
 * 5. Renders HenryOperationsPanel inside a Disclosure
 * 6. Renders IdentityScanner inside a Disclosure
 * 7. Filing Highlights: empty list renders with no items
 * 8. Filing Highlights: items render when provided
 * 9. Guidance Articles: empty renders cleanly
 * 10. Guidance Articles: articles render with title + text
 * 11. Highlight badge count matches number of items
 * 12. Articles badge count matches number of articles
 * 13. Highlights list has correct aria-label
 * 14. Articles list has correct aria-label
 * 15. Sidebar has correct aria-label on aside element
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import templateReducer from '../store/templateSlice';
import documentReducer from '../store/documentSlice';
import complianceReducer from '../store/complianceSlice';
import sidebarReducer from '../store/sidebarSlice';
import InfoArticlesPanel from './InfoArticlesPanel';

// ─── mocks ────────────────────────────────────────────────────────────────────

vi.mock('./DocumentSelector', () => ({
  default: () => <div data-testid="mock-document-selector">DocumentSelector</div>,
}));

vi.mock('./HenryOperationsPanel', () => ({
  default: () => <div data-testid="mock-henry-ops">HenryOperationsPanel</div>,
}));

vi.mock('./IdentityScanner', () => ({
  default: () => <div data-testid="mock-identity-scanner">IdentityScanner</div>,
}));

// Disclosure: lightweight stand-in – renders children + title
vi.mock('./Disclosure', () => ({
  default: ({ title, badge, children }) => (
    <div data-testid={`disclosure-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <span data-testid="disclosure-title">{title}</span>
      {badge !== undefined && badge !== null && <span data-testid="disclosure-badge">{badge}</span>}
      <div data-testid="disclosure-body">{children}</div>
    </div>
  ),
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      template: templateReducer,
      document: documentReducer,
      compliance: complianceReducer,
      sidebar: sidebarReducer,
    },
    preloadedState,
  });
}

function makeSidebarState(overrides = {}) {
  return {
    lastUpdated: '2026-04-23',
    guidance: {
      common: {
        highlights: overrides.highlights || [],
        articles: overrides.articles || [],
      },
      byTemplate: {},
    },
  };
}

function renderPanel(store) {
  return render(
    <Provider store={store}>
      <InfoArticlesPanel />
    </Provider>,
  );
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('InfoArticlesPanel', () => {
  // 1. Renders the header avatar and title
  it('renders Henry avatar emoji and sidebar title', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    expect(screen.getByText('🤵')).toBeInTheDocument();
    expect(screen.getByText(/Henry's Guidance/i)).toBeInTheDocument();
  });

  // 2. Renders WC-AI-003 subtitle
  it('renders WC-AI-003 subtitle', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    expect(screen.getByText(/WC-AI-003/)).toBeInTheDocument();
  });

  // 3. Shows active document label
  it('shows the active document label in policy-meta', () => {
    // booking template label contains "Booking Form"
    const store = makeStore({ template: { activeTemplate: 'booking' }, sidebar: makeSidebarState() });
    renderPanel(store);
    expect(screen.getByText(/Active document:/i)).toBeInTheDocument();
    // Template label for 'booking' is 'Booking Form (Standard Leasing)'
    expect(screen.getByText(/Booking Form/i)).toBeInTheDocument();
  });

  // 4. Shows lastUpdated date from sidebar slice
  it('shows the guidance lastUpdated date', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    expect(screen.getByText(/2026-04-23/)).toBeInTheDocument();
  });

  // 5. Renders DocumentSelector inside Templates Disclosure
  it('renders DocumentSelector inside the Templates disclosure', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    const templatesDisc = screen.getByTestId('disclosure-templates');
    expect(within(templatesDisc).getByTestId('mock-document-selector')).toBeInTheDocument();
  });

  // 6. Renders HenryOperationsPanel inside Operations Disclosure
  it('renders HenryOperationsPanel inside the Operations disclosure', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    const opsDisc = screen.getByTestId('disclosure-operations');
    expect(within(opsDisc).getByTestId('mock-henry-ops')).toBeInTheDocument();
  });

  // 7. Renders IdentityScanner inside Identity Scanner Disclosure
  it('renders IdentityScanner inside the Identity Scanner disclosure', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    const idDisc = screen.getByTestId('disclosure-identity-scanner');
    expect(within(idDisc).getByTestId('mock-identity-scanner')).toBeInTheDocument();
  });

  // 8. Filing Highlights: empty list renders no items
  it('renders empty highlights list with no items', () => {
    const store = makeStore({ sidebar: makeSidebarState({ highlights: [] }) });
    renderPanel(store);
    const list = screen.getByRole('list', { name: /key filing highlights/i });
    expect(list.children).toHaveLength(0);
  });

  // 9. Filing Highlights: items render when provided
  it('renders each highlight as a paragraph', () => {
    const store = makeStore({
      sidebar: makeSidebarState({ highlights: ['Check RERA permit', 'Verify PDC cheque'] }),
    });
    renderPanel(store);
    expect(screen.getByText('Check RERA permit')).toBeInTheDocument();
    expect(screen.getByText('Verify PDC cheque')).toBeInTheDocument();
  });

  // 10. Guidance Articles: articles render with title + text
  it('renders guidance articles with title and text', () => {
    const store = makeStore({
      sidebar: makeSidebarState({
        articles: [
          { title: 'DLD Registration', text: 'Must register within 60 days.' },
          { title: 'RERA Escrow', text: 'Funds held in escrow account.' },
        ],
      }),
    });
    renderPanel(store);
    expect(screen.getByText('DLD Registration')).toBeInTheDocument();
    expect(screen.getByText('Must register within 60 days.')).toBeInTheDocument();
    expect(screen.getByText('RERA Escrow')).toBeInTheDocument();
    expect(screen.getByText('Funds held in escrow account.')).toBeInTheDocument();
  });

  // 11. Guidance Articles: empty renders cleanly (no article elements)
  it('renders no article cards when articles list is empty', () => {
    const store = makeStore({ sidebar: makeSidebarState({ articles: [] }) });
    renderPanel(store);
    const articleList = screen.getByRole('list', { name: /henry's document guidance articles/i });
    expect(articleList.children).toHaveLength(0);
  });

  // 12. Highlight badge count matches highlights length
  it('shows correct badge count for filing highlights', () => {
    const store = makeStore({
      sidebar: makeSidebarState({ highlights: ['item-1', 'item-2', 'item-3'] }),
    });
    renderPanel(store);
    const filingDisc = screen.getByTestId('disclosure-filing-highlights');
    expect(within(filingDisc).getByTestId('disclosure-badge')).toHaveTextContent('3');
  });

  // 13. Articles badge count matches articles length
  it('shows correct badge count for guidance articles', () => {
    const store = makeStore({
      sidebar: makeSidebarState({
        articles: [
          { title: 'A1', text: 'text1' },
          { title: 'A2', text: 'text2' },
        ],
      }),
    });
    renderPanel(store);
    const guidanceDisc = screen.getByTestId('disclosure-guidance-articles');
    expect(within(guidanceDisc).getByTestId('disclosure-badge')).toHaveTextContent('2');
  });

  // 14. Highlights list has accessible aria-label
  it('highlights list has aria-label "Key filing highlights"', () => {
    const store = makeStore({ sidebar: makeSidebarState({ highlights: ['x'] }) });
    renderPanel(store);
    expect(screen.getByRole('list', { name: /key filing highlights/i })).toBeInTheDocument();
  });

  // 15. Articles list has accessible aria-label
  it('articles list has aria-label for Henry guidance articles', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    expect(screen.getByRole('list', { name: /henry's document guidance articles/i })).toBeInTheDocument();
  });

  // 16. Aside element has correct aria-label
  it('aside has aria-label "Henry\'s guidance sidebar"', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    expect(screen.getByRole('complementary', { name: /henry's guidance sidebar/i })).toBeInTheDocument();
  });

  // 17. Disclosure titles rendered for all sections
  it('renders all four disclosure section titles', () => {
    const store = makeStore({ sidebar: makeSidebarState() });
    renderPanel(store);
    const titles = screen.getAllByTestId('disclosure-title').map((el) => el.textContent);
    expect(titles).toContain('Templates');
    expect(titles).toContain('Operations');
    expect(titles).toContain('Identity Scanner');
    expect(titles).toContain('Filing Highlights');
    expect(titles).toContain('Guidance Articles');
  });
});
