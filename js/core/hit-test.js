/* Detecção precisa de clique na cena (hit-test):
   1. Verifica primeiro se o clique acertou a hitBox do Flavinho (com tolerância justa).
   2. Se não, procura do item mais à frente para o mais ao fundo para exibir
      feedback humorístico contextualizado. */
(function () {
  const CF = (window.CF = window.CF || {});

  function inBox(x, y, box, pad) {
    if (!box) return false;
    const p = pad || 0;
    return (
      x >= box.x - p &&
      x <= box.x + box.w + p &&
      y >= box.y - p &&
      y <= box.y + box.h + p
    );
  }

  function testHit(scene, wx, wy) {
    if (!scene) return { hit: false, target: false, item: null };

    // 1. Verifica o alvo principal (Flavinho)
    const target = scene.target;
    if (target && inBox(wx, wy, target.hitBox, 3)) {
      return { hit: true, target: true, npc: false, item: target };
    }

    // 2. Verifica os NPCs especiais (Easter Eggs interativos)
    const npcs = scene.npcs || [];
    for (let i = npcs.length - 1; i >= 0; i--) {
      const npc = npcs[i];
      if (inBox(wx, wy, npc.hitBox, 4)) {
        return { hit: true, target: false, npc: true, item: npc };
      }
    }

    // 3. Percorre os demais elementos de frente para trás
    const items = scene.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.isTarget || it.isNPC || it.clickable === false) continue;
      if (inBox(wx, wy, it.hitBox, 2)) {
        return { hit: true, target: false, npc: false, item: it };
      }
    }

    return { hit: false, target: false, npc: false, item: null };
  }

  CF.HitTest = {
    testHit,
    inBox,
  };
})();
