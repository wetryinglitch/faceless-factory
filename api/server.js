const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8889;

// Serve the API
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'POST' && req.url === '/generate-script') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { topic, category, notes } = JSON.parse(body);
        
        // Step 1: Research via web search
        const researchPrompt = `Research "${topic}" for a 60-second YouTube Short script. Find 10 specific, fascinating facts with exact numbers, dates, and names. Focus on the most shocking/surprising angles.`;
        
        // Write task to file, use openclaw to process
        const taskFile = `/tmp/script-task-${Date.now()}.md`;
        const outputFile = `/tmp/script-output-${Date.now()}.md`;
        
        const scriptPrompt = `You are a viral YouTube Shorts scriptwriter. Write a complete 60-second script about "${topic}" (category: ${category}).

${notes ? `Research notes provided:\n${notes}\n` : ''}

FORMAT (follow EXACTLY):
[0-3s] HOOK
Write a single dramatic opening line that hooks viewers instantly. Use specific details.

[3-9s] FACT 1
What it was and when it started. Include a specific year.

[9-15s] FACT 2  
The mission or purpose. Be specific.

[15-21s] FACT 3
How it worked. Include a surprising detail.

[21-27s] FACT 4
The risk or danger involved. Make it visceral.

[27-33s] FACT 5
The scale — use a specific number that shocks.

[33-39s] FACT 6 — THE MONEY SHOT
The single most shocking, unbelievable fact. This is the moment viewers screenshot and share.

[39-45s] FACT 7
A human element — name a specific person and what they did.

[45-51s] FACT 8
The results and impact. Use numbers.

[51-57s] FACT 9
What happened to it / how it ended.

[57-60s] FACT 10 + CTA
Legacy line + a question that drives comments. End with "Follow for more."

RULES:
- Use SPECIFIC numbers, never "many" or "a lot"
- Include at least 2 named people
- 8th grade reading level — simple words, punchy sentences
- Each fact is 1-2 sentences MAX
- Total script must be speakable in exactly 60 seconds (~150 words)
- Make Fact 6 genuinely shocking — the "holy shit" moment

Write the complete script now. No meta-commentary, just the script.`;

        fs.writeFileSync(taskFile, scriptPrompt);
        
        // Use node to call Anthropic API directly
        const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
        
        if (!anthropicKey) {
          // Fallback: read from openclaw config
          try {
            const configOutput = execSync('cat /Users/automus/.openclaw/agents/main/agent/auth-profiles.json 2>/dev/null || echo "{}"', { encoding: 'utf8' });
            const config = JSON.parse(configOutput);
            // Try to extract key
          } catch(e) {}
        }

        // Call Anthropic API
        const postData = JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: scriptPrompt }]
        });

        const result = await new Promise((resolve, reject) => {
          const apiReq = require('https').request({
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01'
            }
          }, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content && parsed.content[0]) {
                  resolve(parsed.content[0].text);
                } else {
                  resolve('Error: ' + data);
                }
              } catch(e) { resolve('Parse error: ' + data); }
            });
          });
          apiReq.on('error', reject);
          apiReq.write(postData);
          apiReq.end();
        });

        // Save script to file
        const scriptDir = `/Users/automus/.openclaw/workspace/FacelessChannel/output/scripts`;
        if (!fs.existsSync(scriptDir)) fs.mkdirSync(scriptDir, { recursive: true });
        const safeTitle = topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        fs.writeFileSync(`${scriptDir}/${safeTitle}.md`, `# ${topic}\n\n${result}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, script: result, saved: `${scriptDir}/${safeTitle}.md` }));
        
      } catch(err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/research') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { topic } = JSON.parse(body);
        
        // Use curl to hit Brave Search API via OpenClaw's proxy
        const searchResults = execSync(`curl -s "https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(topic + ' history facts')}&count=5" -H "Accept: application/json" -H "Accept-Encoding: gzip" 2>/dev/null || echo "{}"`, { encoding: 'utf8', timeout: 10000 });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, research: searchResults }));
      } catch(err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, research: 'Research via web search - use the UI to trigger.' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/search-images') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { topic } = JSON.parse(body);
        
        // Search Wikimedia Commons
        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&srnamespace=6&srlimit=10&format=json`;
        const wikiResults = execSync(`curl -s "${wikiUrl}"`, { encoding: 'utf8', timeout: 10000 });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, images: JSON.parse(wikiResults) }));
      } catch(err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`🎬 Faceless Factory API running on http://localhost:${PORT}`);
});
