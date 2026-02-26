const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8889;
const QUEUE_DIR = '/Users/automus/.openclaw/workspace/FacelessChannel/queue';
const OUTPUT_DIR = '/Users/automus/.openclaw/workspace/FacelessChannel/output/scripts';

// Ensure dirs exist
[QUEUE_DIR, OUTPUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // Submit a script generation request
  if (req.method === 'POST' && req.url === '/generate-script') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { topic, category, notes } = JSON.parse(body);
        const id = Date.now() + '-' + topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const request = { id, topic, category, notes: notes || '', status: 'pending', createdAt: new Date().toISOString() };
        fs.writeFileSync(path.join(QUEUE_DIR, `${id}.json`), JSON.stringify(request, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id, message: 'Script queued — Automus sub-agent will process it.' }));
      } catch(err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Check status of a script request
  if (req.method === 'GET' && req.url.startsWith('/status/')) {
    const id = req.url.replace('/status/', '');
    const queueFile = path.join(QUEUE_DIR, `${id}.json`);
    const safeTitle = id.replace(/^\d+-/, '');
    const outputFile = path.join(OUTPUT_DIR, `${safeTitle}.md`);
    
    if (fs.existsSync(outputFile)) {
      const script = fs.readFileSync(outputFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'done', script }));
    } else if (fs.existsSync(queueFile)) {
      const data = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: data.status || 'pending' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'not_found' }));
    }
    return;
  }

  // List all completed scripts
  if (req.method === 'GET' && req.url === '/scripts') {
    try {
      const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.md'));
      const scripts = files.map(f => ({
        name: f.replace('.md', ''),
        content: fs.readFileSync(path.join(OUTPUT_DIR, f), 'utf8'),
        modified: fs.statSync(path.join(OUTPUT_DIR, f)).mtime
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, scripts }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // List queue
  if (req.method === 'GET' && req.url === '/queue') {
    try {
      const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));
      const items = files.map(f => JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, f), 'utf8')));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, queue: items }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`🎬 Faceless Factory API running on http://localhost:${PORT}`);
  console.log(`📋 Queue dir: ${QUEUE_DIR}`);
  console.log(`📝 Output dir: ${OUTPUT_DIR}`);
});
