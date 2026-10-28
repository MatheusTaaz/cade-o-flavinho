/* Lógica central do jogo (Campanha de 5 Rodadas + 5 NPCs Easter Eggs):
   - Gerencia rodada (1 a 5), pontuação (score), combo, contador de NPCs (0/5 a 5/5), erros (máx. 10) e cronômetro.
   - Rodadas 1 a 4: encontrar o Flavinho congela a rodada atual, mantém a cena e o Flavinho visíveis,
     exibe a mensagem de sucesso e o botão "PRÓXIMA RODADA →" (sem avançar automaticamente).
   - Rodada 5: encontrar o Flavinho encerra o jogo com vitória, para o timer, impede a 6ª rodada
     e exibe a mensagem especial da Polícia Federal com o botão "JOGAR NOVAMENTE".
   - Clicar em um NPC especial incrementa o contador "NPCs encontrados: X/5" (apenas 1x por NPC na partida)
     e exibe sua caixa de diálogo sem contar erro, sem alterar score e sem quebrar o combo. */
(function () {
  const CF = (window.CF = window.CF || {});

  const MAX_ERRORS = 10;
  const MAX_ROUNDS = 5;
  const TOTAL_NPCS = 5;

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  function formatScore(pts) {
    return Math.max(0, Math.floor(pts)).toLocaleString('pt-BR');
  }

  function createGame(opts) {
    const canvas = opts.canvas;
    const ui = opts.ui;
    const levels = CF.LEVELS;
    const texts = CF.TEXTS;

    let currentLevelIndex = 0;
    let scene = null;
    let state = 'idle'; // 'idle' | 'playing' | 'round_clear' | 'won' | 'gameover'
    let round = 1;
    let score = 0;
    let combo = 0;
    let errors = 0;
    let roundErrors = 0;
    let elapsedSeconds = 0;
    let activePlayMs = 0;
    let timerInterval = null;
    let gameStartTimestamp = 0;
    let roundStartTimestamp = 0;
    let transitionTimeout = null;
    let effects = [];
    let lastMissIdx = -1;
    let lastQuoteIdx = -1;
    let lastSeed = null;
    let lastTargetPos = null;
    let lastNpcIds = [];
    let foundNpcIds = new Set();
    let npcSpeechIndexes = {};
    let forcedSpotIndex = opts.forcedSpotIndex != null ? opts.forcedSpotIndex : null;

    const renderer = CF.SceneRenderer.createSceneRenderer(canvas);
    const audio = opts.audio || (CF.Audio && CF.Audio.createAudioManager ? CF.Audio.createAudioManager() : null);
    const camera = CF.Camera.createCamera(canvas, {
      onChange: requestDraw,
      onTap: handleSceneTap,
    });

    let rafId = null;
    function requestDraw() {
      if (rafId) return;
      rafId = requestAnimationFrame(loop);
    }

    function loop(now) {
      rafId = null;
      const camMoving = camera.update(now);
      const showHighlight = state === 'round_clear' || state === 'won' || state === 'gameover';
      renderer.render(camera, effects, showHighlight);
      if (camMoving || effects.length > 0 || showHighlight) {
        requestDraw();
      }
    }

    function nextUniqueSeed() {
      let s;
      do {
        s = (Math.floor(Math.random() * 0x7fffffff) ^ ((Date.now() & 0xffff) << 8) ^ (round * 13337)) >>> 0;
      } while (s === lastSeed || s === 0);
      lastSeed = s;
      return s;
    }

    function syncHUD() {
      const displayCombo = Math.max(1, combo);
      const foundCount = foundNpcIds.size;
      ui.updateStats({
        round: `${round}/${MAX_ROUNDS}`,
        rawRound: round,
        score: formatScore(score),
        rawScore: score,
        combo: 'x' + displayCombo,
        npcs: `${foundCount}/${TOTAL_NPCS}`,
        foundNpcsCount: foundCount,
        foundNpcIds: Array.from(foundNpcIds),
        totalNpcs: TOTAL_NPCS,
        errors: `${errors}/${MAX_ERRORS}`,
        rawErrors: errors,
        maxErrors: MAX_ERRORS,
        time: formatTime(elapsedSeconds),
      });
    }

    function buildRoundScene(spotOverride, useFixedInitialSeed) {
      const level = levels[currentLevelIndex % levels.length];
      const seed = useFixedInitialSeed ? level.seed : nextUniqueSeed();
      const spotIndex = spotOverride != null ? spotOverride : forcedSpotIndex;

      scene = CF.SceneBuilder.buildScene(level, {
        round,
        seed,
        spotIndex,
        lastTargetPos,
        lastNpcIds,
        foundNpcIds: Array.from(foundNpcIds),
      });

      if (scene && scene.target) {
        lastTargetPos = { x: scene.target.x, y: scene.target.y };
      }
      if (scene && scene.npcIds) {
        lastNpcIds = scene.npcIds.slice();
      }

      camera.setWorldSize(scene.width, scene.height);
      renderer.setScene(scene);
      camera.fitToScreen(true);
      ui.setLevelName(`${level.name} • 5 Rodadas`);
      requestDraw();
    }

    function clearTimers() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
      }
    }

    /** Inicia um Novo Jogo zerando score, rodada, combo, erros, NPCs encontrados e timer. */
    function startNewGame(spotOverride) {
      clearTimers();
      score = 0;
      round = 1;
      combo = 0;
      errors = 0;
      roundErrors = 0;
      elapsedSeconds = 0;
      activePlayMs = 0;
      effects = [];
      lastTargetPos = null;
      lastNpcIds = [];
      foundNpcIds.clear();
      state = 'playing';

      ui.showPlayingHUD();
      ui.hideRoundBanner();
      ui.hideNPCDialog();
      buildRoundScene(spotOverride, false);
      syncHUD();
      if (audio) audio.startMusic(true);

      const now = performance.now();
      gameStartTimestamp = now;
      roundStartTimestamp = now;

      timerInterval = setInterval(() => {
        if (state !== 'playing') return;
        const currentRoundMs = Math.max(0, performance.now() - roundStartTimestamp);
        elapsedSeconds = Math.floor((activePlayMs + currentRoundMs) / 1000);
        syncHUD();
      }, 250);

      requestDraw();
    }

    /** Avança para a próxima rodada somente quando acionado pelo botão "PRÓXIMA RODADA →" (até MAX_ROUNDS = 5). */
    function startNextRound(spotOverride) {
      if (state === 'won' || state === 'gameover') return;
      if (round >= MAX_ROUNDS) return;
      round += 1;
      roundErrors = 0;
      effects = [];
      state = 'playing';
      roundStartTimestamp = performance.now();

      ui.hideRoundBanner();
      ui.hideNPCDialog();
      if (audio) audio.startMusic(false);
      buildRoundScene(spotOverride, false);
      syncHUD();
      ui.showToast(`🔎 RODADA ${round}/${MAX_ROUNDS} — O Flavinho mudou de esconderijo!`, 'info', 1800);
      requestDraw();
    }

    function pickMissMessage(item) {
      if (item && item.message) return item.message;
      if (item && item.tag && texts.byTag[item.tag]) {
        const list = texts.byTag[item.tag];
        return list[Math.floor(Math.random() * list.length)];
      }
      const gen = texts.genericMisses;
      let idx = Math.floor(Math.random() * gen.length);
      if (idx === lastMissIdx) idx = (idx + 1) % gen.length;
      lastMissIdx = idx;
      return gen[idx];
    }

    function pickScandalQuote() {
      const list = texts.roundClearQuotes || [texts.ui.winTitle];
      let idx = Math.floor(Math.random() * list.length);
      if (idx === lastQuoteIdx && list.length > 1) idx = (idx + 1) % list.length;
      lastQuoteIdx = idx;
      return list[idx];
    }

    function handleNPCClick(npcItem) {
      const npcDef = npcItem.npcData;
      if (!npcDef) return;
      if (audio) {
        audio.startMusic(false);
        audio.playNpc();
      }
      const lines = npcDef.dialogues || ['"..."'];
      const curIdx = npcSpeechIndexes[npcDef.id] || 0;
      const speech = lines[curIdx % lines.length];
      npcSpeechIndexes[npcDef.id] = curIdx + 1;

      const isNewDiscovery = !foundNpcIds.has(npcDef.id);
      if (isNewDiscovery) {
        foundNpcIds.add(npcDef.id);
        syncHUD();
        if (foundNpcIds.size === TOTAL_NPCS) {
          ui.showToast(texts.ui.allNpcsFoundMessage || '🎉 VOCÊ ENCONTROU TODOS OS 5 NPCs!', 'success', 3200);
        }
      }

      effects.push({
        type: 'npc',
        x: npcItem.x,
        y: npcItem.y - 24,
        start: performance.now(),
        duration: 1350,
      });

      const statusBadge = `NPCs encontrados: ${foundNpcIds.size}/${TOTAL_NPCS}`;
      ui.showNPCDialog(npcDef, speech, statusBadge);
      requestDraw();
    }

    function handleSceneTap(screenX, screenY) {
      if (state !== 'playing') return;
      const worldPt = camera.screenToWorld(screenX, screenY);
      handleWorldClick(worldPt.x, worldPt.y);
    }

    function handleWorldClick(wx, wy) {
      if (state !== 'playing') return;
      if (audio) audio.startMusic(false);
      if (ui.isCreditsPopoverOpen && ui.isCreditsPopoverOpen()) {
        ui.closeCreditsPopover();
      }
      const res = CF.HitTest.testHit(scene, wx, wy);

      // 1. Verifica se clicou em um NPC Especial (Easter Egg interativo)
      // Não conta erro, não altera score, não quebra combo e não encerra a rodada
      if (res.npc && res.item) {
        handleNPCClick(res.item);
        return;
      }

      // Se havia um diálogo de NPC aberto e o jogador clicou em outro ponto da cena, fecha o diálogo
      if (ui.isNPCDialogOpen()) {
        ui.hideNPCDialog();
      }

      if (res.target) {
        // =====================================================================
        // ACHOU O FLAVINHO!
        // =====================================================================
        if (audio) audio.playHit();
        const now = performance.now();
        const roundMs = Math.max(0, now - roundStartTimestamp);
        const roundSec = Math.max(0.5, roundMs / 1000);
        activePlayMs += roundMs;
        elapsedSeconds = Math.floor(activePlayMs / 1000);

        if (roundErrors === 0) {
          combo += 1;
        } else {
          combo = Math.max(1, combo);
        }

        const baseComboPts = 100 + Math.max(0, combo - 1) * 20;
        const speedBonus = Math.max(0, Math.round((30 - roundSec) * 2));
        const totalGained = baseComboPts + speedBonus;
        score = Math.max(0, score + totalGained);

        // Verifica se completou a 5ª e última rodada!
        if (round >= MAX_ROUNDS) {
          state = 'won';
          clearTimers();
          syncHUD();
          if (audio && audio.startVictoryMusic) {
            audio.startVictoryMusic();
          }

          const winMessage = texts.ui.winMainMessage;
          const timeStr = formatTime(elapsedSeconds);
          const rankStr = texts.ranks(score, round);
          ui.showToast('🏆 ' + winMessage, 'success', 3500);
          camera.focusOn(scene.target.x, scene.target.y - 24, 2.65, 420);
          ui.showWinScreen({
            isVictory: true,
            title: winMessage,
            sub: texts.ui.winVictorySub,
            round: `${round}/${MAX_ROUNDS}`,
            score: formatScore(score),
            time: timeStr,
            errors: `${errors}/${MAX_ERRORS}`,
            npcs: `${foundNpcIds.size}/${TOTAL_NPCS}`,
            rank: rankStr,
          });
          requestDraw();
          return;
        }

        // Rodadas 1 a 4: congela a rodada atual, mantém a cena e o Flavinho na tela
        // e exibe a mensagem de sucesso + botão "PRÓXIMA RODADA →" (sem avanço automático!)
        state = 'round_clear';
        syncHUD();

        const quote = pickScandalQuote();
        const bonusLabel = speedBonus > 0
          ? `+${baseComboPts} (Combo x${combo}) +${speedBonus} (Velocidade) = +${totalGained} PTS!`
          : `+${totalGained} PTS! (Combo x${combo})`;

        ui.showRoundBanner(quote, bonusLabel);
        ui.showToast(`${quote} (+${totalGained} pts)`, 'success', 3200);

        camera.focusOn(scene.target.x, scene.target.y - 24, 2.65, 380);
        requestDraw();
      } else {
        // =====================================================================
        // ERROU O CLIQUE: -10 pontos, reseta combo, +1 erro (máximo 10)
        // =====================================================================
        if (audio) audio.playMiss();
        errors += 1;
        roundErrors += 1;
        combo = 0;
        score = Math.max(0, score - 10);
        syncHUD();

        effects.push({
          type: 'miss',
          x: wx,
          y: wy,
          start: performance.now(),
          duration: 650,
        });

        if (errors >= MAX_ERRORS) {
          state = 'gameover';
          const roundMs = Math.max(0, performance.now() - roundStartTimestamp);
          activePlayMs += roundMs;
          elapsedSeconds = Math.floor(activePlayMs / 1000);
          clearTimers();
          syncHUD();

          ui.showToast('🚨 10 ERROS! O Flavinho escapou na muvuca!', 'error', 2600);
          if (scene && scene.target) {
            camera.focusOn(scene.target.x, scene.target.y - 24, 2.65, 500);
          }
          requestDraw();

          transitionTimeout = setTimeout(() => {
            if (state !== 'gameover') return;
            const timeStr = formatTime(elapsedSeconds);
            const rankStr = texts.ranks(score, round);
            ui.showWinScreen({
              isVictory: false,
              title: texts.ui.gameOverTitle,
              sub: texts.ui.winSub,
              round: `${round}/${MAX_ROUNDS}`,
              score: formatScore(score),
              time: timeStr,
              errors: `${errors}/${MAX_ERRORS}`,
              npcs: `${foundNpcIds.size}/${TOTAL_NPCS}`,
              rank: rankStr,
            });
          }, 1150);
          return;
        }

        const msg = pickMissMessage(res.item);
        ui.showToast(msg, 'error', 2200);
        requestDraw();
      }
    }

    return {
      init() {
        round = 1;
        score = 0;
        combo = 0;
        errors = 0;
        foundNpcIds.clear();
        buildRoundScene(forcedSpotIndex, true);
        syncHUD();
      },
      startGame: startNewGame,
      restartGame: startNewGame,
      startNextRound,
      clickWorld: handleWorldClick,
      closeNPCDialog: () => ui.hideNPCDialog(),
      toggleNPCHints: () => ui.toggleNPCHintsModal(Array.from(foundNpcIds)),
      closeNPCHints: () => ui.closeNPCHintsModal(),
      toggleCredits: () => ui.toggleCreditsPopover(),
      closeCredits: () => ui.closeCreditsPopover(),
      toggleAudio() {
        if (!audio) return false;
        const muted = audio.toggleMute();
        ui.updateAudioIcon(muted);
        return muted;
      },
      setMuted(m) {
        if (!audio) return false;
        const muted = audio.setMuted(m);
        ui.updateAudioIcon(muted);
        return muted;
      },
      isMuted: () => (audio ? audio.isMuted() : false),
      getAudioState: () => (audio ? audio.getState() : null),
      shareResult(forceDownloadOnly) {
        const stats = ui.getLastWinScreenData() || {
          isVictory: state === 'won',
          title: state === 'won' ? texts.ui.winMainMessage : texts.ui.gameOverTitle,
          sub: state === 'won' ? texts.ui.winVictorySub : texts.ui.winSub,
          round: `${round}/${MAX_ROUNDS}`,
          score: formatScore(score),
          time: formatTime(elapsedSeconds),
          errors: `${errors}/${MAX_ERRORS}`,
          npcs: `${foundNpcIds.size}/${TOTAL_NPCS}`,
          rank: texts.ranks(score, round),
        };
        return CF.ShareCard.shareOrDownload(stats, ui, forceDownloadOnly);
      },
      getState() {
        return {
          state,
          round,
          maxRounds: MAX_ROUNDS,
          score,
          combo: Math.max(1, combo),
          rawCombo: combo,
          foundNpcsCount: foundNpcIds.size,
          totalNpcs: TOTAL_NPCS,
          foundNpcIds: Array.from(foundNpcIds),
          elapsedSeconds,
          formattedTime: formatTime(elapsedSeconds),
          errors,
          maxErrors: MAX_ERRORS,
          scene,
          camera,
        };
      },
      zoomIn: () => camera.zoomAt(1.28),
      zoomOut: () => camera.zoomAt(1 / 1.28),
      fitView: () => camera.fitToScreen(false),
    };
  }

  CF.Game = {
    createGame,
    formatTime,
    formatScore,
    MAX_ERRORS,
    MAX_ROUNDS,
  };
})();
