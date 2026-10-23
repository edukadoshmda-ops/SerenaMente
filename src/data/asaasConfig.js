// Configurações de Integração com o Asaas (Links de Pagamento e Planos)

const DEFAULT_ASAAS_CONFIG = {
  // Links de Pagamento gerados no painel do Asaas (https://www.asaas.com)
  // O administrador pode alterar aqui ou pelo painel visual da página
  plans: {
    mensal: {
      id: 'mensal',
      name: 'Plano Acolhimento Mensal',
      price: 9.90,
      priceFormatted: 'R$ 9,90',
      period: 'por mês',
      description: 'Ideal para experimentar o refúgio diário e dar os primeiros passos. De R$ 19,90 por R$ 9,90/mês.',
      badge: 'Sem fidelidade',
      // Link de Pagamento Oficial Asaas:
      paymentLink: 'https://www.asaas.com/000/c/znw37swbmbzvod0z',
      features: [
        'Acesso completo a todos os Playbooks em Áudio',
        'Vozes profissionais feminina e masculina',
        'Botão SOS Pânico & Crises (Respiração 4-7-8 e 5-4-3-2-1)',
        'Mixer de Sons Relaxantes (Chuva, Ondas, 432 Hz)',
        'Diário Emocional e Metas Diárias Gentis',
        'Acesso no Celular, Tablet e Computador'
      ]
    },
    anual: {
      id: 'anual',
      name: 'Plano Transformação Anual',
      price: 97.00,
      priceFormatted: 'R$ 97,00',
      period: 'por ano',
      installments: 'ou até 12x de R$ 9,70 no cartão',
      monthlyEquivalent: 'R$ 8,08/mês',
      discountBadge: '60% de Desconto',
      isPopular: true,
      description: 'O caminho mais seguro para consolidar novos hábitos e reconquistar a paz.',
      paymentLink: 'https://www.asaas.com/000/c/so98wzo06jbvo8dr',
      features: [
        'Tudo do Plano Mensal incluído',
        'Todos os Livros e Playbooks em PDF para Download',
        'Histórias Guiadas para Dormir e Curar a Insônia',
        'Novos Playbooks adicionados todo mês',
        'Suporte prioritário e atualizações gratuitas',
        'Garantia incondicional de 7 dias com reembolso via Pix'
      ]
    },
    vitalicio: {
      id: 'vitalicio',
      name: 'Acesso Vitalício + Bônus',
      price: 147.00,
      priceFormatted: 'R$ 147,00',
      period: 'pagamento único',
      installments: 'ou até 12x de R$ 14,70 no cartão',
      badge: 'Acesso para Sempre',
      description: 'Pague uma única vez e tenha o SerenaMente como seu refúgio permanente.',
      paymentLink: 'https://www.asaas.com/000/c/cpvg71k31t3ebq4i',
      features: [
        'Acesso Vitalício ao aplicativo e a todas as atualizações',
        'Todos os Audiobooks em alta definição (MP3 para baixar)',
        'Todos os PDFs Terapêuticos originais inclusos',
        'Acesso ilimitado à Assistente Serena (Acolhimento TCC)',
        'Acesso a todas as futuras jornadas e desafios',
        'Sem mensalidades, sem renovação e sem surpresas'
      ]
    }
  },
  pixKey: 'contato@serenamente.com.br',
  supportWhatsapp: '5511999999999'
};

export const getAsaasConfig = () => {
  try {
    const saved = localStorage.getItem('serenamente_asaas_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sanitizar caso tenha links de teste antigos
      if (parsed.plans?.mensal?.paymentLink && parsed.plans.mensal.paymentLink.includes('acolhimento-mensal')) {
        parsed.plans.mensal.paymentLink = DEFAULT_ASAAS_CONFIG.plans.mensal.paymentLink;
      }
      if (parsed.plans?.anual?.paymentLink && parsed.plans.anual.paymentLink.includes('transformacao-anual-60off')) {
        parsed.plans.anual.paymentLink = DEFAULT_ASAAS_CONFIG.plans.anual.paymentLink;
      }
      if (parsed.plans?.vitalicio?.paymentLink && parsed.plans.vitalicio.paymentLink.includes('vitalicio-bonus')) {
        parsed.plans.vitalicio.paymentLink = DEFAULT_ASAAS_CONFIG.plans.vitalicio.paymentLink;
      }
      return { ...DEFAULT_ASAAS_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Erro ao carregar configurações do Asaas:', e);
  }
  return DEFAULT_ASAAS_CONFIG;
};

export const saveAsaasConfig = (newConfig) => {
  try {
    localStorage.setItem('serenamente_asaas_config', JSON.stringify(newConfig));
    return true;
  } catch (e) {
    console.error('Erro ao salvar configurações do Asaas:', e);
    return false;
  }
};
