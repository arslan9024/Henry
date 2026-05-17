/**
 * templates.rendering.test.jsx
 * Smoke-tests all 9 template JSX files — verifies they render without throwing
 * and that key content from the Redux document/policyMeta/henry store appears.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import BookingFormTemplate from '../../src/templates/BookingFormTemplate';
import GovtEmployeeBookingTemplate from '../../src/templates/GovtEmployeeBookingTemplate';
import InvoiceTemplate from '../../src/templates/InvoiceTemplate';
import OfferLetterTemplate from '../../src/templates/OfferLetterTemplate';
import SalaryCertificateTemplate from '../../src/templates/SalaryCertificateTemplate';
import KeyHandoverMaintenanceTemplate from '../../src/templates/KeyHandoverMaintenanceTemplate';
import AddendumTemplate from '../../src/templates/AddendumTemplate';
import TenancyContractTemplate from '../../src/templates/TenancyContractTemplate';
import ViewingFormTemplate from '../../src/templates/ViewingFormTemplate';

import documentReducer from '../../src/store/documentSlice';
import templateReducer from '../../src/store/templateSlice';
import policyMetaReducer from '../../src/store/policyMetaSlice';
import henryReducer from '../../src/store/henrySlice';
import complianceReducer from '../../src/store/complianceSlice';
import sidebarReducer from '../../src/store/sidebarSlice';

// ── store factory ─────────────────────────────────────────────────────────────

const makeStore = (templateKey = 'booking') =>
  configureStore({
    reducer: {
      document: documentReducer,
      template: templateReducer,
      policyMeta: policyMetaReducer,
      henry: henryReducer,
      compliance: complianceReducer,
      sidebar: sidebarReducer,
    },
    preloadedState: {
      template: { activeTemplate: templateKey },
    },
  });

const wrap = (Component, templateKey = 'booking') => {
  const store = makeStore(templateKey);
  return render(
    <Provider store={store}>
      <Component />
    </Provider>,
  );
};

// ── BookingFormTemplate ───────────────────────────────────────────────────────

describe('BookingFormTemplate', () => {
  it('renders without crashing', () => {
    wrap(BookingFormTemplate, 'booking');
  });

  it('shows "BOOKING FORM" heading', () => {
    wrap(BookingFormTemplate, 'booking');
    expect(screen.getByText('BOOKING FORM')).toBeDefined();
  });

  it('shows "STANDARD LEASING BOOKING PDF" badge', () => {
    wrap(BookingFormTemplate, 'booking');
    expect(screen.getByText('STANDARD LEASING BOOKING PDF')).toBeDefined();
  });

  it('renders the company name', () => {
    wrap(BookingFormTemplate, 'booking');
    expect(screen.getAllByText(/White Caves Real Estate/i).length).toBeGreaterThan(0);
  });

  it('renders Property Specifications section title', () => {
    wrap(BookingFormTemplate, 'booking');
    expect(screen.getByText(/Property Specifications/i)).toBeDefined();
  });
});

// ── GovtEmployeeBookingTemplate ───────────────────────────────────────────────

describe('GovtEmployeeBookingTemplate', () => {
  it('renders without crashing', () => {
    wrap(GovtEmployeeBookingTemplate, 'govt');
  });

  it('shows "Government Office Leasing Quotation" title', () => {
    wrap(GovtEmployeeBookingTemplate, 'govt');
    expect(screen.getAllByText(/Government Office Leasing Quotation/i).length).toBeGreaterThan(0);
  });

  it('shows GOVERNMENT OFFICE badge', () => {
    wrap(GovtEmployeeBookingTemplate, 'govt');
    expect(screen.getByText(/GOVERNMENT OFFICE LEASING QUOTATION PDF/i)).toBeDefined();
  });

  it('renders the payment clause section', () => {
    wrap(GovtEmployeeBookingTemplate, 'govt');
    expect(screen.getByText(/Government.*Military Payment Clause/i)).toBeDefined();
  });
});

// ── InvoiceTemplate ───────────────────────────────────────────────────────────

describe('InvoiceTemplate', () => {
  it('renders without crashing', () => {
    wrap(InvoiceTemplate, 'invoice');
  });

  it('shows "Invoice" title', () => {
    wrap(InvoiceTemplate, 'invoice');
    expect(screen.getByText('Invoice')).toBeDefined();
  });

  it('renders the Charges section', () => {
    wrap(InvoiceTemplate, 'invoice');
    expect(screen.getByText('Charges')).toBeDefined();
  });

  it('renders Agency Fee row in the charges table', () => {
    wrap(InvoiceTemplate, 'invoice');
    expect(screen.getByText('Agency Fee')).toBeDefined();
  });

  it('renders Ejari Registration Fee row', () => {
    wrap(InvoiceTemplate, 'invoice');
    expect(screen.getByText('Ejari Registration Fee')).toBeDefined();
  });

  it('renders Total Due row', () => {
    wrap(InvoiceTemplate, 'invoice');
    expect(screen.getByText('Total Due')).toBeDefined();
  });
});

// ── OfferLetterTemplate ───────────────────────────────────────────────────────

describe('OfferLetterTemplate', () => {
  it('renders without crashing', () => {
    wrap(OfferLetterTemplate, 'offer');
  });

  it('shows "PROPERTY OFFER LETTER" heading', () => {
    wrap(OfferLetterTemplate, 'offer');
    expect(screen.getByText('PROPERTY OFFER LETTER')).toBeDefined();
  });

  it('shows BUYING OFFER badge', () => {
    wrap(OfferLetterTemplate, 'offer');
    expect(screen.getByText(/BUYING OFFER/i)).toBeDefined();
  });

  it('renders Buyer Information section', () => {
    wrap(OfferLetterTemplate, 'offer');
    expect(screen.getByText('Buyer Information')).toBeDefined();
  });
});

// ── SalaryCertificateTemplate ─────────────────────────────────────────────────

describe('SalaryCertificateTemplate', () => {
  it('renders without crashing', () => {
    wrap(SalaryCertificateTemplate, 'salaryCertificate');
  });

  it('shows "Salary Certificate" document title', () => {
    wrap(SalaryCertificateTemplate, 'salaryCertificate');
    expect(screen.getAllByText(/Salary Certificate/i).length).toBeGreaterThan(0);
  });

  it('renders WHITE CAVES REAL ESTATE LLC letterhead', () => {
    wrap(SalaryCertificateTemplate, 'salaryCertificate');
    expect(screen.getAllByText(/WHITE CAVES REAL ESTATE/i).length).toBeGreaterThan(0);
  });
});

// ── KeyHandoverMaintenanceTemplate ────────────────────────────────────────────

describe('KeyHandoverMaintenanceTemplate', () => {
  it('renders without crashing', () => {
    wrap(KeyHandoverMaintenanceTemplate, 'keyHandover');
  });

  it('shows "Key Handover & Maintenance Confirmation" title', () => {
    wrap(KeyHandoverMaintenanceTemplate, 'keyHandover');
    expect(screen.getAllByText(/Key Handover.*Maintenance Confirmation/i).length).toBeGreaterThan(0);
  });

  it('renders WHITE CAVES REAL ESTATE LLC company header', () => {
    wrap(KeyHandoverMaintenanceTemplate, 'keyHandover');
    expect(screen.getByText(/WHITE CAVES REAL ESTATE LLC/i)).toBeDefined();
  });
});

// ── AddendumTemplate ──────────────────────────────────────────────────────────

describe('AddendumTemplate', () => {
  it('renders without crashing', () => {
    wrap(AddendumTemplate, 'addendum');
  });

  it('shows "Addendum" or "ADDENDUM" text in the document', () => {
    wrap(AddendumTemplate, 'addendum');
    // Title could be in TemplateLayout h2 or in the template body
    const allText = document.body.innerText || document.body.textContent;
    expect(allText.toLowerCase()).toContain('addendum');
  });
});

// ── TenancyContractTemplate ───────────────────────────────────────────────────

describe('TenancyContractTemplate', () => {
  it('renders without crashing', () => {
    wrap(TenancyContractTemplate, 'tenancy');
  });

  it('shows "Tenancy Contract" or related text', () => {
    wrap(TenancyContractTemplate, 'tenancy');
    const allText = document.body.innerText || document.body.textContent;
    expect(allText.toLowerCase()).toContain('tenancy');
  });
});

// ── ViewingFormTemplate ───────────────────────────────────────────────────────

describe('ViewingFormTemplate', () => {
  it('renders without crashing', () => {
    wrap(ViewingFormTemplate, 'viewing');
  });

  it('shows "Viewing" text in document', () => {
    wrap(ViewingFormTemplate, 'viewing');
    const allText = document.body.innerText || document.body.textContent;
    expect(allText.toLowerCase()).toContain('viewing');
  });

  it('renders a form (useDocumentForm integration)', () => {
    const { container } = wrap(ViewingFormTemplate, 'viewing');
    // ViewingFormTemplate has form fields via useDocumentForm
    expect(container.querySelectorAll('input, textarea, select').length).toBeGreaterThan(0);
  });
});
