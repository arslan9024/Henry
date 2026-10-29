import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tenancyStudioReducer from '../../store/tenancyStudioSlice';
import uiCommandReducer from '../../store/uiCommandSlice';
import StudioLayout from './StudioLayout';

const makeStore = () =>
  configureStore({
    reducer: {
      tenancyStudio: tenancyStudioReducer,
      uiCommand: uiCommandReducer,
    },
  });

const renderStudio = () => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <StudioLayout />
    </Provider>,
  );
};

afterEach(cleanup);

describe('StudioLayout 3-Column Cockpit', () => {
  it('renders Column A (Inputs), Column B (Viewer), Column C (Status), and Footer', () => {
    const { container } = renderStudio();
    expect(container.querySelector('.col-a-inputs')).toBeInTheDocument();
    expect(container.querySelector('.col-b-viewer')).toBeInTheDocument();
    expect(container.querySelector('.col-c-status')).toBeInTheDocument();
    expect(container.querySelector('.studio-footer')).toBeInTheDocument();
  });

  it('toggles Column A collapse and uncollapse via restore rail', () => {
    const { container } = renderStudio();
    const toggleA = screen.getByTitle(/Collapse Column A Inputs/i);
    fireEvent.click(toggleA);

    expect(container.querySelector('.col-a-restore-rail')).toBeInTheDocument();
    const railA = screen.getByTitle(/Click to restore Inputs/i);
    fireEvent.click(railA);

    expect(container.querySelector('.col-a-inputs')).toBeInTheDocument();
  });

  it('toggles Column C collapse and uncollapse via restore rail', () => {
    const { container } = renderStudio();
    const toggleC = screen.getByTitle(/Collapse Column C Status Sidebar/i);
    fireEvent.click(toggleC);

    expect(container.querySelector('.col-c-restore-rail')).toBeInTheDocument();
    const railC = screen.getByTitle(/Click to restore Status & Activities/i);
    fireEvent.click(railC);

    expect(container.querySelector('.col-c-status')).toBeInTheDocument();
  });

  it('collapses Column B and uncollapses via center preview restore rail', () => {
    const { container } = renderStudio();
    const hidePreviewBtn = screen.getByTitle(/Minimize Preview Pane/i);
    fireEvent.click(hidePreviewBtn);

    expect(container.querySelector('.col-b-restore-rail')).toBeInTheDocument();
    const railB = screen.getByTitle(/Click to restore Document Preview/i);
    fireEvent.click(railB);

    expect(container.querySelector('.col-b-viewer')).toBeInTheDocument();
  });
});
