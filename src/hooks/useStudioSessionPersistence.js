/**
 * [Category 3: In-Memory State & Session Hook]
 * White Caves Real Estate - Tenancy Studio Session Persistence Hook
 * Automatically persists active deal inputs to localStorage across browser reloads (< 90 lines).
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage1Field, setChequeCount, setIsFurnished } from '../store/tenancyStudioSlice';

const SESSION_KEY = 'whitecaves_henry_active_deal_session';

export const useStudioSessionPersistence = () => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio?.page1);
  const chequeCount = useSelector((state) => state.tenancyStudio?.chequeCount);
  const isFurnished = useSelector((state) => state.tenancyStudio?.isFurnished);
  const hasHydrated = useRef(false);

  // 1. Hydrate on initial mount
  useEffect(() => {
    if (typeof window === 'undefined' || hasHydrated.current) return;
    hasHydrated.current = true;

    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.page1 && typeof saved.page1 === 'object') {
          Object.entries(saved.page1).forEach(([field, value]) => {
            if (value !== undefined && value !== null) {
              dispatch(updatePage1Field({ field, value }));
            }
          });
        }
        if (saved.chequeCount) dispatch(setChequeCount(saved.chequeCount));
        if (saved.isFurnished !== undefined) dispatch(setIsFurnished(saved.isFurnished));
      }
    } catch (e) {
      console.warn('Could not restore Henry deal session:', e);
    }
  }, [dispatch]);

  // 2. Debounced save on mutation
  useEffect(() => {
    if (!hasHydrated.current || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        const payload = {
          page1,
          chequeCount,
          isFurnished,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Could not persist Henry deal session:', e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [page1, chequeCount, isFurnished]);
};

export default useStudioSessionPersistence;
