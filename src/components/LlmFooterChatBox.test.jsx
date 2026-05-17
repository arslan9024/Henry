/**
 * LlmFooterChatBox.test.jsx
 * Tests for the AI chat component that integrates with local Ollama LLM.
 * All LLM service calls and file extraction are mocked.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import documentReducer from '../store/documentSlice';
import auditReducer from '../store/auditSlice';
import templateReducer from '../store/templateSlice';
import sidebarReducer from '../store/sidebarSlice';

// ── mocks — must be declared before any imports of the mocked modules ─────────

vi.mock('../services/llmService', () => ({
  DEFAULT_MODEL: 'llama3.2',
  checkOllamaAvailability: vi.fn(),
  checkOllamaModelAvailable: vi.fn(),
  fetchOllamaSuggestion: vi.fn(),
  fetchOllamaExtraction: vi.fn(),
}));

vi.mock('../services/fileExtractionService', () => ({
  extractTextFromFile: vi.fn(),
  SUPPORTED_FILE_ACCEPT: '.pdf,.png,.jpg,.jpeg',
}));

vi.mock('./FileExtractionPanel', () => ({
  default: ({ fileName }) => <div data-testid="mock-extraction-panel">{fileName}</div>,
}));

// ── import mocked services AFTER vi.mock declarations ─────────────────────────

import * as llmService from '../services/llmService';
import LlmFooterChatBox from './LlmFooterChatBox';

// ── store factory ────────────────────────────────────────────────────────────

const makeStore = () =>
  configureStore({
    reducer: {
      document: documentReducer,
      audit: auditReducer,
      template: templateReducer,
      sidebar: sidebarReducer,
    },
  });

// ── helper ───────────────────────────────────────────────────────────────────

const renderChat = (props = {}) => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <LlmFooterChatBox {...props} />
    </Provider>,
  );
};

// ── tests ────────────────────────────────────────────────────────────────────

describe('LlmFooterChatBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Ollama is offline
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(false);
    vi.mocked(llmService.checkOllamaModelAvailable).mockResolvedValue(false);
    vi.mocked(llmService.fetchOllamaSuggestion).mockResolvedValue({ ok: false, reason: 'Offline' });
    vi.mocked(llmService.fetchOllamaExtraction).mockResolvedValue({ ok: false, reason: 'Offline' });
  });

  it('renders the section with aria-label "Henry AI assistant chat"', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Henry AI assistant chat/i })).toBeDefined();
    });
  });

  it('shows "Ask Henry" heading in the header', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText('Ask Henry')).toBeDefined();
    });
  });

  it('shows "Ollama not running" status when not available', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText(/Ollama not running/i)).toBeDefined();
    });
  });

  it('shows "Activate Ollama" button when LLM is not available', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Activate Ollama/i }).length).toBeGreaterThan(0);
    });
  });

  it('renders the chat input with aria-label "Chat input"', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Chat input/i })).toBeDefined();
    });
  });

  it('input placeholder reflects offline state', async () => {
    renderChat();
    await waitFor(() => {
      const input = screen.getByRole('textbox', { name: /Chat input/i });
      expect(input.placeholder).toBe('Start Ollama to enable chat…');
    });
  });

  it('renders the Send button', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send/i })).toBeDefined();
    });
  });

  it('Send button is disabled when input is empty', async () => {
    renderChat();
    await waitFor(() => {
      const sendBtn = screen.getByRole('button', { name: /send/i });
      expect(sendBtn.disabled).toBe(true);
    });
  });

  it('renders the attach button with aria-label "Attach file"', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Attach file/i })).toBeDefined();
    });
  });

  it('renders the empty-state hint when no messages', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText(/Set tenant full name/i)).toBeDefined();
    });
  });

  it('typing into input enables Send button', async () => {
    renderChat();
    await waitFor(() => screen.getByRole('textbox', { name: /Chat input/i }));

    const input = screen.getByRole('textbox', { name: /Chat input/i });
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(screen.getByRole('button', { name: /send/i }).disabled).toBe(false);
  });

  it('submitting when Ollama offline shows offline warning message', async () => {
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(false);

    renderChat();
    await waitFor(() => screen.getByRole('textbox', { name: /Chat input/i }));

    const input = screen.getByRole('textbox', { name: /Chat input/i });
    fireEvent.change(input, { target: { value: 'Update tenant name' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
    });

    // User message appears immediately (before async activateOllama completes)
    await waitFor(() => {
      expect(screen.getByText('Update tenant name')).toBeDefined();
    });

    // activateOllama has 4 retries × 600ms = ~2.4s; give it enough time
    await waitFor(
      () => {
        expect(screen.getByText(/Ollama is offline/i)).toBeDefined();
      },
      { timeout: 6000 },
    );

    expect(llmService.fetchOllamaSuggestion).not.toHaveBeenCalled();
  }, 10000);

  it('activationKey triggers Ollama activation flow', async () => {
    const view = renderChat();
    await waitFor(() => screen.getByRole('region', { name: /Henry AI assistant chat/i }));

    vi.clearAllMocks();
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(false);

    view.rerender(
      <Provider store={makeStore()}>
        <LlmFooterChatBox activationKey={1} />
      </Provider>,
    );

    await waitFor(() => {
      expect(llmService.checkOllamaAvailability).toHaveBeenCalled();
    });
  });

  it('shows "Checking Ollama…" status before availability resolves', () => {
    vi.mocked(llmService.checkOllamaAvailability).mockReturnValue(new Promise(() => {}));

    renderChat();

    expect(screen.getByText(/Checking Ollama…/i)).toBeDefined();
  });

  it('shows "Local Ollama ready" when both available and model ready', async () => {
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(true);
    vi.mocked(llmService.checkOllamaModelAvailable).mockResolvedValue(true);

    renderChat();

    await waitFor(() => {
      expect(screen.getByText(/Local Ollama ready/i)).toBeDefined();
    });
  });

  it('does not show Activate Ollama button when model is ready', async () => {
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(true);
    vi.mocked(llmService.checkOllamaModelAvailable).mockResolvedValue(true);

    renderChat();

    await waitFor(() => {
      expect(screen.getByText(/Local Ollama ready/i)).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: /Activate Ollama/i })).toBeNull();
  });

  it('shows model missing message when available but model absent', async () => {
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(true);
    vi.mocked(llmService.checkOllamaModelAvailable).mockResolvedValue(false);

    renderChat();

    await waitFor(() => {
      expect(screen.getByText(/Model missing/i)).toBeDefined();
    });
  });

  it('input placeholder is generic when Ollama and model are ready', async () => {
    vi.mocked(llmService.checkOllamaAvailability).mockResolvedValue(true);
    vi.mocked(llmService.checkOllamaModelAvailable).mockResolvedValue(true);

    renderChat();

    await waitFor(() => {
      const input = screen.getByRole('textbox', { name: /Chat input/i });
      expect(input.placeholder).toBe('Ask Henry to update a field…');
    });
  });
});
