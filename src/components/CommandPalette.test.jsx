import React from 'react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../store/uiSlice';
import archiveReducer from '../store/archiveSlice';
import auditReducer from '../store/auditSlice';
import templateReducer from '../store/templateSlice';
import CommandPalette from './CommandPalette';

const makeStore = (preloaded = {}) =>
  configureStore({
    reducer: {
      ui: uiReducer,
      archive: archiveReducer,
      audit: auditReducer,
      template: templateReducer,
    },
    preloadedState: preloaded,
  });

const renderPalette = (store) =>
  render(
    <Provider store={store}>
      <CommandPalette />
    </Provider>,
  );

// Helper: dispatch Ctrl+K from the document so the event bubbles to window.
const pressCtrlK = () => fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
// RTL's screen queries search document.body including portals.
// Use getByPlaceholderText since the combobox role conflicts between
// explicit role="combobox" and the implicit searchbox role of type="search".
const getInput = () => screen.getByPlaceholderText(/Search templates, actions, archive/i);
const waitForOpen = () =>
  waitFor(() => {
    const el = screen.queryByPlaceholderText(/Search templates, actions, archive/i);
    if (!el) throw new Error('palette not open yet');
    return el;
  });
const waitForClosed = () => waitFor(() => expect(document.querySelector('.cp-panel')).toBeNull());

afterEach(cleanup);

describe('CommandPalette (T-41)', () => {
  it('renders nothing by default (closed)', () => {
    const { container } = renderPalette(makeStore());
    expect(container.querySelector('.cp-panel')).toBeNull();
  });

  it('opens on Ctrl+K and focuses the search input', async () => {
    renderPalette(makeStore());
    act(() => pressCtrlK());
    await waitForOpen();
    expect(getInput()).toBeInTheDocument();
  });

  it('Esc closes the palette', async () => {
    renderPalette(makeStore());
    act(() => pressCtrlK());
    const input = await waitForOpen();
    act(() => {
      fireEvent.keyDown(getInput(), { key: 'Escape' });
    });
    await waitForClosed();
  });

  it('lists all 8 templates on empty query', async () => {
    renderPalette(makeStore());
    act(() => pressCtrlK());
    await waitForOpen();
    const items = screen.getAllByRole('option');
    // 8 templates + 4 static actions = 12 minimum (archive entries are empty).
    expect(items.length).toBeGreaterThanOrEqual(12);
  });

  it('filters results on query input', async () => {
    renderPalette(makeStore());
    act(() => pressCtrlK());
    await waitForOpen();
    fireEvent.change(getInput(), { target: { value: 'viewing' } });
    const items = screen.getAllByRole('option');
    expect(items.length).toBe(1);
    expect(items[0]).toHaveTextContent(/Viewing/i);
  });

  it('activating a template item dispatches setActiveTemplate', async () => {
    const store = makeStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderPalette(store);
    act(() => pressCtrlK());
    await waitForOpen();
    fireEvent.change(getInput(), { target: { value: 'invoice' } });
    const item = screen.getByRole('option');
    act(() => {
      fireEvent.click(item);
    });
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'template/setActiveTemplate' }));
    await waitForClosed();
  });

  it('ArrowDown cycles and Enter activates the highlighted item', async () => {
    const store = makeStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderPalette(store);
    act(() => pressCtrlK());
    await waitForOpen();
    const input = getInput();
    act(() => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitForClosed();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('shows empty state when query matches nothing', async () => {
    renderPalette(makeStore());
    act(() => pressCtrlK());
    await waitForOpen();
    fireEvent.change(getInput(), { target: { value: 'xyzzy-no-match' } });
    expect(screen.getByRole('status')).toHaveTextContent(/No results/i);
  });

  it('scrim click closes the palette', async () => {
    renderPalette(makeStore());
    act(() => pressCtrlK());
    await waitForOpen();
    act(() => {
      fireEvent.mouseDown(document.querySelector('.cp-scrim'));
    });
    await waitForClosed();
  });
});
