/**
 * [Category 5: Processing Engine]
 * White Caves Real Estate - PDF Page Background Renderer (pdfPageRenderer.js)
 *
 * Uses pdfjs-dist to render actual official DLD PDF pages directly onto an HTML5 canvas.
 * Caches loaded PDF documents in memory for ultra-fast page switching.
 */

let cachedPdfDoc = null;
let cachedPdfUrl = null;

/**
 * Configure the PDF.js worker using Vite's URL import.
 */
const initWorker = async (pdfjs) => {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch {
      // Fallback for Node / test environments
      pdfjs.GlobalWorkerOptions.workerSrc = '';
    }
  }
};

/**
 * Load or retrieve the cached PDF document.
 * @param {string} pdfUrl
 * @returns {Promise<any>}
 */
export const loadPdfDocument = async (pdfUrl) => {
  if (cachedPdfDoc && cachedPdfUrl === pdfUrl) {
    return cachedPdfDoc;
  }

  const pdfjs = await import('pdfjs-dist');
  await initWorker(pdfjs);

  const loadingTask = pdfjs.getDocument({
    url: pdfUrl,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const doc = await loadingTask.promise;
  cachedPdfDoc = doc;
  cachedPdfUrl = pdfUrl;
  return doc;
};

/**
 * Render a specific page from the PDF onto an HTML5 canvas context.
 *
 * @param {Object} options
 * @param {string} [options.pdfUrl='/importantFolder/Tenancy Contract Template.pdf']
 * @param {number} options.pageNumber (1-indexed)
 * @param {HTMLCanvasElement} options.canvas
 * @param {number} [options.scale=1.5]
 * @returns {Promise<boolean>}
 */
export const renderPdfPageToCanvas = async ({
  pdfUrl = '/importantFolder/Tenancy%20Contract%20Template.pdf',
  pageNumber = 1,
  canvas,
  scale = 1.0,
}) => {
  if (!canvas) return false;

  try {
    const doc = await loadPdfDocument(pdfUrl);
    const page = await doc.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: ctx,
      viewport,
    };

    await page.render(renderContext).promise;
    return true;
  } catch (err) {
    console.warn(`[pdfPageRenderer] Failed to render PDF page ${pageNumber} onto canvas:`, err.message);
    return false;
  }
};
