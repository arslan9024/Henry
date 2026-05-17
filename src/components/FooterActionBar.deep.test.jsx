/**
 * FooterActionBar.deep.test.jsx
 *
 * Exhaustive coverage of FooterActionBar — badge tone icon variants,
 * prop-driven rendering, disabled states, ARIA structure, and edge cases
 * not covered in the baseline 5-test file.
 */
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FooterActionBar from './FooterActionBar';

vi.mock('./PrintButton', () => ({
  default: () => <button type="button">Mock Print</button>,
}));

afterEach(cleanup);

const base = (overrides = {}) => ({
  activeTemplateLabel: 'Property Viewing Agreement (DLD/RERA P210)',
  canGeneratePdf: true,
  onOpenPreviewModal: vi.fn(),
  onOpenCompliance: vi.fn(),
  onRunComplianceCheck: vi.fn(),
  onOpenArchive: vi.fn(),
  onOpenAudit: vi.fn(),
  badgeTone: 'important',
  badgeLabel: '2 to review',
  badgeTitle: 'Badge tooltip text',
  ...overrides,
});

// ── Role / landmark ───────────────────────────────────────────────────────────

describe('FooterActionBar — landmark', () => {
  it('renders a <footer> with role="contentinfo"', () => {
    render(<FooterActionBar {...base()} />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('footer aria-label is "Document footer actions"', () => {
    render(<FooterActionBar {...base()} />);
    expect(screen.getByRole('contentinfo')).toHaveAttribute('aria-label', 'Document footer actions');
  });
});

// ── Compliance badge icon variants ────────────────────────────────────────────

describe('FooterActionBar — badge tone icons', () => {
  it('badgeTone="clear" renders ✓ icon', () => {
    render(<FooterActionBar {...base({ badgeTone: 'clear', badgeLabel: 'All clear' })} />);
    const btn = screen.getByRole('button', { name: /compliance/i });
    expect(btn.textContent).toContain('✓');
  });

  it('badgeTone="critical" renders ✕ icon', () => {
    render(<FooterActionBar {...base({ badgeTone: 'critical', badgeLabel: '1 critical' })} />);
    const btn = screen.getByRole('button', { name: /compliance/i });
    expect(btn.textContent).toContain('✕');
  });

  it('badgeTone="important" renders ! icon', () => {
    render(<FooterActionBar {...base({ badgeTone: 'important' })} />);
    const btn = screen.getByRole('button', { name: /compliance/i });
    expect(btn.textContent).toContain('!');
  });

  it('unknown tone also renders ! icon (fallback)', () => {
    render(<FooterActionBar {...base({ badgeTone: 'unknown' })} />);
    const btn = screen.getByRole('button', { name: /compliance/i });
    expect(btn.textContent).toContain('!');
  });
});

// ── Compliance badge CSS class ────────────────────────────────────────────────

describe('FooterActionBar — badge CSS class', () => {
  it.each(['clear', 'important', 'critical', 'info'])(
    'badgeTone="%s" produces compliance-badge--%s class',
    (tone) => {
      render(<FooterActionBar {...base({ badgeTone: tone })} />);
      const btn = screen.getByRole('button', { name: /compliance/i });
      expect(btn.className).toContain(`compliance-badge--${tone}`);
    },
  );
});

// ── Badge label & title ───────────────────────────────────────────────────────

describe('FooterActionBar — badge label and title', () => {
  it('badge label appears in button text', () => {
    render(<FooterActionBar {...base({ badgeLabel: '3 warnings' })} />);
    const btn = screen.getByRole('button', { name: /compliance/i });
    expect(btn.textContent).toContain('3 warnings');
  });

  it('badgeTitle is passed as title attribute on compliance button', () => {
    render(<FooterActionBar {...base({ badgeTitle: 'Detailed tooltip here' })} />);
    const btn = screen.getByRole('button', { name: /compliance/i });
    expect(btn).toHaveAttribute('title', 'Detailed tooltip here');
  });
});

// ── Template label ────────────────────────────────────────────────────────────

describe('FooterActionBar — template label', () => {
  it('activeTemplateLabel appears as text', () => {
    render(<FooterActionBar {...base({ activeTemplateLabel: 'Tenancy Contract (DLD Form A)' })} />);
    expect(screen.getByText(/Tenancy Contract/i)).toBeInTheDocument();
  });

  it('activeTemplateLabel is also set as title attribute on the label span', () => {
    const label = 'Offer Letter Template';
    render(<FooterActionBar {...base({ activeTemplateLabel: label })} />);
    const span = screen.getByTitle(label);
    expect(span).toBeInTheDocument();
  });
});

// ── PDF preview button states ─────────────────────────────────────────────────

describe('FooterActionBar — preview button', () => {
  it('disabled title says "not available" when canGeneratePdf=false', () => {
    render(<FooterActionBar {...base({ canGeneratePdf: false })} />);
    const btn = screen.getByRole('button', { name: /open pdf preview/i });
    expect(btn).toBeDisabled();
    expect(btn.getAttribute('title')).toMatch(/not available/i);
  });

  it('enabled title says "Open PDF preview & export" when canGeneratePdf=true', () => {
    render(<FooterActionBar {...base({ canGeneratePdf: true })} />);
    const btn = screen.getByRole('button', { name: /open pdf preview/i });
    expect(btn).toBeEnabled();
    expect(btn.getAttribute('title')).toMatch(/Open PDF preview/i);
  });
});

// ── All click handlers are separate, non-interfering ─────────────────────────

describe('FooterActionBar — handler isolation', () => {
  it('clicking archive does NOT call audit or compliance handlers', () => {
    const props = base();
    render(<FooterActionBar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /open archive history/i }));
    expect(props.onOpenArchive).toHaveBeenCalledTimes(1);
    expect(props.onOpenAudit).not.toHaveBeenCalled();
    expect(props.onOpenCompliance).not.toHaveBeenCalled();
  });

  it('clicking audit does NOT call archive or compliance handlers', () => {
    const props = base();
    render(<FooterActionBar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /open audit log/i }));
    expect(props.onOpenAudit).toHaveBeenCalledTimes(1);
    expect(props.onOpenArchive).not.toHaveBeenCalled();
    expect(props.onOpenCompliance).not.toHaveBeenCalled();
  });

  it('clicking compliance badge does NOT call check handler', () => {
    const props = base();
    render(<FooterActionBar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /compliance:/i }));
    expect(props.onOpenCompliance).toHaveBeenCalledTimes(1);
    expect(props.onRunComplianceCheck).not.toHaveBeenCalled();
  });
});

// ── PrintButton slot ──────────────────────────────────────────────────────────

describe('FooterActionBar — PrintButton slot', () => {
  it('PrintButton is rendered inside the footer', () => {
    render(<FooterActionBar {...base()} />);
    expect(screen.getByText('Mock Print')).toBeInTheDocument();
  });
});
