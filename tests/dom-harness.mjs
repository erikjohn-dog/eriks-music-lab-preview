// Minimal DOM and audio doubles for interaction tests. These exercise application
// transitions, not browser rendering, iOS permissions, or audible output.
import { readFile } from 'node:fs/promises';
let fixtureId = 0;
export async function fixture(saved) {
  const ids = new Map(); const calls = [], alerts = [], timers = new Map(); let timerId = 0;
  class Element {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; this.style = {}; this.hidden = false; this.disabled = false; this.checked = false; this.value = ''; this._text = ''; this._html = ''; this.className = ''; this.validity = ''; this.open = false;
      this.classList = { add: (...names) => { this.className = [...new Set([...this.className.split(' '), ...names])].join(' ').trim(); }, remove: (...names) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); }, toggle: (name, value) => value ? this.classList.add(name) : this.classList.remove(name) };
    }
    set id(value) { this._id = value; ids.set(value, this); } get id() { return this._id; }
    set textContent(value) { this._text = String(value); this.children = []; this._html = ''; } get textContent() { return this._text + this._html.replace(/<[^>]+>/g, '') + this.children.map(node => node.textContent).join(''); }
    set innerHTML(value) { this._html = String(value); this._text = ''; this.children = []; } get innerHTML() { return this._html; }
    append(...nodes) { nodes.forEach(node => { node.parent = this; this.children.push(node); if (this.tagName === 'SELECT' && this.children.length === 1) this.value = String(node.value); }); }
    replaceChildren(...nodes) { this._html = ''; this._text = ''; this.children = []; this.append(...nodes); }
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    setCustomValidity(value) { this.validity = value; }
    get elements() { const out = []; const visit = el => { if (['INPUT', 'SELECT', 'BUTTON'].includes(el.tagName)) out.push(el); el.children.forEach(visit); }; visit(this); return out; }
    reportValidity() { return this.elements.every(el => !el.validity); }
    async emit(type, extra = {}) { const event = { target: this, preventDefault() {}, ...extra }; await Promise.all((this.listeners[type] ?? []).map(fn => fn(event))); }
    async click() { if (!this.disabled) await this.emit('click'); }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)) { const el = new Element(match[1]); el.id = match[2]; if (match[0].includes('hidden')) el.hidden = true; }
  ids.get('settings-form').append(ids.get('settings-fields'));
  const meta = new Element('meta'), root = new Element('html');
  const document = { hidden: false, documentElement: root, getElementById: id => ids.get(id), createElement: tag => new Element(tag), querySelector: () => meta, querySelectorAll: () => [...ids.values()].filter(el => el.tagName === 'DIALOG'), listeners: {}, addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); } };
  const data = new Map(saved ? [['perfect-pitch-trainer:v1', JSON.stringify(saved)]] : []);
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const media = { matches: false, callback: null, addEventListener(_, fn) { this.callback = fn; } };
  class AudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 0; }
    async resume() { this.state = 'running'; } async suspend() { this.state = 'suspended'; }
    createOscillator() { return { frequency: { setValueAtTime(value) { calls.push(value); } }, connect() {}, disconnect() {}, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, cancelAndHoldAtTime() {} }, connect() {}, disconnect() {} }; }
  }
  const window = { localStorage: storage, addEventListener() {} };
  Object.assign(globalThis, { document, window, AudioContext, matchMedia: () => media, confirm: () => true, alert: message => alerts.push(message) });
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });
  Object.defineProperty(globalThis, 'crypto', { value: { getRandomValues(out) { out[0] = 0; return out; } }, configurable: true });
  // Avoid waiting for sound-envelope display timers in this simulated UI suite.
  const realSetTimeout = globalThis.setTimeout, realClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = fn => { const id = ++timerId; timers.set(id, fn); return id; };
  globalThis.clearTimeout = id => timers.delete(id);
  await import(`../app.js?fixture=${++fixtureId}`);
  return { $, document, data, media, calls, alerts,
    saved: () => JSON.parse(data.get('perfect-pitch-trainer:v1')),
    async configure(values) { await $('settings-open').click(); for (const [key, value] of Object.entries(values)) { const el = $(`setting-${key}`); if (el.type === 'checkbox') el.checked = value; else el.value = String(value); } await $('settings-form').emit('submit'); },
    restore() { globalThis.setTimeout = realSetTimeout; globalThis.clearTimeout = realClearTimeout; }
  };
  function $(id) { return ids.get(id); }
}
