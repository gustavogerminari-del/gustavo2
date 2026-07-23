/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Palette, 
  Layout, 
  ListOrdered, 
  FileSpreadsheet, 
  GitMerge, 
  History, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown, 
  Check, 
  Sparkles, 
  Layers, 
  Truck, 
  HardHat, 
  Settings, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Award, 
  BarChart3, 
  HelpCircle, 
  FileText, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Copy, 
  Download,
  Sliders,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

import { SaaSCompany } from '../types_master';
import { 
  layoutService, 
  CompanyLayoutConfig, 
  MenuItemCustomization, 
  DashboardComponentConfig, 
  CustomFieldConfig, 
  RecruitmentStageConfig, 
  LayoutVersionHistory, 
  LayoutChangeRequest,
  PRESET_CUSTOM_FIELDS,
  DEFAULT_MENUS,
  DEFAULT_DASHBOARD_COMPONENTS,
  DEFAULT_RECRUITMENT_STAGES
} from '../services/layoutService';

interface CompanyLayoutEditorProps {
  companies: SaaSCompany[];
  selectedCompanyId?: string;
  onClose?: () => void;
  triggerToast?: (msg: string) => void;
}

// Icon options for menu items
const AVAILABLE_ICONS = [
  { name: 'LayoutDashboard', label: 'Dashboard', icon: LayoutDashboard },
  { name: 'Users', label: 'Colaboradores', icon: Users },
  { name: 'Briefcase', label: 'Recrutamento', icon: Briefcase },
  { name: 'Clock', label: 'Ponto', icon: Clock },
  { name: 'DollarSign', label: 'Folha', icon: DollarSign },
  { name: 'Award', label: 'Avaliação', icon: Award },
  { name: 'BarChart3', label: 'Relatórios / BI', icon: BarChart3 },
  { name: 'Settings', label: 'Configurações', icon: Settings },
  { name: 'Truck', label: 'Transportadora', icon: Truck },
  { name: 'HardHat', label: 'Indústria / EPI', icon: HardHat },
  { name: 'FileText', label: 'Documentos', icon: FileText },
  { name: 'Shield', label: 'Segurança / NRs', icon: Shield }
];

// Color presets
const COLOR_PRESETS = [
  { name: 'Esmeralda GestRH', primary: '#059669', secondary: '#064e3b' },
  { name: 'Azul Corporativo', primary: '#2563eb', secondary: '#1e3a8a' },
  { name: 'Roxo Imperial', primary: '#7c3aed', secondary: '#4c1d95' },
  { name: 'Âmbar Executivo', primary: '#d97706', secondary: '#78350f' },
  { name: 'Vermelho Indústria', primary: '#dc2626', secondary: '#7f1d1d' },
  { name: 'Grafite Elegante', primary: '#334155', secondary: '#0f172a' }
];

export default function CompanyLayoutEditor({
  companies,
  selectedCompanyId,
  onClose,
  triggerToast = () => {}
}: CompanyLayoutEditorProps) {
  // Active selected company
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(
    selectedCompanyId || companies[0]?.id || 'company-1'
  );

  const activeCompany = companies.find(c => c.id === currentCompanyId) || companies[0];

  // Active Editor Section Tab
  const [activeTab, setActiveTab] = useState<
    'identidade' | 'menus' | 'dashboard' | 'campos' | 'processos' | 'historico' | 'solicitacoes'
  >('identidade');

  // Layout State
  const [layout, setLayout] = useState<CompanyLayoutConfig>(() =>
    layoutService.getCompanyLayout(currentCompanyId, activeCompany?.name || 'Empresa')
  );

  // History & Requests State
  const [history, setHistory] = useState<LayoutVersionHistory[]>([]);
  const [requests, setRequests] = useState<LayoutChangeRequest[]>([]);

  // Modals & Sub-forms
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Custom Field Form Modal State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldConfig | null>(null);
  const [fieldForm, setFieldForm] = useState<CustomFieldConfig>({
    id: '',
    category: 'Geral',
    fieldName: '',
    fieldType: 'text',
    options: [],
    required: false,
    placeholder: ''
  });
  const [fieldOptionsText, setFieldOptionsText] = useState('');

  // Recruitment Stage Form State
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageForm, setStageForm] = useState<{ id?: string; name: string; color: string }>({
    name: '',
    color: '#3b82f6'
  });

  // Reload Layout whenever Company selection changes
  useEffect(() => {
    if (activeCompany) {
      const compLayout = layoutService.getCompanyLayout(activeCompany.id, activeCompany.name);
      setLayout(compLayout);
      setHistory(layoutService.getHistory(activeCompany.id));
      setRequests(layoutService.getChangeRequests(activeCompany.id));
    }
  }, [currentCompanyId]);

  // Handle Save Layout
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const summary = changeSummary.trim() || 'Alterações no layout da empresa realizados pelo Master';
    const updated = layoutService.saveCompanyLayout(layout, 'MASTER', summary);
    setLayout(updated);
    setHistory(layoutService.getHistory(updated.companyId));
    setIsSaveModalOpen(false);
    setChangeSummary('');
    triggerToast(`Layout da empresa "${updated.companyName}" salvo com sucesso! (Versão v${updated.version})`);
  };

  // Restore Layout Version
  const handleRestoreVersion = (histId: string) => {
    if (confirm('Deseja realmente restaurar esta versão antiga do layout? As alterações atuais serão sobrescritas.')) {
      const restored = layoutService.restoreVersion(histId);
      if (restored) {
        setLayout(restored);
        setHistory(layoutService.getHistory(restored.companyId));
        triggerToast(`Layout restaurado para a versão v${restored.version}`);
      }
    }
  };

  // Preset Loaders
  const handleLoadIndustryPreset = (presetKey: 'transportadora' | 'industria') => {
    const presetFields = PRESET_CUSTOM_FIELDS[presetKey];
    if (presetFields) {
      const existingIds = new Set(layout.customFields.map(f => f.fieldName.toLowerCase()));
      const filteredNew = presetFields.filter(f => !existingIds.has(f.fieldName.toLowerCase()));

      setLayout(prev => ({
        ...prev,
        customFields: [...prev.customFields, ...filteredNew]
      }));

      triggerToast(`Preset de campos para ${presetKey.toUpperCase()} carregado!`);
    }
  };

  // Menu Handlers
  const handleMenuChange = (id: string, field: keyof MenuItemCustomization, value: any) => {
    setLayout(prev => ({
      ...prev,
      menus: prev.menus.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const handleMoveMenu = (index: number, direction: 'up' | 'down') => {
    const newMenus = [...layout.menus];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMenus.length) return;

    const temp = newMenus[index];
    newMenus[index] = newMenus[targetIndex];
    newMenus[targetIndex] = temp;

    // re-assign orders
    newMenus.forEach((m, idx) => m.order = idx + 1);
    setLayout(prev => ({ ...prev, menus: newMenus }));
  };

  const handleAddCustomMenu = () => {
    const newId = 'custom-menu-' + Date.now();
    const newMenu: MenuItemCustomization = {
      id: newId,
      originalLabel: 'Menu Personalizado',
      customLabel: 'Novo Menu',
      iconName: 'Sparkles',
      order: layout.menus.length + 1,
      visible: true,
      enabled: true
    };
    setLayout(prev => ({ ...prev, menus: [...prev.menus, newMenu] }));
  };

  // Dashboard Component Handlers
  const handleDashboardCompChange = (id: string, field: keyof DashboardComponentConfig, value: any) => {
    setLayout(prev => ({
      ...prev,
      dashboardComponents: prev.dashboardComponents.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleMoveDashboardComp = (index: number, direction: 'up' | 'down') => {
    const newComps = [...layout.dashboardComponents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newComps.length) return;

    const temp = newComps[index];
    newComps[index] = newComps[targetIndex];
    newComps[targetIndex] = temp;

    newComps.forEach((c, idx) => c.order = idx + 1);
    setLayout(prev => ({ ...prev, dashboardComponents: newComps }));
  };

  const handleAddDashboardWidget = (type: 'card' | 'chart' | 'table' | 'button' | 'banner') => {
    const newWidget: DashboardComponentConfig = {
      id: 'widget-' + Date.now(),
      type,
      title: type === 'card' ? 'Nova Métrica KPI' : type === 'chart' ? 'Novo Gráfico de Desempenho' : 'Novo Bloco de Conteúdo',
      subtitle: 'Configurado pelo Administrador Master',
      size: type === 'banner' ? 'full' : 'half',
      order: layout.dashboardComponents.length + 1,
      visible: true
    };
    setLayout(prev => ({ ...prev, dashboardComponents: [...prev.dashboardComponents, newWidget] }));
    triggerToast('Novo componente adicionado ao Dashboard!');
  };

  // Custom Field Modal Handlers
  const handleOpenFieldModal = (field?: CustomFieldConfig) => {
    if (field) {
      setEditingField(field);
      setFieldForm({ ...field });
      setFieldOptionsText(field.options?.join('\n') || '');
    } else {
      setEditingField(null);
      setFieldForm({
        id: 'cf-' + Date.now(),
        category: 'Geral',
        fieldName: '',
        fieldType: 'text',
        options: [],
        required: false,
        placeholder: ''
      });
      setFieldOptionsText('');
    }
    setIsFieldModalOpen(true);
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldForm.fieldName.trim()) return;

    const optionsArray = fieldOptionsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const savedField: CustomFieldConfig = {
      ...fieldForm,
      options: fieldForm.fieldType === 'select' ? optionsArray : undefined
    };

    if (editingField) {
      setLayout(prev => ({
        ...prev,
        customFields: prev.customFields.map(f => f.id === savedField.id ? savedField : f)
      }));
    } else {
      setLayout(prev => ({
        ...prev,
        customFields: [...prev.customFields, savedField]
      }));
    }

    setIsFieldModalOpen(false);
    triggerToast(`Campo personalizado "${savedField.fieldName}" salvo!`);
  };

  const handleDeleteField = (id: string) => {
    setLayout(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }));
    triggerToast('Campo removido do formulário de colaboradores.');
  };

  // Recruitment Stages Handlers
  const handleOpenStageModal = (stage?: RecruitmentStageConfig) => {
    if (stage) {
      setStageForm({ id: stage.id, name: stage.name, color: stage.color });
    } else {
      setStageForm({ name: '', color: '#3b82f6' });
    }
    setIsStageModalOpen(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.name.trim()) return;

    if (stageForm.id) {
      setLayout(prev => ({
        ...prev,
        recruitmentStages: prev.recruitmentStages.map(s => s.id === stageForm.id ? { ...s, name: stageForm.name, color: stageForm.color } : s)
      }));
    } else {
      const newStage: RecruitmentStageConfig = {
        id: 'stage-' + Date.now(),
        name: stageForm.name,
        color: stageForm.color,
        order: layout.recruitmentStages.length + 1
      };
      setLayout(prev => ({
        ...prev,
        recruitmentStages: [...prev.recruitmentStages, newStage]
      }));
    }

    setIsStageModalOpen(false);
    triggerToast('Etapa do processo de recrutamento atualizada!');
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...layout.recruitmentStages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStages.length) return;

    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    newStages.forEach((s, idx) => s.order = idx + 1);
    setLayout(prev => ({ ...prev, recruitmentStages: newStages }));
  };

  const handleDeleteStage = (id: string) => {
    if (layout.recruitmentStages.length <= 2) {
      alert('O processo precisa manter pelo menos 2 etapas.');
      return;
    }
    setLayout(prev => ({
      ...prev,
      recruitmentStages: prev.recruitmentStages.filter(s => s.id !== id)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Bar Header & Company Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono">
              EXCLUSIVO MASTER
            </span>
            <span className="text-slate-400 text-xs font-mono font-bold">
              Versão Atual: v{layout.version || 1}.0
            </span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight flex items-center space-x-3">
            <Palette className="h-7 w-7 text-amber-400" />
            <span>Editor de Layout por Cliente</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Personalize menus, cores, logotipos, widgets de dashboard, campos de funcionários e fluxos de recrutamento individualmente para cada empresa SaaS contratante.
          </p>
        </div>

        {/* Company Selector & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 shrink-0">
          <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-amber-400 shrink-0 ml-2" />
            <select
              value={currentCompanyId}
              onChange={e => setCurrentCompanyId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none pr-4 cursor-pointer"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  🏢 {c.name} ({c.cnpj || 'Sem CNPJ'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Layout</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer"
            >
              Sair
            </button>
          )}
        </div>
      </div>

      {/* Editor Sub-Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('identidade')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'identidade'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>1. Cores e Identidade</span>
        </button>

        <button
          onClick={() => setActiveTab('menus')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'menus'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ListOrdered className="h-4 w-4" />
          <span>2. Menus & Navegação</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layout className="h-4 w-4" />
          <span>3. Dashboard Visual Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('campos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'campos'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>4. Campos de Funcionários ({layout.customFields.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('processos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'processos'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitMerge className="h-4 w-4" />
          <span>5. Fluxos de Recrutamento</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
            activeTab === 'historico'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          <span>6. Histórico ({history.length})</span>
        </button>

        {requests.length > 0 && (
          <button
            onClick={() => setActiveTab('solicitacoes')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              activeTab === 'solicitacoes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-400 bg-blue-950/40 border border-blue-800/60 hover:bg-blue-900/50'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Solicitações do Cliente ({requests.length})</span>
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: EDITOR CONTROLS (8 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* TAB 1: CORES E IDENTIDADE VISUAL */}
          {activeTab === 'identidade' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-amber-400" />
                  <span>Personalização de Identidade & Tema</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Ajuste o nome de exibição, logo, paleta de cores e modo de tema aplicado para {activeCompany?.name}.
                </p>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase font-mono text-slate-400">Paletas Prontas Recomendadas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_PRESETS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setLayout(prev => ({
                          ...prev,
                          identity: { ...prev.identity, primaryColor: p.primary, secondaryColor: p.secondary }
                        }));
                      }}
                      className="p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500 transition-all text-left flex items-center space-x-3 cursor-pointer"
                    >
                      <div
                        className="h-6 w-6 rounded-lg shrink-0 shadow-inner"
                        style={{ backgroundColor: p.primary }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{p.primary}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nome Exibido no Topo / Portal *</label>
                  <input
                    type="text"
                    value={layout.identity.displayName}
                    onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, displayName: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">URL da Logomarca Personalizada</label>
                  <input
                    type="text"
                    placeholder="https://exemplo.com/logo.png"
                    value={layout.identity.logoUrl || ''}
                    onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, logoUrl: e.target.value } }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cor Principal (Botões e Destaques)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={layout.identity.primaryColor}
                      onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, primaryColor: e.target.value } }))}
                      className="h-10 w-12 bg-transparent cursor-pointer rounded-lg border-0"
                    />
                    <input
                      type="text"
                      value={layout.identity.primaryColor}
                      onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, primaryColor: e.target.value } }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cor Secundária / Fundo do Menu</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={layout.identity.secondaryColor}
                      onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, secondaryColor: e.target.value } }))}
                      className="h-10 w-12 bg-transparent cursor-pointer rounded-lg border-0"
                    />
                    <input
                      type="text"
                      value={layout.identity.secondaryColor}
                      onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, secondaryColor: e.target.value } }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Modo de Tema Preferencial</label>
                  <select
                    value={layout.identity.themeMode}
                    onChange={e => setLayout(prev => ({ ...prev, identity: { ...prev.identity, themeMode: e.target.value as any } }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="light">☀️ Tema Claro Clean (Padrão)</option>
                    <option value="dark">🌙 Tema Escuro Night Executive</option>
                    <option value="auto">🔄 Automático (Segue preferência do usuário)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALTERAÇÃO DE MENUS E NAVEGAÇÃO */}
          {activeTab === 'menus' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                    <ListOrdered className="h-5 w-5 text-amber-400" />
                    <span>Personalização de Menus Laterais</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Renomeie, oculte, altere o ícone ou crie novos itens de menu exclusivos para este cliente.
                  </p>
                </div>

                <button
                  onClick={handleAddCustomMenu}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Menu</span>
                </button>
              </div>

              <div className="space-y-3">
                {layout.menus.map((menu, idx) => (
                  <div
                    key={menu.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      menu.visible
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      {/* Left Side: Drag/Order + Label Inputs */}
                      <div className="flex items-center space-x-3 flex-1 w-full">
                        <div className="flex flex-col space-y-1 shrink-0">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveMenu(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={idx === layout.menus.length - 1}
                            onClick={() => handleMoveMenu(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="bg-slate-900 border border-slate-800 text-amber-400 text-[10px] font-mono font-bold px-2 py-1 rounded-lg">
                          #{idx + 1}
                        </span>

                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={menu.customLabel}
                            onChange={e => handleMenuChange(menu.id, 'customLabel', e.target.value)}
                            placeholder="Nome personalizado do menu..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-extrabold focus:outline-none focus:border-amber-500"
                          />
                          <p className="text-[10px] text-slate-500">Menu original: {menu.originalLabel}</p>
                        </div>
                      </div>

                      {/* Right Side: Icon Selector + Visibility Switch */}
                      <div className="flex items-center space-x-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                          <label className="text-[10px] text-slate-400 font-mono uppercase px-1">Ícone:</label>
                          <select
                            value={menu.iconName}
                            onChange={e => handleMenuChange(menu.id, 'iconName', e.target.value)}
                            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
                          >
                            {AVAILABLE_ICONS.map(ico => (
                              <option key={ico.name} value={ico.name} className="bg-slate-900 text-white">
                                {ico.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => handleMenuChange(menu.id, 'visible', !menu.visible)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                            menu.visible
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {menu.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          <span>{menu.visible ? 'Visível' : 'Oculto'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DASHBOARD VISUAL BUILDER */}
          {activeTab === 'dashboard' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                    <Layout className="h-5 w-5 text-amber-400" />
                    <span>Editor Visual do Dashboard (Drag & Drop)</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Reordene, redimensione e escolha quais cards, gráficos, tabelas e atalhos aparecem no painel principal do cliente.
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleAddDashboardWidget('card')}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    + Card
                  </button>
                  <button
                    onClick={() => handleAddDashboardWidget('chart')}
                    className="bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    + Gráfico
                  </button>
                  <button
                    onClick={() => handleAddDashboardWidget('banner')}
                    className="bg-slate-800 hover:bg-slate-700 text-purple-400 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    + Banner
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {layout.dashboardComponents.map((comp, idx) => (
                  <div
                    key={comp.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      comp.visible ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex flex-col space-y-1 shrink-0">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveDashboardComp(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={idx === layout.dashboardComponents.length - 1}
                            onClick={() => handleMoveDashboardComp(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="uppercase text-[9px] font-black px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400">
                          {comp.type}
                        </span>

                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={comp.title}
                            onChange={e => handleDashboardCompChange(comp.id, 'title', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Size selector */}
                        <select
                          value={comp.size}
                          onChange={e => handleDashboardCompChange(comp.id, 'size', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] font-mono font-bold text-slate-300 focus:outline-none"
                        >
                          <option value="full">Largura Total (100%)</option>
                          <option value="half">Metade (50%)</option>
                          <option value="third">1/3 de Tela (33%)</option>
                          <option value="two-thirds">2/3 de Tela (66%)</option>
                        </select>

                        <button
                          onClick={() => handleDashboardCompChange(comp.id, 'visible', !comp.visible)}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            comp.visible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {comp.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CAMPOS PERSONALIZADOS DE FUNCIONÁRIOS */}
          {activeTab === 'campos' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                  <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                    <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                    <span>Campos Personalizados do Cadastro de Funcionários</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Crie novos campos específicos de cada nicho de atuação da empresa cliente.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenFieldModal()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Campo</span>
                </button>
              </div>

              {/* Industry Presets Quick Load */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">⚡ Carregamento Rápido por Ramo de Atuação</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLoadIndustryPreset('transportadora')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-2 cursor-pointer transition-all"
                  >
                    <Truck className="h-4 w-4 text-emerald-400" />
                    <span>Carregar Preset Transportadora (CNH, Toxicológico, Veículo)</span>
                  </button>

                  <button
                    onClick={() => handleLoadIndustryPreset('industria')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-2 cursor-pointer transition-all"
                  >
                    <HardHat className="h-4 w-4 text-amber-400" />
                    <span>Carregar Preset Indústria (NR-10, NR-35, EPI)</span>
                  </button>
                </div>
              </div>

              {/* List of Custom Fields */}
              <div className="space-y-3">
                {layout.customFields.length === 0 ? (
                  <div className="text-center p-8 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <FileSpreadsheet className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Nenhum campo personalizado adicionado para esta empresa.</p>
                    <p className="text-[11px] text-slate-500">Clique acima para criar ou carregar presets do seu setor.</p>
                  </div>
                ) : (
                  layout.customFields.map(field => (
                    <div key={field.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-900 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                            {field.category}
                          </span>
                          <span className="text-xs font-extrabold text-white">{field.fieldName}</span>
                          {field.required && (
                            <span className="bg-rose-500/20 text-rose-400 text-[9px] font-bold px-1.5 py-0.2 rounded">Obrigatório</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Tipo: <strong className="text-slate-300">{field.fieldType}</strong>
                          {field.options && field.options.length > 0 && ` | Opções: ${field.options.join(', ')}`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenFieldModal(field)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FLUXOS DE RECRUTAMENTO / ATS */}
          {activeTab === 'processos' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                    <GitMerge className="h-5 w-5 text-amber-400" />
                    <span>Etapas do Pipeline de Recrutamento & Seleção (ATS)</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Personalize o fluxo do funil de contratação para adequar às aprovações da diretoria desta empresa.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenStageModal()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Etapa</span>
                </button>
              </div>

              <div className="space-y-3">
                {layout.recruitmentStages.map((stage, idx) => (
                  <div key={stage.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveStage(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={idx === layout.recruitmentStages.length - 1}
                          onClick={() => handleMoveStage(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-amber-400 disabled:opacity-20 cursor-pointer"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        className="h-5 w-5 rounded-full shrink-0 shadow-inner"
                        style={{ backgroundColor: stage.color }}
                      />

                      <div>
                        <p className="text-xs font-bold text-white">Etapa #{idx + 1}: {stage.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Tag de cor: {stage.color}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenStageModal(stage)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all text-xs font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: HISTÓRICO DE VERSÕES */}
          {activeTab === 'historico' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                  <History className="h-5 w-5 text-amber-400" />
                  <span>Histórico de Alterações de Layout (Audit Trail)</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Acompanhe quem e quando alterou as configurações e restaure versões antigas a qualquer momento.
                </p>
              </div>

              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Nenhum histórico gravado ainda para este cliente.</p>
                ) : (
                  history.map(hist => (
                    <div key={hist.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            v{hist.version}.0
                          </span>
                          <span className="text-xs font-bold text-white">{new Date(hist.updatedAt).toLocaleString('pt-BR')}</span>
                          <span className="text-[10px] text-slate-400">por {hist.updatedBy}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{hist.changeSummary}</p>
                      </div>

                      <button
                        onClick={() => handleRestoreVersion(hist.id)}
                        className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-amber-500/30 cursor-pointer shrink-0"
                      >
                        Restaurar Versão
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SOLICITAÇÕES DO CLIENTE */}
          {activeTab === 'solicitacoes' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <span>Solicitações de Alteração de Layout enviadas pelo Cliente</span>
                </h3>
              </div>

              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Nenhuma solicitação pendente.</p>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{req.requestedBy}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.status === 'Pendente' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{req.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE SYSTEM CANVAS PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 sticky top-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-extrabold text-xs text-white uppercase tracking-wider font-mono">
                  Pré-visualização do Cliente em Tempo Real
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                AO VIVO
              </span>
            </div>

            {/* Simulated Live UI Screen */}
            <div
              className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-all"
              style={{ backgroundColor: layout.identity.themeMode === 'dark' ? '#090d16' : '#f8fafc' }}
            >
              {/* Header Bar */}
              <div
                className="p-3 text-white flex items-center justify-between text-xs font-bold shadow-sm"
                style={{ backgroundColor: layout.identity.primaryColor }}
              >
                <div className="flex items-center space-x-2">
                  {layout.identity.logoUrl ? (
                    <img src={layout.identity.logoUrl} alt="Logo" className="h-5 w-auto max-w-[100px] object-contain" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span className="truncate max-w-[140px]">{layout.identity.displayName}</span>
                </div>
                <span className="text-[10px] opacity-80">GestRH SaaS</span>
              </div>

              {/* Body: Sidebar + Main Area */}
              <div className="flex min-h-[380px]">
                {/* Simulated Sidebar */}
                <div
                  className="w-36 p-2 space-y-1 border-r text-[10px] font-semibold shrink-0"
                  style={{
                    backgroundColor: layout.identity.secondaryColor,
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: '#e2e8f0'
                  }}
                >
                  <p className="text-[8px] uppercase tracking-wider opacity-60 font-mono px-2 py-1">Menu do Cliente</p>
                  {layout.menus.filter(m => m.visible).slice(0, 6).map(m => (
                    <div
                      key={m.id}
                      className="px-2 py-1.5 rounded-lg bg-white/10 flex items-center space-x-1.5 truncate cursor-default"
                    >
                      <span className="truncate">{m.customLabel}</span>
                    </div>
                  ))}
                </div>

                {/* Simulated Main Dashboard Area */}
                <div className="flex-1 p-3 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-black ${layout.identity.themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {layout.menus.find(m => m.id === 'dashboard')?.customLabel || 'Dashboard'}
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono">Modo: {layout.identity.themeMode}</span>
                  </div>

                  {/* Widgets Grid Simulation */}
                  <div className="grid grid-cols-2 gap-2">
                    {layout.dashboardComponents.filter(c => c.visible).slice(0, 4).map(c => (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-xl border text-[10px] space-y-1 shadow-2xs ${
                          c.size === 'full' ? 'col-span-2' : 'col-span-1'
                        } ${
                          layout.identity.themeMode === 'dark'
                            ? 'bg-slate-900 border-slate-800 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <span className="font-bold block truncate" style={{ color: layout.identity.primaryColor }}>
                          {c.title}
                        </span>
                        <p className="text-[9px] text-slate-400 truncate">{c.subtitle || 'Exibição personalizada'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recruitment Stages Preview */}
                  <div className={`p-2.5 rounded-xl border text-[10px] space-y-1.5 ${
                    layout.identity.themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Funil de Recrutamento</span>
                    <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                      {layout.recruitmentStages.map(s => (
                        <span
                          key={s.id}
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shrink-0"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              💡 As alterações que você fizer nos menus, widgets, cores e campos serão salvas especificamente para esta empresa.
            </p>
          </div>
        </div>

      </div>

      {/* SAVE LAYOUT CONFIRMATION MODAL */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 space-y-4 p-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                <Save className="h-5 w-5 text-amber-400" />
                <span>Salvar Nova Versão do Layout</span>
              </h3>
              <button type="button" onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Você está salvando a versão <strong>v{(layout.version || 1) + 1}.0</strong> para a empresa <strong>{layout.companyName}</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Resumo das Alterações (para o histórico auditável) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Alterou menu Funcionários para Colaboradores e adicionou campos CNH..."
                  value={changeSummary}
                  onChange={e => setChangeSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Confirmar & Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM FIELD FORM MODAL */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveField} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">
                {editingField ? 'Editar Campo Personalizado' : 'Adicionar Campo ao Cadastro de Funcionários'}
              </h3>
              <button type="button" onClick={() => setIsFieldModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Campo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Validade Exame Toxicológico, NR-10..."
                  value={fieldForm.fieldName}
                  onChange={e => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Categoria de Agrupamento</label>
                  <select
                    value={fieldForm.category}
                    onChange={e => setFieldForm({ ...fieldForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Transportadora">Transportadora</option>
                    <option value="Indústria">Indústria</option>
                    <option value="Documentação">Documentação</option>
                    <option value="Segurança & EPI">Segurança & EPI</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Dado</label>
                  <select
                    value={fieldForm.fieldType}
                    onChange={e => setFieldForm({ ...fieldForm, fieldType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="text">Texto Livre</option>
                    <option value="number">Número</option>
                    <option value="date">Data (Calendário)</option>
                    <option value="select">Seleção (Dropdown)</option>
                    <option value="boolean">Sim / Não (Checkbox)</option>
                  </select>
                </div>
              </div>

              {fieldForm.fieldType === 'select' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Opções do Dropdown (uma por linha)</label>
                  <textarea
                    rows={3}
                    placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                    value={fieldOptionsText}
                    onChange={e => setFieldOptionsText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  ></textarea>
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={fieldForm.required}
                  onChange={e => setFieldForm({ ...fieldForm, required: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-800"
                />
                <span>Preenchimento Obrigatório na Admissão/Cadastro</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFieldModalOpen(false)}
                className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Salvar Campo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECRUITMENT STAGE FORM MODAL */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveStage} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Etapa de Recrutamento</h3>
              <button type="button" onClick={() => setIsStageModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Etapa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teste Técnico, Aprovação Diretoria..."
                  value={stageForm.name}
                  onChange={e => setStageForm({ ...stageForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cor Identificadora da Tag</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={stageForm.color}
                    onChange={e => setStageForm({ ...stageForm, color: e.target.value })}
                    className="h-10 w-12 bg-transparent cursor-pointer rounded-lg border-0"
                  />
                  <input
                    type="text"
                    value={stageForm.color}
                    onChange={e => setStageForm({ ...stageForm, color: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsStageModalOpen(false)}
                className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Salvar Etapa
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
