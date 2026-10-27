/* Desenho de personagens (pessoas, animais) e da caricatura do Flavinho.
   Coordenadas locais: (0,0) = pés; adulto padrão tem ~46 unidades de altura. */
(function () {
  const CF = (window.CF = window.CF || {});
  const D = CF.Draw;
  const INK = D.INK;

  // Poses de braço: retornam polylines do braço esquerdo (l) e direito (r).
  const ARMS = {
    down: (h) => ({ l: [[-h + 1, -30], [-h - 1.5, -24], [-h - 1, -18]], r: [[h - 1, -30], [h + 1.5, -24], [h + 1, -18]] }),
    up: (h) => ({ l: [[-h + 1, -30], [-h - 2.5, -37], [-h - 2, -44]], r: [[h - 1, -30], [h + 2.5, -37], [h + 2, -44]] }),
    wave: (h) => ({ l: [[-h + 1, -30], [-h - 1.5, -24], [-h - 1, -18]], r: [[h - 1, -30], [h + 4, -34], [h + 3, -43]] }),
    hips: (h) => ({ l: [[-h + 1, -30], [-h - 4, -25], [-h + 0.5, -19.5]], r: [[h - 1, -30], [h + 4, -25], [h - 0.5, -19.5]] }),
    hold: (h) => ({ l: [[-h + 1, -30], [-h - 1, -23], [0, -22]], r: [[h - 1, -30], [h + 1, -23], [3, -22]] }),
    phone: (h) => ({ l: [[-h + 1, -30], [-h - 1.5, -24], [-h - 1, -18]], r: [[h - 1, -30], [h + 2.5, -27], [3.8, -36]] }),
    camera: (h) => ({ l: [[-h + 1, -30], [-2, -27], [1.5, -36.5]], r: [[h - 1, -30], [h + 2.5, -29], [5.5, -36.5]] }),
    sign: (h) => ({ l: [[-h + 1, -30], [-h - 1, -38], [-1.2, -45]], r: [[h - 1, -30], [h + 1, -38], [1.2, -45]] }),
    cross: (h) => ({ l: [[-h + 1, -30], [-h - 1, -24], [3, -25]], r: [[h - 1, -30], [h + 1, -24.5], [-3, -25.5]] }),
    run: (h) => ({ l: [[-h + 1, -30], [-h - 3, -25], [-h - 1, -21]], r: [[h - 1, -30], [h + 3, -33], [h + 5.5, -30]] }),
    read: (h) => ({ l: [[-h + 1, -30], [-h - 1, -24], [-5, -27]], r: [[h - 1, -30], [h + 1, -24], [6, -27]] }),
  };

  const lerpPt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  // ---------------------------------------------------------------- pessoa
  function drawPerson(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.pose === 'lie') ctx.rotate(p.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
    ctx.scale(p.s || 1, p.s || 1);
    if (p.dir < 0 && p.pose !== 'lie') ctx.scale(-1, 1);
    if (p.clipY != null) {
      ctx.beginPath();
      ctx.rect(-80, -140, 160, 140 + p.clipY);
      ctx.clip();
    }
    const sit = p.pose === 'sit';
    if (sit) ctx.translate(0, 8);

    const half = 5.5 * (p.w || 1);
    const ts = p.topStyle || 'tshirt';
    const bs = p.bottomStyle || 'pants';

    if (p.prop) backProp(ctx, p, half);
    if (p.pose !== 'swim') drawLegs(ctx, p, half, bs, sit);
    drawTorso(ctx, p, half, ts);
    if (p.pose !== 'swim') drawBottom(ctx, p, half, bs);
    if (p.prop && p.prop.type === 'ring') {
      ctx.lineWidth = 3;
      ctx.strokeStyle = p.prop.color || '#ff6b6b';
      ctx.beginPath();
      ctx.ellipse(0, -21, half + 3, 2.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawArms(ctx, p, half, ts);
    D.rect(ctx, -1.5, -34.5, 3, 3, p.skin, 0.6);
    if (p.headFn) p.headFn(ctx, p);
    else drawHead(ctx, p);
    if (p.prop) frontProp(ctx, p, half);
    ctx.restore();
  }

  function drawLegs(ctx, p, half, bs, sit) {
    const hipY = -18;
    const legCol = bs === 'pants' ? p.bottom : p.skin;
    let L, R;
    if (sit) {
      L = [[-2.5, hipY], [5, hipY + 0.5], [5.5, hipY + 9]];
      R = [[2.5, hipY], [8.5, hipY + 0.5], [9, hipY + 9]];
    } else {
      const st = (p.step || 0) * 3;
      L = [[-2.5, hipY], [-2.5 + st, -1]];
      R = [[2.5, hipY], [2.5 - st, -1]];
    }
    for (const leg of [L, R]) {
      D.limb(ctx, leg, 4, legCol);
      if (bs === 'shorts') D.limb(ctx, [leg[0], lerpPt(leg[0], leg[1], 0.45)], 4.8, p.bottom);
      const f = leg[leg.length - 1];
      if (p.shoes) D.ell(ctx, f[0] + 1, f[1] + 0.3, 2.5, 1.3, p.shoes, 0.6);
      else D.ell(ctx, f[0] + 0.8, f[1] + 0.3, 1.8, 1, p.skin, 0.5);
    }
    if (bs === 'skirt') D.poly(ctx, [-half + 0.5, hipY - 1, half - 0.5, hipY - 1, half + 2, hipY + 7, -half - 2, hipY + 7], p.bottom, 0.7);
  }

  function drawTorso(ctx, p, half, ts) {
    const skinTop = ts === 'none' || ts === 'bikini' || ts === 'tank';
    D.rr(ctx, -half, -32, half * 2, 15, 3);
    D.fs(ctx, skinTop ? p.skin : p.top);
    if (ts === 'tank') D.rect(ctx, -half + 2, -31, half * 2 - 4, 14, p.top, 0.6, 1.5);
    else if (ts === 'bikini') {
      D.ell(ctx, -2.2, -28, 2.3, 1.6, p.top, 0.6);
      D.ell(ctx, 2.2, -28, 2.3, 1.6, p.top, 0.6);
    } else if (ts === 'stripes') {
      ctx.save();
      D.rr(ctx, -half, -32, half * 2, 15, 3);
      ctx.clip();
      ctx.fillStyle = p.top2 || '#fff';
      for (let y = -30; y < -17; y += 3.2) ctx.fillRect(-half, y, half * 2, 1.5);
      ctx.restore();
      D.rr(ctx, -half, -32, half * 2, 15, 3);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = INK;
      ctx.stroke();
    } else if (ts === 'cbf') {
      ctx.fillStyle = '#1b9a4a';
      ctx.fillRect(-2.6, -32, 5.2, 1.4);
      ctx.fillRect(-half + 0.5, -18.6, half * 2 - 1, 1.2);
      D.ell(ctx, -2.6, -28, 1, 1.2, '#1f5fbf', 0.3);
    } else if (ts === 'suit') {
      D.poly(ctx, [-2.6, -32, 0, -24.5, 2.6, -32], p.shirt || '#fbfbf8', 0.5);
      D.poly(ctx, [0, -31.4, -1.1, -29.6, -0.6, -23.2, 0, -22.2, 0.6, -23.2, 1.1, -29.6], p.tie || '#b22', 0.4);
      D.line(ctx, -2.6, -32, -1.2, -25.5, INK, 0.5);
      D.line(ctx, 2.6, -32, 1.2, -25.5, INK, 0.5);
      D.dot(ctx, 1.6, -20.5, 0.45, INK);
    } else if (ts === 'uniform') {
      ctx.fillStyle = '#151515';
      ctx.fillRect(-half, -19.6, half * 2, 1.6);
      D.ell(ctx, -2.6, -28, 1, 1, '#f2c230', 0.3);
      if (p.label) D.text(ctx, p.label, 2, -27.5, 2.8, p.labelColor || '#ffd84a');
    }
    if (p.npcId === 'jones_manoel') {
      D.rect(ctx, -3.6, -27.5, 7.2, 4.2, '#f1c40f', 0.35, 0.5);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-3.4, -25.2, 6.8, 1.8);
      D.dot(ctx, -2.2, -29.8, 0.9, '#222');
      D.dot(ctx, -2.2, -29.8, 0.4, '#eee');
    } else if (p.npcId === 'erika_hilton') {
      D.rect(ctx, -half, -32.2, half * 2, 2.8, p.skin, 0);
      D.rect(ctx, -half - 0.8, -29.8, half * 2 + 1.6, 3.2, '#7d3c98', 0.6, 1.2);
    } else if (p.npcId === 'nikolas_ferreira') {
      D.dot(ctx, 2.5, -28.8, 0.65, '#f5f6fa');
    } else if (p.npcId === 'lula') {
      D.poly(ctx, [-2.5, -32, 0, -28.5, 2.5, -32], '#e8ecf2', 0.45);
      D.line(ctx, 0, -28.5, 0, -18, '#cfd6e0', 0.5);
      D.rect(ctx, 1.2, -27.5, 2.6, 2.8, '#edf0f5', 0.35, 0.3);
    }
    if (p.logo) D.text(ctx, p.logo, 0, -25, 3, p.logoColor || '#fff');
  }

  function drawBottom(ctx, p, half, bs) {
    if (bs === 'trunks' || bs === 'bikini') D.rect(ctx, -half + 0.3, -19.5, half * 2 - 0.6, 4, p.bottom, 0.6, 1);
    else if (bs === 'pants' || bs === 'shorts') D.rect(ctx, -half + 0.3, -19.5, half * 2 - 0.6, 3.5, p.bottom, 0.6, 0.5);
  }

  function drawArms(ctx, p, half, ts) {
    const A = (ARMS[p.arms] || ARMS.down)(half);
    const bare = ts === 'none' || ts === 'bikini' || ts === 'tank';
    const longSleeve = ts === 'suit' || p.longSleeve;
    for (const arm of [A.l, A.r]) {
      if (longSleeve) D.limb(ctx, arm, 3.1, p.top);
      else {
        D.limb(ctx, arm, 2.8, p.skin);
        if (!bare) D.limb(ctx, [arm[0], lerpPt(arm[0], arm[1], 0.6)], 3.4, p.top);
      }
      const h = arm[arm.length - 1];
      D.ell(ctx, h[0], h[1], 1.4, 1.4, p.skin, 0.5);
    }
  }

  function drawHead(ctx, p) {
    const hs = p.hairStyle || 'short';
    const hc = p.hair;
    if (hs === 'long') D.rect(ctx, -5.6, -43.5, 11.2, 13.5, hc, 0.7, 4);
    else if (hs === 'afro') D.ell(ctx, 0, -40, 7.6, 7, hc, 0.7);
    else if (hs === 'ponytail') D.ell(ctx, -5.4, -36.5, 1.8, 4, hc, 0.6);

    D.ell(ctx, 0, -38.5, 4.6, 5.2, p.skin, 0.8);
    if (p.burn) {
      ctx.fillStyle = 'rgba(240,60,50,.55)';
      ctx.beginPath();
      ctx.ellipse(0, -37.5, 4.2, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (hs === 'short' || hs === 'long' || hs === 'ponytail' || hs === 'bun') {
      ctx.beginPath();
      ctx.ellipse(0, -40.2, 5, 4, 0, Math.PI, Math.PI * 2);
      ctx.closePath();
      D.fs(ctx, hc, 0.6);
    }
    if (hs === 'bun') D.ell(ctx, 0, -45.3, 2.3, 2, hc, 0.6);
    if (hs === 'curly') for (const [cx, cy] of [[-3.6, -41], [-1.4, -43], [1.2, -43.3], [3.5, -41.4], [4.6, -39]]) D.ell(ctx, cx, cy, 2, 2, hc, 0.5);
    if (hs === 'bald') {
      ctx.fillStyle = hc;
      ctx.fillRect(-4.7, -40, 1.3, 3);
      ctx.fillRect(3.4, -40, 1.3, 3);
    }
    if (hs === 'buzz') {
      ctx.beginPath();
      ctx.ellipse(0, -40, 4.7, 3.6, 0, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = hc;
      ctx.fill();
    }

    // rosto
    if (p.glasses) {
      ctx.fillStyle = p.glasses === true ? '#111' : p.glasses;
      D.rr(ctx, -3.9, -39.9, 3.2, 1.9, 0.7);
      ctx.fill();
      D.rr(ctx, 0.7, -39.9, 3.2, 1.9, 0.7);
      ctx.fill();
      ctx.fillRect(-0.8, -39.4, 1.6, 0.5);
    } else {
      D.dot(ctx, -1.4, -38.8, 0.6, INK);
      D.dot(ctx, 2.2, -38.8, 0.6, INK);
    }
    if (p.beard) {
      ctx.beginPath();
      ctx.ellipse(0, -35.5, 4.4, 2.6, 0, 0, Math.PI);
      ctx.fillStyle = hc;
      ctx.fill();
    }
    if (p.mustache) {
      ctx.fillStyle = hc;
      ctx.fillRect(-1.3, -37.1, 3.8, 1);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.55;
    if (p.mood === 'o') D.ell(ctx, 0.5, -35.6, 0.8, 0.8, '#7a2a2a', 0.3);
    else if (p.mood === 'flat') D.line(ctx, -0.6, -35.8, 1.6, -35.8, INK, 0.5);
    else {
      ctx.beginPath();
      if (p.mood === 'sad') ctx.arc(0.5, -34.6, 1.4, 1.2 * Math.PI, 1.8 * Math.PI);
      else ctx.arc(0.5, -36.6, 1.5, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
    drawHat(ctx, p);
  }

  function drawHat(ctx, p) {
    const c = p.hatColor || '#d33';
    switch (p.hat) {
      case 'cap':
        ctx.beginPath();
        ctx.ellipse(0, -41, 5, 3.8, 0, Math.PI, Math.PI * 2);
        ctx.closePath();
        D.fs(ctx, c, 0.6);
        D.ell(ctx, 4.2, -41, 3.8, 1, c, 0.5);
        if (p.hatLabel) D.text(ctx, p.hatLabel, 0, -42.6, 2.4, p.hatLabelColor || '#fff');
        break;
      case 'straw':
        D.ell(ctx, 0, -41.5, 8.5, 1.9, '#e9c46a', 0.6);
        D.rect(ctx, -4, -46.5, 8, 5.2, '#e9c46a', 0.6, 2);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(-4, -43, 8, 1.2);
        break;
      case 'police':
        D.rect(ctx, -5, -46.5, 10, 5, c, 0.6, 1);
        D.ell(ctx, 2.5, -41.4, 5, 1.2, '#111', 0.4);
        D.ell(ctx, 0, -44, 1, 1, '#f2c230', 0.3);
        break;
      case 'bucket':
        D.poly(ctx, [-4, -46, 4, -46, 6, -41, -6, -41], c, 0.6);
        break;
      case 'headband':
        ctx.fillStyle = c;
        ctx.fillRect(-4.8, -42, 9.6, 1.6);
        break;
      case 'chef':
        D.rect(ctx, -4, -50, 8, 8, '#fff', 0.6, 3);
        break;
    }
  }

  function backProp(ctx, p, half) {
    const pr = p.prop;
    if (pr.type === 'surf') {
      D.ell(ctx, -7, -26, 3.2, 17, pr.color || '#ff9f43', 0.7);
      D.line(ctx, -7, -42, -7, -10, 'rgba(0,0,0,.35)', 0.6);
    } else if (pr.type === 'mate') {
      for (const x of [-half - 5, half + 0.5]) {
        D.rect(ctx, x, -35, 4.5, 16, '#d9d9d9', 0.6, 2);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x + 0.3, -30, 3.9, 4);
      }
    } else if (pr.type === 'balloons') {
      const cols = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#9b59b6', '#ff6fa8', '#e67e22'];
      for (let i = 0; i < 7; i++) {
        const bx = 4 + (i % 4) * 4 - 4, by = -66 + Math.floor(i / 4) * 6 + (i % 2) * 2;
        D.line(ctx, 3, -22, bx, by, '#666', 0.25);
        D.ell(ctx, bx, by, 2.8, 3.4, cols[i], 0.5);
      }
    }
  }

  function frontProp(ctx, p, half) {
    const pr = p.prop;
    switch (pr.type) {
      case 'sign': {
        D.line(ctx, 0, -44, 0, -58, '#7a5230', 1.2);
        const w = pr.w || 28;
        D.rect(ctx, -w / 2, -72, w, 14, pr.bg || '#fff', 0.7, 0.6);
        const lines = String(pr.text).split('\n');
        const size = pr.size || D.fitSize(lines.reduce((a, b) => (a.length > b.length ? a : b)), w - 2, lines.length > 1 ? 4.2 : 5);
        lines.forEach((ln, i) => D.mtext(ctx, p.dir < 0 ? -1 : 1, ln, 0, -65 + (i - (lines.length - 1) / 2) * size * 1.1, size, pr.color || '#c0392b'));
        break;
      }
      case 'mic':
        D.line(ctx, 3, -22, 6, -29, '#222', 1);
        D.ell(ctx, 6.3, -29.8, 1.4, 1.4, '#555', 0.4);
        if (pr.color) {
          ctx.fillStyle = pr.color;
          ctx.fillRect(4.4, -27.4, 2.6, 2);
        }
        break;
      case 'tvcam':
        D.rect(ctx, -1, -44.5, 12, 6.5, '#333', 0.5, 1);
        D.ell(ctx, 11.5, -41.2, 1.6, 2.2, '#5a6b7a', 0.4);
        D.mtext(ctx, p.dir < 0 ? -1 : 1, pr.label || 'TV', 4.5, -41.3, 2.6, '#fff');
        break;
      case 'camera':
        D.rect(ctx, 1, -40, 6.5, 4.5, '#222', 0.4, 0.8);
        D.ell(ctx, 6.2, -37.8, 1.3, 1.3, '#6cf', 0.3);
        break;
      case 'binoculars':
        D.rect(ctx, 1.5, -40, 5.5, 2.6, '#222', 0.3, 0.6);
        break;
      case 'phone':
        D.rect(ctx, 3, -38.5, 1.7, 3.2, '#111', 0, 0.3);
        break;
      case 'selfie':
        D.line(ctx, 3, -22, 10, -48, '#333', 0.6);
        D.rect(ctx, 8.8, -51.5, 2.6, 4, '#111', 0, 0.3);
        break;
      case 'coconut':
        D.ell(ctx, 3, -23.5, 2.5, 2.5, '#5aa832', 0.5);
        D.line(ctx, 3.5, -25.5, 4.6, -29.5, '#e44', 0.5);
        break;
      case 'icecream':
        D.poly(ctx, [1.8, -22, 4.2, -22, 3, -17.5], '#d9a066', 0.4);
        D.ell(ctx, 3, -23.2, 1.7, 1.6, pr.color || '#ff9ff3', 0.4);
        break;
      case 'balloon':
        D.line(ctx, 3, -22, 6, -50, '#555', 0.3);
        D.ell(ctx, 6, -54, 4, 5, pr.color || '#e74c3c', 0.6);
        break;
      case 'bag':
        D.rect(ctx, half - 1, -19, 5, 6, pr.color || '#8e44ad', 0.5, 0.8);
        break;
      case 'briefcase':
        D.rect(ctx, half - 2, -18, 7, 5, '#3b2a1a', 0.5, 0.6);
        break;
      case 'tray':
        D.rect(ctx, -4, -24, 14, 2, '#bbb', 0.4, 0.5);
        for (let i = 0; i < 4; i++) D.rect(ctx, -3 + i * 3.3, -27.5, 2, 3.5, pr.color || ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'][i], 0.3);
        break;
      case 'biscoito':
        D.line(ctx, -7, -31, 13, -37, '#8b5a2b', 1);
        for (let i = 0; i < 3; i++) {
          const bx = 5 + i * 3.4, by = -36 + i * 1;
          D.rect(ctx, bx - 1.5, by, 3, 6, '#fdfdfd', 0.4, 0.6);
          ctx.fillStyle = i % 2 ? '#e74c3c' : '#27ae60';
          ctx.fillRect(bx - 1.5, by + 2, 3, 1.2);
        }
        break;
      case 'board':
        D.rect(ctx, 4, -50, 9, 32, '#a0522d', 0.6, 0.8);
        ctx.fillStyle = '#111';
        for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) {
          ctx.fillRect(5.2 + c * 4, -48 + r * 5, 1.4, 1);
          ctx.fillRect(6.8 + c * 4, -48 + r * 5, 1.4, 1);
        }
        break;
      case 'grill':
        D.rect(ctx, -2, -25, 10, 3, '#555', 0.4, 0.6);
        for (let i = 0; i < 3; i++) D.line(ctx, i * 3, -25, i * 3 + 1, -31, '#f5d76e', 0.8);
        ctx.fillStyle = 'rgba(200,200,200,.6)';
        ctx.beginPath();
        ctx.arc(3, -35, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'flag':
        D.line(ctx, 3, -22, 3, -60, '#999', 0.8);
        D.rect(ctx, 3, -60, 14, 9, '#1fa04a', 0.5);
        D.poly(ctx, [10, -59, 16, -55.5, 10, -52, 4, -55.5], '#ffdf2b', 0);
        D.dot(ctx, 10, -55.5, 1.8, '#1f4fa8');
        break;
      case 'newspaper':
        D.rect(ctx, -6, -32, 13, 11, '#f5f5f0', 0.6, 0.3);
        D.text(ctx, pr.text || 'JORNAL', 0.5, -30, 2.2, '#111');
        ctx.fillStyle = '#999';
        for (let i = 0; i < 4; i++) ctx.fillRect(-4.5, -27.5 + i * 1.6, 10, 0.6);
        break;
      case 'detector':
        D.line(ctx, 3, -22, 13, -3, '#777', 0.9);
        D.ell(ctx, 14, -2, 3.8, 1.3, '#333', 0.5);
        break;
      case 'bucket':
        D.poly(ctx, [1.5, -21, 5.5, -21, 5, -16, 2, -16], pr.color || '#e74c3c', 0.4);
        break;
      case 'ball':
        D.ell(ctx, 5, -19, 3, 3, '#fff', 0.5);
        ctx.fillStyle = pr.color || '#e74c3c';
        ctx.fillRect(2.2, -19.6, 5.6, 1.2);
        break;
      case 'book':
        D.rect(ctx, -3, -30, 7, 5, pr.color || '#2980b9', 0.4, 0.4);
        break;
    }
  }

  // ---------------------------------------------------------------- FLAVINHO
  /** Visual fixo do Flavinho (baseado nas referências): terno escuro,
      gravata amarelo-clara, topete escuro com têmporas grisalhas,
      sobrancelhas grossas e olhos revirados. Mude aqui para alterar o visual. */
  const FLAVINHO_LOOK = {
    skin: '#e8b28d',
    top: '#1f2433',
    bottom: '#1f2433',
    tie: '#f0e08a',
    shirt: '#fbfbf8',
    shoes: '#121212',
    topStyle: 'suit',
    bottomStyle: 'pants',
    arms: 'down',
    look: 'up',
    w: 1.08,
  };

  function flavinhoHead(ctx, p) {
    const skin = p.skin;
    const HAIR = '#2a211c';
    const GRAY = '#a9a49c';
    D.ell(ctx, -5, -38.6, 1.1, 1.6, skin, 0.6);
    D.ell(ctx, 5, -38.6, 1.1, 1.6, skin, 0.6);
    // rosto com mandíbula larga
    ctx.beginPath();
    ctx.moveTo(-4.8, -41);
    ctx.quadraticCurveTo(-5.1, -35.6, -3.3, -33.5);
    ctx.quadraticCurveTo(0, -32.2, 3.3, -33.5);
    ctx.quadraticCurveTo(5.1, -35.6, 4.8, -41);
    ctx.quadraticCurveTo(4.6, -45.4, 0, -45.6);
    ctx.quadraticCurveTo(-4.6, -45.4, -4.8, -41);
    D.fs(ctx, skin, 0.8);
    // barba por fazer
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(-4.4, -37);
    ctx.quadraticCurveTo(-4.2, -33.8, 0, -32.8);
    ctx.quadraticCurveTo(4.2, -33.8, 4.4, -37);
    ctx.quadraticCurveTo(0, -35.2, -4.4, -37);
    ctx.fillStyle = '#4a4a4a';
    ctx.fill();
    ctx.restore();
    // têmporas grisalhas
    D.ell(ctx, -4.4, -41.4, 1.25, 2.3, GRAY, 0.4);
    D.ell(ctx, 4.4, -41.4, 1.25, 2.3, GRAY, 0.4);
    // topete penteado para cima e para o lado
    ctx.beginPath();
    ctx.moveTo(-4.7, -41.6);
    ctx.quadraticCurveTo(-5.2, -46.8, -1, -47.4);
    ctx.quadraticCurveTo(3.6, -49, 5.9, -46.3);
    ctx.quadraticCurveTo(4.3, -45.8, 4.7, -42.2);
    ctx.quadraticCurveTo(2, -44.4, -1, -43.6);
    ctx.quadraticCurveTo(-3, -43.2, -4.7, -41.6);
    D.fs(ctx, HAIR, 0.6);
    ctx.strokeStyle = 'rgba(210,210,210,.55)';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-3.6, -44.2);
    ctx.quadraticCurveTo(0.5, -47.6, 4.8, -46.2);
    ctx.stroke();
    // sobrancelhas grossas
    ctx.lineCap = 'round';
    ctx.strokeStyle = HAIR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3.5, -40.3);
    ctx.lineTo(-0.8, -41);
    ctx.moveTo(0.9, -41);
    ctx.lineTo(3.6, -40.3);
    ctx.stroke();
    // olhos
    if (p.look === 'up') {
      D.ell(ctx, -2, -39, 1.2, 0.8, '#fff', 0.35);
      D.ell(ctx, 2.1, -39, 1.2, 0.8, '#fff', 0.35);
      D.ell(ctx, -2, -39.6, 0.5, 0.25, INK, 0);
      D.ell(ctx, 2.1, -39.6, 0.5, 0.25, INK, 0);
    } else {
      D.dot(ctx, -1.8, -39, 0.6, INK);
      D.dot(ctx, 2.2, -39, 0.6, INK);
    }
    // nariz e boca aberta
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0.3, -38.4);
    ctx.lineTo(1, -36.6);
    ctx.lineTo(0, -36.3);
    ctx.stroke();
    D.ell(ctx, 0.2, -34.9, 0.95, 0.75, '#7a2a2a', 0.4);
  }

  function drawFlavinho(ctx, f) {
    drawPerson(ctx, Object.assign({}, FLAVINHO_LOOK, f, { headFn: flavinhoHead }));
  }

  // ---------------------------------------------------------------- NPCs ESPECIAIS (Caricaturas)
  function drawStarLens(ctx, cx, cy, rOut, rIn) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? rOut : rIn;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    D.fs(ctx, '#e72c2c', 0.45);
  }

  const NPC_HEADS = {
    jones_manoel(ctx, p) {
      const skin = p.skin;
      const hair = '#161210';
      // Cabelo crespo curto volumoso no topo
      D.ell(ctx, 0, -42.2, 5.3, 4.4, hair, 0.7);
      for (const [cx, cy] of [[-3.8, -43.5], [-1.4, -44.8], [1.4, -44.8], [3.8, -43.5]]) {
        D.ell(ctx, cx, cy, 1.9, 1.6, hair, 0.4);
      }
      // Orelhas e rosto
      D.ell(ctx, -5, -38.4, 1.1, 1.5, skin, 0.6);
      D.ell(ctx, 5, -38.4, 1.1, 1.5, skin, 0.6);
      D.ell(ctx, 0, -38.5, 4.7, 5.2, skin, 0.8);
      // Barba cheia fechada e bigode marcante
      ctx.beginPath();
      ctx.moveTo(-4.7, -38.2);
      ctx.quadraticCurveTo(-4.8, -32.4, 0, -32.2);
      ctx.quadraticCurveTo(4.8, -32.4, 4.7, -38.2);
      ctx.lineTo(3.5, -36.5);
      ctx.quadraticCurveTo(0, -35.2, -3.5, -36.5);
      ctx.closePath();
      D.fs(ctx, hair, 0.6);
      D.rect(ctx, -2.5, -36.9, 5, 1.3, hair, 0.3, 0.5);
      D.line(ctx, -1.2, -35.4, 1.2, -35.4, '#7a4b32', 0.6);
      // Óculos browline (aro superior grosso preto, inferior fino)
      D.rect(ctx, -4.1, -39.9, 3.4, 2.2, 'rgba(255,255,255,0.22)', 0.45, 0.7);
      D.rect(ctx, 0.7, -39.9, 3.4, 2.2, 'rgba(255,255,255,0.22)', 0.45, 0.7);
      ctx.fillStyle = '#111';
      ctx.fillRect(-4.3, -40.3, 3.7, 0.9);
      ctx.fillRect(0.6, -40.3, 3.7, 0.9);
      ctx.fillRect(-0.7, -39.8, 1.4, 0.5);
      D.dot(ctx, -2.3, -38.8, 0.55, INK);
      D.dot(ctx, 2.3, -38.8, 0.55, INK);
    },

    erika_hilton(ctx, p) {
      const skin = p.skin;
      const blonde = '#e5bd5a';
      const darkRoot = '#3a2516';
      // Cabelo loiro longo ondulado atrás dos ombros
      ctx.beginPath();
      ctx.moveTo(-5.8, -42);
      ctx.quadraticCurveTo(-8.2, -35, -7.2, -26.5);
      ctx.quadraticCurveTo(-4.5, -25.5, -3.5, -28);
      ctx.lineTo(3.5, -28);
      ctx.quadraticCurveTo(4.5, -25.5, 7.2, -26.5);
      ctx.quadraticCurveTo(8.2, -35, 5.8, -42);
      ctx.closePath();
      D.fs(ctx, blonde, 0.7);
      // Brinco dourado
      D.ell(ctx, -5.1, -36.8, 0.9, 1.4, '#f1c40f', 0.4);
      // Rosto
      D.ell(ctx, 0, -38.6, 4.5, 5.1, skin, 0.8);
      // Raiz escura e ondas loiras laterais na frente
      ctx.beginPath();
      ctx.ellipse(0, -41.8, 4.8, 3.1, 0, Math.PI, Math.PI * 2);
      D.fs(ctx, darkRoot, 0.5);
      ctx.beginPath();
      ctx.moveTo(-0.5, -43.8);
      ctx.quadraticCurveTo(5.5, -43.5, 6.4, -36.5);
      ctx.quadraticCurveTo(7.1, -31.5, 5.2, -27.5);
      ctx.quadraticCurveTo(3.8, -31.5, 4.1, -37.5);
      ctx.quadraticCurveTo(3.2, -41.2, -0.5, -43.8);
      D.fs(ctx, blonde, 0.55);
      ctx.beginPath();
      ctx.moveTo(-0.8, -43.5);
      ctx.quadraticCurveTo(-5.4, -42.5, -6.1, -36);
      ctx.quadraticCurveTo(-6.6, -31.5, -5.0, -28);
      ctx.quadraticCurveTo(-3.9, -32, -4.1, -37.5);
      ctx.closePath();
      D.fs(ctx, blonde, 0.55);
      // Sobrancelhas arqueadas, olhos e lábios
      D.line(ctx, -3.3, -40.3, -1.0, -40.7, darkRoot, 0.65);
      D.line(ctx, 1.0, -40.7, 3.3, -40.3, darkRoot, 0.65);
      D.dot(ctx, -1.8, -39, 0.65, INK);
      D.dot(ctx, 2.0, -39, 0.65, INK);
      D.ell(ctx, 0.2, -35.5, 1.4, 0.75, '#a34852', 0.4);
    },

    nikolas_ferreira(ctx, p) {
      const skin = p.skin;
      const wig = '#f5dc6b';
      const wigShade = '#dfc046';
      // Peruca loira volumosa atrás
      ctx.beginPath();
      ctx.moveTo(-6.2, -42);
      ctx.quadraticCurveTo(-8.2, -36.5, -6.8, -31.5);
      ctx.lineTo(6.8, -31.5);
      ctx.quadraticCurveTo(8.2, -36.5, 6.2, -42);
      ctx.closePath();
      D.fs(ctx, wigShade, 0.7);
      // Rosto
      D.ell(ctx, 0, -38.5, 4.6, 5.0, skin, 0.8);
      // Topo e franja bagunçada da peruca loira
      ctx.beginPath();
      ctx.moveTo(-5.8, -39.5);
      ctx.quadraticCurveTo(-6.5, -45.8, -1.5, -46.2);
      ctx.quadraticCurveTo(1.5, -47.2, 5.2, -45.5);
      ctx.quadraticCurveTo(6.8, -43.2, 5.8, -38.8);
      ctx.quadraticCurveTo(4.6, -34.2, 5.8, -32.2);
      ctx.lineTo(4.0, -33.2);
      ctx.quadraticCurveTo(4.2, -38.5, 3.4, -40.8);
      ctx.lineTo(1.2, -39.8);
      ctx.lineTo(-0.5, -41.0);
      ctx.lineTo(-2.4, -39.8);
      ctx.quadraticCurveTo(-4.2, -38.5, -4.2, -33.2);
      ctx.lineTo(-5.8, -32.2);
      ctx.closePath();
      D.fs(ctx, wig, 0.65);
      // Olhos, sobrancelhas e boca discursando
      D.line(ctx, -3.1, -39.8, -1.0, -39.9, '#4a3520', 0.65);
      D.line(ctx, 1.0, -39.9, 3.1, -39.8, '#4a3520', 0.65);
      D.dot(ctx, -1.7, -38.6, 0.6, INK);
      D.dot(ctx, 2.0, -38.6, 0.6, INK);
      D.ell(ctx, 0.2, -35.4, 1.2, 0.85, '#7a2a2a', 0.4);
    },

    lucas_pavanato(ctx, p) {
      const skin = p.skin;
      const hair = '#8a623a';
      D.ell(ctx, -4.9, -38.5, 1.0, 1.5, skin, 0.55);
      D.ell(ctx, 4.9, -38.5, 1.0, 1.5, skin, 0.55);
      D.ell(ctx, 0, -38.5, 4.6, 5.1, skin, 0.8);
      // Cabelo castanho-claro penteado em topete lateral
      ctx.beginPath();
      ctx.moveTo(-4.7, -40.5);
      ctx.quadraticCurveTo(-5.0, -45.5, -0.8, -45.8);
      ctx.quadraticCurveTo(4.2, -46.5, 5.2, -42.8);
      ctx.quadraticCurveTo(4.7, -40.2, 4.5, -39.8);
      ctx.quadraticCurveTo(2.2, -42.5, -1.8, -42.0);
      ctx.quadraticCurveTo(-3.6, -41.5, -4.7, -40.5);
      D.fs(ctx, hair, 0.65);
      // Olhos e sorriso largo aberto mostrando os dentes
      D.line(ctx, -3.2, -40.1, -0.9, -40.0, '#5a3e22', 0.65);
      D.line(ctx, 0.9, -40.0, 3.2, -40.1, '#5a3e22', 0.65);
      D.dot(ctx, -1.7, -38.8, 0.6, INK);
      D.dot(ctx, 1.9, -38.8, 0.6, INK);
      ctx.beginPath();
      ctx.moveTo(-2.3, -36.1);
      ctx.quadraticCurveTo(0.1, -33.6, 2.5, -36.1);
      ctx.closePath();
      D.fs(ctx, '#ffffff', 0.55);
    },

    lula(ctx, p) {
      const skin = p.skin;
      const whiteHair = '#e6e8ec';
      // Cabelo branco lateral/topo
      D.ell(ctx, -4.5, -40.5, 1.5, 2.8, whiteHair, 0.5);
      D.ell(ctx, 4.5, -40.5, 1.5, 2.8, whiteHair, 0.5);
      D.ell(ctx, 0, -42.8, 4.4, 2.6, whiteHair, 0.5);
      // Orelhas e rosto
      D.ell(ctx, -5.1, -38.4, 1.1, 1.6, skin, 0.6);
      D.ell(ctx, 5.1, -38.4, 1.1, 1.6, skin, 0.6);
      D.ell(ctx, 0, -38.5, 4.8, 5.2, skin, 0.8);
      // Barba e bigode brancos arredondados
      ctx.beginPath();
      ctx.moveTo(-4.7, -37.8);
      ctx.quadraticCurveTo(-4.8, -32.2, 0, -32.0);
      ctx.quadraticCurveTo(4.8, -32.2, 4.7, -37.8);
      ctx.lineTo(3.3, -36.2);
      ctx.quadraticCurveTo(0, -34.8, -3.3, -36.2);
      ctx.closePath();
      D.fs(ctx, whiteHair, 0.6);
      D.ell(ctx, 0, -36.3, 2.8, 1.1, whiteHair, 0.45);
      D.line(ctx, -1.3, -35.2, 1.3, -35.2, '#7a2a2a', 0.65);
      // Óculos vermelhos em formato de estrela (como na foto de referência)
      drawStarLens(ctx, -2.1, -39.0, 2.4, 1.05);
      drawStarLens(ctx, 2.1, -39.0, 2.4, 1.05);
      D.line(ctx, -0.6, -39.1, 0.6, -39.1, '#b81d1d', 0.6);
    },
  };

  function drawSpecialNPC(ctx, npcPerson) {
    const headFn = NPC_HEADS[npcPerson.npcId] || drawHead;
    drawPerson(ctx, Object.assign({}, npcPerson, { headFn }));
  }

  // ---------------------------------------------------------------- animais
  function withLocal(ctx, o, fn) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.scale((o.s || 1) * (o.dir || 1), o.s || 1);
    fn();
    ctx.restore();
  }

  function drawDog(ctx, o) {
    const c = o.color || '#c68642';
    withLocal(ctx, o, () => {
      for (const lx of [-5, -2.5, 3, 5.5]) D.limb(ctx, [[lx, -6], [lx - 0.5, 0]], 1.7, c);
      D.limb(ctx, [[-7, -9], [-10, -13.5]], 1.4, c);
      D.ell(ctx, 0, -8, 7.5, 4, c, 0.7);
      if (o.spot) D.ell(ctx, -2, -9, 2.5, 2, o.spot, 0);
      D.ell(ctx, 7.5, -12, 3.6, 3.2, c, 0.7);
      D.ell(ctx, 10.4, -11.2, 1.8, 1.3, c, 0.5);
      D.ell(ctx, 6.4, -13.8, 1.3, 2.3, o.ear || '#6b3e1f', 0.5);
      D.dot(ctx, 12, -11.4, 0.6, INK);
      D.dot(ctx, 8.6, -12.8, 0.5, INK);
    });
  }

  function drawCapybara(ctx, o) {
    const c = '#8a5a35';
    withLocal(ctx, o, () => {
      for (const lx of [-6, -3, 4, 7]) D.limb(ctx, [[lx, -4], [lx, 0]], 2.2, c);
      D.ell(ctx, 0, -8, 11, 6.5, c, 0.8);
      D.rect(ctx, 7, -15.5, 9, 7.5, c, 0.8, 3);
      D.ell(ctx, 9, -16, 1.2, 1, '#6b4226', 0.4);
      D.dot(ctx, 12, -13.5, 0.6, INK);
      D.dot(ctx, 15.3, -11.4, 0.6, INK);
    });
  }

  function drawSeagull(ctx, o) {
    withLocal(ctx, o, () => {
      if (o.flying) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(-3, -4, 0, 0);
        ctx.quadraticCurveTo(3, -4, 6, 0);
        ctx.stroke();
        return;
      }
      D.line(ctx, -1, -3, -1, 0, '#e67e22', 0.6);
      D.line(ctx, 1, -3, 1, 0, '#e67e22', 0.6);
      D.ell(ctx, 0, -5.5, 4.5, 2.8, '#fff', 0.6);
      D.ell(ctx, -1, -6, 3, 1.6, '#9aa5ad', 0.4);
      D.ell(ctx, 3.5, -8.5, 1.8, 1.8, '#fff', 0.5);
      D.poly(ctx, [5, -8.8, 7.5, -8.3, 5, -7.8], '#f39c12', 0);
      D.dot(ctx, 4, -9, 0.35, INK);
    });
  }

  function drawPigeon(ctx, o) {
    withLocal(ctx, o, () => {
      D.ell(ctx, 0, -3.5, 3.5, 2.3, '#8e9aa3', 0.5);
      D.ell(ctx, 2.8, -5.5, 1.5, 1.5, '#6f7c86', 0.4);
      D.poly(ctx, [4, -5.6, 5.5, -5.2, 4, -4.9], '#e67e22', 0);
    });
  }

  function drawCrab(ctx, o) {
    withLocal(ctx, o, () => {
      for (const lx of [-3, -1, 1, 3]) D.line(ctx, lx, -2, lx * 1.6, 0, '#c0392b', 0.5);
      D.ell(ctx, 0, -2.5, 3.5, 2, '#e74c3c', 0.5);
      D.ell(ctx, -4.3, -4.5, 1.3, 1, '#e74c3c', 0.4);
      D.ell(ctx, 4.3, -4.5, 1.3, 1, '#e74c3c', 0.4);
    });
  }

  CF.Characters = {
    drawPerson,
    drawFlavinho,
    drawSpecialNPC,
    NPC_HEADS,
    FLAVINHO_LOOK,
    drawDog,
    drawCapybara,
    drawSeagull,
    drawPigeon,
    drawCrab,
  };
})();
