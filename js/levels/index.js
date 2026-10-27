/* Registro central de fases do jogo.
   Para adicionar uma nova fase (ex.: level2.js), basta incluí-la no index.html
   e adicioná-la ao array CF.LEVELS abaixo. */
(function () {
  const CF = (window.CF = window.CF || {});
  CF.LEVELS = [CF.LEVEL_1];
})();
