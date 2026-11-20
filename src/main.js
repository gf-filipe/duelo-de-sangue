/* ==========================================================================
   DUELO DE SANGUE — ENGINE DEFINITIVA (REPLICA GUNBLOOD 100% CANVAS 2D)
   Sem arquivos externos | Mira no Canvas | 4 Personagens Articulados
   ========================================================================== */

'use strict';

// ==================== DEFINIÇÃO DOS 4 PISTOLEIROS (ESTILO GUNBLOOD) ====================
const GUNSLINGERS = [
  {
    id: 'sheriff',
    name: 'O Xerife',
    role: 'Carter',
    desc: 'Guardião da Lei • Veloz no saque',
    hatColor: '#d49b28',     // Chapéu clássico ocre/dourado
    hatBandColor: '#331a00',
    hairColor: '#4a2800',
    shirtColor: '#f0f0f0',   // Camisa branca com colete preto
    vestColor: '#1a1a1a',
    pantsColor: '#7a4214',   // Calça de couro marrom
    bootsColor: '#2b1404',
    spurs: true,
    facialType: 'goatee',    // Cavanhaque e óculos escuros / olhar focado
    holsterColor: '#3d1a04'
  },
  {
    id: 'outlaw',
    name: 'A Fora-da-Lei',
    role: 'Ruby',
    desc: 'Procurada Viva ou Morta • Rápida e letal',
    hatColor: '#1a1a1a',     // Chapéu preto estiloso
    hatBandColor: '#b31b1b', // Flor vermelha
    hairColor: '#8a1c6a',    // Cabelo magenta/roxo icônico
    shirtColor: '#242424',   // Top sem mangas
    vestColor: '#111111',
    pantsColor: '#141414',   // Calça ajustada preta
    bootsColor: '#0a0a0a',
    spurs: false,
    facialType: 'female',    // Rosto feminino com maquiagem de duelo
    holsterColor: '#2b1404'
  },
  {
    id: 'undertaker',
    name: 'O Coveiro',
    role: 'Mortimer',
    desc: 'Ninguém Escapa • Mede caixões',
    hatColor: '#121217',     // Cartola alta vitoriana
    hatBandColor: '#3a3a44',
    hairColor: '#5c483a',    // Cabelo longo castanho caindo no ombro
    shirtColor: '#2d3345',   // Camisa azul-escuro sóbria
    vestColor: '#141720',
    pantsColor: '#181b22',   // Calça preta
    bootsColor: '#0c0d12',
    spurs: false,
    facialType: 'beard',     // Barba cheia e olhar sombrio
    holsterColor: '#141720'
  },
  {
    id: 'bounty_hunter',
    name: 'O Caçador',
    role: 'Ramos',
    desc: 'Recompensa: 1000 Pesos • Tiro cirúrgico',
    hatColor: '#c98a28',     // Chapéu desgastado com aba caída
    hatBandColor: '#1c1005',
    hairColor: '#29180c',
    shirtColor: '#8a2020',   // Camisa vinho avermelhada
    vestColor: '#1f140a',
    pantsColor: '#2d446b',   // Jeans azul sob perneiras de couro
    bootsColor: '#965a1e',
    spurs: true,
    facialType: 'bandana',   // Bandana tapando nariz e boca
    holsterColor: '#4a2608'
  }
];

const OUTFIT_COLORS = ['#8B4513','#1a3a6a','#1e3d1c','#3b183b','#181818','#a61c00','#1b2b35','#5c4308'];
const OUTFIT_COLOR_NAMES = ['Marrom Clássico','Azul Noturno','Verde Musgo','Roxo Sombrio','Couro Negro','Escarlate','Cinza Cânion','Dourado Poente'];

// Constantes Físicas do Duelo
const BULLET_SPEED = 2600; // pixels por segundo
const GROUND_RATIO = 0.74;  // Altura proporcional do chão

// ==================== ESTADO DO JOGO ====================
let screenW = window.innerWidth;
let screenH = window.innerHeight;

let mainCanvas, mainCtx;
let menuCanvasEl, menuCtxEl;
let bloodStainsCanvas, bloodStainsCtx;

let currentPhase = 'load'; // load, menu, holding, countdown, fire, round_over
let activeGameMode = 'cpu';
let localRole = 'p1';
let cpuDifficulty = 0;
let isAudioMuted = false;

let chosenCharIndex = 0;
let chosenColorIndex = 0;
let userNickname = 'Pistoleiro';
let peerConnection = null;
let p2pDataChannel = null;
let activeRoomCode = '';

// Entidades dos Lutadores
let fighter1 = createFighterState('Pistoleiro 1', 0, OUTFIT_COLORS[0]);
let fighter2 = createFighterState('Oponente', 1, OUTFIT_COLORS[1]);

// Entidades Físicas Ativas
let activeBullets = [];
let bloodDrops = [];
let bulletImpactSparks = [];
let severedHeads = [];

// Cenário
let cloudsList = [];
let tumbleweedsList = [];

// Temporizadores & Animação
let countdownTicker = null;
let countdownCurrentSec = 3;
let countdownEverStarted = false;
let forfeitTimers = { p1: null, p2: null };
let fireInstantTimestamp = 0;
let cpuAimTimer = null;
let animationFrameId = null;
let lastFrameTimestamp = 0;

// Placar & Histórico
let duelMatchHistory = [];
let globalLeaderboard = JSON.parse(localStorage.getItem('gunblood_duel_ranking') || '[]');

// Posição da mira do jogador
let cursorAimX = screenW / 2;
let cursorAimY = screenH / 2;
let isCursorInCanvas = true;

// ==================== FÁBRICA DE LUTADORES ====================
function createFighterState(name, charIdx, color) {
  return {
    name: name,
    charIdx: charIdx,
    customColor: color,
    hp: 100,
    maxHp: 100,
    bullets: 6,
    score: 0,
    shotsFired: 0,
    shotsHit: 0,
    reactionTimeMs: 0,
    holdingDrum: false,
    readyForRematch: false,

    // Estados anatômicos e de dano
    isKneeling: false,     // Ajoelhado (tiro nas pernas)
    kneelProgress: 0,     // Interpolação para abaixar a hitbox suavemente
    isHeadless: false,     // Decapitado (Headshot)
    isBleeding: false,     // Sangramento ativo no tronco
    bleedDamageAccum: 0,
    isDead: false,

    // Articulação e Física
    aimAngle: 0,          // Ângulo do braço com o revólver (mira no cursor!)
    recoilAngle: 0,       // Coice vertical ao atirar
    knockbackX: 0,        // Recuo ao tomar tiro
    deathFallAngle: 0,
    deathFallY: 0,
    drumRotation: 0,

    consecutiveShots: 0,
    lastShotTime: 0,
    bulletHoles: []
  };
}

// ==========================================================================
// MÓDULO DE ÁUDIO SINTÉTICO (WEB AUDIO API - ZERO ARQUIVOS MP3)
// ==========================================================================
let audioEngine = {
  ctx: null,
  masterVolume: null,
  canyonReverbNode: null,
  isWhistling: false,

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.value = isAudioMuted ? 0 : 0.65;
    this.masterVolume.connect(this.ctx.destination);
    this.createCanyonReverb();
  },

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  createCanyonReverb() {
    if (!this.ctx) return;
    const rate = this.ctx.sampleRate;
    const length = rate * 2.0;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    const canyonTaps = [0.07, 0.2, 0.42, 0.75, 1.15, 1.5];
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      let decay = Math.exp(-t * 2.6);
      left[i] = (Math.random() * 2 - 1) * decay * 0.15;
      right[i] = (Math.random() * 2 - 1) * decay * 0.15;
      for (const tap of canyonTaps) {
        if (Math.abs(t - tap) < 0.005) {
          left[i] += (Math.random() * 2 - 1) * 0.28 * Math.exp(-tap * 2);
          right[i] += (Math.random() * 2 - 1) * 0.28 * Math.exp(-tap * 2);
        }
      }
    }
    this.canyonReverbNode = this.ctx.createConvolver();
    this.canyonReverbNode.buffer = impulse;
    this.canyonReverbNode.connect(this.masterVolume);
  },

  playWesternGuitarChord(chordType = 'Em') {
    if (!this.ctx || isAudioMuted) return;
    const chords = {
      'Em': [82.4, 123.5, 164.8, 196.0, 246.9, 329.6],
      'B7': [123.5, 155.6, 185.0, 246.9, 293.7],
      'Am': [110.0, 164.8, 220.0, 261.6, 329.6]
    };
    const notes = chords[chordType] || chords['Em'];
    notes.forEach((freq, idx) => {
      const stagger = idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + stagger);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 4.5, this.ctx.currentTime + stagger);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.8, this.ctx.currentTime + stagger + 1.8);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + stagger);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + stagger + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + stagger + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterVolume);
      if (this.canyonReverbNode) gain.connect(this.canyonReverbNode);

      osc.start(this.ctx.currentTime + stagger);
      osc.stop(this.ctx.currentTime + stagger + 2.1);
    });
  },

  playMorriconeWhistle() {
    if (!this.ctx || isAudioMuted || this.isWhistling) return;
    this.isWhistling = true;
    const melody = [
      { f: 587.3, d: 0.35, slideTo: 659.3 },
      { f: 659.3, d: 0.45, slideTo: 784.0 },
      { f: 784.0, d: 0.6,  slideTo: 587.3 },
      { f: 523.2, d: 0.75, slideTo: 440.0 }
    ];
    let startTime = this.ctx.currentTime + 0.05;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();

      vibrato.frequency.value = 5.5;
      vibratoGain.gain.value = 7.0;
      vibrato.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, startTime);
      osc.frequency.exponentialRampToValueAtTime(note.slideTo, startTime + note.d);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.11, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      osc.connect(gain);
      gain.connect(this.masterVolume);
      if (this.canyonReverbNode) gain.connect(this.canyonReverbNode);

      vibrato.start(startTime);
      osc.start(startTime);
      vibrato.stop(startTime + note.d);
      osc.stop(startTime + note.d);
      startTime += note.d + 0.08;
    });
    setTimeout(() => { this.isWhistling = false; }, 3400);
  },

  playHeartbeat(rateMultiplier = 1.0) {
    if (!this.ctx || isAudioMuted) return;
    const now = this.ctx.currentTime;
    this.createThump(now, 58, 0.4, 0.12);
    this.createThump(now + (0.16 / rateMultiplier), 48, 0.28, 0.15);
  },

  createThump(time, freq, vol, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterVolume);
    osc.start(time);
    osc.stop(time + duration);
  },

  playGunshot45() {
    if (!this.ctx || isAudioMuted) return;
    const now = this.ctx.currentTime;
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
    subGain.gain.setValueAtTime(0.75, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    subOsc.connect(subGain);
    subGain.connect(this.masterVolume);
    subOsc.start(now);
    subOsc.stop(now + 0.22);

    const bufSize = this.ctx.sampleRate * 0.12;
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1800, now);
    bandpass.Q.value = 1.4;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    noiseSrc.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(this.masterVolume);
    if (this.canyonReverbNode) noiseGain.connect(this.canyonReverbNode);
    noiseSrc.start(now);
  },

  playFleshImpact(isHeadshot = false) {
    if (!this.ctx || isAudioMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isHeadshot ? 450 : 280, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
    gain.gain.setValueAtTime(isHeadshot ? 0.6 : 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterVolume);
    osc.start(now);
    osc.stop(now + 0.2);

    if (isHeadshot) {
      const crackOsc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crackOsc.type = 'triangle';
      crackOsc.frequency.setValueAtTime(1200, now);
      crackOsc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      crackGain.gain.setValueAtTime(0.5, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      crackOsc.connect(crackGain);
      crackGain.connect(this.masterVolume);
      crackOsc.start(now);
      crackOsc.stop(now + 0.1);
    }
  },

  playRicochetSound() {
    if (!this.ctx || isAudioMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = 850 + Math.random() * 500;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(250 + Math.random() * 200, now + 0.18);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterVolume);
    if (this.canyonReverbNode) gain.connect(this.canyonReverbNode);
    osc.start(now);
    osc.stop(now + 0.22);
  },

  playFuneralBell() {
    if (!this.ctx || isAudioMuted) return;
    const now = this.ctx.currentTime;
    const bellPartials = [216, 432, 598, 864, 1190];
    const partialAmps = [0.45, 0.25, 0.15, 0.08, 0.04];
    bellPartials.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(partialAmps[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      osc.connect(gain);
      gain.connect(this.masterVolume);
      if (this.canyonReverbNode) gain.connect(this.canyonReverbNode);
      osc.start(now);
      osc.stop(now + 4.0);
    });
  },

  playDrumSpin() {
    if (!this.ctx || isAudioMuted) return;
    for (let i = 0; i < 6; i++) {
      const t = this.ctx.currentTime + (i * 0.035);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + i * 40, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      osc.connect(gain);
      gain.connect(this.masterVolume);
      osc.start(t);
      osc.stop(t + 0.03);
    }
  }
};

// ==========================================================================
// CENÁRIO COESO CARTOON WESTERN (INSPIRADO NA REFERÊNCIA DO USUÁRIO)
// ==========================================================================

function initBackgroundElements() {
  cloudsList = [];
  for (let i = 0; i < 7; i++) {
    cloudsList.push({
      x: Math.random() * screenW,
      y: screenH * (0.05 + Math.random() * 0.22),
      w: 80 + Math.random() * 110,
      h: 24 + Math.random() * 30,
      speed: 7 + Math.random() * 12,
      alpha: 0.3 + Math.random() * 0.35,
      puffs: 2 + Math.floor(Math.random() * 3)
    });
  }

  tumbleweedsList = [];
  spawnTumbleweed(true);
  spawnTumbleweed(false);

  bloodStainsCanvas = document.createElement('canvas');
  bloodStainsCanvas.width = screenW;
  bloodStainsCanvas.height = screenH;
  bloodStainsCtx = bloodStainsCanvas.getContext('2d');
  clearBloodStains();
}

function clearBloodStains() {
  if (bloodStainsCtx) {
    bloodStainsCtx.clearRect(0, 0, bloodStainsCanvas.width, bloodStainsCanvas.height);
  }
}

function spawnTumbleweed(randomX = false) {
  const groundY = screenH * GROUND_RATIO;
  tumbleweedsList.push({
    x: randomX ? Math.random() * screenW : -70,
    y: groundY + 10 + Math.random() * (screenH * 0.12),
    radius: 17 + Math.random() * 12,
    rotation: 0,
    speed: 40 + Math.random() * 55,
    bounceTimer: Math.random() * Math.PI
  });
}

function renderGunbloodEnvironment(ctx, dt) {
  const groundY = screenH * GROUND_RATIO;

  // 1. Céu Quente do Pôr do Sol
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#c24e00');
  skyGrad.addColorStop(0.3, '#df6d00');
  skyGrad.addColorStop(0.65, '#f09100');
  skyGrad.addColorStop(0.85, '#f9b51b');
  skyGrad.addColorStop(1, '#ffcf52');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, screenW, groundY);

  // 2. Sol Brilhante e Raios Solares
  const sunX = screenW * 0.42;
  const sunY = groundY * 0.46;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
  sunGlow.addColorStop(0, 'rgba(255,255,220,0.85)');
  sunGlow.addColorStop(0.25, 'rgba(255,210,80,0.4)');
  sunGlow.addColorStop(0.6, 'rgba(255,140,0,0.15)');
  sunGlow.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
  ctx.fill();

  const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 52);
  sunDisc.addColorStop(0, '#ffffff');
  sunDisc.addColorStop(0.6, '#fff49e');
  sunDisc.addColorStop(0.95, '#ffaa00');
  sunDisc.addColorStop(1, 'rgba(255,120,0,0)');
  ctx.fillStyle = sunDisc;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
  ctx.fill();

  // 3. Nuvens Suaves
  cloudsList.forEach(cloud => {
    cloud.x -= cloud.speed * dt;
    if (cloud.x < -cloud.w * 2) {
      cloud.x = screenW + cloud.w;
      cloud.y = screenH * (0.05 + Math.random() * 0.22);
    }
    ctx.fillStyle = `rgba(255,220,160,${cloud.alpha})`;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let p = 0; p < cloud.puffs; p++) {
      const px = cloud.x + (-cloud.w * 0.5 + p * (cloud.w / (cloud.puffs - 1 || 1)));
      ctx.beginPath();
      ctx.ellipse(px, cloud.y - cloud.h * 0.25, cloud.w * 0.4, cloud.h * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 4. Edifícios da Cidade Velha (Saloon, Banco, Cadeia, Fachadas de Madeira)
  renderTownBuildings(ctx, groundY);

  // 5. Cruzamento Ferroviário, Carroça Western & Cactos
  renderWesternProps(ctx, groundY);

  // 6. Chão de Terra/Areia Alaranjada
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, screenH);
  groundGrad.addColorStop(0, '#c7581a');
  groundGrad.addColorStop(0.2, '#aa4512');
  groundGrad.addColorStop(0.65, '#7a2c07');
  groundGrad.addColorStop(1, '#3b1202');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, screenW, screenH - groundY);

  // Pequenos arbustos e pedras no solo
  renderGroundDetails(ctx, groundY);

  // 7. Manchas Persistentes de Sangue Respingado
  ctx.drawImage(bloodStainsCanvas, 0, 0);

  // 8. Tumbleweeds
  renderTumbleweeds(ctx, dt);
}

function renderTownBuildings(ctx, groundY) {
  // Prédio 1 (Saloon à Esquerda)
  const b1X = screenW * 0.02;
  const b1W = screenW * 0.18;
  const b1H = screenH * 0.32;
  const b1Top = groundY - b1H;
  drawWoodenBuilding(ctx, b1X, b1Top, b1W, b1H, '#613414', '#45220a', 'SALOON', true);

  // Prédio 2 (Gabinete do Xerife no Centro-Esquerda)
  const b2X = screenW * 0.22;
  const b2W = screenW * 0.16;
  const b2H = screenH * 0.28;
  const b2Top = groundY - b2H;
  drawWoodenBuilding(ctx, b2X, b2Top, b2W, b2H, '#542c10', '#3b1c08', 'SHERIFF', false);

  // Prédio 3 (Hotel/Loja no Centro-Direita)
  const b3X = screenW * 0.44;
  const b3W = screenW * 0.19;
  const b3H = screenH * 0.34;
  const b3Top = groundY - b3H;
  drawWoodenBuilding(ctx, b3X, b3Top, b3W, b3H, '#6e3c18', '#4d270c', 'HOTEL', true);

  // Prédio 4 (Banco à Direita)
  const b4X = screenW * 0.68;
  const b4W = screenW * 0.18;
  const b4H = screenH * 0.3;
  const b4Top = groundY - b4H;
  drawWoodenBuilding(ctx, b4X, b4Top, b4W, b4H, '#5a3012', '#3e1e0a', 'BANK', false);
}

function drawWoodenBuilding(ctx, x, y, w, h, baseColor, plankDark, title, hasWheel) {
  // Fachada
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#220e03';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Roda de Carroça Decorativa no Topo (Estilo Imagem 2)
  if (hasWheel) {
    ctx.save();
    ctx.translate(x + w * 0.5, y - 8);
    ctx.strokeStyle = '#2d1404';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.18, Math.PI, 0);
    ctx.stroke();
    for (let r = 0; r < 5; r++) {
      const a = Math.PI + (r / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * w * 0.18, Math.sin(a) * w * 0.18);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Tábuas horizontais
  ctx.strokeStyle = plankDark;
  ctx.lineWidth = 1.5;
  const planks = 12;
  for (let i = 1; i < planks; i++) {
    const py = y + (h / planks) * i;
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }

  // Toldo / Alpendre
  ctx.fillStyle = '#361806';
  ctx.fillRect(x - 4, y + h * 0.44, w + 8, 8);
  ctx.fillRect(x + 5, y + h * 0.44, 5, h * 0.56);
  ctx.fillRect(x + w - 10, y + h * 0.44, 5, h * 0.56);

  // Janelas com reflexo azul celeste
  ctx.fillStyle = '#94d1e6';
  const winCount = 3;
  const winW = (w * 0.6) / winCount;
  for (let wi = 0; wi < winCount; wi++) {
    const wx = x + w * 0.15 + wi * (winW + w * 0.05);
    ctx.fillRect(wx, y + 25, winW, 22);
    ctx.strokeStyle = '#1a0b02';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wx, y + 25, winW, 22);
    // Grade da janela
    ctx.beginPath();
    ctx.moveTo(wx + winW / 2, y + 25);
    ctx.lineTo(wx + winW / 2, y + 47);
    ctx.moveTo(wx, y + 36);
    ctx.lineTo(wx + winW, y + 36);
    ctx.stroke();
  }

  // Placa com Letreiro
  ctx.fillStyle = '#240f04';
  ctx.fillRect(x + w * 0.1, y + 6, w * 0.8, 16);
  ctx.fillStyle = '#ffcc44';
  ctx.font = 'bold 10px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w * 0.5, y + 18);
}

function renderWesternProps(ctx, groundY) {
  // 1. Sinalização Ferroviária com Poste Listrado (Igual Referência 2)
  const railX = screenW * 0.21;
  const railH = screenH * 0.28;
  const railTop = groundY - railH;

  // Poste listrado amarelo e preto
  for (let s = 0; s < 8; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#ffcc00' : '#111';
    ctx.fillRect(railX, railTop + s * (railH / 8), 7, railH / 8);
  }
  // Placa X do cruzamento
  ctx.save();
  ctx.translate(railX + 3.5, railTop + 24);
  ctx.fillStyle = '#ffcc00';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  // Barra 1
  ctx.save(); ctx.rotate(0.5); ctx.fillRect(-22, -4, 44, 8); ctx.strokeRect(-22, -4, 44, 8); ctx.restore();
  // Barra 2
  ctx.save(); ctx.rotate(-0.5); ctx.fillRect(-22, -4, 44, 8); ctx.strokeRect(-22, -4, 44, 8); ctx.restore();
  // Luzes vermelha e verde
  ctx.fillStyle = '#ff2200'; ctx.beginPath(); ctx.arc(-14, 18, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#00dd44'; ctx.beginPath(); ctx.arc(14, 18, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 2. Pilha de 3 Barris de Uísque
  const barrelX = screenW * 0.35;
  drawBarrel(ctx, barrelX, groundY - 32, 22, 32);
  drawBarrel(ctx, barrelX + 24, groundY - 32, 22, 32);
  drawBarrel(ctx, barrelX + 12, groundY - 60, 22, 30);

  // 3. Carroça Western com Teto de Lona Branco (Covered Wagon)
  const wagonX = screenW * 0.69;
  const wagonW = screenW * 0.12;
  const wagonH = screenH * 0.16;

  // Teto de lona branca
  ctx.fillStyle = '#f0ede6';
  ctx.beginPath();
  ctx.ellipse(wagonX + wagonW * 0.5, groundY - wagonH * 0.8, wagonW * 0.48, wagonH * 0.4, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#c4beb1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Corpo de madeira da carroça
  ctx.fillStyle = '#5c3110';
  ctx.fillRect(wagonX + wagonW * 0.1, groundY - wagonH * 0.48, wagonW * 0.8, wagonH * 0.28);

  // Rodas de madeira com raios
  drawSpokedWheel(ctx, wagonX + wagonW * 0.24, groundY - 14, 16);
  drawSpokedWheel(ctx, wagonX + wagonW * 0.78, groundY - 16, 20);

  // 4. Cactos Saguaro Verdes
  drawCactus(ctx, screenW * 0.27, groundY, 48);
  drawCactus(ctx, screenW * 0.87, groundY, 65);
}

function drawBarrel(ctx, x, y, w, h) {
  ctx.fillStyle = '#543013';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.5, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#220e03';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Aros de ferro
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 8); ctx.lineTo(x + w - 2, y + 8);
  ctx.moveTo(x, y + h - 8); ctx.lineTo(x + w, y + h - 8);
  ctx.stroke();
}

function drawSpokedWheel(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#3d1a04';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 8; s++) {
    const a = (s / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCactus(ctx, x, y, h) {
  ctx.save();
  ctx.fillStyle = '#2c7a2e';
  ctx.strokeStyle = '#184719';
  ctx.lineWidth = 2;
  // Tronco central
  ctx.beginPath();
  ctx.roundRect(x - 5, y - h, 10, h, 5);
  ctx.fill();
  ctx.stroke();
  // Braço esquerdo
  ctx.beginPath();
  ctx.moveTo(x - 5, y - h * 0.55);
  ctx.lineTo(x - 18, y - h * 0.55);
  ctx.lineTo(x - 18, y - h * 0.85);
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();
  // Braço direito
  ctx.beginPath();
  ctx.moveTo(x + 5, y - h * 0.4);
  ctx.lineTo(x + 16, y - h * 0.4);
  ctx.lineTo(x + 16, y - h * 0.7);
  ctx.stroke();
  ctx.restore();
}

function renderGroundDetails(ctx, groundY) {
  // Arbustos verdes e tufos de deserto (Igual Imagem 2)
  const bushPositions = [0.05, 0.18, 0.32, 0.48, 0.62, 0.78, 0.92];
  ctx.fillStyle = '#1e5922';
  bushPositions.forEach((pos, idx) => {
    const bx = screenW * pos;
    const by = groundY + 18 + (idx % 3) * 14;
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.arc(bx - 5, by + 2, 5, 0, Math.PI * 2);
    ctx.arc(bx + 5, by + 2, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderTumbleweeds(ctx, dt) {
  tumbleweedsList.forEach((tw, idx) => {
    tw.x += tw.speed * dt;
    tw.rotation += tw.speed * dt * 0.08;
    tw.bounceTimer += dt * 4;
    const bounceOffset = Math.abs(Math.sin(tw.bounceTimer)) * 12;

    if (tw.x > screenW + 80) {
      tumbleweedsList.splice(idx, 1);
      setTimeout(() => spawnTumbleweed(false), 2000 + Math.random() * 4000);
      return;
    }

    ctx.save();
    ctx.translate(tw.x, tw.y - bounceOffset);
    ctx.rotate(tw.rotation);
    ctx.strokeStyle = 'rgba(135,92,48,0.85)';
    ctx.lineWidth = 1.8;
    for (let a = 0; a < 6; a++) {
      ctx.save();
      ctx.rotate((a / 6) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, tw.radius, tw.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, tw.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

// ==========================================================================
// RENDERIZAÇÃO DOS 4 PERSONAGENS ARTICULADOS (ESTILO GUNBLOOD ORIGINAL)
// ==========================================================================

function getFighterCoords(role) {
  const groundY = screenH * GROUND_RATIO;
  const x = role === 'p1' ? screenW * 0.22 : screenW * 0.78;
  return { x, y: groundY };
}

function renderGunbloodCharacter(ctx, fighter, role, dt, customScale = null) {
  const coords = getFighterCoords(role);
  const isP2 = role === 'p2';
  const scale = customScale || (Math.min(screenW, screenH) / 640);
  const charData = GUNSLINGERS[fighter.charIdx] || GUNSLINGERS[0];

  // Animação de ajoelhar ao ser atingido nas pernas
  if (fighter.isKneeling && fighter.kneelProgress < 1.0) {
    fighter.kneelProgress = Math.min(1.0, fighter.kneelProgress + dt * 4.0);
  }
  const kneelY = fighter.kneelProgress * (42 * scale);

  // Coice e recuo
  if (fighter.recoilAngle > 0) {
    fighter.recoilAngle = Math.max(0, fighter.recoilAngle - dt * 5.0);
  }
  if (fighter.knockbackX !== 0) {
    fighter.knockbackX *= 0.88;
    if (Math.abs(fighter.knockbackX) < 0.2) fighter.knockbackX = 0;
  }

  // Animação de queda ao morrer
  if (fighter.isDead) {
    if (fighter.deathFallAngle < Math.PI / 2.15) {
      fighter.deathFallAngle = Math.min(Math.PI / 2.15, fighter.deathFallAngle + dt * 3.0);
    }
    if (fighter.deathFallY < 24 * scale) {
      fighter.deathFallY = Math.min(24 * scale, fighter.deathFallY + dt * 80 * scale);
    }
  }

  // Sangramento Ativo no Tronco (DoT)
  if (fighter.isBleeding && !fighter.isDead && currentPhase === 'fire') {
    fighter.bleedDamageAccum += dt * 3.5;
    if (fighter.bleedDamageAccum >= 1.0) {
      const dmg = Math.floor(fighter.bleedDamageAccum);
      fighter.bleedDamageAccum -= dmg;
      fighter.hp = Math.max(1, fighter.hp - dmg);
      updateHUDStats();
      // Gotas de sangue pingando do peito
      spawnBloodFountain(coords.x + fighter.knockbackX, coords.y - (32 * scale) + kneelY, 2, isP2 ? -60 : 60, -20);
    }
  }

  ctx.save();
  const drawX = coords.x + fighter.knockbackX + (fighter.isDead ? (isP2 ? 22 : -22) * (fighter.deathFallY / 24) : 0);
  const drawY = coords.y + (fighter.isDead ? fighter.deathFallY : 0);

  ctx.translate(drawX, drawY);
  if (isP2) ctx.scale(-1, 1); // P2 espelhado olhando para a esquerda

  if (fighter.isDead) {
    ctx.rotate(fighter.deathFallAngle);
  }

  // 1. Sombra Suave no Solo
  if (!fighter.isDead) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(0, 3, 36 * scale, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Pernas (Postura Clássica de Saque Gunblood ou Ajoelhado!)
  renderArticulatedLegs(ctx, charData, fighter, scale, kneelY);

  // 3. Tronco, Colete, Cinto e Coldre
  renderArticulatedTorso(ctx, charData, fighter, scale, kneelY);

  // 4. Braço Armado Articulado com Revólver Prateado
  renderArticulatedArmedArm(ctx, charData, fighter, scale, kneelY, isP2);

  // 5. Cabeça Articulada (ou Toco com Jato Arterial se Decapitado!)
  if (!fighter.isHeadless) {
    renderArticulatedHead(ctx, charData, fighter, scale, kneelY);
  } else {
    renderNeckStumpGeyser(ctx, scale, kneelY);
  }

  ctx.restore();
}

// 1. Pernas: Postura de Passo Gunblood com Botas e Esporas
function renderArticulatedLegs(ctx, charData, fighter, S, kY) {
  if (!fighter.isKneeling) {
    // Pernas em postura de passo aberto (Forward Stride Gunblood)
    const legColor = charData.pantsColor;

    // Perna de trás (Esquerda)
    ctx.fillStyle = legColor;
    ctx.beginPath();
    ctx.moveTo(-16 * S, (22 * S) - kY);
    ctx.lineTo(-28 * S, (54 * S) - kY);
    ctx.lineTo(-20 * S, (75 * S) - kY);
    ctx.lineTo(-6 * S, (75 * S) - kY);
    ctx.lineTo(-6 * S, (22 * S) - kY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.6 * S;
    ctx.stroke();

    // Bota de trás com espora
    ctx.fillStyle = charData.bootsColor;
    ctx.beginPath();
    ctx.roundRect(-24 * S, (74 * S) - kY, 26 * S, 14 * S, [0, 0, 4 * S, 4 * S]);
    ctx.fill();
    ctx.stroke();
    if (charData.spurs) drawSpur(ctx, -20 * S, (82 * S) - kY, 6 * S);

    // Perna da frente (Direita - avançada no duelo)
    ctx.fillStyle = legColor;
    ctx.beginPath();
    ctx.moveTo(2 * S, (22 * S) - kY);
    ctx.lineTo(16 * S, (52 * S) - kY);
    ctx.lineTo(24 * S, (74 * S) - kY);
    ctx.lineTo(10 * S, (74 * S) - kY);
    ctx.lineTo(-2 * S, (50 * S) - kY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bota da frente
    ctx.fillStyle = charData.bootsColor;
    ctx.beginPath();
    ctx.roundRect(8 * S, (72 * S) - kY, 28 * S, 15 * S, [0, 0, 5 * S, 5 * S]);
    ctx.fill();
    ctx.stroke();
    if (charData.spurs) drawSpur(ctx, 12 * S, (82 * S) - kY, 6 * S);
  } else {
    // Pernas Ajoelhadas no Solo (Hitbox Abaixada!)
    ctx.fillStyle = charData.pantsColor;
    ctx.beginPath();
    ctx.roundRect(-24 * S, 42 * S, 32 * S, 18 * S, 6 * S);
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.6 * S;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-6 * S, 56 * S, 36 * S, 16 * S, 5 * S);
    ctx.fill();
    ctx.stroke();

    // Bota deitada
    ctx.fillStyle = charData.bootsColor;
    ctx.fillRect(26 * S, 56 * S, 18 * S, 15 * S);
    ctx.strokeRect(26 * S, 56 * S, 18 * S, 15 * S);

    // Mancha de sangue nos joelhos feridos
    ctx.fillStyle = '#800000';
    ctx.beginPath();
    ctx.arc(-16 * S, 50 * S, 9 * S, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpur(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.stroke();
  ctx.restore();
}

// 2. Tronco, Camisa, Colete, Braço Esquerdo de Apoio e Coldre
function renderArticulatedTorso(ctx, charData, fighter, S, kY) {
  const topY = (-74 * S) + kY;
  const botY = (24 * S) + kY;

  // Braço Esquerdo (Descanso / Pose Clássica)
  ctx.save();
  ctx.translate(-26 * S, topY + 12 * S);
  ctx.rotate(-0.35);
  ctx.fillStyle = charData.shirtColor;
  ctx.beginPath();
  ctx.roundRect(-8 * S, 0, 16 * S, 44 * S, 5 * S);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.5 * S;
  ctx.stroke();
  // Mão
  ctx.fillStyle = '#d49b6a';
  ctx.beginPath();
  ctx.arc(0, 44 * S, 7 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Torso / Colete com Gradiente Flash Estilo Gunblood
  const vestGrad = ctx.createLinearGradient(-30 * S, topY, 30 * S, botY);
  vestGrad.addColorStop(0, fighter.customColor || charData.vestColor);
  vestGrad.addColorStop(1, charData.vestColor);
  ctx.fillStyle = vestGrad;

  ctx.beginPath();
  ctx.moveTo(-28 * S, topY);
  ctx.lineTo(-32 * S, botY);
  ctx.lineTo(26 * S, botY);
  ctx.lineTo(24 * S, topY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.8 * S;
  ctx.stroke();

  // Camisa aparente no decote / colarinho
  ctx.fillStyle = charData.shirtColor;
  ctx.beginPath();
  ctx.moveTo(-10 * S, topY);
  ctx.lineTo(0, topY + 16 * S);
  ctx.lineTo(10 * S, topY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cinto de Couro com Coldre e Fivela de Metal
  ctx.fillStyle = charData.holsterColor;
  ctx.fillRect(-34 * S, botY - 14 * S, 64 * S, 12 * S);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.5 * S;
  ctx.strokeRect(-34 * S, botY - 14 * S, 64 * S, 12 * S);

  // Fivela dourada
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(-6 * S, botY - 16 * S, 14 * S, 16 * S);
  ctx.strokeRect(-6 * S, botY - 16 * S, 14 * S, 16 * S);

  // Coldre descendo na coxa
  ctx.fillStyle = charData.holsterColor;
  ctx.beginPath();
  ctx.moveTo(12 * S, botY - 8 * S);
  ctx.lineTo(24 * S, botY + 28 * S);
  ctx.lineTo(8 * S, botY + 28 * S);
  ctx.lineTo(4 * S, botY - 8 * S);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Furos de Bala no Tronco
  fighter.bulletHoles.forEach(h => {
    ctx.fillStyle = '#0a0000';
    ctx.beginPath();
    ctx.arc(h.x * S, (h.y * S) + kY, 4 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(120,0,0,0.7)';
    ctx.beginPath();
    ctx.ellipse(h.x * S, (h.y * S) + kY + 4 * S, 6 * S, 9 * S, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 3. Braço com Revólver: Articula no Ombro e Mira Diretamente no Cursor!
function renderArticulatedArmedArm(ctx, charData, fighter, S, kY, isP2) {
  ctx.save();
  const shoulderX = 18 * S;
  const shoulderY = (-52 * S) + kY;
  ctx.translate(shoulderX, shoulderY);

  // Ângulo de mira com coice suave
  let rot = fighter.aimAngle;
  if (isP2) rot = -rot;
  rot -= fighter.recoilAngle * 0.45;
  ctx.rotate(rot);

  // Braço superior
  ctx.fillStyle = charData.shirtColor;
  ctx.beginPath();
  ctx.roundRect(-8 * S, -8 * S, 16 * S, 40 * S, 5 * S);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.6 * S;
  ctx.stroke();

  // Mão
  ctx.fillStyle = '#d49b6a';
  ctx.beginPath();
  ctx.arc(0, 40 * S, 7 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Revólver Prateado Longo de Gunblood (Silver Peacemaker)
  ctx.save();
  ctx.translate(2 * S, 40 * S);
  ctx.rotate(Math.PI / 2); // Alinha com o braço

  // Coronha
  ctx.fillStyle = '#261205';
  ctx.beginPath();
  ctx.roundRect(-5 * S, 4 * S, 9 * S, 16 * S, [2 * S, 2 * S, 5 * S, 5 * S]);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();

  // Armação e Tambor Prateado
  const metalGrad = ctx.createLinearGradient(0, -6 * S, 30 * S, 6 * S);
  metalGrad.addColorStop(0, '#ffffff');
  metalGrad.addColorStop(0.5, '#cccccc');
  metalGrad.addColorStop(1, '#777777');
  ctx.fillStyle = metalGrad;
  ctx.fillRect(0, -5 * S, 16 * S, 18 * S);
  ctx.strokeRect(0, -5 * S, 16 * S, 18 * S);

  // Tambor Flautado
  ctx.fillStyle = '#999999';
  ctx.fillRect(4 * S, -3 * S, 14 * S, 14 * S);
  ctx.strokeRect(4 * S, -3 * S, 14 * S, 14 * S);

  // Cano Prateado Longo
  ctx.fillStyle = metalGrad;
  ctx.fillRect(18 * S, 0, 36 * S, 7 * S);
  ctx.strokeRect(18 * S, 0, 36 * S, 7 * S);

  // Mira da ponta do cano
  ctx.fillStyle = '#333';
  ctx.fillRect(52 * S, -3 * S, 3 * S, 4 * S);

  // Clarão de Tiro (Muzzle Flash)
  if (fighter.recoilAngle > 0.15) {
    drawMuzzleFlash(ctx, 56 * S, 3.5 * S, S);
  }

  ctx.restore();
  ctx.restore();
}

function drawMuzzleFlash(ctx, x, y, S) {
  ctx.save();
  ctx.translate(x, y);
  const flashGrad = ctx.createRadialGradient(0, 0, 2 * S, 0, 0, 26 * S);
  flashGrad.addColorStop(0, 'rgba(255,255,240,0.95)');
  flashGrad.addColorStop(0.35, 'rgba(255,190,0,0.85)');
  flashGrad.addColorStop(0.7, 'rgba(255,70,0,0.4)');
  flashGrad.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = flashGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 26 * S, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 4. Cabeça: Estilo Gunblood em Perfil 3/4 com Chapéus Distintos
function renderArticulatedHead(ctx, charData, fighter, S, kY) {
  const headY = (-104 * S) + kY;

  // Cabelo de Trás (se for Coveiro ou Fora-da-Lei)
  if (charData.id === 'undertaker') {
    ctx.fillStyle = charData.hairColor;
    ctx.beginPath();
    ctx.moveTo(-16 * S, headY - 10 * S);
    ctx.lineTo(-24 * S, headY + 32 * S);
    ctx.lineTo(-6 * S, headY + 28 * S);
    ctx.closePath();
    ctx.fill();
  } else if (charData.id === 'outlaw') {
    ctx.fillStyle = charData.hairColor;
    ctx.beginPath();
    ctx.moveTo(-14 * S, headY - 8 * S);
    ctx.lineTo(-22 * S, headY + 26 * S);
    ctx.lineTo(-6 * S, headY + 22 * S);
    ctx.closePath();
    ctx.fill();
  }

  // Rosto em Perfil Estilo Flash
  ctx.fillStyle = '#d49b6a';
  ctx.beginPath();
  ctx.moveTo(-16 * S, headY - 14 * S);
  ctx.lineTo(8 * S, headY - 14 * S);
  ctx.lineTo(16 * S, headY);
  ctx.lineTo(12 * S, headY + 12 * S);
  ctx.lineTo(0, headY + 24 * S);
  ctx.lineTo(-14 * S, headY + 18 * S);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.6 * S;
  ctx.stroke();

  // Detalhes Faciais por Personagem
  if (charData.facialType === 'bandana') {
    // Bandana Cobrindo Nariz e Boca (O Caçador)
    ctx.fillStyle = '#1c498a';
    ctx.beginPath();
    ctx.moveTo(-12 * S, headY + 2 * S);
    ctx.lineTo(16 * S, headY + 2 * S);
    ctx.lineTo(4 * S, headY + 24 * S);
    ctx.lineTo(-12 * S, headY + 20 * S);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (charData.facialType === 'goatee') {
    // Cavanhaque e Óculos de Duelo (O Xerife)
    ctx.fillStyle = '#301804';
    ctx.beginPath();
    ctx.arc(6 * S, headY + 16 * S, 5 * S, 0, Math.PI * 2);
    ctx.fill();
  } else if (charData.facialType === 'beard') {
    // Barba Longa de Coveiro
    ctx.fillStyle = charData.hairColor;
    ctx.beginPath();
    ctx.moveTo(-10 * S, headY + 10 * S);
    ctx.lineTo(12 * S, headY + 10 * S);
    ctx.lineTo(8 * S, headY + 28 * S);
    ctx.lineTo(-4 * S, headY + 26 * S);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Olho de Duelo Estilo Gunblood (Focado)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(4 * S, headY - 2 * S, 4.5 * S, 2.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(5 * S, headY - 2 * S, 2 * S, 0, Math.PI * 2);
  ctx.fill();
  // Sobrancelha
  ctx.strokeStyle = '#220e03';
  ctx.lineWidth = 1.8 * S;
  ctx.beginPath();
  ctx.moveTo(1 * S, headY - 6 * S);
  ctx.lineTo(9 * S, headY - 5 * S);
  ctx.stroke();

  // Chapéu Estilizado por Personagem
  if (charData.id === 'undertaker') {
    // Cartola Alta Vitoriana (O Coveiro)
    ctx.fillStyle = charData.hatColor;
    // Aba reta
    ctx.fillRect(-26 * S, headY - 17 * S, 52 * S, 7 * S);
    ctx.strokeRect(-26 * S, headY - 17 * S, 52 * S, 7 * S);
    // Copa alta
    ctx.fillRect(-16 * S, headY - 58 * S, 32 * S, 42 * S);
    ctx.strokeRect(-16 * S, headY - 58 * S, 32 * S, 42 * S);
    // Fita da cartola
    ctx.fillStyle = charData.hatBandColor;
    ctx.fillRect(-16 * S, headY - 26 * S, 32 * S, 9 * S);
  } else if (charData.id === 'outlaw') {
    // Chapéu Elegante com Flor Vermelha (A Fora-da-Lei)
    ctx.fillStyle = charData.hatColor;
    ctx.beginPath();
    ctx.ellipse(0, headY - 16 * S, 38 * S, 8 * S, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Copa
    ctx.beginPath();
    ctx.roundRect(-16 * S, headY - 44 * S, 30 * S, 28 * S, 6 * S);
    ctx.fill();
    ctx.stroke();
    // Flor Vermelha na Aba
    ctx.fillStyle = '#ff2255';
    ctx.beginPath();
    ctx.arc(-14 * S, headY - 22 * S, 5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Chapéu Cowboy de Faroeste Clássico (O Xerife & O Caçador)
    const hatGrad = ctx.createLinearGradient(-30 * S, headY - 50 * S, 30 * S, headY - 16 * S);
    hatGrad.addColorStop(0, charData.hatColor);
    hatGrad.addColorStop(1, '#7a4214');
    ctx.fillStyle = hatGrad;

    // Aba larga curvada
    ctx.beginPath();
    ctx.ellipse(0, headY - 16 * S, 42 * S, 8 * S, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.6 * S;
    ctx.stroke();

    // Copa com vinco central (Cattleman Crease)
    ctx.beginPath();
    ctx.moveTo(-18 * S, headY - 16 * S);
    ctx.lineTo(-14 * S, headY - 46 * S);
    ctx.lineTo(0, headY - 42 * S);
    ctx.lineTo(14 * S, headY - 46 * S);
    ctx.lineTo(18 * S, headY - 16 * S);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Faixa do chapéu
    ctx.fillStyle = charData.hatBandColor;
    ctx.fillRect(-17 * S, headY - 24 * S, 34 * S, 6 * S);
  }
}

function renderNeckStumpGeyser(ctx, S, kY) {
  const neckY = (-74 * S) + kY;
  ctx.fillStyle = '#500000';
  ctx.beginPath();
  ctx.ellipse(0, neckY, 14 * S, 6 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, neckY, 3 * S, 0, Math.PI * 2);
  ctx.fill();
}

// ==========================================================================
// MIRA (CROSSHAIR) DESENHADA DIRETAMENTE NO CANVAS (ALTA VISIBILIDADE)
// ==========================================================================

function renderGunbloodCrosshair(ctx, x, y) {
  if (currentPhase === 'menu' || currentPhase === 'load') return;

  ctx.save();
  ctx.translate(x, y);

  const isFogo = currentPhase === 'fire';
  const mainColor = isFogo ? '#ff1100' : '#f5b342';
  const accentColor = isFogo ? '#ffea00' : '#ffffff';

  // 1. Círculo Externo
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Traços Reticulares
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  // Superior
  ctx.moveTo(0, -6); ctx.lineTo(0, -22);
  // Inferior
  ctx.moveTo(0, 6);  ctx.lineTo(0, 22);
  // Esquerdo
  ctx.moveTo(-6, 0); ctx.lineTo(-22, 0);
  // Direito
  ctx.moveTo(6, 0);  ctx.lineTo(22, 0);
  ctx.stroke();

  // 3. Ponto Central de Precisão
  ctx.fillStyle = isFogo ? '#ffff00' : '#ff4400';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==========================================================================
// FÍSICA REAL DO PROJÉTIL, HITBOXES E GORE (GUNBLOOD CLÁSSICO)
// ==========================================================================

function getMuzzleWorldCoords(role) {
  const coords = getFighterCoords(role);
  const fighter = role === 'p1' ? fighter1 : fighter2;
  const isP2 = role === 'p2';
  const scale = Math.min(screenW, screenH) / 640;
  const kneelY = fighter.kneelProgress * (42 * scale);

  const shoulderX = coords.x + (isP2 ? -18 : 18) * scale;
  const shoulderY = coords.y + ((-52 * scale) + kneelY);

  const angle = fighter.aimAngle;
  const gunLength = 95 * scale;
  const muzzleX = shoulderX + Math.cos(angle) * gunLength;
  const muzzleY = shoulderY + Math.sin(angle) * gunLength;

  return { x: muzzleX, y: muzzleY, shoulderX, shoulderY };
}

function getFighterActiveHitboxes(fighter, role) {
  const coords = getFighterCoords(role);
  const scale = Math.min(screenW, screenH) / 640;
  const kneelY = fighter.kneelProgress * (42 * scale);
  const x = coords.x + fighter.knockbackX;
  const y = coords.y;

  const boxes = [];

  // 1. Cabeça (Se não decapitada!)
  if (!fighter.isHeadless) {
    boxes.push({
      part: 'head',
      damage: 100, // Headshot instantâneo!
      x: x - (24 * scale),
      y: y - (148 * scale) + kneelY,
      w: 48 * scale,
      h: 52 * scale
    });
  }

  // 2. Tronco
  boxes.push({
    part: 'torso',
    damage: 40,
    x: x - (42 * scale),
    y: y - (94 * scale) + kneelY,
    w: 84 * scale,
    h: 86 * scale
  });

  // 3. Braço Armado
  const armX = role === 'p1' ? x + (14 * scale) : x - (40 * scale);
  boxes.push({
    part: 'arm',
    damage: 20,
    x: armX,
    y: y - (68 * scale) + kneelY,
    w: 26 * scale,
    h: 56 * scale
  });

  // 4. Pernas (Em pé ou Ajoelhadas!)
  if (!fighter.isKneeling) {
    boxes.push({
      part: 'legs',
      damage: 25,
      x: x - (26 * scale),
      y: y + (22 * scale),
      w: 52 * scale,
      h: 62 * scale
    });
  } else {
    boxes.push({
      part: 'legs',
      damage: 20,
      x: x - (32 * scale),
      y: y + (36 * scale),
      w: 68 * scale,
      h: 36 * scale
    });
  }

  return boxes;
}

function triggerFireBullet(shooterRole) {
  if (currentPhase !== 'fire') return;
  const shooter = shooterRole === 'p1' ? fighter1 : fighter2;
  if (shooter.bullets <= 0 || shooter.isDead) return;

  shooter.bullets--;
  shooter.shotsFired++;
  shooter.drumRotation += Math.PI / 3;

  // Coice e dispersão de tiro rápido
  const now = performance.now();
  if (now - shooter.lastShotTime < 400) {
    shooter.consecutiveShots = Math.min(3, shooter.consecutiveShots + 1);
  } else {
    shooter.consecutiveShots = 0;
  }
  shooter.lastShotTime = now;

  const dispersion = (Math.random() - 0.5) * (shooter.consecutiveShots * 0.05);
  const finalAngle = shooter.aimAngle + dispersion;
  shooter.recoilAngle = 0.55;

  const muzzle = getMuzzleWorldCoords(shooterRole);

  // Projétil balístico real com velocidade constante
  const bullet = {
    x: muzzle.x,
    y: muzzle.y,
    prevX: muzzle.x,
    prevY: muzzle.y,
    vx: Math.cos(finalAngle) * BULLET_SPEED,
    vy: Math.sin(finalAngle) * BULLET_SPEED,
    shooterRole: shooterRole,
    distanceTraveled: 0,
    trail: []
  };

  activeBullets.push(bullet);

  audioEngine.playGunshot45();

  if (activeGameMode === 'online' && shooterRole === localRole) {
    sendP2PData({
      type: 'bullet_spawn',
      x: muzzle.x,
      y: muzzle.y,
      vx: bullet.vx,
      vy: bullet.vy,
      angle: finalAngle,
      shooterRole: shooterRole
    });
  }

  updateHUDStats();
  checkDrawCondition();
}

function updateBulletsPhysics(dt) {
  const groundY = screenH * GROUND_RATIO;

  for (let i = activeBullets.length - 1; i >= 0; i--) {
    const b = activeBullets[i];
    b.prevX = b.x;
    b.prevY = b.y;

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.distanceTraveled += BULLET_SPEED * dt;

    b.trail.push({ x: b.x, y: b.y, size: 3.5 });
    if (b.trail.length > 8) b.trail.shift();

    // Colisão com o chão
    if (b.y >= groundY + 12) {
      audioEngine.playRicochetSound();
      activeBullets.splice(i, 1);
      continue;
    }

    // Colisão com o oponente
    const targetRole = b.shooterRole === 'p1' ? 'p2' : 'p1';
    const targetFighter = targetRole === 'p1' ? fighter1 : fighter2;
    const shooterFighter = b.shooterRole === 'p1' ? fighter1 : fighter2;

    if (!targetFighter.isDead) {
      const hitboxes = getFighterActiveHitboxes(targetFighter, targetRole);
      let hitFound = false;

      for (const box of hitboxes) {
        if (checkLineAABB(b.prevX, b.prevY, b.x, b.y, box.x, box.y, box.w, box.h)) {
          hitFound = true;
          shooterFighter.shotsHit++;

          applyHitDamage(b.shooterRole, targetRole, box.part, box.damage, b.x, b.y);

          if (activeGameMode === 'online' && b.shooterRole === localRole) {
            sendP2PData({
              type: 'hit_confirm',
              part: box.part,
              damage: box.damage,
              x: b.x,
              y: b.y,
              attacker: b.shooterRole
            });
          }

          activeBullets.splice(i, 1);
          break;
        }
      }
      if (hitFound) continue;
    }

    if (b.x < -100 || b.x > screenW + 100 || b.y < -100 || b.y > screenH + 100) {
      activeBullets.splice(i, 1);
    }
  }
}

function checkLineAABB(x1, y1, x2, y2, rx, ry, rw, rh) {
  if ((x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) ||
      (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh)) {
    return true;
  }
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
  if (maxX < rx || minX > rx + rw || maxY < ry || minY > ry + rh) return false;
  return true;
}

function applyHitDamage(attackerRole, victimRole, part, damage, hitX, hitY) {
  const victim = victimRole === 'p1' ? fighter1 : fighter2;
  const attacker = attackerRole === 'p1' ? fighter1 : fighter2;

  if (attacker.reactionTimeMs === 0 && fireInstantTimestamp > 0) {
    attacker.reactionTimeMs = Math.round(performance.now() - fireInstantTimestamp);
  }

  victim.hp = Math.max(0, victim.hp - damage);

  if (part === 'head') {
    // 1. TIRO NA CABEÇA (HEADSHOT - DECAPITAÇÃO GUNBLOOD!)
    victim.isHeadless = true;
    victim.hp = 0;
    audioEngine.playFleshImpact(true);
    showFloatingHitText('HEADSHOT! 💀', hitX, hitY - 20, '#ff1a1a');

    const victimCoords = getFighterCoords(victimRole);
    severedHeads.push({
      x: victimCoords.x,
      y: victimCoords.y - 110,
      vx: (attackerRole === 'p1' ? 220 : -220) + (Math.random() - 0.5) * 80,
      vy: -320 - Math.random() * 140,
      rotation: 0,
      vrot: (Math.random() - 0.5) * 16,
      charIdx: victim.charIdx,
      onGround: false
    });

    spawnBloodFountain(hitX, hitY, 35, (attackerRole === 'p1' ? 80 : -80), -240);
  } else if (part === 'legs') {
    // 2. TIRO NAS PERNAS (CAI DE JOELHOS, CONTINUA VIVO E PODE ATIRAR!)
    audioEngine.playFleshImpact(false);
    showFloatingHitText('PERNAS! -' + damage, hitX, hitY, '#ffaa00');
    victim.isKneeling = true;
    spawnBloodFountain(hitX, hitY, 14, 0, -60);
  } else if (part === 'torso') {
    // 3. TIRO NO TRONCO (SANGRAMENTO CONTÍNUO & RECUO)
    audioEngine.playFleshImpact(false);
    showFloatingHitText('TRONCO! -' + damage, hitX, hitY, '#ff5500');
    victim.isBleeding = true;
    victim.knockbackX = victimRole === 'p1' ? -22 : 22;
    victim.bulletHoles.push({
      x: (hitX - getFighterCoords(victimRole).x) / (Math.min(screenW, screenH) / 640),
      y: -30 + (Math.random() - 0.5) * 20
    });
    spawnBloodFountain(hitX, hitY, 18, (attackerRole === 'p1' ? 120 : -120), -90);
  } else {
    audioEngine.playFleshImpact(false);
    showFloatingHitText('BRAÇO! -' + damage, hitX, hitY, '#ffcc44');
    spawnBloodFountain(hitX, hitY, 10, 0, -40);
  }

  updateHUDStats();

  if (victim.hp <= 0 && !victim.isDead) {
    handleFighterDeath(victimRole, attackerRole, part);
  }
}

function handleFighterDeath(victimRole, attackerRole, fatalPart) {
  const victim = victimRole === 'p1' ? fighter1 : fighter2;
  victim.isDead = true;
  currentPhase = 'round_over';
  audioEngine.playFuneralBell();
  setTimeout(() => {
    displayDuelResult(attackerRole, fatalPart);
  }, 1300);
}

function checkDrawCondition() {
  if (fighter1.bullets === 0 && fighter2.bullets === 0 && !fighter1.isDead && !fighter2.isDead && activeBullets.length === 0) {
    currentPhase = 'round_over';
    setTimeout(() => {
      displayDuelResult('draw', null);
    }, 900);
  }
}

// ==========================================================================
// PARTÍCULAS DE SANGUE & MANCHAS NA AREIA (PERSISTENTES)
// ==========================================================================

function spawnBloodFountain(originX, originY, count, baseVx = 0, baseVy = -120) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 220;
    bloodDrops.push({
      x: originX,
      y: originY,
      vx: baseVx + Math.cos(angle) * speed,
      vy: baseVy + Math.sin(angle) * speed,
      gravity: 750 + Math.random() * 200,
      radius: 2.2 + Math.random() * 4.5,
      alpha: 1.0,
      life: 1.2 + Math.random() * 0.8
    });
  }
}

function updateBloodParticles(dt) {
  const groundY = screenH * GROUND_RATIO;

  for (let i = bloodDrops.length - 1; i >= 0; i--) {
    const b = bloodDrops[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy += b.gravity * dt;
    b.vx *= 0.98;

    // Sangue atinge o solo: mancha permanente na areia!
    if (b.y >= groundY + (Math.random() * 15)) {
      splatBloodOnSand(b.x, b.y, b.radius);
      bloodDrops.splice(i, 1);
      continue;
    }

    b.life -= dt;
    if (b.life <= 0) {
      bloodDrops.splice(i, 1);
    }
  }

  // Atualiza física de cabeças decapitadas
  for (let i = 0; i < severedHeads.length; i++) {
    const h = severedHeads[i];
    if (!h.onGround) {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.vy += 850 * dt;
      h.rotation += h.vrot * dt;

      if (h.y >= groundY - 10) {
        h.y = groundY - 10;
        h.vy = -h.vy * 0.35;
        h.vx *= 0.6;
        h.vrot *= 0.6;
        splatBloodOnSand(h.x, groundY, 14);
        if (Math.abs(h.vy) < 25) {
          h.onGround = true;
          h.vy = 0;
          h.vx = 0;
        }
      }
    }
  }
}

function splatBloodOnSand(x, y, radius) {
  if (!bloodStainsCtx) return;
  const bloodColors = ['#5a0000', '#730000', '#8c0000', '#420000'];
  const col = bloodColors[Math.floor(Math.random() * bloodColors.length)];

  bloodStainsCtx.save();
  bloodStainsCtx.fillStyle = col;
  bloodStainsCtx.globalAlpha = 0.85;

  bloodStainsCtx.beginPath();
  bloodStainsCtx.ellipse(x, y, radius * (1.8 + Math.random()), radius * 0.65, Math.random() * 0.4, 0, Math.PI * 2);
  bloodStainsCtx.fill();

  for (let s = 0; s < 3; s++) {
    const sx = x + (Math.random() - 0.5) * radius * 3.5;
    const sy = y + (Math.random() - 0.5) * radius * 1.5;
    bloodStainsCtx.beginPath();
    bloodStainsCtx.arc(sx, sy, radius * 0.35, 0, Math.PI * 2);
    bloodStainsCtx.fill();
  }
  bloodStainsCtx.restore();
}

function renderProjectilesAndGore(ctx) {
  // Projéteis
  activeBullets.forEach(b => {
    for (let i = 0; i < b.trail.length; i++) {
      const p = b.trail[i];
      const prog = (i + 1) / b.trail.length;
      ctx.fillStyle = `rgba(255,${Math.floor(120 + prog * 135)},20,${prog * 0.85})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, b.trail[i].size * prog, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff4a3';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Gotas de sangue em voo
  bloodDrops.forEach(d => {
    ctx.fillStyle = `rgba(180,0,0,${d.alpha})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cabeças decapitadas rolando
  severedHeads.forEach(h => {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation);
    const S = (Math.min(screenW, screenH) / 640) * 0.9;
    const charData = GUNSLINGERS[h.charIdx] || GUNSLINGERS[0];

    ctx.fillStyle = '#d49b6a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * S, 22 * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5 * S;
    ctx.stroke();

    ctx.fillStyle = '#7a0000';
    ctx.beginPath();
    ctx.ellipse(0, 20 * S, 12 * S, 6 * S, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = charData.hatColor;
    ctx.beginPath();
    ctx.ellipse(0, -14 * S, 36 * S, 8 * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-16 * S, -42 * S, 32 * S, 28 * S);
    ctx.strokeRect(-16 * S, -42 * S, 32 * S, 28 * S);

    ctx.restore();
  });
}

// ==========================================================================
// RENDERIZAÇÃO DO TAMBOR DO REVÓLVER (CANTO INFERIOR ESQUERDO)
// ==========================================================================

function renderTactileDrum(canvasEl, bullets, angle, highlightColor) {
  const ctx = canvasEl.getContext('2d');
  const size = 96;
  const center = size / 2;
  const radius = 38;

  ctx.clearRect(0, 0, size, size);

  const bodyGrad = ctx.createRadialGradient(center - 8, center - 8, 4, center, center, radius);
  bodyGrad.addColorStop(0, '#888888');
  bodyGrad.addColorStop(0.5, '#444444');
  bodyGrad.addColorStop(0.95, '#1e1e1e');
  bodyGrad.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + angle;
    const cx = center + Math.cos(a) * 23;
    const cy = center + Math.sin(a) * 23;
    const hasBullet = i >= (6 - bullets);

    if (hasBullet) {
      const brassGrad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 7.5);
      brassGrad.addColorStop(0, '#fff2a8');
      brassGrad.addColorStop(0.65, '#d49b28');
      brassGrad.addColorStop(1, '#664408');
      ctx.fillStyle = brassGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b3801b';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#080808';
      ctx.beginPath();
      ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.arc(center, center, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(center, center, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = highlightColor || '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
  ctx.stroke();
}

// ==========================================================================
// FLUXO DO DUELO: CONTAGEM, FOGO, SEGURAR O TAMBOR & REGRAS
// ==========================================================================

function beginNewRound() {
  clearForfeitTimers();
  if (countdownTicker) clearTimeout(countdownTicker);
  countdownEverStarted = false;
  currentPhase = 'holding';
  fighter1.hp = 100;
  fighter2.hp = 100;
  fighter1.bullets = 6;
  fighter2.bullets = 6;
  fighter1.shotsFired = 0;
  fighter1.shotsHit = 0;
  fighter2.shotsFired = 0;
  fighter2.shotsHit = 0;
  fighter1.reactionTimeMs = 0;
  fighter2.reactionTimeMs = 0;
  fighter1.holdingDrum = false;
  fighter2.holdingDrum = false;
  fighter1.isKneeling = false;
  fighter1.kneelProgress = 0;
  fighter2.isKneeling = false;
  fighter2.kneelProgress = 0;
  fighter1.isHeadless = false;
  fighter2.isHeadless = false;
  fighter1.isBleeding = false;
  fighter2.isBleeding = false;
  fighter1.bleedDamageAccum = 0;
  fighter2.bleedDamageAccum = 0;
  fighter1.isDead = false;
  fighter2.isDead = false;
  fighter1.deathFallAngle = 0;
  fighter1.deathFallY = 0;
  fighter2.deathFallAngle = 0;
  fighter2.deathFallY = 0;
  fighter1.bulletHoles = [];
  fighter2.bulletHoles = [];

  activeBullets = [];
  bloodDrops = [];
  severedHeads = [];
  fireInstantTimestamp = 0;

  document.getElementById('countdownContainer').style.display = 'flex';
  document.getElementById('countdownBigNum').textContent = '';
  document.getElementById('fogoBigBanner').style.display = 'none';
  document.getElementById('warningNotice').textContent = '';
  document.getElementById('resultModal').classList.remove('active');

  const drumL = document.getElementById('drumLeftP1');
  const drumR = document.getElementById('drumRightP2');
  drumL.className = 'drum-interactive';
  drumR.className = 'drum-interactive';
  drumL.style.display = 'flex';
  drumR.style.display = 'flex';

  updateHUDStats();

  if (activeGameMode === 'cpu') {
    fighter2.holdingDrum = true;
    drumR.classList.add('holding');
  }

  showNotification('Mantenha o cursor sobre o tambor!', 3000);
}

function handleDrumHoverState(isHolding) {
  if (currentPhase !== 'holding' && currentPhase !== 'countdown') return;
  const role = localRole;
  const fighter = role === 'p1' ? fighter1 : fighter2;
  const drumEl = document.getElementById(role === 'p1' ? 'drumLeftP1' : 'drumRightP2');

  if (fighter.holdingDrum !== isHolding) {
    fighter.holdingDrum = isHolding;
    drumEl.classList.toggle('holding', isHolding);
    if (isHolding) audioEngine.playDrumSpin();

    if (activeGameMode === 'online') {
      sendP2PData({ type: 'drum_state', isHolding: isHolding });
      if (localRole === 'p1') updateForfeitTimer(role, isHolding);
    }

    checkCountdownStartCondition();
    if (!isHolding && currentPhase === 'countdown') {
      cancelCountdownSequence('⚠ VOCÊ TIROU A MÃO DO TAMBOR!');
    }
  }
}

function clearForfeitTimers() {
  Object.keys(forfeitTimers).forEach(role => {
    if (forfeitTimers[role]) clearTimeout(forfeitTimers[role]);
    forfeitTimers[role] = null;
  });
}

function updateForfeitTimer(role, isHolding) {
  if (activeGameMode !== 'online' || localRole !== 'p1' || !countdownEverStarted) return;
  if (currentPhase !== 'holding' && currentPhase !== 'countdown') return;
  if (forfeitTimers[role]) clearTimeout(forfeitTimers[role]);
  forfeitTimers[role] = null;
  if (isHolding) return;

  forfeitTimers[role] = setTimeout(() => {
    forfeitTimers[role] = null;
    const fighter = role === 'p1' ? fighter1 : fighter2;
    if (!fighter.holdingDrum && countdownEverStarted &&
        (currentPhase === 'holding' || currentPhase === 'countdown')) {
      finishForfeit(role === 'p1' ? 'p2' : 'p1', true);
    }
  }, 10000);
}

function finishForfeit(winnerRole, notifyOpponent) {
  if (currentPhase === 'round_over' || currentPhase === 'fire') return;
  if (countdownTicker) clearTimeout(countdownTicker);
  countdownTicker = null;
  clearForfeitTimers();
  currentPhase = 'round_over';
  if (notifyOpponent && activeGameMode === 'online' && localRole === 'p1') {
    sendP2PData({ type: 'forfeit_result', winnerRole: winnerRole });
  }
  displayDuelResult(winnerRole, 'forfeit');
}

function cancelCountdownSequence(message) {
  if (currentPhase !== 'countdown') return;
  if (countdownTicker) clearTimeout(countdownTicker);
  countdownTicker = null;
  currentPhase = 'holding';
  document.getElementById('countdownBigNum').textContent = '';
  document.getElementById('warningNotice').textContent = message;
  if (activeGameMode === 'online' && localRole === 'p1') {
    sendP2PData({ type: 'countdown_cancel' });
  }
  setTimeout(() => {
    if (currentPhase === 'holding') document.getElementById('warningNotice').textContent = '';
  }, 1800);
}

function checkCountdownStartCondition() {
  if (currentPhase !== 'holding' || !fighter1.holdingDrum || !fighter2.holdingDrum) return;
  if (activeGameMode === 'online' && localRole !== 'p1') return;
  startCountdownSequence();
}

function startCountdownSequence(fromHost = false) {
  if (currentPhase !== 'holding') return;
  if (activeGameMode === 'online' && localRole !== 'p1' && !fromHost) return;
  if (!fighter1.holdingDrum || !fighter2.holdingDrum) return;
  currentPhase = 'countdown';
  countdownEverStarted = true;
  countdownCurrentSec = 3;
  document.getElementById('warningNotice').textContent = '';
  if (activeGameMode === 'online' && localRole === 'p1' && !fromHost) {
    sendP2PData({ type: 'countdown_start' });
  }
  tickCountdownStep();
}

function tickCountdownStep() {
  if (currentPhase !== 'countdown') return;

  if (!fighter1.holdingDrum || !fighter2.holdingDrum) {
    currentPhase = 'holding';
    document.getElementById('countdownBigNum').textContent = '';
    document.getElementById('warningNotice').textContent = '⚠ VOCÊ TIROU A MÃO DO TAMBOR!';
    return;
  }

  if (countdownCurrentSec > 0) {
    const numEl = document.getElementById('countdownBigNum');
    numEl.textContent = countdownCurrentSec;
    numEl.className = 'count-slam';

    const rateMultipliers = [1.0, 1.4, 2.2];
    audioEngine.playHeartbeat(rateMultipliers[3 - countdownCurrentSec]);

    if (countdownCurrentSec === 3) audioEngine.playWesternGuitarChord('Em');
    if (countdownCurrentSec === 2) audioEngine.playMorriconeWhistle();
    if (countdownCurrentSec === 1) audioEngine.playWesternGuitarChord('B7');

    countdownCurrentSec--;
    countdownTicker = setTimeout(tickCountdownStep, 1000);
  } else {
    triggerFogoCommand();
  }
}

function triggerFogoCommand() {
  clearForfeitTimers();
  currentPhase = 'fire';
  fireInstantTimestamp = performance.now();

  document.getElementById('countdownBigNum').textContent = '';
  document.getElementById('warningNotice').textContent = '';
  document.getElementById('fogoBigBanner').style.display = 'block';

  document.getElementById('drumLeftP1').classList.add('unlocked');
  document.getElementById('drumRightP2').classList.add('unlocked');

  audioEngine.playWesternGuitarChord('Am');

  if (activeGameMode === 'cpu') {
    scheduleCPUAimAndShot();
  }
}

function scheduleCPUAimAndShot() {
  if (currentPhase !== 'fire' || fighter2.isDead) return;

  const reactionTimes = [
    { base: 1400, jitter: 700 }, // Novato
    { base: 650,  jitter: 320 }, // Duelista
    { base: 260,  jitter: 110 }  // Lendário
  ];
  const cfg = reactionTimes[cpuDifficulty] || reactionTimes[0];
  const delay = cfg.base + Math.random() * cfg.jitter;

  cpuAimTimer = setTimeout(() => {
    if (currentPhase !== 'fire' || fighter2.isDead || fighter2.bullets <= 0) return;

    const p1Center = getFighterCoords('p1');
    const targetY = fighter1.isKneeling ? p1Center.y + 40 : p1Center.y - (cpuDifficulty === 2 ? 110 : 35);
    const targetX = p1Center.x;

    const muzzle = getMuzzleWorldCoords('p2');
    fighter2.aimAngle = Math.atan2(targetY - muzzle.shoulderY, targetX - muzzle.shoulderX);

    triggerFireBullet('p2');

    if (fighter2.bullets > 0 && currentPhase === 'fire' && !fighter2.isDead) {
      scheduleCPUAimAndShot();
    }
  }, delay);
}

// ==========================================================================
// RESULTADO, REVANCHE & PLACAR PERSISTENTE
// ==========================================================================

function displayDuelResult(winnerRole, fatalPart) {
  const modal = document.getElementById('resultModal');
  const banner = document.getElementById('resultBanner');
  const sub = document.getElementById('resultSubtitle');
  const details = document.getElementById('resultDetails');

  if (winnerRole === 'draw') {
    banner.textContent = 'EMPATE!';
    banner.style.color = '#ffcc44';
    sub.textContent = 'Ambos os pistoleiros descarregaram seus revólveres no deserto!';
    details.innerHTML = 'Nenhum duelista caiu. Recarreguem suas armas para o próximo round.';
  } else {
    const winner = winnerRole === 'p1' ? fighter1 : fighter2;
    const isPlayerWin = winnerRole === localRole;

    banner.textContent = isPlayerWin ? '🏆 VITÓRIA!' : '💀 DERROTA!';
    banner.style.color = isPlayerWin ? '#ffcc44' : '#cc2200';
    sub.textContent = `${winner.name} foi o mais rápido no gatilho!`;
    winner.score++;

    recordWinInLeaderboard(winner.name);

    const hitDesc = fatalPart === 'forfeit' ? 'VITÓRIA POR W.O.' :
                    fatalPart === 'head' ? 'TIRO CERTEIRO NA CABEÇA (HEADSHOT!)' :
                    fatalPart === 'torso' ? 'MORTALMENTE FERIDO NO TRONCO' :
                    fatalPart === 'legs' ? 'SANGROU ATÉ A MORTE PELAS PERNAS' : 'GOLPE FATAL';

    const rtText = winner.reactionTimeMs > 0 ? `${winner.reactionTimeMs} ms` : '—';
    const p1Acc = fighter1.shotsFired > 0 ? Math.round((fighter1.shotsHit / fighter1.shotsFired) * 100) : 0;
    const p2Acc = fighter2.shotsFired > 0 ? Math.round((fighter2.shotsHit / fighter2.shotsFired) * 100) : 0;

    details.innerHTML = fatalPart === 'forfeit' ? `
      <span style="color:#ff8800;font-weight:bold;">${hitDesc}</span><br>
      O oponente permaneceu fora do tambor por mais de 10 segundos.
    ` : `
      <span style="color:#ff8800;font-weight:bold;">${hitDesc}</span><br>
      ⚡ Tempo de Saque Fatal: <b style="color:#ffe099;">${rtText}</b><br>
      🎯 Precisão: ${fighter1.name} <b>${p1Acc}%</b> | ${fighter2.name} <b>${p2Acc}%</b><br>
      <small style="color:#775533;">Balas: ${fighter1.bullets}/6 vs ${fighter2.bullets}/6</small>
    `;

    duelMatchHistory.unshift({
      round: fighter1.score + fighter2.score,
      winner: winner.name,
      rt: winner.reactionTimeMs,
      part: fatalPart
    });
    if (duelMatchHistory.length > 5) duelMatchHistory.pop();
    renderHistoryDrawer();
  }

  document.getElementById('hudScoreDisplay').textContent = `${fighter1.score} : ${fighter2.score}`;
  document.getElementById('rematchButton').disabled = false;
  document.getElementById('rematchButton').textContent = '⚔️ REVANCHE!';
  document.getElementById('rematchStatusText').textContent = '';

  fighter1.readyForRematch = false;
  fighter2.readyForRematch = false;

  modal.classList.add('active');
}

function clickRematch() {
  const me = localRole === 'p1' ? fighter1 : fighter2;
  me.readyForRematch = true;

  document.getElementById('rematchButton').disabled = true;
  document.getElementById('rematchButton').textContent = '⌛ Aguardando...';
  document.getElementById('rematchStatusText').textContent = 'Você está pronto! Aguardando oponente...';

  if (activeGameMode === 'cpu') {
    fighter2.readyForRematch = true;
    checkBothReadyForRematch();
  } else {
    sendP2PData({ type: 'rematch_ready' });
    checkBothReadyForRematch();
  }
}

function checkBothReadyForRematch() {
  if (fighter1.readyForRematch && fighter2.readyForRematch) {
    document.getElementById('resultModal').classList.remove('active');
    clearBloodStains();
    beginNewRound();
  }
}

function recordWinInLeaderboard(championName) {
  const existing = globalLeaderboard.find(e => e.name === championName);
  if (existing) {
    existing.wins++;
  } else {
    globalLeaderboard.push({ name: championName, wins: 1 });
  }
  globalLeaderboard.sort((a, b) => b.wins - a.wins);
  if (globalLeaderboard.length > 10) globalLeaderboard = globalLeaderboard.slice(0, 10);
  localStorage.setItem('gunblood_duel_ranking', JSON.stringify(globalLeaderboard));
}

function renderLeaderboardTable() {
  const container = document.getElementById('rankingTableContainer');
  if (!globalLeaderboard.length) {
    container.innerHTML = '<div style="color:#664422;text-align:center;padding:24px;font-size:0.85rem;">Nenhum duelo registrado ainda.</div>';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = globalLeaderboard.map((item, idx) => `
    <div class="rank-item">
      <span>${medals[idx] || '#' + (idx + 1)} ${item.name}</span>
      <span class="rank-count">🏆 ${item.wins} Vitórias</span>
    </div>
  `).join('');
}

function resetLeaderboard() {
  if (!confirm('Deseja realmente limpar o ranking geral?')) return;
  globalLeaderboard = [];
  localStorage.removeItem('gunblood_duel_ranking');
  renderLeaderboardTable();
}

function renderHistoryDrawer() {
  const list = document.getElementById('matchHistoryList');
  list.innerHTML = duelMatchHistory.map(h => `
    <div class="hist-row">
      R${h.round}: <b>${h.winner}</b> ${h.rt ? `(${h.rt}ms)` : ''} ${h.part === 'head' ? '💀' : '🔫'}
    </div>
  `).join('');
}

function updateHUDStats() {
  document.getElementById('hudP1Name').textContent = fighter1.name;
  document.getElementById('hudP2Name').textContent = fighter2.name;

  document.getElementById('hudP1HpFill').style.width = fighter1.hp + '%';
  document.getElementById('hudP2HpFill').style.width = fighter2.hp + '%';
  document.getElementById('hudP1HpText').textContent = fighter1.hp;
  document.getElementById('hudP2HpText').textContent = fighter2.hp;

  document.getElementById('hudP1BleedBadge').style.display = fighter1.isBleeding ? 'inline-block' : 'none';
  document.getElementById('hudP2BleedBadge').style.display = fighter2.isBleeding ? 'inline-block' : 'none';

  const formatBullets = n => '●'.repeat(n) + '○'.repeat(6 - n);
  document.getElementById('hudP1BulletsRack').textContent = formatBullets(fighter1.bullets);
  document.getElementById('hudP2BulletsRack').textContent = formatBullets(fighter2.bullets);

  document.getElementById('hudRoundDisplay').textContent = `RODADA ${fighter1.score + fighter2.score + 1}`;
}

function showFloatingHitText(text, x, y, color) {
  const el = document.createElement('div');
  el.className = 'hit-label-float';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = color || '#ffcc44';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

// ==========================================================================
// NICKNAME SEGURO & MULTIPLAYER P2P (PEERJS)
// ==========================================================================

function getPlayerNickname(inputId = 'playerNickInput') {
  const inputEl = document.getElementById(inputId);
  if (inputEl && typeof inputEl.value === 'string') {
    const val = inputEl.value.trim();
    if (val.length > 0) {
      return val;
    }
  }
  const autoNick = 'Pistoleiro_' + Math.floor(100 + Math.random() * 900);
  if (inputEl) {
    inputEl.value = autoNick;
  }
  return autoNick;
}

function syncNicknameInputs(val) {
  const inputs = document.querySelectorAll('#playerNickInput, #cpuPlayerNickInput');
  inputs.forEach(inp => {
    if (inp !== document.activeElement) {
      inp.value = val;
    }
  });
}

function generate5LetterRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 5; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

function startHostRoom() {
  audioEngine.resume();
  const nick = getPlayerNickname('playerNickInput');
  userNickname = nick;
  fighter1.name = nick;
  fighter1.charIdx = chosenCharIndex;
  fighter1.customColor = OUTFIT_COLORS[chosenColorIndex];

  localRole = 'p1';
  activeGameMode = 'online';
  activeRoomCode = generate5LetterRoomCode();

  const hostLobby = document.getElementById('hostLobbyBox');
  if (hostLobby) hostLobby.style.display = 'block';
  const roomDisplay = document.getElementById('roomCodeDisplay');
  if (roomDisplay) roomDisplay.textContent = activeRoomCode;

  switchToScreen('waitLobbyScreen');
  const codeLabel = document.getElementById('lobbyCodeLabel');
  if (codeLabel) codeLabel.textContent = activeRoomCode;
  const msgLabel = document.getElementById('lobbyMessage');
  if (msgLabel) msgLabel.textContent = 'Aguardando oponente entrar na sala...';

  initPeerJS(activeRoomCode);

  if (peerConnection) {
    peerConnection.on('connection', conn => {
      p2pDataChannel = conn;
      setupDataChannelHandlers();
    });
  }
}

function startJoinRoom() {
  audioEngine.resume();
  const nick = getPlayerNickname('playerNickInput');
  const codeInput = document.getElementById('joinCodeInput');
  const code = (codeInput && codeInput.value ? codeInput.value.trim() : '').toUpperCase();
  if (code.length !== 5) {
    showNotification('Digite um código de 5 letras válido!', 2500);
    return;
  }
  userNickname = nick;
  fighter2.name = nick;
  fighter2.charIdx = chosenCharIndex;
  fighter2.customColor = OUTFIT_COLORS[chosenColorIndex];

  localRole = 'p2';
  activeGameMode = 'online';
  activeRoomCode = code;

  switchToScreen('waitLobbyScreen');
  const codeLabel = document.getElementById('lobbyCodeLabel');
  if (codeLabel) codeLabel.textContent = code;
  const msgLabel = document.getElementById('lobbyMessage');
  if (msgLabel) msgLabel.textContent = 'Conectando ao duelista...';

  initPeerJS(null);

  if (peerConnection) {
    peerConnection.on('open', () => {
      p2pDataChannel = peerConnection.connect(code);
      setupDataChannelHandlers();
    });
  }
}

function initPeerJS(id) {
  if (peerConnection) {
    try { peerConnection.destroy(); } catch (e) {}
  }
  try {
    peerConnection = new Peer(id, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peerConnection.on('open', peerId => {
      if (document.getElementById('roomCodeDisplay')) {
        document.getElementById('roomCodeDisplay').textContent = peerId;
      }
      if (document.getElementById('lobbyCodeLabel')) {
        document.getElementById('lobbyCodeLabel').textContent = peerId;
      }
    });

    peerConnection.on('error', err => {
      console.warn('PeerJS status:', err);
      showNotification('Conexão P2P: ' + (err.type || 'verifique a rede'), 3500);
    });
  } catch (err) {
    console.error('PeerJS init:', err);
  }
}

function setupDataChannelHandlers() {
  p2pDataChannel.on('open', () => {
    showNotification('Conectado ao duelo!', 2000);
    sendP2PData({
      type: 'handshake',
      name: userNickname,
      charIdx: chosenCharIndex,
      color: OUTFIT_COLORS[chosenColorIndex]
    });
  });

  p2pDataChannel.on('data', data => handleIncomingP2PData(data));
  p2pDataChannel.on('close', () => {
    showNotification('Oponente desconectou do duelo!', 3500);
  });
}

function handleIncomingP2PData(msg) {
  switch (msg.type) {
    case 'handshake':
      const opp = localRole === 'p1' ? fighter2 : fighter1;
      opp.name = msg.name;
      opp.charIdx = msg.charIdx;
      opp.customColor = msg.color;
      updateHUDStats();
      if (localRole === 'p1') {
        sendP2PData({ type: 'start_duel' });
        setTimeout(launchDuelArena, 400);
      }
      break;

    case 'start_duel':
      launchDuelArena();
      break;

    case 'aim_sync':
      const aimFighter = msg.role === 'p1' ? fighter1 : fighter2;
      aimFighter.aimAngle = msg.angle;
      break;

    case 'drum_state': {
      const remoteRole = localRole === 'p1' ? 'p2' : 'p1';
      const drumFighter = remoteRole === 'p1' ? fighter1 : fighter2;
      const remoteDrum = document.getElementById(remoteRole === 'p1' ? 'drumLeftP1' : 'drumRightP2');
      drumFighter.holdingDrum = !!msg.isHolding;
      remoteDrum.classList.toggle('holding', !!msg.isHolding);
      if (localRole === 'p1') updateForfeitTimer(remoteRole, !!msg.isHolding);
      checkCountdownStartCondition();
      if (!msg.isHolding && currentPhase === 'countdown') {
        cancelCountdownSequence('⚠ OPONENTE SOLTOU O TAMBOR!');
      }
      break;
    }

    case 'countdown_start':
      if (localRole !== 'p1') startCountdownSequence(true);
      break;

    case 'countdown_cancel':
      if (currentPhase === 'countdown') {
        if (countdownTicker) clearTimeout(countdownTicker);
        countdownTicker = null;
        currentPhase = 'holding';
        document.getElementById('countdownBigNum').textContent = '';
        document.getElementById('warningNotice').textContent = '⚠ OPONENTE SOLTOU O TAMBOR!';
      }
      break;

    case 'forfeit_result':
      finishForfeit(msg.winnerRole, false);
      break;

    case 'bullet_spawn':
      activeBullets.push({
        x: msg.x,
        y: msg.y,
        prevX: msg.x,
        prevY: msg.y,
        vx: msg.vx,
        vy: msg.vy,
        shooterRole: msg.shooterRole,
        distanceTraveled: 0,
        trail: []
      });
      const oppShooter = msg.shooterRole === 'p1' ? fighter1 : fighter2;
      oppShooter.bullets--;
      oppShooter.shotsFired++;
      oppShooter.recoilAngle = 0.55;
      audioEngine.playGunshot45();
      updateHUDStats();
      checkDrawCondition();
      break;

    case 'hit_confirm':
      applyHitDamage(msg.attacker, localRole, msg.part, msg.damage, msg.x, msg.y);
      break;

    case 'rematch_ready':
      const remOpp = localRole === 'p1' ? fighter2 : fighter1;
      remOpp.readyForRematch = true;
      showNotification('Oponente quer revanche!', 2000);
      checkBothReadyForRematch();
      break;
  }
}

function sendP2PData(payload) {
  if (p2pDataChannel && p2pDataChannel.open) {
    try { p2pDataChannel.send(payload); } catch (e) {}
  }
}

function copyShareLink() {
  const code = document.getElementById('roomCodeDisplay').textContent;
  const url = `${location.href.split('?')[0]}?sala=${code}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => showNotification('Link do Duelo copiado! 📋', 2200))
      .catch(() => prompt('Copie o link abaixo:', url));
  } else {
    prompt('Copie o link abaixo:', url);
  }
}

// ==================== MODO CPU ====================
function startSinglePlayerGame() {
  audioEngine.resume();
  const nick = getPlayerNickname('cpuPlayerNickInput');
  userNickname = nick;
  fighter1.name = nick;
  fighter1.charIdx = chosenCharIndex;
  fighter1.customColor = OUTFIT_COLORS[chosenColorIndex];

  localRole = 'p1';
  activeGameMode = 'cpu';

  const cpuNames = ['Xerife Carter', 'Ruby Sangrenta', 'Coveiro Joe', 'Caçador Ramos'];
  fighter2.name = cpuNames[Math.floor(Math.random() * cpuNames.length)];
  fighter2.charIdx = (chosenCharIndex + 1 + Math.floor(Math.random() * 3)) % 4;
  fighter2.customColor = OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)];

  launchDuelArena();
}

function chooseCpuDiff(d) {
  cpuDifficulty = d;
  document.querySelectorAll('.diff-btn').forEach((b, i) => b.classList.toggle('active', i === d));
}

function launchDuelArena() {
  switchToScreen('gameScreen');
  document.getElementById('matchHistoryBox').style.display = 'block';
  beginNewRound();
}

// ==========================================================================
// CONTROLES DE MOUSE, MIRA E DISPARO
// ==========================================================================

let lastAimSyncTimestamp = 0;

function updateAimingAngle(clientX, clientY) {
  cursorAimX = clientX;
  cursorAimY = clientY;

  const myFighter = localRole === 'p1' ? fighter1 : fighter2;
  const muzzleCoords = getMuzzleWorldCoords(localRole);

  const dx = cursorAimX - muzzleCoords.shoulderX;
  const dy = cursorAimY - muzzleCoords.shoulderY;
  myFighter.aimAngle = Math.atan2(dy, dx);

  const now = performance.now();
  if (activeGameMode === 'online' && now - lastAimSyncTimestamp > 40) {
    lastAimSyncTimestamp = now;
    sendP2PData({ type: 'aim_sync', role: localRole, angle: myFighter.aimAngle });
  }

  checkDrumHoldingBounds(cursorAimX, cursorAimY);
}

document.addEventListener('mousemove', e => {
  updateAimingAngle(e.clientX, e.clientY);
});

window.addEventListener('blur', () => {
  if (currentPhase === 'holding' || currentPhase === 'countdown') {
    handleDrumHoverState(false);
  }
});

document.addEventListener('click', e => {
  audioEngine.resume();
  if (currentPhase === 'fire') {
    triggerFireBullet(localRole);
  }
});

document.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  updateAimingAngle(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener('touchstart', e => {
  audioEngine.resume();
  const touch = e.touches[0];
  updateAimingAngle(touch.clientX, touch.clientY);
  if (currentPhase === 'fire') {
    triggerFireBullet(localRole);
  }
}, { passive: true });

function checkDrumHoldingBounds(mx, my) {
  const drumEl = document.getElementById(localRole === 'p1' ? 'drumLeftP1' : 'drumRightP2');
  if (!drumEl) return;
  const rect = drumEl.getBoundingClientRect();
  const isOver = (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom);
  handleDrumHoverState(isOver);
}

// ==========================================================================
// LOOP DE ANIMAÇÃO & RENDERIZAÇÃO PRINCIPAL
// ==========================================================================

function gameAnimationLoop(timestamp) {
  const dt = Math.min((timestamp - lastFrameTimestamp) / 1000, 0.05);
  lastFrameTimestamp = timestamp;

  if (currentPhase !== 'menu' && currentPhase !== 'load') {
    // 1. Cenário Coeso
    renderGunbloodEnvironment(mainCtx, dt);

    // 2. Física de Balas e Sangue
    updateBulletsPhysics(dt);
    updateBloodParticles(dt);

    // 3. Os 2 Pistoleiros Articulados
    renderGunbloodCharacter(mainCtx, fighter1, 'p1', dt);
    renderGunbloodCharacter(mainCtx, fighter2, 'p2', dt);

    // 4. Balas, Fogo e Gore
    renderProjectilesAndGore(mainCtx);

    // 5. Tambor no Canto Inferior
    const drumCanvasL = document.getElementById('drumCanvasLeft');
    const drumCanvasR = document.getElementById('drumCanvasRight');
    renderTactileDrum(drumCanvasL, fighter1.bullets, fighter1.drumRotation, '#e65c00');
    renderTactileDrum(drumCanvasR, fighter2.bullets, fighter2.drumRotation, '#3b82f6');

    // 6. Mira Reticular (Crosshair) Desenhada no Canvas!
    renderGunbloodCrosshair(mainCtx, cursorAimX, cursorAimY);
  } else if (currentPhase === 'menu') {
    renderMenuAnimation(dt);
  }

  animationFrameId = requestAnimationFrame(gameAnimationLoop);
}

// Animação de Fundo no Menu
let menuTimer = 0;
function renderMenuAnimation(dt) {
  if (!menuCtxEl) return;
  menuTimer += dt;
  menuCtxEl.clearRect(0, 0, screenW, screenH);

  // Céu
  const sky = menuCtxEl.createLinearGradient(0, 0, 0, screenH);
  sky.addColorStop(0, '#c24e00');
  sky.addColorStop(0.35, '#df6d00');
  sky.addColorStop(0.7, '#f09100');
  sky.addColorStop(1, '#ffcf52');
  menuCtxEl.fillStyle = sky;
  menuCtxEl.fillRect(0, 0, screenW, screenH);

  // Sol
  const sx = screenW * 0.5, sy = screenH * 0.44;
  const sunGrad = menuCtxEl.createRadialGradient(sx, sy, 0, sx, sy, 90);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.4, '#ffee88');
  sunGrad.addColorStop(0.85, '#ff8800');
  sunGrad.addColorStop(1, 'rgba(255,80,0,0)');
  menuCtxEl.fillStyle = sunGrad;
  menuCtxEl.beginPath();
  menuCtxEl.arc(sx, sy, 90, 0, Math.PI * 2);
  menuCtxEl.fill();

  // Chão
  const groundY = screenH * 0.72;
  const gr = menuCtxEl.createLinearGradient(0, groundY, 0, screenH);
  gr.addColorStop(0, '#c7581a');
  gr.addColorStop(1, '#3b1202');
  menuCtxEl.fillStyle = gr;
  menuCtxEl.fillRect(0, groundY, screenW, screenH - groundY);
}

// ==========================================================================
// INTERFACE, SELEÇÃO DE PERSONAGENS & NAVEGAÇÃO
// ==========================================================================

function switchToScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screenId));
}

function exitToMainMenu() {
  currentPhase = 'menu';
  if (peerConnection) {
    try { peerConnection.destroy(); } catch (e) {}
    peerConnection = null;
  }
  p2pDataChannel = null;
  if (cpuAimTimer) clearTimeout(cpuAimTimer);
  if (countdownTicker) clearTimeout(countdownTicker);
  clearForfeitTimers();

  switchToScreen('menuScreen');
  renderLeaderboardTable();
  document.getElementById('resultModal').classList.remove('active');
  document.getElementById('matchHistoryBox').style.display = 'none';
}

function switchMenuTab(tabName) {
  ['online', 'cpu', 'char', 'rank'].forEach((t, i) => {
    document.getElementById('tab-' + t).style.display = (t === tabName ? 'block' : 'none');
    document.querySelectorAll('.tab-btn')[i].classList.toggle('active', t === tabName);
  });
  if (tabName === 'rank') renderLeaderboardTable();
  if (tabName === 'char') populateCharacterPicker();
}

function showNotification(msg, duration = 2200) {
  const toast = document.getElementById('toastNotification');
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.style.display = 'none', duration);
}

function toggleAudioMute() {
  isAudioMuted = !isAudioMuted;
  document.getElementById('soundToggleBtn').textContent = isAudioMuted ? '🔇 Mudo' : '🔊 Som';
  if (audioEngine.masterVolume) {
    audioEngine.masterVolume.gain.value = isAudioMuted ? 0 : 0.65;
  }
}

function populateCharacterPicker() {
  const grid = document.getElementById('charPickerGrid');
  grid.innerHTML = '';
  GUNSLINGERS.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'char-card' + (idx === chosenCharIndex ? ' selected' : '');
    card.onclick = () => pickCharacter(idx);

    const cv = document.createElement('canvas');
    cv.width = 80;
    cv.height = 115;
    card.appendChild(cv);

    const title = document.createElement('div');
    title.className = 'char-title';
    title.textContent = c.name;
    card.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'char-info';
    desc.textContent = c.desc;
    card.appendChild(desc);

    grid.appendChild(card);
    renderCharacterMiniPreview(cv, idx, OUTFIT_COLORS[chosenColorIndex]);
  });

  const pal = document.getElementById('colorPaletteList');
  pal.innerHTML = '';
  OUTFIT_COLORS.forEach((col, idx) => {
    const dot = document.createElement('div');
    dot.className = 'color-dot' + (idx === chosenColorIndex ? ' active' : '');
    dot.style.background = col;
    dot.title = OUTFIT_COLOR_NAMES[idx];
    dot.onclick = () => pickOutfitColor(idx);
    pal.appendChild(dot);
  });
}

function renderCharacterMiniPreview(canvasEl, charIdx, color) {
  const pctx = canvasEl.getContext('2d');
  pctx.clearRect(0, 0, 80, 115);
  const S = 0.44;
  pctx.save();
  pctx.translate(40, 108);

  const mockFighter = {
    charIdx: charIdx,
    customColor: color,
    aimAngle: 0.15,
    recoilAngle: 0,
    knockbackX: 0,
    isKneeling: false,
    kneelProgress: 0,
    isHeadless: false,
    isDead: false,
    bulletHoles: []
  };

  const charData = GUNSLINGERS[charIdx];
  renderArticulatedLegs(pctx, charData, mockFighter, S, 0);
  renderArticulatedTorso(pctx, charData, mockFighter, S, 0);
  renderArticulatedArmedArm(pctx, charData, mockFighter, S, 0, false);
  renderArticulatedHead(pctx, charData, mockFighter, S, 0);

  pctx.restore();
}

function pickCharacter(idx) {
  chosenCharIndex = idx;
  document.querySelectorAll('.char-card').forEach((c, i) => c.classList.toggle('selected', i === idx));
  refreshCharacterPreviews();
}

function pickOutfitColor(idx) {
  chosenColorIndex = idx;
  document.querySelectorAll('.color-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  refreshCharacterPreviews();
}

function refreshCharacterPreviews() {
  document.querySelectorAll('#charPickerGrid canvas').forEach((cv, i) => {
    renderCharacterMiniPreview(cv, i, OUTFIT_COLORS[chosenColorIndex]);
  });
}

function checkUrlDirectJoin() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('sala');
  if (room) {
    document.getElementById('joinCodeInput').value = room.toUpperCase();
    showNotification(`Código da sala detectado: ${room}`, 3500);
    switchMenuTab('online');
  }
}

function handleWindowResize() {
  screenW = window.innerWidth;
  screenH = window.innerHeight;

  if (mainCanvas) { mainCanvas.width = screenW; mainCanvas.height = screenH; }
  if (menuCanvasEl) { menuCanvasEl.width = screenW; menuCanvasEl.height = screenH; }
  if (bloodStainsCanvas) {
    const temp = document.createElement('canvas');
    temp.width = bloodStainsCanvas.width;
    temp.height = bloodStainsCanvas.height;
    temp.getContext('2d').drawImage(bloodStainsCanvas, 0, 0);

    bloodStainsCanvas.width = screenW;
    bloodStainsCanvas.height = screenH;
    bloodStainsCtx.drawImage(temp, 0, 0);
  }
}
window.addEventListener('resize', handleWindowResize);

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

function initDueloDeSangue() {
  mainCanvas = document.getElementById('gameCanvas');
  mainCtx = mainCanvas.getContext('2d');
  menuCanvasEl = document.getElementById('menuCanvasBg');
  menuCtxEl = menuCanvasEl.getContext('2d');

  handleWindowResize();
  initBackgroundElements();

  const fill = document.getElementById('loadFill');
  const loadSteps = [
    'Forjando revólveres .45...',
    'Afiando esporas de prata...',
    'Sintetizando ecos de cânion...',
    'Montando o Saloon...',
    'Pronto para o Duelo de Sangue!'
  ];
  let progress = 0;
  let stepIdx = 0;

  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 14 + 10);
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        switchToScreen('menuScreen');
        currentPhase = 'menu';
        populateCharacterPicker();
        checkUrlDirectJoin();
        renderLeaderboardTable();

        lastFrameTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(gameAnimationLoop);

        document.addEventListener('click', () => audioEngine.resume(), { once: true });
        document.addEventListener('touchstart', () => audioEngine.resume(), { once: true });
      }, 500);
    }
    fill.style.width = progress + '%';
    if (stepIdx < loadSteps.length && progress > stepIdx * 20) {
      document.getElementById('loadText').textContent = loadSteps[stepIdx++];
    }
  }, 120);
}

window.addEventListener('load', initDueloDeSangue);
