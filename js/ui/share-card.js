/* Gerador de Cartão de Resultado (1080x1920 — Proporção 9:16 para Stories/Status)
   e Compartilhamento Nativo (Web Share API com fallback automático para download PNG). */
(function () {
  const CF = (window.CF = window.CF || {});
  const D = CF.Draw;
  const C = CF.Characters;

  const CARD_W = 1080;
  const CARD_H = 1920;

  let lastCardMeta = null;

  /** Quebra um texto longo em múltiplas linhas para caber em maxWidth. */
  function wrapTextLines(text, maxCharsPerLine) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    for (const w of words) {
      if (!current) {
        current = w;
      } else if ((current + ' ' + w).length <= maxCharsPerLine) {
        current += ' ' + w;
      } else {
        lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /** Renderiza o cartão vertical 1080x1920 com os dados reais da partida. */
  function renderResultCard(stats) {
    const data = {
      title: (stats && stats.title) || CF.TEXTS.ui.winMainMessage,
      sub: (stats && stats.sub) || CF.TEXTS.ui.winVictorySub,
      round: (stats && stats.round) || '5/5',
      score: (stats && stats.score) || '0',
      time: (stats && stats.time) || '00:00',
      errors: (stats && stats.errors) || '0/10',
      npcs: (stats && stats.npcs) || '0/5',
      rank: (stats && stats.rank) || CF.TEXTS.ranks(0, 5),
      isVictory: stats ? stats.isVictory !== false : true,
    };

    const canvas = document.createElement('canvas');
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext('2d');

    // 1. Fundo gradiente na identidade visual do jogo (#251c47 -> #120e24)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bgGrad.addColorStop(0, '#271d4c');
    bgGrad.addColorStop(0.55, '#191233');
    bgGrad.addColorStop(1, '#100b22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Moldura externa verde/amarela
    ctx.strokeStyle = data.isVictory ? '#2ecc71' : '#ff6b6b';
    ctx.lineWidth = 10;
    ctx.strokeRect(28, 28, CARD_W - 56, CARD_H - 56);

    ctx.strokeStyle = '#ffdf2b';
    ctx.lineWidth = 4;
    ctx.strokeRect(46, 46, CARD_W - 92, CARD_H - 92);

    // 2. Cabeçalho com o título "Cadê o Flavinho?"
    D.rect(ctx, 110, 96, CARD_W - 220, 130, '#1f163d', 3, 24);
    D.text(ctx, 'CADÊ O FLAVINHO?', CARD_W / 2, 148, 56, '#ffdf2b');
    D.text(ctx, 'RELATÓRIO OFICIAL DE BUSCA NA MUVUCA', CARD_W / 2, 198, 22, '#d6d2ec');

    // 3. Ilustração central do Flavinho + selo de encontrado
    D.rect(ctx, 190, 260, CARD_W - 380, 390, '#fdf6e2', 4, 24);
    D.rect(ctx, 220, 282, CARD_W - 440, 48, '#c0392b', 0, 10);
    D.text(ctx, data.isVictory ? 'SUSPEITO LOCALIZADO!' : 'PROCURA-SE NA ORLA', CARD_W / 2, 306, 26, '#ffffff');

    ctx.save();
    ctx.beginPath();
    ctx.rect(220, 340, CARD_W - 440, 290);
    ctx.clip();

    const pGrad = ctx.createLinearGradient(0, 340, 0, 630);
    pGrad.addColorStop(0, '#1f3a68');
    pGrad.addColorStop(1, '#10203d');
    ctx.fillStyle = pGrad;
    ctx.fillRect(220, 340, CARD_W - 440, 290);

    if (C && C.drawFlavinho) {
      C.drawFlavinho(ctx, {
        x: CARD_W / 2,
        y: 665,
        s: 5.8,
        dir: 1,
        arms: 'down',
        look: 'up',
      });
    }
    ctx.restore();

    // 4. Mensagem final principal (exata)
    D.rect(ctx, 90, 685, CARD_W - 180, 235, 'rgba(20, 68, 38, 0.92)', 3, 22);
    const titleLines = wrapTextLines(data.title, 34);
    titleLines.forEach((ln, idx) => {
      const yPos = 748 + idx * 46;
      D.text(ctx, ln, CARD_W / 2, yPos, 32, '#ffdf2b');
    });

    // 5. Grade de Estatísticas Reais da Partida
    const statBoxes = [
      { label: 'RODADA', value: String(data.round), x: 90, y: 955, w: 430, h: 165, color: '#2ecc71' },
      { label: 'PONTOS', value: String(data.score), x: 560, y: 955, w: 430, h: 165, color: '#ffdf2b' },
      { label: 'TEMPO', value: String(data.time), x: 90, y: 1145, w: 430, h: 165, color: '#48dbfb' },
      { label: 'ERROS', value: String(data.errors), x: 560, y: 1145, w: 430, h: 165, color: '#ff6b6b' },
    ];

    for (const b of statBoxes) {
      D.rect(ctx, b.x, b.y, b.w, b.h, '#221942', 2.5, 20);
      D.text(ctx, b.label, b.x + b.w / 2, b.y + 48, 24, '#b4aed1');
      D.text(ctx, b.value, b.x + b.w / 2, b.y + 114, 54, b.color);
    }

    // Caixa de NPCs encontrados (largura total)
    D.rect(ctx, 90, 1335, CARD_W - 180, 150, '#2a1f4d', 3, 20);
    D.text(ctx, 'NPCs ENCONTRADOS (EASTER EGGS)', CARD_W / 2, 1380, 23, '#ffe875');
    D.text(ctx, `NPCs encontrados: ${data.npcs}`, CARD_W / 2, 1438, 44, '#ffdf2b');

    // 6. Classificação / Nível Alcançado
    D.rect(ctx, 90, 1515, CARD_W - 180, 175, 'rgba(255, 223, 43, 0.14)', 2.5, 20);
    const rankLines = wrapTextLines(data.rank, 40);
    rankLines.forEach((ln, idx) => {
      const yPos = 1582 + idx * 42;
      D.text(ctx, ln, CARD_W / 2, yPos, 28, '#ffdf2b');
    });

    // 7. Rodapé com ondas do calçadão de Copacabana e assinatura do jogo
    D.text(ctx, 'Jogue "Cadê o Flavinho?" • Desenvolvido por Matheus Taaz ©', CARD_W / 2, 1765, 22, '#d6d2ec');
    D.text(ctx, 'Brasil • 2026', CARD_W / 2, 1808, 20, '#ffdf2b');

    lastCardMeta = {
      width: CARD_W,
      height: CARD_H,
      data: Object.assign({}, data),
      timestamp: Date.now(),
    };

    return { canvas, data, meta: lastCardMeta };
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => {
      if (typeof canvas.toBlob === 'function') {
        try {
          canvas.toBlob((blob) => resolve(blob), 'image/png');
          return;
        } catch (_) {}
      }
      try {
        const dataUrl = typeof canvas.toDataURL === 'function' ? canvas.toDataURL('image/png') : '';
        if (!dataUrl || !dataUrl.startsWith('data:')) {
          resolve(null);
          return;
        }
        const parts = dataUrl.split(',');
        const byteString = typeof atob === 'function' ? atob(parts[1] || '') : '';
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        resolve(typeof Blob === 'function' ? new Blob([ab], { type: 'image/png' }) : null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  function triggerDownload(canvas, filename) {
    let dataUrl = '';
    try {
      if (typeof canvas.toDataURL === 'function') {
        dataUrl = canvas.toDataURL('image/png');
      }
    } catch (_) {}

    const link = document.createElement('a');
    link.download = filename || 'cade-o-flavinho-resultado.png';
    link.href = dataUrl || '#';
    if (document.body && typeof document.body.appendChild === 'function') {
      document.body.appendChild(link);
    }
    if (typeof link.click === 'function') {
      link.click();
    }
    if (link.remove) {
      link.remove();
    }
    if (lastCardMeta) {
      lastCardMeta.downloaded = true;
      lastCardMeta.downloadFilename = link.download;
    }
    return { downloaded: true, filename: link.download, dataUrl };
  }

  /** Compartilha via Web Share API quando disponível, ou ativa o fallback de download PNG. */
  async function shareOrDownload(stats, ui, forceDownloadOnly) {
    const rendered = renderResultCard(stats);
    const { canvas, data } = rendered;

    if (forceDownloadOnly) {
      const dl = triggerDownload(canvas, 'cade-o-flavinho-resultado.png');
      if (ui && ui.showShareStatus) {
        ui.showShareStatus('📥 Imagem baixada com sucesso! Agora é só postar ou enviar.');
      }
      return { mode: 'download', data, width: CARD_W, height: CARD_H, download: dl };
    }

    const blob = await canvasToBlob(canvas);
    const nav = window.navigator || {};

    if (blob && typeof window.File === 'function' && typeof nav.share === 'function') {
      try {
        const file = new window.File([blob], 'cade-o-flavinho-resultado.png', { type: 'image/png' });
        const shareData = {
          title: 'Cadê o Flavinho?',
          text: `${data.title} — Pontos: ${data.score} | Tempo: ${data.time} | NPCs: ${data.npcs}`,
          files: [file],
        };
        const canShareFiles = typeof nav.canShare === 'function' ? nav.canShare({ files: [file] }) : true;
        if (canShareFiles) {
          await nav.share(shareData);
          if (lastCardMeta) lastCardMeta.sharedNatively = true;
          if (ui && ui.showShareStatus) {
            ui.showShareStatus('✅ Resultado compartilhado com sucesso!');
          }
          return { mode: 'web-share', data, width: CARD_W, height: CARD_H };
        }
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return { mode: 'cancelled', data, width: CARD_W, height: CARD_H };
        }
      }
    }

    // Fallback: navegador não suporta compartilhamento direto de arquivos -> exibe opção BAIXAR RESULTADO e baixa o PNG
    const dl = triggerDownload(canvas, 'cade-o-flavinho-resultado.png');
    if (ui && ui.revealDownloadFallback) {
      ui.revealDownloadFallback(
        'Seu navegador não suporta compartilhamento direto. A imagem foi preparada para você baixar e compartilhar.'
      );
    }
    return { mode: 'fallback-download', data, width: CARD_W, height: CARD_H, download: dl };
  }

  CF.ShareCard = {
    CARD_W,
    CARD_H,
    renderResultCard,
    shareOrDownload,
    triggerDownload,
    getLastCardMeta: () => lastCardMeta,
  };
})();
