import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfBlobs } from './mergePdfBlobs';

const makePdf = async (pages) => {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pages; index += 1) pdf.addPage();
  return new Blob([await pdf.save()], { type: 'application/pdf' });
};

const readBlob = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

describe('mergePdfBlobs', () => {
  it('merges every page in source order', async () => {
    const result = await mergePdfBlobs([await makePdf(1), await makePdf(2)]);
    const merged = await PDFDocument.load(await readBlob(result));
    expect(merged.getPageCount()).toBe(3);
  });

  it('rejects empty and unreadable inputs with actionable errors', async () => {
    await expect(mergePdfBlobs([])).rejects.toThrow(/no pdf blobs/i);
    await expect(mergePdfBlobs([new Blob(['not-pdf'])])).rejects.toThrow(/pdf 1 could not be loaded/i);
  });
});
