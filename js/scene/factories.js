/* Fábricas que empacotam objetos de CF.Props e CF.Characters em itens de cena
   com bounding box (bbox), hitBox e mensagem de clique. */
(function () {
  const CF = (window.CF = window.CF || {});
  const P = CF.Props;
  const C = CF.Characters;

  function item(cfg) {
    return {
      id: cfg.id || cfg.kind || 'prop',
      kind: cfg.kind || 'prop',
      tag: cfg.tag || cfg.kind || 'prop',
      message: cfg.message || null,
      isTarget: false,
      x: cfg.x,
      y: cfg.y + (cfg.zBias || 0),
      bbox: cfg.bbox,
      hitBox: cfg.hitBox || cfg.bbox,
      clickable: cfg.clickable !== false,
      data: cfg.data || cfg,
      draw: cfg.draw,
    };
  }

  const F = (CF.Factories = {
    umbrella(o) {
      const s = o.s || 1, r = (o.r || 22) * s;
      return item({
        kind: 'umbrella',
        tag: 'umbrella',
        message: o.message,
        x: o.x,
        y: o.y,
        zBias: 2,
        bbox: { x: o.x - r - 2, y: o.y - 50 * s, w: r * 2 + 4, h: 52 * s },
        hitBox: { x: o.x - r, y: o.y - 48 * s, w: r * 2, h: 24 * s },
        draw: (ctx) => P.umbrella(ctx, o),
      });
    },

    towel(o) {
      return item({
        kind: 'towel',
        x: o.x,
        y: o.y,
        zBias: -25,
        clickable: false,
        bbox: { x: o.x - o.w, y: o.y - o.h, w: o.w * 2, h: o.h * 2 },
        draw: (ctx) => P.towel(ctx, o),
      });
    },

    chair(o) {
      return item({
        kind: 'chair',
        tag: 'beach',
        x: o.x,
        y: o.y,
        zBias: -1,
        clickable: false,
        bbox: { x: o.x - 12, y: o.y - 30, w: 24, h: 32 },
        draw: (ctx) => P.chair(ctx, o),
      });
    },

    cooler(o) {
      return item({
        kind: 'cooler',
        tag: 'cooler',
        message: o.message || '❌ Nessa caixa térmica só tem cerveja quente e gelo derretido.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 9, y: o.y - 14, w: 18, h: 15 },
        draw: (ctx) => P.cooler(ctx, o),
      });
    },

    cart(o) {
      return item({
        kind: 'cart',
        tag: 'cart',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 30, y: o.y - 36, w: 60, h: 38 },
        draw: (ctx) => P.cart(ctx, o),
      });
    },

    kiosk(o) {
      const w = o.w || 70;
      return item({
        kind: 'kiosk',
        tag: 'kiosk',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - w / 2 - 10, y: o.y - 56, w: w + 20, h: 64 },
        hitBox: { x: o.x - w / 2, y: o.y - 54, w, h: 54 },
        draw: (ctx) => P.kiosk(ctx, o),
      });
    },

    tower(o) {
      return item({
        kind: 'tower',
        tag: 'tower',
        message: o.message || '❌ Posto Salva-Vidas. O bombeiro disse que não salva político enrolado.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 22, y: o.y - 84, w: 44, h: 86 },
        draw: (ctx) => P.tower(ctx, o),
      });
    },

    net(o) {
      return item({
        kind: 'net',
        tag: 'net',
        clickable: false,
        x: (o.x1 + o.x2) / 2,
        y: o.y,
        bbox: { x: o.x1 - 4, y: o.y - 42, w: o.x2 - o.x1 + 8, h: 44 },
        draw: (ctx) => P.net(ctx, o),
      });
    },

    congress(o) {
      return item({
        kind: 'congress',
        tag: 'congress',
        message: o.message || '❌ Castelo de areia do Congresso! Cuidado que na primeira onda desmorona.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 46, y: o.y - 58, w: 94, h: 62 },
        draw: (ctx) => P.congress(ctx, o),
      });
    },

    buried(o) {
      return item({
        kind: 'buried',
        tag: 'buried',
        message: o.message || '❌ Esse aí se enterrou na areia pra fugir dos boletos, mas não é o Flavinho.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 16, y: o.y - 12, w: 54, h: 16 },
        draw: (ctx) => P.buried(ctx, o),
      });
    },

    palm(o) {
      return item({
        kind: 'palm',
        tag: 'palm',
        clickable: false,
        x: o.x,
        y: o.y,
        zBias: 4,
        bbox: { x: o.x - 34, y: o.y - 96, w: 68, h: 98 },
        draw: (ctx) => P.palm(ctx, o),
      });
    },

    orelhao(o) {
      return item({
        kind: 'orelhao',
        tag: 'orelhao',
        message: o.message || '❌ Orelhão tocando! Alguém perguntando se o sigilo de 100 anos já caiu.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 10, y: o.y - 42, w: 20, h: 44 },
        draw: (ctx) => P.orelhao(ctx, o),
      });
    },

    busStop(o) {
      return item({
        kind: 'busStop',
        tag: 'busStop',
        message: o.message || '❌ Ponto de ônibus lotado. Ninguém aqui tem foro privilegiado.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 28, y: o.y - 50, w: 66, h: 52 },
        draw: (ctx) => P.busStop(ctx, o),
      });
    },

    newsstand(o) {
      return item({
        kind: 'newsstand',
        tag: 'newsstand',
        message: o.message || '❌ Banca de jornal: manchete do dia é "CADÊ O FLAVINHO?".',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 30, y: o.y - 44, w: 60, h: 46 },
        draw: (ctx) => P.newsstand(ctx, o),
      });
    },

    signPost(o) {
      const w = o.w || 44;
      return item({
        kind: 'signPost',
        tag: 'sign',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - w / 2 - 2, y: o.y - 48, w: w + 4, h: 50 },
        draw: (ctx) => P.signPost(ctx, o),
      });
    },

    car(o) {
      return item({
        kind: 'car',
        tag: o.kind || 'car',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 32, y: o.y - 38, w: 64, h: 40 },
        draw: (ctx) => P.car(ctx, o),
      });
    },

    van(o) {
      return item({
        kind: 'van',
        tag: 'van',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 40, y: o.y - 46, w: 80, h: 48 },
        draw: (ctx) => P.van(ctx, o),
      });
    },

    bus(o) {
      return item({
        kind: 'bus',
        tag: 'bus',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 82, y: o.y - 58, w: 164, h: 60 },
        draw: (ctx) => P.bus(ctx, o),
      });
    },

    sailboat(o) {
      const s = o.s || 1;
      return item({
        kind: 'sailboat',
        tag: 'boat',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 32 * s, y: o.y - 64 * s, w: 66 * s, h: 70 * s },
        draw: (ctx) => P.sailboat(ctx, o),
      });
    },

    speedboat(o) {
      const s = o.s || 1;
      return item({
        kind: 'speedboat',
        tag: 'boat',
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 75 * s, y: o.y - 28 * s, w: 125 * s, h: 32 * s },
        hitBox: { x: o.x - 45 * s, y: o.y - 28 * s, w: 92 * s, h: 30 * s },
        draw: (ctx) => P.speedboat(ctx, o),
      });
    },

    jetski(o) {
      return item({
        kind: 'jetski',
        tag: 'boat',
        message: o.message || '❌ Jet-ski passeando na orla. Mas não é o nosso senador!',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 18, y: o.y - 16, w: 36, h: 20 },
        draw: (ctx) => P.jetski(ctx, o),
      });
    },

    duck(o) {
      const s = o.s || 1;
      return item({
        kind: 'duck',
        tag: 'duck',
        message: o.message || '❌ Quack! É o pato inflável gigante, mas o Flavinho não está dentro dele.',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 48 * s, y: o.y - 62 * s, w: 100 * s, h: 66 * s },
        draw: (ctx) => P.duck(ctx, o),
      });
    },

    plane(o) {
      const bw = o.bannerW || 150;
      return item({
        kind: 'plane',
        tag: 'plane',
        message: o.message || '❌ Aviãozinho de faixa sobrevoando a praia: "VENDE-SE MANSÃO COM JUROS CAMARADAS!"',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 65 - bw, y: o.y - 20, w: bw + 100, h: 40 },
        draw: (ctx) => P.plane(ctx, o),
      });
    },

    heli(o) {
      return item({
        kind: 'heli',
        tag: 'heli',
        message: o.message || '❌ Helicóptero da imprensa procurando furo de reportagem lá de cima!',
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 44, y: o.y - 20, w: 88, h: 30 },
        draw: (ctx) => P.heli(ctx, o),
      });
    },

    building(o) {
      return item({
        kind: 'building',
        tag: 'building',
        message: o.message,
        x: o.x + o.w / 2,
        y: o.base,
        zBias: -200,
        bbox: { x: o.x - 10, y: o.base - o.h - 48, w: o.w + 20, h: o.h + 50 },
        hitBox: { x: o.x, y: o.base - 42, w: o.w, h: 42 },
        draw: (ctx) => P.building(ctx, o),
      });
    },

    animal(o) {
      const drawMap = {
        dog: C.drawDog,
        capybara: C.drawCapybara,
        seagull: C.drawSeagull,
        pigeon: C.drawPigeon,
        crab: C.drawCrab,
      };
      const fn = drawMap[o.animal] || C.drawDog;
      return item({
        kind: o.animal,
        tag: o.animal,
        message: o.message,
        x: o.x,
        y: o.y,
        bbox: { x: o.x - 16, y: o.y - 18, w: 32, h: 20 },
        draw: (ctx) => fn(ctx, o),
      });
    },
  });
})();
