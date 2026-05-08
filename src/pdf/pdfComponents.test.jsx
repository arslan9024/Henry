/**
 * pdfComponents.test.jsx
 * Smoke-tests all 6 @react-pdf/renderer JSX components.
 * @react-pdf/renderer is mocked entirely — we test that each component
 * exports a function, accepts props without throwing, and renders a PDF
 * root element (Document) in the mocked output.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// ── mock @react-pdf/renderer ──────────────────────────────────────────────────

vi.mock('@react-pdf/renderer', () => {
  const mock =
    (name) =>
    // eslint-disable-next-line react/display-name
    ({ children, ...props }) => (
      <div data-pdf-el={name} {...(props.style ? {} : {})} data-testid={name}>
        {children}
      </div>
    );
  return {
    Document: mock('Document'),
    Page: mock('Page'),
    Text: mock('Text'),
    View: mock('View'),
    Image: mock('Image'),
    StyleSheet: { create: (styles) => styles },
    Font: { register: vi.fn() },
    pdf: vi.fn(),
    PDFViewer: mock('PDFViewer'),
    PDFDownloadLink: mock('PDFDownloadLink'),
  };
});

// ── mock dateUtils so components don't fail on empty dates ────────────────────

vi.mock('../compliance/utils/dateUtils', () => ({
  formatDateDisplay: (d) => (d ? String(d) : ''),
  formatCurrency: (n) => String(n ?? 0),
}));

// ── mock pdfHelpers ───────────────────────────────────────────────────────────

vi.mock('./pdfHelpers', () => ({
  getPublicAsset: vi.fn().mockReturnValue('/logo.png'),
  formatCurrency: vi.fn((n) => String(n ?? 0)),
  formatDate: vi.fn((d) => d || ''),
}));

// ── imports after mocks ───────────────────────────────────────────────────────

import AddendumPDF from './AddendumPDF';
import EjariPDF from './EjariPDF';
import KeyHandoverPDF from './KeyHandoverPDF';
import QuotationPDF from './QuotationPDF';
import SalaryCertificatePDF from './SalaryCertificatePDF';
import ViewingAgreementPDF from './ViewingAgreementPDF';

// ── shared document props fixture ─────────────────────────────────────────────

const DOC = {
  company: { name: 'White Caves Real Estate L.L.C', dedLicense: '1388443', role: 'Agent', city: 'Dubai' },
  property: {
    referenceNo: 'REF/001',
    documentDate: '2026-05-07',
    unit: 'Unit 449',
    cluster: 'Avencia-2',
    community: 'Damac Hills 2',
    city: 'Dubai',
    description: '4BR Townhouse',
    size: '2,200 sqft',
    parking: '2',
    condition: 'Vacant',
    usage: 'Residential',
    plotNo: '',
    makaniNo: '',
    dewaPremisesNo: '',
    projectName: 'Damac Hills 2',
    buildingNumber: '',
    ownersAssociationNo: '',
  },
  tenant: {
    fullName: 'Ahmed Al Mansouri',
    contactNo: '+971501234567',
    email: 'ahmed@example.com',
    emiratesId: '784-1990-1234567-1',
    passportNo: 'A12345678',
    nationality: 'UAE',
    passportExpiry: '2030-01-01',
    visaStatus: 'Resident',
    currentAddress: 'Dubai',
    occupation: 'Engineer',
  },
  landlord: {
    name: 'Mohammed Al Rashid',
    phone: '+971509876543',
    email: 'landlord@example.com',
    emiratesId: '784-1985-9876543-1',
  },
  broker: {
    brokerName: 'Sarah Hassan',
    companyName: 'White Caves',
    orn: 'ORN-001',
    brn: 'BRN-001',
    email: 'broker@example.com',
  },
  payments: {
    annualRent: 85000,
    securityDeposit: 8500,
    agencyFee: 4250,
    total: 93765,
    moveInDate: '2026-06-01',
    contractStartDate: '2026-06-01',
    contractEndDate: '2027-05-31',
    modeOfPayment: '4 Cheques',
    numberOfCheques: '4',
    ejariFee: 220,
    renewalCharges: 1050,
  },
  addendum: { originalContractRef: 'REF/001', effectiveDate: '2026-05-07', clauses: [] },
  viewing: { viewingDate: '2026-05-10', viewingTime: '10:00 AM' },
  keyHandover: {
    unitNumber: 'Unit 449',
    communityName: 'Damac Hills 2',
    keyHandoverDate: '2026-06-01',
    tenantName: 'Ahmed Al Mansouri',
    landlordName: 'Mohammed Al Rashid',
    noOfKeys: '3',
    noOfAccessCards: '2',
    noOfParkingCards: '2',
    otherItems: '',
    maintenanceContact: '',
    agentName: 'Sarah Hassan',
    agentContact: '+971501234567',
  },
  salaryCertificate: {
    employeeName: 'Ahmed Al Mansouri',
    employeeTitle: 'Engineer',
    department: 'Technical',
    employeeId: 'EMP-001',
    joiningDate: '2024-01-01',
    monthlySalary: 15000,
    currency: 'AED',
    issuedFor: 'Bank loan',
    recipientName: '',
    recipientOrg: '',
  },
  tenancy: { additionalTerms: [], specialConditions: '' },
  renewal: {
    currentRent: 85000,
    proposedRent: 85000,
    marketRent: 90000,
    renewalDate: '',
    noticeSentDate: '',
    noticeChannel: 'not-set',
  },
  occupancy: {
    isSharedHousing: false,
    sharedHousingPermitNumber: '',
    ejariOccupantsRegistered: false,
    occupants: '',
  },
  eviction: { reason: 'none', noticeDate: '', noticeMethod: 'notarized' },
};

// ── AddendumPDF ───────────────────────────────────────────────────────────────

describe('AddendumPDF', () => {
  it('exports a function', () => {
    expect(typeof AddendumPDF).toBe('function');
  });

  it('renders without throwing', () => {
    expect(() => render(<AddendumPDF documentData={DOC} />)).not.toThrow();
  });

  it('renders a Document root element', () => {
    const { getByTestId } = render(<AddendumPDF documentData={DOC} />);
    expect(getByTestId('Document')).toBeDefined();
  });
});

// ── EjariPDF ──────────────────────────────────────────────────────────────────

describe('EjariPDF', () => {
  it('exports a function', () => {
    expect(typeof EjariPDF).toBe('function');
  });

  it('renders without throwing', () => {
    expect(() => render(<EjariPDF documentData={DOC} />)).not.toThrow();
  });

  it('renders a Document root element', () => {
    const { getByTestId } = render(<EjariPDF documentData={DOC} />);
    expect(getByTestId('Document')).toBeDefined();
  });
});

// ── KeyHandoverPDF ────────────────────────────────────────────────────────────

describe('KeyHandoverPDF', () => {
  it('exports a function', () => {
    expect(typeof KeyHandoverPDF).toBe('function');
  });

  it('renders without throwing', () => {
    expect(() => render(<KeyHandoverPDF documentData={DOC} />)).not.toThrow();
  });

  it('renders a Document root element', () => {
    const { getByTestId } = render(<KeyHandoverPDF documentData={DOC} />);
    expect(getByTestId('Document')).toBeDefined();
  });
});

// ── QuotationPDF ──────────────────────────────────────────────────────────────

describe('QuotationPDF', () => {
  it('exports a function', () => {
    expect(typeof QuotationPDF).toBe('function');
  });

  it('renders without throwing', () => {
    expect(() => render(<QuotationPDF documentData={DOC} templateKey="booking" />)).not.toThrow();
  });

  it('renders a Document root element', () => {
    const { getByTestId } = render(<QuotationPDF documentData={DOC} templateKey="booking" />);
    expect(getByTestId('Document')).toBeDefined();
  });
});

// ── SalaryCertificatePDF ──────────────────────────────────────────────────────

describe('SalaryCertificatePDF', () => {
  it('exports a function', () => {
    expect(typeof SalaryCertificatePDF).toBe('function');
  });

  it('renders without throwing', () => {
    expect(() => render(<SalaryCertificatePDF documentData={DOC} />)).not.toThrow();
  });

  it('renders a Document root element', () => {
    const { getByTestId } = render(<SalaryCertificatePDF documentData={DOC} />);
    expect(getByTestId('Document')).toBeDefined();
  });
});

// ── ViewingAgreementPDF ───────────────────────────────────────────────────────

describe('ViewingAgreementPDF', () => {
  it('exports a function', () => {
    expect(typeof ViewingAgreementPDF).toBe('function');
  });

  it('renders without throwing', () => {
    expect(() => render(<ViewingAgreementPDF documentData={DOC} />)).not.toThrow();
  });

  it('renders a Document root element', () => {
    const { getByTestId } = render(<ViewingAgreementPDF documentData={DOC} />);
    expect(getByTestId('Document')).toBeDefined();
  });
});
