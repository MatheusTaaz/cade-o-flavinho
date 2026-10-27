/* Inicialização principal do jogo e conexão dos botões da interface. */
(function () {
  const CF = (window.CF = window.CF || {});

  function bootstrap() {
    const canvas = document.getElementById('scene');
    const ui = CF.UI.createUI();

    const params = new URLSearchParams(window.location.search);
    const forcedSpot = params.has('spot') ? parseInt(params.get('spot'), 10) : null;

    const game = CF.Game.createGame({
      canvas,
      ui,
      forcedSpotIndex: Number.isFinite(forcedSpot) ? forcedSpot : null,
    });

    game.init();
    CF.app = game;

    // Botões de ação
    document.getElementById('btn-start').addEventListener('click', () => {
      game.startGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      game.restartGame();
    });

    const btnNextRound = document.getElementById('btn-next-round');
    if (btnNextRound) {
      btnNextRound.addEventListener('click', () => {
        game.startNextRound();
      });
    }

    const btnNewGame = document.getElementById('btn-new-game');
    if (btnNewGame) {
      btnNewGame.addEventListener('click', () => {
        game.restartGame();
      });
    }

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      game.zoomIn();
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      game.zoomOut();
    });

    document.getElementById('btn-fit').addEventListener('click', () => {
      game.fitView();
    });

    document.getElementById('btn-suspect').addEventListener('click', () => {
      ui.openSuspectModal();
    });

    document.getElementById('btn-close-suspect').addEventListener('click', () => {
      ui.closeSuspectModal();
    });

    const btnCloseNpc = document.getElementById('btn-close-npc');
    if (btnCloseNpc) {
      btnCloseNpc.addEventListener('click', () => {
        ui.hideNPCDialog();
      });
    }

    const btnNpcHints = document.getElementById('btn-npc-hints');
    if (btnNpcHints) {
      btnNpcHints.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        game.toggleNPCHints();
      });
    }

    const hudNpcs = document.getElementById('hud-npcs');
    if (hudNpcs) {
      hudNpcs.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        game.toggleNPCHints();
      });
    }

    const btnCloseNpcHints = document.getElementById('btn-close-npc-hints');
    if (btnCloseNpcHints) {
      btnCloseNpcHints.addEventListener('click', () => {
        game.closeNPCHints();
      });
    }

    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    if (btnAudioToggle) {
      btnAudioToggle.addEventListener('click', () => {
        game.toggleAudio();
      });
    }

    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        game.shareResult(false);
      });
    }

    const btnDownloadShare = document.getElementById('btn-download-share');
    if (btnDownloadShare) {
      btnDownloadShare.addEventListener('click', () => {
        game.shareResult(true);
      });
    }

    const brandTitle = document.getElementById('brand-title');
    if (brandTitle) {
      brandTitle.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        game.toggleCredits();
      });
    }

    const startTitle = document.getElementById('start-title');
    if (startTitle) {
      startTitle.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        game.toggleCredits();
      });
    }

    const creditsPopover = document.getElementById('credits-popover');
    if (creditsPopover) {
      creditsPopover.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
      });
    }

    document.addEventListener('click', () => {
      if (ui.isCreditsPopoverOpen && ui.isCreditsPopoverOpen()) {
        ui.closeCreditsPopover();
      }
    });

    // Atalhos de teclado (+, -, 0, Esc)
    window.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') game.zoomIn();
      else if (e.key === '-') game.zoomOut();
      else if (e.key === '0') game.fitView();
      else if (e.key === 'Escape') {
        ui.closeSuspectModal();
        ui.hideNPCDialog();
        ui.closeNPCHintsModal();
        ui.closeCreditsPopover();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
