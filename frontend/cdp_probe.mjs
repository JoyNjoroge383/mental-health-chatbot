const list = await (await fetch('http://localhost:9222/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (method, params = {}) =>
  new Promise((r) => { const m = ++id; pending.set(m, r); ws.send(JSON.stringify({ id: m, method, params })); });
const logs = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); return; }
  if (msg.method === 'Runtime.exceptionThrown') logs.push(`[EXCEPTION] ${msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text}`);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') logs.push(`[console.error] ` + msg.params.args.map(a => a.value ?? a.description ?? '').join(' '));
});
await new Promise(r => ws.addEventListener('open', r));
await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', { url: 'http://localhost:5173/' });
await new Promise(r => setTimeout(r, 6000));
const res = await send('Runtime.evaluate', {
  expression: 'JSON.stringify({ rootLen: document.getElementById("root")?.innerHTML.length ?? -1, h1: document.querySelector("h1")?.textContent ?? null })',
  returnByValue: true });
console.log('=== PAGE STATE ===\n' + res.result?.value);
console.log('=== ERRORS ===\n' + (logs.length ? logs.join('\n') : '(none)'));
ws.close(); process.exit(0);
