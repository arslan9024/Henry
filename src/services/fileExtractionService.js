// File extraction service: turn an uploaded PDF or image into plain text.
// Privacy-first: extraction runs entirely in the browser — no remote calls.
//
//   extractTextFromFile(file)
//     → { ok: true, kind: 'pdf'|'image', text, pageCount?, durationMs }
//     → { ok: false, reason }

const MAX_PDF_PAGES = 25;
const MAX_TEXT_CHARS = 50_000; // protect Ollama prompt size

const isPdf = (file) => file?.type === 'application/pdf' || /\.pdf$/i.test(file?.name || '');

const isImage = (file) => (file?.type || '').startsWith('image/') || /\.(png|jpe?g)$/i.test(file?.name || '');

const truncate = (text) => {
  if (!text) return { text: '', truncated: false };
  if (text.length <= MAX_TEXT_CHARS) return { text, truncated: false };
  return { text: text.slice(0, MAX_TEXT_CHARS), truncated: true };
};

const extractPdfText = async (file) => {
  const t0 = performance.now();

  let pdfjs;
  try {
    pdfjs = await import('pdfjs-dist');
  } catch (err) {
    return {
      ok: false,
      reason: 'PDF support is not installed. Run `npm install` to add pdfjs-dist.',
      detail: err?.message,
    };
  }

  // Configure the worker once. Vite resolves ?url to a hashed bundle URL.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch {
      // fall back to fake worker (slower but functional)
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const totalPages = pdf.numPages;
  const pageCount = Math.min(totalPages, MAX_PDF_PAGES);
  const chunks = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    // eslint-disable-next-line no-await-in-loop
    const page = await pdf.getPage(pageNum);
    // eslint-disable-next-line no-await-in-loop
    const content = await page.getTextContent();
    // Group text items by their y coordinate to reconstruct visual lines.
    const lineMap = new Map();
    content.items.forEach((item) => {
      if (!item || typeof item.str !== 'string') return;
      const y = Math.round((item.transform?.[5] ?? 0) * 10) / 10;
      const existing = lineMap.get(y) || [];
      existing.push(item.str);
      lineMap.set(y, existing);
    });
    const lines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0]) // PDF y axis: top → down
      .map(([, parts]) => parts.join(' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    chunks.push(`--- Page ${pageNum} ---\n${lines.join('\n')}`);
  }

  const fullText = chunks.join('\n\n').trim();
  const { text, truncated: charsTruncated } = truncate(fullText);

  return {
    ok: true,
    kind: 'pdf',
    text,
    pageCount,
    totalPages,
    pagesTruncated: totalPages > MAX_PDF_PAGES,
    charsTruncated,
    durationMs: Math.round(performance.now() - t0),
  };
};

const extractImageText = async (file) => {
  const t0 = performance.now();
  let createWorker;
  try {
    ({ createWorker } = await import('tesseract.js'));
  } catch (err) {
    return { ok: false, reason: 'Tesseract.js not installed.', detail: err?.message };
  }

  const worker = await createWorker('eng');
  try {
    const result = await worker.recognize(file);
    const raw = result?.data?.text || '';
    // Tesseract occasionally embeds NULs in OCR output — strip them so the
    // string is safe to ship to JSON / Redux. Control char is intentional.
    // eslint-disable-next-line no-control-regex
    const cleaned = raw.replace(/\u0000/g, '').trim();
    const { text, truncated: charsTruncated } = truncate(cleaned);
    return {
      ok: true,
      kind: 'image',
      text,
      charsTruncated,
      durationMs: Math.round(performance.now() - t0),
    };
  } finally {
    await worker.terminate().catch(() => {});
  }
};

export const extractTextFromFile = async (file) => {
  if (!file) return { ok: false, reason: 'No file provided.' };

  try {
    if (isPdf(file)) return await extractPdfText(file);
    if (isImage(file)) return await extractImageText(file);
    return {
      ok: false,
      reason: `Unsupported file type "${file.type || file.name}". Only PDF, PNG, and JPG are accepted.`,
    };
  } catch (err) {
    console.error('[fileExtractionService]', err);
    return { ok: false, reason: err?.message || 'Failed to read file.' };
  }
};

export const SUPPORTED_FILE_ACCEPT = 'application/pdf,image/png,image/jpeg,image/jpg';
