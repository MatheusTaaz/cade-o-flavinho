/* Geradores de multidão e vinhetas cômicas/satíricas para povoar a cena
   sem sobrepor exageradamente nem deixar buracos vazios. */
(function () {
  const CF = (window.CF = window.CF || {});
  const People = CF.People;
  const F = CF.Factories;
  const P = CF.Props;

  /** Verifica se (x,y) respeita distância mínima para pontos existentes e zonas reservadas. */
  function canPlace(pts, reserved, x, y, minDist) {
    for (const r of reserved) {
      if (x >= r.x - r.r && x <= r.x + r.r && y >= r.y - r.r && y <= r.y + r.r) return false;
    }
    const d2 = minDist * minDist;
    for (let i = pts.length - 1; i >= 0; i--) {
      const dx = pts[i].x - x;
      const dy = (pts[i].y - y) * 1.35;
      if (dx * dx + dy * dy < d2) return false;
    }
    return true;
  }

  /** Popula a água com banhistas, boias e surfistas. */
  function populateSwimmers(rng, items, pts, reserved, cfg) {
    const z = cfg.zones;
    const count = cfg.counts.swimmers || 75;
    for (let i = 0; i < count; i++) {
      const x = rng.range(50, cfg.width - 50);
      const y = rng.range(z.seaTop + 32, z.sandTop - 10);
      if (!canPlace(pts, reserved, x, y, 22)) continue;
      pts.push({ x, y });
      items.push({
        id: 'ripple_' + i,
        kind: 'ripple',
        clickable: false,
        x,
        y: y - 20,
        bbox: { x: x - 12, y: y - 24, w: 24, h: 8 },
        draw: (ctx) => P.ripple(ctx, { x, y: y - 21, r: 9 }),
      });
      items.push(People.randomPerson(rng, x, y, 'water'));
    }
  }

  /** Popula guarda-sóis, toalhas, cadeiras e grupos de banhistas na areia. */
  function populateBeachClusters(rng, items, pts, reserved, cfg) {
    const z = cfg.zones;
    const umbrellaColors = [
      ['#e74c3c', '#ffffff'],
      ['#2980b9', '#f1c40f'],
      ['#27ae60', '#ffffff'],
      ['#8e44ad', '#f39c12'],
      ['#e67e22', '#ffffff'],
      ['#16a085', '#f1c40f'],
      ['#c0392b', '#f1c40f'],
    ];

    const uCount = cfg.counts.umbrellas || 48;
    for (let i = 0; i < uCount; i++) {
      const x = rng.range(65, cfg.width - 65);
      const y = rng.range(z.sandTop + 42, z.promenadeTop - 28);
      if (!canPlace(pts, reserved, x, y, 56)) continue;
      pts.push({ x, y });

      const [c1, c2] = rng.pick(umbrellaColors);
      // toalha embaixo
      if (rng.chance(0.8)) {
        const tx = x + rng.range(-18, 18);
        const ty = y + rng.range(2, 10);
        items.push(F.towel({
          x: tx,
          y: ty,
          w: 28,
          h: 13,
          rot: rng.range(-0.22, 0.22),
          c1,
          c2,
        }));
        if (rng.chance(0.55)) {
          items.push(People.randomPerson(rng, tx, ty + 2, 'sand', {
            pose: 'lie',
            arms: 'down',
            step: 0,
          }));
        }
      }

      // cadeira de praia ao lado
      if (rng.chance(0.65)) {
        const dir = rng.chance(0.5) ? 1 : -1;
        const cx = x + dir * 16;
        const cy = y + 3;
        items.push(F.chair({ x: cx, y: cy, dir, color: c1 }));
        if (rng.chance(0.75)) {
          items.push(People.randomPerson(rng, cx + dir * 2, cy + 1, 'sand', {
            pose: 'sit',
            dir,
            arms: rng.pick(['hold', 'phone', 'down']),
          }));
        }
      }

      if (rng.chance(0.4)) {
        items.push(F.cooler({ x: x + rng.range(-20, 20), y: y + rng.range(4, 10), color: c1 }));
      }

      items.push(F.umbrella({ x, y, c1, c2, r: rng.range(20, 24) }));
    }
  }

  /** Popula multidão caminhando/conversando na areia e no calçadão. */
  function populateCrowd(rng, items, pts, reserved, cfg) {
    const z = cfg.zones;

    // Pessoas na areia
    const sandPeople = cfg.counts.sandPeople || 230;
    for (let i = 0; i < sandPeople; i++) {
      const x = rng.range(36, cfg.width - 36);
      const y = rng.range(z.sandTop + 18, z.promenadeTop - 8);
      if (!canPlace(pts, reserved, x, y, 19)) continue;
      pts.push({ x, y });
      items.push(People.randomPerson(rng, x, y, 'sand'));
    }

    // Pessoas no calçadão
    const promPeople = cfg.counts.promenadePeople || 135;
    for (let i = 0; i < promPeople; i++) {
      const x = rng.range(36, cfg.width - 36);
      const y = rng.range(z.promenadeTop + 10, z.roadTop - 6);
      if (!canPlace(pts, reserved, x, y, 18)) continue;
      pts.push({ x, y });
      items.push(People.randomPerson(rng, x, y, 'promenade'));
    }

    // Pessoas extras no calçadão e na areia (nunca atrás/em cima dos prédios da base)
    const cityPeople = cfg.counts.cityPeople || 60;
    for (let i = 0; i < cityPeople; i++) {
      const x = rng.range(45, cfg.width - 45);
      const onPromenade = i % 2 === 0;
      const y = onPromenade
        ? rng.range(z.promenadeTop + 12, z.roadTop - 8)
        : rng.range(z.sandTop + 35, z.promenadeTop - 14);
      if (!canPlace(pts, reserved, x, y, 19)) continue;
      pts.push({ x, y });
      items.push(People.randomPerson(rng, x, y, onPromenade ? 'promenade' : 'sand'));
    }
  }

  CF.Crowds = {
    canPlace,
    populateSwimmers,
    populateBeachClusters,
    populateCrowd,
  };
})();
