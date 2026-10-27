/* Gerenciador de Áudio (Música de Fundo + Música de Vitória + Efeitos Sonoros):
   - Preparado para arquivos locais em assets/audio/:
     * assets/audio/musica.mp3 (com fallback automático para assets/audio/music.mp3)
     * assets/audio/vitoria.mp3 (música exclusiva da tela final de vitória após a 5ª rodada)
     * assets/audio/acerto.mp3
     * assets/audio/erro.mp3
     * assets/audio/npc.mp3
   - Respeita políticas de autoplay (Chrome, Edge, Firefox): só inicia o áudio após a
     primeira interação válida do jogador.
   - Mantém a música de fundo tocando continuamente entre as rodadas 1 a 4 sem reiniciar.
   - Ao vencer a 5ª rodada, para a música de fundo e inicia a música de vitória (nunca tocando
     as duas simultaneamente).
   - Ao clicar em "JOGAR NOVAMENTE", para a música de vitória e retoma a música de fundo normal.
   - O botão 🔊/🔇 controla música de fundo, música de vitória e efeitos sonoros. */
(function () {
  const CF = (window.CF = window.CF || {});

  const MUSIC_VOLUME = 0.24;
  const VICTORY_VOLUME = 0.34;
  const SFX_VOLUME = 0.65;

  const AUDIO_PATHS = {
    musicPrimary: 'assets/audio/musica.mp3',
    musicFallback: 'assets/audio/music.mp3',
    victoryMusic: 'assets/audio/vitoria.mp3',
    hit: 'assets/audio/acerto.mp3',
    miss: 'assets/audio/erro.mp3',
    npc: 'assets/audio/npc.mp3',
  };

  function createAudioManager() {
    let muted = false;
    let unlocked = false;
    let musicStarted = false;
    let victoryStarted = false;
    let musicEl = null;
    let victoryEl = null;
    let usingFallbackSrc = false;
    let musicAvailable = true;
    let victoryAvailable = true;
    let fadeTimer = null;
    let audioCtx = null;

    const sfxBroken = {
      hit: false,
      miss: false,
      npc: false,
    };

    const sfxTemplates = {};

    function clearFadeTimer() {
      if (fadeTimer) {
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    }

    function getAudioContext() {
      if (audioCtx) return audioCtx;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try {
        audioCtx = new Ctx();
      } catch (_) {
        audioCtx = null;
      }
      return audioCtx;
    }

    function ensureMusicElement() {
      if (musicEl || typeof window.Audio !== 'function') return musicEl;
      try {
        musicEl = new window.Audio();
        musicEl.preload = 'auto';
        musicEl.loop = true;
        musicEl.volume = MUSIC_VOLUME;
        musicEl.muted = muted;

        musicEl.addEventListener('error', () => {
          if (!usingFallbackSrc) {
            usingFallbackSrc = true;
            musicEl.src = AUDIO_PATHS.musicFallback;
            if (musicStarted && !victoryStarted && !muted) {
              const p = musicEl.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            }
          } else {
            musicAvailable = false;
          }
        });

        musicEl.src = AUDIO_PATHS.musicPrimary;
      } catch (_) {
        musicEl = null;
      }
      return musicEl;
    }

    function ensureVictoryElement() {
      if (victoryEl || typeof window.Audio !== 'function') return victoryEl;
      try {
        victoryEl = new window.Audio();
        victoryEl.preload = 'auto';
        victoryEl.loop = true;
        victoryEl.volume = VICTORY_VOLUME;
        victoryEl.muted = muted;

        victoryEl.addEventListener('error', () => {
          victoryAvailable = false;
        });

        victoryEl.src = AUDIO_PATHS.victoryMusic;
      } catch (_) {
        victoryEl = null;
      }
      return victoryEl;
    }

    function playSynthEffect(kind) {
      if (muted) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime || 0;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (kind === 'hit') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.07);
          osc.frequency.setValueAtTime(783.99, now + 0.14);
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.start(now);
          osc.stop(now + 0.33);
        } else if (kind === 'miss') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(210, now);
          osc.frequency.linearRampToValueAtTime(135, now + 0.16);
          gain.gain.setValueAtTime(0.11, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.19);
        } else if (kind === 'npc') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(0.13, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.23);
        }
      } catch (_) {}
    }

    function playSfx(kind) {
      unlock();
      if (muted) return;
      playSynthEffect(kind);
    }

    function unlock() {
      unlocked = true;
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().catch(() => {});
      }
    }

    function stopVictoryMusic() {
      clearFadeTimer();
      victoryStarted = false;
      if (!victoryEl) return;
      try {
        victoryEl.pause();
        victoryEl.currentTime = 0;
        victoryEl.volume = VICTORY_VOLUME;
      } catch (_) {}
    }

    function stopMusic() {
      clearFadeTimer();
      musicStarted = false;
      if (!musicEl) return;
      try {
        musicEl.pause();
        musicEl.currentTime = 0;
        musicEl.volume = MUSIC_VOLUME;
      } catch (_) {}
    }

    /** Inicia a música de fundo normal (garantindo que a música de vitória esteja parada). */
    function startMusic(restartFromBeginning) {
      unlock();
      if (victoryStarted || (victoryEl && !victoryEl.paused)) {
        stopVictoryMusic();
      }
      musicStarted = true;
      const el = ensureMusicElement();
      if (!el || !musicAvailable) return;
      try {
        el.loop = true;
        el.volume = MUSIC_VOLUME;
        el.muted = muted;
        if (restartFromBeginning) {
          try {
            el.currentTime = 0;
          } catch (_) {}
        }
        if (!muted && el.paused !== false) {
          const p = el.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        }
      } catch (_) {}
    }

    /** Para a música de fundo normal e inicia a música exclusiva de vitória com transição suave. */
    function startVictoryMusic() {
      unlock();
      clearFadeTimer();

      // 1. Para a música de fundo normal imediatamente para nunca tocar junto com a de vitória
      musicStarted = false;
      if (musicEl) {
        try {
          musicEl.volume = 0;
          musicEl.pause();
          musicEl.currentTime = 0;
          musicEl.volume = MUSIC_VOLUME;
        } catch (_) {}
      }

      // 2. Inicia a música de vitória com fade-in suave até VICTORY_VOLUME
      victoryStarted = true;
      const vEl = ensureVictoryElement();
      if (!vEl || !victoryAvailable) return;
      try {
        vEl.loop = true;
        vEl.muted = muted;
        vEl.currentTime = 0;
        vEl.volume = muted ? 0 : 0.12;

        if (!muted) {
          const p = vEl.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});

          let step = 0;
          fadeTimer = setInterval(() => {
            step += 1;
            if (!victoryStarted || muted || !vEl) {
              clearFadeTimer();
              return;
            }
            const nextVol = Math.min(VICTORY_VOLUME, 0.12 + step * 0.055);
            try {
              vEl.volume = nextVol;
            } catch (_) {}
            if (nextVol >= VICTORY_VOLUME) {
              clearFadeTimer();
            }
          }, 45);
        }
      } catch (_) {}
    }

    function setMuted(nextMuted) {
      muted = !!nextMuted;
      clearFadeTimer();
      if (musicEl) {
        try {
          musicEl.muted = muted;
          if (muted) {
            musicEl.pause();
          } else if (musicStarted && !victoryStarted && musicAvailable) {
            musicEl.volume = MUSIC_VOLUME;
            const p = musicEl.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        } catch (_) {}
      }
      if (victoryEl) {
        try {
          victoryEl.muted = muted;
          if (muted) {
            victoryEl.pause();
          } else if (victoryStarted && victoryAvailable) {
            victoryEl.volume = VICTORY_VOLUME;
            const p = victoryEl.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        } catch (_) {}
      }
      return muted;
    }

    function toggleMute() {
      unlock();
      return setMuted(!muted);
    }

    return {
      unlock,
      startMusic,
      stopMusic,
      startVictoryMusic,
      stopVictoryMusic,
      playHit: () => playSfx('hit'),
      playMiss: () => playSfx('miss'),
      playNpc: () => playSfx('npc'),
      setMuted,
      toggleMute,
      isMuted: () => muted,
      isMusicPlaying: () => !!(musicStarted && !victoryStarted && !muted),
      isVictoryMusicPlaying: () => !!(victoryStarted && !musicStarted && !muted),
      getState: () => {
        const normalPlaying = !!(musicStarted && !victoryStarted && !muted && (!musicEl || !musicEl.paused));
        const victoryPlaying = !!(victoryStarted && !musicStarted && !muted && (!victoryEl || !victoryEl.paused));
        const bothElementPlaying = !!(musicEl && !musicEl.paused && victoryEl && !victoryEl.paused);
        return {
          muted,
          unlocked,
          musicStarted,
          victoryStarted,
          normalPlaying,
          victoryPlaying,
          bothPlayingSimultaneously: bothElementPlaying,
          musicLoop: musicEl ? !!musicEl.loop : true,
          musicVolume: musicEl ? musicEl.volume : MUSIC_VOLUME,
          victoryVolume: victoryEl ? victoryEl.volume : VICTORY_VOLUME,
          paths: AUDIO_PATHS,
        };
      },
    };
  }

  CF.Audio = {
    createAudioManager,
    AUDIO_PATHS,
  };
})();
