const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Mock a lightweight browser environment to execute index.html logic
const domElements = {};

function createElement(tag, id = '', className = '') {
  return {
    tagName: tag.toUpperCase(),
    id: id,
    className: className,
    classList: {
      _classes: new Set(className ? className.split(' ') : []),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      },
      contains(c) { return this._classes.has(c); }
    },
    value: '',
    style: {},
    textContent: '',
    innerHTML: '',
    children: [],
    appendChild(child) { this.children.push(child); return child; },
    getContext() {
      return {
        clearRect() {}, fillRect() {}, strokeRect() {}, beginPath() {},
        moveTo() {}, lineTo() {}, arc() {}, ellipse() {}, fill() {}, stroke() {},
        save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; },
        roundRect() {}, closePath() {}, drawImage() {}
      };
    },
    getBoundingClientRect() {
      return { left: 50, right: 150, top: 400, bottom: 500, width: 100, height: 100 };
    }
  };
}

// Extract all elements with IDs from index.html
const idMatches = htmlContent.matchAll(/id=["']([a-zA-Z0-9_\-]+)["']/g);
for (const match of idMatches) {
  const id = match[1];
  if (!domElements[id]) {
    domElements[id] = createElement('div', id);
  }
}

// Special element types
domElements['playerNickInput'] = createElement('input', 'playerNickInput', 'form-input');
domElements['cpuPlayerNickInput'] = createElement('input', 'cpuPlayerNickInput', 'form-input');
domElements['joinCodeInput'] = createElement('input', 'joinCodeInput', 'form-input');
domElements['gameCanvas'] = createElement('canvas', 'gameCanvas');
domElements['menuCanvas'] = createElement('canvas', 'menuCanvas');
domElements['drumCanvasLeft'] = createElement('canvas', 'drumCanvasLeft');
domElements['drumCanvasRight'] = createElement('canvas', 'drumCanvasRight');

const documentMock = {
  getElementById(id) {
    if (!domElements[id]) {
      domElements[id] = createElement('div', id);
    }
    return domElements[id];
  },
  querySelector(sel) {
    if (sel.startsWith('#')) return this.getElementById(sel.slice(1));
    if (sel === '#playerNickInput') return domElements['playerNickInput'];
    if (sel === '#cpuPlayerNickInput') return domElements['cpuPlayerNickInput'];
    if (sel.includes('nickname')) return domElements['playerNickInput'];
    return createElement('div');
  },
  querySelectorAll(sel) {
    if (sel.includes('screen')) {
      return Object.values(domElements).filter(e => e.id && e.id.toLowerCase().includes('screen'));
    }
    if (sel.includes('diff-btn') || sel.includes('tab-btn')) {
      return [createElement('button'), createElement('button'), createElement('button')];
    }
    return [domElements['playerNickInput'], domElements['cpuPlayerNickInput']];
  },
  createElement(tag) {
    return createElement(tag);
  },
  addEventListener() {},
  body: createElement('body')
};

const windowMock = {
  innerWidth: 1280,
  innerHeight: 720,
  addEventListener() {},
  location: { href: 'http://localhost:3000/', search: '' },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = v; },
    removeItem(k) { delete this._data[k]; }
  },
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  AudioContext: class {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.sampleRate = 44100;
      this.destination = {};
    }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 1 }, connect() {} }; }
    createOscillator() { return { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
    createBiquadFilter() { return { frequency: { setValueAtTime() {} }, Q: { value: 1 }, connect() {} }; }
    createBuffer(c, l, r) { return { getChannelData() { return new Float32Array(l); } }; }
    createBufferSource() { return { connect() {}, start() {}, stop() {} }; }
    createConvolver() { return { connect() {} }; }
    resume() { return Promise.resolve(); }
  },
  Image: class {
    constructor() {
      this.complete = true;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      setTimeout(() => { if (this.onload) this.onload(); }, 10);
    }
  },
  Peer: class {
    constructor(id) {
      this.id = id || 'PEER1';
      setTimeout(() => {
        if (this._onOpen) this._onOpen(this.id);
      }, 10);
    }
    on(event, cb) {
      if (event === 'open') this._onOpen = cb;
      if (event === 'connection') this._onConn = cb;
    }
    connect() {
      return { on() {}, send() {} };
    }
    destroy() {}
  }
};

// Extract JS script from HTML
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('ERROR: Could not find <script> block in index.html');
  process.exit(1);
}

const jsCode = scriptMatch[1];

// Run the script in our context
const vm = require('vm');
const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  location: windowMock.location,
  localStorage: windowMock.localStorage,
  AudioContext: windowMock.AudioContext,
  webkitAudioContext: windowMock.AudioContext,
  Image: windowMock.Image,
  Peer: windowMock.Peer,
  URLSearchParams: class { get() { return null; } },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  performance: { now: () => Date.now() },
  Float32Array: Float32Array,
  Math: Math,
  confirm: () => true,
  prompt: () => ''
});

console.log('--- TESTING INDEX.HTML ENGINE ---');
try {
  vm.runInContext(jsCode, context);
  console.log('✔ Script parsed and initialized without errors.');

  // TEST 1: Test with typed nickname
  console.log('\nTEST 1: Digitando nickname "Django" e clicando em Criar Sala...');
  context.document.getElementById('playerNickInput').value = 'Django';

  const nick1 = context.getPlayerNickname('playerNickInput');
  console.log('  Nickname retornado:', nick1);
  if (nick1 !== 'Django') {
    throw new Error('Falha: esperava "Django", obteve: ' + nick1);
  }

  context.startHostRoom();
  const resNick = vm.runInContext('userNickname', context);
  const f1Name = vm.runInContext('fighter1.name', context);
  const roomCode = vm.runInContext('activeRoomCode', context);
  console.log('  userNickname definido como:', resNick);
  console.log('  fighter1.name definido como:', f1Name);
  console.log('  activeRoomCode gerado:', roomCode);
  console.log('  Lobby display code:', context.document.getElementById('lobbyCodeLabel').textContent);
  console.log('  Lobby message:', context.document.getElementById('lobbyMessage').textContent);

  if (resNick !== 'Django') {
    throw new Error('userNickname não corresponde a "Django"');
  }
  if (!roomCode || roomCode.length !== 5) {
    throw new Error('activeRoomCode não possui 5 caracteres');
  }
  console.log('✔ TEST 1 PASSOU COM SUCESSO!');

  // TEST 2: Test with empty nickname (automatic fallback)
  console.log('\nTEST 2: Campo de nickname vazio (Fallback automático)...');
  context.document.getElementById('playerNickInput').value = '   ';
  const nick2 = context.getPlayerNickname('playerNickInput');
  console.log('  Nickname automático gerado:', nick2);
  if (!nick2.startsWith('Pistoleiro_')) {
    throw new Error('Falha: esperava prefixo "Pistoleiro_", obteve: ' + nick2);
  }

  context.startHostRoom();
  const resNick2 = vm.runInContext('userNickname', context);
  const roomCode2 = vm.runInContext('activeRoomCode', context);
  console.log('  userNickname automático:', resNick2);
  console.log('  activeRoomCode novo:', roomCode2);
  console.log('✔ TEST 2 PASSOU COM SUCESSO!');

  // TEST 3: Test Entrar na Sala
  console.log('\nTEST 3: Entrar na Sala com código...');
  context.document.getElementById('playerNickInput').value = 'Doc Holliday';
  context.document.getElementById('joinCodeInput').value = 'ABCDE';
  context.startJoinRoom();
  const f2Name = vm.runInContext('fighter2.name', context);
  const roomCode3 = vm.runInContext('activeRoomCode', context);
  console.log('  fighter2.name definido como:', f2Name);
  console.log('  activeRoomCode sala:', roomCode3);
  if (f2Name !== 'Doc Holliday') {
    throw new Error('fighter2.name não corresponde a "Doc Holliday"');
  }
  console.log('✔ TEST 3 PASSOU COM SUCESSO!');

  // TEST 4: Test Modo CPU
  console.log('\nTEST 4: Modo Treino vs CPU...');
  context.document.getElementById('cpuPlayerNickInput').value = 'Billy';
  context.startSinglePlayerGame();
  const f1Cpu = vm.runInContext('fighter1.name', context);
  const f2Cpu = vm.runInContext('fighter2.name', context);
  const phase = vm.runInContext('currentPhase', context);
  console.log('  P1 nome:', f1Cpu);
  console.log('  P2 CPU nome:', f2Cpu);
  console.log('  Fase do jogo iniciada:', phase);
  if (f1Cpu !== 'Billy') {
    throw new Error('fighter1.name não corresponde a "Billy"');
  }
  console.log('✔ TEST 4 PASSOU COM SUCESSO!');

  console.log('\n🎉 TODOS OS 4 TESTES PASSARAM COM 100% DE SUCESSO!');
} catch (err) {
  console.error('❌ ERRO NO TESTE:', err);
  process.exit(1);
}
