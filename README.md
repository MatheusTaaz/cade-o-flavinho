# 🔎 Cadê o Flavinho? 🇧🇷🇺🇸

> Jogo web satírico inspirado em *Onde Está Wally?*

<p align="center">
  <a href="https://MatheusTaaz.github.io/cade-o-flavinho/">
    <strong>🎮 JOGAR AGORA →</strong>
  </a>
</p>

<p align="center">
  <img src="assets/images/chrome.png" width="45" alt="Google Chrome">
  &nbsp;&nbsp;&nbsp;
  <img src="assets/images/edge.png" width="45" alt="Microsoft Edge">
</p>

<p align="center">
  <strong>⚠️ Compatível atualmente com Google Chrome e Microsoft Edge</strong>
</p>

## 🎮 Features

- 5 rodadas com geração procedural de cenas
- Sistema de pontuação, erros, tempo e combo
- 5 NPCs Easter Egg
- Detecção de colisão/clique
- Música de fundo e efeitos sonoros
- Música exclusiva de vitória
- Sistema de mute/unmute
- Resultado final com geração de card em PNG
- Web Share API para compartilhamento
- Layout responsivo
- Sem backend ou banco de dados

## 🛠️ Stack

- HTML5
- CSS3
- JavaScript ES6+
- Canvas API
- Web Audio / HTML Audio API
- Web Share API

## 📁 Estrutura

```text
├── assets/
│   └── audio/
├── css/
│   └── style.css
├── js/
│   ├── core/
│   ├── data/
│   ├── dev/
│   ├── levels/
│   ├── render/
│   ├── scene/
│   └── ui/
├── index.html
└── README.md
```

A aplicação é modularizada por responsabilidade, separando lógica de jogo, renderização, construção de cenas, dados e interface.

## 🚀 Executar localmente

Clone o repositório:

```bash
git clone https://github.com/MatheusTaaz/cade-o-flavinho.git
cd cade-o-flavinho
```

Execute com qualquer servidor HTTP local:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

Também pode ser hospedado diretamente pelo **GitHub Pages**, já que o projeto é completamente estático.

## 📜 Licença

Sem licença de código aberto definida atualmente.

## 👨‍💻 Créditos

**Desenvolvido por Matheus Taaz © 2026**

Menção honrosa: **Claudinha** 🤖

---

<p align="center">
  🇧🇷 Feito no Brasil · 2026
</p>
