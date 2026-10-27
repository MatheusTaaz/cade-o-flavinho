/* Objetos de cenário: mobiliário urbano, veículos, barcos, prédios etc.
   Cada função recebe (ctx, o) onde o.x/o.y é a base do objeto. */
(function () {
  const CF = (window.CF = window.CF || {});
  const D = CF.Draw;
  const INK = D.INK;
  const P = (CF.Props = {});

  function local(ctx, o, fn) {
    ctx.save();
    ctx.translate(o.x, o.y);
    const s = o.s || 1;
    ctx.scale(s * (o.dir || 1), s);
    fn(o.dir || 1);
    ctx.restore();
  }

  // ------------------------------------------------------------ praia
  P.umbrella = function (ctx, o) {
    const s = o.s || 1, x = o.x, y = o.y, r = (o.r || 22) * s, cy = y - 34 * s, top = cy - r * 0.6;
    D.limb(ctx, [[x, y], [x, top + 2]], 1.1 * s, '#f2f2f2');
    const path = new Path2D();
    path.moveTo(x - r, cy);
    path.quadraticCurveTo(x - r * 0.95, top, x, top);
    path.quadraticCurveTo(x + r * 0.95, top, x + r, cy);
    const n = 6, seg = (2 * r) / n;
    for (let i = n - 1; i >= 0; i--) {
      const xe = x - r + i * seg;
      path.quadraticCurveTo(xe + seg / 2, cy + 3.5 * s, xe, cy);
    }
    path.closePath();
    ctx.fillStyle = o.c1;
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = o.c2;
    for (let i = 0; i < n; i += 2) {
      ctx.beginPath();
      ctx.moveTo(x, top - 4);
      ctx.lineTo(x - r + i * seg, cy + 5 * s);
      ctx.lineTo(x - r + (i + 1) * seg, cy + 5 * s);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = INK;
    ctx.stroke(path);
    D.ell(ctx, x, top, 1.5 * s, 1.5 * s, o.c2, 0.5);
  };

  P.towel = function (ctx, o) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    D.rect(ctx, -o.w / 2, -o.h / 2, o.w, o.h, o.c1, 0.6, 1.5);
    ctx.fillStyle = o.c2;
    const n = o.stripes || 4;
    for (let i = 1; i < n * 2; i += 2) ctx.fillRect(-o.w / 2 + (i * o.w) / (n * 2), -o.h / 2 + 0.4, (o.w / (n * 2)) * 0.6, o.h - 0.8);
    ctx.restore();
  };

  P.chair = function (ctx, o) {
    local(ctx, o, () => {
      D.line(ctx, -6, 0, 4, -14, '#888', 1);
      D.line(ctx, 6, 0, -4, -14, '#888', 1);
      D.poly(ctx, [-7, -12, 7, -12, 9, -6, -5, -6], o.color, 0.6);
      D.poly(ctx, [-9, -28, -5, -28, -3, -11, -7, -11], o.color, 0.6);
    });
  };

  P.cooler = function (ctx, o) {
    D.rect(ctx, o.x - 7, o.y - 10, 14, 10, '#fafafa', 0.7, 1.5);
    D.rect(ctx, o.x - 7.5, o.y - 12, 15, 3, o.color || '#2e86de', 0.6, 1);
  };

  P.sandBucket = function (ctx, o) {
    D.poly(ctx, [o.x - 3, o.y - 6, o.x + 3, o.y - 6, o.x + 2.4, o.y, o.x - 2.4, o.y], o.color || '#e74c3c', 0.5);
    D.line(ctx, o.x + 3, o.y - 5, o.x + 7, o.y - 1, '#f1c40f', 1);
  };

  P.beachBall = function (ctx, o) {
    D.ell(ctx, o.x, o.y - 4, 4, 4, '#fff', 0.6);
    ctx.save();
    ctx.beginPath();
    ctx.arc(o.x, o.y - 4, 4, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(o.x - 4, o.y - 8, 2.6, 8);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(o.x + 1.4, o.y - 8, 2.6, 8);
    ctx.restore();
  };

  P.cart = function (ctx, o) {
    local(ctx, o, (dir) => {
      D.limb(ctx, [[-18, -16], [-27, -22]], 1.3, '#666');
      D.rect(ctx, -18, -24, 36, 17, o.color || '#2e86de', 0.8, 2);
      const goods = {
        laranja: ['#f39c12', '#e67e22', '#f5a623'],
        coco: ['#5aa832', '#4c9a2a', '#6abf3c'],
        milho: ['#f7dc6f', '#f4d03f', '#f9e79f'],
      }[o.goods] || ['#f39c12'];
      let k = 0;
      for (let row = 0; row < 3; row++) {
        const n = 8 - row * 2;
        for (let i = 0; i < n; i++) {
          const gx = -(n - 1) * 2.1 + i * 4.2, gy = -26 - row * 3.4;
          D.ell(ctx, gx, gy, 2.3, o.goods === 'milho' ? 1.4 : 2.3, goods[k++ % goods.length], 0.4);
        }
      }
      D.rect(ctx, -16, -20, 32, 8, '#fff', 0.5, 1);
      D.mtext(ctx, dir, o.label || '', 0, -16, D.fitSize(o.label || '', 30, 4.6), o.labelColor || '#d35400');
      D.ell(ctx, -11, -5, 4, 4, '#333', 0.6);
      D.ell(ctx, 11, -5, 4, 4, '#333', 0.6);
      D.dot(ctx, -11, -5, 1.2, '#aaa');
      D.dot(ctx, 11, -5, 1.2, '#aaa');
    });
  };

  P.kiosk = function (ctx, o) {
    const x = o.x, y = o.y, w = o.w || 70, h = 30, c = o.color || '#27ae60';
    D.rect(ctx, x - w / 2, y - h, w, h, '#f4f4f4', 0.9, 3);
    ctx.fillStyle = c;
    ctx.fillRect(x - w / 2 + 1, y - 7, w - 2, 5);
    D.rect(ctx, x - w / 2 + 6, y - h + 5, w - 12, 12, '#3b2a20', 0.6, 1);
    const bc = ['#2ecc71', '#e74c3c', '#f1c40f', '#3498db', '#ecf0f1', '#9b59b6'];
    for (let i = 0; i < Math.floor((w - 16) / 5); i++) {
      ctx.fillStyle = bc[i % bc.length];
      ctx.fillRect(x - w / 2 + 9 + i * 5, y - h + 8 + (i % 2), 2.4, 7);
    }
    D.poly(ctx, [x - w / 2 - 8, y - h, x + w / 2 + 8, y - h, x + w / 2 - 2, y - h - 12, x - w / 2 + 2, y - h - 12], c, 0.9);
    D.rect(ctx, x - w / 2 + 6, y - h - 24, w - 12, 11, '#fff', 0.7, 2);
    D.text(ctx, o.label || 'QUIOSQUE', x, y - h - 18.5, D.fitSize(o.label || '', w - 16, 6), c);
    for (const sx of [x - w / 2 + 10, x - w / 2 + 24, x + w / 2 - 24, x + w / 2 - 10]) {
      D.line(ctx, sx, y, sx, y + 6, '#777', 0.8);
      D.ell(ctx, sx, y + 0.5, 3, 1, c, 0.4);
    }
  };

  P.tower = function (ctx, o) {
    const x = o.x, y = o.y;
    for (const lx of [-12, 12]) D.line(ctx, x + lx, y, x + lx * 0.7, y - 40, '#ddd', 2);
    for (let i = 1; i < 5; i++) D.line(ctx, x - 11 + i * 0, y - i * 8, x + 11, y - i * 8, '#bbb', 0.8);
    D.rect(ctx, x - 15, y - 58, 30, 18, '#e74c3c', 0.9, 1);
    D.rect(ctx, x - 11, y - 55, 22, 7, '#bfe6ff', 0.5);
    D.poly(ctx, [x - 18, y - 58, x + 18, y - 58, x + 12, y - 66, x - 12, y - 66], '#f5f5f5', 0.8);
    D.text(ctx, o.label || 'POSTO', x, y - 44, 4.4, '#fff');
    D.line(ctx, x + 10, y - 66, x + 10, y - 82, '#666', 0.8);
    D.poly(ctx, [x + 10, y - 82, x + 20, y - 79, x + 10, y - 76], o.flag || '#e74c3c', 0.4);
  };

  P.net = function (ctx, o) {
    const { x1, x2, y } = o;
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillRect(x1, y - 36, x2 - x1, 9);
    ctx.strokeStyle = 'rgba(40,30,20,.55)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (let x = x1; x <= x2; x += 3) { ctx.moveTo(x, y - 36); ctx.lineTo(x, y - 27); }
    for (let yy = y - 36; yy <= y - 27; yy += 3) { ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); }
    ctx.stroke();
    D.line(ctx, x1, y - 36, x2, y - 36, '#fff', 1.4);
    D.limb(ctx, [[x1, y], [x1, y - 40]], 1.5, '#888');
    D.limb(ctx, [[x2, y], [x2, y - 40]], 1.5, '#888');
  };

  /** Castelo de areia em forma de Congresso Nacional. */
  P.congress = function (ctx, o) {
    const x = o.x, y = o.y, sand = '#ecd187';
    D.ell(ctx, x, y - 3, 44, 7, '#e2c26a', 0.7);
    D.rect(ctx, x - 36, y - 13, 72, 9, sand, 0.7, 1);
    D.rect(ctx, x - 5.5, y - 48, 5, 35, sand, 0.7);
    D.rect(ctx, x + 0.5, y - 48, 5, 35, sand, 0.7);
    D.rect(ctx, x - 5.5, y - 34, 11, 2.5, sand, 0.5);
    ctx.beginPath();
    ctx.ellipse(x + 21, y - 20, 12, 7, 0, 0, Math.PI);
    ctx.closePath();
    D.fs(ctx, sand, 0.7);
    D.ell(ctx, x + 21, y - 20, 12, 1.6, '#d9bb67', 0.5);
    ctx.beginPath();
    ctx.ellipse(x - 21, y - 13, 9, 7, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    D.fs(ctx, sand, 0.7);
    D.line(ctx, x, y - 48, x, y - 57, '#555', 0.5);
    D.rect(ctx, x, y - 57, 7, 4.5, '#1fa04a', 0.3);
    D.poly(ctx, [x + 3.5, y - 56.5, x + 6.2, y - 54.75, x + 3.5, y - 53, x + 0.8, y - 54.75], '#ffdf2b', 0);
    D.sandBucket = null;
    P.sandBucket(ctx, { x: x + 40, y: y + 2, color: '#3498db' });
  };

  /** Pessoa enterrada na areia (só a cabeça para fora). */
  P.buried = function (ctx, o) {
    const x = o.x, y = o.y;
    ctx.beginPath();
    ctx.ellipse(x + 14, y - 3, 22, 6.5, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    D.fs(ctx, '#e9cd7c', 0.7);
    D.ell(ctx, x - 9, y - 5, 4.6, 5.2, o.skin || '#eebc94', 0.8);
    ctx.beginPath();
    ctx.ellipse(x - 9, y - 6.7, 5, 4, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    D.fs(ctx, '#3b2416', 0.6);
    D.rr(ctx, -0, 0, 0, 0, 0);
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 12.6, y - 6.2, 3, 1.6);
    ctx.fillRect(x - 8.6, y - 6.2, 3, 1.6);
    D.line(ctx, x - 10, y - 2.6, x - 7.6, y - 2.6, INK, 0.5);
  };

  P.bin = function (ctx, o) {
    D.line(ctx, o.x, o.y, o.x, o.y - 14, '#666', 1.2);
    D.rect(ctx, o.x - 4.5, o.y - 26, 9, 12, '#f39c12', 0.7, 2.5);
    ctx.fillStyle = '#c86b00';
    ctx.fillRect(o.x - 3, o.y - 24, 6, 1.4);
  };

  P.palm = function (ctx, o) {
    const x = o.x, y = o.y, lean = o.lean || 4;
    D.limb(ctx, [[x, y], [x + lean, y - 38], [x + lean * 0.3, y - 74]], 4.2, '#8d6e4a');
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 9; i++) {
      const yy = y - i * 8;
      ctx.beginPath();
      ctx.moveTo(x - 2 + (lean * i) / 12, yy);
      ctx.lineTo(x + 2 + (lean * i) / 12, yy);
      ctx.stroke();
    }
    const tx = x + lean * 0.3, ty = y - 74;
    const leaves = [[-30, 6], [-24, -10], [-10, -18], [10, -18], [24, -10], [30, 6], [-16, 14], [16, 14]];
    for (const [lx, ly] of leaves) {
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + lx * 0.5, ty + ly - 8, tx + lx, ty + ly);
      ctx.quadraticCurveTo(tx + lx * 0.55, ty + ly * 0.6 - 1, tx, ty);
      D.fs(ctx, '#2e9e4f', 0.6);
    }
    D.dot(ctx, tx - 2, ty + 3, 2, '#6b4a2b');
    D.dot(ctx, tx + 2, ty + 3.5, 2, '#5aa832');
  };

  P.lamp = function (ctx, o) {
    D.limb(ctx, [[o.x, o.y], [o.x, o.y - 70], [o.x + 8, o.y - 76]], 1.4, '#3d4b55');
    D.rect(ctx, o.x + 5, o.y - 78, 9, 3.5, '#3d4b55', 0.5, 1);
    D.ell(ctx, o.x + 9.5, o.y - 74.2, 3, 1, '#fff7c2', 0.3);
  };

  P.orelhao = function (ctx, o) {
    const x = o.x, y = o.y;
    D.line(ctx, x, y, x, y - 22, '#555', 1.2);
    ctx.beginPath();
    ctx.ellipse(x, y - 30, 8, 11, 0, Math.PI * 0.95, Math.PI * 2.05);
    ctx.closePath();
    D.fs(ctx, '#f39c12', 0.8);
    D.rect(ctx, x - 2.5, y - 34, 5, 8, '#2c3e50', 0.4, 0.6);
  };

  P.busStop = function (ctx, o) {
    const x = o.x, y = o.y;
    D.line(ctx, x - 22, y, x - 22, y - 34, '#555', 1.4);
    D.line(ctx, x + 22, y, x + 22, y - 34, '#555', 1.4);
    ctx.fillStyle = 'rgba(180,220,240,.45)';
    ctx.fillRect(x - 22, y - 32, 44, 22);
    D.rect(ctx, x - 26, y - 38, 52, 5, '#2c3e50', 0.7, 1);
    D.rect(ctx, x - 16, y - 12, 32, 3, '#8e6b4a', 0.5);
    D.line(ctx, x + 30, y, x + 30, y - 40, '#777', 1);
    D.ell(ctx, x + 30, y - 44, 5, 5, '#2980b9', 0.6);
    D.text(ctx, 'P', x + 30, y - 44, 6, '#fff');
  };

  P.newsstand = function (ctx, o) {
    const x = o.x, y = o.y, w = 50;
    D.rect(ctx, x - w / 2, y - 34, w, 34, '#2e7d4f', 0.9, 1);
    D.rect(ctx, x - w / 2 + 4, y - 30, w - 8, 18, '#f5f0e0', 0.5);
    const mags = ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#2ecc71', '#e67e22', '#ff6fa8'];
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = mags[i];
      ctx.fillRect(x - w / 2 + 6 + i * 5.6, y - 28 + (i % 2) * 7, 4.6, 6);
    }
    D.rect(ctx, x - w / 2 - 3, y - 42, w + 6, 9, '#1e5e3a', 0.7, 1);
    D.text(ctx, o.label || 'BANCA', x, y - 37.5, 5, '#fff');
    if (o.headline) {
      D.rect(ctx, x - w / 2 + 4, y - 11, w - 8, 8, '#fff', 0.5);
      D.text(ctx, o.headline, x, y - 7, D.fitSize(o.headline, w - 10, 4.4), '#c0392b');
    }
  };

  P.trafficLight = function (ctx, o) {
    D.line(ctx, o.x, o.y, o.x, o.y - 46, '#333', 1.4);
    D.rect(ctx, o.x - 3.5, o.y - 62, 7, 17, '#222', 0.6, 1.5);
    D.dot(ctx, o.x, o.y - 58, 1.8, '#e74c3c');
    D.dot(ctx, o.x, o.y - 53.5, 1.8, '#5a4a00');
    D.dot(ctx, o.x, o.y - 49, 1.8, '#0b4d1f');
  };

  P.signPost = function (ctx, o) {
    const w = o.w || 44;
    D.line(ctx, o.x, o.y, o.x, o.y - 30, '#7a5230', 1.6);
    D.rect(ctx, o.x - w / 2, o.y - 46, w, 16, o.bg || '#fff', 0.8, 1);
    const lines = String(o.text).split('\n');
    const longest = lines.reduce((a, b) => (a.length > b.length ? a : b));
    const size = D.fitSize(longest, w - 4, lines.length > 1 ? 5 : 6.5);
    lines.forEach((ln, i) => D.text(ctx, ln, o.x, o.y - 38 + (i - (lines.length - 1) / 2) * size * 1.15, size, o.color || '#c0392b'));
  };

  P.bike = function (ctx, o) {
    local(ctx, o, () => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 0.8;
      for (const wx of [-8, 8]) {
        ctx.beginPath();
        ctx.arc(wx, -5, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      D.line(ctx, -8, -5, -2, -13, o.color || '#e67e22', 1.3);
      D.line(ctx, -2, -13, 6, -13, o.color || '#e67e22', 1.3);
      D.line(ctx, 6, -13, 8, -5, o.color || '#e67e22', 1.3);
      D.line(ctx, -2, -13, 0, -5, o.color || '#e67e22', 1.3);
      D.line(ctx, -8, -5, 0, -5, o.color || '#e67e22', 1.3);
      D.line(ctx, 6, -13, 5, -17, '#333', 1);
      D.line(ctx, -3, -14, -3, -15.5, '#333', 1);
      D.rect(ctx, -5.5, -16.5, 5, 1.6, '#222', 0, 0.5);
    });
  };

  // ------------------------------------------------------------ veículos
  P.car = function (ctx, o) {
    local(ctx, o, (dir) => {
      const kind = o.kind || 'car';
      const c = { taxi: '#f7d117', police: '#f4f6f7' }[kind] || o.color || '#e74c3c';
      D.rect(ctx, -30, -22, 60, 15, c, 0.9, 4);
      D.poly(ctx, [-18, -22, -12, -33, 12, -33, 20, -22], c, 0.9);
      D.poly(ctx, [-15.5, -23, -11, -31, -1, -31, -1, -23], '#bfe6ff', 0.5);
      D.poly(ctx, [1, -23, 1, -31, 11, -31, 17, -23], '#bfe6ff', 0.5);
      if (o.driver) D.ell(ctx, 7, -26.5, 2.6, 3, o.driver, 0.4);
      if (kind === 'taxi') {
        ctx.fillStyle = '#1f5fbf';
        ctx.fillRect(-30, -15.5, 60, 2.6);
        D.rect(ctx, -6, -37.5, 12, 4.5, '#fff', 0.5, 1);
        D.mtext(ctx, dir, 'TÁXI', 0, -35.2, 3.4, '#1f5fbf');
      }
      if (kind === 'police') {
        ctx.fillStyle = '#1f4e8c';
        ctx.fillRect(-30, -16, 60, 3);
        D.mtext(ctx, dir, 'POLÍCIA', 0, -10.5, 4, '#1f4e8c');
        D.rect(ctx, -6, -36.5, 5.5, 3.5, '#e74c3c', 0.4, 1);
        D.rect(ctx, 0.5, -36.5, 5.5, 3.5, '#3498db', 0.4, 1);
      }
      D.ell(ctx, 29, -17, 1.6, 2, '#fff7a8', 0.4);
      D.ell(ctx, -29.5, -17, 1, 1.8, '#e74c3c', 0.4);
      for (const wx of [-18, 18]) {
        D.ell(ctx, wx, -6, 5.5, 5.5, '#222', 0.7);
        D.dot(ctx, wx, -6, 2.2, '#aaa');
      }
    });
  };

  P.van = function (ctx, o) {
    local(ctx, o, (dir) => {
      const c = o.color || '#1c1c1c';
      D.rect(ctx, -38, -40, 76, 33, c, 0.9, 4);
      D.poly(ctx, [24, -40, 34, -40, 38, -26, 24, -26], '#bfe6ff', 0.6);
      if (o.driver) D.ell(ctx, 30, -32, 2.6, 3, o.driver, 0.4);
      const lines = String(o.label || '').split('\n');
      lines.forEach((ln, i) => D.mtext(ctx, dir, ln, -7, -26 + (i - (lines.length - 1) / 2) * 7, D.fitSize(ln, 58, 6.4), o.labelColor || '#f1c40f'));
      if (o.siren) {
        D.rect(ctx, -8, -45, 7, 5, '#e74c3c', 0.5, 1);
        D.rect(ctx, 1, -45, 7, 5, '#3498db', 0.5, 1);
      }
      D.ell(ctx, 37, -14, 1.6, 2.2, '#fff7a8', 0.4);
      for (const wx of [-24, 24]) {
        D.ell(ctx, wx, -6, 6, 6, '#222', 0.7);
        D.dot(ctx, wx, -6, 2.4, '#aaa');
      }
    });
  };

  P.bus = function (ctx, o) {
    local(ctx, o, (dir) => {
      const c = o.color || '#2e86de';
      D.rect(ctx, -80, -50, 160, 42, c, 1, 5);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillRect(-80, -20, 160, 3);
      const skins = ['#f6d2b6', '#d9a073', '#8d5a36', '#eebc94', '#b97a4f', '#6b4226'];
      for (let i = 0; i < 9; i++) {
        const wx = -74 + i * 15.5;
        D.rect(ctx, wx, -44, 12, 14, '#bfe6ff', 0.5, 1);
        if ((i * 7 + (o.seed || 0)) % 3 !== 0) {
          D.ell(ctx, wx + 6, -36, 2.6, 3, skins[(i + (o.seed || 0)) % skins.length], 0.4);
          ctx.fillStyle = ['#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'][i % 4];
          ctx.fillRect(wx + 3, -32.5, 6, 2.5);
        }
      }
      D.rect(ctx, 66, -44, 12, 26, '#bfe6ff', 0.5, 1);
      D.rect(ctx, -60, -57, 120, 8, '#111', 0.6, 1);
      D.mtext(ctx, dir, o.label || '', 0, -53, D.fitSize(o.label || '', 116, 6), '#ffb300');
      D.ell(ctx, 79, -14, 1.6, 2.4, '#fff7a8', 0.4);
      for (const wx of [-52, 52]) {
        D.ell(ctx, wx, -7, 7, 7, '#222', 0.8);
        D.dot(ctx, wx, -7, 2.8, '#aaa');
      }
    });
  };

  // ------------------------------------------------------------ mar
  P.sailboat = function (ctx, o) {
    local(ctx, o, () => {
      D.line(ctx, 0, -8, 0, -62, '#6b4a2b', 1.4);
      D.poly(ctx, [1.5, -60, 1.5, -12, 26, -12], o.sail || '#fff', 0.8);
      D.poly(ctx, [-1.5, -54, -1.5, -14, -18, -14], o.sail2 || '#f1c40f', 0.8);
      D.poly(ctx, [-28, -10, 32, -10, 24, 2, -22, 2], o.color || '#c0392b', 0.9);
      ctx.strokeStyle = 'rgba(255,255,255,.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-30, 3);
      ctx.quadraticCurveTo(0, 7, 34, 3);
      ctx.stroke();
    });
  };

  P.speedboat = function (ctx, o) {
    local(ctx, o, (dir) => {
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-46 - i * 10, -2 + i * 2);
        ctx.lineTo(-70 - i * 14, -4 + i * 4);
        ctx.stroke();
      }
      D.poly(ctx, [-45, -16, 34, -16, 48, -10, 36, 0, -42, 0], '#fdfdfd', 0.9);
      ctx.fillStyle = o.color || '#e74c3c';
      ctx.fillRect(-44, -9, 82, 4);
      D.poly(ctx, [-6, -16, 6, -26, 14, -26, 12, -16], '#bfe6ff', 0.6);
      if (o.driver) D.ell(ctx, -2, -21, 3, 3.4, o.driver, 0.5);
      D.mtext(ctx, dir, o.label || '', -12, -12, D.fitSize(o.label || '', 60, 5), o.labelColor || '#1f2a44');
    });
  };

  P.jetski = function (ctx, o) {
    local(ctx, o, () => {
      D.poly(ctx, [-14, -7, 10, -7, 16, -2, 12, 1, -14, 1], o.color || '#f1c40f', 0.7);
      D.rect(ctx, -6, -11, 9, 4, '#333', 0.5, 1);
    });
  };

  P.duck = function (ctx, o) {
    const x = o.x, y = o.y, s = o.s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    D.ell(ctx, 0, -14, 40, 18, '#ffd21f', 1.2);
    D.ell(ctx, -26, -24, 9, 7, '#ffd21f', 1);
    D.ell(ctx, 22, -44, 15, 15, '#ffd21f', 1.2);
    D.poly(ctx, [34, -45, 50, -42, 34, -37], '#f39c12', 1);
    D.ell(ctx, 26, -49, 2.6, 2.6, '#fff', 0.6);
    D.dot(ctx, 27, -49, 1.3, INK);
    ctx.fillStyle = '#2b8fc4';
    ctx.fillRect(-50, -4, 100, 6);
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-44, -4);
    ctx.quadraticCurveTo(0, 2, 44, -4);
    ctx.stroke();
    ctx.restore();
  };

  P.ripple = function (ctx, o) {
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(o.x, o.y, o.r || 9, (o.r || 9) * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  // ------------------------------------------------------------ céu
  P.cloud = function (ctx, o) {
    const s = o.s || 1;
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.strokeStyle = 'rgba(120,160,190,.6)';
    ctx.lineWidth = 1;
    const parts = [[0, 0, 26], [-24, 6, 18], [24, 6, 20], [-8, 10, 20], [12, 12, 18]];
    ctx.beginPath();
    for (const [cx, cy, r] of parts) {
      ctx.moveTo(o.x + (cx + r) * s, o.y + cy * s);
      ctx.arc(o.x + cx * s, o.y + cy * s, r * s, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.fill();
  };

  P.sun = function (ctx, o) {
    ctx.strokeStyle = '#ffcf3f';
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(o.x + Math.cos(a) * 42, o.y + Math.sin(a) * 42);
      ctx.lineTo(o.x + Math.cos(a) * 56, o.y + Math.sin(a) * 56);
      ctx.stroke();
    }
    D.ell(ctx, o.x, o.y, 34, 34, '#ffd84a', 1.5);
    D.dot(ctx, o.x - 10, o.y - 4, 3, INK);
    D.dot(ctx, o.x + 10, o.y - 4, 3, INK);
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(o.x, o.y + 4, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillRect(o.x - 18, o.y - 9, 14, 7);
    ctx.fillRect(o.x + 4, o.y - 9, 14, 7);
    ctx.fillRect(o.x - 4, o.y - 7, 8, 2);
  };

  P.plane = function (ctx, o) {
    local(ctx, o, (dir) => {
      D.line(ctx, -30, 0, -60, 0, '#555', 0.6);
      const bw = o.bannerW || 150;
      D.rect(ctx, -60 - bw, -10, bw, 20, '#fff', 1, 2);
      D.mtext(ctx, dir, o.label || '', -60 - bw / 2, 0, D.fitSize(o.label || '', bw - 8, 13), o.labelColor || '#c0392b');
      D.ell(ctx, 0, 0, 30, 7, '#f4f6f7', 1);
      D.poly(ctx, [-26, -3, -34, -16, -28, -16, -18, -3], '#e74c3c', 0.8);
      D.poly(ctx, [-6, 2, 6, 2, -4, 18, -12, 18], '#d0d6da', 0.8);
      D.poly(ctx, [16, -4, 24, -4, 27, 0, 16, 0], '#bfe6ff', 0.6);
      D.ell(ctx, 31, 0, 1.5, 9, 'rgba(80,80,80,.4)', 0);
    });
  };

  P.heli = function (ctx, o) {
    local(ctx, o, (dir) => {
      D.line(ctx, -32, -16, 32, -16, '#333', 1.4);
      D.line(ctx, 0, -16, 0, -11, '#333', 1.6);
      D.limb(ctx, [[-10, -4], [-38, -6]], 3, o.color || '#2c3e50');
      D.poly(ctx, [-40, -12, -34, -12, -36, -2, -42, -2], o.color || '#2c3e50', 0.6);
      D.ell(ctx, 0, -3, 16, 9, o.color || '#2c3e50', 1);
      D.ell(ctx, 7, -5, 8, 5, '#bfe6ff', 0.6);
      D.mtext(ctx, dir, o.label || '', -6, -1, 5, '#fff');
      D.line(ctx, -10, 7, 12, 7, '#333', 1.2);
    });
  };

  // ------------------------------------------------------------ prédios
  P.building = function (ctx, o) {
    const x = o.x, w = o.w, b = o.base, h = o.h, top = b - h;
    D.rect(ctx, x, top, w, h, o.color, 1.1, 0);
    ctx.fillStyle = 'rgba(0,0,0,.07)';
    ctx.fillRect(x + w - 7, top, 7, h - 30);
    const ww = 8, wh = 9, gx = (w - 12) / o.cols;
    let k = 0;
    for (let r = 0; r < o.rows; r++) {
      const wy = top + 10 + r * 16;
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(x + 3, wy + 11, w - 6, 1.4);
      for (let c = 0; c < o.cols; c++) {
        const wx = x + 6 + c * gx + (gx - ww) / 2;
        const code = o.win[k++];
        ctx.fillStyle = code === 1 ? '#ffe9a8' : code === 2 ? '#24323f' : '#9fd3ef';
        ctx.fillRect(wx, wy, ww, wh);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 0.4;
        ctx.strokeRect(wx, wy, ww, wh);
        if (code === 3) {
          D.ell(ctx, wx + 4, wy + 4, 1.8, 2, o.skins[k % o.skins.length], 0.3);
          ctx.fillStyle = o.shirts[k % o.shirts.length];
          ctx.fillRect(wx + 2, wy + 6.2, 4, 2.8);
        } else if (code === 4) {
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(wx + 1, wy + 10, 2.5, 3.5);
          ctx.fillStyle = '#3498db';
          ctx.fillRect(wx + 4.5, wy + 10, 2.5, 3);
        } else if (code === 5) {
          ctx.fillStyle = '#1fa04a';
          ctx.fillRect(wx + 0.5, wy + 10, 7, 5);
          ctx.fillStyle = '#ffdf2b';
          ctx.beginPath();
          ctx.moveTo(wx + 4, wy + 10.5);
          ctx.lineTo(wx + 7, wy + 12.5);
          ctx.lineTo(wx + 4, wy + 14.5);
          ctx.lineTo(wx + 1, wy + 12.5);
          ctx.fill();
        }
      }
    }
    // térreo / loja
    const sf = b - 30;
    D.rect(ctx, x + 2, sf, w - 4, 30, '#5b4636', 0.6);
    ctx.fillStyle = '#8fc7e0';
    ctx.fillRect(x + 6, sf + 9, w - 12, 19);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    for (let i = x + 6; i < x + w - 8; i += 18) ctx.fillRect(i, sf + 9, 1, 19);
    const stripeW = 6;
    for (let i = 0, sx = x + 2; sx < x + w - 2; sx += stripeW, i++) {
      ctx.fillStyle = i % 2 ? '#fff' : o.awning;
      ctx.beginPath();
      ctx.moveTo(sx, sf);
      ctx.lineTo(Math.min(sx + stripeW, x + w - 2), sf);
      ctx.lineTo(Math.min(sx + stripeW, x + w - 2) + 1.5, sf + 8);
      ctx.lineTo(sx + 1.5, sf + 8);
      ctx.fill();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.6;
    ctx.strokeRect(x + 2, sf, w - 4, 8);
    D.rect(ctx, x + 8, sf - 11, w - 16, 9, '#fff', 0.6, 1);
    D.text(ctx, o.shop, x + w / 2, sf - 6.5, D.fitSize(o.shop, w - 20, 6), '#333');
    // telhado
    if (o.roof === 'tank') {
      D.rect(ctx, x + w * 0.2, top - 13, 18, 13, '#2f6fdf', 0.7, 2);
      D.rect(ctx, x + w * 0.2 - 1, top - 15, 20, 3, '#2559b5', 0.5, 1);
    } else if (o.roof === 'antenna') {
      D.line(ctx, x + w * 0.7, top, x + w * 0.7, top - 24, INK, 0.9);
      D.line(ctx, x + w * 0.7 - 6, top - 18, x + w * 0.7 + 6, top - 18, INK, 0.8);
      D.line(ctx, x + w * 0.7 - 4, top - 12, x + w * 0.7 + 4, top - 12, INK, 0.8);
    } else if (o.roof === 'pool') {
      D.rect(ctx, x + 10, top - 6, w - 20, 6, '#3ec1e8', 0.6, 1);
      D.ell(ctx, x + 20, top - 7, 1.8, 2, '#d9a073', 0.3);
      D.ell(ctx, x + 32, top - 7, 1.8, 2, '#f6d2b6', 0.3);
    }
    if (o.sign) {
      const s = o.sign, bw = w + 16, bx = x - 8, by = top - (o.roof === 'tank' ? 44 : 34);
      D.line(ctx, x + 12, top, x + 12, by + 26, '#555', 1.2);
      D.line(ctx, x + w - 12, top, x + w - 12, by + 26, '#555', 1.2);
      D.rect(ctx, bx, by, bw, 26, s.bg || '#c0392b', 1, 2);
      const lines = String(s.text).split('\n');
      const longest = lines.reduce((a, c) => (a.length > c.length ? a : c));
      const size = D.fitSize(longest, bw - 8, lines.length > 1 ? 10 : 13);
      lines.forEach((ln, i) => D.text(ctx, ln, bx + bw / 2, by + 13 + (i - (lines.length - 1) / 2) * size * 1.1, size, s.color || '#fff'));
    }
  };
})();
