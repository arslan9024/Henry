import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import ChatDock from './ChatDock';
import uiCommandReducer, { persistUiCommandState } from '../store/uiCommandSlice';

vi.mock('./LlmFooterChatBox', () => ({
  default: () => <div data-testid="mock-llm-chat-box">LlmFooterChatBox</div>,
}));

const buildStore = () => {
  const listenerMiddleware = createListenerMiddleware();
  listenerMiddleware.startListening({
    predicate: (action) => typeof action?.type === 'string' && action.type.startsWith('uiCommand/'),
    effect: (_, api) => {
      const { leftRail, chatOpen } = api.getState().uiCommand;
      persistUiCommandState({ leftRail, chatOpen });
    },
  });

  return configureStore({
    reducer: { uiCommand: uiCommandReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });
};

const renderChatDock = () => {
  const store = buildStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <ChatDock />
      </Provider>,
    ),
  };
};

beforeEach(() => {
  localStorage.removeItem('henry.ui.chatDock');
});

afterEach(() => {
  localStorage.removeItem('henry.ui.chatDock');
});

describe('ChatDock', () => {
  it('renders the FAB button when closed', () => {
    renderChatDock();
    expect(screen.getByRole('button', { name: /Open Ask Henry chat/i })).toBeInTheDocument();
  });

  it('opens the chat dialog on FAB click', () => {
    const { store } = renderChatDock();
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByRole('dialog', { name: /Ask Henry chat/i })).toBeInTheDocument();
    expect(store.getState().uiCommand.chatOpen).toBe(true);
  });

  it('closes on close button click', () => {
    renderChatDock();
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close chat/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape key when open', () => {
    renderChatDock();
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('toggles the dock on Ctrl+/', () => {
    renderChatDock();
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('mounts the LLM chat shell after the first open', () => {
    renderChatDock();
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(screen.getByTestId('mock-llm-chat-box')).toBeInTheDocument();
  });

  it('persists open state to localStorage', () => {
    renderChatDock();
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    expect(localStorage.getItem('henry.ui.chatDock')).toBe('open');
  });

  it('persists closed state to localStorage', () => {
    renderChatDock();
    fireEvent.click(screen.getByRole('button', { name: /Open Ask Henry chat/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close chat/i }));
    expect(localStorage.getItem('henry.ui.chatDock')).toBe('closed');
  });

  it('starts open when localStorage has open', () => {
    localStorage.setItem('henry.ui.chatDock', 'open');
    renderChatDock();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
