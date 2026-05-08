/**
 * FileExtractionPanel.test.jsx
 * Pure presentational component (no Redux).
 * Renders inline extraction suggestions from LLM file analysis with
 * per-row Apply / Dismiss and bulk Apply-All / Dismiss-All actions.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileExtractionPanel from './FileExtractionPanel';

// ── helpers ───────────────────────────────────────────────────────────────────

const S1 = {
  section: 'tenant',
  field: 'fullName',
  value: 'Ahmed Al Mansouri',
  confidence: 0.92,
  rationale: 'clear OCR match',
};
const S2 = {
  section: 'tenant',
  field: 'emiratesId',
  value: '784-1234-1234567-1',
  confidence: 0.76,
  rationale: 'partial match',
};
const S3 = {
  section: 'property',
  field: 'unit',
  value: 'Unit 449',
  confidence: 0.6,
  rationale: 'low confidence',
};

const DEFAULT_PROPS = {
  fileName: 'emirates_id.pdf',
  suggestions: [S1, S2],
  onApply: vi.fn(),
  onApplyAll: vi.fn(),
  onDismiss: vi.fn(),
  onDismissAll: vi.fn(),
};

const renderPanel = (props = {}) => render(<FileExtractionPanel {...DEFAULT_PROPS} {...props} />);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── structure ─────────────────────────────────────────────────────────────────

describe('FileExtractionPanel — structure', () => {
  it('renders a region with aria-label "File extraction suggestions"', () => {
    renderPanel();
    expect(screen.getByRole('region', { name: /File extraction suggestions/i })).toBeDefined();
  });

  it('displays the file name in the header', () => {
    renderPanel();
    expect(screen.getByText(/emirates_id\.pdf/)).toBeDefined();
  });

  it('shows the suggestion count as "N of M suggestions"', () => {
    renderPanel();
    expect(screen.getByText(/2 of 2 suggestions/i)).toBeDefined();
  });

  it('renders the section.field target for each suggestion', () => {
    renderPanel();
    expect(screen.getByText('tenant.fullName')).toBeDefined();
    expect(screen.getByText('tenant.emiratesId')).toBeDefined();
  });

  it('renders the value for each suggestion', () => {
    renderPanel();
    expect(screen.getByText('Ahmed Al Mansouri')).toBeDefined();
    expect(screen.getByText('784-1234-1234567-1')).toBeDefined();
  });
});

// ── confidence badges ─────────────────────────────────────────────────────────

describe('FileExtractionPanel — confidence', () => {
  it('shows percentage for high-confidence suggestion (≥85%)', () => {
    renderPanel({ suggestions: [S1] }); // 0.92 → 92%
    expect(screen.getByText('92%')).toBeDefined();
  });

  it('shows percentage for med-confidence suggestion (70–84%)', () => {
    renderPanel({ suggestions: [S2] }); // 0.76 → 76%
    expect(screen.getByText('76%')).toBeDefined();
  });

  it('shows percentage for low-confidence suggestion (<70%)', () => {
    renderPanel({ suggestions: [S3] }); // 0.60 → 60%
    expect(screen.getByText('60%')).toBeDefined();
  });

  it('assigns high confidence class for ≥85%', () => {
    const { container } = renderPanel({ suggestions: [S1] });
    expect(container.querySelector('.llm-chat__confidence--high')).toBeDefined();
  });

  it('assigns med confidence class for 70–84%', () => {
    const { container } = renderPanel({ suggestions: [S2] });
    expect(container.querySelector('.llm-chat__confidence--med')).toBeDefined();
  });

  it('assigns low confidence class for <70%', () => {
    const { container } = renderPanel({ suggestions: [S3] });
    expect(container.querySelector('.llm-chat__confidence--low')).toBeDefined();
  });
});

// ── Apply ─────────────────────────────────────────────────────────────────────

describe('FileExtractionPanel — Apply', () => {
  it('renders Apply buttons for each suggestion', () => {
    renderPanel();
    expect(screen.getAllByRole('button', { name: /^Apply$/ })).toHaveLength(2);
  });

  it('calls onApply with the suggestion when Apply is clicked', () => {
    const onApply = vi.fn();
    renderPanel({ onApply });
    fireEvent.click(screen.getAllByRole('button', { name: /^Apply$/ })[0]);
    expect(onApply).toHaveBeenCalledOnce();
    expect(onApply.mock.calls[0][0]).toMatchObject({ section: 'tenant', field: 'fullName' });
  });

  it('shows "✓ Applied" after applying a suggestion', () => {
    renderPanel();
    fireEvent.click(screen.getAllByRole('button', { name: /^Apply$/ })[0]);
    expect(screen.getByText(/✓ Applied/)).toBeDefined();
  });

  it('hides the Apply/Dismiss pair after applying a row', () => {
    renderPanel();
    fireEvent.click(screen.getAllByRole('button', { name: /^Apply$/ })[0]);
    // Only 1 Apply button remains (the other row)
    expect(screen.getAllByRole('button', { name: /^Apply$/ })).toHaveLength(1);
  });

  it('decrements the remaining count after applying', () => {
    renderPanel();
    fireEvent.click(screen.getAllByRole('button', { name: /^Apply$/ })[0]);
    expect(screen.getByText(/1 of 2 suggestions/i)).toBeDefined();
  });
});

// ── Apply All ─────────────────────────────────────────────────────────────────

describe('FileExtractionPanel — Apply All', () => {
  it('renders an "Apply all" button in the footer', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /Apply all/i })).toBeDefined();
  });

  it('"Apply all" button is not disabled when there are remaining suggestions', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /Apply all/i }).disabled).toBe(false);
  });

  it('calls onApplyAll with all remaining suggestions', () => {
    const onApplyAll = vi.fn();
    renderPanel({ onApplyAll });
    fireEvent.click(screen.getByRole('button', { name: /Apply all/i }));
    expect(onApplyAll).toHaveBeenCalledOnce();
    expect(onApplyAll.mock.calls[0][0]).toHaveLength(2);
  });

  it('"Apply all" button is disabled when all are already applied', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /Apply all/i }));
    expect(screen.getByRole('button', { name: /Apply all/i }).disabled).toBe(true);
  });
});

// ── Dismiss ───────────────────────────────────────────────────────────────────

describe('FileExtractionPanel — Dismiss', () => {
  it('renders Dismiss buttons for each suggestion', () => {
    renderPanel();
    expect(screen.getAllByRole('button', { name: /^Dismiss$/ })).toHaveLength(2);
  });

  it('calls onDismiss when Dismiss is clicked', () => {
    const onDismiss = vi.fn();
    renderPanel({ onDismiss });
    fireEvent.click(screen.getAllByRole('button', { name: /^Dismiss$/ })[0]);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('removes the row from the list after dismissal', () => {
    renderPanel();
    fireEvent.click(screen.getAllByRole('button', { name: /^Dismiss$/ })[0]);
    expect(screen.queryByText('tenant.fullName')).toBeNull();
    expect(screen.getByText('tenant.emiratesId')).toBeDefined();
  });

  it('returns null when all suggestions are dismissed', () => {
    const { container } = renderPanel({ suggestions: [S1] });
    fireEvent.click(screen.getByRole('button', { name: /^Dismiss$/ }));
    expect(container.firstChild).toBeNull();
  });
});

// ── Dismiss All ───────────────────────────────────────────────────────────────

describe('FileExtractionPanel — Dismiss All', () => {
  it('renders a "Dismiss all" button', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /Dismiss all/i })).toBeDefined();
  });

  it('calls onDismissAll when clicked', () => {
    const onDismissAll = vi.fn();
    renderPanel({ onDismissAll });
    fireEvent.click(screen.getByRole('button', { name: /Dismiss all/i }));
    expect(onDismissAll).toHaveBeenCalledOnce();
  });
});

// ── null guard ────────────────────────────────────────────────────────────────

describe('FileExtractionPanel — empty', () => {
  it('returns null when suggestions array is empty', () => {
    const { container } = renderPanel({ suggestions: [] });
    expect(container.firstChild).toBeNull();
  });
});
