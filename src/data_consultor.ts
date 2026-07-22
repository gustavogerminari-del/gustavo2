/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ClienteEmpresa,
  VagaConsultoria,
  CandidatoConsultoria,
  EntrevistaConsultoria,
  CRMDeal,
  FinanceiroContrato,
  ReceitaDespesa,
  NotificacaoSistema
} from './types_consultor';

export const INITIAL_CLIENTES: ClienteEmpresa[] = [
  {
    id: 'cli-1',
    razaoSocial: 'TechCorp Inovações Ltda',
    nomeFantasia: 'TechCorp Inovações',
    cnpj: '12.345.678/0001-90',
    responsavel: 'Carlos Eduardo Andrade',
    telefone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    email: 'carlos.andrade@techcorp.com.br',
    site: 'https://techcorp.com.br',
    endereco: 'Av. Paulista, 1000 - Cj 1201',
    cidade: 'São Paulo',
    estado: 'SP',
    segmento: 'Tecnologia & Software',
    numeroFuncionarios: 180,
    observacoes: 'Cliente estratégico com alto volume de vagas em TI e Produto.',
    status: 'Ativo',
    consultorResponsavelId: 'cons-1',
    consultorName: 'Rafaela Lourenço',
    dataCadastro: '2025-01-15',
    logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'cli-2',
    razaoSocial: 'Financeira Alfa Soluções S.A.',
    nomeFantasia: 'Alfa Financeira',
    cnpj: '98.765.432/0001-10',
    responsavel: 'Mariana Duarte',
    telefone: '(11) 2109-8765',
    whatsapp: '(11) 97654-3210',
    email: 'mduarte@alfafinanceira.com.br',
    site: 'https://alfafinanceira.com.br',
    endereco: 'Rua Faria Lima, 2500 - 8º andar',
    cidade: 'São Paulo',
    estado: 'SP',
    segmento: 'Serviços Financeiros',
    numeroFuncionarios: 350,
    observacoes: 'Contrato de retenção mensal para vagas de liderança e compliance.',
    status: 'Ativo',
    consultorResponsavelId: 'cons-1',
    consultorName: 'Rafaela Lourenço',
    dataCadastro: '2025-02-01',
    logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'cli-3',
    razaoSocial: 'Logística Express Brasil S.A.',
    nomeFantasia: 'LogExpress Brasil',
    cnpj: '45.123.890/0001-33',
    responsavel: 'Roberto Guimarães',
    telefone: '(19) 3211-9900',
    whatsapp: '(19) 99123-8877',
    email: 'roberto@logexpress.com.br',
    site: 'https://logexpress.com.br',
    endereco: 'Rodovia Anhanguera, Km 98',
    cidade: 'Campinas',
    estado: 'SP',
    segmento: 'Logística & Transporte',
    numeroFuncionarios: 520,
    observacoes: 'Processos focados em operação, coordenação e expansão regional.',
    status: 'Ativo',
    consultorResponsavelId: 'cons-2',
    consultorName: 'Gustavo Germinari',
    dataCadastro: '2025-03-10',
    logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'cli-4',
    razaoSocial: 'Rede Saúde Vivence Eireli',
    nomeFantasia: 'Clínicas Vivence',
    cnpj: '33.888.777/0001-55',
    responsavel: 'Dra. Patricia Medeiros',
    telefone: '(21) 3344-5566',
    whatsapp: '(21) 98877-6655',
    email: 'patricia@vivensesaude.com.br',
    site: 'https://vivensesaude.com.br',
    endereco: 'Av. das Américas, 4200 - Bloco 2',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    segmento: 'Saúde & Bem-Estar',
    numeroFuncionarios: 210,
    observacoes: 'Proposta enviada para plano anual de contratação continuada.',
    status: 'Proposta',
    consultorResponsavelId: 'cons-1',
    consultorName: 'Rafaela Lourenço',
    dataCadastro: '2025-05-04',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=120&q=80'
  }
];

export const INITIAL_VAGAS_CONSULTORIA: VagaConsultoria[] = [
  {
    id: 'vag-101',
    clienteId: 'cli-1',
    clienteNome: 'TechCorp Inovações',
    cargo: 'Desenvolvedor Full Stack React/Node Sênior',
    descricao: 'Buscamos um desenvolvedor Sênior para liderar arquitetura de novos microserviços e interfaces de alta performance.',
    responsabilidades: [
      'Desenvolver componentes React reutilizáveis com Tailwind CSS',
      'Construir APIs RESTful e GraphQL em Node.js com TypeScript',
      'Garantir cobertura de testes automatizados e integração contínua',
      'Mentorar desenvolvedores plenos e juniores'
    ],
    requisitos: [
      '5+ anos de experiência com ecossistema JavaScript/TypeScript',
      'Domínio avançado de React.js, Node.js e bancos SQL/NoSQL',
      'Experiência em arquitetura serverless e AWS/GCP',
      'Inglês técnico intermediário/avançado'
    ],
    beneficios: ['Plano de Saúde Bradesco Top', 'Vale Refeição R$ 1.200/mês', 'Auxílio Home Office R$ 400', 'Seguro de Vida'],
    salario: 'R$ 14.500,00',
    cidade: 'São Paulo',
    estado: 'SP',
    modalidade: 'Remoto',
    tipoContratacao: 'CLT',
    quantidade: 2,
    prazo: '2026-08-15',
    status: 'Em Andamento',
    publicadoPortal: true,
    canaisPublicacao: ['LinkedIn Recruiter', 'Gupy', 'Portal Rafaela Lourenço RH'],
    dataCriacao: '2026-07-01',
    consultorId: 'cons-1'
  },
  {
    id: 'vag-102',
    clienteId: 'cli-2',
    clienteNome: 'Alfa Financeira',
    cargo: 'Gerente de Compliance e Riscos',
    descricao: 'Profissional estratégico para estruturação e auditoria de processos de compliance regulatório do Banco Central.',
    responsabilidades: [
      'Garantir conformidade com diretrizes do BACEN e CVM',
      'Elaborar políticas de prevenção a lavagem de dinheiro (PLD)',
      'Liderar auditorias internas e relacionamento com órgãos reguladores'
    ],
    requisitos: [
      'Graduação em Direito, Economia ou Administração',
      'Pós-graduação em Compliance ou Gestão de Riscos',
      'Experiência mínima de 6 anos no setor financeiro'
    ],
    beneficios: ['Bônus Anual PLR até 4 salários', 'Plano de Saúde Unimed', 'Carro da empresa', 'Vale Alimentação R$ 1.500'],
    salario: 'R$ 18.000,00',
    cidade: 'São Paulo',
    estado: 'SP',
    modalidade: 'Híbrido',
    tipoContratacao: 'CLT',
    quantidade: 1,
    prazo: '2026-08-30',
    status: 'Aberta',
    publicadoPortal: true,
    canaisPublicacao: ['LinkedIn Recruiter', 'Catho', 'Portal Rafaela Lourenço RH'],
    dataCriacao: '2026-07-10',
    consultorId: 'cons-1'
  },
  {
    id: 'vag-103',
    clienteId: 'cli-3',
    clienteNome: 'LogExpress Brasil',
    cargo: 'Coordenador de Operações Logísticas',
    descricao: 'Coordenador para gestão de frota, rotas e equipe operacional no centro de distribuição regional.',
    responsabilidades: [
      'Gerenciar prazos de entrega e rotas de distribuição',
      'Liderar equipe de 45 operadores e motoristas',
      'Reduzir custos logísticos e avarias de carga'
    ],
    requisitos: [
      'Ensino Superior completo em Logística ou Administração',
      'Experiência com sistemas WMS e TMS',
      'Disponibilidade para turnos organizados'
    ],
    beneficios: ['Refeitório no local', 'Vale Transporte', 'Assistência Médica e Odontológica'],
    salario: 'R$ 8.500,00',
    cidade: 'Campinas',
    estado: 'SP',
    modalidade: 'Presencial',
    tipoContratacao: 'CLT',
    quantidade: 1,
    prazo: '2026-08-05',
    status: 'Em Andamento',
    publicadoPortal: true,
    canaisPublicacao: ['InfoJobs', 'Portal Rafaela Lourenço RH'],
    dataCriacao: '2026-06-20',
    consultorId: 'cons-2'
  }
];

export const INITIAL_CANDIDATOS_CONSULTORIA: CandidatoConsultoria[] = [
  {
    id: 'cand-101',
    nome: 'Lucas Gabriel Mendes',
    email: 'lucas.mendes@email.com',
    telefone: '(11) 98822-1100',
    cidade: 'São Paulo',
    estado: 'SP',
    cargoDesejado: 'Desenvolvedor Full Stack React/Node Sênior',
    experienciaAnos: 7,
    escolaridade: 'Pós-Graduação em Arquitetura de Software',
    idiomas: ['Português (Nativo)', 'Inglês (Avançado)'],
    cursos: ['Certificação AWS Solutions Architect', 'Clean Architecture & DDD'],
    hardSkills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL', 'AWS'],
    softSkills: ['Liderança Técnica', 'Comunicação Clara', 'Resolução de Problemas', 'Proatividade'],
    pretensaoSalarial: 14000,
    disponibilidade: 'Imediata',
    favorito: true,
    tags: ['Especialista React', 'Full Stack Sênior', 'Disponível Já'],
    observacoes: 'Excelente postura na pré-entrevista. Forte domínio de arquitetura.',
    resumoIA: 'Candidato com fit excepcional (94%) para a vaga da TechCorp. Possui 7 anos de bagagem técnica sólida em React e Node.js.',
    aiScore: 94,
    fitClass: 'Excelente',
    pontosFortes: [
      'Atende 100% dos requisitos de stack técnica (React, Node, TypeScript, SQL)',
      'Possui certificação AWS ativa e sólida experiência em cloud',
      'Pretensão salarial compatível com o orçamento aprovado'
    ],
    pontosFracos: [
      'Experiência prévia em startups menores, pode requerer rápida adaptação a processos corporativos'
    ],
    perguntasSugeridas: [
      'Como você abordou o último desafio de escalabilidade no React?',
      'Conte um caso onde teve que refatorar um código legado sob pressão de prazo.',
      'Como conduz code reviews com desenvolvedores menos experientes?'
    ],
    etapaPipeline: 'Entrevista Cliente',
    vagaId: 'vag-101',
    vagaTitulo: 'Desenvolvedor Full Stack React/Node Sênior',
    clienteId: 'cli-1',
    clienteNome: 'TechCorp Inovações',
    dataCadastro: '2026-07-05',
    consultorId: 'cons-1',
    historicoEtapas: [
      { etapa: 'Novo', data: '2026-07-05', usuario: 'Portal Candidato' },
      { etapa: 'Triagem', data: '2026-07-06', usuario: 'IA de Triagem', observacao: 'Classificado com Score 94%' },
      { etapa: 'Entrevista RH', data: '2026-07-08', usuario: 'Rafaela Lourenço', observacao: 'Aprovado na entrevista técnica/comportamental' },
      { etapa: 'Entrevista Cliente', data: '2026-07-12', usuario: 'Rafaela Lourenço', observacao: 'Encaminhado parecer ao gestor do cliente' }
    ]
  },
  {
    id: 'cand-102',
    nome: 'Juliana Vasconcelos',
    email: 'juliana.vasconcelos@email.com',
    telefone: '(11) 97711-2233',
    cidade: 'São Paulo',
    estado: 'SP',
    cargoDesejado: 'Gerente de Compliance e Riscos',
    experienciaAnos: 8,
    escolaridade: 'Mestrado em Direito Regulatório (USP)',
    idiomas: ['Português (Nativo)', 'Inglês (Fluente)', 'Espanhol (Intermediário)'],
    cursos: ['Certificação CAMS (Anti-Money Laundering)', 'ISO 37001 Anti-Suborno'],
    hardSkills: ['Compliance BACEN', 'Auditoria Interna', 'Gestão de Riscos', 'PLD/FT', 'LGPD'],
    softSkills: ['Negociação', 'Visão Estratégica', 'Ética Inabalável', 'Gestão de Crise'],
    pretensaoSalarial: 17500,
    disponibilidade: '30 dias',
    favorito: true,
    tags: ['Especialista Financeiro', 'Compliance BACEN', 'Mestre USP'],
    observacoes: 'Atualmente atua em fintech de grande porte. Altíssima bagagem técnica.',
    resumoIA: 'Candidata altamente qualificada para a Alfa Financeira (Score 91%). Excelente histórico em auditorias e adequação BACEN.',
    aiScore: 91,
    fitClass: 'Excelente',
    pontosFortes: [
      'Vasta experiência no setor bancário regulado',
      'Mestrado em Direito Regulatório e certificações internacionais em PLD',
      'Comunicação executiva impecável'
    ],
    pontosFracos: [
      'Aviso prévio de 30 dias no emprego atual'
    ],
    perguntasSugeridas: [
      'Como estruturou o programa de PLD no seu emprego atual?',
      'Qual foi a auditoria do Banco Central mais desafiadora que você liderou?'
    ],
    etapaPipeline: 'Entrevista RH',
    vagaId: 'vag-102',
    vagaTitulo: 'Gerente de Compliance e Riscos',
    clienteId: 'cli-2',
    clienteNome: 'Alfa Financeira',
    dataCadastro: '2026-07-11',
    consultorId: 'cons-1'
  },
  {
    id: 'cand-103',
    nome: 'Fernando Silveira',
    email: 'fernando.silveira@email.com',
    telefone: '(19) 98112-3344',
    cidade: 'Campinas',
    estado: 'SP',
    cargoDesejado: 'Coordenador de Operações Logísticas',
    experienciaAnos: 6,
    escolaridade: 'Superior em Logística (FATEC)',
    idiomas: ['Português (Nativo)'],
    cursos: ['Gestão de Frotas e Roteirização', 'Kaizen / Lean Logistics'],
    hardSkills: ['WMS', 'TMS', 'Gestão de Frota', 'Indicadores KPIs', 'Excel Avançado'],
    softSkills: ['Gestão de Pessoas', 'Agilidade', 'Foco em Resultados'],
    pretensaoSalarial: 8200,
    disponibilidade: '15 dias',
    favorito: false,
    tags: ['Operações Campinas', 'WMS Experiência'],
    observacoes: 'Reside próximo ao centro de distribuição em Campinas.',
    resumoIA: 'Perfil alinhado para LogExpress Brasil (Score 88%). Experiência comprovada na região.',
    aiScore: 88,
    fitClass: 'Muito Bom',
    pontosFortes: ['Mora na mesma cidade', 'Conhecimento prático em WMS', 'Liderança operacional'],
    pontosFracos: ['Inglês básico'],
    perguntasSugeridas: ['Como lida com greves ou atrasos imprevistos na frota?'],
    etapaPipeline: 'Aprovado',
    vagaId: 'vag-103',
    vagaTitulo: 'Coordenador de Operações Logísticas',
    clienteId: 'cli-3',
    clienteNome: 'LogExpress Brasil',
    dataCadastro: '2026-06-25',
    consultorId: 'cons-2'
  }
];

export const INITIAL_ENTREVISTAS: EntrevistaConsultoria[] = [
  {
    id: 'ent-1',
    candidatoId: 'cand-101',
    candidatoNome: 'Lucas Gabriel Mendes',
    vagaId: 'vag-101',
    vagaTitulo: 'Desenvolvedor Full Stack React/Node Sênior',
    clienteId: 'cli-1',
    clienteNome: 'TechCorp Inovações',
    data: '2026-07-22',
    hora: '14:30',
    tipo: 'Google Meet',
    linkMeet: 'https://meet.google.com/abc-defg-hij',
    responsavel: 'Rafaela Lourenço e CTO TechCorp',
    status: 'Agendada',
    checklist: [
      { item: 'Validar teste de arquitetura técnica', concluido: true },
      { item: 'Checar disponibilidade de início', concluido: true },
      { item: 'Apresentar pacote de benefícios', concluido: false }
    ],
    notas: 'Entrevista técnica decisiva com a diretoria de engenharia.',
    parecerTecnico: 'Candidato demonstrando maturidade técnica acima da média.',
    avaliacaoScore: 5
  },
  {
    id: 'ent-2',
    candidatoId: 'cand-102',
    candidatoNome: 'Juliana Vasconcelos',
    vagaId: 'vag-102',
    vagaTitulo: 'Gerente de Compliance e Riscos',
    clienteId: 'cli-2',
    clienteNome: 'Alfa Financeira',
    data: '2026-07-23',
    hora: '10:00',
    tipo: 'MS Teams',
    linkMeet: 'https://teams.microsoft.com/l/meetup-join/123456',
    responsavel: 'Rafaela Lourenço',
    status: 'Agendada',
    checklist: [
      { item: 'Alinhamento de pretensão salarial', concluido: true },
      { item: 'Levantamento de referências profissionais', concluido: false }
    ]
  }
];

export const INITIAL_CRM_DEALS: CRMDeal[] = [
  {
    id: 'deal-1',
    clienteEmpresa: 'Rede Saúde Vivence Eireli',
    cnpj: '33.888.777/0001-55',
    responsavel: 'Dra. Patricia Medeiros',
    telefone: '(21) 98877-6655',
    email: 'patricia@vivensesaude.com.br',
    valorEstimado: 35000,
    etapa: 'Proposta',
    probabilidade: 75,
    dataPrevisaoFechamento: '2026-08-10',
    consultorResponsavel: 'Rafaela Lourenço',
    historicoAtividades: [
      { id: 'act-1', tipo: 'Reunião', descricao: 'Reunião de diagnóstico das vagas de coordenação médica.', data: '2026-07-15', usuario: 'Rafaela Lourenço' },
      { id: 'act-2', tipo: 'Email', descricao: 'Envio da proposta comercial do plano anual de R&S.', data: '2026-07-18', usuario: 'Rafaela Lourenço' }
    ],
    dataCriacao: '2026-07-10'
  },
  {
    id: 'deal-2',
    clienteEmpresa: 'Grupo Varejo Sol Nascente',
    cnpj: '55.444.333/0001-22',
    responsavel: 'Marcos Vinicius',
    telefone: '(11) 99887-1122',
    email: 'marcos@solnascente.com.br',
    valorEstimado: 48000,
    etapa: 'Negociação',
    probabilidade: 85,
    dataPrevisaoFechamento: '2026-08-01',
    consultorResponsavel: 'Gustavo Germinari',
    historicoAtividades: [
      { id: 'act-3', tipo: 'Ligação', descricao: 'Alinhamento de minuta contratual com jurídico.', data: '2026-07-20', usuario: 'Gustavo Germinari' }
    ],
    dataCriacao: '2026-06-28'
  }
];

export const INITIAL_CONTRATOS_FINANCEIRO: FinanceiroContrato[] = [
  {
    id: 'fin-ct-1',
    clienteId: 'cli-1',
    clienteNome: 'TechCorp Inovações',
    tipoCobrança: 'Porcentagem Salarial',
    valorUnitario: 14500, // 100% de 1 salário contratado
    status: 'Ativo',
    dataInicio: '2025-01-15',
    dataVencimento: '2026-12-31',
    comissaoConsultor: 20
  },
  {
    id: 'fin-ct-2',
    clienteId: 'cli-2',
    clienteNome: 'Alfa Financeira',
    tipoCobrança: 'Mensalidade',
    valorUnitario: 12000,
    status: 'Ativo',
    dataInicio: '2025-02-01',
    dataVencimento: '2027-02-01',
    comissaoConsultor: 15
  }
];

export const INITIAL_RECEITAS_DESPESAS: ReceitaDespesa[] = [
  {
    id: 'rec-1',
    clienteId: 'cli-1',
    clienteNome: 'TechCorp Inovações',
    descricao: 'Honorário de Sucesso R&S - Vaga Dev Full Stack',
    tipo: 'Receita',
    categoria: 'Honorários de Recrutamento',
    valor: 14500,
    dataVencimento: '2026-07-30',
    dataPagamento: '2026-07-20',
    status: 'Pago',
    reciboGerado: true
  },
  {
    id: 'rec-2',
    clienteId: 'cli-2',
    clienteNome: 'Alfa Financeira',
    descricao: 'Mensalidade Consultoria RH - Julho/2026',
    tipo: 'Receita',
    categoria: 'Mensalidade SaaS',
    valor: 12000,
    dataVencimento: '2026-08-05',
    status: 'Pendente',
    reciboGerado: false
  },
  {
    id: 'desp-1',
    descricao: 'Assinatura LinkedIn Recruiter Corporate',
    tipo: 'Despesa',
    categoria: 'Ferramentas',
    valor: 3200,
    dataVencimento: '2026-07-25',
    dataPagamento: '2026-07-10',
    status: 'Pago'
  }
];

export const INITIAL_NOTIFICACOES: NotificacaoSistema[] = [
  {
    id: 'notif-1',
    titulo: 'Nova candidatura recebida!',
    mensagem: 'Lucas Gabriel Mendes se candidatou para a vaga de Dev Full Stack Sênior da TechCorp.',
    data: '2026-07-21 09:15',
    lida: false,
    tipo: 'Candidato'
  },
  {
    id: 'notif-2',
    titulo: 'Entrevista agendada com o Cliente',
    mensagem: 'Entrevista confirmada para amanhã às 14:30 via Google Meet.',
    data: '2026-07-21 10:40',
    lida: false,
    tipo: 'Entrevista'
  },
  {
    id: 'notif-3',
    titulo: 'Pagamento de honorário confirmado',
    mensagem: 'TechCorp Inovações realizou o pagamento de R$ 14.500,00 referente à contratação.',
    data: '2026-07-20 16:00',
    lida: true,
    tipo: 'Financeiro'
  }
];
