const readByPath = (source, path) =>
  String(path || '')
    .split('.')
    .filter(Boolean)
    .reduce((value, key) => (value == null ? undefined : value[key]), source);

const toDisplayValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const readBinary = async (source) => {
  if (source instanceof Uint8Array || source instanceof ArrayBuffer) return source;
  if (source && typeof source.arrayBuffer === 'function') return source.arrayBuffer();
  if (source && typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read the PDF template.'));
      reader.readAsArrayBuffer(source);
    });
  }
  throw new Error('A readable PDF template is required.');
};

const loadPdf = async (templateBlob) => {
  if (!templateBlob) {
    throw new Error('A readable PDF template is required.');
  }
  const { PDFDocument } = await import('pdf-lib');
  try {
    return await PDFDocument.load(await readBinary(templateBlob));
  } catch {
    throw new Error('The selected template is not a valid PDF.');
  }
};

export const inspectFillablePdfFields = async (templateBlob) => {
  const pdf = await loadPdf(templateBlob);
  return pdf
    .getForm()
    .getFields()
    .map((field) => ({ name: field.getName(), type: field.constructor.name }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const renderStaticTemplatePdf = async ({ templateBlob, documentData, mappings = [] }) => {
  const pdf = await loadPdf(templateBlob);
  const pages = pdf.getPages();
  const { StandardFonts, rgb } = await import('pdf-lib');
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  mappings.forEach((mapping) => {
    const pageIndex = Math.max(0, Number(mapping.page || 1) - 1);
    const page = pages[pageIndex];
    if (!page) return;
    const value = toDisplayValue(readByPath(documentData, mapping.path));
    if (!value) return;
    page.drawText(value, {
      x: Math.max(0, Number(mapping.x) || 0),
      y: Math.max(0, Number(mapping.y) || 0),
      size: Math.max(6, Number(mapping.fontSize) || 10),
      maxWidth: Math.max(20, Number(mapping.width) || 220),
      font,
      color: rgb(0.05, 0.05, 0.05),
    });
  });

  return new Blob([await pdf.save()], { type: 'application/pdf' });
};

export const renderFillableTemplatePdf = async ({
  templateBlob,
  documentData,
  mappings = [],
  flatten = false,
}) => {
  const pdf = await loadPdf(templateBlob);
  const form = pdf.getForm();

  mappings.forEach((mapping) => {
    if (!mapping.pdfFieldName) return;
    const value = toDisplayValue(readByPath(documentData, mapping.path));
    if (!value) return;
    try {
      const field = form.getField(mapping.pdfFieldName);
      if (typeof field.setText === 'function') field.setText(value);
      else if (typeof field.select === 'function') field.select(value);
      else if (typeof field.check === 'function' && ['true', 'yes', '1'].includes(value.toLowerCase())) {
        field.check();
      }
    } catch {
      // A stale mapping must not prevent other valid fields from rendering.
    }
  });

  if (flatten) form.flatten();
  return new Blob([await pdf.save()], { type: 'application/pdf' });
};

export const renderConfiguredTemplatePdf = async ({ templateBlob, documentData, profile }) => {
  if (profile?.mode === 'fillable') {
    return renderFillableTemplatePdf({
      templateBlob,
      documentData,
      mappings: profile.mappings,
      flatten: profile.flatten,
    });
  }
  if (profile?.mode === 'static') {
    return renderStaticTemplatePdf({ templateBlob, documentData, mappings: profile.mappings });
  }
  throw new Error('Configure and save a static or fillable mapping profile before export.');
};
