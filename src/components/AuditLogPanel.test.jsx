import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, within, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuditLogPanel from './AuditLogPanel';
import { renderWithStore, buildTestStore } from '../test/renderWithStore';

const entry = (overrides = {}) => ({
  type: 'PRINT',
  template: 'viewing',
  timestamp: new Date('2026-04-23T10:00:00Z').toISOString(),
  ...overrides,
});

const seed = (logs) => buildTestStore({ audit: { logs }, ui: { toasts: [] } });

// Helper: pick the toolbar counter span (`{filtered.length} / {logs.length}`)
// regardless of whitespace splits.
const getCounter = () => {
  const el = document.querySelector('.audit-panel__count');
  if (!el) throw new Error('audit-panel__count span not found');
  return el.textContent.replace(/\s+/g, ' ').trim();
};

// Helper: type chips inside the rendered list (excludes <option> elements
// which also carry the type text in the toolbar dropdown).
const rowTypes = () => Array.from(document.querySelectorAll('.audit-list__type')).map((el) => el.textContent);

describe('<AuditLogPanel />', () => {
  it('renders the empty state when there are no logs', () => {
    renderWithStore(<AuditLogPanel />);
    expect(screen.getByText(/no audit events recorded yet/i)).toBeInTheDocument();
    // Export & Clear should be disabled when there's nothing to act on.
    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  it('renders day groups with the matching count badge', () => {
    const store = seed([
      entry({ type: 'PRINT', template: 'viewing' }),
      entry({ type: 'PDF_GENERATED', fileName: 'a.pdf' }),
    ]);
    renderWithStore(<AuditLogPanel />, { store });
    expect(getCounter()).toBe('2 / 2');
    expect(rowTypes().sort()).toEqual(['PDF_GENERATED', 'PRINT']);
  });

  it('filter dropdown narrows the visible rows', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT' }), entry({ type: 'PDF_GENERATED', fileName: 'b.pdf' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const select = screen.getByLabelText(/filter/i);
    await user.selectOptions(select, 'PDF_GENERATED');

    expect(getCounter()).toBe('1 / 2');
    expect(rowTypes()).toEqual(['PDF_GENERATED']);
  });

  it('search box matches against type, summary, and payload', async () => {
    const user = userEvent.setup();
    const store = seed([
      entry({ type: 'PRINT', template: 'viewing' }),
      entry({ type: 'CHAT_FILE_UPLOADED', fileName: 'lease.pdf', suggestionCount: 3 }),
    ]);
    renderWithStore(<AuditLogPanel />, { store });

    const search = screen.getByRole('searchbox', { name: /search audit log/i });
    await user.type(search, 'lease');

    expect(getCounter()).toBe('1 / 2');
    expect(rowTypes()).toEqual(['CHAT_FILE_UPLOADED']);
  });

  it('expanding a row reveals the raw JSON', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT', template: 'viewing' })]);
    renderWithStore(<AuditLogPanel />, { store });

    // Row toggle is a <button class="audit-list__head--btn">; pick it via class.
    const rowToggle = document.querySelector('.audit-list__head--btn');
    expect(rowToggle).toBeTruthy();
    expect(rowToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(rowToggle);
    expect(rowToggle).toHaveAttribute('aria-expanded', 'true');
    const row = rowToggle.closest('li');
    expect(within(row).getByText(/"type": "PRINT"/)).toBeInTheDocument();
  });

  it('clear pushes a warning toast carrying an Undo action descriptor', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT' }), entry({ type: 'PRINT' })]);
    renderWithStore(<AuditLogPanel />, { store });

    // First click shows inline confirmation dialog.
    await user.click(screen.getByRole('button', { name: /✕ Clear/i }));
    // Second click on the "Confirm" button in the alertdialog.
    await user.click(screen.getByRole('button', { name: /^Confirm$/i }));

    // Logs are gone, but a toast with Undo action should have been pushed.
    expect(store.getState().audit.logs).toEqual([]);
    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      tone: 'warning',
      action: { label: 'Undo', type: 'audit/restoreAuditLogs' },
    });
    expect(toasts[0].action.payload).toHaveLength(2);
  });

  it('export creates a JSON blob and triggers an <a download> click + success toast', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT' })]);

    // jsdom doesn't implement URL.createObjectURL — install before spying.
    if (!URL.createObjectURL) URL.createObjectURL = () => '';
    if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    // Spy on anchor click so we don't actually navigate.
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderWithStore(<AuditLogPanel />, { store });
    await user.click(screen.getByRole('button', { name: /export/i }));

    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledWith('blob:mock');

    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].tone).toBe('success');
    expect(toasts[0].title).toMatch(/exported/i);

    createUrl.mockRestore();
    revokeUrl.mockRestore();
    clickSpy.mockRestore();
  });

  it('import (replace mode) parses the JSON file, restores entries, and offers Undo', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT', timestamp: '2026-04-22T10:00:00Z' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const importedEntries = [
      { type: 'PDF_GENERATED', fileName: 'imported.pdf', timestamp: '2026-04-23T12:00:00Z' },
      { type: 'COMPLIANCE_CHECK_RUN', template: 'viewing', timestamp: '2026-04-23T11:00:00Z' },
    ];
    // jsdom's File.text() isn't reliable across versions; build a File-like
    // that satisfies the handler's `await file.text()` + `.name` contract.
    const fakeFile = {
      name: 'audit.json',
      text: () => Promise.resolve(JSON.stringify(importedEntries)),
    };

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    // React listens via synthetic event delegation — use fireEvent.change
    // and override `target.files` with our File-like (jsdom's File.text()
    // is unreliable across versions).
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
      // Flush the async handler's awaited file.text() + dispatches.
      await Promise.resolve();
      await Promise.resolve();
    });

    // Inline confirmation dialog is now showing — click "Replace".
    await user.click(screen.getByRole('button', { name: /^Replace$/i }));

    // Replace mode → only the 2 imported entries remain.
    const finalLogs = store.getState().audit.logs;
    expect(finalLogs).toHaveLength(2);
    expect(finalLogs.map((l) => l.type).sort()).toEqual(['COMPLIANCE_CHECK_RUN', 'PDF_GENERATED']);

    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].tone).toBe('success');
    expect(toasts[0].title).toMatch(/replaced/i);
    expect(toasts[0].action).toMatchObject({ label: 'Undo', type: 'audit/restoreAuditLogs' });
    expect(toasts[0].action.payload).toHaveLength(1);
  });

  it('import error path: malformed JSON pushes an error toast and leaves logs untouched', async () => {
    const store = seed([entry({ type: 'PRINT' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const fakeFile = {
      name: 'broken.json',
      text: () => Promise.resolve('not valid json {{{'),
    };
    const fileInput = document.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(store.getState().audit.logs).toHaveLength(1);
    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].tone).toBe('error');
    expect(toasts[0].title).toMatch(/import failed/i);
  });

  it('shows "no matching entries" EmptyState when search has no results', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT', template: 'viewing' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const search = screen.getByRole('searchbox', { name: /search audit log/i });
    await user.type(search, 'xyzabcnonexistent');

    expect(screen.getByText(/no matching entries/i)).toBeInTheDocument();
  });

  it('cancelling the clear confirm dialog leaves logs intact', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT' })]);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false); // cancel
    renderWithStore(<AuditLogPanel />, { store });

    await user.click(screen.getByRole('button', { name: /clear/i }));

    // Logs should be unchanged.
    expect(store.getState().audit.logs).toHaveLength(1);
    expect(store.getState().ui.toasts).toHaveLength(0);
    confirmSpy.mockRestore();
  });

  it('export error path pushes an error toast when URL.createObjectURL throws', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT' })]);

    if (!URL.createObjectURL) URL.createObjectURL = () => '';
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('Blob URLs unsupported');
    });

    renderWithStore(<AuditLogPanel />, { store });
    await user.click(screen.getByRole('button', { name: /export/i }));

    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].tone).toBe('error');
    expect(toasts[0].title).toMatch(/export failed/i);
    createUrl.mockRestore();
  });

  it('import skips processing when no file is selected (empty files array)', async () => {
    const store = seed([entry({ type: 'PRINT' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const fileInput = document.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [] } });
      await Promise.resolve();
    });

    // Logs should remain unchanged, no toast pushed.
    expect(store.getState().audit.logs).toHaveLength(1);
    expect(store.getState().ui.toasts).toHaveLength(0);
  });

  it('import (merge mode) de-dupes and merges entries newest-first', async () => {
    const user = userEvent.setup();
    const existing = entry({ type: 'PRINT', timestamp: '2026-04-22T10:00:00Z' });
    const store = seed([existing]);
    renderWithStore(<AuditLogPanel />, { store });

    const importedEntries = [
      // Duplicate of existing — should be de-duped (same timestamp+type).
      { type: 'PRINT', timestamp: '2026-04-22T10:00:00Z' },
      // New entry.
      { type: 'PDF_GENERATED', fileName: 'merged.pdf', timestamp: '2026-04-23T09:00:00Z' },
    ];
    const fakeFile = {
      name: 'merge.json',
      text: () => Promise.resolve(JSON.stringify(importedEntries)),
    };
    const fileInput = document.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
      await Promise.resolve();
      await Promise.resolve();
    });

    // Inline confirmation dialog is now showing — click "Merge".
    await user.click(screen.getByRole('button', { name: /^Merge$/i }));

    // Only 2 unique entries (not 3).
    expect(store.getState().audit.logs).toHaveLength(2);
    const types = store.getState().audit.logs.map((l) => l.type);
    expect(types).toContain('PDF_GENERATED');
    expect(types).toContain('PRINT');

    const toasts = store.getState().ui.toasts;
    expect(toasts[0].title).toMatch(/merged/i);
  });

  it('import error path: valid JSON but non-array pushes an error toast', async () => {
    const store = seed([entry({ type: 'PRINT' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const fakeFile = {
      name: 'invalid.json',
      text: () => Promise.resolve('{"type":"PRINT"}'), // object, not array
    };
    const fileInput = document.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(store.getState().audit.logs).toHaveLength(1); // unchanged
    expect(store.getState().ui.toasts[0].tone).toBe('error');
  });

  it('import error path: array of entries with no valid objects pushes an error toast', async () => {
    const store = seed([entry({ type: 'PRINT' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const fakeFile = {
      name: 'empty-valid.json',
      text: () => Promise.resolve('[null, 42, "string"]'), // no valid {type} objects
    };
    const fileInput = document.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [fakeFile] } });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(store.getState().audit.logs).toHaveLength(1);
    expect(store.getState().ui.toasts[0].tone).toBe('error');
  });

  it('search handles JSON.stringify failure (BigInt payload) without crashing', async () => {
    const user = userEvent.setup();
    const withBigInt = entry({ type: 'PRINT', template: 'viewing', amount: 10n });
    const store = seed([withBigInt]);
    renderWithStore(<AuditLogPanel />, { store });

    const search = screen.getByRole('searchbox', { name: /search audit log/i });
    // Doesn't match type/summary, so code falls through to JSON.stringify catch path.
    await user.type(search, 'definitely-not-present');

    expect(screen.getByText(/no matching entries/i)).toBeInTheDocument();
  });

  it('clicking Import triggers the hidden file input click', async () => {
    const user = userEvent.setup();
    const store = seed([entry({ type: 'PRINT' })]);
    renderWithStore(<AuditLogPanel />, { store });

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});

    await user.click(screen.getByRole('button', { name: /import/i }));
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });

  it('summaryFor renders LLM and compliance event types correctly', () => {
    const store = seed([
      entry({ type: 'LLM_FIELD_APPLIED', section: 'tenant', field: 'name' }),
      entry({
        type: 'LLM_FILE_FIELD_APPLIED',
        fileName: 'lease.pdf',
        section: 'landlord',
        field: 'name',
        confidence: 0.92,
      }),
      entry({ type: 'LLM_FILE_FIELD_APPLIED', fileName: 'doc.pdf', section: 'property', field: 'ref' }), // no confidence
      entry({ type: 'LLM_FILE_BULK_APPLIED', appliedCount: 5, fileName: 'bulk.pdf' }),
      entry({ type: 'LLM_FILE_BULK_APPLIED', appliedCount: 1, fileName: 'single.pdf' }),
      entry({ type: 'COMPLIANCE_CHECK_RUN', template: 'tenancy', warningCount: 2, criticalCount: 1 }),
      entry({ type: 'COMPLIANCE_CHECK_RUN', template: 'offer', warningCount: 1, criticalCount: 0 }),
      entry({ type: 'PDF_GENERATED', fileName: 'doc.pdf', persisted: 'drafts/' }),
      entry({ type: 'PDF_GENERATED', fileName: 'doc.pdf' }), // no persisted
      entry({ type: 'UNKNOWN_CUSTOM_TYPE' }), // default case
    ]);
    renderWithStore(<AuditLogPanel />, { store });

    expect(screen.getByText(/chat applied tenant\.name/i)).toBeInTheDocument();
    expect(screen.getByText(/from lease\.pdf.*landlord\.name.*92%/i)).toBeInTheDocument();
    expect(screen.getByText(/bulk applied 5 fields from bulk\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/bulk applied 1 field from single\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/tenancy.*2 warnings.*1 critical/i)).toBeInTheDocument();
    // The type text also appears in the filter <select> options, so use getAllByText.
    expect(screen.getAllByText(/UNKNOWN_CUSTOM_TYPE/).length).toBeGreaterThan(0);
    expect(screen.getByText(/doc\.pdf → drafts\//i)).toBeInTheDocument();
  });
});
