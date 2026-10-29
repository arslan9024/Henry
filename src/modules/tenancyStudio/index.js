/**
 * White Caves Real Estate LLC - Tenancy Studio Public Module API
 *
 * This entrypoint is the clean boundary for importing Henry's Tenancy Studio
 * into the main White Caves monorepo project:
 *
 *   import {
 *     StudioLayout,
 *     tenancyStudioReducer,
 *     compileTenancyPackage,
 *     calculateChequeSchedule,
 *     DEAL_PRESETS
 *   } from '@whitecaves/tenancy-studio';
 */

// View Components
export { default as StudioLayout } from '../../components/tenancyStudio/StudioLayout';
export { default as StudioStepContainer } from '../../components/tenancyStudio/StudioStepContainer';
export { default as StudioPdfViewerPane } from '../../components/tenancyStudio/StudioPdfViewerPane';
export { default as StudioStatusSidebar } from '../../components/tenancyStudio/StudioStatusSidebar';
export { default as StudioFooterBar } from '../../components/tenancyStudio/StudioFooterBar';
export { default as SmartIngestionDropzone } from '../../components/tenancyStudio/SmartIngestionDropzone';
export { default as VisualPlaygroundCanvas } from '../../components/tenancyStudio/VisualPlaygroundCanvas';
export { default as StudioStep1DealInputs } from '../../components/tenancyStudio/StudioStep1DealInputs';
export { default as StudioStep2Addendum } from '../../components/tenancyStudio/StudioStep2Addendum';
export { default as StudioStep3Receipt } from '../../components/tenancyStudio/StudioStep3Receipt';
export { default as StudioStep4ReviewExport } from '../../components/tenancyStudio/StudioStep4ReviewExport';

// Redux State
export {
  default as tenancyStudioReducer,
  applyDealPreset,
  applySmartIngestion,
  setChequeCount,
  setIsFurnished,
  undoCoordinateChange,
  redoCoordinateChange,
  toggleSnapToGrid,
  toggleCrosshairs,
  updatePage1Field,
  updateFieldCoordinate,
  nudgeFieldCoordinate,
  resetCoordinatesToDefault,
  DEAL_PRESETS,
} from '../../store/tenancyStudioSlice';

// Processing Engines
export { compileTenancyPackage } from '../../services/tenancyStudio/multiDocPackageCompiler';
export {
  calculateChequeSchedule,
  calculateSecurityDeposit,
  calculateAgencyCommissionBreakdown,
  parseCleanAmount,
  formatAed,
} from '../../services/tenancyStudio/chequeCalculator';
export { renderPdfPageToCanvas } from '../../services/tenancyStudio/pdfPageRenderer';
export { extractMrzLines, parseMrzBlock } from '../../services/tenancyStudio/mrzExtractorService';
export { advanceRenewalDates } from '../../services/tenancyStudio/renewalDateCalculator';
