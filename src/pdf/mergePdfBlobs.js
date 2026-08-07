export const mergePdfBlobs = async (blobs = []) => {
  if (!Array.isArray(blobs) || blobs.length === 0) {
    throw new Error('No PDF blobs provided for merge.');
  }

  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();

  for (const blob of blobs) {
    const sourceBytes = await blob.arrayBuffer();
    const sourcePdf = await PDFDocument.load(sourceBytes);
    const pageIndices = sourcePdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes], { type: 'application/pdf' });
};
