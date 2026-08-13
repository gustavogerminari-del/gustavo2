/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee, Job, Candidate, VacationRequest, TimeRegister, PaySlip, DocumentFile, AppSettings } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Ana Silva',
    email: 'ana.silva@gestrh.com',
    phone: '(11) 98765-4321',
    department: 'Financeiro',
    role: 'Analista Financeiro Pleno',
    salary: 3200,
    admissionDate: '2023-03-15',
    status: 'Ativo'
  },
  {
    id: 'emp-2',
    name: 'Bruno Costa',
    email: 'bruno.costa@gestrh.com',
    phone: '(11) 97654-3210',
    department: 'Comercial',
    role: 'Executivo de Contas',
    salary: 2400,
    admissionDate: '2024-01-10',
    status: 'Ativo'
  },
  {
    id: 'emp-3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@gestrh.com',
    phone: '(11) 96543-2109',
    department: 'TI',
    role: 'Desenvolvedor Full Stack Sênior',
    salary: 4500,
    admissionDate: '2022-05-20',
    status: 'Ativo'
  },
  {
    id: 'emp-4',
    name: 'Diana Santos',
    email: 'diana.santos@gestrh.com',
    phone: '(11) 95432-1098',
    department: 'Recursos Humanos',
    role: 'Coordenadora de DHO',
    salary: 3100,
    admissionDate: '2023-08-01',
    status: 'Ativo'
  },
  {
    id: 'emp-5',
    name: 'Eduardo Souza',
    email: 'eduardo.souza@gestrh.com',
    phone: '(11) 94321-0987',
    department: 'Comercial',
    role: 'Consultor de Vendas',
    salary: 2200,
    admissionDate: '2024-06-15',
    status: 'Ativo'
  },
  {
    id: 'emp-6',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@gestrh.com',
    phone: '(11) 93210-9876',
    department: 'Financeiro',
    role: 'Coordenadora Financeira',
    salary: 2800,
    admissionDate: '2021-11-10',
    status: 'Em Férias'
  },
  {
    id: 'emp-7',
    name: 'Gabriel Almeida',
    email: 'gabriel.almeida@gestrh.com',
    phone: '(11) 92109-8765',
    department: 'TI',
    role: 'Analista de Infraestrutura',
    salary: 3800,
    admissionDate: '2023-11-01',
    status: 'Ativo'
  },
  {
    id: 'emp-8',
    name: 'Helena Ribeiro',
    email: 'helena.ribeiro@gestrh.com',
    phone: '(11) 91098-7654',
    department: 'Comercial',
    role: 'Assistente Comercial',
    salary: 2150,
    admissionDate: '2024-02-15',
    status: 'Ativo'
  },
  {
    id: 'emp-9',
    name: 'Igor Guimarães',
    email: 'igor.guimaraes@gestrh.com',
    phone: '(11) 90987-6543',
    department: 'Logística',
    role: 'Supervisor de Logística',
    salary: 1900,
    admissionDate: '2022-09-01',
    status: 'Afastado'
  },
  {
    id: 'emp-10',
    name: 'Juliana Neves',
    email: 'juliana.neves@gestrh.com',
    phone: '(11) 99876-5432',
    department: 'Administrativo',
    role: 'Assistente Administrativo',
    salary: 2100,
    admissionDate: '2023-01-20',
    status: 'Ativo'
  },
  {
    id: 'emp-11',
    name: 'Kleber Rocha',
    email: 'kleber.rocha@gestrh.com',
    phone: '(11) 98765-0123',
    department: 'Administrativo',
    role: 'Analista Administrativo Pleno',
    salary: 2300,
    admissionDate: '2022-02-10',
    status: 'Em Férias'
  },
  {
    id: 'emp-12',
    name: 'Larissa Melo',
    email: 'larissa.melo@gestrh.com',
    phone: '(11) 97654-1234',
    department: 'Comercial',
    role: 'Líder de Vendas',
    salary: 2024,
    admissionDate: '2023-05-01',
    status: 'Ativo'
  },
  {
    id: 'emp-13',
    name: 'Mateus Nunes',
    email: 'mateus.nunes@gestrh.com',
    phone: '(11) 96543-2345',
    department: 'Administrativo',
    role: 'Auxiliar de Serviços Gerais',
    salary: 1200,
    admissionDate: '2024-05-10',
    status: 'Ativo'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Desenvolvedor Front-End React',
    department: 'TI',
    location: 'São Paulo - SP',
    type: 'CLT',
    workModel: 'Híbrido',
    salaryRange: 'R$ 5.000 - R$ 7.000',
    description: 'Buscamos um profissional com experiência sólida em React, Tailwind CSS e TypeScript para integrar nossa equipe de canais digitais. Irá atuar no desenvolvimento de novas features e otimização de performance.',
    requirements: ['React 18+', 'TypeScript', 'Tailwind CSS', 'Consumo de APIs RESTful', 'Git/GitHub'],
    active: true,
    createdAt: '2026-07-10'
  },
  {
    id: 'job-2',
    title: 'Analista de Recrutamento e Seleção Pleno',
    department: 'Recursos Humanos',
    location: 'Rio de Janeiro - RJ',
    type: 'CLT',
    workModel: 'Híbrido',
    salaryRange: 'R$ 3.500 - R$ 4.500',
    description: 'Responsável por conduzir processos seletivos de ponta a ponta (alinhamento, hunting, triagem, entrevistas, dinâmicas e proposta), atuando com foco em vagas corporativas e de tecnologia.',
    requirements: ['Formação em Psicologia ou RH', 'Experiência em Tech Recruiting', 'Domínio de plataformas de vagas', 'Comunicação assertiva'],
    active: true,
    createdAt: '2026-07-12'
  },
  {
    id: 'job-3',
    title: 'Gerente Comercial (B2B)',
    department: 'Comercial',
    location: 'Belo Horizonte - MG',
    type: 'CLT',
    workModel: 'Presencial',
    salaryRange: 'R$ 7.500 - R$ 10.000',
    description: 'Liderar equipe comercial interna, planejar estratégias de expansão de contas B2B, elaborar propostas e acompanhar indicadores de vendas (funil, conversão e CAC).',
    requirements: ['Sólida experiência em gestão comercial B2B', 'Domínio de CRM', 'Habilidade de negociação de alto nível', 'Foco em metas'],
    active: true,
    createdAt: '2026-07-15'
  },
  {
    id: 'job-4',
    title: 'Assistente Administrativo Financeiro',
    department: 'Financeiro',
    location: 'Curitiba - PR',
    type: 'CLT',
    workModel: 'Presencial',
    salaryRange: 'R$ 2.200 - R$ 2.800',
    description: 'Auxiliar nas rotinas de contas a pagar e receber, conciliação bancária, faturamento de notas fiscais e suporte no atendimento a clientes/fornecedores sobre cobranças.',
    requirements: ['Ensino médio completo ou cursando Administração', 'Domínio de Excel/Planilhas', 'Organização e atenção a detalhes', 'Noções básicas de faturamento'],
    active: true,
    createdAt: '2026-07-18'
  },
  {
    id: 'job-5',
    title: 'Analista de Suporte de TI',
    department: 'TI',
    location: 'Remoto',
    type: 'PJ',
    workModel: 'Remoto',
    salaryRange: 'R$ 4.000 - R$ 5.000',
    description: 'Prestar suporte técnico de N1 e N2 para colaboradores remotos, gerenciar acessos de ferramentas corporativas, configurar máquinas de forma remota e resolver chamados de redes/sistemas.',
    requirements: ['Conhecimento em Redes de Computadores', 'Administração de GSuite / Microsoft 365', 'Configuração de VPN', 'Atendimento ao cliente (Helpdesk)'],
    active: true,
    createdAt: '2026-07-20'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Mariana Lopes',
    email: 'mariana.lopes@gmail.com',
    phone: '(11) 91234-5678',
    city: 'São Paulo',
    state: 'SP',
    area: 'TI',
    experience: 'Desenvolvedora front-end há 3 anos, apaixonada por CSS/Tailwind e React. Experiência prévia em e-commerces.',
    resumeText: 'Mariana Lopes - Desenvolvedora Front-End. Residente em SP. Domínio de React, JS, TS, HTML, CSS. Trabalho prévio na TechStore LTDA.',
    createdAt: '2026-07-15'
  },
  {
    id: 'cand-2',
    name: 'Ricardo Gomes',
    email: 'ricardo.gomes@outlook.com',
    phone: '(31) 98888-2222',
    city: 'Belo Horizonte',
    state: 'MG',
    area: 'Comercial',
    experience: 'Gerente comercial com 6 anos de experiência em vendas corporativas industriais. Foco em prospecção de grandes contas.',
    resumeText: 'Ricardo Gomes. MBA em Vendas Corporativas. 6 anos liderando equipe comercial na MinasAço S/A.',
    createdAt: '2026-07-17'
  },
  {
    id: 'cand-3',
    name: 'Beatriz Fernandes',
    email: 'beatriz.fernandes@rh.com.br',
    phone: '(21) 97777-4444',
    city: 'Rio de Janeiro',
    state: 'RJ',
    area: 'Recursos Humanos',
    experience: 'Psicóloga com foco em recrutamento técnico de TI. 2 anos de experiência em consultoria de RH focada em startups.',
    resumeText: 'Beatriz Fernandes. Graduação em Psicologia pela UFRJ. Recrutadora de tecnologia especialista em vagas ágeis.',
    createdAt: '2026-07-20'
  }
];

export const INITIAL_TIME_REGISTERS: TimeRegister[] = [
  {
    id: 'tr-1',
    employeeId: 'emp-1',
    employeeName: 'Ana Silva',
    date: '2026-07-21',
    clockIn: '08:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    clockOut: '17:30',
    totalHours: 8.5,
    extraHours: 0.5,
    status: 'Aprovado'
  },
  {
    id: 'tr-2',
    employeeId: 'emp-2',
    employeeName: 'Bruno Costa',
    date: '2026-07-21',
    clockIn: '09:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    clockOut: '18:00',
    totalHours: 8.0,
    extraHours: 0,
    status: 'Aprovado'
  },
  {
    id: 'tr-3',
    employeeId: 'emp-3',
    employeeName: 'Carlos Oliveira',
    date: '2026-07-21',
    clockIn: '08:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    clockOut: '19:00',
    totalHours: 10.0,
    extraHours: 2.0,
    status: 'Aprovado'
  },
  {
    id: 'tr-4',
    employeeId: 'emp-4',
    employeeName: 'Diana Santos',
    date: '2026-07-21',
    clockIn: '08:30',
    lunchOut: '12:30',
    lunchIn: '13:30',
    clockOut: '17:30',
    totalHours: 8.0,
    extraHours: 0,
    status: 'Aprovado'
  },
  {
    id: 'tr-5',
    employeeId: 'emp-7',
    employeeName: 'Gabriel Almeida',
    date: '2026-07-21',
    clockIn: '08:00',
    lunchOut: '12:00',
    lunchIn: '13:00',
    clockOut: '21:00',
    totalHours: 12.0,
    extraHours: 4.0,
    status: 'Aprovado'
  }
];

export const INITIAL_VACATION_REQUESTS: VacationRequest[] = [
  {
    id: 'vac-1',
    employeeId: 'emp-6',
    employeeName: 'Fernanda Lima',
    department: 'Financeiro',
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    days: 30,
    status: 'Em andamento'
  },
  {
    id: 'vac-2',
    employeeId: 'emp-11',
    employeeName: 'Kleber Rocha',
    department: 'Administrativo',
    startDate: '2026-07-15',
    endDate: '2026-08-13',
    days: 30,
    status: 'Em andamento'
  },
  {
    id: 'vac-3',
    employeeId: 'emp-2',
    employeeName: 'Bruno Costa',
    department: 'Comercial',
    startDate: '2026-08-10',
    endDate: '2026-08-24',
    days: 15,
    status: 'Pendente'
  }
];

export const INITIAL_PAYSLIPS: PaySlip[] = [
  {
    id: 'ps-1',
    employeeId: 'emp-1',
    employeeName: 'Ana Silva',
    month: '2026-07',
    baseSalary: 3200,
    extraHoursEarnings: 150,
    deductions: 320,
    netSalary: 3030,
    status: 'Pendente',
    generatedAt: '2026-07-20'
  },
  {
    id: 'ps-2',
    employeeId: 'emp-3',
    employeeName: 'Carlos Oliveira',
    month: '2026-07',
    baseSalary: 4500,
    extraHoursEarnings: 600,
    deductions: 540,
    netSalary: 4560,
    status: 'Pendente',
    generatedAt: '2026-07-20'
  }
];

export const INITIAL_DOCUMENTS: DocumentFile[] = [
  {
    id: 'doc-1',
    employeeId: 'emp-1',
    employeeName: 'Ana Silva',
    title: 'Contrato de Trabalho Admissional',
    category: 'Contrato',
    uploadDate: '2023-03-15',
    fileName: 'contrato_trabalho_ana_silva.pdf',
    fileSize: '1.2 MB'
  },
  {
    id: 'doc-2',
    employeeId: 'emp-3',
    employeeName: 'Carlos Oliveira',
    title: 'Carteira de Identidade (RG)',
    category: 'Identidade',
    uploadDate: '2022-05-19',
    fileName: 'rg_carlos_oliveira.pdf',
    fileSize: '450 KB'
  },
  {
    id: 'doc-3',
    employeeId: 'emp-4',
    employeeName: 'Diana Santos',
    title: 'Comprovante de Residência Atualizado',
    category: 'Comprovante',
    uploadDate: '2023-08-01',
    fileName: 'comprovante_residencia_diana.pdf',
    fileSize: '890 KB'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'RL CONNECT - R Lourenço Recrutamento e Seleção',
  contactEmail: 'contato@rafaelalourenco.com.br',
  phone: '(11) 3456-7890',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  baseWorkHoursPerDay: 8,
  extraHoursMultiplier: 1.5
};

// --- INITIAL DATA FOR NEW MODULES ---

import { OnboardingContract, Benefit, EmployeeBenefit, Termination } from './types';

export const INITIAL_CONTRACTS: OnboardingContract[] = [
  {
    id: 'ct-1',
    employeeName: 'Julio Cesar Santos',
    email: 'julio.cesar@gmail.com',
    phone: '(11) 98111-2222',
    role: 'Desenvolvedor Frontend Junior',
    department: 'TI',
    type: 'Experiência',
    startDate: '2026-08-01',
    salary: 3500,
    status: 'Pendente',
    createdAt: '2026-07-20',
    checklistDocuments: [
      { id: 'ch-1', name: 'Documento de Identidade (RG/CNH)', status: 'Recebido', fileName: 'rg_julio.pdf', uploadedAt: '2026-07-20' },
      { id: 'ch-2', name: 'CPF', status: 'Recebido', fileName: 'cpf_julio.pdf', uploadedAt: '2026-07-20' },
      { id: 'ch-3', name: 'Comprovante de Residência', status: 'Pendente' },
      { id: 'ch-4', name: 'Título de Eleitor', status: 'Pendente' },
      { id: 'ch-5', name: 'Atestado de Saúde Ocupacional (ASO)', status: 'Pendente' }
    ]
  },
  {
    id: 'ct-2',
    employeeName: 'Fabiana Moreira',
    email: 'fabiana.moreira@outlook.com',
    phone: '(11) 97333-4444',
    role: 'Analista de Marketing Senior',
    department: 'Comercial',
    type: 'PJ',
    startDate: '2026-08-05',
    salary: 7200,
    status: 'Assinado',
    createdAt: '2026-07-18',
    checklistDocuments: [
      { id: 'ch-1', name: 'Contrato Social / MEI', status: 'Recebido', fileName: 'mei_fabiana.pdf', uploadedAt: '2026-07-19' },
      { id: 'ch-2', name: 'Comprovante de Conta Corrente PJ', status: 'Recebido', fileName: 'conta_corrente_pj.pdf', uploadedAt: '2026-07-19' },
      { id: 'ch-3', name: 'Documento do Representante Legal', status: 'Recebido', fileName: 'cnh_fabiana.pdf', uploadedAt: '2026-07-19' }
    ]
  }
];

export const INITIAL_BENEFITS: Benefit[] = [
  { id: 'ben-1', name: 'Vale Alimentação', type: 'VA', category: 'Provento', valueType: 'Fixo', value: 450.00, status: 'Ativo' },
  { id: 'ben-2', name: 'Vale Refeição', type: 'VR', category: 'Provento', valueType: 'Fixo', value: 650.00, status: 'Ativo' },
  { id: 'ben-3', name: 'Vale Transporte (Desconto Legal)', type: 'VT', category: 'Desconto', valueType: 'Porcentagem', value: 6.00, status: 'Ativo' },
  { id: 'ben-4', name: 'Plano de Saúde Unimed Co-participado', type: 'Saúde', category: 'Desconto', valueType: 'Fixo', value: 180.00, status: 'Ativo' },
  { id: 'ben-5', name: 'Plano Odontológico OdontoPrev', type: 'Odonto', category: 'Desconto', valueType: 'Fixo', value: 35.00, status: 'Ativo' },
  { id: 'ben-6', name: 'Prêmio por Assiduidade', type: 'Assiduidade', category: 'Provento', valueType: 'Fixo', value: 150.00, status: 'Ativo' },
  { id: 'ben-7', name: 'Comissão sobre Vendas de Equipe', type: 'Comissão', category: 'Provento', valueType: 'Porcentagem', value: 2.5, status: 'Ativo' },
  { id: 'ben-8', name: 'Auxílio Creche Personalizado', type: 'Custom', category: 'Provento', valueType: 'Fixo', value: 250.00, status: 'Ativo' }
];

export const INITIAL_EMPLOYEE_BENEFITS: EmployeeBenefit[] = [
  // Ana Silva (emp-1) has Vale Alimentação, Vale Refeição, Plano de Saúde
  { id: 'eb-1', employeeId: 'emp-1', employeeName: 'Ana Silva', benefitId: 'ben-1', benefitName: 'Vale Alimentação', benefitType: 'VA', category: 'Provento', valueType: 'Fixo', value: 450.00, status: 'Ativo' },
  { id: 'eb-2', employeeId: 'emp-1', employeeName: 'Ana Silva', benefitId: 'ben-2', benefitName: 'Vale Refeição', benefitType: 'VR', category: 'Provento', valueType: 'Fixo', value: 650.00, status: 'Ativo' },
  { id: 'eb-3', employeeId: 'emp-1', employeeName: 'Ana Silva', benefitId: 'ben-4', benefitName: 'Plano de Saúde Unimed Co-participado', benefitType: 'Saúde', category: 'Desconto', valueType: 'Fixo', value: 180.00, status: 'Ativo' },
  
  // Bruno Costa (emp-2) has Vale Alimentação, Vale Transporte, Comissão
  { id: 'eb-4', employeeId: 'emp-2', employeeName: 'Bruno Costa', benefitId: 'ben-1', benefitName: 'Vale Alimentação', benefitType: 'VA', category: 'Provento', valueType: 'Fixo', value: 450.00, status: 'Ativo' },
  { id: 'eb-5', employeeId: 'emp-2', employeeName: 'Bruno Costa', benefitId: 'ben-3', benefitName: 'Vale Transporte (Desconto Legal)', benefitType: 'VT', category: 'Desconto', valueType: 'Porcentagem', value: 6.00, status: 'Ativo' },
  { id: 'eb-6', employeeId: 'emp-2', employeeName: 'Bruno Costa', benefitId: 'ben-7', benefitName: 'Comissão sobre Vendas de Equipe', benefitType: 'Comissão', category: 'Provento', valueType: 'Porcentagem', value: 2.50, status: 'Ativo' }
];

export const INITIAL_TERMINATIONS: Termination[] = [
  {
    id: 'term-1',
    employeeId: 'emp-5',
    employeeName: 'Eduardo Souza',
    role: 'Consultor de Vendas',
    department: 'Comercial',
    salary: 2200,
    type: 'Pedido de demissão',
    requestDate: '2026-07-15',
    terminationDate: '2026-07-31',
    noticePeriod: 'Trabalhado',
    salaryBalance: 1100, // 15 dias trabalhados em julho
    vacationBalance: 220,
    proportionalThirteenth: 183.33,
    fgtsFine: 0, // No fine for voluntary resignation
    totalLiquido: 1503.33,
    status: 'Calculado',
    checklistDocuments: [
      { id: 'tcd-1', name: 'Termo de Rescisão do Contrato de Trabalho (TRCT)', status: 'Recebido', fileName: 'trct_eduardo.pdf' },
      { id: 'tcd-2', name: 'Exame Demissional (ASO)', status: 'Recebido', fileName: 'aso_demissional_eduardo.pdf' },
      { id: 'tcd-3', name: 'Termo de Quitação de Verbas', status: 'Pendente' }
    ],
    notes: 'Colaborador solicitou desligamento por motivos pessoais e aceitou cumprir aviso trabalhado até 31/07.'
  }
];

