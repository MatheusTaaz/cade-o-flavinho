/* Centralização de todos os textos, feedbacks satíricos e mensagens de UI.
   Altere aqui para modificar as frases do jogo sem mexer na lógica. */
(function () {
  const CF = (window.CF = window.CF || {});

  CF.TEXTS = {
    ui: {
      tagline: 'Ele sumiu no meio da muvuca brasileira! Encontre o Flavinho nas 5 rodadas antes de estourar o limite de 10 erros!',
      posterTitle: 'PROCURA-SE NA MUVUCA',
      startButton: 'CADÊ O FLAVINHO?',
      newGameButton: 'NOVO JOGO',
      controlsHelp: 'Arraste para mover • Roda do mouse, botões (+ / −) ou pinça para dar zoom • Encontre 5 vezes para zerar!',
      hudRound: 'RODADA',
      hudScore: 'PONTOS',
      hudCombo: 'COMBO',
      hudNpcs: 'NPCs encontrados:',
      hudTime: 'TEMPO',
      hudErrors: 'ERROS',
      nextRoundButton: 'PRÓXIMA RODADA →',
      allNpcsFoundMessage: '🎉 VOCÊ ENCONTROU TODOS OS 5 NPCs!',
      hint: 'Dica: dê zoom (+ ou roda do mouse) e procure o terno escuro, gravata amarela-clara e olhos revirados! Clique nos NPCs famosos para ouvir dicas!',
      winTitle: 'PARABÉNS VOCÊ ACHOU O FLAVINHO RACHADINHA, JÁ ESTÁ MELHOR QUE A POLÍCIA FEDERAL.',
      winMainMessage: 'PARABÉNS VOCÊ ACHOU O FLAVINHO RACHADINHA, JÁ ESTÁ MELHOR QUE A POLÍCIA FEDERAL.',
      winVictorySub: 'Você completou todas as 5 rodadas e desvendou todos os esconderijos da orla!',
      gameOverTitle: '🚨 FIM DE JOGO — ELE ESCAPOU!',
      winSub: 'Você atingiu o limite de 10 erros e o Flavinho conseguiu foro privilegiado em outra praia!',
      restartButton: 'JOGAR NOVAMENTE',
      shareButton: 'COMPARTILHAR RESULTADO',
      downloadShareButton: 'BAIXAR RESULTADO',
      closeSuspect: 'VOLTAR PRA BUSCA',
      npcHintsTitle: 'DICAS DOS NPCs',
      npcHintsSub: 'Procure estas 5 figuras espalhadas pela cena (clicar neles não conta como erro!):',
      closeNpcHints: 'FECHAR',
    },

    traits: [
      'Terno escuro e gravata amarelo-clara (mesmo no calor de 40°C)',
      'Topete escuro com têmporas grisalhas e sobrancelhas grossas',
      'Olhos revirados para cima (quase desmaiando no debate!)',
    ],

    // Mensagens irônicas ao encontrar o Flavinho a cada rodada (referenciando os escândalos)
    roundClearQuotes: [
      '🎯 ACHOU! Ele estava contando dinheiro vivo da loja de chocolates e já correu pra outro canto!',
      '🎯 PEGOU! Tentou fingir um desmaio igual no debate, mas não colou! Próxima rodada...',
      '🎯 ENCONTROU! Estava assinando a escritura da mansão com juros camaradas e fugiu de novo!',
      '🎯 ACHOU O FLAVINHO! Ele deixou cair uma sacola de laranjas do Queiroz na fuga!',
      '🎯 NA MOSCA! Estava combinando a rachadinha do quiosque e saiu de fininho para a próxima rodada!',
      '🎯 ACHOU! Tentou se esconder atrás de 48 depósitos fracionados de R$ 2.000 no caixa eletrônico!',
      '🎯 FLAGRADO! Pediu foro privilegiado pro salva-vidas e mudou de esconderijo na praia!',
      '🎯 ACHOU! Disse que o lucro na venda do apartamento foi "sorte no mercado imobiliário" e sumiu!',
      '🎯 LOCALIZADO! O relatório do COAF apitou e ele já trocou de guarda-sol!',
      '🎯 ACHOU! Estava comprando panetone em dinheiro vivo em pleno verão de 40 graus!',
    ],

    // Mensagens quando o jogador clica em elementos específicos (por tag)
    byTag: {
      decoy: [
        '❌ Terno na praia é suspeito, mas esse aí é só advogado de porta de delegacia! (-10 pts)',
        '❌ Quase! Esse engravatado tá só vendendo consórcio na areia. (-10 pts)',
        '❌ Engravatado errado! Esse aí declara imposto certinho. (-10 pts)',
      ],
      police: [
        '❌ Esse é da PM, só está olhando o movimento no calçadão. (-10 pts)',
        '❌ Cidadão fardado! Não é o Flavinho. (-10 pts)',
      ],
      pf: [
        '❌ Agente da PF de binóculo! Se você achar o Flavinho antes dele, avisa! (-10 pts)',
        '❌ A Polícia Federal também está procurando na praia inteira! (-10 pts)',
      ],
      vendor: [
        '❌ Olha o mate gelado e o biscoito Globo! Aqui todo mundo trabalha no sol. (-10 pts)',
        '❌ Esse ambulante vende no Pix, não em dinheiro vivo! (-10 pts)',
        '❌ Queijo coalho na brasa! Mas nada de senador por aqui. (-10 pts)',
      ],
      reporter: [
        '❌ Equipe de TV ao vivo esperando uma entrevista exclusiva que nunca começa! (-10 pts)',
        '❌ Esse é o repórter perguntando: "Cadê o Flavinho?" (-10 pts)',
      ],
      protester: [
        '❌ Esse cidadão só veio segurar cartaz na manifestação. (-10 pts)',
        '❌ Muita faixa e gritaria, mas o Flavinho passou longe daqui! (-10 pts)',
      ],
      cart: [
        '❌ Barraca de laranja 100% orgânica! Mas o dono já saiu correndo. (-10 pts)',
        '❌ Muita laranja nessa barraca, mas nenhuma fala no Senado! (-10 pts)',
      ],
      kiosk: [
        '❌ Quiosque lotado! Só tem água de coco superfaturada e porção de batata. (-10 pts)',
        '❌ Perguntaram no balcão do quiosque: ninguém viu, ninguém sabe! (-10 pts)',
      ],
      bus: [
        '❌ Ônibus lotado a 40 graus! Acha mesmo que político anda de busão? (-10 pts)',
        '❌ Linha 474 lotada! Aqui só tem trabalhador voltando pra casa. (-10 pts)',
      ],
      van: [
        '❌ Van suspeita estacionada na avenida... mas só tem equipamento de som! (-10 pts)',
      ],
      car: [
        '❌ Trânsito travado na orla! Só buzina e motorista estressado. (-10 pts)',
      ],
      taxi: [
        '❌ Táxi no bandeira 2, mas o passageiro não é o Flavinho. (-10 pts)',
      ],
      boat: [
        '❌ Lancha passeando no mar... será que pediram carona pra fugir? (-10 pts)',
        '❌ Barco cheio de turista tirando selfie. Nada do Flavinho! (-10 pts)',
      ],
      duck: [
        '❌ Quack! É o pato amarelo gigante boiado no mar, não o Flavinho! (-10 pts)',
      ],
      dog: [
        '❌ Au au! Respeita o vira-lata caramelo, patrimônio nacional! (-10 pts)',
      ],
      capybara: [
        '❌ Uma capivara pleníssima tomando sol na praia. Inimiga de ninguém! (-10 pts)',
      ],
      seagull: [
        '❌ Essa gaivota só quer roubar batata frita de turista distraído. (-10 pts)',
      ],
      crab: [
        '❌ Siri andando de lado na areia — especialista em desviar de perguntas! (-10 pts)',
      ],
      umbrella: [
        '❌ Debaixo desse guarda-sol só tem gente ardendo de queimadura solar. (-10 pts)',
        '❌ Só sombra, cadeira de praia e protetor solar fator 15. (-10 pts)',
      ],
      building: [
        '❌ Cobertura de frente pro mar avaliada em milhões... pago em dinheiro vivo?! (-10 pts)',
        '❌ Prédio da orla cheio de fofoqueiro na janela, mas o Flavinho está lá embaixo! (-10 pts)',
      ],
    },

    // Mensagens gerais para cliques na multidão ou na areia
    genericMisses: [
      '❌ Não é o Flavinho. (-10 pts)',
      '❌ Esse cidadão não está fugindo de intimação. (-10 pts)',
      '❌ Quase. Mas você encontrou apenas um banhista comum. (-10 pts)',
      '❌ Nada aqui além de areia, suor e caipirinha cara. (-10 pts)',
      '❌ Esse aí não comprou mansão nem loja de chocolate! (-10 pts)',
      '❌ Pessoa errada! Continue procurando o terno escuro com gravata clara. (-10 pts)',
      '❌ Esse cidadão não desmaiou no debate. Tente outro! (-10 pts)',
      '❌ Frio! Essa pessoa nem conhece o Queiroz. (-10 pts)',
      '❌ Só um turista gringo virando camarão no sol. (-10 pts)',
      '❌ Errou! Olhe com calma entre os guarda-sóis e quiosques. (-10 pts)',
    ],

    // Classificação divertida no final da partida conforme pontuação e rodadas alcançadas
    ranks(score, round) {
      if (score >= 1200 || round >= 8) {
        return '🏆 NÍVEL: AUDITOR DO COAF — Rastreador implacável de laranjas e mansões!';
      }
      if (score >= 600 || round >= 5) {
        return '🕵️ NÍVEL: DELEGADO DE OPERAÇÃO — Deu um suor danado no senador pela orla inteira!';
      }
      if (score >= 250 || round >= 3) {
        return '📰 NÍVEL: REPÓRTER INVESTIGATIVO — Conseguiu bons flagras antes dele sumir!';
      }
      return '🍊 NÍVEL: COMPRADOR DE LARANJA — O Flavinho te driblou na muvuca rapidinho!';
    },
  };
})();
