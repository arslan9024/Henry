/**
 * fileExtractionService.test.js
 * Tests for extractTextFromFile and SUPPORTED_FILE_ACCEPT.
 *
 * Dynamic imports (pdfjs-dist, tesseract.js) are mocked at the module level
 * via vi.hoisted + vi.mock so vitest intercepts them before the module loads.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── hoist mock refs so they are available in vi.mock factories ────────────────
const { mockGetDocument, mockCreateWorker } = vi.hoisted(() => ({
  mockGetDocument: vi.fn(),
  mockCreateWorker: vi.fn(),
}));

vi.mock('pdfjs-dist', () => ({
  // workerSrc is truthy → service skips the ?url import entirely
  GlobalWorkerOptions: { workerSrc: 'fake-worker.js' },
  getDocument: mockGetDocument,
}));

vi.mock('tesseract.js', () => ({
  createWorker: mockCreateWorker,
}));

import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from './fileExtractionService';

// ── helpers ───────────────────────────────────────────────────────────────────

const makePdfFile = (overrides = {}) => ({
  type: 'application/pdf',
  name: 'test.pdf',
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  ...overrides,
});

const makeImageFile = (overrides = {}) => ({
  type: 'image/png',
  name: 'test.png',
  ...overrides,
});

// Use empty type so the service falls through to the name-based check,
// making it straightforward to assert the reason contains 'docx'.
const makeUnsupportedFile = () => ({
  type: '',
  name: 'document.docx',
});

/** Build a mock pdf object with n pages, each returning the given items */
const buildMockPdf = (numPages = 1, items = [{ str: 'Hello', transform: [1, 0, 0, 1, 0, 700] }]) => {
  const mockPage = {
    getTextContent: vi.fn().mockResolvedValue({ items }),
  };
  return {
    numPages,
    getPage: vi.fn().mockResolvedValue(mockPage),
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── SUPPORTED_FILE_ACCEPT ─────────────────────────────────────────────────────

describe('SUPPORTED_FILE_ACCEPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SUPPORTED_FILE_ACCEPT).toBe('string');
    expect(SUPPORTED_FILE_ACCEPT.length).toBeGreaterThan(0);
  });

  it('includes application/pdf', () => {
    expect(SUPPORTED_FILE_ACCEPT).toContain('application/pdf');
  });

  it('includes image/png', () => {
    expect(SUPPORTED_FILE_ACCEPT).toContain('image/png');
  });

  it('includes image/jpeg', () => {
    expect(SUPPORTED_FILE_ACCEPT).toContain('image/jpeg');
  });
});

// ── no file / unsupported type ────────────────────────────────────────────────

describe('extractTextFromFile — null / unsupported input', () => {
  it('returns ok=false when file is null', async () => {
    const result = await extractTextFromFile(null);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/no file/i);
  });

  it('returns ok=false when file is undefined', async () => {
    const result = await extractTextFromFile(undefined);
    expect(result.ok).toBe(false);
  });

  it('returns ok=false for unsupported MIME type', async () => {
    const result = await extractTextFromFile(makeUnsupportedFile());
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/unsupported/i);
  });

  it('reason for unsupported type includes the file type', async () => {
    const result = await extractTextFromFile(makeUnsupportedFile());
    expect(result.reason).toContain('docx');
  });
});

// ── PDF extraction ────────────────────────────────────────────────────────────

describe('extractTextFromFile — PDF path', () => {
  it('returns ok=true and kind="pdf" for a PDF file', async () => {
    const mockPdf = buildMockPdf(1);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.ok).toBe(true);
    expect(result.kind).toBe('pdf');
  });

  it('includes extracted text in result', async () => {
    const mockPdf = buildMockPdf(1, [{ str: 'Contract Text', transform: [1, 0, 0, 1, 0, 700] }]);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.text).toContain('Contract Text');
  });

  it('reports pageCount as number of pages processed', async () => {
    const mockPdf = buildMockPdf(3);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.pageCount).toBe(3);
  });

  it('reports totalPages from the PDF', async () => {
    const mockPdf = buildMockPdf(2);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.totalPages).toBe(2);
  });

  it('includes a durationMs number', async () => {
    const mockPdf = buildMockPdf(1);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(typeof result.durationMs).toBe('number');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('caps pageCount at MAX_PDF_PAGES (25) for large PDFs', async () => {
    const mockPdf = buildMockPdf(30); // 30 pages → capped at 25
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.pageCount).toBe(25);
    expect(result.totalPages).toBe(30);
    expect(result.pagesTruncated).toBe(true);
  });

  it('pagesTruncated=false when pages <= 25', async () => {
    const mockPdf = buildMockPdf(5);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.pagesTruncated).toBe(false);
  });

  it('joins items on the same y-coordinate into a single line', async () => {
    const items = [
      { str: 'First', transform: [1, 0, 0, 1, 0, 700] },
      { str: ' Second', transform: [1, 0, 0, 1, 50, 700] }, // same y=700
    ];
    const mockPdf = buildMockPdf(1, items);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.text).toContain('First');
    expect(result.text).toContain('Second');
  });

  it('calls arrayBuffer() on the file', async () => {
    const mockPdf = buildMockPdf(1);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });
    const file = makePdfFile();

    await extractTextFromFile(file);
    expect(file.arrayBuffer).toHaveBeenCalledOnce();
  });

  it('also accepts PDF identified by .pdf extension with empty MIME', async () => {
    const mockPdf = buildMockPdf(1);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const file = { type: '', name: 'report.pdf', arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) };
    const result = await extractTextFromFile(file);
    expect(result.ok).toBe(true);
    expect(result.kind).toBe('pdf');
  });

  it('charsTruncated=false for text under 50 000 chars', async () => {
    const mockPdf = buildMockPdf(1, [{ str: 'Short text', transform: [1, 0, 0, 1, 0, 700] }]);
    mockGetDocument.mockReturnValue({ promise: Promise.resolve(mockPdf) });

    const result = await extractTextFromFile(makePdfFile());
    expect(result.charsTruncated).toBe(false);
  });
});

// ── Image extraction ──────────────────────────────────────────────────────────

describe('extractTextFromFile — image path', () => {
  it('returns ok=true and kind="image" for a PNG file', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: 'Scanned Text\n' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    const result = await extractTextFromFile(makeImageFile());
    expect(result.ok).toBe(true);
    expect(result.kind).toBe('image');
  });

  it('trims the OCR text', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: '  Emirates ID  \n' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    const result = await extractTextFromFile(makeImageFile());
    expect(result.text).toBe('Emirates ID');
  });

  it('returns empty string for blank OCR result', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: '' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    const result = await extractTextFromFile(makeImageFile());
    expect(result.ok).toBe(true);
    expect(result.text).toBe('');
  });

  it('strips null bytes from OCR output', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: 'Hello\u0000World' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    const result = await extractTextFromFile(makeImageFile());
    expect(result.text).not.toContain('\u0000');
    expect(result.text).toContain('HelloWorld');
  });

  it('always calls worker.terminate()', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: 'text' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    await extractTextFromFile(makeImageFile());
    expect(mockWorker.terminate).toHaveBeenCalledOnce();
  });

  it('includes a durationMs number', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: 'text' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    const result = await extractTextFromFile(makeImageFile());
    expect(typeof result.durationMs).toBe('number');
  });

  it('accepts JPEG by extension with empty MIME', async () => {
    const mockWorker = {
      recognize: vi.fn().mockResolvedValue({ data: { text: 'Photo text' } }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockCreateWorker.mockResolvedValue(mockWorker);

    const file = { type: '', name: 'scan.jpg' };
    const result = await extractTextFromFile(file);
    expect(result.ok).toBe(true);
    expect(result.kind).toBe('image');
  });
});
