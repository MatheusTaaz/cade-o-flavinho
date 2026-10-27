/* Construtor declarativo da cena com suporte a Rodadas Infinitas:
   - Usa seed nova por rodada para gerar configurações inéditas.
   - Embaralha personagens especiais, barcos, veículos e elementos móveis dentro
     de suas zonas válidas (mantendo a coerência visual).
   - Posiciona o Flavinho usando Spawn Zones válidas e esconderijos embaralháveis,
     garantindo que nunca fique fora da tela, nunca repita a posição anterior e
     nunca fique bloqueado por sobreposição.
   - Aplica dificuldade progressiva gradual a cada rodada. */
(function () {
  const CF = (window.CF = window.CF || {});
  const F = CF.Factories;
  const People = CF.People;
  const Crowds = CF.Crowds;
  const P = CF.Props;

  function shuffleArray(rng, arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /** Escolhe uma posição válida nas zonas para um personagem/animal embaralhado,
      considerando o tamanho completo do personagem e nunca invadindo a faixa de prédios. */
  function pickZoneCoords(rng, zoneName, z, W, pts, reserved, fallbackX, fallbackY, minDist) {
    let xMin = 110, xMax = W - 110, yMin = z.sandTop + 62, yMax = z.promenadeTop - 16;
    if (zoneName === 'promenade') {
      yMin = z.promenadeTop + 16;
      yMax = z.roadTop - 12;
    } else if (zoneName === 'shore') {
      yMin = z.sandTop + 14;
      yMax = z.sandTop + 48;
    } else if (zoneName === 'sandCenter') {
      xMin = 680;
      xMax = 1720;
      yMin = z.sandTop + 140;
      yMax = z.promenadeTop - 90;
    }

    for (let attempt = 0; attempt < 35; attempt++) {
      const cx = Math.round(rng.range(xMin, xMax));
      const cy = Math.round(rng.range(yMin, yMax));
      if (Crowds.canPlace(pts, reserved, cx, cy, minDist || 28)) {
        return { x: cx, y: cy };
      }
    }
    return {
      x: Math.max(xMin, Math.min(xMax, fallbackX)),
      y: Math.max(yMin, Math.min(yMax, fallbackY)),
    };
  }

  /** Seleciona uma posição válida e inédita para o Flavinho respeitando Spawn Zones e estruturas,
      garantindo que o corpo inteiro do personagem fique 100% visível e longe dos prédios. */
  function pickFlavinhoSpot(rng, level, reserved, opts) {
    const spots = level.hidingSpots || [{ x: 1320, y: 720 }];
    const round = Math.max(1, opts.round || 1);
    const lastPos = opts.lastTargetPos || null;
    const minSafeY = level.zones.sandTop + 64;
    const maxSafeY = level.zones.roadTop - 14;

    // Escala levemente menor a cada rodada, com piso seguro de 0.80 para continuar clicável
    const roundScaleFactor = Math.max(0.80, 1 - (round - 1) * 0.016);

    // Se um índice fixo foi solicitado (ex.: autoteste ?spot=0), usa o esconderijo pedido
    if (opts.spotIndex != null) {
      const idx = ((opts.spotIndex % spots.length) + spots.length) % spots.length;
      const base = spots[idx];
      return {
        spot: Object.assign({}, base, {
          x: Math.max(150, Math.min(level.width - 150, base.x)),
          y: Math.max(minSafeY, Math.min(maxSafeY, base.y)),
          s: (base.s || 0.98) * roundScaleFactor,
        }),
        spotIndex: idx,
      };
    }

    const umbrellaPalettes = [
      ['#e67e22', '#ffffff'],
      ['#2980b9', '#f1c40f'],
      ['#27ae60', '#ffffff'],
      ['#c0392b', '#f1c40f'],
      ['#8e44ad', '#f39c12'],
      ['#16a085', '#ffffff'],
    ];

    // Monta lista de candidatos combinando esconderijos embaralhados (com leve variação válida)
    // e novos pontos gerados dentro das Spawn Zones habilitadas para a rodada
    const candidates = [];

    const shuffledIndices = shuffleArray(rng, spots.map((_, i) => i));
    for (const idx of shuffledIndices) {
      const s = spots[idx];
      const jx = round > 1 ? Math.round(rng.range(-48, 48)) : 0;
      const jy = round > 1 ? Math.round(rng.range(-14, 14)) : 0;
      const cx = Math.max(150, Math.min(level.width - 150, s.x + jx));
      const cy = Math.max(minSafeY, Math.min(maxSafeY, s.y + jy));
      candidates.push({
        spot: Object.assign({}, s, {
          x: cx,
          y: cy,
          dir: rng.chance(0.5) ? 1 : -1,
          s: (s.s || 0.98) * roundScaleFactor,
        }),
        spotIndex: idx,
      });
    }

    // Gera candidatos extras nas Spawn Zones válidas (sempre longe dos prédios)
    const zones = (level.flavinhoSpawnZones || []).filter((fz) => (fz.minRound || 1) <= round);
    for (let i = 0; i < 18 && zones.length > 0; i++) {
      const z = rng.pick(zones);
      const cx = Math.max(150, Math.min(level.width - 150, Math.round(rng.range(z.xMin, z.xMax))));
      const cy = Math.max(minSafeY, Math.min(maxSafeY, Math.round(rng.range(z.yMin, z.yMax))));
      const hasUmb = rng.chance(z.umbrellaChance || 0);
      const [c1, c2] = rng.pick(umbrellaPalettes);
      const arms = rng.pick(['down', 'down', 'phone', 'hold']);
      const prop = arms === 'phone' ? { type: 'phone' } : arms === 'hold' ? { type: 'coconut' } : null;
      candidates.push({
        spot: {
          name: z.name,
          x: cx,
          y: cy,
          dir: rng.chance(0.5) ? 1 : -1,
          s: 0.97 * roundScaleFactor,
          arms,
          prop,
          coverUmbrella: hasUmb ? { dx: rng.chance(0.5) ? -26 : 26, dy: -6, c1, c2 } : null,
        },
        spotIndex: -1,
      });
    }

    // Filtra candidatos que não colidem com estruturas reservadas e que ficam longe da posição anterior
    for (const minDistFromLast of [380, 220, 80, 0]) {
      for (const cand of candidates) {
        const { x, y } = cand.spot;
        // Evita centro morto da tela (muito fácil)
        if (Math.abs(x - level.width / 2) < 95 && Math.abs(y - level.height / 2) < 75) continue;
        // Verifica distância das estruturas fixas considerando o topo e a base do personagem
        if (!Crowds.canPlace([], reserved, x, y, 42)) continue;
        if (!Crowds.canPlace([], reserved, x, y - 28, 36)) continue;
        // Verifica distância da rodada anterior
        if (lastPos) {
          const d = Math.hypot(x - lastPos.x, y - lastPos.y);
          if (d < minDistFromLast) continue;
        }
        return cand;
      }
    }

    return candidates[0];
  }

  function buildScene(level, opts) {
    opts = opts || {};
    const round = Math.max(1, opts.round || 1);
    const seed = opts.seed != null ? opts.seed : (level.seed || 20261027) + (round - 1) * 7919;
    const rng = CF.createRng(seed);
    const items = [];
    const pts = [];
    const reserved = [];

    // Dificuldade progressiva gradual por rodada
    const crowdMult = Math.min(1.65, 1 + (round - 1) * 0.07);
    const extraDecoys = Math.min(26, (round - 1) * 2);
    const scaledLevel = Object.assign({}, level, {
      counts: {
        swimmers: Math.round((level.counts.swimmers || 75) * crowdMult),
        umbrellas: Math.round((level.counts.umbrellas || 50) * Math.min(1.4, 1 + (round - 1) * 0.045)),
        sandPeople: Math.round((level.counts.sandPeople || 240) * crowdMult),
        promenadePeople: Math.round((level.counts.promenadePeople || 135) * crowdMult),
        cityPeople: Math.round((level.counts.cityPeople || 60) * crowdMult),
        decoys: (level.counts.decoys || 14) + extraDecoys,
      },
    });

    // 1. Elementos de céu (sol, nuvens, aviões e helicóptero com posições horizontais variadas)
    if (level.sky) {
      if (level.sky.sun) {
        const s = level.sky.sun;
        items.push({
          id: 'sun',
          kind: 'sun',
          tag: 'sun',
          message: s.message || '❌ Sol de 40 graus no Rio! Até a sombra tá suando.',
          x: s.x,
          y: s.y,
          bbox: { x: s.x - 45, y: s.y - 45, w: 90, h: 90 },
          draw: (ctx) => P.sun(ctx, s),
        });
      }
      for (const cl of level.sky.clouds || []) {
        const cx = round === 1 ? cl.x : Math.round(rng.range(120, level.width - 180));
        const clObj = Object.assign({}, cl, { x: cx });
        items.push({
          id: 'cloud',
          kind: 'cloud',
          clickable: false,
          x: clObj.x,
          y: clObj.y,
          bbox: { x: clObj.x - 50, y: clObj.y - 25, w: 100, h: 50 },
          draw: (ctx) => P.cloud(ctx, clObj),
        });
      }
      for (const pl of level.sky.planes || []) {
        const px = round === 1 ? pl.x : Math.round(rng.range(420, level.width - 280));
        items.push(F.plane(Object.assign({}, pl, { x: px })));
      }
      for (const hl of level.sky.helis || []) {
        const hx = round === 1 ? hl.x : Math.round(rng.range(320, level.width - 320));
        items.push(F.heli(Object.assign({}, hl, { x: hx })));
      }
    }

    // 2. Embarcações no mar (embaralha os slots horizontais a partir da rodada 2)
    if (level.boats && level.boats.length) {
      const boatSlotsX = round === 1
        ? level.boats.map((b) => b.x)
        : shuffleArray(rng, level.boats.map((b) => Math.max(160, Math.min(level.width - 160, b.x + rng.int(-70, 70)))));
      level.boats.forEach((b, i) => {
        const boat = Object.assign({}, b, {
          x: boatSlotsX[i],
          y: round === 1 ? b.y : Math.round(rng.range(level.zones.seaTop + 65, level.zones.sandTop - 75)),
        });
        reserved.push({ x: boat.x, y: boat.y, r: 42 });
        if (boat.type === 'speedboat') items.push(F.speedboat(boat));
        else if (boat.type === 'jetski') items.push(F.jetski(boat));
        else if (boat.type === 'duck') items.push(F.duck(boat));
        else items.push(F.sailboat(boat));
      });
    }

    // 3. Prédios na orla (janelas povoadas dinamicamente a cada seed)
    if (level.buildings) {
      const skins = People.SKINS;
      const shirts = People.COLORS;
      for (const b of level.buildings) {
        const rows = Math.floor((b.h - 46) / 16);
        const cols = b.cols || Math.max(3, Math.floor((b.w - 14) / 16));
        const win = [];
        for (let i = 0; i < rows * cols; i++) {
          const r = rng.next();
          win.push(r < 0.16 ? 3 : r < 0.22 ? 4 : r < 0.27 ? 5 : r < 0.52 ? 1 : r < 0.72 ? 2 : 0);
        }
        items.push(F.building(Object.assign({}, b, { rows, cols, win, skins, shirts })));
      }
    }

    // 4. Estruturas fixas e móveis (carrinhos de ambulante mudam de lugar na areia a cada rodada)
    for (const st of level.structures || []) {
      let stCopy = st;
      if (round > 1 && st.shuffleZone) {
        const pos = pickZoneCoords(rng, st.shuffleZone, level.zones, level.width, pts, reserved, st.x, st.y, 65);
        stCopy = Object.assign({}, st, { x: pos.x, y: pos.y, dir: rng.chance(0.5) ? 1 : -1 });
      }
      const rx = stCopy.x || (stCopy.x1 + stCopy.x2) / 2;
      reserved.push({ x: rx, y: stCopy.y, r: stCopy.reserveR || 36 });
      if (F[stCopy.type]) items.push(F[stCopy.type](stCopy));
    }

    // 5. Veículos na avenida (embaralha posições nas faixas de mão e contramão)
    if (level.vehicles && level.vehicles.length) {
      const lane1 = level.vehicles.filter((v) => v.dir > 0);
      const lane2 = level.vehicles.filter((v) => v.dir < 0);
      const xs1 = round === 1 ? lane1.map((v) => v.x) : shuffleArray(rng, lane1.map((v) => v.x));
      const xs2 = round === 1 ? lane2.map((v) => v.x) : shuffleArray(rng, lane2.map((v) => v.x));
      let i1 = 0, i2 = 0;
      for (const v of level.vehicles) {
        const vx = v.dir > 0 ? xs1[i1++] : xs2[i2++];
        const vCopy = Object.assign({}, v, { x: vx, seed: rng.int(1, 20) });
        reserved.push({ x: vCopy.x, y: vCopy.y, r: vCopy.type === 'bus' ? 75 : 36 });
        if (vCopy.type === 'bus') items.push(F.bus(vCopy));
        else if (vCopy.type === 'van') items.push(F.van(vCopy));
        else items.push(F.car(vCopy));
      }
    }

    // 6. Coqueiros no calçadão
    for (const pm of level.palms || []) items.push(F.palm(pm));

    // 7. Escolhe a posição válida do Flavinho ANTES de espalhar as pessoas para reservar seu espaço de clique!
    const picked = pickFlavinhoSpot(rng, level, reserved, opts);
    const chosenSpot = picked.spot;
    const spotIdx = picked.spotIndex;

    // Reserva a área imediatamente ao redor e à frente do Flavinho para nunca ficar obstruído
    reserved.push({ x: chosenSpot.x, y: chosenSpot.y - 6, r: 24 });
    reserved.push({ x: chosenSpot.x, y: chosenSpot.y + 12, r: 22 });
    pts.push({ x: chosenSpot.x, y: chosenSpot.y });

    // 7.5. NPCs Especiais (Easter Eggs interativos: prioriza NPCs ainda não encontrados na partida)
    const spawnedNPCs = [];
    const allSpecialNPCs = CF.SPECIAL_NPCS || [];
    if (allSpecialNPCs.length > 0) {
      const lastNpcIds = opts.lastNpcIds || [];
      const foundNpcIds = opts.foundNpcIds || [];
      let chosenNPCDefs;
      if (opts.spawnAllNPCs) {
        chosenNPCDefs = allSpecialNPCs.slice();
      } else {
        const unfoundFresh = allSpecialNPCs.filter((n) => !foundNpcIds.includes(n.id) && !lastNpcIds.includes(n.id));
        const unfoundAny = allSpecialNPCs.filter((n) => !foundNpcIds.includes(n.id));
        const freshAny = allSpecialNPCs.filter((n) => !lastNpcIds.includes(n.id));

        const orderedPool = [];
        const addUnique = (list) => {
          for (const item of shuffleArray(rng, list)) {
            if (!orderedPool.some((x) => x.id === item.id)) orderedPool.push(item);
          }
        };
        addUnique(unfoundFresh);
        addUnique(unfoundAny);
        addUnique(freshAny);
        addUnique(allSpecialNPCs);

        const count = Math.min(2, orderedPool.length);
        chosenNPCDefs = orderedPool.slice(0, count);
      }

      for (const npcDef of chosenNPCDefs) {
        const prefZone = rng.pick(npcDef.preferredZones || ['promenade', 'sand']);
        const fallbackX = Math.round(rng.range(240, level.width - 240));
        const fallbackY = prefZone === 'promenade' ? 990 : 680;
        const pos = pickZoneCoords(rng, prefZone, level.zones, level.width, pts, reserved, fallbackX, fallbackY, 44);
        const nx = Math.max(150, Math.min(level.width - 150, pos.x));
        const ny = Math.max(level.zones.sandTop + 64, Math.min(level.zones.roadTop - 14, pos.y));
        const ndir = rng.chance(0.5) ? 1 : -1;

        reserved.push({ x: nx, y: ny, r: 28 });
        reserved.push({ x: nx, y: ny - 22, r: 24 });
        reserved.push({ x: nx, y: ny + 12, r: 22 });
        pts.push({ x: nx, y: ny });

        const npcItem = People.createSpecialNPCItem(npcDef, nx, ny, ndir, 1.02);
        items.push(npcItem);
        spawnedNPCs.push(npcItem);
      }
    }

    // 8. Personagens especiais (embaralhados em suas respectivas zonas a partir da rodada 2)
    for (const sp of level.specialPeople || []) {
      let sx = sp.x, sy = sp.y, sdir = sp.dir;
      if (round > 1 && sp.zone && sp.zone !== 'fixed') {
        const pos = pickZoneCoords(rng, sp.zone, level.zones, level.width, pts, reserved, sp.x, sp.y, 28);
        sx = pos.x;
        sy = pos.y;
        sdir = rng.chance(0.5) ? 1 : -1;
      }
      pts.push({ x: sx, y: sy });
      items.push(People.rolePerson(rng, sp.role, sx, sy, Object.assign({}, sp, { x: sx, y: sy, dir: sdir })));
    }

    // Iscas de terno (decoys) espalhadas em posições válidas da areia e do calçadão (sempre acima dos prédios)
    const decoyCount = scaledLevel.counts.decoys;
    for (let i = 0; i < decoyCount; i++) {
      const dx = rng.range(120, level.width - 120);
      const dy = rng.range(level.zones.sandTop + 62, level.zones.roadTop - 12);
      if (!Crowds.canPlace(pts, reserved, dx, dy, 38)) continue;
      pts.push({ x: dx, y: dy });
      items.push(People.rolePerson(rng, 'decoy', dx, dy));
    }

    // 9. Animais (embaralhados em suas zonas válidas a cada rodada)
    for (const an of level.animals || []) {
      let ax = an.x, ay = an.y, adir = an.dir;
      if (round > 1 && an.zone) {
        const pos = pickZoneCoords(rng, an.zone, level.zones, level.width, pts, reserved, an.x, an.y, 24);
        ax = pos.x;
        ay = pos.y;
        adir = rng.chance(0.5) ? 1 : -1;
      }
      pts.push({ x: ax, y: ay });
      items.push(F.animal(Object.assign({}, an, { x: ax, y: ay, dir: adir })));
    }

    // 10. Multidão procedural (banhistas no mar, guarda-sóis + grupos na areia, pedestres)
    Crowds.populateSwimmers(rng, items, pts, reserved, scaledLevel);
    Crowds.populateBeachClusters(rng, items, pts, reserved, scaledLevel);
    Crowds.populateCrowd(rng, items, pts, reserved, scaledLevel);

    // 11. Insere o Flavinho e eventual guarda-sol lateral (atrás dele, nunca cobrindo sua hitBox)
    if (chosenSpot.coverUmbrella) {
      const dx = chosenSpot.coverUmbrella.dx || -26;
      const safeDx = Math.abs(dx) < 24 ? (dx < 0 ? -26 : 26) : dx;
      const umb = F.umbrella({
        x: chosenSpot.x + safeDx,
        y: chosenSpot.y - 6,
        c1: chosenSpot.coverUmbrella.c1 || '#e74c3c',
        c2: chosenSpot.coverUmbrella.c2 || '#f1c40f',
        r: 20,
      });
      umb.y = chosenSpot.y - 8; // Garante que o guarda-sol seja desenhado atrás do Flavinho
      items.push(umb);
    }

    const flavinhoItem = People.createFlavinhoItem(chosenSpot);
    items.push(flavinhoItem);

    // Ordenação por camadas + profundidade (painter's algorithm):
    // Prédios são sempre renderizados abaixo de todos os personagens/NPCs/Flavinho,
    // e Flavinho/NPCs têm prioridade visual sobre objetos próximos na mesma faixa.
    function getSortY(it) {
      if (it.kind === 'building') return -1000;
      if (it.isTarget || it.isNpc) return it.y + 8;
      return it.y;
    }
    items.sort((a, b) => getSortY(a) - getSortY(b));

    return {
      width: level.width,
      height: level.height,
      zones: level.zones,
      round,
      seed,
      items,
      target: flavinhoItem,
      npcs: spawnedNPCs,
      npcIds: spawnedNPCs.map((n) => n.npcData.id),
      spot: chosenSpot,
      spotIndex: spotIdx,
      drawBackground: (ctx) => CF.Backgrounds.drawBeachCityBackground(ctx, level),
    };
  }

  CF.SceneBuilder = {
    buildScene,
  };
})();
