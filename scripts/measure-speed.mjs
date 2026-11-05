import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function benchmark() {
  console.log('====================================================');
  console.log('⏱️ BENCHMARK: MEASURING SPEED ACROSS WORKFLOWS');
  console.log('====================================================\n');

  // 1. Measure File System Write (What Antigravity does to change code)
  const t0 = performance.now();
  const htmlPath = path.join(projectRoot, 'src', 'menu.html');
  const original = fs.readFileSync(htmlPath, 'utf8');
  fs.writeFileSync(htmlPath, original, 'utf8');
  const fileWriteMs = Math.round((performance.now() - t0) * 100) / 100;
  console.log(`[1] Disk Write Time: ${fileWriteMs} ms`);

  // 2. Measure Live SSE Event Dispatch
  const t1 = performance.now();
  const res = await fetch('http://localhost:3001/api/ai-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'benchmark', timestamp: Date.now() })
  });
  const data = await res.json();
  const sseDispatchMs = Math.round((performance.now() - t1) * 100) / 100;
  console.log(`[2] Live SSE Network Dispatch Time: ${sseDispatchMs} ms (Active Clients: ${data.broadcastedTo})`);

  // 3. Measure Headless Playwright Audit & PDF Compilation
  const t2 = performance.now();
  const compileScript = path.join(projectRoot, 'scripts', 'verify-and-build.mjs');
  const child = spawn(process.execPath, [compileScript], { cwd: projectRoot });

  await new Promise((resolve, reject) => {
    child.on('close', resolve);
    child.on('error', reject);
  });
  const compileTotalMs = Math.round(performance.now() - t2);
  console.log(`[3] Full Playwright Verification + 5 Retina Screenshots + PDF Build: ${compileTotalMs} ms (${(compileTotalMs / 1000).toFixed(2)} s)`);

  console.log('\n====================================================');
  console.log('📊 SPEED COMPARISON ANALYSIS');
  console.log('====================================================');
  console.log(`• Live Canvas Push:        ~${sseDispatchMs} ms (Instant UI reflection)`);
  console.log(`• Full PDF & Audit Loop:   ~${compileTotalMs} ms (~${(compileTotalMs / 1000).toFixed(1)} seconds)`);
  console.log('====================================================\n');
}

benchmark().catch(console.error);
