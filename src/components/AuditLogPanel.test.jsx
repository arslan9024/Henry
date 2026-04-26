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
    // Stub confirm so the destructive path runs.
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithStore(<AuditLogPanel />, { store });

    await user.click(screen.getByRole('button', { name: /clear/i }));

    // Logs are gone, but a toast with Undo action should have been pushed.
    expect(store.getState().audit.logs).toEqual([]);
    const toasts = store.getState().ui.toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      tone: 'warning',
      action: { label: 'Undo', type: 'audit/restoreAuditLogs' },
    });
    expect(toasts[0].action.payload).toHaveLength(2);
    confirmSpy.mockRestore();
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
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false); // false = Replace
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

    confirmSpy.mockRestore();
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
});
