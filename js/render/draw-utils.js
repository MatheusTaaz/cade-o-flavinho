/* Primitivas de desenho em estilo cartoon (preenchimento + contorno escuro). */
(function () {
  const CF = (window.CF = window.CF || {});
  const INK = '#2b1d14';

  const D = (CF.Draw = {
    INK,

    rr(ctx, x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect && r) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    },

    /** Preenche o path atual e contorna com tinta. lw=0 desativa contorno. */
    fs(ctx, fill, lw) {
      ctx.fillStyle = fill;
      ctx.fill();
      if (lw !== 0) {
        ctx.lineWidth = lw == null ? 0.8 : lw;
        ctx.strokeStyle = INK;
        ctx.stroke();
      }
    },

    ell(ctx, x, y, rx, ry, fill, lw) {
      ctx.beginPath();
      ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
      D.fs(ctx, fill, lw);
    },

    rect(ctx, x, y, w, h, fill, lw, r) {
      D.rr(ctx, x, y, w, h, r || 0);
      D.fs(ctx, fill, lw);
    },

    /** pts = [x0,y0,x1,y1,...] */
    poly(ctx, pts, fill, lw) {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.closePath();
      D.fs(ctx, fill, lw);
    },

    /** Membro (braço/perna) com contorno: polyline [[x,y],...]. */
    limb(ctx, pts, w, color) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.strokeStyle = INK;
      ctx.lineWidth = w + 1.4;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.stroke();
    },

    line(ctx, x1, y1, x2, y2, color, w) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color || INK;
      ctx.lineWidth = w || 0.8;
      ctx.lineCap = 'round';
      ctx.stroke();
    },

    dot(ctx, x, y, r, color) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color || INK;
      ctx.fill();
    },

    text(ctx, str, x, y, size, color, opts) {
      opts = opts || {};
      ctx.font = `${opts.weight || 'bold'} ${size}px ${opts.family || 'Arial, Helvetica, sans-serif'}`;
      ctx.textAlign = opts.align || 'center';
      ctx.textBaseline = opts.baseline || 'middle';
      if (opts.stroke) {
        ctx.lineWidth = opts.strokeW || size * 0.22;
        ctx.strokeStyle = opts.stroke;
        ctx.lineJoin = 'round';
        ctx.strokeText(str, x, y);
      }
      ctx.fillStyle = color;
      ctx.fillText(str, x, y);
    },

    /** Texto que não fica espelhado quando o contexto está com scale(-1,1). */
    mtext(ctx, dir, str, x, y, size, color, opts) {
      ctx.save();
      ctx.scale(dir, 1);
      D.text(ctx, str, x * dir, y, size, color, opts);
      ctx.restore();
    },

    /** Tamanho de fonte que cabe numa largura. */
    fitSize(str, width, max) {
      return Math.min(max, width / Math.max(1, str.length * 0.62));
    },
  });
})();
