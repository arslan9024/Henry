/**
 * generateQuotationPdf — unit tests
 *
 * @react-pdf/renderer is mocked so tests run in jsdom without a canvas.
 *
 * Covers:
 *   pickPdfComponent routing (via generateQuotationPdfBlob) — all 6 keys + unknown
 *   generateQuotationPdfBlob — returns blob, throws for unknown template
 *   downloadQuotationPdf     — creates anchor, sets download attr, clicks, revokes URL
 *   downloadBlankTemplate    — same mechanic for blank template download
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── mock @react-pdf/renderer ──────────────────────────────────────────────────
// pdf() returns an instance with a toBlob() that resolves to a Blob.
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn().mockResolvedValue(new Blob(['%PDF-stub'], { type: 'application/pdf' })),
  })),
}));

// ── mock PDF components (thin stubs — we only care which one is selected) ─────
vi.mock('./QuotationPDF', () => ({
  default: function QuotationPDF() {
    return null;
  },
}));
vi.mock('./EjariPDF', () => ({
  default: function EjariPDF() {
    return null;
  },
}));
vi.mock('./ViewingAgreementPDF', () => ({
  default: function ViewingAgreementPDF() {
    return null;
  },
}));
vi.mock('./AddendumPDF', () => ({
  default: function AddendumPDF() {
    return null;
  },
}));
vi.mock('./SalaryCertificatePDF', () => ({
  default: function SalaryCertificatePDF() {
    return null;
  },
}));
vi.mock('./KeyHandoverPDF', () => ({
  default: function KeyHandoverPDF() {
    return null;
  },
}));
vi.mock('./InvoiceDocument', () => ({
  default: function InvoiceDocument() {
    return null;
  },
}));

// We let pdfHelpers run for real (pure string functions) — no mock needed.

import { pdf } from '@react-pdf/renderer';
import QuotationPDF from './QuotationPDF';
import EjariPDF from './EjariPDF';
import ViewingAgreementPDF from './ViewingAgreementPDF';
import AddendumPDF from './AddendumPDF';
import SalaryCertificatePDF from './SalaryCertificatePDF';
import KeyHandoverPDF from './KeyHandoverPDF';
import InvoiceDocument from './InvoiceDocument';
import {
  generateQuotationPdfBlob,
  downloadQuotationPdf,
  downloadBlankTemplate,
} from './generateQuotationPdf';

// ── DOM helpers ───────────────────────────────────────────────────────────────
const stubUrl = () => {
  URL.createObjectURL = vi.fn(() => 'blob:stub-url');
  URL.revokeObjectURL = vi.fn();
};
const cleanUrl = () => {
  delete URL.createObjectURL;
  delete URL.revokeObjectURL;
};

let anchorMock;
beforeEach(() => {
  stubUrl();
  anchorMock = { href: '', download: '', click: vi.fn() };
  vi.spyOn(document, 'createElement').mockImplementation((tag) =>
    tag === 'a' ? anchorMock : (document.createElement.wrappedMethod?.(tag) ?? {}),
  );
});
afterEach(() => {
  cleanUrl();
  vi.restoreAllMocks();
  pdf.mockClear();
});

// ── generateQuotationPdfBlob — component routing ──────────────────────────────

describe('generateQuotationPdfBlob — pickPdfComponent routing', () => {
  const docData = {};

  it('uses QuotationPDF for "booking"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'booking' });
    const [element] = pdf.mock.calls[0];
    expect(element.type).toBe(QuotationPDF);
  });

  it('uses QuotationPDF for "bookingGov"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'bookingGov' });
    const [element] = pdf.mock.calls[0];
    expect(element.type).toBe(QuotationPDF);
  });

  it('uses EjariPDF for "tenancy"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'tenancy' });
    expect(pdf.mock.calls[0][0].type).toBe(EjariPDF);
  });

  it('uses ViewingAgreementPDF for "viewing"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'viewing' });
    expect(pdf.mock.calls[0][0].type).toBe(ViewingAgreementPDF);
  });

  it('uses AddendumPDF for "addendum"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'addendum' });
    expect(pdf.mock.calls[0][0].type).toBe(AddendumPDF);
  });

  it('uses SalaryCertificatePDF for "salaryCertificate"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'salaryCertificate' });
    expect(pdf.mock.calls[0][0].type).toBe(SalaryCertificatePDF);
  });

  it('uses KeyHandoverPDF for "keyHandover"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'keyHandover' });
    expect(pdf.mock.calls[0][0].type).toBe(KeyHandoverPDF);
  });

  it('uses InvoiceDocument for "invoice"', async () => {
    await generateQuotationPdfBlob({ documentData: docData, templateKey: 'invoice' });
    expect(pdf.mock.calls[0][0].type).toBe(InvoiceDocument);
  });

  it('throws for an unknown template key', async () => {
    await expect(generateQuotationPdfBlob({ documentData: docData, templateKey: 'offer' })).rejects.toThrow(
      /no dedicated pdf renderer/i,
    );
  });

  it('returns a Blob when the template is known', async () => {
    const blob = await generateQuotationPdfBlob({ documentData: docData, templateKey: 'booking' });
    expect(blob).toBeInstanceOf(Blob);
  });

  it('passes documentData and templateKey as props to the component element', async () => {
    const data = { property: { unit: '101' } };
    await generateQuotationPdfBlob({ documentData: data, templateKey: 'viewing' });
    const elem = pdf.mock.calls[0][0];
    expect(elem.props.documentData).toBe(data);
    expect(elem.props.templateKey).toBe('viewing');
  });
});

// ── downloadQuotationPdf ──────────────────────────────────────────────────────

describe('downloadQuotationPdf', () => {
  it('creates an anchor element, sets download filename, and clicks it', async () => {
    await downloadQuotationPdf({
      documentData: {},
      templateKey: 'booking',
      createdAt: '2026-05-07',
      copyNumber: 1,
    });
    expect(anchorMock.href).toBe('blob:stub-url');
    expect(anchorMock.download).toBeTruthy();
    expect(anchorMock.click).toHaveBeenCalledOnce();
  });

  it('revokes the object URL after download', async () => {
    await downloadQuotationPdf({ documentData: {}, templateKey: 'booking' });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:stub-url');
  });

  it('returns { blob, fileName }', async () => {
    const result = await downloadQuotationPdf({ documentData: {}, templateKey: 'tenancy' });
    expect(result.blob).toBeInstanceOf(Blob);
    expect(typeof result.fileName).toBe('string');
    expect(result.fileName.length).toBeGreaterThan(0);
  });

  it('fileName includes the template family name', async () => {
    const { fileName } = await downloadQuotationPdf({ documentData: {}, templateKey: 'viewing' });
    expect(fileName.toLowerCase()).toMatch(/viewing|rera/i);
  });
});

// ── downloadBlankTemplate ─────────────────────────────────────────────────────

describe('downloadBlankTemplate', () => {
  it('throws for an unknown template key', async () => {
    await expect(downloadBlankTemplate('offer')).rejects.toThrow(/no pdf renderer/i);
  });

  it('creates and clicks an anchor element for a known template', async () => {
    await downloadBlankTemplate('viewing');
    expect(anchorMock.click).toHaveBeenCalledOnce();
  });

  it('download filename starts with BLANK_', async () => {
    await downloadBlankTemplate('tenancy');
    expect(anchorMock.download).toMatch(/^BLANK_/);
  });

  it('revokes the blob URL after download', async () => {
    await downloadBlankTemplate('booking');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:stub-url');
  });

  it('uses blank data (no tenant / property details) when generating the PDF', async () => {
    pdf.mockClear();
    await downloadBlankTemplate('addendum');
    const elem = pdf.mock.calls[0][0];
    // Blank document data should have empty tenant fields
    expect(elem.props.documentData.tenant?.fullName).toBe('');
    expect(elem.props.documentData.property?.referenceNo).toBe('');
  });
});
