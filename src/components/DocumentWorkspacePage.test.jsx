import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { APP_PAGES } from '../store/appRouteSlice';

const mocks = vi.hoisted(() => ({
  goToPage: vi.fn(),
}));

vi.mock('../hooks/useAppNavigation', () => ({
  default: () => ({
    goToPage: mocks.goToPage,
  }),
}));

import DocumentWorkspacePage from './DocumentWorkspacePage';

describe('DocumentWorkspacePage', () => {
  const LAST_JOURNEY_STORAGE_KEY = 'henry.documentWorkspace.lastJourney.v1';

  beforeAll(() => {
    if (typeof HTMLDialogElement !== 'undefined') {
      if (!HTMLDialogElement.prototype.showModal) {
        HTMLDialogElement.prototype.showModal = function showModal() {
          this.setAttribute('open', '');
        };
      }
      if (!HTMLDialogElement.prototype.close) {
        HTMLDialogElement.prototype.close = function close() {
          this.removeAttribute('open');
        };
      }
    }
  });

  beforeEach(() => {
    mocks.goToPage.mockReset();
    window.localStorage.clear();
  });

  it('renders workflow semantic classes on the page shell and header', () => {
    render(<DocumentWorkspacePage />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('workspace-page');
    expect(main).toHaveClass('workflow-page');
    expect(main).toHaveClass('shell-page');

    const header = screen.getByText(/document operations task workspace/i).closest('section');
    expect(header).toHaveClass('workspace-page__header');
    expect(header).toHaveClass('workflow-page__header');
  });

  it('renders all journey launcher cards', () => {
    render(<DocumentWorkspacePage />);

    expect(
      screen.getByRole('heading', { name: /upload → extract → review → confirm → apply/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /open saved reference → preview → apply/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /generate\/preview package → export/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cross-document comparison/i })).toBeInTheDocument();
  });

  it('navigates to Document Hub when legacy hub action is clicked', () => {
    render(<DocumentWorkspacePage />);

    fireEvent.click(screen.getByRole('button', { name: /open legacy document hub/i }));
    expect(mocks.goToPage).toHaveBeenCalledWith(APP_PAGES.DOCUMENT_HUB);
  });

  it('opens the journey modal when a launcher is clicked', () => {
    render(<DocumentWorkspacePage />);

    const launchButtons = screen.getAllByRole('button', { name: /launch journey modal/i });
    fireEvent.click(launchButtons[0]);

    expect(
      screen.getByRole('dialog', { name: /upload → extract → review → confirm → apply/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/required preview & safety controls/i)).toBeInTheDocument();
  });

  it('restores last journey from localStorage and can re-open modal', () => {
    window.localStorage.setItem(LAST_JOURNEY_STORAGE_KEY, 'reference-preview-apply');
    render(<DocumentWorkspacePage />);

    const resumeSection = screen.getByLabelText(/resume last journey/i);
    expect(within(resumeSection).getByText(/resume:/i)).toBeInTheDocument();
    expect(within(resumeSection).getByText(/open saved reference → preview → apply/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /re-open journey/i }));
    expect(
      screen.getByRole('dialog', { name: /open saved reference → preview → apply/i }),
    ).toBeInTheDocument();
  });

  it('navigates via resume quick action and clears saved journey', () => {
    window.localStorage.setItem(LAST_JOURNEY_STORAGE_KEY, 'reference-preview-apply');
    render(<DocumentWorkspacePage />);

    fireEvent.click(screen.getByRole('button', { name: /continue in document hub/i }));
    expect(mocks.goToPage).toHaveBeenCalledWith(APP_PAGES.DOCUMENT_HUB);

    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));
    expect(window.localStorage.getItem(LAST_JOURNEY_STORAGE_KEY)).toBeNull();
    expect(screen.queryByLabelText(/resume last journey/i)).toBeNull();
  });
});
