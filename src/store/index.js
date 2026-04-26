import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './templateSlice';
import documentReducer from './documentSlice';
import complianceReducer from './complianceSlice';
import policyMetaReducer from './policyMetaSlice';
import auditReducer from './auditSlice';
import sidebarReducer from './sidebarSlice';
import henryReducer from './henrySlice';
import archiveReducer from './archiveSlice';
import ocrReducer from './ocrSlice';
import uiReducer from './uiSlice';

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
  },
});
