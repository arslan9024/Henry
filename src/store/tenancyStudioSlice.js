/**
 * [Category 3: In-Memory State]
 * White Caves Real Estate - Tenancy Studio Master Redux Slice
 * Manages the 4-phase guided journey, in-memory form metrics, stamping coordinates,
 * addendum params, payment receipt metrics, toolbox configuration, verification gates,
 * cheque schedule, and coordinate history undo/redo buffer.
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  DEFAULT_CONTRACT_MAPPER,
  STORAGE_COORDINATES_KEY,
} from '../config/tenancyStudio/contractMapperConfig';
import { ADDENDUM_CONTENT_CONFIG } from '../config/tenancyStudio/addendumConfig';
import { RECEIPT_CONTENT_CONFIG } from '../config/tenancyStudio/receiptConfig';
import { calculateVatAndFee } from '../services/tenancyStudio/multiDocPackageCompiler';
import { calculateSecurityDeposit } from '../services/tenancyStudio/chequeCalculator';

export const DEAL_PRESETS = {
  'marina-1br': {
    name: 'Dubai Marina 1BR (2 Cheques, Unfurnished)',
    page1: {
      contract_date: '01-11-2026',
      owner_name: 'Rashid Al Nuaimi',
      lessor_name: 'Rashid Al Nuaimi',
      lessor_id: '784-1980-5544332-1',
      lessor_email: 'rashid.alnuaimi@whitecaves.ae',
      lessor_phone: '+971 50 123 4567',
      tenant_name: 'Sarah Jane Jenkins',
      tenant_eid: '784-1994-1122334-5',
      tenant_email: 'sarah.jenkins@outlook.com',
      tenant_phone: '+971 58 987 6543',
      prop_usage: '✓',
      plot_no: '392-5412',
      building_name: 'Marina Gate 1, Dubai Marina',
      property_no: 'Apartment 1402',
      property_type: '1 Bedroom Apartment',
      property_area: '78.50',
      location: 'Dubai Marina, Dubai',
      dewa_premises: '481902341',
      date_from: '01-11-2026',
      date_to: '31-10-2027',
      contract_value: '95,000.00 AED',
      annual_rent: '95,000.00 AED',
      security_deposit: '4,750.00 AED',
      mode_of_payment: '2 Cheques',
    },
    chequeCount: 2,
    isFurnished: false,
  },
  'downtown-luxury': {
    name: 'Downtown Boulevard Suite (4 Cheques, Furnished)',
    page1: {
      contract_date: '15-12-2026',
      owner_name: 'Emaar Properties PJSC',
      lessor_name: 'Mohammed Tariq Al Futtaim',
      lessor_id: '784-1976-9988776-3',
      lessor_email: 'tariq.futtaim@whitecaves.ae',
      lessor_phone: '+971 55 443 2211',
      tenant_name: 'Alexander Vladimir Volkov',
      tenant_eid: '784-1988-6655443-2',
      tenant_email: 'alex.volkov@investglobal.com',
      tenant_phone: '+971 52 332 1100',
      prop_usage: '✓',
      plot_no: '112-9081',
      building_name: 'The Address Downtown, Downtown Dubai',
      property_no: 'Suite 2801',
      property_type: 'Luxury Serviced Apartment',
      property_area: '124.00',
      location: 'Downtown Dubai, Dubai',
      dewa_premises: '772109845',
      date_from: '15-12-2026',
      date_to: '14-12-2027',
      contract_value: '220,000.00 AED',
      annual_rent: '220,000.00 AED',
      security_deposit: '22,000.00 AED',
      mode_of_payment: '4 Cheques',
    },
    chequeCount: 4,
    isFurnished: true,
  },
  'business-bay-commercial': {
    name: 'Business Bay Commercial Office (1 Cheque)',
    page1: {
      contract_date: '01-01-2027',
      owner_name: 'Omniyat Investment Holdings',
      lessor_name: 'Omniyat Asset Management LLC',
      lessor_id: '784-1970-1122112-9',
      lessor_email: 'commercial@omniyat.ae',
      lessor_phone: '+971 4 511 5000',
      tenant_name: 'Apex Strategic Advisory DMCC',
      tenant_eid: '784-1982-3344556-7',
      tenant_email: 'contracts@apex-advisory.ae',
      tenant_phone: '+971 4 889 0012',
      prop_usage: '✓',
      plot_no: '346-6721',
      building_name: 'The Opus by Zaha Hadid, Business Bay',
      property_no: 'Office 1205',
      property_type: 'Commercial Office',
      property_area: '210.00',
      location: 'Business Bay, Dubai',
      dewa_premises: '602914833',
      date_from: '01-01-2027',
      date_to: '31-12-2027',
      contract_value: '315,000.00 AED',
      annual_rent: '315,000.00 AED',
      security_deposit: '15,750.00 AED',
      mode_of_payment: '1 Cheque',
    },
    chequeCount: 1,
    isFurnished: false,
  },
};

const loadStoredCoordinates = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_COORDINATES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.page1 && parsed.page3) return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load coordinates from localStorage:', e);
  }
  return DEFAULT_CONTRACT_MAPPER;
};

const initialCoordinates = loadStoredCoordinates();

const initialState = {
  currentStep: 1,
  activeViewingPage: 1,
  zoom: 1.0,
  selectedFieldKey: 'tenant_name',

  // Interactive Viewport Preferences
  snapToGrid: false,
  gridSize: 5,
  showCrosshairs: true,

  // Cheque & Furnishing Business Logic
  chequeCount: 4,
  isFurnished: false,

  // History buffer for Undo / Redo
  history: {
    past: [],
    future: [],
  },

  // Toolbox Configurations
  toolbox: {
    pdfEngine: 'combined-bundle', // 'pdf-lib-stamp' | 'react-pdf-vector' | 'combined-bundle'
    extractionMode: 'mrz-passport-eid', // 'client-ocr' | 'mrz-passport-eid'
    documentScope: 'full-package', // 'full-package' | 'contract-only' | 'addendum-only' | 'receipt-only'
    isToolboxOpen: false,
  },

  // Page 1 24 DLD fields RAM buffer
  page1: {
    contract_date: '01-10-2026',
    owner_name: 'Hassen Soltani',
    lessor_name: 'Hassen Soltani',
    lessor_id: '784-1985-1234567-1',
    lessor_email: 'mohamedkifaru@gmail.com',
    lessor_phone: '+254 720 985595',
    tenant_name: 'Ajas Paliakarkadu Fasal Fasaludheen Peerukutty',
    tenant_eid: '784-1992-7654321-9',
    tenant_email: 'Mahmoud.mufty@gmail.com',
    tenant_phone: '+971 52 864 3118',
    prop_usage: '✓',
    plot_no: '645-1234',
    building_name: 'Viridis A, DAMAC Hills 2',
    property_no: 'Studio 404',
    property_type: 'Hotel Apartment',
    property_area: '42.50',
    location: 'Madinat Hind 4, Dubai',
    dewa_premises: '916058204',
    date_from: '01-10-2026',
    date_to: '30-09-2027',
    contract_value: '35,000.00 AED',
    annual_rent: '35,000.00 AED',
    security_deposit: '1,750.00 AED',
    mode_of_payment: '4 Cheques',
  },

  // Page 3 additional clauses RAM buffer
  page3: {
    term_line_1: '1. The tenant shall observe all community rules and regulations of Viridis A.',
    term_line_2: '2. Minor maintenance up to AED 1,000 shall be borne by the tenant.',
    term_line_3: '3. Major structural and MEP defects exceeding AED 1,000 are the landlord responsibility.',
    term_line_4: '4. Subletting or unauthorized partition of the apartment is strictly prohibited.',
    term_line_5: '5. Non-renewal notice must be served in writing 90 days prior to contract expiry.',
  },

  // Addendum RAM buffer
  addendumParams: { ...ADDENDUM_CONTENT_CONFIG.defaultParams },

  // Receipt RAM buffer
  receiptParams: { ...RECEIPT_CONTENT_CONFIG.defaultParams },

  // Stamping Coordinates (in Points)
  coordinates: initialCoordinates,

  // Verification Gates
  confirmations: {
    step1InputsConfirmed: true,
    coordinatesConfirmed: true,
    addendumConfirmed: true,
    receiptConfirmed: true,
    isCompiling: false,
    lastCompiledBlobUrl: null,
    lastFileName: '',
  },
};

const tenancyStudioSlice = createSlice({
  name: 'tenancyStudio',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setActiveViewingPage: (state, action) => {
      state.activeViewingPage = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = Math.min(1.5, Math.max(0.7, action.payload));
    },
    setSelectedFieldKey: (state, action) => {
      state.selectedFieldKey = action.payload;
    },
    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid;
    },
    toggleCrosshairs: (state) => {
      state.showCrosshairs = !state.showCrosshairs;
    },
    setChequeCount: (state, action) => {
      const count = Math.max(1, Math.min(12, parseInt(action.payload, 10) || 1));
      state.chequeCount = count;
      state.page1.mode_of_payment = `${count} Cheque${count > 1 ? 's' : ''}`;
      state.addendumParams.payment_frequency = state.page1.mode_of_payment;
    },
    setIsFurnished: (state, action) => {
      state.isFurnished = Boolean(action.payload);
      const dep = calculateSecurityDeposit({
        annualRent: state.page1.annual_rent,
        isFurnished: state.isFurnished,
      });
      state.page1.security_deposit = dep.amountFormatted;
      state.addendumParams.refundable_security_deposit = dep.amountFormatted;
    },
    applyDealPreset: (state, action) => {
      const presetKey = action.payload;
      const preset = DEAL_PRESETS[presetKey];
      if (!preset) return;

      state.page1 = { ...state.page1, ...preset.page1 };
      state.chequeCount = preset.chequeCount;
      state.isFurnished = preset.isFurnished;

      // Sync Addendum & Receipt
      state.addendumParams.landlord_name = preset.page1.owner_name;
      state.addendumParams.tenant_name = preset.page1.tenant_name;
      state.addendumParams.property_address = `${preset.page1.property_no}, ${preset.page1.building_name}, ${preset.page1.location}`;
      state.addendumParams.tenancy_commencement = preset.page1.date_from;
      state.addendumParams.tenancy_expiration = preset.page1.date_to;
      state.addendumParams.gross_annual_rent = preset.page1.annual_rent;
      state.addendumParams.refundable_security_deposit = preset.page1.security_deposit;
      state.addendumParams.payment_frequency = preset.page1.mode_of_payment;
      state.addendumParams.dewa_premises_no = preset.page1.dewa_premises;

      state.receiptParams.tenant_name = preset.page1.tenant_name;
      state.receiptParams.property_summary = `Property: ${preset.page1.property_no}, ${preset.page1.building_name}`;
      const calcs = calculateVatAndFee({
        annualRent: preset.page1.annual_rent,
        agencyFeePct: state.receiptParams.agency_fee_pct || 5,
      });
      state.receiptParams.rent_display = calcs.annualRentFormatted;
      state.receiptParams.agency_fee_display = calcs.agencyFeeFormatted;
      state.receiptParams.total_display = calcs.totalFormatted;
    },
    applySmartIngestion: (state, action) => {
      const extracted = action.payload;
      if (!extracted) return;
      Object.keys(extracted).forEach((k) => {
        if (state.page1[k] !== undefined && extracted[k]) {
          state.page1[k] = extracted[k];
        }
      });
    },
    setToolboxOption: (state, action) => {
      const { key, value } = action.payload;
      if (state.toolbox[key] !== undefined) {
        state.toolbox[key] = value;
      }
    },
    toggleToolboxModal: (state, action) => {
      state.toolbox.isToolboxOpen =
        action.payload !== undefined ? action.payload : !state.toolbox.isToolboxOpen;
    },
    updatePage1Field: (state, action) => {
      const { field, value } = action.payload;
      state.page1[field] = value;
      if (!state.addendumParams) state.addendumParams = {};
      if (!state.receiptParams) state.receiptParams = {};

      // Automatically sync relevant fields into Addendum and Receipt
      if (field === 'annual_rent' || field === 'contract_value') {
        const calcs = calculateVatAndFee({
          annualRent: value,
          agencyFeePct: state.receiptParams.agency_fee_pct || 5,
        });
        state.receiptParams.rent_display = calcs.annualRentFormatted;
        state.receiptParams.agency_fee_display = calcs.agencyFeeFormatted;
        state.receiptParams.total_display = calcs.totalFormatted;
        state.addendumParams.gross_annual_rent = `${value} AED`;

        const dep = calculateSecurityDeposit({
          annualRent: value,
          isFurnished: state.isFurnished,
        });
        state.page1.security_deposit = dep.amountFormatted;
        state.addendumParams.refundable_security_deposit = dep.amountFormatted;
      }
      if (field === 'tenant_name') {
        state.addendumParams.tenant_name = value;
        state.receiptParams.tenant_name = value;
      }
      if (field === 'owner_name' || field === 'lessor_name') {
        state.addendumParams.landlord_name = value;
      }
      if (field === 'building_name' || field === 'property_no') {
        state.receiptParams.property_summary = `Property: ${state.page1.property_no}, ${state.page1.building_name}`;
        state.addendumParams.property_address = `${state.page1.property_no}, ${state.page1.building_name}, ${state.page1.location}`;
      }
      if (field === 'date_from') {
        state.addendumParams.tenancy_commencement = value;
      }
      if (field === 'date_to') {
        state.addendumParams.tenancy_expiration = value;
      }
      if (field === 'security_deposit') {
        state.addendumParams.refundable_security_deposit = `${value} AED`;
      }
      if (field === 'mode_of_payment') {
        state.addendumParams.payment_frequency = value;
      }
      if (field === 'dewa_premises') {
        state.addendumParams.dewa_premises_no = value;
      }
    },
    updatePage3Clause: (state, action) => {
      const { lineKey, value } = action.payload;
      state.page3[lineKey] = value;
    },
    updateAddendumParam: (state, action) => {
      const { key, value } = action.payload;
      state.addendumParams[key] = value;
    },
    updateReceiptParam: (state, action) => {
      const { key, value } = action.payload;
      state.receiptParams[key] = value;

      if (key === 'agency_fee_pct') {
        const calcs = calculateVatAndFee({
          annualRent: state.page1.annual_rent,
          agencyFeePct: value,
        });
        state.receiptParams.agency_fee_display = calcs.agencyFeeFormatted;
        state.receiptParams.total_display = calcs.totalFormatted;
      }
    },
    updateFieldCoordinate: (state, action) => {
      const { page, fieldKey, x, y } = action.payload;
      const targetPage = `page${page}`;
      if (state.coordinates[targetPage] && state.coordinates[targetPage][fieldKey]) {
        // Record undo history (cap at 20 past snapshots)
        state.history.past.push(JSON.stringify(state.coordinates));
        if (state.history.past.length > 20) state.history.past.shift();
        state.history.future = [];

        let finalX = Math.round(x * 10) / 10;
        let finalY = Math.round(y * 10) / 10;

        // Snap to grid if active
        if (state.snapToGrid && state.gridSize > 1) {
          finalX = Math.round(finalX / state.gridSize) * state.gridSize;
          finalY = Math.round(finalY / state.gridSize) * state.gridSize;
        }

        state.coordinates[targetPage][fieldKey].x = finalX;
        state.coordinates[targetPage][fieldKey].y = finalY;

        // Persist to localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_COORDINATES_KEY, JSON.stringify(state.coordinates));
          }
        } catch (e) {
          console.warn('Failed to save coordinates to localStorage:', e);
        }
      }
    },
    nudgeFieldCoordinate: (state, action) => {
      const { page, fieldKey, dx, dy } = action.payload;
      const targetPage = `page${page}`;
      if (state.coordinates[targetPage] && state.coordinates[targetPage][fieldKey]) {
        state.history.past.push(JSON.stringify(state.coordinates));
        if (state.history.past.length > 20) state.history.past.shift();
        state.history.future = [];

        const item = state.coordinates[targetPage][fieldKey];
        item.x = Math.max(10, Math.min(580, item.x + dx));
        item.y = Math.max(10, Math.min(830, item.y + dy));

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(STORAGE_COORDINATES_KEY, JSON.stringify(state.coordinates));
          }
        } catch (e) {
          console.warn('Failed to save coordinates to localStorage:', e);
        }
      }
    },
    undoCoordinateChange: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop();
        state.history.future.push(JSON.stringify(state.coordinates));
        state.coordinates = JSON.parse(previous);
      }
    },
    redoCoordinateChange: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.pop();
        state.history.past.push(JSON.stringify(state.coordinates));
        state.coordinates = JSON.parse(next);
      }
    },
    resetCoordinatesToDefault: (state) => {
      state.history.past.push(JSON.stringify(state.coordinates));
      state.coordinates = DEFAULT_CONTRACT_MAPPER;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(STORAGE_COORDINATES_KEY);
        }
      } catch (e) {
        console.warn('Failed to clear coordinates from localStorage:', e);
      }
    },
    setGateConfirmed: (state, action) => {
      const { gate, value } = action.payload;
      if (state.confirmations[gate] !== undefined) {
        state.confirmations[gate] = value;
      }
    },
    setCompilingState: (state, action) => {
      state.confirmations.isCompiling = action.payload;
    },
    setCompiledPackageResult: (state, action) => {
      const { blobUrl, fileName } = action.payload;
      state.confirmations.lastCompiledBlobUrl = blobUrl;
      state.confirmations.lastFileName = fileName;
      state.confirmations.isCompiling = false;
    },
  },
});

export const {
  setCurrentStep,
  setActiveViewingPage,
  setZoom,
  setSelectedFieldKey,
  toggleSnapToGrid,
  toggleCrosshairs,
  setChequeCount,
  setIsFurnished,
  applyDealPreset,
  applySmartIngestion,
  undoCoordinateChange,
  redoCoordinateChange,
  setToolboxOption,
  toggleToolboxModal,
  updatePage1Field,
  updatePage3Clause,
  updateAddendumParam,
  updateReceiptParam,
  updateFieldCoordinate,
  nudgeFieldCoordinate,
  resetCoordinatesToDefault,
  setGateConfirmed,
  setCompilingState,
  setCompiledPackageResult,
} = tenancyStudioSlice.actions;

export default tenancyStudioSlice.reducer;
