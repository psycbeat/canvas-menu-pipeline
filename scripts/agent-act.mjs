import http from 'http';

const args = process.argv.slice(2);
const command = args[0] || 'focus';

async function sendAiAction(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/ai-action',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body || '{}')));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  if (command === 'focus') {
    const boardIndex = args.indexOf('--board');
    const boardId = boardIndex !== -1 ? args[boardIndex + 1] : 'page-1';

    const cardIndex = args.indexOf('--card');
    const cardNum = cardIndex !== -1 ? parseInt(args[cardIndex + 1], 10) : 1;

    const msgIndex = args.indexOf('--msg');
    const message = msgIndex !== -1 ? args[msgIndex + 1] : 'Antigravity editing...';

    const selector = `#${boardId} .menu-card:nth-child(${cardNum})`;
    const res = await sendAiAction({
      type: 'focus_card',
      boardId,
      cardIndex: cardNum,
      selector,
      message
    });
    console.log('Dispatched AI Focus Action:', res);
  } else if (command === 'finish') {
    const res = await sendAiAction({ type: 'finish' });
    console.log('Dispatched AI Finish Action:', res);
  }
}

main().catch(console.error);
