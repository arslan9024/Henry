import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import templateReducer from './templateSlice';
import documentReducer from './documentSlice';
import complianceReducer from './complianceSlice';
import policyMetaReducer from './policyMetaSlice';
import auditReducer, { addAuditLog, clearAuditLogs, restoreAuditLogs, persistAuditLogs } from './auditSlice';
import sidebarReducer from './sidebarSlice';
import henryReducer from './henrySlice';
import archiveReducer, { addArchiveEntry, clearArchiveEntries } from './archiveSlice';
import { persistArchiveEntries } from '../records/archiveService';
import ocrReducer from './ocrSlice';
import uiReducer from './uiSlice';
import uiCommandReducer, { toggleLeftRail, setLeftRail } from './uiCommandSlice';
import { STORAGE_KEY_LEFT_RAIL } from '../constants/storageKeys';

// ─── Listener middleware for localStorage side effects ──────────────────────
// Persistence is intentionally kept out of reducers (reducers must be pure).
// All writes to localStorage happen here, after the state has been updated.

const listenerMiddleware = createListenerMiddleware();

// Audit log persistence
listenerMiddleware.startListening({
  actionCreator: addAuditLog,
  effect: (_action, listenerApi) => {
    persistAuditLogs(listenerApi.getState().audit.logs);
  },
});
listenerMiddleware.startListening({
  actionCreator: clearAuditLogs,
  effect: (_action, listenerApi) => {
    persistAuditLogs(listenerApi.getState().audit.logs);
  },
});
listenerMiddleware.startListening({
  actionCreator: restoreAuditLogs,
  effect: (_action, listenerApi) => {
    persistAuditLogs(listenerApi.getState().audit.logs);
  },
});

// Archive persistence
listenerMiddleware.startListening({
  actionCreator: addArchiveEntry,
  effect: (_action, listenerApi) => {
    persistArchiveEntries(listenerApi.getState().archive.entries);
  },
});
listenerMiddleware.startListening({
  actionCreator: clearArchiveEntries,
  effect: (_action, listenerApi) => {
    persistArchiveEntries(listenerApi.getState().archive.entries);
  },
});

// Left-rail persistence
const persistLeftRail = (value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_LEFT_RAIL, value);
    }
  } catch {
    /* ignore quota/private-mode errors */
  }
};

listenerMiddleware.startListening({
  actionCreator: toggleLeftRail,
  effect: (_action, listenerApi) => {
    persistLeftRail(listenerApi.getState().uiCommand.leftRail);
  },
});
listenerMiddleware.startListening({
  actionCreator: setLeftRail,
  effect: (_action, listenerApi) => {
    persistLeftRail(listenerApi.getState().uiCommand.leftRail);
  },
});

// ─── Read persisted left-rail value at store creation time ─────────────────
const readPersistedLeftRail = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const v = window.localStorage.getItem(STORAGE_KEY_LEFT_RAIL);
      if (v === 'collapsed' || v === 'expanded') return v;
    }
  } catch {
    /* ignore */
  }
  return 'expanded';
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    template: templateReducer,
    document: documentReducer,
    compliance: complianceReducer,
    policyMeta: policyMetaReducer,
    audit: auditReducer,
    sidebar: sidebarReducer,
    henry: henryReducer,
    archive: archiveReducer,
    ocr: ocrReducer,
    ui: uiReducer,
    uiCommand: uiCommandReducer,
  },
  preloadedState: {
    uiCommand: {
      leftRail: readPersistedLeftRail(),
      drawerTab: null,
      chatOpen: false,
      printTrigger: 0,
    },
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
