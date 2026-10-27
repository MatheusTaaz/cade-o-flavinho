/* Renderização do pano de fundo estático de uma fase (céu, morros, mar, ondas,
   areia, calçadão de pedras portuguesas e avenida). */
(function () {
  const CF = (window.CF = window.CF || {});
  const D = CF.Draw;

  function drawBeachCityBackground(ctx, cfg) {
    const W = cfg.width;
    const H = cfg.height;
    const z = cfg.zones;

    // 1. Céu tropical
    const skyGrad = ctx.createLinearGradient(0, 0, 0, z.seaTop);
    skyGrad.addColorStop(0, '#5ec8f8');
    skyGrad.addColorStop(1, '#bfefff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, z.seaTop);

    // Morros ao fundo (Pão de Açúcar / Dois Irmãos estilizados)
    ctx.fillStyle = '#5a9e7e';
    ctx.beginPath();
    ctx.moveTo(0, z.seaTop);
    ctx.lineTo(0, z.seaTop - 45);
    ctx.quadraticCurveTo(140, z.seaTop - 130, 290, z.seaTop - 38);
    ctx.quadraticCurveTo(390, z.seaTop - 95, 510, z.seaTop);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = D.INK;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bondinho no morro esquerdo
    D.line(ctx, 175, z.seaTop - 95, 365, z.seaTop - 68, '#333', 0.8);
    D.rect(ctx, 255, z.seaTop - 80, 12, 8, '#e74c3c', 0.6, 1.5);

    // Morro direito com silhueta de estátua de braços abertos no topo
    ctx.fillStyle = '#4e8f72';
    ctx.beginPath();
    ctx.moveTo(W - 520, z.seaTop);
    ctx.quadraticCurveTo(W - 350, z.seaTop - 145, W - 220, z.seaTop - 50);
    ctx.quadraticCurveTo(W - 110, z.seaTop - 105, W, z.seaTop - 30);
    ctx.lineTo(W, z.seaTop);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const cx = W - 328, cy = z.seaTop - 95;
    D.rect(ctx, cx - 3, cy - 18, 6, 18, '#dfe6e9', 0.6);
    D.rect(ctx, cx - 11, cy - 15, 22, 3.2, '#dfe6e9', 0.6);
    D.ell(ctx, cx, cy - 20.5, 2.2, 2.5, '#dfe6e9', 0.5);

    // 2. Mar
    const seaGrad = ctx.createLinearGradient(0, z.seaTop, 0, z.sandTop);
    seaGrad.addColorStop(0, '#1678b8');
    seaGrad.addColorStop(0.7, '#2299d4');
    seaGrad.addColorStop(1, '#58c7e8');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, z.seaTop, W, z.sandTop - z.seaTop);

    // Marolas no mar
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.2;
    for (let y = z.seaTop + 18; y < z.sandTop - 16; y += 22) {
      for (let x = ((y * 17) % 90); x < W - 40; x += 95) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 12, y - 4, x + 24, y);
        ctx.quadraticCurveTo(x + 36, y - 4, x + 48, y);
        ctx.stroke();
      }
    }

    // 3. Areia da praia
    const sandGrad = ctx.createLinearGradient(0, z.sandTop, 0, z.promenadeTop);
    sandGrad.addColorStop(0, '#f3d58b');
    sandGrad.addColorStop(0.12, '#f7df9c');
    sandGrad.addColorStop(1, '#f4d483');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, z.sandTop, W, z.promenadeTop - z.sandTop);

    // Espuma da arrebentação na beira da praia
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, z.sandTop - 4);
    for (let x = 0; x <= W; x += 40) {
      ctx.quadraticCurveTo(x + 20, z.sandTop + 9 + ((x / 40) % 2) * 5, x + 40, z.sandTop - 2);
    }
    ctx.lineTo(W, z.sandTop - 12);
    ctx.lineTo(0, z.sandTop - 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8ad8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pontinhos sutis de textura na areia
    ctx.fillStyle = 'rgba(180,140,70,0.22)';
    for (let i = 0; i < 900; i++) {
      const sx = (i * 197) % W;
      const sy = z.sandTop + 16 + ((i * 353) % (z.promenadeTop - z.sandTop - 24));
      ctx.fillRect(sx, sy, 2, 2);
    }

    // 4. Calçadão de Copacabana (ondas pretas e brancas)
    const promH = z.roadTop - z.promenadeTop;
    ctx.fillStyle = '#f5f3eb';
    ctx.fillRect(0, z.promenadeTop, W, promH);
    ctx.fillStyle = '#262626';
    for (let row = 0; row < 3; row++) {
      const wy = z.promenadeTop + 10 + row * 28;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      for (let x = 0; x <= W; x += 48) {
        ctx.quadraticCurveTo(x + 12, wy - 8, x + 24, wy);
        ctx.quadraticCurveTo(x + 36, wy + 8, x + 48, wy);
      }
      for (let x = W; x >= 0; x -= 48) {
        ctx.quadraticCurveTo(x - 12, wy + 18, x - 24, wy + 10);
        ctx.quadraticCurveTo(x - 36, wy + 2, x - 48, wy + 10);
      }
      ctx.closePath();
      ctx.fill();
    }
    D.line(ctx, 0, z.promenadeTop, W, z.promenadeTop, D.INK, 1.5);
    D.line(ctx, 0, z.roadTop, W, z.roadTop, D.INK, 1.5);

    // Ciclovia vermelha na borda do calçadão
    ctx.fillStyle = '#c84b31';
    ctx.fillRect(0, z.roadTop - 18, W, 18);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, z.roadTop - 9);
    ctx.lineTo(W, z.roadTop - 9);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Avenida / Asfalto
    const roadH = z.cityWallBottom - z.roadTop;
    ctx.fillStyle = '#3b4046';
    ctx.fillRect(0, z.roadTop, W, roadH);

    // Faixas da pista
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.moveTo(0, z.roadTop + roadH * 0.48);
    ctx.lineTo(W, z.roadTop + roadH * 0.48);
    ctx.stroke();
    ctx.setLineDash([]);

    // Faixas de pedestres
    ctx.fillStyle = '#eaeaea';
    for (const cx of [380, 1020, 1660, 2240]) {
      for (let y = z.roadTop + 6; y < z.cityWallBottom - 18; y += 9) {
        ctx.fillRect(cx - 22, y, 44, 5);
      }
    }

    // Calçada dos prédios na base
    ctx.fillStyle = '#cfc9bc';
    ctx.fillRect(0, z.cityWallBottom - 16, W, H - (z.cityWallBottom - 16));
    D.line(ctx, 0, z.cityWallBottom - 16, W, z.cityWallBottom - 16, D.INK, 1.2);
  }

  CF.Backgrounds = {
    drawBeachCityBackground,
  };
})();
