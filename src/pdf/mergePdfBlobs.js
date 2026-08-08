export const mergePdfBlobs = async (blobs = []) => {
  if (!Array.isArray(blobs) || blobs.length === 0) {
    throw new Error('No PDF blobs provided for merge.');
  }

  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();

  const readBlob = (blob) => {
    if (blob && typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
    if (blob && typeof FileReader !== 'undefined') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read PDF binary.'));
        reader.readAsArrayBuffer(blob);
      });
    }
    throw new Error('not-readable');
  };

  for (const [index, blob] of blobs.entries()) {
    if (!blob) {
      throw new Error(`PDF ${index + 1} is not a readable Blob.`);
    }
    let sourceBytes;
    try {
      sourceBytes = await readBlob(blob);
    } catch {
      throw new Error(`PDF ${index + 1} is not a readable Blob.`);
    }
    let sourcePdf;
    try {
      sourcePdf = await PDFDocument.load(sourceBytes);
    } catch {
      throw new Error(`PDF ${index + 1} could not be loaded for merge.`);
    }
    if (sourcePdf.getPageCount() === 0) {
      throw new Error(`PDF ${index + 1} contains no pages.`);
    }
    const pageIndices = sourcePdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes], { type: 'application/pdf' });
};
