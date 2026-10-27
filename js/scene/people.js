/* Gerador procedural de cidadãos, banhistas, vendedores, policiais, jornalistas e iscas (decoys).
   Usa CF.Characters.drawPerson e CF.Characters.drawFlavinho. */
(function () {
  const CF = (window.CF = window.CF || {});
  const C = CF.Characters;

  const SKINS = ['#f6d2b6', '#eebc94', '#d9a073', '#c68652', '#9c643b', '#6b4226'];
  const HAIRS = ['#1e1612', '#3b2818', '#5c3c20', '#8c5828', '#d4a448', '#a83820', '#7a7a7a'];
  const COLORS = [
    '#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6',
    '#e67e22', '#1abc9c', '#ff6fa8', '#2980b9', '#27ae60',
    '#c0392b', '#f39c12', '#ecf0f1', '#34495e'
  ];
  const HAIR_STYLES = ['short', 'short', 'long', 'curly', 'afro', 'ponytail', 'bun', 'bald', 'buzz'];
  const ARMS_IDLE = ['down', 'down', 'wave', 'hips', 'cross', 'phone'];

  function bboxForPerson(p, pad) {
    const s = p.s || 1;
    const pr = pad || 0;
    if (p.pose === 'lie') {
      return { x: p.x - 26 * s - pr, y: p.y - 12 * s - pr, w: 52 * s + pr * 2, h: 16 * s + pr * 2 };
    }
    if (p.pose === 'swim') {
      return { x: p.x - 10 * s - pr, y: p.y - 47 * s - pr, w: 20 * s + pr * 2, h: 24 * s + pr * 2 };
    }
    return { x: p.x - 10 * s - pr, y: p.y - 48 * s - pr, w: 20 * s + pr * 2, h: 50 * s + pr * 2 };
  }

  function makePersonItem(p, opts) {
    opts = opts || {};
    const bbox = bboxForPerson(p, opts.pad || 0);
    return {
      id: opts.id || 'person',
      kind: opts.kind || 'person',
      tag: opts.tag || null,
      message: opts.message || null,
      isTarget: !!opts.isTarget,
      x: p.x,
      y: p.y + (opts.zBias || 0),
      bbox,
      hitBox: opts.hitBox || bboxForPerson(p, opts.hitPad || 2),
      data: p,
      draw(ctx) {
        if (opts.isTarget) C.drawFlavinho(ctx, p);
        else C.drawPerson(ctx, p);
      },
    };
  }

  /** Cria uma pessoa aleatória de acordo com a zona ('water', 'sand', 'promenade', 'city'). */
  function randomPerson(rng, x, y, zone, overrides) {
    const p = {
      x,
      y,
      s: overrides && overrides.s ? overrides.s : 0.94 + (y / 1400) * 0.16,
      dir: rng.chance(0.5) ? 1 : -1,
      skin: rng.pick(SKINS),
      hair: rng.pick(HAIRS),
      hairStyle: rng.pick(HAIR_STYLES),
      top: rng.pick(COLORS),
      top2: rng.pick(COLORS),
      bottom: rng.pick(COLORS),
      arms: rng.pick(ARMS_IDLE),
      step: rng.chance(0.45) ? rng.range(-1, 1) : 0,
      glasses: rng.chance(0.22) ? (rng.chance(0.8) ? '#111' : '#e74c3c') : false,
      beard: rng.chance(0.14),
      mustache: rng.chance(0.12),
      burn: zone === 'sand' && rng.chance(0.18),
      mood: rng.pick(['smile', 'smile', 'o', 'flat']),
      w: rng.range(0.92, 1.18),
    };

    if (zone === 'water') {
      p.pose = 'swim';
      p.clipY = -22;
      p.topStyle = rng.chance(0.5) ? 'none' : 'bikini';
      p.bottomStyle = 'trunks';
      p.arms = rng.pick(['up', 'wave', 'down']);
      if (rng.chance(0.25)) p.prop = { type: 'ring', color: rng.pick(['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3']) };
    } else if (zone === 'sand') {
      const r = rng.next();
      if (r < 0.55) {
        p.topStyle = rng.pick(['none', 'bikini', 'tank']);
        p.bottomStyle = p.topStyle === 'bikini' ? 'bikini' : rng.pick(['trunks', 'shorts']);
      } else if (r < 0.82) {
        p.topStyle = rng.pick(['tshirt', 'stripes', 'cbf']);
        if (p.topStyle === 'cbf') p.top = '#ffdf2b';
        p.bottomStyle = 'shorts';
      } else {
        p.topStyle = 'tshirt';
        p.bottomStyle = rng.pick(['shorts', 'skirt']);
      }
      if (rng.chance(0.25)) {
        p.hat = rng.pick(['cap', 'straw', 'bucket']);
        p.hatColor = rng.pick(COLORS);
      }
      if (rng.chance(0.22)) {
        const pt = rng.pick(['coconut', 'icecream', 'phone', 'selfie', 'ball', 'bucket', 'surf']);
        p.prop = { type: pt, color: rng.pick(COLORS) };
        if (pt === 'phone') p.arms = 'phone';
        if (pt === 'coconut' || pt === 'icecream') p.arms = 'hold';
      }
    } else {
      // calçadão / rua
      p.topStyle = rng.pick(['tshirt', 'stripes', 'cbf', 'tank']);
      if (p.topStyle === 'cbf') p.top = '#ffdf2b';
      p.bottomStyle = rng.pick(['shorts', 'pants', 'skirt']);
      p.shoes = rng.pick(['#222', '#fff', '#c0392b', '#2980b9']);
      if (rng.chance(0.22)) {
        p.hat = rng.pick(['cap', 'straw', 'headband']);
        p.hatColor = rng.pick(COLORS);
      }
      if (rng.chance(0.24)) {
        const pt = rng.pick(['phone', 'bag', 'coconut', 'selfie', 'newspaper', 'flag']);
        p.prop = { type: pt, color: rng.pick(COLORS), text: 'EXTRA!' };
        if (pt === 'phone') p.arms = 'phone';
        if (pt === 'newspaper') p.arms = 'read';
      }
    }

    if (overrides) Object.assign(p, overrides);
    return makePersonItem(p, overrides && overrides.itemOpts);
  }

  /** Cria personagens temáticos específicos (policial, vendedor, jornalista, manifestante, isca de terno). */
  function rolePerson(rng, role, x, y, extra) {
    extra = extra || {};
    const base = { x, y, dir: extra.dir || (rng.chance(0.5) ? 1 : -1) };

    if (role === 'police') {
      return randomPerson(rng, x, y, 'promenade', Object.assign(base, {
        topStyle: 'uniform',
        top: '#2f3640',
        bottomStyle: 'pants',
        bottom: '#1e272e',
        shoes: '#111',
        hat: 'police',
        hatColor: '#2f3640',
        glasses: '#111',
        arms: 'cross',
        label: 'PM',
        itemOpts: { tag: 'police', message: extra.message },
      }, extra));
    }

    if (role === 'pf') {
      return randomPerson(rng, x, y, 'promenade', Object.assign(base, {
        topStyle: 'uniform',
        top: '#191919',
        bottomStyle: 'pants',
        bottom: '#2c3e50',
        shoes: '#111',
        hat: 'cap',
        hatColor: '#111',
        hatLabel: 'PF',
        hatLabelColor: '#f1c40f',
        glasses: '#111',
        arms: extra.arms || 'down',
        label: 'PF',
        labelColor: '#f1c40f',
        prop: extra.prop || { type: 'binoculars' },
        itemOpts: { tag: 'pf', message: extra.message },
      }, extra));
    }

    if (role === 'vendor') {
      const vType = extra.vendorType || rng.pick(['mate', 'biscoito', 'board', 'grill', 'tray', 'balloons']);
      return randomPerson(rng, x, y, 'sand', Object.assign(base, {
        topStyle: 'tshirt',
        top: '#f39c12',
        bottomStyle: 'shorts',
        bottom: '#2980b9',
        hat: 'cap',
        hatColor: '#e67e22',
        arms: 'hold',
        prop: { type: vType },
        itemOpts: { tag: 'vendor', message: extra.message },
      }, extra));
    }

    if (role === 'reporter') {
      return randomPerson(rng, x, y, 'promenade', Object.assign(base, {
        topStyle: 'tshirt',
        top: '#e84118',
        bottomStyle: 'pants',
        bottom: '#2f3640',
        shoes: '#222',
        arms: 'hold',
        prop: { type: 'mic', color: '#f1c40f' },
        itemOpts: { tag: 'reporter', message: extra.message },
      }, extra));
    }

    if (role === 'cameraman') {
      return randomPerson(rng, x, y, 'promenade', Object.assign(base, {
        topStyle: 'tshirt',
        top: '#353b48',
        bottomStyle: 'shorts',
        bottom: '#718093',
        hat: 'cap',
        hatColor: '#2f3640',
        arms: 'camera',
        prop: { type: 'tvcam', label: 'AO VIVO' },
        itemOpts: { tag: 'reporter', message: extra.message },
      }, extra));
    }

    if (role === 'protester') {
      return randomPerson(rng, x, y, 'promenade', Object.assign(base, {
        topStyle: rng.chance(0.6) ? 'cbf' : 'tshirt',
        top: '#ffdf2b',
        bottomStyle: 'shorts',
        bottom: '#1f5fbf',
        arms: 'sign',
        prop: {
          type: 'sign',
          text: extra.signText || 'CADÊ O\nQUEIROZ?',
          bg: extra.signBg || '#fff',
          color: extra.signColor || '#c0392b',
          w: extra.signW || 32,
        },
        itemOpts: { tag: 'protester', message: extra.message },
      }, extra));
    }

    if (role === 'decoy') {
      // Isca parecida (terno na praia/calçadão), mas sem os traços exatos do Flavinho
      const ties = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];
      return randomPerson(rng, x, y, 'sand', Object.assign(base, {
        skin: rng.pick(['#f6d2b6', '#eebc94', '#d9a073']),
        hair: rng.pick(['#1e1612', '#5c3c20', '#7a7a7a']),
        hairStyle: rng.pick(['short', 'bald', 'curly']),
        topStyle: 'suit',
        top: rng.pick(['#1f2433', '#2c3e50', '#3d3d3d']),
        bottomStyle: 'pants',
        bottom: '#1f2433',
        tie: rng.pick(ties),
        shoes: '#111',
        glasses: rng.chance(0.5) ? '#111' : false,
        beard: rng.chance(0.45),
        prop: rng.chance(0.5) ? { type: 'briefcase' } : { type: 'phone' },
        arms: 'down',
        itemOpts: {
          tag: 'decoy',
          message: extra.message || '❌ Terno na praia é suspeito, mas esse aí é só advogado de porta de delegacia!',
        },
      }, extra));
    }

    return randomPerson(rng, x, y, 'sand', extra);
  }

  /** Cria o item clicável do Flavinho em um esconderijo. */
  function createFlavinhoItem(spot) {
    const p = Object.assign({}, C.FLAVINHO_LOOK, {
      x: spot.x,
      y: spot.y,
      s: spot.s || 0.98,
      dir: spot.dir || 1,
      pose: spot.pose || 'stand',
      arms: spot.arms || 'down',
      prop: spot.prop || null,
      clipY: spot.clipY != null ? spot.clipY : null,
      look: 'up',
    });
    return makePersonItem(p, {
      id: 'flavinho',
      kind: 'flavinho',
      tag: 'flavinho',
      isTarget: true,
      hitPad: 6, // margem justa para facilitar clique sem ser trivial
      zBias: spot.zBias || 0,
    });
  }

  /** Cria um NPC especial (Easter Egg interativo) integrado à cena. */
  function createSpecialNPCItem(npcDef, x, y, dir, s) {
    const p = Object.assign({}, npcDef.look, {
      x,
      y,
      s: s || 1.04,
      dir: dir || 1,
    });
    const bbox = bboxForPerson(p, 2);
    return {
      id: 'npc_' + npcDef.id,
      kind: 'npc',
      tag: 'npc',
      isTarget: false,
      isNPC: true,
      npcData: npcDef,
      x: p.x,
      y: p.y,
      bbox,
      hitBox: bboxForPerson(p, 6),
      data: p,
      draw(ctx) {
        C.drawSpecialNPC(ctx, p);
      },
    };
  }

  CF.People = {
    SKINS,
    HAIRS,
    COLORS,
    randomPerson,
    rolePerson,
    createFlavinhoItem,
    createSpecialNPCItem,
    makePersonItem,
  };
})();
