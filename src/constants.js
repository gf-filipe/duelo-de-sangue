/* ==========================================================================
   DUELO DE SANGUE — CONSTANTES CENTRAIS (fonte única de verdade)
   Módulo puro (IIFE + namespace global) carregado antes de main.js.
   Sem import/export: compatível com <script> clássico no Netlify.
   ========================================================================== */
(function attachDuelConstants(global) {
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
  const GROUND_RATIO = 0.74; // Altura proporcional do chão

  // Object.freeze impede reatribuição das propriedades do namespace (os valores
  // internos mantêm o mesmo comportamento de antes, quando eram const locais).
  global.DuelConstants = Object.freeze({
    GUNSLINGERS,
    OUTFIT_COLORS,
    OUTFIT_COLOR_NAMES,
    BULLET_SPEED,
    GROUND_RATIO
  });
})(window);
