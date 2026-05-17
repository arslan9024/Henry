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
  canGeneratePdf: true,
  onOpenPreviewModal: vi.fn(),
  onOpenCompliance: vi.fn(),
  onRunComplianceCheck: vi.fn(),
  onOpenArchive: vi.fn(),
  onOpenAudit: vi.fn(),
  badgeTone: 'important',
  badgeLabel: '2 to review',
  badgeTitle: '0 critical, 2 important — click for details.',
});

afterEach(() => {
  cleanup();
});

describe('FooterActionBar', () => {
  beforeEach(() => {
    // nothing to set up — no collapse state
  });

  it('renders all controls visible by default', () => {
    render(<FooterActionBar {...baseProps()} />);

    expect(screen.getByText(/property viewing agreement/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open archive history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open audit log/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mock print/i })).toBeInTheDocument();
  });

  it('renders the compliance badge with correct tone', () => {
    render(<FooterActionBar {...baseProps()} />);

    const badge = screen.getByRole('button', { name: /compliance:/i });
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('compliance-badge--important');
  });

  it('dispatches all action handlers via buttons', () => {
    const props = baseProps();
    render(<FooterActionBar {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /open pdf preview/i }));
    fireEvent.click(screen.getByRole('button', { name: /compliance:/i }));
    fireEvent.click(screen.getByRole('button', { name: /check/i }));
    fireEvent.click(screen.getByRole('button', { name: /open archive history/i }));
    fireEvent.click(screen.getByRole('button', { name: /open audit log/i }));

    expect(props.onOpenPreviewModal).toHaveBeenCalledTimes(1);
    expect(props.onOpenCompliance).toHaveBeenCalledTimes(1);
    expect(props.onRunComplianceCheck).toHaveBeenCalledTimes(1);
    expect(props.onOpenArchive).toHaveBeenCalledTimes(1);
    expect(props.onOpenAudit).toHaveBeenCalledTimes(1);
  });

  it('disables preview button when template has no pdf', () => {
    render(<FooterActionBar {...baseProps()} canGeneratePdf={false} />);

    expect(screen.getByRole('button', { name: /open pdf preview/i })).toBeDisabled();
  });

  it('enables preview button when template can generate pdf', () => {
    render(<FooterActionBar {...baseProps()} canGeneratePdf={true} />);

    expect(screen.getByRole('button', { name: /open pdf preview/i })).toBeEnabled();
  });
});
