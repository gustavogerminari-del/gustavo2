/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  SaaSModule, 
  SaaSProduct, 
  SaaSPlan, 
  SaaSCompany, 
  UserAccount, 
  UserRole,
  SiteConfig,
  SiteHomeConfig,
  SiteEmpresaConfig,
  SitePlanoConfig,
  SiteMidiaConfig,
  SiteContatoConfig
} from './types_master';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firestoreDb = getFirestore(app);

// Helper to safely execute Firestore getDoc with timeout to avoid hangs or unhandled offline errors
export async function safeFirestoreGetDoc(docRef: any, timeoutMs = 1200): Promise<any> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs)
    );
    return await Promise.race([getDoc(docRef), timeoutPromise]);
  } catch (err) {
    return null;
  }
}

// Helper to safely execute Firestore setDoc with timeout
export async function safeFirestoreSetDoc(docRef: any, data: any, timeoutMs = 1200): Promise<void> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs)
    );
    await Promise.race([setDoc(docRef, data), timeoutPromise]);
  } catch (err) {
    console.warn('Firestore setDoc notice (saved locally):', err);
  }
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  home: {
    titulo: 'Conectando talentos às melhores oportunidades',
    subtitulo: 'Plataforma de Recrutamento e Gestão de Pessoas',
    descricao: 'A plataforma digital completa de RH onde candidatos, empresas e gestão de pessoas se encontram em um só lugar.',
    botaoTexto: 'Cadastrar Currículo',
    botaoLink: '#tres-publicos',
    imagem: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  },
  empresa: {
    missao: 'Transformar a gestão de pessoas e o recrutamento no Brasil conectando empresas excepcionais a talentos brilhantes de forma ágil, transparente e humana.',
    visao: 'Ser a plataforma líder e referência nacional em atração de talentos, inovação em Recursos Humanos e inteligência em departamento pessoal.',
    valores: [
      'Inovação Contínua',
      'Transparência e Ética',
      'Tecnologia com Propósito',
      'Pessoas em Primeiro Lugar',
      'Conformidade e Segurança LGPD'
    ]
  },
  planos: [
    {
      id: 'plano-1',
      nome: 'Básico',
      descricao: 'Ideal para pequenas empresas iniciando a estruturação do RH e contratações pontuais.',
      valorMensal: 'Sob consulta',
      valorAnual: 'Sob consulta',
      beneficios: [
        'Publicação ilimitada de vagas',
        'Triagem de candidatos em tempo real',
        'Painel exclusivo da empresa',
        'Suporte por e-mail'
      ],
      botaoTexto: 'Falar com Consultor',
      botaoLink: '#contato',
      ativo: true,
      ordem: 1,
      destaque: false
    },
    {
      id: 'plano-2',
      nome: 'Profissional',
      descricao: 'Para empresas em crescimento que necessitam de atração contínua e banco de talentos completo.',
      valorMensal: 'Sob consulta',
      valorAnual: 'Sob consulta',
      beneficios: [
        'Tudo do Plano Básico',
        'Acesso completo ao Banco de Talentos',
        'Filtros avançados de seleção por área',
        'Salvar candidatos favoritos',
        'Inteligência Artificial de Triagem'
      ],
      botaoTexto: 'Falar com Consultor',
      botaoLink: '#contato',
      ativo: true,
      ordem: 2,
      destaque: true,
      badge: 'MAIS POPULAR'
    },
    {
      id: 'plano-3',
      nome: 'Enterprise',
      descricao: 'Solução personalizada corporativa com recrutamento dedicado e consultoria completa de DP.',
      valorMensal: 'Personalizado',
      valorAnual: 'Personalizado',
      beneficios: [
        'Tudo do Plano Profissional',
        'Consultoria dedicada Rafaela Lourenço RH',
        'Entrevistas por competências gravadas',
        'Integração total com Folha e Ponto',
        'Atendimento e SLA prioritário 24/7'
      ],
      botaoTexto: 'Falar com Consultor',
      botaoLink: '#contato',
      ativo: true,
      ordem: 3,
      destaque: false
    }
  ],
  midia: {
    logo: '',
    favicon: '',
    bannerInicial: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    imagensInstitucionais: []
  },
  contato: {
    telefone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    email: 'contato@rafaelalourenco.com.br',
    endereco: 'Av. Paulista, 1000, Bela Vista, São Paulo/SP - CEP 01310-100',
    redesSociais: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com',
      twitter: ''
    }
  }
};

import { 
  Employee, 
  Job, 
  Candidate, 
  TimeRegister, 
  VacationRequest, 
  PaySlip, 
  DocumentFile, 
  AppSettings,
  INSSBracket,
  IRRFBracket
} from './types';

import {
  INITIAL_EMPLOYEES,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_TIME_REGISTERS,
  INITIAL_VACATION_REQUESTS,
  INITIAL_PAYSLIPS,
  INITIAL_DOCUMENTS,
  INITIAL_SETTINGS
} from './data';

// Helper to get or generate unique device identifier for local session isolation
function getDeviceId(): string {
  try {
    let deviceId = localStorage.getItem('gestrh_device_id');
    if (!deviceId) {
      deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('gestrh_device_id', deviceId);
    }
    return deviceId;
  } catch (e) {
    return 'dev-default-session';
  }
}

// Session keys isolated per device/tab
const getDeviceSessionKey = (): string => `gestrh_session_${getDeviceId()}`;

// Key names for LocalStorage (Firebase Firestore Simulation)
const KEYS = {
  USERS: 'firebase_users',
  MODULES: 'firebase_modules',
  PRODUCTS: 'firebase_products',
  PLANS: 'firebase_plans',
  COMPANIES: 'firebase_companies',
  EMPLOYEES: 'firebase_employees',
  JOBS: 'firebase_jobs',
  CANDIDATES: 'firebase_candidates',
  TIME_REGISTERS: 'firebase_time_registers',
  VACATION_REQUESTS: 'firebase_vacation_requests',
  PAYSLIPS: 'firebase_payslips',
  DOCUMENTS: 'firebase_documents',
  SETTINGS: 'firebase_settings',
  CONTRACTS: 'firebase_contracts',
  BENEFITS: 'firebase_benefits',
  EMPLOYEE_BENEFITS: 'firebase_employee_benefits',
  TERMINATIONS: 'firebase_terminations',
  RES_TYPES: 'firebase_res_types',
  RES_EVENTS: 'firebase_res_events',
  RES_DOCS: 'firebase_res_docs',
  HORAS_EXTRAS: 'firebase_horas_extras',
  CORRECOES_PONTO: 'firebase_correcoes_ponto',
  TABELA_INSS: 'firebase_tabela_inss',
  TABELA_IRRF: 'firebase_tabela_irrf',
  SITE_CONFIG: 'firebase_site_config'
};

// Initial Módulos available for sale as listed in the user prompt:
const INITIAL_SAAS_MODULES: SaaSModule[] = [
  { id: 'mod-1', name: 'Cadastro de funcionários', description: 'Gestão completa do ciclo de vida dos colaboradores.', price: 49.90, status: 'Ativo' },
  { id: 'mod-2', name: 'Recrutamento e Seleção', description: 'Publicação de vagas, triagem de candidatos e funil de contratação.', price: 79.90, status: 'Ativo' },
  { id: 'mod-3', name: 'Banco de talentos', description: 'Repositório unificado de currículos para buscas inteligentes.', price: 39.90, status: 'Ativo' },
  { id: 'mod-4', name: 'Página de vagas', description: 'Portal de carreiras personalizado para a atração de novos talentos.', price: 29.90, status: 'Ativo' },
  { id: 'mod-5', name: 'Candidatura fácil', description: 'Processo simplificado e otimizado para inscrição de candidatos.', price: 19.90, status: 'Ativo' },
  { id: 'mod-6', name: 'Controle de ponto', description: 'Registro eletrônico de jornada com geolocalização e aprovações.', price: 59.90, status: 'Ativo' },
  { id: 'mod-7', name: 'Folha de pagamento', description: 'Cálculo de proventos, descontos e processamento financeiro do pessoal.', price: 99.90, status: 'Ativo' },
  { id: 'mod-8', name: 'Holerite', description: 'Disponibilização digital segura de comprovantes de rendimento.', price: 19.90, status: 'Ativo' },
  { id: 'mod-9', name: 'Benefícios', description: 'Gestão integrada de vale transporte, vale refeição, plano de saúde e adicionais.', price: 39.90, status: 'Ativo' },
  { id: 'mod-10', name: 'Relatórios', description: 'Análises avançadas de turnover, horas extras, custos de folha e metas de contratação.', price: 49.90, status: 'Ativo' },
  { id: 'mod-11', name: 'Módulo Contratação', description: 'Criação de contratos de trabalho (CLT, PJ, Temporário, Estágio) e checklist admissional.', price: 49.90, status: 'Ativo' },
  { id: 'mod-12', name: 'Módulo Rescisão', description: 'Cálculo de verbas rescisórias, aviso prévio, FGTS, férias e 13º proporcional.', price: 49.90, status: 'Ativo' },
  { id: 'mod-13', name: 'Assistente IA RH', description: 'Inteligência artificial para tirar dúvidas trabalhistas, criar vagas e analisar candidatos.', price: 59.90, status: 'Ativo' },
  { id: 'mod-14', name: 'Consultor de RH Multiempresa', description: 'Plataforma SaaS multi-tenant para consultorias de RH gerenciarem múltiplos clientes, vagas, pipeline Kanban, CRM comercial, IA de triagem e finanças.', price: 149.90, status: 'Ativo' },
  { id: 'mod-15', name: 'Entrevista Inteligente (IA)', description: 'Módulo de entrevistas presenciais/virtuais com gravação, transcrição em tempo real, avaliação em 16 competências e parecer decisório gerado por IA.', price: 89.90, status: 'Ativo' }
];

// Initial Produtos de venda:
const INITIAL_SAAS_PRODUCTS: SaaSProduct[] = [
  {
    id: 'prod-1',
    name: 'Módulo de Contratação Ágil',
    description: 'Recrutamento, Seleção, Banco de talentos e Portal de Vagas em uma única solução simplificada.',
    monthlyPrice: 129.90,
    annualPrice: 1290.00,
    status: 'Ativo',
    linkedModules: ['mod-2', 'mod-3', 'mod-4', 'mod-5']
  },
  {
    id: 'prod-2',
    name: 'Departamento Pessoal Digital',
    description: 'Gerenciamento de funcionários, ponto eletrônico moderno e holerites digitais.',
    monthlyPrice: 109.90,
    annualPrice: 1090.00,
    status: 'Ativo',
    linkedModules: ['mod-1', 'mod-6', 'mod-8']
  },
  {
    id: 'prod-3',
    name: 'Gestão de RH de Alta Performance',
    description: 'Suíte completa incluindo folha de pagamento, relatórios de BI avançados e controle de benefícios.',
    monthlyPrice: 169.90,
    annualPrice: 1690.00,
    status: 'Ativo',
    linkedModules: ['mod-7', 'mod-9', 'mod-10']
  }
];

// Initial Planos:
const INITIAL_SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'plan-basic',
    name: 'Plano Essencial',
    monthlyPrice: 149.90,
    annualPrice: 1490.00,
    includedModules: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5'],
    userLimit: 15,
    status: 'Ativo'
  },
  {
    id: 'plan-pro',
    name: 'Plano Profissional',
    monthlyPrice: 299.90,
    annualPrice: 2990.00,
    includedModules: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-8', 'mod-10'],
    userLimit: 50,
    status: 'Ativo'
  },
  {
    id: 'plan-enterprise',
    name: 'Plano Corporate Unlimited',
    monthlyPrice: 499.90,
    annualPrice: 4990.00,
    includedModules: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-7', 'mod-8', 'mod-9', 'mod-10'],
    userLimit: 200,
    status: 'Ativo'
  }
];

// Default Companies:
const INITIAL_SAAS_COMPANIES: SaaSCompany[] = [
  {
    id: 'company-1',
    name: 'Rafaela Lourenço RH & GestRH',
    cnpj: '12.345.678/0001-90',
    adminEmail: 'admin@rafaelalourenco.com.br',
    status: 'Ativo',
    planId: 'plan-enterprise',
    releasedModules: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-7', 'mod-8', 'mod-9', 'mod-10', 'mod-11', 'mod-12', 'mod-13', 'mod-14', 'mod-15'],
    userLimit: 100,
    createdAt: '2026-01-10'
  },
  {
    id: 'company-2',
    name: 'Tech Solutions Corp',
    cnpj: '98.765.432/0001-10',
    adminEmail: 'contato@techsolutions.com',
    status: 'Ativo',
    planId: 'plan-basic',
    releasedModules: ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5'],
    userLimit: 15,
    createdAt: '2026-05-15'
  }
];

// Pre-registered Users for testing out of the box
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-master',
    email: 'master@gestrh.com',
    name: 'SaaS Owner (Master)',
    role: 'Master',
    status: 'Ativo'
  },
  {
    id: 'user-admin-1',
    email: 'admin@rafaelalourenco.com.br',
    name: 'Rafaela Lourenço (Admin)',
    role: 'Empresa Administradora',
    companyId: 'company-1',
    status: 'Ativo'
  },
  {
    id: 'user-rh-1',
    email: 'diana.santos@gestrh.com', // Links to Diana Santos (Coordenadora de DHO)
    name: 'Diana Santos (RH)',
    role: 'RH',
    companyId: 'company-1',
    status: 'Ativo'
  },
  {
    id: 'user-emp-1',
    email: 'ana.silva@gestrh.com', // Links to Ana Silva
    name: 'Ana Silva (Colaborador)',
    role: 'Funcionário',
    companyId: 'company-1',
    employeeId: 'emp-1',
    status: 'Ativo'
  },
  {
    id: 'user-coord-1',
    email: 'fernanda.lima@gestrh.com', // Links to Fernanda Lima
    name: 'Fernanda Lima (Coordenadora)',
    role: 'Coordenador',
    companyId: 'company-1',
    employeeId: 'emp-6',
    status: 'Ativo'
  }
];

// --- SEED ENGINE ---
export function initializeFirebaseData() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  
  const existingModsStr = localStorage.getItem(KEYS.MODULES);
  if (!existingModsStr) {
    localStorage.setItem(KEYS.MODULES, JSON.stringify(INITIAL_SAAS_MODULES));
  } else {
    try {
      const existingMods: SaaSModule[] = JSON.parse(existingModsStr);
      let updated = false;
      INITIAL_SAAS_MODULES.forEach(initMod => {
        if (!existingMods.some(m => m.id === initMod.id)) {
          existingMods.push(initMod);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(KEYS.MODULES, JSON.stringify(existingMods));
      }
    } catch (e) {
      localStorage.setItem(KEYS.MODULES, JSON.stringify(INITIAL_SAAS_MODULES));
    }
  }

  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_SAAS_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.PLANS)) {
    localStorage.setItem(KEYS.PLANS, JSON.stringify(INITIAL_SAAS_PLANS));
  }

  const existingCompStr = localStorage.getItem(KEYS.COMPANIES);
  if (!existingCompStr) {
    localStorage.setItem(KEYS.COMPANIES, JSON.stringify(INITIAL_SAAS_COMPANIES));
  } else {
    try {
      const existingCompanies: SaaSCompany[] = JSON.parse(existingCompStr);
      let updated = false;
      existingCompanies.forEach(comp => {
        if (!comp.releasedModules.includes('mod-14')) {
          comp.releasedModules.push('mod-14');
          updated = true;
        }
        if (!comp.releasedModules.includes('mod-15')) {
          comp.releasedModules.push('mod-15');
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(KEYS.COMPANIES, JSON.stringify(existingCompanies));
      }
    } catch (e) {
      localStorage.setItem(KEYS.COMPANIES, JSON.stringify(INITIAL_SAAS_COMPANIES));
    }
  }

  // Bind existing employees to company-1
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    const employeesWithCompany = INITIAL_EMPLOYEES.map(emp => ({ ...emp, companyId: 'company-1' }));
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employeesWithCompany));
  }
  if (!localStorage.getItem(KEYS.JOBS)) {
    const jobsWithCompany = INITIAL_JOBS.map(job => ({ ...job, companyId: 'company-1' }));
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobsWithCompany));
  }
  if (!localStorage.getItem(KEYS.CANDIDATES)) {
    const candidatesWithCompany = INITIAL_CANDIDATES.map(cand => ({ ...cand, companyId: 'company-1' }));
    localStorage.setItem(KEYS.CANDIDATES, JSON.stringify(candidatesWithCompany));
  }
  if (!localStorage.getItem(KEYS.TIME_REGISTERS)) {
    const registersWithCompany = INITIAL_TIME_REGISTERS.map(reg => ({ ...reg, companyId: 'company-1' }));
    localStorage.setItem(KEYS.TIME_REGISTERS, JSON.stringify(registersWithCompany));
  }
  if (!localStorage.getItem(KEYS.VACATION_REQUESTS)) {
    const vacationsWithCompany = INITIAL_VACATION_REQUESTS.map(vac => ({ ...vac, companyId: 'company-1' }));
    localStorage.setItem(KEYS.VACATION_REQUESTS, JSON.stringify(vacationsWithCompany));
  }
  if (!localStorage.getItem(KEYS.PAYSLIPS)) {
    const payslipsWithCompany = INITIAL_PAYSLIPS.map(ps => ({ ...ps, companyId: 'company-1' }));
    localStorage.setItem(KEYS.PAYSLIPS, JSON.stringify(payslipsWithCompany));
  }
  if (!localStorage.getItem(KEYS.DOCUMENTS)) {
    const docsWithCompany = INITIAL_DOCUMENTS.map(doc => ({ ...doc, companyId: 'company-1' }));
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docsWithCompany));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const settingsMap = { 'company-1': INITIAL_SETTINGS };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settingsMap));
  }
  if (!localStorage.getItem(KEYS.RES_TYPES)) {
    const INITIAL_RES_TYPES = [
      { id: 'restype-1', code: 'T01', name: 'Demissão sem justa causa', geraFGTS: true, geraMultaFGTS: true, geraSeguroDesemprego: true, permiteAvisoPrevio: true },
      { id: 'restype-2', code: 'T02', name: 'Pedido de demissão', geraFGTS: false, geraMultaFGTS: false, geraSeguroDesemprego: false, permiteAvisoPrevio: true },
      { id: 'restype-3', code: 'T03', name: 'Acordo entre partes', geraFGTS: true, geraMultaFGTS: true, geraSeguroDesemprego: false, permiteAvisoPrevio: true },
      { id: 'restype-4', code: 'T04', name: 'Demissão por justa causa', geraFGTS: false, geraMultaFGTS: false, geraSeguroDesemprego: false, permiteAvisoPrevio: false },
      { id: 'restype-5', code: 'T05', name: 'Fim de contrato determinado', geraFGTS: true, geraMultaFGTS: false, geraSeguroDesemprego: false, permiteAvisoPrevio: false },
      { id: 'restype-6', code: 'T06', name: 'Rescisão antecipada de contrato', geraFGTS: true, geraMultaFGTS: true, geraSeguroDesemprego: false, permiteAvisoPrevio: true }
    ];
    localStorage.setItem(KEYS.RES_TYPES, JSON.stringify(INITIAL_RES_TYPES));
  }
  if (!localStorage.getItem(KEYS.RES_EVENTS)) {
    const INITIAL_RES_EVENTS = [
      { id: 'resevent-r001', code: 'R001', name: 'Saldo salário', type: 'Provento', description: 'Dias trabalhados no mês do desligamento' },
      { id: 'resevent-r002', code: 'R002', name: 'Aviso prévio indenizado', type: 'Provento', description: 'Aviso pago pela dispensa' },
      { id: 'resevent-r003', code: 'R003', name: 'Férias vencidas', type: 'Provento', description: 'Período aquisitivo completo e não gozado' },
      { id: 'resevent-r004', code: 'R004', name: 'Férias proporcionais', type: 'Provento', description: 'Meses proporcionais do período aquisitivo atual' },
      { id: 'resevent-r005', code: 'R005', name: '1/3 férias', type: 'Provento', description: 'Terço constitucional sobre férias vencidas e proporcionais' },
      { id: 'resevent-r006', code: 'R006', name: '13º proporcional', type: 'Provento', description: 'Meses trabalhados no ano corrente' },
      { id: 'resevent-r007', code: 'R007', name: 'Hora extra', type: 'Provento', description: 'Horas extraordinárias pendentes de pagamento' },
      { id: 'resevent-r008', code: 'R008', name: 'Comissão', type: 'Provento', description: 'Comissões de vendas acumuladas no mês' },
      { id: 'resevent-d001', code: 'D001', name: 'INSS', type: 'Desconto', description: 'Contribuição Previdenciária sobre verbas salariais' },
      { id: 'resevent-d002', code: 'D002', name: 'IRRF', type: 'Desconto', description: 'Imposto de Renda Retido na Fonte sobre saldo de salário e 13º' },
      { id: 'resevent-d003', code: 'D003', name: 'Aviso descontado', type: 'Desconto', description: 'Desconto por não cumprimento do aviso prévio pelo colaborador' },
      { id: 'resevent-d004', code: 'D004', name: 'Faltas', type: 'Desconto', description: 'Faltas não justificadas no período' },
      { id: 'resevent-d005', code: 'D005', name: 'Adiantamento', type: 'Desconto', description: 'Valores adiantados no mês corrente' }
    ];
    localStorage.setItem(KEYS.RES_EVENTS, JSON.stringify(INITIAL_RES_EVENTS));
  }
  if (!localStorage.getItem(KEYS.RES_DOCS)) {
    localStorage.setItem(KEYS.RES_DOCS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.TABELA_INSS)) {
    const INITIAL_TABELA_INSS: INSSBracket[] = [
      { id: 'inss-1', year: 2026, minSalary: 0, maxSalary: 1412.00, rate: 0.075, deductible: 0, companyId: 'company-1' },
      { id: 'inss-2', year: 2026, minSalary: 1412.01, maxSalary: 2666.68, rate: 0.09, deductible: 21.18, companyId: 'company-1' },
      { id: 'inss-3', year: 2026, minSalary: 2666.69, maxSalary: 4000.03, rate: 0.12, deductible: 101.18, companyId: 'company-1' },
      { id: 'inss-4', year: 2026, minSalary: 4000.04, maxSalary: 7786.02, rate: 0.14, deductible: 181.18, companyId: 'company-1' }
    ];
    localStorage.setItem(KEYS.TABELA_INSS, JSON.stringify(INITIAL_TABELA_INSS));
  }
  if (!localStorage.getItem(KEYS.TABELA_IRRF)) {
    const INITIAL_TABELA_IRRF: IRRFBracket[] = [
      { id: 'irrf-1', year: 2026, minSalary: 0, maxSalary: 2259.20, rate: 0, deduction: 0, dependentDeduction: 189.59, companyId: 'company-1' },
      { id: 'irrf-2', year: 2026, minSalary: 2259.21, maxSalary: 2826.65, rate: 0.075, deduction: 169.44, dependentDeduction: 189.59, companyId: 'company-1' },
      { id: 'irrf-3', year: 2026, minSalary: 2826.66, maxSalary: 3751.05, rate: 0.15, deduction: 381.44, dependentDeduction: 189.59, companyId: 'company-1' },
      { id: 'irrf-4', year: 2026, minSalary: 3751.06, maxSalary: 4664.68, rate: 0.225, deduction: 662.77, dependentDeduction: 189.59, companyId: 'company-1' },
      { id: 'irrf-5', year: 2026, minSalary: 4664.69, maxSalary: 999999.99, rate: 0.275, deduction: 896.00, dependentDeduction: 189.59, companyId: 'company-1' }
    ];
    localStorage.setItem(KEYS.TABELA_IRRF, JSON.stringify(INITIAL_TABELA_IRRF));
  }
}

// Automatically trigger data initialization on import
initializeFirebaseData();

// --- FIREBASE SIMULATOR SERVICE ---
interface FirebaseService {
  auth: {
    getCurrentUser(): UserAccount | null;
    signIn(email: string, password?: string): Promise<UserAccount>;
    signUp(email: string, name: string, role: UserRole, companyId?: string, employeeId?: string, password?: string): Promise<UserAccount>;
    signOut(): Promise<void>;
  };
  db: {
    getCollection<T>(collectionKey: keyof typeof KEYS, companyId?: string): Promise<T[]>;
    saveDoc<T>(collectionKey: keyof typeof KEYS, data: T, companyId?: string): Promise<T>;
    deleteDoc(collectionKey: keyof typeof KEYS, id: string): Promise<void>;
    getModules(): Promise<SaaSModule[]>;
    saveModule(module: SaaSModule): Promise<SaaSModule>;
    deleteModule(id: string): Promise<void>;
    getProducts(): Promise<SaaSProduct[]>;
    saveProduct(product: SaaSProduct): Promise<SaaSProduct>;
    deleteProduct(id: string): Promise<void>;
    getPlans(): Promise<SaaSPlan[]>;
    savePlan(plan: SaaSPlan): Promise<SaaSPlan>;
    deletePlan(id: string): Promise<void>;
    getCompanies(): Promise<SaaSCompany[]>;
    saveCompany(company: SaaSCompany): Promise<SaaSCompany>;
    deleteCompany(id: string): Promise<void>;
    getUsers(): Promise<UserAccount[]>;
    saveUser(user: UserAccount): Promise<UserAccount>;
    deleteUser(id: string): Promise<void>;
    getSiteConfig(): Promise<SiteConfig>;
    saveSiteHome(home: SiteHomeConfig): Promise<void>;
    saveSiteEmpresa(empresa: SiteEmpresaConfig): Promise<void>;
    saveSitePlanos(planos: SitePlanoConfig[]): Promise<void>;
    saveSiteMidia(midia: SiteMidiaConfig): Promise<void>;
    saveSiteContato(contato: SiteContatoConfig): Promise<void>;
    saveAllSiteConfig(config: SiteConfig): Promise<void>;
  };
}

// --- STANDALONE SITE CONFIGURATIONS (MASTER ADMIN - SITE PRINCIPAL) ---
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const local = localStorage.getItem(KEYS.SITE_CONFIG);
    let baseConfig: SiteConfig = local ? JSON.parse(local) : JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));

    const docNames = ['home', 'empresa', 'planos', 'midia', 'contato'];
    const docSnaps = await Promise.allSettled(
      docNames.map(dName => safeFirestoreGetDoc(doc(firestoreDb, 'site_config', dName)))
    );

    docSnaps.forEach((res, idx) => {
      if (res.status === 'fulfilled' && res.value && typeof res.value.exists === 'function' && res.value.exists()) {
        const data = res.value.data();
        const key = docNames[idx] as keyof SiteConfig;
        if (key === 'planos' && data && data.items) {
          baseConfig.planos = data.items;
        } else if (data) {
          (baseConfig as any)[key] = { ...baseConfig[key], ...data };
        }
      }
    });

    localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(baseConfig));
    return baseConfig;
  } catch (err) {
    console.warn('Using local site_config fallback:', err);
    const local = localStorage.getItem(KEYS.SITE_CONFIG);
    return local ? JSON.parse(local) : JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
  }
}

export async function saveSiteHome(home: SiteHomeConfig): Promise<void> {
  const config = await getSiteConfig();
  config.home = home;
  localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(config));
  await safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'home'), home);
}

export async function saveSiteEmpresa(empresa: SiteEmpresaConfig): Promise<void> {
  const config = await getSiteConfig();
  config.empresa = empresa;
  localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(config));
  await safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'empresa'), empresa);
}

export async function saveSitePlanos(planos: SitePlanoConfig[]): Promise<void> {
  const config = await getSiteConfig();
  config.planos = planos;
  localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(config));
  await safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'planos'), { items: planos });
}

export async function saveSiteMidia(midia: SiteMidiaConfig): Promise<void> {
  const config = await getSiteConfig();
  config.midia = midia;
  localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(config));
  await safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'midia'), midia);
}

export async function saveSiteContato(contato: SiteContatoConfig): Promise<void> {
  const config = await getSiteConfig();
  config.contato = contato;
  localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(config));
  await safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'contato'), contato);
}

export async function saveAllSiteConfig(config: SiteConfig): Promise<void> {
  localStorage.setItem(KEYS.SITE_CONFIG, JSON.stringify(config));
  await Promise.all([
    safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'home'), config.home),
    safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'empresa'), config.empresa),
    safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'planos'), { items: config.planos }),
    safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'midia'), config.midia),
    safeFirestoreSetDoc(doc(firestoreDb, 'site_config', 'contato'), config.contato)
  ]);
}

export const firebaseService: FirebaseService = {
  // --- AUTH SERVICE ---
  auth: {
    getCurrentUser(): UserAccount | null {
      try {
        // 1. Try active tab session in sessionStorage
        const tabSession = sessionStorage.getItem('gestrh_tab_session');
        if (tabSession) {
          return JSON.parse(tabSession);
        }
        // 2. Try device session in localStorage for this specific deviceId
        const deviceSession = localStorage.getItem(getDeviceSessionKey());
        if (deviceSession) {
          const user = JSON.parse(deviceSession);
          // Restore tab session for fast access
          sessionStorage.setItem('gestrh_tab_session', JSON.stringify(user));
          return user;
        }
      } catch (e) {
        console.error('Error getting current user session:', e);
      }
      return null;
    },

    signIn(email: string, password?: string): Promise<UserAccount> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const users: UserAccount[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
          const normalizedEmail = email.trim().toLowerCase();
          const found = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
          
          if (!found) {
            reject(new Error('E-mail não cadastrado. Verifique ou registre uma nova conta corporativa.'));
            return;
          }

          if (found.status === 'Bloqueado') {
            reject(new Error('Sua conta ou empresa está bloqueada pelo administrador.'));
            return;
          }

          // Verificação opcional de senha para compatibilidade de testes/acesso rápido
          if (found.password && password !== undefined) {
            if (found.password !== password) {
              reject(new Error('Senha incorreta. Por favor, tente novamente.'));
              return;
            }
          }

          // If user belongs to a company, make sure company is active
          if (found.companyId) {
            const companies: SaaSCompany[] = JSON.parse(localStorage.getItem(KEYS.COMPANIES) || '[]');
            const company = companies.find(c => c.id === found.companyId);
            if (company && company.status === 'Bloqueado') {
              reject(new Error('O acesso para esta empresa está temporariamente suspenso/bloqueado.'));
              return;
            }
          }

          // Store session isolated strictly to this tab and this device instance
          sessionStorage.setItem('gestrh_tab_session', JSON.stringify(found));
          localStorage.setItem(getDeviceSessionKey(), JSON.stringify(found));

          resolve(found);
        }, 600);
      });
    },

    signUp(email: string, name: string, role: UserRole, companyId?: string, employeeId?: string, password?: string): Promise<UserAccount> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const users: UserAccount[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
          const normalizedEmail = email.trim().toLowerCase();
          
          if (users.some(u => u.email.trim().toLowerCase() === normalizedEmail)) {
            reject(new Error('Este endereço de e-mail já está sendo utilizado.'));
            return;
          }

          const newUser: UserAccount = {
            id: `usr-${Date.now()}`,
            email: email.trim(),
            name,
            role,
            companyId,
            employeeId,
            status: 'Ativo',
            password
          };

          users.push(newUser);
          localStorage.setItem(KEYS.USERS, JSON.stringify(users));
          
          // Auto log in on sign up with isolated session
          sessionStorage.setItem('gestrh_tab_session', JSON.stringify(newUser));
          localStorage.setItem(getDeviceSessionKey(), JSON.stringify(newUser));

          resolve(newUser);
        }, 800);
      });
    },

    signOut(): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Remove session ONLY for this current tab and device instance
          sessionStorage.removeItem('gestrh_tab_session');
          localStorage.removeItem(getDeviceSessionKey());
          resolve();
        }, 300);
      });
    }
  },

  // --- FIRESTORE SERVICE (MULTI-COMPANY FILTERED) ---
  db: {
    // --- GENERIC QUERIES ---
    getCollection<T>(collectionKey: keyof typeof KEYS, companyId?: string): Promise<T[]> {
      return new Promise((resolve) => {
        setTimeout(() => {
          const itemsRaw = localStorage.getItem(KEYS[collectionKey]);
          let items: any[] = itemsRaw ? JSON.parse(itemsRaw) : [];

          // Filter by companyId if specified and items support it
          if (companyId) {
            // Settings has a unique structure (map of companyId -> settings object)
            if (collectionKey === 'SETTINGS') {
              const settingsMap = itemsRaw ? JSON.parse(itemsRaw) : {};
              const companySettings = settingsMap[companyId] || {
                ...INITIAL_SETTINGS,
                companyName: 'Minha Empresa SaaS'
              };
              resolve([companySettings] as any);
              return;
            }
            
            items = items.filter(item => item.companyId === companyId);
          }

          resolve(items as T[]);
        }, 200);
      });
    },

    saveDoc<T>(
      collectionKey: keyof typeof KEYS, 
      data: T, 
      companyId?: string
    ): Promise<T> {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Special logic for settings
          if (collectionKey === 'SETTINGS') {
            const settingsMap = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
            const targetCompanyId = companyId || (data as any).companyId || 'company-1';
            settingsMap[targetCompanyId] = { ...data, companyId: targetCompanyId };
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settingsMap));
            resolve({ ...data, companyId: targetCompanyId } as T);
            return;
          }

          const itemsRaw = localStorage.getItem(KEYS[collectionKey]);
          const items: any[] = itemsRaw ? JSON.parse(itemsRaw) : [];

          const id = (data as any).id || `${collectionKey.toLowerCase()}-${Date.now()}`;
          const finalItem = {
            ...data,
            id,
            ...(companyId ? { companyId } : {})
          };

          const index = items.findIndex(item => item.id === id);
          if (index >= 0) {
            items[index] = finalItem;
          } else {
            items.push(finalItem);
          }

          localStorage.setItem(KEYS[collectionKey], JSON.stringify(items));
          resolve(finalItem as unknown as T);
        }, 300);
      });
    },

    deleteDoc(collectionKey: keyof typeof KEYS, id: string): Promise<void> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Prevent deleting Master or crucial defaults
          if (collectionKey === 'USERS' && id === 'user-master') {
            reject(new Error('Não é possível excluir o usuário Master administrador.'));
            return;
          }

          const itemsRaw = localStorage.getItem(KEYS[collectionKey]);
          let items: any[] = itemsRaw ? JSON.parse(itemsRaw) : [];

          items = items.filter(item => item.id !== id);
          localStorage.setItem(KEYS[collectionKey], JSON.stringify(items));
          resolve();
        }, 250);
      });
    },

    // --- BINDING EXPLICIT OPERATIONS FOR SIMPLICITY ---
    getModules(): Promise<SaaSModule[]> { return firebaseService.db.getCollection<SaaSModule>('MODULES'); },
    saveModule(module: SaaSModule): Promise<SaaSModule> { return firebaseService.db.saveDoc<SaaSModule>('MODULES', module); },
    deleteModule(id: string): Promise<void> { return firebaseService.db.deleteDoc('MODULES', id); },

    getProducts(): Promise<SaaSProduct[]> { return firebaseService.db.getCollection<SaaSProduct>('PRODUCTS'); },
    saveProduct(product: SaaSProduct): Promise<SaaSProduct> { return firebaseService.db.saveDoc<SaaSProduct>('PRODUCTS', product); },
    deleteProduct(id: string): Promise<void> { return firebaseService.db.deleteDoc('PRODUCTS', id); },

    getPlans(): Promise<SaaSPlan[]> { return firebaseService.db.getCollection<SaaSPlan>('PLANS'); },
    savePlan(plan: SaaSPlan): Promise<SaaSPlan> { return firebaseService.db.saveDoc<SaaSPlan>('PLANS', plan); },
    deletePlan(id: string): Promise<void> { return firebaseService.db.deleteDoc('PLANS', id); },

    getCompanies(): Promise<SaaSCompany[]> { return firebaseService.db.getCollection<SaaSCompany>('COMPANIES'); },
    saveCompany(company: SaaSCompany): Promise<SaaSCompany> { return firebaseService.db.saveDoc<SaaSCompany>('COMPANIES', company); },
    deleteCompany(id: string): Promise<void> { return firebaseService.db.deleteDoc('COMPANIES', id); },

    getUsers(): Promise<UserAccount[]> { return firebaseService.db.getCollection<UserAccount>('USERS'); },
    saveUser(user: UserAccount): Promise<UserAccount> { return firebaseService.db.saveDoc<UserAccount>('USERS', user); },
    deleteUser(id: string): Promise<void> { return firebaseService.db.deleteDoc('USERS', id); },

    // --- SITE CONFIGURATIONS (MASTER ADMIN - SITE PRINCIPAL) ---
    getSiteConfig(): Promise<SiteConfig> {
      return getSiteConfig();
    },

    saveSiteHome(home: SiteHomeConfig): Promise<void> {
      return saveSiteHome(home);
    },

    saveSiteEmpresa(empresa: SiteEmpresaConfig): Promise<void> {
      return saveSiteEmpresa(empresa);
    },

    saveSitePlanos(planos: SitePlanoConfig[]): Promise<void> {
      return saveSitePlanos(planos);
    },

    saveSiteMidia(midia: SiteMidiaConfig): Promise<void> {
      return saveSiteMidia(midia);
    },

    saveSiteContato(contato: SiteContatoConfig): Promise<void> {
      return saveSiteContato(contato);
    },

    saveAllSiteConfig(config: SiteConfig): Promise<void> {
      return saveAllSiteConfig(config);
    }

  }
};
