/**
 * generateSIFFile.test.js
 * Unit tests for WPS SIF file generation utilities.
 * Exported functions: calculateSCRSummary, generateSIFContent,
 * generateSIFFilename, generateTXTVerification,
 * downloadSIFFile, downloadTXTFile, generateAndDownloadSIFFile
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateSCRSummary,
  generateSIFContent,
  generateSIFFilename,
  generateTXTVerification,
  downloadSIFFile,
  downloadTXTFile,
  generateAndDownloadSIFFile,
} from './generateSIFFile';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const COMPANY = {
  employerOrgNo: '1234567890123',
  organizationName: 'White Caves Real Estate LLC',
  iban: 'AE030359356491705358002',
  routingCode: '033123456',
  accountNumber: '0359356491705358002',
  accountHolderName: 'Muhammad Naeem Khan',
  email: 'the.white.caves@gmail.com',
  phone: '+97143350592',
};

const EMPLOYEES = [
  {
    emiratesId: '784199012345678',
    fullName: 'Ahmed Al Mansouri',
    accountNumber: 'AE030359356491705358002',
    salary: 5000,
    allowance: 500,
  },
  {
    emiratesId: '784199087654321',
    fullName: 'Fatima Bint Hassan',
    accountNumber: 'AE030359356491705358003',
    salary: 7500,
    allowance: 1000,
  },
];

// ─── calculateSCRSummary ──────────────────────────────────────────────────────

describe('calculateSCRSummary', () => {
  it('counts total employees correctly', () => {
    const scr = calculateSCRSummary(EMPLOYEES, COMPANY);
    expect(scr.totalEmployees).toBe(2);
  });

  it('sums total salary across employees', () => {
    const scr = calculateSCRSummary(EMPLOYEES, COMPANY);
    expect(scr.totalSalary).toBe(12500); // 5000 + 7500
  });

  it('sums total allowance across employees', () => {
    const scr = calculateSCRSummary(EMPLOYEES, COMPANY);
    expect(scr.totalAllowance).toBe(1500); // 500 + 1000
  });

  it('calculates total as salary + allowance', () => {
    const scr = calculateSCRSummary(EMPLOYEES, COMPANY);
    expect(scr.total).toBe(14000); // 12500 + 1500
  });

  it('includes employerOrgNo from companyInfo', () => {
    const scr = calculateSCRSummary(EMPLOYEES, COMPANY);
    expect(scr.employerOrgNo).toBe(COMPANY.employerOrgNo);
  });

  it('computes checksum using correct formula', () => {
    const scr = calculateSCRSummary(EMPLOYEES, COMPANY);
    // checksum = (totalEmployees + Math.floor(totalSalary*100) + Math.floor(totalAllowance*100)) % 100000000
    const expected = (2 + Math.floor(12500 * 100) + Math.floor(1500 * 100)) % 100000000;
    expect(scr.checksum).toBe(expected);
  });

  it('handles employees with no allowance (defaults to 0)', () => {
    const noAllowance = [{ ...EMPLOYEES[0], allowance: undefined }];
    const scr = calculateSCRSummary(noAllowance, COMPANY);
    expect(scr.totalAllowance).toBe(0);
    expect(scr.total).toBe(5000);
  });

  it('handles empty employees array', () => {
    const scr = calculateSCRSummary([], COMPANY);
    expect(scr.totalEmployees).toBe(0);
    expect(scr.totalSalary).toBe(0);
    expect(scr.totalAllowance).toBe(0);
    expect(scr.total).toBe(0);
    expect(scr.checksum).toBe(0);
  });

  it('handles decimal salaries', () => {
    const decEmp = [{ ...EMPLOYEES[0], salary: 5500.5, allowance: 250.25 }];
    const scr = calculateSCRSummary(decEmp, COMPANY);
    expect(scr.totalSalary).toBeCloseTo(5500.5);
    expect(scr.totalAllowance).toBeCloseTo(250.25);
  });
});

// ─── generateSIFContent ───────────────────────────────────────────────────────

describe('generateSIFContent', () => {
  it('returns a string', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    expect(typeof content).toBe('string');
  });

  it('starts with FHR line', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const firstLine = content.split('\n')[0];
    expect(firstLine).toMatch(/^FHR,/);
  });

  it('FHR line includes employerOrgNo and WPS marker', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const fhr = content.split('\n')[0];
    expect(fhr).toContain(COMPANY.employerOrgNo);
    expect(fhr).toContain('WPS');
  });

  it('includes one EDR line per employee', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const edrLines = content.split('\n').filter((l) => l.startsWith('EDR,'));
    expect(edrLines).toHaveLength(EMPLOYEES.length);
  });

  it('EDR lines contain employee name and salary', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    expect(content).toContain('Ahmed Al Mansouri');
    expect(content).toContain('5000.00');
    expect(content).toContain('Fatima Bint Hassan');
    expect(content).toContain('7500.00');
  });

  it('EDR lines have sequence numbers starting from 000001', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const edrLines = content.split('\n').filter((l) => l.startsWith('EDR,'));
    expect(edrLines[0]).toContain('000001');
    expect(edrLines[1]).toContain('000002');
  });

  it('ends with SCR line', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const lastLine = content.split('\n').at(-1);
    expect(lastLine).toMatch(/^SCR,/);
  });

  it('SCR line contains total employee count', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const scrLine = content.split('\n').find((l) => l.startsWith('SCR,'));
    expect(scrLine).toContain('000002'); // 2 employees padded to 6
  });

  it('total line count is 1 (FHR) + N (EDR) + 1 (SCR)', () => {
    const content = generateSIFContent(EMPLOYEES, COMPANY);
    const lines = content.split('\n');
    expect(lines).toHaveLength(1 + EMPLOYEES.length + 1);
  });

  it('EDR total field is salary + allowance formatted to 2dp', () => {
    const content = generateSIFContent([EMPLOYEES[0]], COMPANY);
    // salary=5000, allowance=500, total=5500.00
    expect(content).toContain('5500.00');
  });
});

// ─── generateSIFFilename ─────────────────────────────────────────────────────

describe('generateSIFFilename', () => {
  it('returns a string ending with .SIF', () => {
    const name = generateSIFFilename('12345');
    expect(name).toMatch(/\.SIF$/);
  });

  it('pads employerOrgNo to 13 chars', () => {
    const name = generateSIFFilename('12345');
    const prefix = name.split('_')[0];
    expect(prefix).toHaveLength(13);
    expect(prefix).toBe('1234500000000');
  });

  it('truncates employerOrgNo to 13 chars if too long', () => {
    const name = generateSIFFilename('12345678901234567890');
    const prefix = name.split('_')[0];
    expect(prefix).toHaveLength(13);
  });

  it('uses provided timestamp for filename', () => {
    const ts = new Date('2026-05-07T10:30:00.000Z');
    const name = generateSIFFilename('12345', ts);
    // YYYYMMDDHHMMSS from 2026-05-07T10:30:00Z
    expect(name).toContain('20260507');
  });

  it('filename format is: PREFIX_YYYYMMDDHHMMSS.SIF', () => {
    const ts = new Date('2026-01-15T08:00:00.000Z');
    const name = generateSIFFilename('9999', ts);
    expect(name).toMatch(/^9999000000000_\d{14}\.SIF$/);
  });

  it('uses current time when no timestamp provided', () => {
    const before = new Date().toISOString().substring(0, 4); // year
    const name = generateSIFFilename('111');
    expect(name).toContain(before);
  });
});

// ─── generateTXTVerification ─────────────────────────────────────────────────

describe('generateTXTVerification', () => {
  const filename = 'TEST_FILE_20260507.SIF';

  it('returns a string', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(typeof txt).toBe('string');
  });

  it('contains WPS header banner', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain('WPS SALARY INFORMATION FILE');
  });

  it('contains filename reference', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain(filename);
  });

  it('contains employer org number', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain(COMPANY.employerOrgNo);
  });

  it('contains total employee count', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain(`Total Employees: ${EMPLOYEES.length}`);
  });

  it('contains total salary amount', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain('12500.00');
  });

  it('lists each employee name', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain('Ahmed Al Mansouri');
    expect(txt).toContain('Fatima Bint Hassan');
  });

  it('contains summary section header', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain('--- SUMMARY ---');
  });

  it('contains employee records section header', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain('--- EMPLOYEE RECORDS ---');
  });

  it('ends with END OF VERIFICATION REPORT', () => {
    const txt = generateTXTVerification(EMPLOYEES, COMPANY, filename);
    expect(txt).toContain('END OF VERIFICATION REPORT');
  });
});

// ─── downloadSIFFile / downloadTXTFile ───────────────────────────────────────

describe('downloadSIFFile', () => {
  let appendSpy, removeSpy, createSpy, revokeUrlSpy;

  beforeEach(() => {
    // jsdom does not ship URL.createObjectURL / revokeObjectURL — define them
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    const mockLink = { href: '', download: '', click: vi.fn() };
    createSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    revokeUrlSpy = URL.revokeObjectURL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it('creates an anchor element', () => {
    downloadSIFFile('SIF CONTENT', 'test.SIF');
    expect(createSpy).toHaveBeenCalledWith('a');
  });

  it('appends and removes the link element', () => {
    downloadSIFFile('SIF CONTENT', 'test.SIF');
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('calls revokeObjectURL to clean up', () => {
    downloadSIFFile('SIF CONTENT', 'test.SIF');
    expect(revokeUrlSpy).toHaveBeenCalledTimes(1);
  });
});

describe('downloadTXTFile', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it('triggers browser download for TXT content', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    downloadTXTFile('TXT CONTENT', 'test.TXT');
    expect(appendSpy).toHaveBeenCalledTimes(1);
  });
});

// ─── generateAndDownloadSIFFile ───────────────────────────────────────────────

describe('generateAndDownloadSIFFile', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it('resolves with success: true', async () => {
    const result = await generateAndDownloadSIFFile(EMPLOYEES, COMPANY);
    expect(result.success).toBe(true);
  });

  it('returns sifFilename in result', async () => {
    const result = await generateAndDownloadSIFFile(EMPLOYEES, COMPANY);
    expect(result.sifFilename).toMatch(/\.SIF$/);
  });

  it('returns sifContent in result', async () => {
    const result = await generateAndDownloadSIFFile(EMPLOYEES, COMPANY);
    expect(typeof result.sifContent).toBe('string');
    expect(result.sifContent).toContain('FHR,');
  });

  it('downloads SIF by default (downloadSif: true)', async () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    await generateAndDownloadSIFFile(EMPLOYEES, COMPANY, { downloadSif: true });
    expect(appendSpy).toHaveBeenCalled();
  });

  it('does not download SIF when downloadSif: false', async () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    await generateAndDownloadSIFFile(EMPLOYEES, COMPANY, { downloadSif: false, downloadTxt: false });
    expect(appendSpy).not.toHaveBeenCalled();
  });

  it('returns txtFilename when downloadTxt: true', async () => {
    const result = await generateAndDownloadSIFFile(EMPLOYEES, COMPANY, {
      downloadSif: false,
      downloadTxt: true,
    });
    expect(result.txtFilename).toBeDefined();
    expect(result.txtFilename).toContain('VERIFICATION');
  });

  it('returns txtFilename as null when downloadTxt: false', async () => {
    const result = await generateAndDownloadSIFFile(EMPLOYEES, COMPANY, {
      downloadSif: false,
      downloadTxt: false,
    });
    expect(result.txtFilename).toBeNull();
  });

  it('handles errors and returns success: false', async () => {
    URL.createObjectURL = vi.fn().mockImplementation(() => {
      throw new Error('URL creation failed');
    });
    const result = await generateAndDownloadSIFFile(EMPLOYEES, COMPANY, { downloadSif: true });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
