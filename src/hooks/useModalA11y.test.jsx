/**
 * [Category 2: Test]
 * Tests for useModalA11y hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useModalA11y } from './useModalA11y';

describe('useModalA11y Hook', () => {
  it('calls onClose when Escape key is pressed while isOpen is true', () => {
    const onClose = vi.fn();
    renderHook(() => useModalA11y(true, onClose));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed while isOpen is false', () => {
    const onClose = vi.fn();
    renderHook(() => useModalA11y(false, onClose));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores other keys like Enter or Space', () => {
    const onClose = vi.fn();
    renderHook(() => useModalA11y(true, onClose));

    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: ' ' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
