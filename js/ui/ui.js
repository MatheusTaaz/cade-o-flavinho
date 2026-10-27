/* Camada de Interface (DOM): controla telas, HUD, diálogo dos NPCs especiais,
   banners de transição de rodada, toasts humorísticos e modais. */
(function () {
  const CF = (window.CF = window.CF || {});

  function createUI() {
    const hud = document.getElementById('hud');
    const hudRound = document.getElementById('hud-round');
    const hudScore = document.getElementById('hud-score');
    const hudCombo = document.getElementById('hud-combo');
    const hudNpcs = document.getElementById('hud-npcs');
    const hudTime = document.getElementById('hud-time');
    const hudErrors = document.getElementById('hud-errors');
    const toast = document.getElementById('toast');
    const roundBanner = document.getElementById('round-banner');
    const roundBannerText = document.getElementById('round-banner-text');
    const btnNextRound = document.getElementById('btn-next-round');
    const npcDialog = document.getElementById('npc-dialog');
    const npcPortrait = document.getElementById('npc-portrait');
    const npcName = document.getElementById('npc-name');
    const npcSubtitle = document.getElementById('npc-subtitle');
    const npcSpeech = document.getElementById('npc-speech');
    const hint = document.getElementById('hint');
    const startScreen = document.getElementById('start-screen');
    const winScreen = document.getElementById('win-screen');
    const suspectModal = document.getElementById('suspect-modal');
    const npcHintsModal = document.getElementById('npc-hints-modal');
    const npcHintsProgress = document.getElementById('npc-hints-progress');
    const levelNameEl = document.getElementById('level-name');
    const winTitle = document.getElementById('win-title');
    const winSub = document.getElementById('win-sub');
    const winRound = document.getElementById('win-round');
    const winScore = document.getElementById('win-score');
    const winTime = document.getElementById('win-time');
    const winErrors = document.getElementById('win-errors');
    const winNpcs = document.getElementById('win-npcs');
    const winRank = document.getElementById('win-rank');
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const creditsPopover = document.getElementById('credits-popover');
    const btnDownloadShare = document.getElementById('btn-download-share');
    const shareFeedback = document.getElementById('share-feedback');

    let toastTimeout = null;
    let bannerTimeout = null;
    let lastFoundNpcIds = [];
    let lastWinScreenData = null;

    function updateNPCHints(foundIds) {
      if (Array.isArray(foundIds)) {
        lastFoundNpcIds = foundIds.slice();
      }
      const npcs = CF.SPECIAL_NPCS || [];
      const total = npcs.length || 5;
      if (npcHintsProgress) {
        npcHintsProgress.textContent = `NPCs encontrados: ${lastFoundNpcIds.length}/${total}`;
      }
      for (const npc of npcs) {
        const isFound = lastFoundNpcIds.includes(npc.id);
        const itemEl = document.getElementById('npc-hint-' + npc.id);
        const statusEl = document.getElementById('npc-status-' + npc.id);
        const textEl = document.getElementById('npc-hint-text-' + npc.id);
        if (itemEl) {
          if (isFound) itemEl.classList.add('found');
          else itemEl.classList.remove('found');
        }
        if (statusEl) {
          statusEl.textContent = isFound ? '✓' : '?';
        }
        if (textEl && npc.hint) {
          textEl.textContent = npc.hint;
        }
      }
    }

    function populateStaticTexts() {
      const uiTexts = CF.TEXTS.ui;
      document.querySelectorAll('[data-text]').forEach((el) => {
        const key = el.getAttribute('data-text');
        if (uiTexts[key] != null) el.textContent = uiTexts[key];
      });

      for (const listId of ['poster-traits', 'poster-traits-2']) {
        const ul = document.getElementById(listId);
        if (!ul) continue;
        ul.innerHTML = '';
        for (const t of CF.TEXTS.traits) {
          const li = document.createElement('li');
          li.textContent = t;
          ul.appendChild(li);
        }
      }

      CF.SceneRenderer.renderPoster(document.getElementById('poster-canvas'));
      CF.SceneRenderer.renderPoster(document.getElementById('poster-canvas-2'));
    }

    function setLevelName(name) {
      if (levelNameEl) levelNameEl.textContent = name;
    }

    function updateStats(data) {
      if (typeof data === 'object' && data !== null) {
        if (hudRound && data.round != null) hudRound.textContent = String(data.round);
        if (hudScore && data.score != null) hudScore.textContent = String(data.score);
        if (hudCombo && data.combo != null) hudCombo.textContent = String(data.combo);
        if (hudNpcs && data.npcs != null) hudNpcs.textContent = String(data.npcs);
        if (hudErrors && data.errors != null) hudErrors.textContent = String(data.errors);
        if (hudTime && data.time != null) hudTime.textContent = String(data.time);
        if (Array.isArray(data.foundNpcIds)) updateNPCHints(data.foundNpcIds);
      } else {
        if (hudTime) hudTime.textContent = String(data);
        if (hudErrors) hudErrors.textContent = String(arguments[1] || 0);
      }
    }

    function showPlayingHUD() {
      startScreen.classList.add('hidden');
      winScreen.classList.add('hidden');
      suspectModal.classList.add('hidden');
      if (npcHintsModal) npcHintsModal.classList.add('hidden');
      if (creditsPopover) creditsPopover.classList.add('hidden');
      if (btnDownloadShare) btnDownloadShare.classList.add('hidden');
      if (shareFeedback) {
        shareFeedback.textContent = '';
        shareFeedback.classList.add('hidden');
      }
      hud.classList.remove('hidden');
      hint.classList.remove('hidden');
    }

    function showWinScreen(data) {
      lastWinScreenData = Object.assign({}, data);
      hideNPCDialog();
      hideRoundBanner();
      if (btnDownloadShare) btnDownloadShare.classList.add('hidden');
      if (shareFeedback) {
        shareFeedback.textContent = '';
        shareFeedback.classList.add('hidden');
      }
      if (winTitle && data.title) winTitle.textContent = data.title;
      if (winRound && data.round != null) winRound.textContent = String(data.round);
      if (winScore && data.score != null) winScore.textContent = String(data.score);
      if (winTime) winTime.textContent = data.time;
      if (winErrors) winErrors.textContent = String(data.errors);
      if (winNpcs && data.npcs != null) winNpcs.textContent = String(data.npcs);
      if (winSub) winSub.textContent = data.sub || '';
      if (winRank) winRank.textContent = data.rank || '';
      if (winScreen) {
        if (data.isVictory) winScreen.classList.add('victory');
        else winScreen.classList.remove('victory');
        winScreen.classList.remove('hidden');
      }
    }

    function showToast(msg, kind, durationMs) {
      if (!toast) return;
      if (toastTimeout) clearTimeout(toastTimeout);
      toast.textContent = msg;
      toast.classList.remove('error', 'success', 'info');
      toast.classList.add('visible', kind || 'info');
      toastTimeout = setTimeout(() => {
        toast.classList.remove('visible', 'error', 'success', 'info');
      }, durationMs || 2200);
    }

    function showRoundBanner(quote, bonusText) {
      if (!roundBanner) return;
      if (bannerTimeout) {
        clearTimeout(bannerTimeout);
        bannerTimeout = null;
      }
      const fullText = bonusText ? `${quote}  •  ${bonusText}` : quote;
      if (roundBannerText) {
        roundBannerText.textContent = fullText;
      } else {
        roundBanner.textContent = fullText;
      }
      if (btnNextRound) btnNextRound.classList.remove('hidden');
      roundBanner.classList.remove('hidden');
    }

    function hideRoundBanner() {
      if (!roundBanner) return;
      if (bannerTimeout) {
        clearTimeout(bannerTimeout);
        bannerTimeout = null;
      }
      roundBanner.classList.add('hidden');
    }

    function showNPCDialog(npcDef, speechText, statusBadge) {
      if (!npcDialog || !npcDef) return;
      if (npcName) npcName.textContent = npcDef.name;
      if (npcSubtitle) {
        const sub = npcDef.subtitle || '';
        npcSubtitle.textContent = statusBadge ? `${sub} • ${statusBadge}` : sub;
      }
      if (npcSpeech) npcSpeech.textContent = speechText;
      if (npcPortrait && CF.SceneRenderer.renderNPCPortrait) {
        CF.SceneRenderer.renderNPCPortrait(npcPortrait, npcDef);
      }
      npcDialog.classList.remove('hidden');
    }

    function hideNPCDialog() {
      if (!npcDialog) return;
      npcDialog.classList.add('hidden');
    }

    function isNPCDialogOpen() {
      return npcDialog ? !npcDialog.classList.contains('hidden') : false;
    }

    function openSuspectModal() {
      suspectModal.classList.remove('hidden');
    }

    function closeSuspectModal() {
      suspectModal.classList.add('hidden');
    }

    function openNPCHintsModal(foundIds) {
      if (!npcHintsModal) return;
      updateNPCHints(foundIds);
      npcHintsModal.classList.remove('hidden');
    }

    function closeNPCHintsModal() {
      if (!npcHintsModal) return;
      npcHintsModal.classList.add('hidden');
    }

    function toggleNPCHintsModal(foundIds) {
      if (!npcHintsModal) return;
      if (npcHintsModal.classList.contains('hidden')) {
        openNPCHintsModal(foundIds);
      } else {
        closeNPCHintsModal();
      }
    }

    function isNPCHintsModalOpen() {
      return npcHintsModal ? !npcHintsModal.classList.contains('hidden') : false;
    }

    function updateAudioIcon(isMuted) {
      if (!btnAudioToggle) return;
      btnAudioToggle.textContent = isMuted ? '🔇' : '🔊';
      if (isMuted) btnAudioToggle.classList.add('muted');
      else btnAudioToggle.classList.remove('muted');
    }

    function toggleCreditsPopover() {
      if (!creditsPopover) return;
      if (creditsPopover.classList.contains('hidden')) {
        creditsPopover.classList.remove('hidden');
      } else {
        creditsPopover.classList.add('hidden');
      }
    }

    function closeCreditsPopover() {
      if (!creditsPopover) return;
      creditsPopover.classList.add('hidden');
    }

    function isCreditsPopoverOpen() {
      return creditsPopover ? !creditsPopover.classList.contains('hidden') : false;
    }

    function showShareStatus(msg) {
      if (!shareFeedback) return;
      shareFeedback.textContent = msg;
      shareFeedback.classList.remove('hidden');
    }

    function revealDownloadFallback(msg) {
      if (btnDownloadShare) btnDownloadShare.classList.remove('hidden');
      if (msg) showShareStatus(msg);
    }

    function getLastWinScreenData() {
      return lastWinScreenData;
    }

    populateStaticTexts();
    updateNPCHints([]);

    return {
      setLevelName,
      updateStats,
      updateNPCHints,
      updateAudioIcon,
      showPlayingHUD,
      showWinScreen,
      getLastWinScreenData,
      showShareStatus,
      revealDownloadFallback,
      showToast,
      showRoundBanner,
      hideRoundBanner,
      showNPCDialog,
      hideNPCDialog,
      isNPCDialogOpen,
      openSuspectModal,
      closeSuspectModal,
      openNPCHintsModal,
      closeNPCHintsModal,
      toggleNPCHintsModal,
      isNPCHintsModalOpen,
      toggleCreditsPopover,
      closeCreditsPopover,
      isCreditsPopoverOpen,
    };
  }

  CF.UI = {
    createUI,
  };
})();
