import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import templateReducer from './templateSlice';
import documentReducer from './documentSlice';
import complianceReducer from './complianceSlice';
import policyMetaReducer from './policyMetaSlice';
import auditReducer, { addAuditLog, clearAuditLogs, persistAuditLogs, restoreAuditLogs } from './auditSlice';
import sidebarReducer from './sidebarSlice';
import henryReducer from './henrySlice';
import archiveReducer, { addArchiveEntry, clearArchiveEntries } from './archiveSlice';
import ocrReducer from './ocrSlice';
import uiReducer from './uiSlice';
import payrollReducer from './payrollSlice';
import appRouteReducer from './appRouteSlice';
import uiCommandReducer, { persistUiCommandState } from './uiCommandSlice';
import { persistArchiveEntries } from '../records/archiveService';
import fieldSourceReducer, {
  clearFieldSources,
  persistFieldSources,
  recordFieldSources,
} from './fieldSourceSlice';
import userAccessReducer from './userAccessSlice';
import approvalReducer from './approvalSlice';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: addAuditLog,
  effect: (_, api) => persistAuditLogs(api.getState().audit.logs),
});
listenerMiddleware.startListening({
  matcher: (action) => action.type === recordFieldSources.type || action.type === clearFieldSources.type,
  effect: (_, api) => persistFieldSources(api.getState().fieldSources.byField),
});
listenerMiddleware.startListening({
  actionCreator: clearAuditLogs,
  effect: (_, api) => persistAuditLogs(api.getState().audit.logs),
});
listenerMiddleware.startListening({
  actionCreator: restoreAuditLogs,
  effect: (_, api) => persistAuditLogs(api.getState().audit.logs),
});
listenerMiddleware.startListening({
  actionCreator: addArchiveEntry,
  effect: (_, api) => persistArchiveEntries(api.getState().archive.entries),
});
listenerMiddleware.startListening({
  actionCreator: clearArchiveEntries,
  effect: (_, api) => persistArchiveEntries(api.getState().archive.entries),
});
listenerMiddleware.startListening({
  predicate: (action) => typeof action?.type === 'string' && action.type.startsWith('uiCommand/'),
  effect: (_, api) => {
    const { leftRail, chatOpen } = api.getState().uiCommand;
    persistUiCommandState({ leftRail, chatOpen });
  },
});

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
    payroll: payrollReducer,
    appRoute: appRouteReducer,
    fieldSources: fieldSourceReducer,
    userAccess: userAccessReducer,
    approvals: approvalReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
