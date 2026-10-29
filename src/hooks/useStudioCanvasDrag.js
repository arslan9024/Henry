/**
 * [Category 4: Event Handler]
 * White Caves Real Estate - Studio Canvas Interactive Drag Controller Hook
 * Manages dragging coordinate markers across the DLD canvas with boundary clamping.
 */

import { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFieldCoordinate, setSelectedFieldKey } from '../store/tenancyStudioSlice';

export function useStudioCanvasDrag({ activePage = 1, zoom = 1.0 }) {
  const dispatch = useDispatch();
  const selectedFieldKey = useSelector((state) => state.tenancyStudio.selectedFieldKey);
  const dragRef = useRef({
    isDragging: false,
    fieldKey: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const handleMouseDown = useCallback(
    (fieldKey, currentPtX, currentPtY, e) => {
      e.preventDefault();
      e.stopPropagation();

      dispatch(setSelectedFieldKey(fieldKey));
      dragRef.current = {
        isDragging: true,
        fieldKey,
        startX: e.clientX,
        startY: e.clientY,
        originX: currentPtX,
        originY: currentPtY,
      };

      const handleMouseMove = (moveEvent) => {
        if (!dragRef.current.isDragging) return;

        const deltaPixelsX = (moveEvent.clientX - dragRef.current.startX) / zoom;
        const deltaPixelsY = (moveEvent.clientY - dragRef.current.startY) / zoom;

        // In PDF coordinates:
        // x increases to the right: pt_x = origin_x + deltaPixelsX
        // y decreases as you move down: pt_y = origin_y - deltaPixelsY
        const newX = Math.max(10, Math.min(580, dragRef.current.originX + deltaPixelsX));
        const newY = Math.max(10, Math.min(830, dragRef.current.originY - deltaPixelsY));

        dispatch(
          updateFieldCoordinate({
            page: activePage,
            fieldKey: dragRef.current.fieldKey,
            x: newX,
            y: newY,
          }),
        );
      };

      const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [dispatch, activePage, zoom],
  );

  return { handleMouseDown, selectedFieldKey };
}
