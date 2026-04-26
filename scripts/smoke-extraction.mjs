// Smoke test for the chatbox file-extraction pipeline (T-08).
//
//   Run with:  node scripts/smoke-extraction.mjs
//
// What it does:
//   1. Generates a synthetic 1-page PDF in memory using @react-pdf/renderer
//      with known field values (tenant name, Emirates ID, rental amount).
//   2. Feeds the PDF buffer into pdfjs-dist using the *exact* same loader
//      configuration as src/services/fileExtractionService.js.
//   3. Verifies that all known values appear in the extracted text.
//   4. Optionally pings http://localhost:11434 to report Ollama status.
//
// This validates Phase 1 (extraction) end-to-end without needing a browser.

import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { fileURLToPath } from 'url';
import path from 'path';

const KNOWN = {
  tenantFullName: 'Ahmed bin Mohammed Al Qasimi',
  emiratesId:     '784-1985-1234567-1',
  unit:           'Villa 4490',
  community:      'Damac Hills 2',
  annualRent:     '95,000 AED',
  contractStart:  '2026-05-01',
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  h1:   { fontSize: 18, marginBottom: 16, fontWeight: 'bold' },
  row:  { marginBottom: 6 },
  label:{ fontWeight: 'bold' },
});

const TestDoc = () =>
  React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.h1 }, 'Smoke Test Tenancy Snapshot'),
      Object.entries(KNOWN).map(([k, v]) =>
        React.createElement(
          View,
          { key: k, style: styles.row },
          React.createElement(Text, null, `${k}: ${v}`),
        ),
      ),
    ),
  );

const generatePdfBuffer = async () => {
  const blob = await pdf(React.createElement(TestDoc)).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const extractText = async (buffer) => {
  // Import legacy build for Node compatibility (no DOM).
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // Point workerSrc at the bundled legacy worker. pdfjs requires this even
  // when disableWorker is true (it still imports the module to verify).
  const workerPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs',
  );
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(`file:///${workerPath.replace(/\\/g, '/')}`).href;
  const loadingTask = pdfjs.getDocument({
    data: buffer,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: false,
  });
  const doc = await loadingTask.promise;
  const lines = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lineMap = new Map();
    content.items.forEach((item) => {
      if (!item || typeof item.str !== 'string') return;
      const y = Math.round((item.transform?.[5] ?? 0) * 10) / 10;
      const arr = lineMap.get(y) || [];
      arr.push(item.str);
      lineMap.set(y, arr);
    });
    Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .forEach(([, parts]) => lines.push(parts.join(' ').replace(/\s+/g, ' ').trim()));
  }
  return lines.filter(Boolean).join('\n');
};

const checkOllama = async () => {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1500);
    const r = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
};

const main = async () => {
  console.log('▶ Generating synthetic test PDF…');
  const t0 = Date.now();
  const buffer = await generatePdfBuffer();
  console.log(`  ✓ ${buffer.byteLength.toLocaleString()} bytes in ${Date.now() - t0} ms`);

  console.log('▶ Extracting text via pdfjs-dist (legacy build, worker disabled)…');
  const t1 = Date.now();
  const text = await extractText(buffer);
  console.log(`  ✓ ${text.length} chars in ${Date.now() - t1} ms`);
  console.log('--- BEGIN EXTRACTED TEXT ---');
  console.log(text);
  console.log('--- END EXTRACTED TEXT ---');

  console.log('▶ Verifying known values are present…');
  const results = Object.entries(KNOWN).map(([k, v]) => ({
    field: k,
    expected: v,
    found: text.includes(v),
  }));
  const missing = results.filter((r) => !r.found);
  results.forEach((r) => console.log(`  ${r.found ? '✓' : '✗'} ${r.field} → "${r.expected}"`));
  if (missing.length) {
    console.error(`\n✗ ${missing.length} value(s) missing from extracted text.`);
    process.exitCode = 1;
  } else {
    console.log('\n✓ All known values round-tripped successfully.');
  }

  console.log('\n▶ Checking local Ollama availability…');
  const ok = await checkOllama();
  console.log(ok ? '  ✓ Ollama is reachable at localhost:11434' : '  ⚠ Ollama not running — UI extraction step will report unavailable');
};

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exitCode = 2;
});
