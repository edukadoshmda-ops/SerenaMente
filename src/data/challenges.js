// Desafios e Metas Diárias para Superação Emocional

export const DEFAULT_DAILY_GOALS = [
  {
    id: 'goal-water',
    title: 'Beber 1 copo de água com presença plena',
    description: 'Sinta a água descendo, hidratando e renovando suas células com calma.',
    category: 'corpo',
    icon: 'Droplets',
    completed: false
  },
  {
    id: 'goal-breath',
    title: 'Fazer 3 minutos de respiração consciente',
    description: 'Pausa para respirar e mandar mensagem de segurança ao coração.',
    category: 'mente',
    icon: 'Wind',
    completed: false
  },
  {
    id: 'goal-sunlight',
    title: 'Tomar 5 minutos de luz solar / ar fresco',
    description: 'Abra a janela ou dê um passo lá fora. A luz natural regula a serotonina e o ciclo circadiano.',
    category: 'corpo',
    icon: 'Sun',
    completed: false
  },
  {
    id: 'goal-audiobook',
    title: 'Ouvir 1 capítulo de Playbook terapêutico',
    description: 'Alimente sua mente com palavras que acolhem em vez de notícias e cobranças.',
    category: 'espirito',
    icon: 'Headphones',
    completed: false
  },
  {
    id: 'goal-victory',
    title: 'Reconhecer 1 pequena vitória de hoje',
    description: 'Pode ser ter levantado da cama, escovado os dentes ou sido gentil consigo.',
    category: 'autoestima',
    icon: 'Sparkles',
    completed: false
  },
  {
    id: 'goal-detox',
    title: '30 minutos longe de redes sociais e notícias',
    description: 'Dê uma folga aos seus olhos e mente do excesso de comparação e ansiedade.',
    category: 'mente',
    icon: 'ShieldCheck',
    completed: false
  }
];

export const CHALLENGE_JOURNEYS = [
  {
    id: 'jornada-7-dias-paz',
    title: 'Jornada 7 Dias: Saindo da Tempestade',
    tagline: 'Primeiros socorros emocionais para acalmar crises e reencontrar o chão.',
    difficulty: 'Suave & Acolhedor',
    daysCount: 7,
    gradient: 'from-calm-500 to-indigo-600',
    days: [
      {
        day: 1,
        title: 'Dia 1: Acolhendo sem Luta',
        task: 'Hoje, não tente forçar sentimentos positivos. Permita-se sentir o que está aí, dizendo com carinho: "Eu vejo a minha dor e não vou abandoná-la."',
        affirmation: 'Está tudo bem não estar 100% hoje.',
        actionType: 'audio',
        targetPlaybookId: 'crise-ansiedade-sos'
      },
      {
        day: 2,
        title: 'Dia 2: O Poder do Banho de Presença',
        task: 'Tome um banho sentindo a temperatura da água na pele. Imagine a água lavando o peso dos ombros e levando embora a tensão acumulada.',
        affirmation: 'Eu limpo minha mente e descanso meu corpo.',
        actionType: 'habit'
      },
      {
        day: 3,
        title: 'Dia 3: Faxina Mental de 5 Minutos',
        task: 'Pegue um pedaço de papel e despeje sem filtros tudo o que está te assustando. Depois, amasse o papel e jogue fora como símbolo de desapego.',
        affirmation: 'Eu não sou meus pensamentos assustadores.',
        actionType: 'journal'
      },
      {
        day: 4,
        title: 'Dia 4: Micro-Passo contra a Procrastinação',
        task: 'Escolha uma tarefa minúscula (guardar 3 peças de roupa ou lavar uma xícara) e faça sem pressa.',
        affirmation: 'Pequenos passos somam grandes distâncias.',
        actionType: 'habit'
      },
      {
        day: 5,
        title: 'Dia 5: Contato com a Natureza',
        task: 'Olhe para as copas das árvores, o céu ou toque em uma planta. A natureza lembra que tudo tem seu tempo e suas estações.',
        affirmation: 'Como a natureza, eu também passo por invernos e volto a florescer.',
        actionType: 'habit'
      },
      {
        day: 6,
        title: 'Dia 6: O Escudo contra a Comparação',
        task: 'Fique o dia de hoje sem abrir stories ou perfis que te deixam se sentindo insuficiente. Seu ritmo é único.',
        affirmation: 'Minha única régua de evolução é o meu próprio bem-estar.',
        actionType: 'habit'
      },
      {
        day: 7,
        title: 'Dia 7: Celebrando a Resistência',
        task: 'Olhe no espelho e agradeça a você mesmo por ter chegado até aqui. Você enfrentou tempestades invisíveis e sobreviveu.',
        affirmation: 'Eu sou muito mais forte do que a minha ansiedade pensa.',
        actionType: 'celebrate'
      }
    ]
  },
  {
    id: 'jornada-14-dias-renovacao',
    title: 'Desafio 14 Dias: Reconstruindo a Autoestima',
    tagline: 'Transformando a voz interna crítica em uma aliada compassiva e fortalecida.',
    difficulty: 'Intermediário',
    daysCount: 14,
    gradient: 'from-emerald-500 to-teal-600',
    days: [
      {
        day: 1,
        title: 'Dia 1: Identificando o Crítico Interno',
        task: 'Preste atenção em quantas vezes você se chama de fraco ou incapaz. Dê um nome engraçado para essa voz crítica e não leve ela a sério.',
        affirmation: 'Eu mereço ser tratado com o mesmo amor que dedico a quem amo.',
        actionType: 'audio',
        targetPlaybookId: 'reprogramando-pensamentos'
      },
      {
        day: 2,
        title: 'Dia 2: A Carta do Melhor Amigo',
        task: 'Escreva 3 frases gentis para você mesmo, como se fosse seu melhor amigo te encorajando.',
        affirmation: 'Minhas feridas não anulam minhas qualidades.',
        actionType: 'journal'
      },
      {
        day: 3,
        title: 'Dia 3: Estabelecendo um Limite Saudável',
        task: 'Diga "não" a um pedido ou situação que esgota sua energia sem culpa.',
        affirmation: 'Dizer não aos outros às vezes é dizer sim para a minha saúde mental.',
        actionType: 'habit'
      },
      {
        day: 4,
        title: 'Dia 4: O Ritmo do Meu Próprio Fôlego',
        task: 'Faça 5 minutos de respiração profunda antes das refeições para diminuir o estresse biológico.',
        affirmation: 'A paz começa de dentro para fora.',
        actionType: 'habit'
      },
      {
        day: 5,
        title: 'Dia 5: Resgatando um Gosto Antigo',
        task: 'Relembre uma música, comida ou hobby da sua infância que te trazia aconchego.',
        affirmation: 'A alegria simples ainda vive dentro de mim.',
        actionType: 'habit'
      },
      {
        day: 6,
        title: 'Dia 6: Movimento Consciente',
        task: 'Faça um alongamento suave de 7 minutos, soltando a musculatura da lombar e do pescoço.',
        affirmation: 'Meu corpo me sustenta e eu cuido dele.',
        actionType: 'habit'
      },
      {
        day: 7,
        title: 'Dia 7: O Diário do Que Deu Certo',
        task: 'Anote 3 coisas que deram certo nesta semana, mesmo as mais simples.',
        affirmation: 'Eu escolho notar a luz entre as frestas.',
        actionType: 'journal'
      }
    ]
  }
];
