/* Gerador pseudoaleatório com seed (mulberry32).
   Mesma seed => mesma cena. Útil para fases reprodutíveis. */
(function () {
  const CF = (window.CF = window.CF || {});

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  CF.createRng = function (seed) {
    const r = mulberry32(seed >>> 0);
    return {
      next: r,
      range: (a, b) => a + r() * (b - a),
      int: (a, b) => Math.floor(a + r() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      chance: (p) => r() < p,
    };
  };
})();
