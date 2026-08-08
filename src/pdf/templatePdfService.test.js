import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  inspectFillablePdfFields,
  renderConfiguredTemplatePdf,
  renderFillableTemplatePdf,
  renderStaticTemplatePdf,
} from './templatePdfService';

const makePdfBlob = async ({ fillable = false } = {}) => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([500, 700]);
  if (fillable) {
    const field = pdf.getForm().createTextField('tenant_name');
    field.addToPage(page, { x: 50, y: 600, width: 200, height: 24 });
  }
  return new Blob([await pdf.save()], { type: 'application/pdf' });
};

const readBlob = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

describe('templatePdfService', () => {
  it('detects AcroForm fields', async () => {
    const fields = await inspectFillablePdfFields(await makePdfBlob({ fillable: true }));
    expect(fields).toEqual([{ name: 'tenant_name', type: 'PDFTextField' }]);
  });

  it('draws mapped values on a static template', async () => {
    const result = await renderStaticTemplatePdf({
      templateBlob: await makePdfBlob(),
      documentData: { tenant: { fullName: 'Test Tenant' } },
      mappings: [{ path: 'tenant.fullName', page: 1, x: 50, y: 600, fontSize: 10 }],
    });
    const output = await PDFDocument.load(await readBlob(result));
    expect(output.getPageCount()).toBe(1);
    expect(result.type).toBe('application/pdf');
  });

  it('fills mapped AcroForm text fields', async () => {
    const result = await renderFillableTemplatePdf({
      templateBlob: await makePdfBlob({ fillable: true }),
      documentData: { tenant: { fullName: 'Mapped Tenant' } },
      mappings: [{ path: 'tenant.fullName', pdfFieldName: 'tenant_name' }],
    });
    const output = await PDFDocument.load(await readBlob(result));
    expect(output.getForm().getTextField('tenant_name').getText()).toBe('Mapped Tenant');
  });

  it('rejects an unsaved mapping mode', async () => {
    await expect(
      renderConfiguredTemplatePdf({ templateBlob: await makePdfBlob(), documentData: {}, profile: null }),
    ).rejects.toThrow(/configure and save/i);
  });
});
