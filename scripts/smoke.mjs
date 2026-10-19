/**
 * Production smoke test.
 *
 * Build first (`npm run build`), then run `npm run smoke`. The script starts
 * the standalone Node server on a spare port and verifies the public pages,
 * safety flow, privacy guardrails, language switching, and security headers.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const port = Number(process.env.SMOKE_PORT || 4331);
const base = `http://127.0.0.1:${port}`;
const results = [];
let serverOutput = '';

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function check(name, fn) {
  try {
    const detail = await fn();
    record(name, true, detail ?? '');
  } catch (error) {
    record(name, false, error instanceof Error ? error.message : String(error));
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function get(path, init = {}) {
  return fetch(`${base}${path}`, { redirect: 'manual', ...init });
}

const server = spawn(process.execPath, ['dist/server/entry.mjs'], {
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
    AI_PROVIDER: 'demo',
    AI_ENABLED: 'true',
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited early.\n${serverOutput.slice(-2000)}`);
    }
    try {
      const response = await get('/api/health');
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }
    await sleep(250);
  }
  throw new Error(`Server did not become ready.\n${serverOutput.slice(-2000)}`);
}

try {
  await waitForServer();

  await check('home page renders', async () => {
    const response = await get('/');
    const html = await response.text();
    assert(response.status === 200, `status ${response.status}`);
    assert(html.includes('AskOptsam'), 'missing brand');
    assert(html.includes('eye'), 'missing eye-health copy');
    return `${html.length} bytes`;
  });

  await check('security headers are present', async () => {
    const response = await get('/');
    assert(response.headers.get('x-content-type-options') === 'nosniff', 'missing nosniff');
    assert(response.headers.get('x-frame-options') === 'DENY', 'missing frame denial');
    assert(response.headers.get('referrer-policy'), 'missing referrer policy');
    const csp = response.headers.get('content-security-policy') || '';
    assert(csp.includes("script-src"), 'missing CSP script-src');
    assert(csp.includes("frame-ancestors 'none'"), 'missing CSP frame-ancestors');
    return 'CSP + nosniff + frame denial';
  });

  await check('chat page renders the island', async () => {
    const response = await get('/chat');
    const html = await response.text();
    assert(response.status === 200, `status ${response.status}`);
    assert(html.includes('chat-shell'), 'missing chat island');
    assert(html.includes('chat-input') || html.includes('consent'), 'missing composer/consent');
    return 'chat shell';
  });

  await check('education library and article render', async () => {
    const index = await get('/learn');
    const indexHtml = await index.text();
    assert(index.status === 200, `library status ${index.status}`);
    assert(indexHtml.includes('learn-search'), 'missing library search');

    const article = await get('/learn/everyday-eye-care');
    const articleHtml = await article.text();
    assert(article.status === 200, `article status ${article.status}`);
    assert(articleHtml.includes('Everyday eye care'), 'missing article title');
    assert(articleHtml.includes('/sources'), 'missing sources link');
    return 'library + article';
  });

  await check('warning signs and legal pages render', async () => {
    for (const path of [
      '/warning-signs',
      '/about',
      '/sources',
      '/privacy',
      '/terms',
      '/medical-disclaimer',
      '/status',
    ]) {
      const response = await get(path);
      assert(response.status === 200, `${path} status ${response.status}`);
    }
    return '7 static pages';
  });

  await check('status API reports demo mode and disabled images', async () => {
    const response = await get('/api/status');
    assert(response.status === 200, `status ${response.status}`);
    const data = await response.json();
    assert(data.mode === 'demo', `mode ${data.mode}`);
    assert(data.imageExplanation.enabled === false, 'image explanation is enabled');
    assert(data.sources.clinicalReview === 'pending', 'clinical review status changed');
    return `${data.sources.count} sources, ${data.mode} mode`;
  });

  await check('image endpoint refuses all image requests', async () => {
    for (const method of ['GET', 'POST']) {
      const response = await get('/api/image', { method });
      assert(response.status === 503, `${method} status ${response.status}`);
      const data = await response.json();
      assert(data.error.code === 'image_disabled', 'wrong error code');
      assert(data.error.message.includes('No image was received'), 'missing privacy guarantee');
    }
    return 'GET + POST refused';
  });

  await check('chat refuses a request without consent', async () => {
    const response = await get('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'My eyes itch', lang: 'en', consent: false }),
    });
    assert(response.status === 422, `status ${response.status}`);
    return '422';
  });

  await check('chat demo flow streams SSE', async () => {
    const response = await get('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'My eyes are dry when I use a computer',
        lang: 'en',
        consent: true,
      }),
    });
    assert(response.status === 200, `status ${response.status}`);
    assert(
      (response.headers.get('content-type') || '').includes('text/event-stream'),
      'not an event stream',
    );
    const raw = await response.text();
    assert(raw.includes('event: meta'), 'missing meta event');
    assert(raw.includes('event: done'), 'missing done event');
    assert(raw.includes('Demo mode'), 'missing demo label');
    assert(!raw.includes('"mode":"live"'), 'demo flow claimed to be live');
    return `${raw.length} bytes of SSE`;
  });

  await check('red-flag chat returns safety triage', async () => {
    const response = await get('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'I got bleach in my eye',
        lang: 'en',
        consent: true,
      }),
    });
    const raw = await response.text();
    assert(response.status === 200, `status ${response.status}`);
    assert(raw.includes('event: triage'), 'missing triage event');
    assert(raw.includes('"mode":"safety"'), 'not in safety mode');
    return 'triage event';
  });

  await check('Kiswahili language switch sets a cookie and translates the home page', async () => {
    const switchResponse = await get('/api/lang?lang=sw&next=%2F');
    assert(switchResponse.status === 303, `switch status ${switchResponse.status}`);
    const setCookie = switchResponse.headers.get('set-cookie') || '';
    assert(setCookie.includes('askoptsam_lang=sw'), 'missing language cookie');

    const home = await get('/', { headers: { cookie: 'askoptsam_lang=sw' } });
    const html = await home.text();
    assert(html.includes('Taarifa za afya ya macho'), 'missing Kiswahili copy');
    assert(html.includes('lang="sw"'), 'missing lang attribute');
    return 'sw cookie';
  });

  await check('404 page returns a 404 status', async () => {
    const response = await get('/this-page-does-not-exist');
    const html = await response.text();
    assert(response.status === 404, `status ${response.status}`);
    assert(html.includes('Page not found'), 'missing 404 copy');
    return '404';
  });
} catch (error) {
  record('smoke test harness', false, error instanceof Error ? error.message : String(error));
} finally {
  server.kill();
}

const failures = results.filter((result) => !result.ok);
console.log(`\n${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length > 0) {
  console.error('\nServer output (tail):\n' + serverOutput.slice(-3000));
  process.exitCode = 1;
}
