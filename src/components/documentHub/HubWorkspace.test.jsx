import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import HubWorkspace from './HubWorkspace';

const makeProps = (overrides = {}) => ({
  activeTemplateLabel: 'Tenancy Contract',
  canGeneratePdf: true,
  badgeLabel: 'Compliant',
  badgeTone: 'success',
  badgeTitle: 'Compliance status',
  policyVersion: 'v1.0.0',
  ActiveTemplateComponent: () => <div data-testid="active-template-stub">Template</div>,
  railCollapsed: false,
  leftRailSlot: <aside data-testid="left-rail-slot">Left rail</aside>,
  rightPanelSlot: <aside data-testid="right-panel-slot">Right panel</aside>,
  onOpenCompliance: vi.fn(),
  ...overrides,
});

describe('HubWorkspace', () => {
  it('renders workflow semantic classes on header and three-rail workspace containers', () => {
    render(<HubWorkspace {...makeProps()} />);

    const header = screen.getByText(/henry command center/i).closest('section');
    expect(header).toHaveClass('hub-overview');
    expect(header).toHaveClass('workflow-page__header');

    const content = screen.getByText(/live execution workspace/i).closest('section')?.parentElement;
    expect(content).not.toBeNull();
    expect(content).toHaveClass('hub-content');
    expect(content).toHaveClass('workflow-page__grid');
    expect(content).toHaveClass('workflow-page__grid--three-rail');
  });

  it('renders left rail, preview main area, and right panel slots', () => {
    render(<HubWorkspace {...makeProps()} />);

    expect(screen.getByTestId('left-rail-slot')).toBeInTheDocument();
    expect(screen.getByTestId('right-panel-slot')).toBeInTheDocument();

    const previewMain = screen.getByText(/live execution workspace/i).closest('section');
    expect(previewMain).toHaveClass('preview-area');
    expect(previewMain).toHaveClass('workflow-page__main');
  });

  it('calls compliance handler when compliance badge button is clicked', () => {
    const onOpenCompliance = vi.fn();
    render(<HubWorkspace {...makeProps({ onOpenCompliance })} />);

    fireEvent.click(screen.getByRole('button', { name: /compliant/i }));
    expect(onOpenCompliance).toHaveBeenCalledTimes(1);
  });

  it('applies collapsed rail modifier class when railCollapsed is true', () => {
    render(<HubWorkspace {...makeProps({ railCollapsed: true })} />);

    const content = screen.getByText(/live execution workspace/i).closest('section')?.parentElement;
    expect(content).toHaveClass('hub-content--rail-collapsed');
  });
});
