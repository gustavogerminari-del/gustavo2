/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { firestoreDb } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface MenuItemCustomization {
  id: string;
  originalLabel: string;
  customLabel: string;
  iconName: string;
  order: number;
  visible: boolean;
  enabled: boolean;
}

export interface DashboardComponentConfig {
  id: string;
  type: 'card' | 'chart' | 'table' | 'button' | 'banner';
  title: string;
  subtitle?: string;
  size: 'full' | 'half' | 'third' | 'two-thirds';
  order: number;
  visible: boolean;
  metricType?: string;
}

export interface CustomFieldConfig {
  id: string;
  category: 'Geral' | 'Transportadora' | 'Indústria' | 'Documentação' | 'Segurança & EPI' | 'Outros';
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface RecruitmentStageConfig {
  id: string;
  name: string;
  color: string; // e.g. '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'
  order: number;
}

export interface CompanyLayoutConfig {
  companyId: string;
  companyName: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  identity: {
    displayName: string;
    logoUrl?: string;
    primaryColor: string; // Hex color
    secondaryColor: string;
    themeMode: 'light' | 'dark' | 'auto';
    backgroundImage?: string;
  };
  menus: MenuItemCustomization[];
  dashboardComponents: DashboardComponentConfig[];
  customFields: CustomFieldConfig[];
  recruitmentStages: RecruitmentStageConfig[];
}

export interface LayoutVersionHistory {
  id: string;
  companyId: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  changeSummary: string;
  snapshot: CompanyLayoutConfig;
}

export interface LayoutChangeRequest {
  id: string;
  companyId: string;
  companyName: string;
  requestedBy: string;
  requestedAt: string;
  description: string;
  status: 'Pendente' | 'Atendido' | 'Recusado';
}

const STORAGE_KEYS = {
  LAYOUTS: 'gestrh_company_layouts_v1',
  HISTORY: 'gestrh_company_layout_history_v1',
  REQUESTS: 'gestrh_layout_change_requests_v1'
};

// Default system menu template
export const DEFAULT_MENUS: MenuItemCustomization[] = [
  { id: 'dashboard', originalLabel: 'Dashboard', customLabel: 'Dashboard', iconName: 'LayoutDashboard', order: 1, visible: true, enabled: true },
  { id: 'funcionarios', originalLabel: 'Funcionários', customLabel: 'Funcionários', iconName: 'Users', order: 2, visible: true, enabled: true },
  { id: 'recrutamento', originalLabel: 'Recrutamento', customLabel: 'Recrutamento & Seleção', iconName: 'Briefcase', order: 3, visible: true, enabled: true },
  { id: 'ponto', originalLabel: 'Controle de Ponto', customLabel: 'Controle de Ponto', iconName: 'Clock', order: 4, visible: true, enabled: true },
  { id: 'folha', originalLabel: 'Folha de Pagamento', customLabel: 'Folha de Pagamento', iconName: 'DollarSign', order: 5, visible: true, enabled: true },
  { id: 'avaliacao', originalLabel: 'Avaliações', customLabel: 'Avaliações & Desempenho', iconName: 'Award', order: 6, visible: true, enabled: true },
  { id: 'relatorios', originalLabel: 'Relatórios', customLabel: 'Relatórios & BI', iconName: 'BarChart3', order: 7, visible: true, enabled: true },
  { id: 'configuracoes', originalLabel: 'Configurações', customLabel: 'Configurações', iconName: 'Settings', order: 8, visible: true, enabled: true }
];

// Default dashboard widgets template
export const DEFAULT_DASHBOARD_COMPONENTS: DashboardComponentConfig[] = [
  { id: 'card-1', type: 'card', title: 'Total de Colaboradores', subtitle: 'Quadro ativo', size: 'third', order: 1, visible: true, metricType: 'total_colaboradores' },
  { id: 'card-2', type: 'card', title: 'Vagas Abertas (ATS)', subtitle: 'Processos em andamento', size: 'third', order: 2, visible: true, metricType: 'vagas_abertas' },
  { id: 'card-3', type: 'card', title: 'Presença Hoje', subtitle: 'Registros de ponto válidos', size: 'third', order: 3, visible: true, metricType: 'presenca_hoje' },
  { id: 'chart-1', type: 'chart', title: 'Headcount por Departamento', subtitle: 'Distribuição de equipe', size: 'half', order: 4, visible: true },
  { id: 'chart-2', type: 'chart', title: 'Admissões vs Demissões (Ano)', subtitle: 'Balanço de retenção', size: 'half', order: 5, visible: true },
  { id: 'table-1', type: 'table', title: 'Aniversariantes do Mês', subtitle: 'Ações de engajamento', size: 'half', order: 6, visible: true },
  { id: 'button-1', type: 'button', title: 'Atalhos Rápidos do Sistema', subtitle: 'Ações mais frequentes', size: 'half', order: 7, visible: true },
  { id: 'banner-1', type: 'banner', title: 'Comunicado Interno Oficial', subtitle: 'Mensagem em destaque para a equipe', size: 'full', order: 8, visible: true }
];

// Default recruitment stages template
export const DEFAULT_RECRUITMENT_STAGES: RecruitmentStageConfig[] = [
  { id: 'stage-1', name: 'Candidatura', color: '#64748b', order: 1 },
  { id: 'stage-2', name: 'Triagem', color: '#0284c7', order: 2 },
  { id: 'stage-3', name: 'Entrevista', color: '#8b5cf6', order: 3 },
  { id: 'stage-4', name: 'Aprovação', color: '#10b981', order: 4 }
];

// Pre-packaged industry presets
export const PRESET_CUSTOM_FIELDS: Record<string, CustomFieldConfig[]> = {
  transportadora: [
    { id: 'cf-trans-1', category: 'Transportadora', fieldName: 'Número da CNH', fieldType: 'text', required: true, placeholder: '12345678900' },
    { id: 'cf-trans-2', category: 'Transportadora', fieldName: 'Categoria CNH', fieldType: 'select', options: ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'], required: true },
    { id: 'cf-trans-3', category: 'Transportadora', fieldName: 'Validade Exame Toxicológico', fieldType: 'date', required: true },
    { id: 'cf-trans-4', category: 'Transportadora', fieldName: 'Veículo / Frota Associado', fieldType: 'text', required: false, placeholder: 'Placa ABC-1234 / Scania R450' }
  ],
  industria: [
    { id: 'cf-ind-1', category: 'Indústria', fieldName: 'Validade NR-10 (Segurança Elétrica)', fieldType: 'date', required: true },
    { id: 'cf-ind-2', category: 'Indústria', fieldName: 'Validade NR-35 (Trabalho em Altura)', fieldType: 'date', required: true },
    { id: 'cf-ind-3', category: 'Indústria', fieldName: 'Tamanho Uniforme / EPI', fieldType: 'select', options: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'EG'], required: true },
    { id: 'cf-ind-4', category: 'Indústria', fieldName: 'Certificado de Operador de Empilhadeira', fieldType: 'boolean', required: false }
  ]
};

// Create initial layout for a company
export function createDefaultCompanyLayout(companyId: string, companyName: string): CompanyLayoutConfig {
  return {
    companyId,
    companyName,
    updatedAt: new Date().toISOString(),
    updatedBy: 'MASTER',
    version: 1,
    identity: {
      displayName: companyName,
      logoUrl: '',
      primaryColor: '#059669', // Emerald default
      secondaryColor: '#0f172a',
      themeMode: 'light'
    },
    menus: DEFAULT_MENUS.map(m => ({ ...m })),
    dashboardComponents: DEFAULT_DASHBOARD_COMPONENTS.map(c => ({ ...c })),
    customFields: [],
    recruitmentStages: DEFAULT_RECRUITMENT_STAGES.map(s => ({ ...s }))
  };
}

export const layoutService = {
  // Get layout for specific company synchronously (from local cache)
  getCompanyLayout(companyId: string, companyName: string = 'Empresa'): CompanyLayoutConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
      if (stored) {
        const layouts: Record<string, CompanyLayoutConfig> = JSON.parse(stored);
        if (layouts[companyId]) {
          return layouts[companyId];
        }
      }
    } catch (e) {
      console.error('Error loading company layout:', e);
    }
    return createDefaultCompanyLayout(companyId, companyName);
  },

  // Async load from Firestore with local storage fallback
  async loadCompanyLayoutAsync(companyId: string, companyName: string = 'Empresa'): Promise<CompanyLayoutConfig> {
    try {
      const snap = await getDoc(doc(firestoreDb, 'COMPANY_LAYOUTS', companyId));
      if (snap.exists()) {
        const remoteLayout = snap.data() as CompanyLayoutConfig;
        
        // Update local storage cache
        const stored = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
        const layouts: Record<string, CompanyLayoutConfig> = stored ? JSON.parse(stored) : {};
        layouts[companyId] = remoteLayout;
        localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));

        this.applyCompanyStylesToDOM(remoteLayout);
        return remoteLayout;
      }
    } catch (e) {
      console.warn('Firestore load failed for company layout, falling back to local storage:', e);
    }

    const local = this.getCompanyLayout(companyId, companyName);
    this.applyCompanyStylesToDOM(local);
    return local;
  },

  // Save layout & record history version (Saves locally AND to Firestore)
  saveCompanyLayout(layout: CompanyLayoutConfig, updatedBy: string = 'MASTER', changeSummary: string = 'Atualização de layout'): CompanyLayoutConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
      const layouts: Record<string, CompanyLayoutConfig> = stored ? JSON.parse(stored) : {};

      const previousLayout = layouts[layout.companyId];
      const newVersion = previousLayout ? (previousLayout.version || 1) + 1 : 1;

      const updatedLayout: CompanyLayoutConfig = {
        ...layout,
        version: newVersion,
        updatedAt: new Date().toISOString(),
        updatedBy
      };

      layouts[layout.companyId] = updatedLayout;
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));

      // Save to Firestore asynchronously
      setDoc(doc(firestoreDb, 'COMPANY_LAYOUTS', layout.companyId), updatedLayout)
        .then(() => console.log(`✓ Company layout for ${layout.companyId} synced to Firestore`))
        .catch(err => console.error('Error saving company layout to Firestore:', err));

      // Record history entry
      this.addHistoryEntry({
        id: 'hist-' + Date.now(),
        companyId: layout.companyId,
        version: newVersion,
        updatedAt: new Date().toISOString(),
        updatedBy,
        changeSummary,
        snapshot: JSON.parse(JSON.stringify(updatedLayout))
      });

      // Apply dynamic CSS rules to current DOM session
      this.applyCompanyStylesToDOM(updatedLayout);

      // Broadcast event so active views re-render in real time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gestrh_layout_changed', { detail: updatedLayout }));
      }

      return updatedLayout;
    } catch (e) {
      console.error('Error saving company layout:', e);
      return layout;
    }
  },

  // Apply Company Dynamic CSS Theme to the DOM
  applyCompanyStylesToDOM(layout: CompanyLayoutConfig) {
    if (typeof document === 'undefined') return;

    let styleTag = document.getElementById('gestrh-company-theme-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'gestrh-company-theme-styles';
      document.head.appendChild(styleTag);
    }

    const primaryHex = layout.identity?.primaryColor || '#059669';
    const secondaryHex = layout.identity?.secondaryColor || '#0f172a';

    styleTag.innerHTML = `
      :root {
        --company-primary-color: ${primaryHex};
        --company-secondary-color: ${secondaryHex};
      }

      /* Dynamically theme sidebars with secondary color */
      aside#admin-main-sidebar,
      div#admin-mobile-header {
        background-color: ${secondaryHex} !important;
      }

      /* Primary buttons and active badges override */
      .bg-company-primary {
        background-color: ${primaryHex} !important;
      }
      .text-company-primary {
        color: ${primaryHex} !important;
      }
      .border-company-primary {
        border-color: ${primaryHex} !important;
      }
    `;
  },

  // History management
  getHistory(companyId: string): LayoutVersionHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        const historyList: LayoutVersionHistory[] = JSON.parse(stored);
        return historyList.filter(h => h.companyId === companyId).sort((a, b) => b.version - a.version);
      }
    } catch (e) {
      console.error('Error loading layout history:', e);
    }
    return [];
  },

  addHistoryEntry(entry: LayoutVersionHistory) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const historyList: LayoutVersionHistory[] = stored ? JSON.parse(stored) : [];
      historyList.push(entry);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyList));
    } catch (e) {
      console.error('Error adding history entry:', e);
    }
  },

  restoreVersion(historyId: string): CompanyLayoutConfig | null {
    try {
      const storedHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (storedHist) {
        const historyList: LayoutVersionHistory[] = JSON.parse(storedHist);
        const target = historyList.find(h => h.id === historyId);
        if (target) {
          const restored = this.saveCompanyLayout(
            target.snapshot,
            'MASTER',
            `Restaurado layout antigo (Versão v${target.version})`
          );
          return restored;
        }
      }
    } catch (e) {
      console.error('Error restoring layout version:', e);
    }
    return null;
  },

  // Change Requests from Client Admins
  getChangeRequests(companyId?: string): LayoutChangeRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (stored) {
        const requests: LayoutChangeRequest[] = JSON.parse(stored);
        if (companyId) {
          return requests.filter(r => r.companyId === companyId);
        }
        return requests;
      }
    } catch (e) {
      console.error('Error loading change requests:', e);
    }
    return [];
  },

  addChangeRequest(request: Omit<LayoutChangeRequest, 'id' | 'requestedAt' | 'status'>): LayoutChangeRequest {
    const newReq: LayoutChangeRequest = {
      ...request,
      id: 'req-' + Date.now(),
      requestedAt: new Date().toISOString(),
      status: 'Pendente'
    };
    try {
      const requests = this.getChangeRequests();
      requests.unshift(newReq);
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Error adding change request:', e);
    }
    return newReq;
  },

  updateRequestStatus(requestId: string, status: 'Atendido' | 'Recusado') {
    try {
      const requests = this.getChangeRequests();
      const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating request status:', e);
    }
  }
};
