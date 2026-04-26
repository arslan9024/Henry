import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markSaved, selectSaveState } from '../store/uiSlice';

/**
 * useAutosaveDebounce — observes uiSlice.save.dirtyAt and, after `delayMs`
 * of quiet, dispatches `markSaved(now)`. Mounted once at the App root.
 *
 * Why a hook (not middleware): keeps Redux pure/serialisable, lets test
 * code skip the timer with `vi.useFakeTimers()`, and naturally resets the
 * timer on every new keystroke because each `document/*` action bumps
 * `dirtyAt` to a new value, retriggering the effect.
 */
export default function useAutosaveDebounce(delayMs = 600) {
  const dispatch = useDispatch();
  const { status, dirtyAt } = useSelector(selectSaveState);
  const timerRef = useRef(null);

  useEffect(() => {
    if (status !== 'saving' || !dirtyAt) return undefined;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch(markSaved(Date.now()));
      timerRef.current = null;
    }, delayMs);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dispatch, status, dirtyAt, delayMs]);
}
