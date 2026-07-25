/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { firestoreDb } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface GlobalDesignSystemConfig {
  id: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  
  // Branding & General
  systemName: string;
  logoUrl?: string;
  faviconUrl?: string;

  // Color Palette
  primaryColor: string;      // e.g. '#059669' (Emerald) or '#2563eb'
  secondaryColor: string;    // e.g. '#0f172a'
  accentColor: string;       // e.g. '#f59e0b'
  backgroundColorLight: string; // e.g. '#f8fafc'
  backgroundColorDark: string;  // e.g. '#0b0f19'
  textColorLight: string;    // e.g. '#0f172a'
  textColorDark: string;     // e.g. '#f8fafc'
  themeMode: 'light' | 'dark' | 'auto';

  // Typography
  fontFamily: 'Plus Jakarta Sans' | 'Inter' | 'Playfair Display' | 'Montserrat' | 'Roboto' | 'JetBrains Mono';
  fontSizeBase: number;      // e.g. 14
  headingFontFamily?: string;

  // Component UI Rules
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  buttonStyle: 'flat' | 'gradient' | 'shadow' | 'glass';
  cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  headerBgColor?: string;
  sidebarBgColor?: string;
  sidebarTextColor?: string;

  // Custom Pages
  customPages: CustomVisualPage[];

  // Global Components Library Overrides
  globalComponentStyles: Record<string, ComponentStyleOverride>;
}

export interface CustomVisualPage {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  isInitialPage?: boolean;
  visible: boolean;
  order: number;
  submenus?: { id: string; title: string; slug: string; iconName: string }[];
  blocks: VisualBuilderBlock[];
}

export interface ComponentStyleOverride {
  componentId: string;
  componentType: string;
  customText?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  shadow?: string;
  visible?: boolean;
}

export interface VisualBuilderBlock {
  id: string;
  type: 
    | 'button' | 'card' | 'table' | 'form' | 'kpi' | 'chart' | 'calendar' 
    | 'timeline' | 'kanban' | 'widget' | 'upload' | 'text' | 'title' | 'image' 
    | 'banner' | 'input' | 'select' | 'checkbox' | 'switch' | 'avatar' 
    | 'menu' | 'sidebar' | 'header' | 'footer' | 'divisor' | 'tabs' 
    | 'accordion' | 'mapa' | 'chat' | 'video' | 'html' | 'iframe' | 'widget_ia' | 'list' | 'ponto';
  title: string;
  subtitle?: string;
  content?: string;
  iconName?: string;
  size: 'full' | 'half' | 'third' | 'quarter' | 'two-thirds';
  order: number;
  isLocked?: boolean;
  hidden?: boolean;
  permissionLevel?: '1_design' | '2_layout' | '3_developer';
  style?: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    alignment?: 'left' | 'center' | 'right';
    shadow?: string;
    width?: string;
    height?: string;
    borderWidth?: string;
    animation?: string;
    responsiveDesktop?: boolean;
    responsiveMobile?: boolean;
  };
}

export interface DesignerVersionHistory {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  summary: string;
  config: GlobalDesignSystemConfig;
}

export interface AiDesignerLog {
  id: string;
  timestamp: string;
  user: string;
  command: string;
  pageId: string;
  pageTitle: string;
  status: 'applied' | 'rejected' | 'blocked';
  summary: string;
}

export interface CustomFieldDefinition {
  id: string;
  targetModule: 'funcionarios' | 'recrutamento' | 'ponto' | 'folha' | 'ferias' | 'beneficios' | 'geral';
  label: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
}

export interface ClientModel {
  id: string;
  companyId?: string;
  companyName: string;
  modelName: string;
  planTier: 'basico' | 'profissional' | 'premium';
  createdAt: string;
  updatedAt: string;
  
  branding: {
    logoUrl?: string;
    systemName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    themeMode: 'light' | 'dark' | 'auto';
    fontFamily: string;
    faviconUrl?: string;
  };

  activeModules: {
    funcionarios: boolean;
    ponto: boolean;
    recrutamento: boolean;
    bancoTalentos: boolean;
    entrevistaIa: boolean;
    documentos: boolean;
    ferias: boolean;
    beneficios: boolean;
    treinamentos: boolean;
    folha: boolean;
    relatorios: boolean;
    chatIa: boolean;
  };

  customPages: CustomVisualPage[];
  customFields: CustomFieldDefinition[];
}

const STORAGE_KEY = 'gestrh_global_design_system_v2';
const HISTORY_KEY = 'gestrh_global_designer_history_v2';
const AI_LOGS_KEY = 'gestrh_builder_ai_logs_v1';
const CLIENT_MODELS_KEY = 'gestrh_client_models_v1';

export const DEFAULT_CLIENT_MODELS: ClientModel[] = [
  {
    id: 'model-logistica',
    companyName: 'Transportadora ABC',
    modelName: 'RH Logística & Frota',
    planTier: 'profissional',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branding: {
      systemName: 'GestRH Logística',
      primaryColor: '#0284c7', // Sky blue
      secondaryColor: '#0f172a',
      accentColor: '#f59e0b',
      themeMode: 'dark',
      fontFamily: 'Plus Jakarta Sans'
    },
    activeModules: {
      funcionarios: true,
      ponto: true,
      recrutamento: true,
      bancoTalentos: true,
      entrevistaIa: false,
      documentos: true,
      ferias: true,
      beneficios: false,
      treinamentos: false,
      folha: true,
      relatorios: true,
      chatIa: true
    },
    customPages: [],
    customFields: [
      { id: 'cf-1', targetModule: 'funcionarios', label: 'Número da Frota', fieldName: 'numero_frota', fieldType: 'text', required: true },
      { id: 'cf-2', targetModule: 'funcionarios', label: 'Centro de Custo', fieldName: 'centro_custo', fieldType: 'select', options: ['Operacional', 'Logística', 'Administrativo'], required: true },
      { id: 'cf-3', targetModule: 'funcionarios', label: 'Escala de Trabalho', fieldName: 'escala', fieldType: 'select', options: ['12x36', '6x1', '5x2'], required: false },
      { id: 'cf-4', targetModule: 'funcionarios', label: 'Supervisor Direto', fieldName: 'supervisor', fieldType: 'text', required: false }
    ]
  },
  {
    id: 'model-industria',
    companyName: 'Indústrias Metalúrgicas',
    modelName: 'RH Indústria & Manufatura',
    planTier: 'premium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branding: {
      systemName: 'GestRH Indústria',
      primaryColor: '#1e3a8a', // Dark Navy
      secondaryColor: '#0284c7',
      accentColor: '#10b981',
      themeMode: 'dark',
      fontFamily: 'Inter'
    },
    activeModules: {
      funcionarios: true,
      ponto: true,
      recrutamento: true,
      bancoTalentos: true,
      entrevistaIa: true,
      documentos: true,
      ferias: true,
      beneficios: true,
      treinamentos: true,
      folha: true,
      relatorios: true,
      chatIa: true
    },
    customPages: [],
    customFields: [
      { id: 'cf-5', targetModule: 'funcionarios', label: 'Linha de Produção', fieldName: 'linha_producao', fieldType: 'text', required: true },
      { id: 'cf-6', targetModule: 'funcionarios', label: 'Turno de Trabalho', fieldName: 'turno', fieldType: 'select', options: ['Manhã', 'Tarde', 'Noite', 'Rodízio'], required: true }
    ]
  },
  {
    id: 'model-compact',
    companyName: 'Empresa Pequena Ltda',
    modelName: 'GestRH Compact Simplificado',
    planTier: 'basico',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branding: {
      systemName: 'GestRH Compact',
      primaryColor: '#059669', // Emerald
      secondaryColor: '#0f172a',
      accentColor: '#3b82f6',
      themeMode: 'auto',
      fontFamily: 'Plus Jakarta Sans'
    },
    activeModules: {
      funcionarios: true,
      ponto: false,
      recrutamento: false,
      bancoTalentos: false,
      entrevistaIa: false,
      documentos: true,
      ferias: true,
      beneficios: false,
      treinamentos: false,
      folha: false,
      relatorios: true,
      chatIa: false
    },
    customPages: [],
    customFields: [
      { id: 'cf-7', targetModule: 'funcionarios', label: 'Observação Interna', fieldName: 'obs_interna', fieldType: 'text', required: false }
    ]
  }
];

export const DEFAULT_GLOBAL_DESIGN: GlobalDesignSystemConfig = {
  id: 'global_master_designer',
  updatedAt: new Date().toISOString(),
  updatedBy: 'MASTER',
  version: 1,
  systemName: 'GestRH Ecosystem',
  logoUrl: '',
  primaryColor: '#059669',
  secondaryColor: '#0f172a',
  accentColor: '#f59e0b',
  backgroundColorLight: '#f8fafc',
  backgroundColorDark: '#0b0f19',
  textColorLight: '#0f172a',
  textColorDark: '#f8fafc',
  themeMode: 'light',
  fontFamily: 'Plus Jakarta Sans',
  fontSizeBase: 14,
  borderRadius: 'xl',
  buttonStyle: 'shadow',
  cardShadow: 'md',
  headerBgColor: '#ffffff',
  sidebarBgColor: '#0f172a',
  sidebarTextColor: '#f8fafc',
  customPages: [
    {
      id: 'page-dashboard',
      title: 'Dashboard Executivo',
      slug: 'dashboard',
      iconName: 'LayoutDashboard',
      isInitialPage: true,
      visible: true,
      order: 1,
      blocks: [
        { id: 'b-1', type: 'kpi', title: 'Total de Colaboradores', subtitle: 'Ativos no sistema', size: 'third', order: 1, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: 'b-2', type: 'kpi', title: 'Presença no Ponto Hoje', subtitle: 'Registros validados', size: 'third', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: 'b-3', type: 'kpi', title: 'Processos Seletivos (ATS)', subtitle: 'Vagas em andamento', size: 'third', order: 3, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: 'b-4', type: 'banner', title: 'Comunicado Oficial da Diretoria', subtitle: 'Aviso importante sobre novos benefícios de 2026', size: 'full', order: 4, style: { bgColor: '#fef3c7', textColor: '#78350f', borderRadius: '16px' } },
        { id: 'b-5', type: 'chart', title: 'Headcount por Departamento', subtitle: 'Distribuição atual da equipe', size: 'half', order: 5, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: 'b-6', type: 'table', title: 'Próximos Aniversariantes', subtitle: 'Engajamento e cultura', size: 'half', order: 6, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
      ]
    },
    // RH Group
    { id: 'page-rh-emp', title: 'RH - Funcionários', slug: 'rh/funcionarios', iconName: 'Users', visible: true, order: 2, blocks: [{ id: 'b-rh-1', type: 'table', title: 'Gestão de Funcionários', subtitle: 'Lista geral de ativos', size: 'full', order: 1 }] },
    { id: 'page-rh-cad', title: 'RH - Cadastro', slug: 'rh/cadastro', iconName: 'UserPlus', visible: true, order: 3, blocks: [{ id: 'b-rh-2', type: 'form', title: 'Formulário de Cadastro RH', subtitle: 'Novos colaboradores', size: 'full', order: 1 }] },
    { id: 'page-rh-ponto', title: 'RH - Ponto Eletrônico', slug: 'rh/ponto', iconName: 'Clock', visible: true, order: 4, blocks: [{ id: 'b-rh-3', type: 'calendar', title: 'Espelho de Ponto Diário', subtitle: 'Marcações e horas extras', size: 'full', order: 1 }] },
    { id: 'page-rh-ben', title: 'RH - Benefícios', slug: 'rh/beneficios', iconName: 'Award', visible: true, order: 5, blocks: [{ id: 'b-rh-4', type: 'card', title: 'Gestão de Vale Transporte / Refeição', subtitle: 'Saldos e recargas', size: 'full', order: 1 }] },
    { id: 'page-rh-hol', title: 'RH - Holerites', slug: 'rh/holerites', iconName: 'FileCheck', visible: true, order: 6, blocks: [{ id: 'b-rh-5', type: 'table', title: 'Holerites & Envio eSocial', subtitle: 'Comprovantes de pagamento', size: 'full', order: 1 }] },
    { id: 'page-rh-ferias', title: 'RH - Férias', slug: 'rh/ferias', iconName: 'Calendar', visible: true, order: 7, blocks: [{ id: 'b-rh-6', type: 'timeline', title: 'Escala de Férias do Time', subtitle: 'Períodos aquisitivos', size: 'full', order: 1 }] },

    // Recrutamento Group
    { id: 'page-rec-vagas', title: 'Recrutamento - Portal de Vagas', slug: 'recrutamento/portal', iconName: 'Globe', visible: true, order: 8, blocks: [{ id: 'b-rec-1', type: 'card', title: 'Portal de Carreiras Público', subtitle: 'Oportunidades em aberto', size: 'full', order: 1 }] },
    { id: 'page-rec-talentos', title: 'Recrutamento - Banco de Talentos', slug: 'recrutamento/talentos', iconName: 'Users', visible: true, order: 9, blocks: [{ id: 'b-rec-2', type: 'table', title: 'Banco de Currículos', subtitle: 'Perfis pré-qualificados', size: 'full', order: 1 }] },
    { id: 'page-rec-ats', title: 'Recrutamento - ATS Funil', slug: 'recrutamento/ats', iconName: 'Kanban', visible: true, order: 10, blocks: [{ id: 'b-rec-3', type: 'kanban', title: 'Funil Recrutamento & Seleção', subtitle: 'Triagem -> Entrevista -> Proposta', size: 'full', order: 1 }] },
    { id: 'page-rec-ia', title: 'Recrutamento - Entrevistas IA', slug: 'recrutamento/entrevistas-ia', iconName: 'Sparkles', visible: true, order: 11, blocks: [{ id: 'b-rec-4', type: 'widget_ia', title: 'Entrevistador Virtual IA', subtitle: 'Avaliação automatizada por áudio e vídeo', size: 'full', order: 1 }] },

    // CRM Group
    { id: 'page-crm-emp', title: 'CRM - Empresas', slug: 'crm/empresas', iconName: 'Building2', visible: true, order: 12, blocks: [{ id: 'b-crm-1', type: 'table', title: 'Empresas & CNPJs Atendidos', subtitle: 'Gestão B2B', size: 'full', order: 1 }] },
    { id: 'page-crm-cli', title: 'CRM - Clientes', slug: 'crm/clientes', iconName: 'Briefcase', visible: true, order: 13, blocks: [{ id: 'b-crm-2', type: 'table', title: 'Carteira de Clientes', subtitle: 'Contratos e SLAs', size: 'full', order: 1 }] },
    { id: 'page-crm-cons', title: 'CRM - Consultores', slug: 'crm/consultores', iconName: 'Users', visible: true, order: 14, blocks: [{ id: 'b-crm-3', type: 'card', title: 'Equipe de Consultoria Externa', subtitle: 'Alocação por projeto', size: 'full', order: 1 }] },

    // Financeiro Group
    { id: 'page-fin-planos', title: 'Financeiro - Planos', slug: 'financeiro/planos', iconName: 'DollarSign', visible: true, order: 15, blocks: [{ id: 'b-fin-1', type: 'card', title: 'Planos de Assinatura GestRH', subtitle: 'Starter, Pro e Enterprise', size: 'full', order: 1 }] },
    { id: 'page-fin-cobran', title: 'Financeiro - Cobranças', slug: 'financeiro/cobrancas', iconName: 'DollarSign', visible: true, order: 16, blocks: [{ id: 'b-fin-2', type: 'table', title: 'Histórico de Faturamento', subtitle: 'Boletos e Pix Recorrente', size: 'full', order: 1 }] },
    { id: 'page-fin-assin', title: 'Financeiro - Assinaturas', slug: 'financeiro/assinaturas', iconName: 'CheckCircle2', visible: true, order: 17, blocks: [{ id: 'b-fin-3', type: 'card', title: 'Status de Assinaturas SaaS', subtitle: 'MRR e Métricas Globais', size: 'full', order: 1 }] },

    // Relatórios & Chat IA
    { id: 'page-reports', title: 'Relatórios & Analytics', slug: 'relatorios', iconName: 'BarChart3', visible: true, order: 18, blocks: [{ id: 'b-rep-1', type: 'chart', title: 'Relatórios Gerenciais', subtitle: 'Métricas de Headcount, Turnover e Custos', size: 'full', order: 1 }] },
    { id: 'page-chat-ia', title: 'Assistente IA de RH', slug: 'chat-ia', iconName: 'Sparkles', visible: true, order: 19, blocks: [{ id: 'b-chat-1', type: 'widget_ia', title: 'Assistente Virtual com IA', subtitle: 'Tire dúvidas sobre CLT, políticas e comunicados', size: 'full', order: 1 }] },

    // Configurações
    { id: 'page-config', title: 'Configurações do Sistema', slug: 'configuracoes', iconName: 'Settings', visible: true, order: 20, blocks: [{ id: 'b-cfg-1', type: 'form', title: 'Parâmetros Globais & Integrações', subtitle: 'Configurações de segurança e API', size: 'full', order: 1 }] },

    // Site Institucional
    { id: 'page-site-home', title: 'Site - Home Page', slug: 'site/home', iconName: 'Globe', visible: true, order: 21, blocks: [{ id: 'b-site-1', type: 'banner', title: 'GestRH — A Plataforma Completa de RH com IA', subtitle: 'Transforme a gestão de pessoas da sua empresa', size: 'full', order: 1 }] },
    { id: 'page-site-login', title: 'Site - Login', slug: 'site/login', iconName: 'Lock', visible: true, order: 22, blocks: [{ id: 'b-site-2', type: 'form', title: 'Portal de Acesso Seguro', subtitle: 'Insira seu e-mail e senha', size: 'half', order: 1 }] },
    { id: 'page-site-cad', title: 'Site - Cadastro', slug: 'site/cadastro', iconName: 'UserPlus', visible: true, order: 23, blocks: [{ id: 'b-site-3', type: 'form', title: 'Teste Grátis por 14 dias', subtitle: 'Sem necessidade de cartão de crédito', size: 'half', order: 1 }] },
    { id: 'page-site-sobre', title: 'Site - Sobre Nós', slug: 'site/sobre', iconName: 'FileText', visible: true, order: 24, blocks: [{ id: 'b-site-4', type: 'text', title: 'Nossa Missão & Valores', subtitle: 'Conectando tecnologia e pessoas desde 2024', size: 'full', order: 1 }] },
    { id: 'page-site-contato', title: 'Site - Contato', slug: 'site/contato', iconName: 'Chat', visible: true, order: 25, blocks: [{ id: 'b-site-5', type: 'form', title: 'Fale com Nossos Especialistas', subtitle: 'Atendimento corporativo', size: 'full', order: 1 }] }
  ],
  globalComponentStyles: {}
};

export const visualBuilderService = {
  async loadGlobalConfig(): Promise<GlobalDesignSystemConfig> {
    try {
      // 1. Try Firestore first
      const snap = await getDoc(doc(firestoreDb, 'SYSTEM_DESIGNER', 'global_master_designer'));
      if (snap.exists()) {
        const data = snap.data() as GlobalDesignSystemConfig;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Firestore load failed for global design system, falling back to localStorage:', e);
    }

    try {
      // 2. Fallback to localStorage
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.error('Error reading localStorage for global designer:', e);
    }

    return DEFAULT_GLOBAL_DESIGN;
  },

  async saveGlobalConfig(config: GlobalDesignSystemConfig, updatedBy: string = 'MASTER', summary: string = 'Atualização visual do sistema'): Promise<GlobalDesignSystemConfig> {
    const newVersion = (config.version || 1) + 1;
    const updatedConfig: GlobalDesignSystemConfig = {
      ...config,
      version: newVersion,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));

    // Save history snapshot
    this.addHistoryEntry({
      id: 'hist-' + Date.now(),
      version: newVersion,
      updatedAt: new Date().toISOString(),
      updatedBy,
      summary,
      config: JSON.parse(JSON.stringify(updatedConfig))
    });

    // Save to Firestore asynchronously
    try {
      await setDoc(doc(firestoreDb, 'SYSTEM_DESIGNER', 'global_master_designer'), updatedConfig);
    } catch (e) {
      console.error('Error saving global designer config to Firestore:', e);
    }

    // Apply global CSS rules dynamically to document
    this.applyGlobalStylesToDOM(updatedConfig);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gestrh_global_designer_changed', { detail: updatedConfig }));
    }

    return updatedConfig;
  },

  addHistoryEntry(entry: DesignerVersionHistory) {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      const historyList: DesignerVersionHistory[] = stored ? JSON.parse(stored) : [];
      historyList.unshift(entry);
      // Keep last 30 history versions
      if (historyList.length > 30) historyList.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList));
    } catch (e) {
      console.error('Error adding history entry:', e);
    }
  },

  getHistory(): DesignerVersionHistory[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading history:', e);
    }
    return [];
  },

  addAiLog(entry: AiDesignerLog) {
    try {
      const stored = localStorage.getItem(AI_LOGS_KEY);
      const logs: AiDesignerLog[] = stored ? JSON.parse(stored) : [];
      logs.unshift(entry);
      if (logs.length > 50) logs.pop();
      localStorage.setItem(AI_LOGS_KEY, JSON.stringify(logs));

      // Asynchronously save log to Firestore
      setDoc(doc(firestoreDb, 'SYSTEM_DESIGNER_AI_LOGS', entry.id), entry).catch(err => {
        console.warn('Firestore AI log save ignored:', err);
      });
    } catch (e) {
      console.error('Error saving AI log:', e);
    }
  },

  getAiLogs(): AiDesignerLog[] {
    try {
      const stored = localStorage.getItem(AI_LOGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading AI logs:', e);
    }
    return [];
  },

  applyGlobalStylesToDOM(config: GlobalDesignSystemConfig) {
    if (typeof document === 'undefined') return;

    let styleTag = document.getElementById('gestrh-global-designer-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'gestrh-global-designer-styles';
      document.head.appendChild(styleTag);
    }

    const radiusPx = {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      '2xl': '24px',
      full: '9999px'
    }[config.borderRadius] || '16px';

    const shadowCss = {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    }[config.cardShadow] || '0 4px 6px -1px rgb(0 0 0 / 0.1)';

    styleTag.innerHTML = `
      :root {
        --primary-color: ${config.primaryColor};
        --secondary-color: ${config.secondaryColor};
        --accent-color: ${config.accentColor};
        --font-family-base: '${config.fontFamily}', sans-serif;
        --border-radius-global: ${radiusPx};
        --card-shadow-global: ${shadowCss};
      }

      body {
        font-family: var(--font-family-base);
      }
    `;
  },

  // --- CLIENT MODELS MANAGEMENT (PROMPT 05) ---
  getClientModels(): ClientModel[] {
    try {
      const stored = localStorage.getItem(CLIENT_MODELS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading client models from localStorage:', e);
    }
    // Return default models if empty
    localStorage.setItem(CLIENT_MODELS_KEY, JSON.stringify(DEFAULT_CLIENT_MODELS));
    return DEFAULT_CLIENT_MODELS;
  },

  async saveClientModel(model: ClientModel): Promise<ClientModel[]> {
    const currentList = this.getClientModels();
    const index = currentList.findIndex(m => m.id === model.id);
    const updatedModel: ClientModel = {
      ...model,
      updatedAt: new Date().toISOString()
    };

    let newList: ClientModel[];
    if (index >= 0) {
      newList = [...currentList];
      newList[index] = updatedModel;
    } else {
      newList = [updatedModel, ...currentList];
    }

    localStorage.setItem(CLIENT_MODELS_KEY, JSON.stringify(newList));

    // Save to Firestore asynchronously under CLIENTS_MODELS collection
    try {
      await setDoc(doc(firestoreDb, 'CLIENTS_MODELS', updatedModel.id), updatedModel);
    } catch (e) {
      console.error('Error saving client model to Firestore:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gestrh_client_models_changed', { detail: newList }));
    }

    return newList;
  },

  async deleteClientModel(id: string): Promise<ClientModel[]> {
    const currentList = this.getClientModels();
    const newList = currentList.filter(m => m.id !== id);
    localStorage.setItem(CLIENT_MODELS_KEY, JSON.stringify(newList));
    return newList;
  },

  async duplicateClientModel(id: string): Promise<{ list: ClientModel[]; newModel: ClientModel }> {
    const currentList = this.getClientModels();
    const source = currentList.find(m => m.id === id);
    if (!source) throw new Error('Modelo de origem não encontrado.');

    const newModel: ClientModel = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'model-' + Date.now(),
      modelName: `${source.modelName} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newList = [newModel, ...currentList];
    localStorage.setItem(CLIENT_MODELS_KEY, JSON.stringify(newList));

    try {
      await setDoc(doc(firestoreDb, 'CLIENTS_MODELS', newModel.id), newModel);
    } catch (e) {
      console.error('Error duplicating client model in Firestore:', e);
    }

    return { list: newList, newModel };
  },

  async restoreClientModelToDefault(id: string): Promise<ClientModel[]> {
    const defaultSource = DEFAULT_CLIENT_MODELS.find(m => m.id === id);
    if (!defaultSource) return this.getClientModels();

    return this.saveClientModel(JSON.parse(JSON.stringify(defaultSource)));
  }
};
