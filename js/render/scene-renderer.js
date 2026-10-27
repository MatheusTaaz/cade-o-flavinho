/* Renderizador híbrido da cena:
   - Mantém um cache offscreen da cena inteira para pan/zoom instantâneo (60fps).
   - Quando o zoom é alto, redesenha vetorialmente apenas os itens visíveis (culling)
     para nitidez máxima.
   - Renderiza feedbacks visuais de clique (erro e celebração de vitória) e o cartaz do suspeito. */
(function () {
  const CF = (window.CF = window.CF || {});
  const D = CF.Draw;
  const C = CF.Characters;

  function createSceneRenderer(canvas) {
    const ctx = canvas.getContext('2d');
    let scene = null;
    let cacheCanvas = null;
    let bgCacheCanvas = null;
    const CACHE_SCALE = 1.5; // 3600x2025 para 2400x1350

    function setScene(newScene) {
      scene = newScene;
      buildCaches();
    }

    function buildCaches() {
      if (!scene) return;
      // Cache do fundo
      bgCacheCanvas = document.createElement('canvas');
      bgCacheCanvas.width = Math.round(scene.width * CACHE_SCALE);
      bgCacheCanvas.height = Math.round(scene.height * CACHE_SCALE);
      const bctx = bgCacheCanvas.getContext('2d');
      bctx.save();
      bctx.scale(CACHE_SCALE, CACHE_SCALE);
      scene.drawBackground(bctx);
      bctx.restore();

      // Cache completo (fundo + todos os itens)
      cacheCanvas = document.createElement('canvas');
      cacheCanvas.width = bgCacheCanvas.width;
      cacheCanvas.height = bgCacheCanvas.height;
      const cctx = cacheCanvas.getContext('2d');
      cctx.drawImage(bgCacheCanvas, 0, 0);
      cctx.save();
      cctx.scale(CACHE_SCALE, CACHE_SCALE);
      for (let i = 0; i < scene.items.length; i++) {
        scene.items[i].draw(cctx);
      }
      cctx.restore();
    }

    function render(camera, effects, highlightTarget) {
      if (!scene) return;
      const dpr = window.devicePixelRatio || 1;
      const vw = canvas.clientWidth || window.innerWidth;
      const vh = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#120e24';
      ctx.fillRect(0, 0, vw, vh);

      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      const useVectorCrisp = camera.scale > 1.45 && !camera.isDragging;
      if (!useVectorCrisp && cacheCanvas) {
        ctx.drawImage(cacheCanvas, 0, 0, scene.width, scene.height);
      } else {
        if (bgCacheCanvas) ctx.drawImage(bgCacheCanvas, 0, 0, scene.width, scene.height);
        else scene.drawBackground(ctx);

        // Culling por viewport no espaço do mundo
        const minX = -camera.x / camera.scale - 60;
        const minY = -camera.y / camera.scale - 60;
        const maxX = (vw - camera.x) / camera.scale + 60;
        const maxY = (vh - camera.y) / camera.scale + 60;

        const items = scene.items;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const b = it.bbox;
          if (b) {
            if (b.x + b.w < minX || b.x > maxX || b.y + b.h < minY || b.y > maxY) continue;
          }
          it.draw(ctx);
        }
      }

      // Efeitos de cliques errados (marcador X pulsante no ponto clicado)
      const now = performance.now();
      if (effects && effects.length) {
        for (let i = effects.length - 1; i >= 0; i--) {
          const ef = effects[i];
          const t = (now - ef.start) / ef.duration;
          if (t >= 1) {
            effects.splice(i, 1);
            continue;
          }
          drawEffect(ctx, ef, t, 1 / camera.scale);
        }
      }

      // Destaque de vitória quando o Flavinho foi encontrado
      if (highlightTarget && scene.target) {
        drawWinHighlight(ctx, scene.target, now);
      }

      ctx.restore();
      ctx.restore();
    }

    function drawEffect(ctx, ef, t, invScale) {
      const alpha = 1 - t;
      ctx.save();
      ctx.translate(ef.x, ef.y);
      const s = Math.max(0.65, Math.min(1.5, invScale));
      ctx.scale(s, s);

      if (ef.type === 'miss') {
        const r = 10 + t * 22;
        ctx.strokeStyle = `rgba(231, 76, 60, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        const xSize = 7;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-xSize, -xSize);
        ctx.lineTo(xSize, xSize);
        ctx.moveTo(xSize, -xSize);
        ctx.lineTo(-xSize, xSize);
        ctx.stroke();
      } else if (ef.type === 'npc') {
        const pulse = Math.sin(t * Math.PI * 4) * 3;
        const r = 20 + pulse;
        ctx.strokeStyle = `rgba(255, 223, 43, ${Math.min(1, alpha * 1.4).toFixed(2)})`;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        // Pequeno balão de fala animado acima do NPC
        const by = -28 - Math.sin(t * Math.PI) * 5;
        D.rect(ctx, -15, by - 14, 30, 14, '#ffffff', 0.9, 4);
        D.poly(ctx, [-4, by, 4, by, 0, by + 5], '#ffffff', 0.7);
        D.text(ctx, '💬', 0, by - 7, 9, '#1b1430');
      }
      ctx.restore();
    }

    function drawWinHighlight(ctx, target, now) {
      const cx = target.x;
      const cy = target.y - 25;
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.008);

      // Escurece levemente os arredores e abre um holofote no Flavinho
      ctx.save();
      ctx.fillStyle = 'rgba(15, 10, 30, 0.38)';
      ctx.beginPath();
      ctx.rect(0, 0, scene.width, scene.height);
      ctx.arc(cx, cy, 42 + pulse * 6, 0, Math.PI * 2, true);
      ctx.fill();

      // Redesenha o Flavinho por cima do véu para saltar aos olhos
      target.draw(ctx);

      // Anéis verde-amarelos pulsantes
      ctx.strokeStyle = '#ffdf2b';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 32 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + (1 - pulse) * 8, 0, Math.PI * 2);
      ctx.stroke();

      // Plaquinha acima dele
      D.rect(ctx, cx - 54, cy - 54, 108, 16, '#ffdf2b', 1.2, 4);
      D.text(ctx, 'ACHOU O FLAVINHO!', cx, cy - 46, 8.5, '#1b1430');
      ctx.restore();
    }

    return {
      setScene,
      render,
    };
  }

  /** Desenha o cartaz de procurado do Flavinho nos modais inicial e de ajuda. */
  function renderPoster(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Fundo estilo foto de crachá/debate com listras de medição de altura
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1f3a68');
    g.addColorStop(1, '#10203d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Raios sutis de fundo de debate
    ctx.strokeStyle = 'rgba(110, 180, 255, 0.14)';
    ctx.lineWidth = 18;
    for (let i = -2; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(W * 0.2 + i * 55, 0);
      ctx.lineTo(W * 0.5 + i * 35, H);
      ctx.stroke();
    }

    // Púlpito de acrílico na base (homenagem à referência do debate)
    D.rect(ctx, W / 2 - 95, H - 52, 190, 52, 'rgba(190, 230, 255, 0.25)', 1.2, 4);

    // Caricatura do Flavinho em grande escala no centro
    C.drawFlavinho(ctx, {
      x: W / 2,
      y: H + 34,
      s: 5.5,
      dir: 1,
      arms: 'down',
      look: 'up',
    });

    // Microfones de debate apontados
    D.limb(ctx, [[W / 2 - 58, H - 10], [W / 2 - 42, H - 72]], 2.2, '#222');
    D.ell(ctx, W / 2 - 40, H - 75, 4.5, 4.5, '#c0392b', 0.8);
    D.limb(ctx, [[W / 2 + 58, H - 10], [W / 2 + 42, H - 72]], 2.2, '#222');
    D.ell(ctx, W / 2 + 40, H - 75, 4.5, 4.5, '#c0392b', 0.8);

    // Crachá no púlpito
    D.rect(ctx, W / 2 - 78, H - 40, 156, 28, 'rgba(15, 25, 48, 0.88)', 1, 4);
    D.text(ctx, 'FLÁVIO "FLAVINHO"', W / 2, H - 29, 11, '#ffdf2b');
    D.text(ctx, 'TERNO ESCURO • GRAVATA CLARA', W / 2, H - 17, 8.5, '#ffffff');

    // Callouts visuais apontando os traços-chave
    drawCallout(ctx, 56, 56, W / 2 - 22, 62, 'Topete + grisalho');
    drawCallout(ctx, W - 62, 74, W / 2 + 16, 86, 'Olhos revirados');
    drawCallout(ctx, 64, H - 96, W / 2 - 3, H - 105, 'Gravata clara');
  }

  function drawCallout(ctx, bx, by, tx, ty, label) {
    D.line(ctx, bx, by, tx, ty, '#ffdf2b', 1.6);
    D.dot(ctx, tx, ty, 3, '#ffdf2b');
    const w = label.length * 6.2 + 12;
    D.rect(ctx, bx - w / 2, by - 11, w, 20, '#ffdf2b', 1, 4);
    D.text(ctx, label, bx, by - 1, 10, '#1b1430');
  }

  /** Desenha o retrato cartoon de um NPC especial no modal de diálogo. */
  function renderNPCPortrait(canvas, npcDef) {
    if (!canvas || !npcDef) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const g = ctx.createRadialGradient(W / 2, H / 2, 8, W / 2, H / 2, W * 0.65);
    g.addColorStop(0, '#362763');
    g.addColorStop(1, '#191233');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    C.drawSpecialNPC(ctx, Object.assign({}, npcDef.look, {
      x: W / 2,
      y: H + 34,
      s: 2.85,
      dir: 1,
    }));
  }

  CF.SceneRenderer = {
    createSceneRenderer,
    renderPoster,
    renderNPCPortrait,
  };
})();
