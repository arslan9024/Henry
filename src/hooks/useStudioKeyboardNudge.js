/**
 * [Category 4: Event Handler]
 * White Caves Real Estate - Studio Keyboard 1pt/5pt Micro-Nudge Controller Hook
 * Listens for Arrow keys to nudge the selected coordinate chip with 1pt precision.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nudgeFieldCoordinate } from '../store/tenancyStudioSlice';

export function useStudioKeyboardNudge({ activePage = 1, isEnabled = true }) {
  const dispatch = useDispatch();
  const selectedFieldKey = useSelector((state) => state.tenancyStudio.selectedFieldKey);

  useEffect(() => {
    if (!isEnabled || !selectedFieldKey) return;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      const step = e.shiftKey ? 5 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') {
        dx = -step;
      } else if (e.key === 'ArrowRight') {
        dx = step;
      } else if (e.key === 'ArrowUp') {
        // In PDF coordinates, Up increases Y
        dy = step;
      } else if (e.key === 'ArrowDown') {
        // In PDF coordinates, Down decreases Y
        dy = -step;
      } else {
        return;
      }

      e.preventDefault();
      dispatch(
        nudgeFieldCoordinate({
          page: activePage,
          fieldKey: selectedFieldKey,
          dx,
          dy,
        }),
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedFieldKey, activePage, isEnabled]);
}
