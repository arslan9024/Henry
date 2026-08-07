import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
});
