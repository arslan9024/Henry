// Zero-dependency Vite dev middleware that persists Henry archive records
// to the local filesystem under <repoRoot>/records/{YEAR}/{MONTH}/{PROPERTY}/
//
// Endpoints:
//   GET  /api/records/archive        -> returns archive index JSON (array)
//   POST /api/records/archive        -> overwrites archive index JSON with body
//   POST /api/records/file           -> multipart-less raw upload:
//                                       headers: x-record-path, x-file-name
//                                       body: binary PDF
//
// Notes:
//  - Active in dev (vite dev) only. For production deploys, run a real server.
//  - All paths sanitized; writes are constrained to <repoRoot>/records.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const ARCHIVE_INDEX_REL = path.join('records', 'archive-index.json');

const sanitizeSegment = (value = '') =>
  String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_') || 'Unknown';

const safeJoinUnderRecords = (rootDir, logicalPath) => {
  const recordsRoot = path.join(rootDir, 'records');
  const cleaned = String(logicalPath || '')
    .replace(/^[\\/]+/, '') // strip leading slashes
    .replace(/^records[\\/]+/i, ''); // strip optional records/ prefix

  const segments = cleaned
    .split(/[\\/]+/)
    .filter(Boolean)
    .map(sanitizeSegment);

  const finalDir = path.join(recordsRoot, ...segments);
  const resolved = path.resolve(finalDir);
  if (!resolved.startsWith(path.resolve(recordsRoot))) {
    throw new Error('Refused: resolved path escapes records root');
  }
  return resolved;
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default function henryRecordsApi() {
  return {
    name: 'henry-records-api',
    configureServer(server) {
      const rootDir = server.config.root;
      const indexFile = path.join(rootDir, ARCHIVE_INDEX_REL);

      // Ensure records root exists at startup (non-fatal)
      fs.promises
        .mkdir(path.join(rootDir, 'records'), { recursive: true })
        .catch(() => {});

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/records')) {
          return next();
        }

        try {
          // GET /api/records/archive -> archive index JSON
          if (req.method === 'GET' && req.url.startsWith('/api/records/archive')) {
            try {
              const raw = await fsp.readFile(indexFile, 'utf8');
              return sendJson(res, 200, JSON.parse(raw));
            } catch {
              return sendJson(res, 200, []);
            }
          }

          // POST /api/records/archive -> overwrite archive index JSON
          if (req.method === 'POST' && req.url.startsWith('/api/records/archive')) {
            const body = await readBody(req);
            let entries = [];
            try {
              entries = JSON.parse(body.toString('utf8') || '[]');
            } catch {
              return sendJson(res, 400, { ok: false, error: 'Invalid JSON body' });
            }
            if (!Array.isArray(entries)) {
              return sendJson(res, 400, { ok: false, error: 'Body must be an array' });
            }

            // Pre-create directories for each entry's recordPath (best-effort)
            for (const entry of entries) {
              if (entry && typeof entry.recordPath === 'string') {
                try {
                  const dir = safeJoinUnderRecords(rootDir, entry.recordPath);
                  await fsp.mkdir(dir, { recursive: true });
                } catch {
                  // skip individual failures, do not abort whole request
                }
              }
            }

            await fsp.mkdir(path.dirname(indexFile), { recursive: true });
            await fsp.writeFile(indexFile, JSON.stringify(entries, null, 2), 'utf8');
            return sendJson(res, 200, { ok: true, count: entries.length });
          }

          // POST /api/records/file -> write binary file under recordPath
          if (req.method === 'POST' && req.url.startsWith('/api/records/file')) {
            const recordPath = req.headers['x-record-path'];
            const fileName = req.headers['x-file-name'];
            if (!recordPath || !fileName) {
              return sendJson(res, 400, { ok: false, error: 'Missing x-record-path or x-file-name header' });
            }

            const body = await readBody(req);
            if (!body.length) {
              return sendJson(res, 400, { ok: false, error: 'Empty body' });
            }

            const dir = safeJoinUnderRecords(rootDir, String(recordPath));
            await fsp.mkdir(dir, { recursive: true });

            const safeFileName = sanitizeSegment(String(fileName));
            const fullPath = path.join(dir, safeFileName);
            await fsp.writeFile(fullPath, body);
            const relative = path.relative(rootDir, fullPath).split(path.sep).join('/');
            return sendJson(res, 200, { ok: true, path: '/' + relative });
          }

          return sendJson(res, 404, { ok: false, error: 'Unknown records endpoint' });
        } catch (error) {
          return sendJson(res, 500, { ok: false, error: error.message || 'Server error' });
        }
      });
    },
  };
}
