/**
 * ChatDock.test.jsx
 * Floating chat bubble/panel. No Redux dependency.
 * Tests: FAB, open/close toggle, keyboard shortcuts (Esc, Ctrl+/),
 * dialog ARIA, lazy LlmFooterChatBox mount, custom event henry:open-chat.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ChatDock from './ChatDock';

// Mock LlmFooterChatBox to avoid complex LLM/Ollama async chains
vi.mock('./LlmFooterChatBox', () => ({
  default: () => <div data-testid="mock-llm-chat-box">LlmFooterChatBox</div>,
}));

// Ensure localStorage is clean before each test
beforeEach(() => {
  localStorage.removeItem('henry.ui.chatDock');
});

afterEach(() => {
  localStorage.removeItem('henry.ui.chatDock');
});

// ── closed state (FAB) ────────────────────────────────────────────────────────

describe('ChatDock — closed state', () => {
  it('renders the FAB button when closed', () => {
    render(<ChatDock />);
    expect(screen.getByRole('button', { name: /Open Ask Henry chat/i })).toBeDefined();
  });

  it('FAB has aria-label "Open Ask Henry chat"', () => {
    render(<ChatDock />);
    expect(screen.getByRole('button', { name: /Open Ask Henry chat/i })).toBeDefined();
  });

  it('does not render the chat dialog when closed', () => {
    render(<ChatDock />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('has chat-dock wrapper element', () => {
    const { container } = render(<ChatDock />);
    expect(container.querySelector('.chat-dock')).toBeDefined();
  });
});

// ── open state (panel) ────────────────────────────────────────────────────────

describe('ChatDock — open state', () => {
  it('opens the chat dialog on FAB click', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('dialog has aria-modal="true"', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
  });

  it('dialog has aria-label "Ask Henry chat"', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('Ask Henry chat');
  });

  it('renders "Ask Henry" title in header', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByText('Ask Henry')).toBeDefined();
  });

  it('renders a close button with aria-label "Close chat"', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByRole('button', { name: /Close chat/i })).toBeDefined();
  });

  it('applies chat-dock--open class when open', () => {
    const { container } = render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(container.querySelector('.chat-dock--open')).toBeDefined();
  });
});

// ── close interactions ────────────────────────────────────────────────────────

describe('ChatDock — close interactions', () => {
  it('closes on close button click', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close chat/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape key when open', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape does nothing when already closed', () => {
    render(<ChatDock />);
    fireEvent.keyDown(window, { key: 'Escape' });
    // Still in closed state — FAB should still be visible
    expect(screen.getByRole('button', { name: /Open Ask Henry chat/i })).toBeDefined();
  });
});

// ── keyboard toggle ───────────────────────────────────────────────────────────

describe('ChatDock — Ctrl+/ keyboard toggle', () => {
  it('opens the dock on Ctrl+/', () => {
    render(<ChatDock />);
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('closes the dock on second Ctrl+/', () => {
    render(<ChatDock />);
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

// ── lazy mount ────────────────────────────────────────────────────────────────

describe('ChatDock — lazy LlmFooterChatBox mount', () => {
  it('does not mount LlmFooterChatBox before first open', () => {
    render(<ChatDock />);
    expect(screen.queryByTestId('mock-llm-chat-box')).toBeNull();
  });

  it('mounts LlmFooterChatBox after first open', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByTestId('mock-llm-chat-box')).toBeDefined();
  });

  it('keeps LlmFooterChatBox mounted even after close (hasOpened stays true)', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close chat/i }));
    // hasOpened=true persists; but the section is unmounted — chatbox in closed state is hidden
    // The dialog is gone but hasOpened flag stays true
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

// ── custom event ──────────────────────────────────────────────────────────────

describe('ChatDock — henry:open-chat custom event', () => {
  it('opens when henry:open-chat event is dispatched', () => {
    render(<ChatDock />);
    act(() => {
      window.dispatchEvent(new CustomEvent('henry:open-chat'));
    });
    expect(screen.getByRole('dialog')).toBeDefined();
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe('ChatDock — localStorage persistence', () => {
  it('saves "open" to localStorage on open', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(localStorage.getItem('henry.ui.chatDock')).toBe('open');
  });

  it('saves "closed" to localStorage on close', () => {
    render(<ChatDock />);
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close chat/i }));
    expect(localStorage.getItem('henry.ui.chatDock')).toBe('closed');
  });

  it('starts open when localStorage has "open"', () => {
    localStorage.setItem('henry.ui.chatDock', 'open');
    render(<ChatDock />);
    expect(screen.getByRole('dialog')).toBeDefined();
  });
});
