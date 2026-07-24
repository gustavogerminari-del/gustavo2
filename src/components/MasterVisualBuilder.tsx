/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Layout,
  Type,
  MousePointer,
  Move,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Check,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Maximize2,
  Sliders,
  FolderPlus,
  FileText,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Shield,
  ShieldCheck,
  HelpCircle,
  Menu,
  Grid,
  Square,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Paintbrush,
  History,
  Globe,
  Settings,
  Users,
  Briefcase,
  DollarSign,
  Award,
  FileCheck,
  Lock,
  Unlock,
  Building2,
  Link,
  Edit2,
  Sparkle
} from 'lucide-react';

import {
  visualBuilderService,
  GlobalDesignSystemConfig,
  CustomVisualPage,
  VisualBuilderBlock,
  ComponentStyleOverride,
  DesignerVersionHistory,
  DEFAULT_GLOBAL_DESIGN
} from '../services/visualBuilderService';

import { SaaSCompany } from '../types_master';

interface MasterVisualBuilderProps {
  currentUserRole?: string;
  companies?: SaaSCompany[];
  onClose?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function MasterVisualBuilder({
  currentUserRole = 'MASTER',
  companies = [],
  onClose,
  triggerToast
}: MasterVisualBuilderProps) {
  // Main state
  const [config, setConfig] = useState<GlobalDesignSystemConfig>(DEFAULT_GLOBAL_DESIGN);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'themes' | 'pages' | 'library' | 'history' | 'white_label'>('themes');
  
  // Device Preview Mode
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');

  // Selected element for live inspector
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('b-1');
  const [selectedBlock, setSelectedBlock] = useState<VisualBuilderBlock | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('page-home');

  // AI Master Assistant state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Scope toggle
  const [applyScope, setApplyScope] = useState<'global' | 'page'>('global');

  // History & Status
  const [historyList, setHistoryList] = useState<DesignerVersionHistory[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // New Page Modal
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('LayoutDashboard');

  // Selected White-label Company
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Load configuration
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await visualBuilderService.loadGlobalConfig();
      setConfig(data);
      setHistoryList(visualBuilderService.getHistory());
      if (data.customPages.length > 0) {
        setSelectedPageId(data.customPages[0].id);
        if (data.customPages[0].blocks.length > 0) {
          setSelectedBlockId(data.customPages[0].blocks[0].id);
          setSelectedBlock(data.customPages[0].blocks[0]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Sync selected block when block ID or page changes
  useEffect(() => {
    const page = config.customPages.find(p => p.id === selectedPageId);
    if (page) {
      const block = page.blocks.find(b => b.id === selectedBlockId);
      if (block) {
        setSelectedBlock(block);
      }
    }
  }, [selectedBlockId, selectedPageId, config]);

  // AI Master Assistant Command Handler
  const handleAiGenerateCommand = async (customText?: string) => {
    const textToProcess = (customText || aiPrompt).trim();
    if (!textToProcess) return;

    setIsAiGenerating(true);
    const lower = textToProcess.toLowerCase();

    // Artificial short delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      if (lower.includes('financeiro') || lower.includes('faturamento') || lower.includes('contas')) {
        const newPage: CustomVisualPage = {
          id: `page-fin-${Date.now()}`,
          title: 'Módulo Financeiro & DRE',
          slug: 'financeiro',
          iconName: 'DollarSign',
          visible: true,
          order: config.customPages.length + 1,
          blocks: [
            { id: `b-fin-kpi-${Date.now()}`, type: 'kpi', title: 'Faturamento Bruto Mensal', subtitle: 'Apurado via IA de Finanças', size: 'half', order: 1, style: { bgColor: '#f0fdf4', textColor: '#166534', borderRadius: '16px' } },
            { id: `b-fin-chart-${Date.now()}`, type: 'chart', title: 'Fluxo de Caixa & Receita RH', subtitle: 'Evolução dos últimos 12 meses', size: 'half', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
            { id: `b-fin-table-${Date.now()}`, type: 'table', title: 'Demonstrativo de Custos por Departamento', subtitle: 'Folha, Benefícios e Encargos', size: 'full', order: 3, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
          ]
        };
        setConfig(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
        setSelectedPageId(newPage.id);
        if (triggerToast) triggerToast('✨ IA do Master: Página "Módulo Financeiro & DRE" gerada com sucesso!');

      } else if (lower.includes('crm') || lower.includes('vagas') || lower.includes('kanban')) {
        const newPage: CustomVisualPage = {
          id: `page-crm-${Date.now()}`,
          title: 'Módulo CRM & Pipeline de Vagas',
          slug: 'crm-vagas',
          iconName: 'Briefcase',
          visible: true,
          order: config.customPages.length + 1,
          blocks: [
            { id: `b-crm-kanban-${Date.now()}`, type: 'kanban', title: 'Funil Recrutamento & Seleção', subtitle: 'Triagem -> Entrevista -> Proposta -> Admissão', size: 'full', order: 1, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
            { id: `b-crm-kpi-${Date.now()}`, type: 'kpi', title: 'Tempo Médio de Preenchimento (SLA)', subtitle: 'Meta: 14 dias', size: 'half', order: 2, style: { bgColor: '#eff6ff', textColor: '#1e40af', borderRadius: '16px' } }
          ]
        };
        setConfig(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
        setSelectedPageId(newPage.id);
        if (triggerToast) triggerToast('✨ IA do Master: Página "Módulo CRM & Pipeline de Vagas" gerada com sucesso!');

      } else if (lower.includes('botão') || lower.includes('botao') || lower.includes('button')) {
        const newBlock: VisualBuilderBlock = {
          id: `b-btn-${Date.now()}`,
          type: 'button',
          title: 'Ação Rápida Gerada por IA',
          subtitle: 'Clique para disparar integração',
          size: 'half',
          order: 99,
          style: { bgColor: '#2563eb', textColor: '#ffffff', borderRadius: '12px', padding: '16px' }
        };
        handleAddBlockToPage('button', 'Botão Personalizado Azul');
        if (triggerToast) triggerToast('✨ IA do Master: Botão personalizado adicionado!');

      } else if (lower.includes('formulário') || lower.includes('formulario') || lower.includes('cadastro')) {
        const newBlock: VisualBuilderBlock = {
          id: `b-form-${Date.now()}`,
          type: 'table',
          title: 'Formulário Inteligente de Cadastro',
          subtitle: 'Campos validados com inteligência artificial',
          size: 'full',
          order: 99,
          style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' }
        };
        handleAddBlockToPage('table', 'Formulário de Cadastro RH');
        if (triggerToast) triggerToast('✨ IA do Master: Formulário de cadastro inserido!');

      } else if (lower.includes('dashboard') || lower.includes('executivo')) {
        const newPage: CustomVisualPage = {
          id: `page-dash-${Date.now()}`,
          title: 'Dashboard Executivo Diretoria',
          slug: 'dashboard-executivo',
          iconName: 'BarChart3',
          visible: true,
          order: config.customPages.length + 1,
          blocks: [
            { id: `b-d-kpi1-${Date.now()}`, type: 'kpi', title: 'Headcount Ativo', subtitle: 'Total de Funcionários', size: 'half', order: 1, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
            { id: `b-d-kpi2-${Date.now()}`, type: 'kpi', title: 'Índice de Turnover', subtitle: 'Taxa Anual: 1.8%', size: 'half', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
            { id: `b-d-chart-${Date.now()}`, type: 'chart', title: 'Analytics de Clima Organizacional (eNPS)', subtitle: 'Acompanhamento Trimestral', size: 'full', order: 3, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
          ]
        };
        setConfig(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
        setSelectedPageId(newPage.id);
        if (triggerToast) triggerToast('✨ IA do Master: "Dashboard Executivo" gerado com sucesso!');

      } else {
        // Generic page creation from prompt
        const pageTitle = textToProcess.charAt(0).toUpperCase() + textToProcess.slice(1);
        const newPage: CustomVisualPage = {
          id: `page-gen-${Date.now()}`,
          title: pageTitle,
          slug: pageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          iconName: 'Sparkles',
          visible: true,
          order: config.customPages.length + 1,
          blocks: [
            { id: `b-gen-banner-${Date.now()}`, type: 'banner', title: `Página: ${pageTitle}`, subtitle: 'Gerada automaticamente via IA Assistente Master', size: 'full', order: 1, style: { bgColor: '#f8fafc', textColor: '#0f172a', borderRadius: '16px' } },
            { id: `b-gen-kpi-${Date.now()}`, type: 'kpi', title: 'Indicador de Desempenho', subtitle: 'Métrica vinculada', size: 'half', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
            { id: `b-gen-chart-${Date.now()}`, type: 'chart', title: 'Gráfico Analítico', subtitle: 'Relatório dinâmico', size: 'half', order: 3, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
          ]
        };
        setConfig(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
        setSelectedPageId(newPage.id);
        if (triggerToast) triggerToast(`✨ IA do Master: Interface para "${pageTitle}" criada com sucesso!`);
      }

      setAiPrompt('');
      setHasUnsavedChanges(true);
    } catch (err: any) {
      console.error('Error generating with AI:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle Save / Publish
  const handleSaveConfig = async (isDraft: boolean = false) => {
    setSaving(true);
    try {
      const summary = isDraft
        ? 'Rascunho de layout visual salvo'
        : 'Publicação global de layout e design system';
      const updated = await visualBuilderService.saveGlobalConfig(config, 'MASTER', summary);
      setConfig(updated);
      setHistoryList(visualBuilderService.getHistory());
      setHasUnsavedChanges(false);
      if (triggerToast) {
        triggerToast(
          isDraft
            ? '💾 Rascunho salvo com sucesso!'
            : '🚀 Publicado com sucesso! Todas as páginas e módulos foram atualizados.'
        );
      }
    } catch (err: any) {
      alert('Erro ao salvar configurações do Construtor Visual: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Add block from library to current page
  const handleAddBlockToPage = (blockType: VisualBuilderBlock['type'], title: string) => {
    const newBlock: VisualBuilderBlock = {
      id: `b-${Date.now()}`,
      type: blockType,
      title,
      subtitle: 'Componente inserido via Construtor Visual',
      size: 'half',
      order: 99,
      style: {
        bgColor: '#ffffff',
        textColor: '#0f172a',
        borderRadius: '16px',
        padding: '16px'
      }
    };

    const updatedPages = config.customPages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          blocks: [...page.blocks, newBlock]
        };
      }
      return page;
    });

    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    setSelectedBlockId(newBlock.id);
    setSelectedBlock(newBlock);
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast(`✓ Componente "${title}" adicionado à página!`);
  };

  // Delete block from page
  const handleDeleteBlock = (blockId: string) => {
    const updatedPages = config.customPages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          blocks: page.blocks.filter(b => b.id !== blockId)
        };
      }
      return page;
    });
    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setSelectedBlock(null);
    }
    setHasUnsavedChanges(true);
  };

  // Move block up or down
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const activePage = config.customPages.find(p => p.id === selectedPageId);
    if (!activePage) return;

    const idx = activePage.blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activePage.blocks.length) return;

    const newBlocks = [...activePage.blocks];
    const temp = newBlocks[idx];
    newBlocks[idx] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    const updatedPages = config.customPages.map(p => p.id === selectedPageId ? { ...p, blocks: newBlocks } : p);
    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    setHasUnsavedChanges(true);
  };

  // Update selected block styling or properties
  const handleUpdateBlockStyle = (field: string, value: any) => {
    if (!selectedBlock) return;

    const updatedPages = config.customPages.map(page => {
      if (applyScope === 'global') {
        // Apply styling to all blocks of same type
        return {
          ...page,
          blocks: page.blocks.map(b => {
            if (b.type === selectedBlock.type || b.id === selectedBlock.id) {
              return {
                ...b,
                style: { ...(b.style || {}), [field]: value }
              };
            }
            return b;
          })
        };
      } else {
        // Apply only to selected page & block
        if (page.id === selectedPageId) {
          return {
            ...page,
            blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, style: { ...(b.style || {}), [field]: value } } : b)
          };
        }
        return page;
      }
    });

    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    setHasUnsavedChanges(true);
  };

  // Add new page
  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const slug = newPageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newPage: CustomVisualPage = {
      id: `page-${Date.now()}`,
      title: newPageTitle,
      slug,
      iconName: newPageIcon,
      visible: true,
      order: config.customPages.length + 1,
      blocks: [
        {
          id: `b-init-${Date.now()}`,
          type: 'banner',
          title: `Boas-vindas a ${newPageTitle}`,
          subtitle: 'Página criada via Construtor Visual Master',
          size: 'full',
          order: 1
        }
      ]
    };

    setConfig(prev => ({
      ...prev,
      customPages: [...prev.customPages, newPage]
    }));
    setSelectedPageId(newPage.id);
    setIsNewPageModalOpen(false);
    setNewPageTitle('');
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast(`✓ Página "${newPageTitle}" criada!`);
  };

  // Restore history version
  const handleRestoreHistory = async (hist: DesignerVersionHistory) => {
    if (window.confirm(`Deseja restaurar a versão v${hist.version} criada em ${new Date(hist.updatedAt).toLocaleString('pt-BR')}?`)) {
      setConfig(hist.config);
      await visualBuilderService.saveGlobalConfig(hist.config, 'MASTER', `Restaurada versão v${hist.version}`);
      if (triggerToast) triggerToast(`✓ Versão v${hist.version} restaurada com sucesso!`);
    }
  };

  const activePage = config.customPages.find(p => p.id === selectedPageId) || config.customPages[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* 1. TOP MASTER FLOATING BAR */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-amber-500/30 px-4 py-3 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 p-2 rounded-xl shadow-md">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">CONSTRUTOR VISUAL GLOBAL</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                MASTER DESIGNER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Personalize todo o sistema sem escrever código</p>
          </div>
        </div>

        {/* Device preview toggles */}
        <div className="hidden lg:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 space-x-1">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              deviceMode === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop (Grande)"
          >
            <Monitor className="h-4 w-4" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceMode('laptop')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              deviceMode === 'laptop' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Notebook"
          >
            <Laptop className="h-4 w-4" />
            <span>Notebook</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              deviceMode === 'tablet' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet"
          >
            <Tablet className="h-4 w-4" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              deviceMode === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Celular"
          >
            <Smartphone className="h-4 w-4" />
            <span>Celular</span>
          </button>
        </div>

        {/* Toggle Edit Mode / Scope / Save Actions */}
        <div className="flex items-center space-x-2">
          {/* Scope selection */}
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 hidden sm:flex space-x-1 text-[10px] font-bold">
            <button
              onClick={() => setApplyScope('global')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                applyScope === 'global' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Aplicar Globalmente
            </button>
            <button
              onClick={() => setApplyScope('page')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                applyScope === 'page' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 Somente nesta página
            </button>
          </div>

          <button
            onClick={() => handleSaveConfig(true)}
            disabled={saving}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-amber-400" />
            <span>Rascunho</span>
          </button>

          <button
            onClick={() => handleSaveConfig(false)}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Sparkle className="h-3.5 w-3.5 text-emerald-200" />
            <span>{saving ? 'Publicando...' : 'Publicar Alterações'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Fechar Construtor Visual"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN BUILDER WORKSPACE (3-COLUMN LAYOUT) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: NAVIGATION, THEMES, COMPONENT LIBRARY & PAGES */}
        <aside className="w-full md:w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
          
          {/* Sub-tabs */}
          <div className="grid grid-cols-5 p-2 bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400">
            <button
              onClick={() => setActiveSubTab('themes')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeSubTab === 'themes' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Temas e Cores Globais"
            >
              <Palette className="h-4 w-4" />
              <span>Tema</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pages')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeSubTab === 'pages' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Gestão de Menus e Páginas"
            >
              <Menu className="h-4 w-4" />
              <span>Páginas</span>
            </button>

            <button
              onClick={() => setActiveSubTab('library')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeSubTab === 'library' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Biblioteca de Componentes"
            >
              <Grid className="h-4 w-4" />
              <span>Widgets</span>
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeSubTab === 'history' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Histórico de Versões"
            >
              <History className="h-4 w-4" />
              <span>Histórico</span>
            </button>

            <button
              onClick={() => setActiveSubTab('white_label')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeSubTab === 'white_label' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Personalização por Empresa Cliente"
            >
              <Building2 className="h-4 w-4" />
              <span>Empresa</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            
            {/* SUB-TAB 1: GLOBAL THEME & DESIGN SYSTEM */}
            {activeSubTab === 'themes' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">DESIGN SYSTEM GLOBAL</h3>
                  <p className="text-[11px] text-slate-400">Alterações afetam todo o ecossistema do sistema.</p>
                </div>

                {/* Primary Color Picker */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 block">Cor Primária do Sistema</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, primaryColor: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="h-8 w-12 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, primaryColor: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded-lg px-2 py-1 w-24 uppercase font-bold"
                    />
                  </div>
                  {/* Preset Swatches */}
                  <div className="flex space-x-1.5 pt-1">
                    {['#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0f172a'].map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, primaryColor: c }));
                          setHasUnsavedChanges(true);
                        }}
                        className="h-6 w-6 rounded-full border border-slate-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Secondary Color Picker */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 block">Cor Secundária / Sidebar</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, secondaryColor: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="h-8 w-12 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.secondaryColor}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, secondaryColor: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded-lg px-2 py-1 w-24 uppercase font-bold"
                    />
                  </div>
                </div>

                {/* Typography Selector */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 block">Fonte Tipográfica Principal</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, fontFamily: e.target.value as any }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl p-2 font-bold"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                    <option value="Inter">Inter (Standard SaaS)</option>
                    <option value="Playfair Display">Playfair Display (Serif Elegante)</option>
                    <option value="Montserrat">Montserrat (Display Bold)</option>
                    <option value="Roboto">Roboto (Google Classic)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Developer/Tech)</option>
                  </select>
                </div>

                {/* Global Border Radius */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 block">Arredondamento dos Cards (Border Radius)</label>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                    {(['none', 'sm', 'lg', 'xl'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          setConfig(prev => ({ ...prev, borderRadius: r }));
                          setHasUnsavedChanges(true);
                        }}
                        className={`py-1.5 rounded-lg border transition-all ${
                          config.borderRadius === r ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold' : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Mode Toggle */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 block">Modo do Tema por Padrão</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      onClick={() => {
                        setConfig(prev => ({ ...prev, themeMode: 'light' }));
                        setHasUnsavedChanges(true);
                      }}
                      className={`p-2 rounded-xl border transition-all ${
                        config.themeMode === 'light' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      ☀️ Modo Claro
                    </button>
                    <button
                      onClick={() => {
                        setConfig(prev => ({ ...prev, themeMode: 'dark' }));
                        setHasUnsavedChanges(true);
                      }}
                      className={`p-2 rounded-xl border transition-all ${
                        config.themeMode === 'dark' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      🌙 Modo Escuro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PAGES & MENU STRUCTURE */}
            {activeSubTab === 'pages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">GESTÃO DE PÁGINAS</h3>
                    <p className="text-[11px] text-slate-400">Crie ou reordene as telas da plataforma.</p>
                  </div>
                  <button
                    onClick={() => setIsNewPageModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nova</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {config.customPages.map(page => (
                    <div
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedPageId === page.id
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Menu className="h-4 w-4 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-xs block leading-tight">{page.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">/{page.slug}</span>
                        </div>
                      </div>

                      {page.isInitialPage ? (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Inicial
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Excluir página "${page.title}"?`)) {
                              setConfig(prev => ({
                                ...prev,
                                customPages: prev.customPages.filter(p => p.id !== page.id)
                              }));
                              setHasUnsavedChanges(true);
                            }
                          }}
                          className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Excluir página"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: COMPONENT LIBRARY (WIDGET PALETTE) */}
            {activeSubTab === 'library' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">BIBLIOTECA DE COMPONENTES</h3>
                  <p className="text-[11px] text-slate-400">Clique para inserir o bloco na página atual.</p>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {[
                    { type: 'kpi', title: 'Card Métrica / KPI', icon: BarChart3, desc: 'Indicador numérico com status' },
                    { type: 'card', title: 'Card de Conteúdo', icon: Grid, desc: 'Container com título e texto' },
                    { type: 'table', title: 'Tabela de Dados', icon: Grid, desc: 'Listagem de registros com ação' },
                    { type: 'chart', title: 'Gráfico Analytics', icon: BarChart3, desc: 'Gráficos de barras e pizza' },
                    { type: 'calendar', title: 'Calendário / Escalas', icon: Calendar, desc: 'Escalas e compromissos' },
                    { type: 'kanban', title: 'Quadro Kanban ATS', icon: Layers, desc: 'Fluxo de etapas com drag' },
                    { type: 'banner', title: 'Banner Comunicado', icon: Sparkles, desc: 'Banner oficial em destaque' },
                    { type: 'form', title: 'Formulário Completo', icon: FileText, desc: 'Campos de entrada e cadastro' },
                    { type: 'input', title: 'Campo de Texto / Input', icon: MousePointer, desc: 'Entrada individual de dados' },
                    { type: 'button', title: 'Botão de Ação Rápida', icon: MousePointer, desc: 'Gatilho personalizável' },
                    { type: 'timeline', title: 'Linha do Tempo', icon: Clock, desc: 'Histórico e passos sequenciais' },
                    { type: 'upload', title: 'Envio de Documento', icon: Upload, desc: 'Upload com drag and drop' },
                    { type: 'widget_ia', title: 'Widget IA Assistente', icon: Sparkles, desc: 'Módulo de automação com IA' }
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => handleAddBlockToPage(item.type as any, item.title)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-start space-x-3 text-left transition-all cursor-pointer group hover:border-amber-500/50"
                    >
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 4: VERSION HISTORY */}
            {activeSubTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">HISTÓRICO DE PUBLICAÇÕES</h3>
                  <p className="text-[11px] text-slate-400">Restaure versões antigas a qualquer momento.</p>
                </div>

                <div className="space-y-2">
                  {historyList.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6 font-medium">Nenhum histórico gravado ainda.</p>
                  ) : (
                    historyList.map(hist => (
                      <div key={hist.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-amber-400">Versão v{hist.version}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(hist.updatedAt).toLocaleDateString('pt-BR')} {new Date(hist.updatedAt).toLocaleTimeString('pt-BR').slice(0, 5)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">{hist.summary}</p>
                        <button
                          onClick={() => handleRestoreHistory(hist)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3 text-amber-400" />
                          <span>Restaurar esta Versão</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 5: WHITE-LABEL PER COMPANY */}
            {activeSubTab === 'white_label' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">PERSONALIZAÇÃO POR CLIENTE</h3>
                  <p className="text-[11px] text-slate-400">Defina regras visuais exclusivas por empresa.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">Selecione a Empresa Cliente:</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl p-2.5 font-bold"
                  >
                    <option value="">-- Padrão Global da Plataforma --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (CNPJ: {c.cnpj || 'Inativo'})</option>
                    ))}
                  </select>
                </div>

                {selectedCompanyId && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-emerald-300 block">Empresa Selecionada</span>
                    <p className="text-[11px] text-slate-300">
                      As edições realizadas no Construtor Visual serão aplicadas com prioridade para este cliente especificamente, mantendo o logo e paleta personalizados.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </aside>

        {/* CENTER CANVAS AREA (LIVE DRAG AND DROP PREVIEW) */}
        <main className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto flex flex-col items-center justify-start relative space-y-5">
          
          {/* AI MASTER ASSISTANT PROMPT BAR */}
          <div className="w-full max-w-5xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 rounded-2xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-extrabold text-amber-300 uppercase tracking-wider">
                IA DO MASTER — GERADOR AUTOMÁTICO DE INTERFACE
              </span>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAiGenerateCommand();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder='Digite comandos como "Crie uma página de Financeiro", "Adicionar botão azul", "Criar módulo CRM"...'
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-xs text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className={`h-4 w-4 ${isAiGenerating ? 'animate-spin' : ''}`} />
                <span>{isAiGenerating ? 'Gerando...' : 'Gerar com IA'}</span>
              </button>
            </form>

            {/* Prompt Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-semibold">
              <span className="text-slate-500">Sugestões rápidas:</span>
              <button 
                type="button" 
                onClick={() => handleAiGenerateCommand('Crie uma página de Financeiro')}
                className="bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                + Página Financeiro
              </button>
              <button 
                type="button" 
                onClick={() => handleAiGenerateCommand('Criar módulo CRM e Vagas')}
                className="bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                + Módulo CRM
              </button>
              <button 
                type="button" 
                onClick={() => handleAiGenerateCommand('Adicionar botão azul')}
                className="bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                + Botão Azul
              </button>
              <button 
                type="button" 
                onClick={() => handleAiGenerateCommand('Criar dashboard executivo')}
                className="bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 px-2 py-1 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                + Dashboard Executivo
              </button>
            </div>
          </div>
          
          {/* Active Canvas Frame according to Device Mode */}
          <div
            className={`transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[600px] ${
              deviceMode === 'mobile' ? 'w-[380px]' :
              deviceMode === 'tablet' ? 'w-[680px]' :
              deviceMode === 'laptop' ? 'w-[920px]' : 'w-full max-w-5xl'
            }`}
            style={{ fontFamily: config.fontFamily }}
          >
            {/* Simulated App Header */}
            <header 
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ backgroundColor: config.headerBgColor || '#ffffff' }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-white shadow-md"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  G
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 leading-tight">{config.systemName}</h2>
                  <span className="text-[10px] text-slate-500 font-medium">Visualizando: {activePage.title}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
                  Modo Edição Ativo
                </span>
              </div>
            </header>

            {/* Simulated App Content Canvas */}
            <div className="p-6 flex-1 space-y-6 bg-slate-50">
              
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{activePage.title}</h1>
                  <p className="text-xs text-slate-500">
                    Módulos e blocos visuais ativos nesta página ({activePage.blocks.length})
                  </p>
                </div>
                
                <button
                  onClick={() => handleAddBlockToPage('kpi', 'Novo Indicador')}
                  className="text-xs font-extrabold px-3 py-2 rounded-xl text-white shadow-sm flex items-center space-x-1 cursor-pointer"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar Bloco</span>
                </button>
              </div>

              {/* Render Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePage.blocks.map(block => {
                  const isSelected = selectedBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      onClick={() => {
                        setSelectedBlockId(block.id);
                        setSelectedBlock(block);
                      }}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                        block.size === 'full' ? 'col-span-full' : 'col-span-1'
                      } ${
                        isSelected
                          ? 'border-amber-500 shadow-xl ring-4 ring-amber-500/20 bg-white'
                          : 'border-slate-200 hover:border-amber-400/60 bg-white hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: block.style?.bgColor || '#ffffff',
                        color: block.style?.textColor || '#0f172a',
                        borderRadius: block.style?.borderRadius || '16px'
                      }}
                    >
                      {/* Selection Badge & Action toolbar */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-slate-900/90 text-white p-1 rounded-lg text-[10px] shadow-lg z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveBlock(block.id, 'up');
                          }}
                          className="p-1 hover:bg-slate-700 rounded"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveBlock(block.id, 'down');
                          }}
                          className="p-1 hover:bg-slate-700 rounded"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                          className="p-1 hover:bg-rose-600 rounded text-rose-300"
                          title="Excluir bloco"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Block Contents */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                            {block.type}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                              Selecionado
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-extrabold leading-snug">{block.title}</h3>
                        {block.subtitle && (
                          <p className="text-xs text-slate-500 font-medium">{block.subtitle}</p>
                        )}

                        {/* Dummy visualization based on type */}
                        {block.type === 'kpi' && (
                          <div className="pt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-black" style={{ color: config.primaryColor }}>
                              1.248
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              +12.4% este mês
                            </span>
                          </div>
                        )}

                        {block.type === 'banner' && (
                          <div className="pt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
                            📢 Exemplo de comunicado oficial visível para todos os colaboradores no sistema.
                          </div>
                        )}

                        {block.type === 'chart' && (
                          <div className="h-24 bg-slate-100 rounded-xl flex items-end justify-between p-3 gap-2">
                            {[40, 65, 80, 50, 95, 70, 85].map((h, i) => (
                              <div
                                key={i}
                                className="w-full rounded-t-md transition-all"
                                style={{ height: `${h}%`, backgroundColor: config.primaryColor }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </main>

        {/* RIGHT PANEL: INSPECTOR (PAINEL DE PROPRIEDADES DO COMPONENTE) */}
        <aside className="w-full md:w-80 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0 p-4 space-y-6 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">PAINEL DE PROPRIEDADES</h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                {selectedBlock ? selectedBlock.type.toUpperCase() : 'SELEÇÃO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Edite texto, cores e dimensões visualmente.</p>
          </div>

          {selectedBlock ? (
            <div className="space-y-4">
              
              {/* Security & Scope Level Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl flex items-start space-x-2 text-[11px]">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-emerald-200">
                  <span className="font-extrabold block">Modo Visual Protegido</span>
                  <span className="text-[10px] text-emerald-300/80 leading-tight block">
                    Edições visuais e de layout ativas. Regras de negócio e banco de dados permanecem intactos.
                  </span>
                </div>
              </div>

              {/* Block Title */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block">Título do Componente</label>
                <input
                  type="text"
                  value={selectedBlock.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedBlock(prev => prev ? { ...prev, title: val } : null);
                    const updatedPages = config.customPages.map(page => ({
                      ...page,
                      blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, title: val } : b)
                    }));
                    setConfig(prev => ({ ...prev, customPages: updatedPages }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-lg p-2"
                />
              </div>

              {/* Block Subtitle */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block">Subtítulo / Descrição</label>
                <input
                  type="text"
                  value={selectedBlock.subtitle || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedBlock(prev => prev ? { ...prev, subtitle: val } : null);
                    const updatedPages = config.customPages.map(page => ({
                      ...page,
                      blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, subtitle: val } : b)
                    }));
                    setConfig(prev => ({ ...prev, customPages: updatedPages }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2"
                />
              </div>

              {/* Size Grid Toggle */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block">Largura no Grid</label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    onClick={() => {
                      const updatedPages = config.customPages.map(page => ({
                        ...page,
                        blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, size: 'third' as const } : b)
                      }));
                      setConfig(prev => ({ ...prev, customPages: updatedPages }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      selectedBlock.size === 'third' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    33% (1/3)
                  </button>
                  <button
                    onClick={() => {
                      const updatedPages = config.customPages.map(page => ({
                        ...page,
                        blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, size: 'half' as const } : b)
                      }));
                      setConfig(prev => ({ ...prev, customPages: updatedPages }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      selectedBlock.size === 'half' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    50% (Metade)
                  </button>
                  <button
                    onClick={() => {
                      const updatedPages = config.customPages.map(page => ({
                        ...page,
                        blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, size: 'full' as const } : b)
                      }));
                      setConfig(prev => ({ ...prev, customPages: updatedPages }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      selectedBlock.size === 'full' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    100% (Total)
                  </button>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-300 block">Cor de Fundo</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedBlock.style?.bgColor || '#ffffff'}
                      onChange={(e) => handleUpdateBlockStyle('bgColor', e.target.value)}
                      className="h-7 w-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300 font-bold">{selectedBlock.style?.bgColor || '#ffffff'}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-300 block">Cor do Texto</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={selectedBlock.style?.textColor || '#0f172a'}
                      onChange={(e) => handleUpdateBlockStyle('textColor', e.target.value)}
                      className="h-7 w-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300 font-bold">{selectedBlock.style?.textColor || '#0f172a'}</span>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block">Arredondamento de Bordas</label>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                  {['0px', '8px', '16px', '24px'].map(r => (
                    <button
                      key={r}
                      onClick={() => handleUpdateBlockStyle('borderRadius', r)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        selectedBlock.style?.borderRadius === r ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block Actions Toolbar */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    const newBlock = {
                      ...selectedBlock,
                      id: 'b-' + Date.now(),
                      title: selectedBlock.title + ' (Cópia)'
                    };
                    const updatedPages = config.customPages.map(page => {
                      if (page.id === selectedPageId) {
                        return { ...page, blocks: [...page.blocks, newBlock] };
                      }
                      return page;
                    });
                    setConfig(prev => ({ ...prev, customPages: updatedPages }));
                    setSelectedBlock(newBlock);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Duplicar Componente</span>
                </button>

                <button
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir Componente</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
              Clique em qualquer componente na tela central para editar suas propriedades visualmente.
            </div>
          )}
        </aside>

      </div>

      {/* 3. NEW PAGE MODAL */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">Criar Nova Página no Sistema</h3>
              <button
                onClick={() => setIsNewPageModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título da Página</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treinamento & Cursos"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPageModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md"
                >
                  Criar Página
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
