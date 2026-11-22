/* ==========================================================================
   DUELO DE SANGUE — ESTADO (fonte única do formato do lutador)
   Módulo puro (IIFE + namespace global) carregado antes de main.js.
   Sem import/export: compatível com <script> clássico no Netlify.

   NOTA DE ESCOPO: por ora este módulo centraliza APENAS a fábrica/forma do
   lutador. O container de estado mutável (fase, coleções de projéteis/placar,
   conexão P2P) continua em main.js e será extraído em uma subtarefa dedicada
   (C02b), pois envolve reatribuições amplas e exige rewiring cuidadoso.
   ========================================================================== */
(function attachDuelState(global) {
  'use strict';

  // ==================== FÁBRICA DE LUTADORES ====================
  /**
   * Cria o estado inicial de um lutador.
   * @param {string} name  Nome exibido no HUD.
   * @param {number} charIdx Índice em GUNSLINGERS.
   * @param {string} color Cor customizada do traje.
   * @returns {object} Estado mutável do lutador (hp, munição, flags anatômicas, etc.).
   */
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
      isDisarmed: false,     // Revólver perdido após tiro no braço armado
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

  global.DuelState = Object.freeze({
    createFighterState
  });
})(window);
