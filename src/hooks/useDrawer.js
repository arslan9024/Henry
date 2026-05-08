/**
 * useDrawer.js — encapsulates drawer tab state and open/close helpers.
 *
 * Reads/writes Redux uiCommandSlice so the drawer state is globally
 * accessible (e.g. CommandPalette can open any tab) and is testable
 * without simulating DOM events.
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDrawer, closeDrawer, selectDrawerTab } from '../store/uiCommandSlice';

/**
 * @returns {{
 *   drawerTab: null | 'compliance' | 'archive' | 'audit',
 *   openCompliance: () => void,
 *   openArchive: () => void,
 *   openAudit: () => void,
 *   closeDrawer: () => void,
 * }}
 */
export const useDrawer = () => {
  const dispatch = useDispatch();
  const drawerTab = useSelector(selectDrawerTab);

  // Close on Escape key.
  useEffect(() => {
    if (!drawerTab) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') dispatch(closeDrawer());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerTab, dispatch]);

  const openCompliance = useCallback(() => dispatch(openDrawer('compliance')), [dispatch]);
  const openArchive = useCallback(() => dispatch(openDrawer('archive')), [dispatch]);
  const openAudit = useCallback(() => dispatch(openDrawer('audit')), [dispatch]);
  const close = useCallback(() => dispatch(closeDrawer()), [dispatch]);

  return {
    drawerTab,
    openCompliance,
    openArchive,
    openAudit,
    closeDrawer: close,
  };
};
