/* Câmera 2D com suporte a pan (arrastar), zoom por roda do mouse,
   pinça multi-touch no celular, botões de zoom e foco animado num ponto. */
(function () {
  const CF = (window.CF = window.CF || {});

  function createCamera(canvas, opts) {
    opts = opts || {};
    const cam = {
      x: 0,
      y: 0,
      scale: 1,
      minScale: 0.35,
      maxScale: 4.2,
      worldW: 2400,
      worldH: 1350,
      isDragging: false,
      anim: null,
    };

    const pointers = new Map();
    let dragStart = null;
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchCenter = null;
    let movedDuringPointer = false;

    function viewSize() {
      return {
        w: canvas.clientWidth || window.innerWidth,
        h: canvas.clientHeight || window.innerHeight,
      };
    }

    function clamp() {
      const { w, h } = viewSize();
      // Calcula o minScale dinâmico para cobrir ou caber confortavelmente na tela
      const fitW = w / cam.worldW;
      const fitH = h / cam.worldH;
      cam.minScale = Math.min(fitW, fitH) * 0.95;
      if (cam.scale < cam.minScale) cam.scale = cam.minScale;
      if (cam.scale > cam.maxScale) cam.scale = cam.maxScale;

      const scaledW = cam.worldW * cam.scale;
      const scaledH = cam.worldH * cam.scale;

      if (scaledW <= w) {
        cam.x = (w - scaledW) / 2;
      } else {
        const minX = w - scaledW;
        cam.x = Math.min(0, Math.max(minX, cam.x));
      }

      if (scaledH <= h) {
        cam.y = (h - scaledH) / 2;
      } else {
        const minY = h - scaledH;
        cam.y = Math.min(0, Math.max(minY, cam.y));
      }
    }

    function fitToScreen(coverMobile) {
      cam.anim = null;
      const { w, h } = viewSize();
      const fitW = w / cam.worldW;
      const fitH = h / cam.worldH;
      // No celular em pé, preenche toda a altura útil do palco sem deformar a proporção
      const isPortrait = h > w;
      cam.scale = (coverMobile && isPortrait) ? fitH : Math.max(fitW, fitH * 0.92);
      cam.x = (w - cam.worldW * cam.scale) / 2;
      cam.y = (h - cam.worldH * cam.scale) / 2;
      clamp();
      if (opts.onChange) opts.onChange();
    }

    function zoomAt(factor, screenX, screenY) {
      const { w, h } = viewSize();
      const sx = screenX != null ? screenX : w / 2;
      const sy = screenY != null ? screenY : h / 2;
      const prevScale = cam.scale;
      const nextScale = Math.max(cam.minScale, Math.min(cam.maxScale, prevScale * factor));
      if (Math.abs(nextScale - prevScale) < 1e-4) return;

      const wx = (sx - cam.x) / prevScale;
      const wy = (sy - cam.y) / prevScale;
      cam.scale = nextScale;
      cam.x = sx - wx * nextScale;
      cam.y = sy - wy * nextScale;
      clamp();
      if (opts.onChange) opts.onChange();
    }

    function screenToWorld(sx, sy) {
      return {
        x: (sx - cam.x) / cam.scale,
        y: (sy - cam.y) / cam.scale,
      };
    }

    function worldToScreen(wx, wy) {
      return {
        x: wx * cam.scale + cam.x,
        y: wy * cam.scale + cam.y,
      };
    }

    function focusOn(wx, wy, targetScale, durationMs) {
      const { w, h } = viewSize();
      const endScale = Math.min(cam.maxScale, Math.max(cam.minScale, targetScale || 2.4));
      const endX = w / 2 - wx * endScale;
      const endY = h / 2 - wy * endScale;
      cam.anim = {
        startX: cam.x,
        startY: cam.y,
        startScale: cam.scale,
        endX,
        endY,
        endScale,
        startTime: performance.now(),
        duration: durationMs || 550,
      };
    }

    function update(now) {
      if (!cam.anim) return false;
      const a = cam.anim;
      const t = Math.min(1, (now - a.startTime) / a.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      cam.scale = a.startScale + (a.endScale - a.startScale) * ease;
      cam.x = a.startX + (a.endX - a.startX) * ease;
      cam.y = a.startY + (a.endY - a.startY) * ease;
      clamp();
      if (t >= 1) cam.anim = null;
      return true;
    }

    // Eventos de ponteiro (mouse + toque + pinça)
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      canvas.setPointerCapture(e.pointerId);
      const pt = getCanvasCoords(e);
      pointers.set(e.pointerId, pt);

      if (pointers.size === 1) {
        dragStart = { x: pt.x, y: pt.y, camX: cam.x, camY: cam.y };
        movedDuringPointer = false;
      } else if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
        pinchStartScale = cam.scale;
        pinchCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        movedDuringPointer = true;
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const pt = getCanvasCoords(e);
      pointers.set(e.pointerId, pt);

      if (pointers.size === 1 && dragStart) {
        const dx = pt.x - dragStart.x;
        const dy = pt.y - dragStart.y;
        if (Math.hypot(dx, dy) > 6) {
          movedDuringPointer = true;
          cam.isDragging = true;
        }
        if (movedDuringPointer) {
          cam.x = dragStart.camX + dx;
          cam.y = dragStart.camY + dy;
          clamp();
          if (opts.onChange) opts.onChange();
        }
      } else if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
        const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        const factor = (pinchStartScale * (dist / pinchStartDist)) / cam.scale;
        zoomAt(factor, center.x, center.y);
        pinchCenter = center;
      }
    });

    function onPointerEnd(e) {
      if (!pointers.has(e.pointerId)) return;
      const pt = getCanvasCoords(e);
      pointers.delete(e.pointerId);

      if (pointers.size === 0) {
        const wasClick = !movedDuringPointer;
        cam.isDragging = false;
        dragStart = null;
        if (opts.onChange) opts.onChange();
        if (wasClick && opts.onTap) {
          opts.onTap(pt.x, pt.y);
        }
      } else if (pointers.size === 1) {
        const remaining = Array.from(pointers.values())[0];
        dragStart = { x: remaining.x, y: remaining.y, camX: cam.x, camY: cam.y };
      }
    }

    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const pt = getCanvasCoords(e);
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomAt(factor, pt.x, pt.y);
    }, { passive: false });

    window.addEventListener('resize', () => {
      clamp();
      if (opts.onChange) opts.onChange();
    });

    return {
      get x() { return cam.x; },
      set x(v) { cam.x = v; clamp(); },
      get y() { return cam.y; },
      set y(v) { cam.y = v; clamp(); },
      get scale() { return cam.scale; },
      set scale(v) { cam.scale = v; clamp(); },
      get isDragging() { return cam.isDragging; },
      setWorldSize(w, h) {
        cam.worldW = w;
        cam.worldH = h;
        clamp();
      },
      fitToScreen,
      zoomAt,
      screenToWorld,
      worldToScreen,
      focusOn,
      update,
      clamp,
    };
  }

  CF.Camera = {
    createCamera,
  };
})();
