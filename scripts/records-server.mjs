import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const RECORDS_ROOT = path.join(ROOT_DIR, 'records');
const ARCHIVE_INDEX_FILE = path.join(RECORDS_ROOT, 'archive-index.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const sanitizeSegment = (value = '') =>
  String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_') || 'Unknown';

const safeJoinUnderRecords = (logicalPath) => {
  const cleaned = String(logicalPath || '')
    .replace(/^[\\/]+/, '')
    .replace(/^records[\\/]+/i, '');

  const segments = cleaned
    .split(/[\\/]+/)
    .filter(Boolean)
    .map(sanitizeSegment);

  const finalDir = path.join(RECORDS_ROOT, ...segments);
  const resolved = path.resolve(finalDir);
  if (!resolved.startsWith(path.resolve(RECORDS_ROOT))) {
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
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

const sendText = (res, status, text) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
};

const sendFile = async (res, filePath) => {
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) {
      sendText(res, 404, 'Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', String(stat.size));
    fs.createReadStream(filePath).pipe(res);
  } catch {
    sendText(res, 404, 'Not Found');
  }
};

const withCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-record-path,x-file-name');
};

const handleRecordsApi = async (req, res, pathname) => {
  // GET /api/records/archive
  if (req.method === 'GET' && pathname === '/api/records/archive') {
    try {
      const raw = await fsp.readFile(ARCHIVE_INDEX_FILE, 'utf8');
      return sendJson(res, 200, JSON.parse(raw));
    } catch {
      return sendJson(res, 200, []);
    }
  }

  // POST /api/records/archive
  if (req.method === 'POST' && pathname === '/api/records/archive') {
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

    for (const entry of entries) {
      if (entry && typeof entry.recordPath === 'string') {
        try {
          const dir = safeJoinUnderRecords(entry.recordPath);
          await fsp.mkdir(dir, { recursive: true });
        } catch {
          // best-effort only
        }
      }
    }

    await fsp.mkdir(path.dirname(ARCHIVE_INDEX_FILE), { recursive: true });
    await fsp.writeFile(ARCHIVE_INDEX_FILE, JSON.stringify(entries, null, 2), 'utf8');
    return sendJson(res, 200, { ok: true, count: entries.length });
  }

  // POST /api/records/file
  if (req.method === 'POST' && pathname === '/api/records/file') {
    const recordPath = req.headers['x-record-path'];
    const fileName = req.headers['x-file-name'];

    if (!recordPath || !fileName) {
      return sendJson(res, 400, {
        ok: false,
        error: 'Missing x-record-path or x-file-name header',
      });
    }

    const body = await readBody(req);
    if (!body.length) {
      return sendJson(res, 400, { ok: false, error: 'Empty body' });
    }

    const dir = safeJoinUnderRecords(String(recordPath));
    await fsp.mkdir(dir, { recursive: true });

    const safeFileName = sanitizeSegment(String(fileName));
    const fullPath = path.join(dir, safeFileName);
    await fsp.writeFile(fullPath, body);

    const relative = path.relative(ROOT_DIR, fullPath).split(path.sep).join('/');
    return sendJson(res, 200, { ok: true, path: '/' + relative });
  }

  return sendJson(res, 404, { ok: false, error: 'Unknown records endpoint' });
};

const handleStatic = async (req, res, pathname) => {
  const normalized = path.normalize(pathname).replace(/^\.+/, '');
  const candidate = path.join(DIST_DIR, normalized);
  const resolved = path.resolve(candidate);

  if (!resolved.startsWith(path.resolve(DIST_DIR))) {
    return sendText(res, 403, 'Forbidden');
  }

  try {
    const stat = await fsp.stat(resolved);
    if (stat.isFile()) {
      return sendFile(res, resolved);
    }
  } catch {
    // fallback to index.html
  }

  return sendFile(res, path.join(DIST_DIR, 'index.html'));
};

const server = http.createServer(async (req, res) => {
  try {
    withCors(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname.startsWith('/api/records')) {
      return await handleRecordsApi(req, res, pathname);
    }

    return await handleStatic(req, res, pathname === '/' ? '/index.html' : pathname);
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error?.message || 'Server error',
    });
  }
});

await fsp.mkdir(RECORDS_ROOT, { recursive: true });

server.listen(PORT, HOST, () => {
  console.log(`[henry-records-server] running on http://${HOST}:${PORT}`);
  console.log(`[henry-records-server] serving dist from: ${DIST_DIR}`);
  console.log(`[henry-records-server] records root: ${RECORDS_ROOT}`);
});
