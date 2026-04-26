import React from 'react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import FooterActionBar from './FooterActionBar';

vi.mock('./PrintButton', () => ({
  default: () => (
    <button type="button" className="footer-print-btn">
      Mock Print
    </button>
  ),
}));

const baseProps = () => ({
  activeTemplateLabel: 'Property Viewing Agreement (DLD/RERA P210)',
  previewMode: false,
  canGeneratePdf: true,
  onTogglePreview: vi.fn(),
  onOpenCompliance: vi.fn(),
  onRunComplianceCheck: vi.fn(),
  onOpenArchive: vi.fn(),
  onOpenAudit: vi.fn(),
  badgeTone: 'important',
  badgeLabel: '2 to review',
  badgeTitle: '0 critical, 2 important — click for details.',
});

const FOOTER_KEY = 'henry.ui.footerBar';

afterEach(() => {
  cleanup();
  localStorage.removeItem(FOOTER_KEY);
});

describe('FooterActionBar', () => {
  beforeEach(() => {
    localStorage.removeItem(FOOTER_KEY);
  });

  it('renders expanded by default with controls and print action', () => {
    render(<FooterActionBar {...baseProps()} />);

    expect(screen.getByText('Action Center')).toBeInTheDocument();
    expect(screen.getByText(/property viewing agreement/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open archive history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open audit log/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mock print/i })).toBeInTheDocument();

    const collapse = screen.getByRole('button', { name: /collapse/i });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
  });

  it('reads collapsed state from localStorage and hides controls', () => {
    localStorage.setItem(FOOTER_KEY, 'collapsed');

    render(<FooterActionBar {...baseProps()} />);

    expect(screen.getByRole('button', { name: /expand/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /mock print/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open archive history/i })).not.toBeInTheDocument();
  });

  it('toggles collapsed/expanded and persists state', () => {
    render(<FooterActionBar {...baseProps()} />);

    const toggle = screen.getByRole('button', { name: /collapse/i });

    fireEvent.click(toggle);
    expect(localStorage.getItem(FOOTER_KEY)).toBe('collapsed');
    expect(screen.getByRole('button', { name: /expand/i })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: /expand/i }));
    expect(localStorage.getItem(FOOTER_KEY)).toBe('expanded');
    expect(screen.getByRole('button', { name: /collapse/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('dispatches all action handlers via buttons', () => {
    const props = baseProps();
    render(<FooterActionBar {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /toggle print preview/i }));
    fireEvent.click(screen.getByRole('button', { name: /compliance status:/i }));
    fireEvent.click(screen.getByRole('button', { name: /compliance check/i }));
    fireEvent.click(screen.getByRole('button', { name: /open archive history/i }));
    fireEvent.click(screen.getByRole('button', { name: /open audit log/i }));

    expect(props.onTogglePreview).toHaveBeenCalledTimes(1);
    expect(props.onOpenCompliance).toHaveBeenCalledTimes(1);
    expect(props.onRunComplianceCheck).toHaveBeenCalledTimes(1);
    expect(props.onOpenArchive).toHaveBeenCalledTimes(1);
    expect(props.onOpenAudit).toHaveBeenCalledTimes(1);
  });

  it('disables preview toggle when template has no pdf and not in preview mode', () => {
    render(<FooterActionBar {...baseProps()} previewMode={false} canGeneratePdf={false} />);

    expect(screen.getByRole('button', { name: /toggle print preview/i })).toBeDisabled();
  });

  it('keeps preview toggle enabled while preview mode is active', () => {
    render(<FooterActionBar {...baseProps()} previewMode={true} canGeneratePdf={false} />);

    expect(screen.getByRole('button', { name: /edit form/i })).toBeEnabled();
  });
});
