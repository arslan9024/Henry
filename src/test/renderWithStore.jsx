import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import auditReducer from '../store/auditSlice';
import uiReducer from '../store/uiSlice';

/**
 * Build a small store with just the slices our component tests need.
 * Pass `preloaded` to seed initial state, e.g. `{ audit: { logs: [...] } }`.
 */
export const buildTestStore = (preloaded = {}) =>
  configureStore({
    reducer: { audit: auditReducer, ui: uiReducer },
    preloadedState: preloaded,
  });

export const renderWithStore = (ui, { store = buildTestStore(), ...rtl } = {}) => {
  const Wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { store, ...render(ui, { wrapper: Wrapper, ...rtl }) };
};
