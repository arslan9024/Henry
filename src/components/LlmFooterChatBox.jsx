import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentValue } from '../store/documentSlice';
import { addAuditLog } from '../store/auditSlice';
import { pushToast } from '../store/uiSlice';
import { selectDocument } from '../store/selectors';
import {
  DEFAULT_MODEL,
  checkOllamaAvailability,
  checkOllamaModelAvailable,
  fetchOllamaSuggestion,
  fetchOllamaExtraction,
} from '../services/llmService';
import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from '../services/fileExtractionService';
import FileExtractionPanel from './FileExtractionPanel';
import Spinner from './ui/Spinner';
import { useActiveTemplate } from '../hooks/useActiveTemplate';
import { STORAGE_KEY_CHAT_HISTORY } from '../constants/storageKeys';

const MAX_CHAT_HISTORY = 50;

const loadChatHistory = () => {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY_CHAT_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_CHAT_HISTORY) : [];
  } catch {
    return [];
  }
};

const saveChatHistory = (messages) => {
  try {
    const toSave = messages.slice(-MAX_CHAT_HISTORY);
    window.localStorage?.setItem(STORAGE_KEY_CHAT_HISTORY, JSON.stringify(toSave));
  } catch {
    /* quota exceeded — silently skip */
  }
};

const LlmFooterChatBox = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(selectDocument);
  const { activeTemplate } = useActiveTemplate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => loadChatHistory());
  const [pendingSuggestion, setPendingSuggestion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [modelReady, setModelReady] = useState(null);
  const [isActivating, setIsActivating] = useState(false);
  const [extraction, setExtraction] = useState(null); // { fileName, suggestions[] }
  const [extractionStatus, setExtractionStatus] = useState('idle'); // idle|reading|querying|error
  const fileInputRef = useRef(null);
  const listRef = useRef(null);

  // Persist messages to localStorage whenever they change.
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const appendMessage = useCallback(
    (msg) => setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, ...msg }]),
    [],
  );

  const activateOllama = useCallback(
    async ({ silent = false } = {}) => {
      setIsActivating(true);
      if (!silent) {
        appendMessage({ role: 'assistant', text: '🔌 Activating local Ollama… checking connection.' });
      }

      // Retry a few times so opening chat right after launching ollama serve still works.
      let serverOk = false;
      let modelOk = false;
      for (let i = 0; i < 4; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        serverOk = await checkOllamaAvailability(2500);
        if (serverOk) {
          // eslint-disable-next-line no-await-in-loop
          modelOk = await checkOllamaModelAvailable(DEFAULT_MODEL, 2500);
          if (modelOk) break;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setAvailable(serverOk);
      setModelReady(modelOk);
      setIsActivating(false);

      if (!silent) {
        appendMessage({
          role: 'assistant',
          text:
            serverOk && modelOk
              ? '✅ Ollama is active. You can now update document fields via chat.'
              : serverOk
                ? `⚠️ Ollama server is running, but model \`${DEFAULT_MODEL}\` is missing. Run \`ollama pull ${DEFAULT_MODEL}\`.`
                : '⚠️ Ollama is not reachable. Start it with `ollama serve` and open chat again.',
        });
      }

      return serverOk && modelOk;
    },
    [appendMessage],
  );

  useEffect(() => {
    let cancelled = false;
    // Check Ollama availability on mount and activate silently if available.
    checkOllamaAvailability().then(async (ok) => {
      if (!cancelled) setAvailable(ok);
      if (!cancelled && ok) {
        const modelOk = await checkOllamaModelAvailable(DEFAULT_MODEL, 2500);
        setModelReady(modelOk);
      } else if (!cancelled && !ok) {
        // Auto-activate (silent) when the chat panel first mounts so users
        // don't need to click "Activate Ollama" manually.
        activateOllama({ silent: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activateOllama]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, pendingSuggestion, extraction]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    appendMessage({ role: 'user', text: trimmed });
    setInput('');
    setPendingSuggestion(null);
    setIsThinking(true);

    let ready = available;
    if (!ready) {
      ready = await activateOllama({ silent: true });
    }

    if (!ready) {
      appendMessage({
        role: 'assistant',
        text: `⚠️ Ollama is offline. Run \`ollama serve\` (and \`ollama pull ${DEFAULT_MODEL}\` once) to enable chat updates.`,
      });
      setIsThinking(false);
      return;
    }

    // Add a placeholder "thinking" message that will be replaced as tokens arrive.
    const streamingMsgId = `${Date.now()}-stream`;
    setMessages((prev) => [...prev, { id: streamingMsgId, role: 'assistant', text: '…' }]);

    const result = await fetchOllamaSuggestion({
      userPrompt: trimmed,
      documentData,
      templateKey: activeTemplate,
      onToken: (token) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsgId ? { ...m, text: (m.text === '…' ? '' : m.text) + token } : m,
          ),
        );
      },
    });

    if (!result.ok) {
      // Remove the streaming placeholder and show the error instead.
      setMessages((prev) => prev.filter((m) => m.id !== streamingMsgId));
      appendMessage({ role: 'assistant', text: `⚠️ ${result.reason}` });
    } else {
      const { section, field, value, rationale } = result.suggestion;
      setPendingSuggestion(result.suggestion);
      // Replace the streaming placeholder with the structured suggestion message.
      const suggestionText = `Suggestion: update ${section}.${field} → ${JSON.stringify(value)}${rationale ? ` — ${rationale}` : ''}`;
      setMessages((prev) => prev.map((m) => (m.id === streamingMsgId ? { ...m, text: suggestionText } : m)));
    }

    setIsThinking(false);
  };

  const handleApply = () => {
    if (!pendingSuggestion) return;
    const { section, field, value } = pendingSuggestion;
    dispatch(setDocumentValue({ section, field, value }));
    dispatch(
      addAuditLog({
        type: 'LLM_FIELD_APPLIED',
        section,
        field,
        timestamp: new Date().toISOString(),
      }),
    );
    appendMessage({ role: 'assistant', text: `✅ Applied ${section}.${field}.` });
    setPendingSuggestion(null);
  };

  const handleDismiss = () => {
    appendMessage({ role: 'assistant', text: 'Dismissed.' });
    setPendingSuggestion(null);
  };

  const handleAttachClick = () => {
    if (extractionStatus === 'reading' || extractionStatus === 'querying') return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    // Reset native input so the same file can be selected again later.
    if (event.target) event.target.value = '';
    if (!file) return;

    setExtraction(null);
    setExtractionStatus('reading');
    appendMessage({ role: 'user', text: `📎 Attached "${file.name}"` });
    appendMessage({ role: 'assistant', text: `Reading ${file.name}…` });

    const extracted = await extractTextFromFile(file);
    if (!extracted.ok) {
      setExtractionStatus('error');
      appendMessage({ role: 'assistant', text: `⚠️ ${extracted.reason}` });
      return;
    }

    const sizeNote =
      extracted.kind === 'pdf'
        ? `${extracted.pageCount} page${extracted.pageCount === 1 ? '' : 's'}${extracted.pagesTruncated ? ` (truncated from ${extracted.totalPages})` : ''}`
        : 'image';
    appendMessage({
      role: 'assistant',
      text: `Extracted ${extracted.text.length.toLocaleString()} characters from ${sizeNote}. Asking Henry to identify fields…`,
    });

    setExtractionStatus('querying');
    const result = await fetchOllamaExtraction({
      extractedText: extracted.text,
      fileName: file.name,
      fileKind: extracted.kind,
      documentData,
    });

    if (!result.ok) {
      setExtractionStatus('error');
      appendMessage({ role: 'assistant', text: `⚠️ ${result.reason}` });
      return;
    }

    setExtractionStatus('idle');
    if (!result.suggestions.length) {
      appendMessage({ role: 'assistant', text: 'No high-confidence fields were extracted from that file.' });
      dispatch(
        pushToast({
          tone: 'info',
          title: 'Extraction complete',
          body: `No high-confidence fields found in ${file.name}.`,
        }),
      );
    } else {
      setExtraction({ fileName: file.name, suggestions: result.suggestions });
      appendMessage({
        role: 'assistant',
        text: `Found ${result.suggestions.length} suggestion${result.suggestions.length === 1 ? '' : 's'}. Review below and Apply or Dismiss.`,
      });
      dispatch(
        pushToast({
          tone: 'success',
          title: `${result.suggestions.length} field${result.suggestions.length === 1 ? '' : 's'} extracted`,
          body: `Open Ask Henry to review suggestions from ${file.name}.`,
          durationMs: 7000,
        }),
      );
    }

    dispatch(
      addAuditLog({
        type: 'CHAT_FILE_UPLOADED',
        fileName: file.name,
        fileKind: extracted.kind,
        pageCount: extracted.pageCount ?? null,
        suggestionCount: result.suggestions.length,
        droppedCount: result.droppedCount ?? 0,
        timestamp: new Date().toISOString(),
      }),
    );
  };

  const applySingleSuggestion = (suggestion, { skipMessage = false } = {}) => {
    const { section, field, value, confidence } = suggestion;
    dispatch(setDocumentValue({ section, field, value }));
    dispatch(
      addAuditLog({
        type: 'LLM_FILE_FIELD_APPLIED',
        section,
        field,
        fileName: extraction?.fileName,
        confidence,
        timestamp: new Date().toISOString(),
      }),
    );
    if (!skipMessage) {
      appendMessage({ role: 'assistant', text: `✅ Applied ${section}.${field}.` });
    }
  };

  const handleExtractionApply = (suggestion) => applySingleSuggestion(suggestion);

  const handleExtractionApplyAll = (toApply) => {
    if (!toApply.length) return;
    toApply.forEach((s) => applySingleSuggestion(s, { skipMessage: true }));
    dispatch(
      addAuditLog({
        type: 'LLM_FILE_BULK_APPLIED',
        fileName: extraction?.fileName,
        appliedCount: toApply.length,
        fields: toApply.map((s) => `${s.section}.${s.field}`),
        timestamp: new Date().toISOString(),
      }),
    );
    appendMessage({
      role: 'assistant',
      text: `✅ Applied ${toApply.length} field${toApply.length === 1 ? '' : 's'} from ${extraction?.fileName}.`,
    });
  };

  const handleExtractionDismiss = (key) => {
    // key format is `${section}.${field}.${index}` — remove by exact index match.
    setExtraction((prev) => {
      if (!prev) return prev;
      const parts = key.split('.');
      const section = parts[0];
      const field = parts[1];
      const idx = parseInt(parts[2], 10);
      const next = prev.suggestions.filter(
        (s, i) => !(s.section === section && s.field === field && i === idx),
      );
      if (next.length === prev.suggestions.length) return prev; // nothing matched, no change
      return next.length === 0 ? null : { ...prev, suggestions: next };
    });
  };

  const handleExtractionDismissAll = () => {
    setExtraction(null);
    appendMessage({ role: 'assistant', text: 'Dismissed all suggestions.' });
  };

  const isBusy = isThinking || extractionStatus === 'reading' || extractionStatus === 'querying';

  const statusBadge = (() => {
    if (isActivating) return <span className="llm-chat__status">Activating Ollama…</span>;
    if (available === null) return <span className="llm-chat__status">Checking Ollama…</span>;
    if (available && modelReady) {
      return <span className="llm-chat__status llm-chat__status--ok">Local Ollama ready</span>;
    }
    if (available && !modelReady) {
      return (
        <span className="llm-chat__status llm-chat__status--err">Model missing (pull {DEFAULT_MODEL})</span>
      );
    }
    return <span className="llm-chat__status llm-chat__status--err">Ollama not running</span>;
  })();

  return (
    <section className="llm-chat print-hidden" aria-label="Henry AI assistant chat">
      <header className="llm-chat__header">
        <strong>Ask Henry</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {statusBadge}
          {messages.length > 0 && (
            <button
              type="button"
              className="utility-btn secondary"
              onClick={() => {
                setMessages([]);
                saveChatHistory([]);
              }}
              aria-label="Clear chat history"
              title="Clear chat history"
            >
              Clear history
            </button>
          )}
          {!available || !modelReady ? (
            <button
              type="button"
              className="utility-btn secondary"
              onClick={() => activateOllama({ silent: false })}
              disabled={isActivating}
              aria-label="Activate Ollama"
              title="Activate Ollama"
            >
              {isActivating ? 'Activating…' : 'Activate Ollama'}
            </button>
          ) : null}
        </div>
      </header>

      <div className="llm-chat__messages" ref={listRef} aria-live="polite">
        {messages.length === 0 ? (
          <p className="llm-chat__hint">
            Try: <em>“Set tenant full name to Ahmed bin Mohammed”</em>, or attach a file with the 📎 button to
            extract fields automatically.
          </p>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id} className={`llm-chat__msg llm-chat__msg--${msg.role}`}>
            {msg.text}
          </div>
        ))}

        {isThinking ? (
          <div className="llm-chat__msg llm-chat__msg--assistant llm-chat__msg--thinking">
            <Spinner size="sm" label="Henry is thinking…" />
            <span aria-hidden="true">Thinking…</span>
          </div>
        ) : null}
        {extractionStatus === 'reading' ? (
          <div className="llm-chat__msg llm-chat__msg--assistant llm-chat__msg--thinking">
            <Spinner size="sm" label="Reading file…" />
            <span aria-hidden="true">Reading file…</span>
          </div>
        ) : null}
        {extractionStatus === 'querying' ? (
          <div className="llm-chat__msg llm-chat__msg--assistant llm-chat__msg--thinking">
            <Spinner size="sm" label="Asking Henry…" />
            <span aria-hidden="true">Asking Henry…</span>
          </div>
        ) : null}

        {extraction ? (
          <FileExtractionPanel
            fileName={extraction.fileName}
            suggestions={extraction.suggestions}
            onApply={handleExtractionApply}
            onApplyAll={handleExtractionApplyAll}
            onDismiss={handleExtractionDismiss}
            onDismissAll={handleExtractionDismissAll}
          />
        ) : null}

        {pendingSuggestion ? (
          <div className="llm-chat__suggestion">
            <button type="button" className="utility-btn" onClick={handleApply}>
              Apply
            </button>
            <button type="button" className="utility-btn secondary" onClick={handleDismiss}>
              Dismiss
            </button>
          </div>
        ) : null}
      </div>

      <form className="llm-chat__form" onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          className="llm-chat__file-input"
          accept={SUPPORTED_FILE_ACCEPT}
          onChange={handleFileChange}
          aria-hidden="true"
          tabIndex={-1}
        />
        <button
          type="button"
          className="llm-chat__attach-btn"
          onClick={handleAttachClick}
          disabled={isBusy}
          title="Attach a PDF or image — files stay local, sent only to your Ollama"
          aria-label="Attach file"
        >
          📎
        </button>
        <input
          type="text"
          className="llm-chat__input"
          placeholder={available === false ? 'Start Ollama to enable chat…' : 'Ask Henry to update a field…'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="Chat input"
        />
        <button type="submit" className="utility-btn" disabled={!input.trim() || isBusy}>
          Send
        </button>
      </form>
    </section>
  );
};

export default React.memo(LlmFooterChatBox);
