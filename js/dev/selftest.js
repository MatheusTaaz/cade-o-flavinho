/* Autoteste automatizado completo (Versão Final Candidata ao GitHub Pages):
   Verifica todos os requisitos, incluindo a Música de Vitória exclusiva:
   1. Iniciar partida → música de fundo normal inicia (após 1ª interação)
   2. Encontrar Flavinho nas rodadas 1–4 → música normal continua
   3. Encontrar Flavinho na rodada 5 → música normal para e música de vitória (assets/audio/vitoria.mp3) começa
   4. Confirmar que NUNCA existem duas músicas tocando ao mesmo tempo
   5. Testar mute/unmute (🔊/🔇) controlando música normal, música de vitória e efeitos sonoros
   6. Clicar em "JOGAR NOVAMENTE" → música de vitória para e música normal volta
   7. Preservar 5 rodadas, NPCs (0/5 a 5/5), dicas, compartilhamento 1080x1920 e mini créditos. */
(function () {
  const CF = (window.CF = window.CF || {});

  async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function boxesOverlap(a, b) {
    if (!a || !b) return false;
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  async function runSelfTest() {
    const results = [];
    const assert = (name, cond, info) => {
      results.push({ name, pass: !!cond, info: info || '' });
      if (!cond) console.error('[FAIL]', name, info || '');
    };

    try {
      const app = CF.app;
      assert('1. Instância do jogo, Audio (com vitoria.mp3), ShareCard e 5 NPCs registrados',
        !!app &&
        !!CF.Audio &&
        CF.Audio.AUDIO_PATHS.victoryMusic === 'assets/audio/vitoria.mp3' &&
        !!CF.ShareCard &&
        Array.isArray(CF.SPECIAL_NPCS) &&
        CF.SPECIAL_NPCS.length === 5
      );

      // Verifica que ANTES da primeira interação nenhuma música está tocando
      const audioBeforeStart = app.getAudioState();
      assert('2. Antes da primeira interação nenhuma música inicia em autoplay',
        audioBeforeStart &&
        audioBeforeStart.musicStarted === false &&
        audioBeforeStart.victoryStarted === false
      );

      // Testar mini créditos na tela inicial
      const startTitleEl = document.getElementById('start-title');
      const brandTitleEl = document.getElementById('brand-title');
      const creditsPopoverEl = document.getElementById('credits-popover');
      startTitleEl.click();
      const creditsText = creditsPopoverEl.textContent || '';
      assert('3. Clicar no título abre mini painel de créditos com os 3 textos obrigatórios',
        !creditsPopoverEl.classList.contains('hidden') &&
        creditsText.includes('Desenvolvido por: Matheus Taaz ©') &&
        creditsText.includes('Menção Honrosa: Claudinha') &&
        creditsText.includes('Brasil (Fez o L) - 2026')
      );
      startTitleEl.click();
      assert('4. Clicar novamente fecha o mini painel de créditos', creditsPopoverEl.classList.contains('hidden'));

      // 1. Iniciar partida → música normal começa
      document.getElementById('btn-start').click();
      await sleep(30);
      let st = app.getState();
      let audioSt = app.getAudioState();
      const hudNpcsEl = document.getElementById('hud-npcs');
      const btnNpcHintsEl = document.getElementById('btn-npc-hints');
      const npcHintsModalEl = document.getElementById('npc-hints-modal');
      const btnCloseNpcHintsEl = document.getElementById('btn-close-npc-hints');
      const btnAudioToggleEl = document.getElementById('btn-audio-toggle');
      const roundBannerEl = document.getElementById('round-banner');
      const btnNextRoundEl = document.getElementById('btn-next-round');

      assert('5. Iniciar partida → música de fundo normal começa em loop (música de vitória desligada)',
        audioSt.musicStarted === true &&
        audioSt.victoryStarted === false &&
        audioSt.normalPlaying === true &&
        audioSt.victoryPlaying === false &&
        audioSt.bothPlayingSimultaneously === false
      );

      // Testar mute / unmute pelo botão 🔊 / 🔇 durante a partida
      btnAudioToggleEl.click();
      audioSt = app.getAudioState();
      assert('6. Clicar no botão 🔊/🔇 silencia a música de fundo (🔇)',
        app.isMuted() === true &&
        audioSt.normalPlaying === false &&
        btnAudioToggleEl.textContent === '🔇'
      );
      btnAudioToggleEl.click();
      audioSt = app.getAudioState();
      assert('7. Clicar novamente em 🔊/🔇 retoma a música de fundo normal (🔊)',
        app.isMuted() === false &&
        audioSt.normalPlaying === true &&
        btnAudioToggleEl.textContent === '🔊'
      );

      // Testar mini créditos no HUD
      brandTitleEl.click();
      assert('8. Mini créditos abre pelo título do HUD sem alterar score/erros',
        !creditsPopoverEl.classList.contains('hidden')
      );
      app.closeCredits();

      // Testar um clique de erro na Rodada 1
      app.clickWorld(25, 25);
      st = app.getState();
      audioSt = app.getAudioState();
      assert('9. Efeito de erro executado (1/10) mantendo música de fundo normal ativa',
        st.errors === 1 && audioSt.normalPlaying === true && audioSt.bothPlayingSimultaneously === false
      );

      // Testar painel de dicas dos 5 NPCs
      btnNpcHintsEl.click();
      assert('10. Painel de 5 dicas dos NPCs abre e fecha sem alterar score/erros',
        !npcHintsModalEl.classList.contains('hidden') &&
        (btnCloseNpcHintsEl.click(), npcHintsModalEl.classList.contains('hidden'))
      );

      // Percorrer as 5 rodadas
      for (let r = 1; r <= 5; r++) {
        st = app.getState();
        const sceneBuildings = st.scene.items.filter((it) => it.kind === 'building');
        const target = st.scene.target;

        const targetOverlapsBuilding = sceneBuildings.some((b) => boxesOverlap(target.bbox, b.bbox));
        const npcsOverlapBuilding = (st.scene.npcs || []).some((npc) =>
          sceneBuildings.some((b) => boxesOverlap(npc.bbox, b.bbox))
        );
        assert(`11.${r}. Rodada ${r}: Flavinho e NPCs visíveis acima dos prédios e música normal tocando`,
          !targetOverlapsBuilding &&
          !npcsOverlapBuilding &&
          app.getAudioState().normalPlaying === true &&
          app.getAudioState().victoryPlaying === false
        );

        // Clicar nos NPCs da rodada
        for (const npcItem of st.scene.npcs || []) {
          const prevErrors = app.getState().errors;
          app.clickWorld(npcItem.x, npcItem.y - 22);
          document.getElementById('btn-close-npc').click();
          assert(`11.${r}n. Clicar no NPC ${npcItem.npcData.name} toca efeito sem parar a música normal`,
            app.getState().errors === prevErrors && app.getAudioState().normalPlaying === true
          );
        }

        // Garante encontrar todos os 5 NPCs até a 5ª rodada
        if (r === 5 && app.getState().foundNpcsCount < 5) {
          for (const npcDef of CF.SPECIAL_NPCS) {
            if (!app.getState().foundNpcIds.includes(npcDef.id)) {
              const extraNpc = CF.People.createSpecialNPCItem(npcDef, 220, 660, 1, 1);
              st.scene.npcs.push(extraNpc);
              st.scene.items.push(extraNpc);
              app.clickWorld(extraNpc.x, extraNpc.y - 22);
              document.getElementById('btn-close-npc').click();
            }
          }
        }

        // Encontrar o Flavinho
        app.clickWorld(target.x, target.y - 22);
        st = app.getState();
        audioSt = app.getAudioState();

        if (r < 5) {
          assert(`12.${r}. Encontrar Flavinho na Rodada ${r} (1–4) → música normal continua tocando`,
            st.state === 'round_clear' &&
            audioSt.normalPlaying === true &&
            audioSt.victoryPlaying === false &&
            audioSt.bothPlayingSimultaneously === false &&
            !roundBannerEl.classList.contains('hidden') &&
            !btnNextRoundEl.classList.contains('hidden')
          );
          btnNextRoundEl.click();
          st = app.getState();
          audioSt = app.getAudioState();
          assert(`12.${r}b. Avançar para Rodada ${r + 1} mantém música normal contínua`,
            st.round === r + 1 &&
            st.state === 'playing' &&
            audioSt.normalPlaying === true &&
            audioSt.victoryPlaying === false
          );
        } else {
          assert('13. Encontrar Flavinho na Rodada 5 → música normal PARA e música de vitória COMEÇA (sem tocar juntas)',
            st.state === 'won' &&
            audioSt.musicStarted === false &&
            audioSt.normalPlaying === false &&
            audioSt.victoryStarted === true &&
            audioSt.victoryPlaying === true &&
            audioSt.bothPlayingSimultaneously === false
          );
        }
      }

      // Testar mute/unmute durante a tela de vitória final
      btnAudioToggleEl.click();
      audioSt = app.getAudioState();
      assert('14. Mutar o áudio na tela final silencia também a música de vitória',
        app.isMuted() === true &&
        audioSt.victoryPlaying === false &&
        audioSt.normalPlaying === false &&
        audioSt.bothPlayingSimultaneously === false
      );

      btnAudioToggleEl.click();
      audioSt = app.getAudioState();
      assert('15. Desmutar o áudio na tela final retoma apenas a música de vitória (música normal segue parada)',
        app.isMuted() === false &&
        audioSt.victoryPlaying === true &&
        audioSt.normalPlaying === false &&
        audioSt.bothPlayingSimultaneously === false
      );

      // Verificar tela final e COMPARTILHAR RESULTADO (1080x1920)
      const winScreen = document.getElementById('win-screen');
      const btnShareEl = document.getElementById('btn-share');
      const expectedMessage = 'PARABÉNS VOCÊ ACHOU O FLAVINHO RACHADINHA, JÁ ESTÁ MELHOR QUE A POLÍCIA FEDERAL.';

      assert('16. Tela final exibe mensagem exata e botão "COMPARTILHAR RESULTADO"',
        !winScreen.classList.contains('hidden') &&
        document.getElementById('win-title').textContent === expectedMessage &&
        btnShareEl &&
        btnShareEl.textContent.trim() === 'COMPARTILHAR RESULTADO'
      );

      const fallbackRes = await app.shareResult(false);
      const cardMeta = CF.ShareCard.getLastCardMeta();
      assert('17. Cartão 1080x1920 gerado com os dados REAIS da partida',
        cardMeta &&
        cardMeta.width === 1080 &&
        cardMeta.height === 1920 &&
        cardMeta.data.round === '5/5' &&
        cardMeta.data.npcs === '5/5' &&
        !!fallbackRes
      );

      // 6–8. Clicar em "JOGAR NOVAMENTE" → música de vitória para e música normal volta
      document.getElementById('btn-restart').click();
      await sleep(30);
      st = app.getState();
      audioSt = app.getAudioState();
      assert('18. Clicar em "JOGAR NOVAMENTE" → música de vitória PARA, música normal VOLTA e partida reseta (0/5)',
        st.state === 'playing' &&
        st.round === 1 &&
        st.score === 0 &&
        st.errors === 0 &&
        st.rawCombo === 0 &&
        st.foundNpcsCount === 0 &&
        hudNpcsEl.textContent === '0/5' &&
        audioSt.victoryStarted === false &&
        audioSt.victoryPlaying === false &&
        audioSt.musicStarted === true &&
        audioSt.normalPlaying === true &&
        audioSt.bothPlayingSimultaneously === false &&
        winScreen.classList.contains('hidden')
      );
    } catch (err) {
      assert('Sem exceções durante o autoteste', false, String(err && err.stack ? err.stack : err));
    }

    const failed = results.filter((r) => !r.pass);
    window.__SELFTEST_RESULT__ = {
      passed: failed.length === 0,
      total: results.length,
      failedCount: failed.length,
      results,
    };
    document.body.setAttribute('data-selftest', JSON.stringify(window.__SELFTEST_RESULT__));
    console.log('SELFTEST_SUMMARY:', JSON.stringify(window.__SELFTEST_RESULT__));
    return window.__SELFTEST_RESULT__;
  }

  CF.runSelfTest = runSelfTest;

  window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === '1') {
      setTimeout(runSelfTest, 120);
    }
  });
})();
