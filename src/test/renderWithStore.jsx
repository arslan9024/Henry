import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import auditReducer, {
  addAuditLog,
  clearAuditLogs,
  restoreAuditLogs,
  persistAuditLogs,
} from '../store/auditSlice';
import uiReducer from '../store/uiSlice';
import uiCommandReducer from '../store/uiCommandSlice';

/**
 * Build a small store with just the slices our component tests need.
 * Pass `preloaded` to seed initial state, e.g. `{ audit: { logs: [...] } }`.
 */
export const buildTestStore = (preloaded = {}) => {
  const lm = createListenerMiddleware();
  lm.startListening({
    actionCreator: addAuditLog,
    effect: (_, api) => persistAuditLogs(api.getState().audit.logs),
  });
  lm.startListening({
    actionCreator: clearAuditLogs,
    effect: (_, api) => persistAuditLogs(api.getState().audit.logs),
  });
  lm.startListening({
    actionCreator: restoreAuditLogs,
    effect: (_, api) => persistAuditLogs(api.getState().audit.logs),
  });
  return configureStore({
    reducer: { audit: auditReducer, ui: uiReducer, uiCommand: uiCommandReducer },
    preloadedState: preloaded,
    middleware: (gd) => gd().prepend(lm.middleware),
  });
};

export const renderWithStore = (ui, { store = buildTestStore(), ...rtl } = {}) => {
  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { store, ...render(ui, { wrapper: Wrapper, ...rtl }) };
};
