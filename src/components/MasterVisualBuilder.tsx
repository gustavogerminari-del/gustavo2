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
  Sparkle,
  Bot,
  Wand2,
  MessageSquare,
  Undo,
  Redo,
  Play,
  Video,
  Image as ImageIcon
} from 'lucide-react';

import {
  visualBuilderService,
  GlobalDesignSystemConfig,
  CustomVisualPage,
  VisualBuilderBlock,
  ComponentStyleOverride,
  DesignerVersionHistory,
  AiDesignerLog,
  ClientModel,
  CustomFieldDefinition,
  DEFAULT_GLOBAL_DESIGN,
  DEFAULT_CLIENT_MODELS
} from '../services/visualBuilderService';

import { aiDesignerEngine, AiProposal } from '../services/aiDesignerEngine';

import { SaaSCompany } from '../types_master';

interface MasterVisualBuilderProps {
  currentUserRole?: string;
  companies?: SaaSCompany[];
  initialPageId?: string;
  onClose?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function MasterVisualBuilder({
  currentUserRole = 'MASTER',
  companies = [],
  initialPageId,
  onClose,
  triggerToast
}: MasterVisualBuilderProps) {
  // Main state
  const [config, setConfig] = useState<GlobalDesignSystemConfig>(DEFAULT_GLOBAL_DESIGN);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'pages' | 'library' | 'themes' | 'menus' | 'white_label' | 'history' | 'ai_designer'>(
    initialPageId && initialPageId !== 'page-dashboard' ? 'pages' : 'dashboard'
  );
  
  // Undo & Redo stacks
  const [undoStack, setUndoStack] = useState<GlobalDesignSystemConfig[]>([]);
  const [redoStack, setRedoStack] = useState<GlobalDesignSystemConfig[]>([]);

  // Device Preview Mode
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');

  // Selected element for live inspector
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('b-1');
  const [selectedBlock, setSelectedBlock] = useState<VisualBuilderBlock | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId || 'page-dashboard');

  // AI Master Assistant state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [currentAiProposal, setCurrentAiProposal] = useState<AiProposal | null>(null);
  const [aiLogsList, setAiLogsList] = useState<AiDesignerLog[]>([]);

  // Scope toggle
  const [applyScope, setApplyScope] = useState<'global' | 'page'>('global');

  // History & Status
  const [historyList, setHistoryList] = useState<DesignerVersionHistory[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Security authorization check for MASTER_BUILDER
  const isAuthorized = ['MASTER', 'OWNER', 'Master', 'MASTER_BUILDER'].includes(currentUserRole);

  const updateConfigWithHistory = (newConfig: GlobalDesignSystemConfig) => {
    setUndoStack(prev => [...prev.slice(-15), config]);
    setRedoStack([]);
    setConfig(newConfig);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, config]);
    setUndoStack(prev => prev.slice(0, -1));
    setConfig(previous);
    if (triggerToast) triggerToast('↺ Ação desfeita com sucesso!');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, config]);
    setRedoStack(prev => prev.slice(0, -1));
    setConfig(next);
    if (triggerToast) triggerToast('↻ Ação refeita com sucesso!');
  };

  // New Page & Template Modal State (PROMPT 06)
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState<boolean>(false);
  const [newPageTitle, setNewPageTitle] = useState<string>('');
  const [newPageIcon, setNewPageIcon] = useState<string>('LayoutDashboard');
  const [isLivePreviewMode, setIsLivePreviewMode] = useState<boolean>(false);
  const [isPageSettingsModalOpen, setIsPageSettingsModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [pageSettings, setPageSettings] = useState({
    title: '',
    slug: '',
    iconName: 'LayoutDashboard',
    isInitialPage: false,
    visible: true,
    permissionLevel: '3_developer' as '1_design' | '2_layout' | '3_developer'
  });

  // Keyboard Shortcuts for Undo/Redo & Delete block
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (isInput) return;
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        if (isInput) return;
        handleRedo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
        if (isInput) return;
        handleDeleteBlock(selectedBlockId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, config, selectedBlockId]);

  // Selected White-label Company
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // CLIENT MODELS STATE (PROMPT 05)
  const [clientModelsList, setClientModelsList] = useState<ClientModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('model-logistica');
  const [editingModel, setEditingModel] = useState<ClientModel | null>(null);
  const [activeModelSection, setActiveModelSection] = useState<'identidade' | 'modulos' | 'menus' | 'campos' | 'plano'>('identidade');

  // Custom Field Form State
  const [newCfLabel, setNewCfLabel] = useState('');
  const [newCfFieldName, setNewCfFieldName] = useState('');
  const [newCfModule, setNewCfModule] = useState<'funcionarios' | 'recrutamento' | 'ponto' | 'folha' | 'ferias' | 'beneficios' | 'geral'>('funcionarios');
  const [newCfType, setNewCfType] = useState<'text' | 'number' | 'date' | 'select' | 'boolean'>('text');
  const [newCfOptions, setNewCfOptions] = useState('');
  const [newCfRequired, setNewCfRequired] = useState(false);

  // Load configuration
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await visualBuilderService.loadGlobalConfig();
      setConfig(data);
      setHistoryList(visualBuilderService.getHistory());
      setAiLogsList(visualBuilderService.getAiLogs());

      // Load Client Models (PROMPT 05)
      const models = visualBuilderService.getClientModels();
      setClientModelsList(models);
      if (models.length > 0) {
        setSelectedModelId(models[0].id);
        setEditingModel(JSON.parse(JSON.stringify(models[0])));
      }

      const targetId = initialPageId || 'page-dashboard';
      const foundPage = data.customPages.find(p => p.id === targetId) || data.customPages[0];
      if (foundPage) {
        setSelectedPageId(foundPage.id);
        if (foundPage.blocks.length > 0) {
          setSelectedBlockId(foundPage.blocks[0].id);
          setSelectedBlock(foundPage.blocks[0]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [initialPageId]);

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

  // Open & Save Page Settings Modal (PROMPT 06)
  const handleOpenPageSettings = () => {
    const page = config.customPages.find(p => p.id === selectedPageId);
    if (!page) return;
    setPageSettings({
      title: page.title,
      slug: page.slug,
      iconName: page.iconName || 'LayoutDashboard',
      isInitialPage: !!page.isInitialPage,
      visible: page.visible,
      permissionLevel: '3_developer'
    });
    setIsPageSettingsModalOpen(true);
  };

  const handleSavePageSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPages = config.customPages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          title: pageSettings.title,
          slug: pageSettings.slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          iconName: pageSettings.iconName,
          isInitialPage: pageSettings.isInitialPage,
          visible: pageSettings.visible
        };
      }
      if (pageSettings.isInitialPage) {
        return { ...page, isInitialPage: false };
      }
      return page;
    });

    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    setIsPageSettingsModalOpen(false);
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast('✓ Configurações da página salvas!');
  };

  // Duplicate Page
  const handleDuplicatePage = (pageId: string) => {
    const target = config.customPages.find(p => p.id === pageId);
    if (!target) return;

    const newPage: CustomVisualPage = {
      ...JSON.parse(JSON.stringify(target)),
      id: `page-${Date.now()}`,
      title: `${target.title} (Cópia)`,
      slug: `${target.slug}-copia`,
      order: config.customPages.length + 1
    };

    setConfig(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
    setSelectedPageId(newPage.id);
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast(`✓ Página "${newPage.title}" duplicada!`);
  };

  // Delete Page
  const handleDeletePage = (pageId: string) => {
    if (config.customPages.length <= 1) {
      alert('É necessário manter pelo menos uma página no sistema.');
      return;
    }
    const pageToDelete = config.customPages.find(p => p.id === pageId);
    if (confirm(`Tem certeza que deseja excluir a página "${pageToDelete?.title}"?`)) {
      const updated = config.customPages.filter(p => p.id !== pageId);
      setConfig(prev => ({ ...prev, customPages: updated }));
      if (selectedPageId === pageId) {
        setSelectedPageId(updated[0].id);
      }
      setHasUnsavedChanges(true);
      if (triggerToast) triggerToast('✓ Página excluída com sucesso!');
    }
  };

  // Apply Pre-made Page Template (PROMPT 06)
  const handleApplyTemplateToNewPage = (templateKey: string) => {
    const timestamp = Date.now();
    let title = 'Nova Página';
    let slug = 'nova-pagina';
    let iconName = 'Layout';
    let blocks: VisualBuilderBlock[] = [];

    if (templateKey === 'dashboard_rh') {
      title = 'Dashboard RH Executivo';
      slug = 'dashboard-rh';
      iconName = 'BarChart3';
      blocks = [
        { id: `b-tmpl-banner-${timestamp}`, type: 'banner', title: '📢 Painel de Comunicação & Metas de RH', subtitle: 'Acompanhamento em tempo real do ecossistema GestRH', size: 'full', order: 1, style: { bgColor: '#1e1b4b', textColor: '#e0e7ff', borderRadius: '16px', padding: '20px' } },
        { id: `b-tmpl-kpi1-${timestamp}`, type: 'kpi', title: 'Colaboradores Ativos (Headcount)', subtitle: '342 cadastrados (+8 este mês)', size: 'half', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-kpi2-${timestamp}`, type: 'kpi', title: 'Taxa de Turnover Anual', subtitle: '1.4% (Meta: <2.5%)', size: 'half', order: 3, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-chart-${timestamp}`, type: 'chart', title: 'Evolução de Admissões vs Desligamentos', subtitle: 'Analytics dos últimos 6 meses', size: 'full', order: 4, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-table-${timestamp}`, type: 'table', title: 'Próximos Aniversariantes & Tempo de Casa', subtitle: 'Celebrações do mês', size: 'full', order: 5, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
      ];
    } else if (templateKey === 'funcionarios') {
      title = 'Gestão de Colaboradores & Dossiê';
      slug = 'funcionarios-dossie';
      iconName = 'Users';
      blocks = [
        { id: `b-tmpl-title-${timestamp}`, type: 'title', title: 'Quadro de Funcionários & Equipes', subtitle: 'Consulte registros, documentos e informações contratuais', size: 'full', order: 1, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-list-${timestamp}`, type: 'list', title: 'Diretório Interativo de Colaboradores', subtitle: 'Busca rápida por nome, cargo ou unidade', size: 'full', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-form-${timestamp}`, type: 'form', title: 'Admissão Rápida & Cadastro', subtitle: 'Preencha os dados contratuais do novo colaborador', size: 'full', order: 3, style: { bgColor: '#f8fafc', textColor: '#0f172a', borderRadius: '16px' } }
      ];
    } else if (templateKey === 'recrutamento') {
      title = 'Recrutamento & Seleção (ATS)';
      slug = 'recrutamento-vagas';
      iconName = 'Briefcase';
      blocks = [
        { id: `b-tmpl-kanban-${timestamp}`, type: 'kanban', title: 'Pipeline de Processos Seletivos Ativos', subtitle: 'Triagem ➔ Entrevista ➔ Teste Técnico ➔ Proposta', size: 'full', order: 1, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-table-${timestamp}`, type: 'table', title: 'Banco de Talentos & Candidatos Qualificados', subtitle: 'Filtrados com auxílio da Inteligência Artificial GestRH', size: 'full', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
      ];
    } else if (templateKey === 'portal_funcionario') {
      title = 'Portal do Colaborador';
      slug = 'portal-colaborador';
      iconName = 'User';
      blocks = [
        { id: `b-tmpl-banner-${timestamp}`, type: 'banner', title: 'Portal do Colaborador — Área Pessoal', subtitle: 'Acesse seu ponto eletrônico, holerites e solicitações', size: 'full', order: 1, style: { bgColor: '#0284c7', textColor: '#ffffff', borderRadius: '16px' } },
        { id: `b-tmpl-ponto-${timestamp}`, type: 'ponto', title: 'Registro de Ponto Eletrônico (Geolocalizado)', subtitle: 'Sua jornada em tempo real', size: 'half', order: 2, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-cal-${timestamp}`, type: 'calendar', title: 'Meu Calendário de Férias & Escalados', subtitle: 'Programação pessoal de descansos', size: 'half', order: 3, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } },
        { id: `b-tmpl-up-${timestamp}`, type: 'upload', title: 'Envio de Dossiê & Atestados', subtitle: 'Faça upload de comprovantes ou documentos pendentes', size: 'full', order: 4, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
      ];
    } else {
      title = newPageTitle.trim() || 'Nova Página Vazia';
      slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      iconName = 'Square';
      blocks = [
        { id: `b-tmpl-blank-${timestamp}`, type: 'banner', title: title, subtitle: 'Arraste componentes da biblioteca para montar este espaço', size: 'full', order: 1, style: { bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '16px' } }
      ];
    }

    const newPage: CustomVisualPage = {
      id: `page-${timestamp}`,
      title,
      slug,
      iconName,
      visible: true,
      order: config.customPages.length + 1,
      blocks
    };

    setConfig(prev => ({ ...prev, customPages: [...prev.customPages, newPage] }));
    setSelectedPageId(newPage.id);
    setIsTemplateModalOpen(false);
    setIsNewPageModalOpen(false);
    setNewPageTitle('');
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast(`✨ Página "${title}" criada a partir do modelo!`);
  };

  // Toggle Block Lock / Hide
  const handleToggleLockBlock = (blockId: string) => {
    const updatedPages = config.customPages.map(page => ({
      ...page,
      blocks: page.blocks.map(b => b.id === blockId ? { ...b, isLocked: !b.isLocked } : b)
    }));
    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    if (selectedBlock && selectedBlock.id === blockId) {
      setSelectedBlock({ ...selectedBlock, isLocked: !selectedBlock.isLocked });
    }
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast('✓ Trava do elemento atualizada!');
  };

  const handleToggleHideBlock = (blockId: string) => {
    const updatedPages = config.customPages.map(page => ({
      ...page,
      blocks: page.blocks.map(b => b.id === blockId ? { ...b, hidden: !b.hidden } : b)
    }));
    setConfig(prev => ({ ...prev, customPages: updatedPages }));
    if (selectedBlock && selectedBlock.id === blockId) {
      setSelectedBlock({ ...selectedBlock, hidden: !selectedBlock.hidden });
    }
    setHasUnsavedChanges(true);
    if (triggerToast) triggerToast('✓ Visibilidade do elemento atualizada!');
  };

  // Restore history version
  const handleRestoreHistory = async (hist: DesignerVersionHistory) => {
    if (window.confirm(`Deseja restaurar a versão v${hist.version} criada em ${new Date(hist.updatedAt).toLocaleString('pt-BR')}?`)) {
      setConfig(hist.config);
      await visualBuilderService.saveGlobalConfig(hist.config, 'MASTER', `Restaurada versão v${hist.version}`);
      if (triggerToast) triggerToast(`✓ Versão v${hist.version} restaurada com sucesso!`);
    }
  };

  // CLIENT MODELS HANDLERS (PROMPT 05)
  const handleSelectClientModel = (modelId: string) => {
    setSelectedModelId(modelId);
    const found = clientModelsList.find(m => m.id === modelId);
    if (found) {
      setEditingModel(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleSaveClientModel = async () => {
    if (!editingModel) return;
    const updatedList = await visualBuilderService.saveClientModel(editingModel);
    setClientModelsList(updatedList);
    if (triggerToast) triggerToast(`✓ Modelo "${editingModel.modelName}" salvo com sucesso!`);
  };

  const handleCreateNewClientModel = () => {
    const newId = 'model-' + Date.now();
    const newModel: ClientModel = {
      id: newId,
      companyName: 'Empresa Cliente Exemplo',
      modelName: 'Novo Modelo RH',
      planTier: 'profissional',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branding: {
        systemName: 'GestRH Custom',
        primaryColor: '#059669',
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
      customFields: []
    };
    setEditingModel(newModel);
    setSelectedModelId(newId);
  };

  const handleDuplicateClientModel = async () => {
    if (!selectedModelId) return;
    try {
      const res = await visualBuilderService.duplicateClientModel(selectedModelId);
      setClientModelsList(res.list);
      setSelectedModelId(res.newModel.id);
      setEditingModel(res.newModel);
      if (triggerToast) triggerToast(`✓ Modelo duplicado como "${res.newModel.modelName}"!`);
    } catch (e: any) {
      alert(e.message || 'Erro ao duplicar modelo.');
    }
  };

  const handleDeleteClientModel = async () => {
    if (!selectedModelId) return;
    if (clientModelsList.length <= 1) {
      alert('É necessário manter pelo menos um modelo de cliente no sistema.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este modelo de cliente?')) {
      const newList = await visualBuilderService.deleteClientModel(selectedModelId);
      setClientModelsList(newList);
      if (newList.length > 0) {
        setSelectedModelId(newList[0].id);
        setEditingModel(JSON.parse(JSON.stringify(newList[0])));
      }
      if (triggerToast) triggerToast('Modelo de cliente excluído com sucesso.');
    }
  };

  const handleRestoreClientModel = async () => {
    if (!selectedModelId) return;
    if (confirm('Deseja restaurar as configurações originais deste modelo?')) {
      const newList = await visualBuilderService.restoreClientModelToDefault(selectedModelId);
      setClientModelsList(newList);
      const restored = newList.find(m => m.id === selectedModelId);
      if (restored) setEditingModel(JSON.parse(JSON.stringify(restored)));
      if (triggerToast) triggerToast('✓ Modelo restaurado para as configurações padrão.');
    }
  };

  const handleApplyClientModelToGlobal = async () => {
    if (!editingModel) return;
    // Apply branding to global system
    const updatedGlobalConfig: GlobalDesignSystemConfig = {
      ...config,
      systemName: editingModel.branding.systemName || editingModel.companyName,
      logoUrl: editingModel.branding.logoUrl || config.logoUrl,
      primaryColor: editingModel.branding.primaryColor,
      secondaryColor: editingModel.branding.secondaryColor,
      accentColor: editingModel.branding.accentColor,
      fontFamily: (editingModel.branding.fontFamily as any) || config.fontFamily,
      themeMode: editingModel.branding.themeMode
    };

    updateConfigWithHistory(updatedGlobalConfig);
    await visualBuilderService.saveGlobalConfig(
      updatedGlobalConfig,
      currentUserRole,
      `Aplicação do Modelo de Cliente: ${editingModel.modelName}`
    );

    if (triggerToast) triggerToast(`🚀 Modelo "${editingModel.modelName}" aplicado ao sistema com sucesso!`);
  };

  const handleAddCustomField = () => {
    if (!editingModel || !newCfLabel.trim()) return;
    const key = newCfFieldName.trim().toLowerCase().replace(/\s+/g, '_') || 'campo_' + Date.now();
    const newField: CustomFieldDefinition = {
      id: 'cf-' + Date.now(),
      targetModule: newCfModule,
      label: newCfLabel.trim(),
      fieldName: key,
      fieldType: newCfType,
      options: newCfType === 'select' ? newCfOptions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      required: newCfRequired
    };

    setEditingModel({
      ...editingModel,
      customFields: [...(editingModel.customFields || []), newField]
    });

    setNewCfLabel('');
    setNewCfFieldName('');
    setNewCfOptions('');
    setNewCfRequired(false);
    if (triggerToast) triggerToast(`✓ Campo "${newField.label}" adicionado ao modelo!`);
  };

  const handleRemoveCustomField = (fieldId: string) => {
    if (!editingModel) return;
    setEditingModel({
      ...editingModel,
      customFields: editingModel.customFields.filter(f => f.id !== fieldId)
    });
  };

  // AI Proposal Handlers
  const handleAiAnalyzeCommand = (inputPrompt?: string) => {
    const textToAnalyze = inputPrompt || aiPrompt;
    if (!textToAnalyze.trim()) return;

    setIsAiGenerating(true);
    setTimeout(() => {
      const proposal = aiDesignerEngine.analyzeCommand(textToAnalyze, config, selectedPageId);
      setCurrentAiProposal(proposal);
      setIsAiGenerating(false);
    }, 400);
  };

  const handleApproveProposal = async () => {
    if (!currentAiProposal) return;

    if (currentAiProposal.isBlocked) {
      alert(currentAiProposal.blockedReason || 'Operação bloqueada por segurança.');
      return;
    }

    if (currentAiProposal.newConfigState) {
      updateConfigWithHistory(currentAiProposal.newConfigState);
      
      // Auto-save
      await visualBuilderService.saveGlobalConfig(
        currentAiProposal.newConfigState,
        currentUserRole,
        `IA Designer: ${currentAiProposal.summary}`
      );
      setHistoryList(visualBuilderService.getHistory());
    }

    // Save AI Log
    const logEntry: AiDesignerLog = {
      id: 'ailog-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUserRole,
      command: currentAiProposal.command,
      pageId: currentAiProposal.pageId,
      pageTitle: currentAiProposal.pageTitle,
      status: 'applied',
      summary: currentAiProposal.summary
    };
    visualBuilderService.addAiLog(logEntry);
    setAiLogsList(visualBuilderService.getAiLogs());

    if (triggerToast) triggerToast('✓ Alterações da IA aplicadas e salvas com sucesso!');
    setCurrentAiProposal(null);
    setAiPrompt('');
  };

  const handleDiscardProposal = () => {
    if (!currentAiProposal) return;

    const logEntry: AiDesignerLog = {
      id: 'ailog-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUserRole,
      command: currentAiProposal.command,
      pageId: currentAiProposal.pageId,
      pageTitle: currentAiProposal.pageTitle,
      status: currentAiProposal.isBlocked ? 'blocked' : 'rejected',
      summary: currentAiProposal.summary
    };
    visualBuilderService.addAiLog(logEntry);
    setAiLogsList(visualBuilderService.getAiLogs());

    setCurrentAiProposal(null);
    if (triggerToast) triggerToast('Proposta da IA descartada.');
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

        {/* Toggle Edit Mode / Undo / Redo / Scope / Save Actions */}
        <div className="flex items-center space-x-2">
          {/* Undo / Redo */}
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                undoStack.length > 0 ? 'text-amber-400 hover:bg-slate-700 hover:text-white cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Desfazer (Undo)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                redoStack.length > 0 ? 'text-amber-400 hover:bg-slate-700 hover:text-white cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Refazer (Redo)"
            >
              <RotateCcw className="h-3.5 w-3.5 scale-x-[-1]" />
            </button>
          </div>

          {/* Live Preview Mode toggle (Wix style) */}
          <button
            onClick={() => setIsLivePreviewMode(!isLivePreviewMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              isLivePreviewMode ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Visualizar a página exatamente como o cliente verá"
          >
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            <span>{isLivePreviewMode ? 'Sair da Visualização' : 'Visualizar Página'}</span>
          </button>

          {/* Configurações da Página atual */}
          <button
            onClick={handleOpenPageSettings}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700"
            title="Configurações e rota da página atual"
          >
            <Settings className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden md:inline">Configurações da Página</span>
          </button>

          {/* Histórico de Versões */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700"
            title="Histórico de versões salvas"
          >
            <History className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Histórico</span>
          </button>

          {/* Scope selection */}
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 hidden sm:flex space-x-1 text-[10px] font-bold">
            <button
              onClick={() => setApplyScope('global')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                applyScope === 'global' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Global
            </button>
            <button
              onClick={() => setApplyScope('page')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                applyScope === 'page' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 Esta página
            </button>
          </div>

          <button
            onClick={() => handleSaveConfig(true)}
            disabled={saving}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-amber-400" />
            <span>Salvar Rascunho</span>
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
          
          {/* Sub-tabs per PROMPT 01 & PROMPT 04 */}
          <div className="grid grid-cols-4 sm:grid-cols-8 p-1 bg-slate-950 border-b border-slate-800 text-[9px] font-bold text-slate-400 gap-0.5">
            <button
              onClick={() => { setActiveSubTab('dashboard'); setSelectedPageId('page-dashboard'); }}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'dashboard' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Dashboard Builder"
            >
              <Layout className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Dash</span>
            </button>

            <button
              onClick={() => setActiveSubTab('ai_designer')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-all ${
                activeSubTab === 'ai_designer' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' : 'text-amber-400 hover:bg-slate-800 hover:text-amber-300'
              }`}
              title="IA Designer - Assistente Master No-Code"
            >
              <Bot className="h-3.5 w-3.5 animate-pulse" />
              <span className="truncate w-full text-center">IA Master</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pages')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'pages' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Gestão de Páginas"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Páginas</span>
            </button>

            <button
              onClick={() => setActiveSubTab('library')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'library' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Biblioteca de Componentes"
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Comp.</span>
            </button>

            <button
              onClick={() => setActiveSubTab('themes')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'themes' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Temas e Cores Globais"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Temas</span>
            </button>

            <button
              onClick={() => setActiveSubTab('menus')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'menus' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Estrutura de Menus"
            >
              <Menu className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Menus</span>
            </button>

            <button
              onClick={() => setActiveSubTab('white_label')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'white_label' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Modelos por Cliente"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Modelos</span>
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`py-2 rounded-lg flex flex-col items-center justify-center space-y-0.5 transition-colors ${
                activeSubTab === 'history' ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30' : 'hover:bg-slate-800 hover:text-white'
              }`}
              title="Histórico de Alterações"
            >
              <History className="h-3.5 w-3.5" />
              <span className="truncate w-full text-center">Histórico</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            
            {/* SUB-TAB 0: IA DESIGNER (MASTER AI) */}
            {activeSubTab === 'ai_designer' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 p-3 rounded-2xl border border-amber-500/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <Bot className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
                    <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">🤖 IA DESIGNER (MASTER AI)</h3>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Descreva o que deseja alterar e a IA gerará layouts, componentes, temas e páginas automaticamente.
                  </p>
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-amber-500/20 text-[10px] font-mono text-amber-300/80">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Nível de Acesso: {currentUserRole}</span>
                  </div>
                </div>

                {/* PROMPT INPUT AREA */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-200 block">
                    Solicitação do Desenvolvedor:
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Descreva o que deseja alterar... (Ex: Crie um card de funcionários, mude a cor do menu para azul ou crie uma página de férias)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none font-sans"
                  />
                  <button
                    type="button"
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    onClick={() => handleAiAnalyzeCommand()}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-amber-500/20 border border-amber-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                        <span>Analisando e Gerando Proposta...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 text-slate-950" />
                        <span>Gerar Alteração</span>
                      </>
                    )}
                  </button>
                </div>

                {/* PREVIEW PROPOSAL / PROPOSTA DA IA */}
                {currentAiProposal && (
                  <div className={`p-3.5 rounded-xl border space-y-3 animate-in fade-in ${
                    currentAiProposal.isBlocked
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : 'bg-slate-900 border-amber-500/40 text-slate-100'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        {currentAiProposal.isBlocked ? (
                          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                        )}
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                          {currentAiProposal.isBlocked ? 'OPERAÇÃO BLOQUEADA' : 'PRÉVIA DE PROPOSTA DA IA'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        Página: {currentAiProposal.pageTitle}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">{currentAiProposal.summary}</h4>
                      <p className="text-[11px] font-mono text-amber-300/90 bg-slate-950/80 p-2 rounded-lg border border-slate-800 italic">
                        "{currentAiProposal.command}"
                      </p>
                    </div>

                    {currentAiProposal.isBlocked ? (
                      <div className="p-2.5 bg-rose-900/30 rounded-lg border border-rose-500/30 text-[11px] text-rose-300 font-medium">
                        {currentAiProposal.blockedReason}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detalhes das Alterações:</span>
                        <ul className="space-y-1">
                          {currentAiProposal.changesDetails.map((detail, idx) => (
                            <li key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CONFIRMATION / APPROVAL ACTION BUTTONS */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                      {currentAiProposal.isBlocked ? (
                        <button
                          type="button"
                          onClick={handleDiscardProposal}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
                        >
                          Entendi e Ciente
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleApproveProposal}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2 rounded-lg shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Aprovar & Aplicar</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDiscardProposal}
                            className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
                          >
                            Descartar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* SUGESTÕES DE COMANDOS RÁPIDOS */}
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                    ⚡ COMANDOS RÁPIDOS PRÉ-CONFIGURADOS
                  </span>

                  {/* Design */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">🎨 Design & Estilo:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Deixe essa página mais moderna',
                        'Altere o layout para estilo corporativo',
                        'Organize melhor os cards',
                        'Crie um dashboard mais limpo',
                        'Ajuste para tema escuro'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          onClick={() => {
                            setAiPrompt(cmd);
                            handleAiAnalyzeCommand(cmd);
                          }}
                          className="text-[10px] bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-left transition-colors cursor-pointer"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Componentes */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">🧩 Componentes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Adicionar um botão novo',
                        'Criar um card de funcionários',
                        'Adicionar uma tabela',
                        'Criar um formulário',
                        'Adicionar gráfico de admissões'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          onClick={() => {
                            setAiPrompt(cmd);
                            handleAiAnalyzeCommand(cmd);
                          }}
                          className="text-[10px] bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-left transition-colors cursor-pointer"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Páginas */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">📄 Novas Páginas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Crie uma página de férias',
                        'Crie uma página de benefícios',
                        'Crie uma página de treinamentos',
                        'Crie um módulo de avaliações'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          onClick={() => {
                            setAiPrompt(cmd);
                            handleAiAnalyzeCommand(cmd);
                          }}
                          className="text-[10px] bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-left transition-colors cursor-pointer"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Modelos */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">🏢 Modelos Automáticos:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Crie um modelo para uma empresa pequena',
                        'Modelo para consultoria de RH'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          onClick={() => {
                            setAiPrompt(cmd);
                            handleAiAnalyzeCommand(cmd);
                          }}
                          className="text-[10px] bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-left transition-colors cursor-pointer"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HISTÓRICO DE COMANDOS DA IA */}
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                      📋 HISTÓRICO DE COMANDOS DA IA
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Total: {aiLogsList.length}
                    </span>
                  </div>

                  {aiLogsList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-4 font-medium">
                      Nenhum comando executado na sessão atual.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {aiLogsList.map((log) => (
                        <div key={log.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate max-w-[180px]">{log.summary}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                              log.status === 'applied' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              log.status === 'blocked' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {log.status === 'applied' ? 'Aplicado' : log.status === 'blocked' ? 'Bloqueado' : 'Descartado'}
                            </span>
                          </div>
                          <p className="text-slate-400 font-mono text-[10px]">"{log.command}"</p>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/80">
                            <span>Usuário: {log.user}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString('pt-BR').slice(0, 5)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 0: DASHBOARD BUILDER */}
            {activeSubTab === 'dashboard' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">DASHBOARD BUILDER</h3>
                  <p className="text-[11px] text-slate-400">Monte o Dashboard principal arranjando KPIs, gráficos e comunicados.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">Página Ativa: Dashboard Executivo</span>
                  <button
                    onClick={() => setSelectedPageId('page-dashboard')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Layout className="h-4 w-4" />
                    <span>Editar Blocos do Dashboard</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Atalhos de Inserção Rápida:</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleAddBlockToPage('kpi', 'Card KPI de Métrica RH')}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <span>+ Adicionar Card de Métrica / KPI</span>
                    </button>
                    <button
                      onClick={() => handleAddBlockToPage('chart', 'Gráfico de Desempenho / Headcount')}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      <BarChart3 className="h-4 w-4 text-sky-400" />
                      <span>+ Adicionar Gráfico Analytics</span>
                    </button>
                    <button
                      onClick={() => handleAddBlockToPage('banner', 'Banner de Comunicado Oficial')}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>+ Adicionar Banner Comunicado</span>
                    </button>
                    <button
                      onClick={() => handleAddBlockToPage('table', 'Tabela de Dados / Aniversariantes')}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      <Grid className="h-4 w-4 text-purple-400" />
                      <span>+ Adicionar Tabela de Registros</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

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

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {/* BÁSICOS */}
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block mb-1.5 px-1 bg-amber-500/10 py-1 rounded">
                      1. COMPONENTES BÁSICOS
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { type: 'text', title: 'Texto / Título', icon: Type, desc: 'Títulos e parágrafos personalizáveis' },
                        { type: 'button', title: 'Botão de Ação', icon: MousePointer, desc: 'Gatilho personalizável de link/ação' },
                        { type: 'image', title: 'Imagem / Mídia', icon: Globe, desc: 'Banner de imagem ou logotipo' },
                        { type: 'divisor', title: 'Separador / Divisor', icon: Square, desc: 'Linha de divisão estética' },
                        { type: 'card', title: 'Container / Card', icon: Grid, desc: 'Caixa de agrupamento de conteúdo' },
                        { type: 'banner', title: 'Banner Comunicado', icon: Sparkles, desc: 'Banner oficial de comunicados' }
                      ].map(item => (
                        <button
                          key={item.type}
                          onClick={() => handleAddBlockToPage(item.type as any, item.title)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-start space-x-2.5 text-left transition-all cursor-pointer group hover:border-amber-500/50"
                        >
                          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">{item.title}</span>
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DADOS */}
                  <div>
                    <span className="text-[10px] font-extrabold text-sky-300 uppercase tracking-wider block mb-1.5 px-1 bg-sky-500/10 py-1 rounded">
                      2. COMPONENTES DE DADOS
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { type: 'table', title: 'Tabela de Dados', icon: Grid, desc: 'Listagem interativa de registros' },
                        { type: 'list', title: 'Lista de Itens', icon: FileText, desc: 'Feed vertical de informações' },
                        { type: 'form', title: 'Formulário Completo', icon: FileText, desc: 'Campos de entrada e cadastro' },
                        { type: 'input', title: 'Campo de Texto / Input', icon: MousePointer, desc: 'Entrada individual de dados' },
                        { type: 'select', title: 'Filtro / Pesquisa', icon: Sliders, desc: 'Barra de busca e filtros' }
                      ].map(item => (
                        <button
                          key={item.type}
                          onClick={() => handleAddBlockToPage(item.type as any, item.title)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-start space-x-2.5 text-left transition-all cursor-pointer group hover:border-sky-500/50"
                        >
                          <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors shrink-0">
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">{item.title}</span>
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DASHBOARD */}
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block mb-1.5 px-1 bg-emerald-500/10 py-1 rounded">
                      3. DASHBOARD & ANALYTICS
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { type: 'kpi', title: 'Card Métrica / KPI', icon: BarChart3, desc: 'Indicador numérico com status' },
                        { type: 'chart', title: 'Gráfico Analytics', icon: BarChart3, desc: 'Gráficos de barras e pizza' },
                        { type: 'calendar', title: 'Calendário / Escalas', icon: Calendar, desc: 'Escalas e compromissos' },
                        { type: 'kanban', title: 'Quadro Kanban ATS', icon: Layers, desc: 'Fluxo de etapas com drag' },
                        { type: 'timeline', title: 'Linha do Tempo', icon: Clock, desc: 'Histórico e passos sequenciais' },
                        { type: 'upload', title: 'Envio de Documento', icon: Upload, desc: 'Upload com drag and drop' },
                        { type: 'widget_ia', title: 'Widget IA Assistente', icon: Sparkles, desc: 'Módulo de automação com IA' }
                      ].map(item => (
                        <button
                          key={item.type}
                          onClick={() => handleAddBlockToPage(item.type as any, item.title)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-start space-x-2.5 text-left transition-all cursor-pointer group hover:border-emerald-500/50"
                        >
                          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0">
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">{item.title}</span>
                            <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-TAB 3.5: MENUS */}
            {activeSubTab === 'menus' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">ESTRUTURA DE MENUS</h3>
                    <p className="text-[11px] text-slate-400">Personalize nomes, ordem e visibilidade dos menus.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewPageModalOpen(true)}
                    className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+ Menu</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {config.customPages.map((page, index) => (
                    <div key={page.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 overflow-hidden flex-1">
                          <Menu className="h-4 w-4 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            value={page.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updatedPages = config.customPages.map(p => p.id === page.id ? { ...p, title: val } : p);
                              setConfig(prev => ({ ...prev, customPages: updatedPages }));
                              setHasUnsavedChanges(true);
                            }}
                            className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded px-2 py-1 w-full"
                          />
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              if (index === 0) return;
                              const updated = [...config.customPages];
                              const temp = updated[index - 1];
                              updated[index - 1] = updated[index];
                              updated[index] = temp;
                              setConfig(prev => ({ ...prev, customPages: updated }));
                              setHasUnsavedChanges(true);
                            }}
                            className="p-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 rounded border border-slate-700 text-xs cursor-pointer"
                            title="Mover para cima"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === config.customPages.length - 1}
                            onClick={() => {
                              if (index === config.customPages.length - 1) return;
                              const updated = [...config.customPages];
                              const temp = updated[index + 1];
                              updated[index + 1] = updated[index];
                              updated[index] = temp;
                              setConfig(prev => ({ ...prev, customPages: updated }));
                              setHasUnsavedChanges(true);
                            }}
                            className="p-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 rounded border border-slate-700 text-xs cursor-pointer"
                            title="Mover para baixo"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedPages = config.customPages.map(p => p.id === page.id ? { ...p, visible: !p.visible } : p);
                              setConfig(prev => ({ ...prev, customPages: updatedPages }));
                              setHasUnsavedChanges(true);
                            }}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                              page.visible ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                            title={page.visible ? 'Menu Visível' : 'Menu Oculto'}
                          >
                            {page.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                        <span>Rota: /{page.slug}</span>
                        <span>Blocos: {page.blocks.length}</span>
                      </div>
                    </div>
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

            {/* SUB-TAB 5: MODELOS PERSONALIZADOS POR CLIENTE (PROMPT 05) */}
            {activeSubTab === 'white_label' && editingModel && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                      MODELOS POR CLIENTE (MULTIEMPRESA)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Crie e gerencie versões personalizadas do GestRH para cada empresa sem alterar o código.
                  </p>
                </div>

                {/* SELECTOR & ACTION BAR */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Modelo do Cliente Selecionado:
                    </label>
                    <select
                      value={selectedModelId}
                      onChange={(e) => handleSelectClientModel(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 text-xs font-bold text-amber-300 rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500"
                    >
                      {clientModelsList.map(m => (
                        <option key={m.id} value={m.id}>
                          🏢 {m.modelName} — {m.companyName} ({m.planTier.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BUTTON ACTIONS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={handleSaveClientModel}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Salvar Modelo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyClientModelToGlobal}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold p-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Aplicar ao Sistema</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateNewClientModel}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 text-amber-400" />
                      <span>Novo Modelo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDuplicateClientModel}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 text-blue-400" />
                      <span>Duplicar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRestoreClientModel}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                      <span>Restaurar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteClientModel}
                      className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 p-2 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>

                {/* EDITOR SUB-SECTIONS NAV */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveModelSection('identidade')}
                    className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
                      activeModelSection === 'identidade' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎨 Identidade
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModelSection('modulos')}
                    className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
                      activeModelSection === 'modulos' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🧩 Módulos Ativos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModelSection('campos')}
                    className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
                      activeModelSection === 'campos' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ➕ Campos Custom
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModelSection('plano')}
                    className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
                      activeModelSection === 'plano' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💳 Plano
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModelSection('menus')}
                    className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
                      activeModelSection === 'menus' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📋 Menus
                  </button>
                </div>

                {/* SECTION 1: IDENTIDADE VISUAL */}
                {activeModelSection === 'identidade' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nome do Modelo:</label>
                      <input
                        type="text"
                        value={editingModel.modelName}
                        onChange={(e) => setEditingModel({ ...editingModel, modelName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nome da Empresa Cliente:</label>
                      <input
                        type="text"
                        value={editingModel.companyName}
                        onChange={(e) => setEditingModel({ ...editingModel, companyName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nome Exibido do Sistema:</label>
                      <input
                        type="text"
                        value={editingModel.branding.systemName}
                        onChange={(e) => setEditingModel({
                          ...editingModel,
                          branding: { ...editingModel.branding, systemName: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-300 block mb-1">Cor Primária:</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={editingModel.branding.primaryColor}
                            onChange={(e) => setEditingModel({
                              ...editingModel,
                              branding: { ...editingModel.branding, primaryColor: e.target.value }
                            })}
                            className="h-8 w-10 bg-transparent rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingModel.branding.primaryColor}
                            onChange={(e) => setEditingModel({
                              ...editingModel,
                              branding: { ...editingModel.branding, primaryColor: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-300 block mb-1">Cor Secundária:</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={editingModel.branding.secondaryColor}
                            onChange={(e) => setEditingModel({
                              ...editingModel,
                              branding: { ...editingModel.branding, secondaryColor: e.target.value }
                            })}
                            className="h-8 w-10 bg-transparent rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingModel.branding.secondaryColor}
                            onChange={(e) => setEditingModel({
                              ...editingModel,
                              branding: { ...editingModel.branding, secondaryColor: e.target.value }
                            })}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-300 block mb-1">Tema Inicial:</label>
                        <select
                          value={editingModel.branding.themeMode}
                          onChange={(e: any) => setEditingModel({
                            ...editingModel,
                            branding: { ...editingModel.branding, themeMode: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 font-bold"
                        >
                          <option value="dark">Escuro (Dark Mode)</option>
                          <option value="light">Claro (Light Mode)</option>
                          <option value="auto">Automático</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-300 block mb-1">Tipografia:</label>
                        <select
                          value={editingModel.branding.fontFamily}
                          onChange={(e) => setEditingModel({
                            ...editingModel,
                            branding: { ...editingModel.branding, fontFamily: e.target.value }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2 font-bold"
                        >
                          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                          <option value="Inter">Inter</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Roboto">Roboto</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: MÓDULOS ATIVOS */}
                {activeModelSection === 'modulos' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white uppercase text-[11px]">Ativação de Módulos por Empresa:</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {Object.values(editingModel.activeModules).filter(Boolean).length} / {Object.keys(editingModel.activeModules).length} Ativos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: 'funcionarios', label: 'Funcionários & Cadastro' },
                        { key: 'ponto', label: 'Ponto Eletrônico & Registros' },
                        { key: 'recrutamento', label: 'Recrutamento & Seleção (ATS)' },
                        { key: 'bancoTalentos', label: 'Banco de Talentos' },
                        { key: 'entrevistaIa', label: 'Entrevista IA & Triagem' },
                        { key: 'documentos', label: 'Documentos & Dossiê' },
                        { key: 'ferias', label: 'Férias & Licenças' },
                        { key: 'beneficios', label: 'Benefícios & Vales' },
                        { key: 'treinamentos', label: 'Treinamentos & LNT' },
                        { key: 'folha', label: 'Folha de Pagamento' },
                        { key: 'relatorios', label: 'Relatórios & Analytics' },
                        { key: 'chatIa', label: 'Assistente IA Chat' }
                      ].map((mod) => {
                        const isActive = (editingModel.activeModules as any)[mod.key];
                        return (
                          <button
                            key={mod.key}
                            type="button"
                            onClick={() => {
                              setEditingModel({
                                ...editingModel,
                                activeModules: {
                                  ...editingModel.activeModules,
                                  [mod.key]: !isActive
                                }
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-bold">{mod.label}</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isActive ? '✓ ATIVO' : '✗ OCULTO'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECTION 3: CAMPOS PERSONALIZADOS */}
                {activeModelSection === 'campos' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-4 text-xs">
                    <div>
                      <h4 className="font-extrabold text-amber-400 uppercase text-[11px] mb-1">
                        CAMPOS PERSONALIZADOS DO CLIENTE
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Adicione novos campos exclusivos para esta empresa (ex: Frota, Centro de Custo, Escala).
                      </p>
                    </div>

                    {/* LIST OF EXISTING CUSTOM FIELDS */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-300 block text-[11px]">Campos Configurados ({editingModel.customFields?.length || 0}):</span>
                      {(!editingModel.customFields || editingModel.customFields.length === 0) ? (
                        <p className="text-[11px] text-slate-500 italic p-3 bg-slate-900 rounded-lg text-center">
                          Nenhum campo personalizado adicionado a este modelo ainda.
                        </p>
                      ) : (
                        editingModel.customFields.map((cf) => (
                          <div key={cf.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-white">{cf.label}</span>
                                <span className="text-[9px] font-mono bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">
                                  {cf.fieldName}
                                </span>
                                {cf.required && (
                                  <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1 rounded">Obrigatório</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5">
                                <span>Módulo: <strong className="text-slate-200">{cf.targetModule}</strong></span>
                                <span>Tipo: <strong className="text-slate-200">{cf.fieldType}</strong></span>
                                {cf.options && cf.options.length > 0 && (
                                  <span>Opções: {cf.options.join(', ')}</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCustomField(cf.id)}
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800 cursor-pointer"
                              title="Remover Campo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* FORM TO ADD NEW CUSTOM FIELD */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/30 space-y-3">
                      <span className="font-extrabold text-amber-400 text-[11px] block">
                        + Adicionar Novo Campo Personalizado:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Nome do Rótulo (Label):</label>
                          <input
                            type="text"
                            placeholder="Ex: Número da Frota"
                            value={newCfLabel}
                            onChange={(e) => setNewCfLabel(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Chave Interna (fieldName):</label>
                          <input
                            type="text"
                            placeholder="Ex: numero_frota"
                            value={newCfFieldName}
                            onChange={(e) => setNewCfFieldName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Módulo de Destino:</label>
                          <select
                            value={newCfModule}
                            onChange={(e: any) => setNewCfModule(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs font-bold"
                          >
                            <option value="funcionarios">Funcionários</option>
                            <option value="recrutamento">Recrutamento</option>
                            <option value="ponto">Ponto Eletrônico</option>
                            <option value="folha">Folha de Pagamento</option>
                            <option value="ferias">Férias</option>
                            <option value="beneficios">Benefícios</option>
                            <option value="geral">Geral</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Tipo de Campo:</label>
                          <select
                            value={newCfType}
                            onChange={(e: any) => setNewCfType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs font-bold"
                          >
                            <option value="text">Texto Curto</option>
                            <option value="number">Número</option>
                            <option value="date">Data</option>
                            <option value="select">Seleção (Dropdown)</option>
                            <option value="boolean">Sim / Não (Checkbox)</option>
                          </select>
                        </div>
                      </div>

                      {newCfType === 'select' && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Opções (separadas por vírgula):</label>
                          <input
                            type="text"
                            placeholder="Ex: Operacional, Logística, Administrativo"
                            value={newCfOptions}
                            onChange={(e) => setNewCfOptions(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="cf_req"
                          checked={newCfRequired}
                          onChange={(e) => setNewCfRequired(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="cf_req" className="text-xs font-bold text-slate-200 cursor-pointer">
                          Campo de Preenchimento Obrigatório
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        disabled={!newCfLabel.trim()}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs py-2 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Campo ao Modelo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SECTION 4: PLANO DE ASSINATURA */}
                {activeModelSection === 'plano' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div>
                      <h4 className="font-extrabold text-amber-400 uppercase text-[11px] mb-1">
                        VÍNCULO DE PLANO DE ASSINATURA
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Selecione o nível do plano comercial vinculado a este modelo.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { tier: 'basico', label: 'Plano Básico', desc: 'Essencial de RH (Cadastros & Docs)' },
                        { tier: 'profissional', label: 'Plano Profissional', desc: 'Avançado + Ponto + Recrutamento' },
                        { tier: 'premium', label: 'Plano Premium', desc: 'IA Completa + Builder + Custom' }
                      ].map((item) => {
                        const isSelected = editingModel.planTier === item.tier;
                        return (
                          <button
                            key={item.tier}
                            type="button"
                            onClick={() => setEditingModel({ ...editingModel, planTier: item.tier as any })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-md shadow-amber-500/10'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="block font-extrabold text-white text-[11px] mb-1">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECTION 5: MENUS */}
                {activeModelSection === 'menus' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <span className="font-bold text-white uppercase text-[11px] block">Personalização de Menus do Cliente:</span>
                    <p className="text-[11px] text-slate-400">
                      Os menus visíveis acompanham os módulos ativos configurados na aba Módulos.
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
                          <div className="pt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>📢 Exemplo de comunicado oficial visível para todos os colaboradores no sistema.</span>
                          </div>
                        )}

                        {block.type === 'chart' && (
                          <div className="h-24 bg-slate-100 rounded-xl flex items-end justify-between p-3 gap-2">
                            {[40, 65, 80, 50, 95, 70, 85].map((h, i) => (
                              <div
                                key={i}
                                className="w-full rounded-t-md transition-all hover:opacity-80"
                                style={{ height: `${h}%`, backgroundColor: config.primaryColor }}
                              />
                            ))}
                          </div>
                        )}

                        {block.type === 'list' && (
                          <div className="pt-2 space-y-2">
                            {[
                              { name: 'Ana Clara Souza', role: 'Dev Senior', status: 'Ativo' },
                              { name: 'Lucas Pereira', role: 'Analista de RH', status: 'Férias' },
                              { name: 'Mariana Lima', role: 'Designer UX', status: 'Ativo' }
                            ].map((user, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <div className="h-7 w-7 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-[10px]">
                                    {user.name[0]}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block leading-tight">{user.name}</span>
                                    <span className="text-[10px] text-slate-500">{user.role}</span>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                  user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {user.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'table' && (
                          <div className="pt-2 overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-mono">
                                  <th className="py-1">Nome</th>
                                  <th className="py-1">Cargo</th>
                                  <th className="py-1">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                <tr>
                                  <td className="py-2 text-slate-900 font-bold">Carlos Eduardo</td>
                                  <td className="py-2 text-slate-600">Engenheiro de Dados</td>
                                  <td className="py-2 text-emerald-600 font-bold">Aprovado</td>
                                </tr>
                                <tr>
                                  <td className="py-2 text-slate-900 font-bold">Juliana Ramos</td>
                                  <td className="py-2 text-slate-600">Tech Lead Java</td>
                                  <td className="py-2 text-amber-600 font-bold">Em Entrevista</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {block.type === 'form' && (
                          <div className="pt-2 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nome do Colaborador</label>
                                <input type="text" placeholder="Nome completo" className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs" disabled />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Cargo / Função</label>
                                <input type="text" placeholder="Ex: Desenvolvedor" className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs" disabled />
                              </div>
                            </div>
                            <button className="w-full py-2 rounded-xl text-white font-extrabold text-xs shadow-sm" style={{ backgroundColor: config.primaryColor }}>
                              Enviar Cadastro
                            </button>
                          </div>
                        )}

                        {block.type === 'kanban' && (
                          <div className="pt-2 grid grid-cols-3 gap-2">
                            {[
                              { stage: 'Triagem (4)', card: 'Fernanda M.' },
                              { stage: 'Entrevista (2)', card: 'Rodrigo S.' },
                              { stage: 'Proposta (1)', card: 'Camila K.' }
                            ].map((col, idx) => (
                              <div key={idx} className="bg-slate-100 p-2 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <span className="text-[10px] font-extrabold text-slate-600 uppercase block">{col.stage}</span>
                                <div className="p-2 bg-white rounded-lg shadow-xs border border-slate-200 font-bold text-slate-800 text-[11px]">
                                  {col.card}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'calendar' && (
                          <div className="pt-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between items-center font-bold text-slate-800 text-[11px]">
                              <span>Julho 2026</span>
                              <span className="text-emerald-600 text-[10px]">Férias Aprovadas</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
                              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-700">
                              <span className="p-1">10</span>
                              <span className="p-1 bg-emerald-500 text-white rounded font-bold">11</span>
                              <span className="p-1 bg-emerald-500 text-white rounded font-bold">12</span>
                              <span className="p-1 bg-emerald-500 text-white rounded font-bold">13</span>
                              <span className="p-1">14</span>
                              <span className="p-1">15</span>
                              <span className="p-1">16</span>
                            </div>
                          </div>
                        )}

                        {block.type === 'ponto' && (
                          <div className="pt-2 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 text-center space-y-2">
                            <span className="text-xs font-mono font-bold text-emerald-400 block tracking-widest uppercase">PONTO ELETRÔNICO DIGITAL</span>
                            <div className="text-3xl font-black font-mono tracking-wider text-amber-400">
                              08:30:15
                            </div>
                            <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-400">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span>Geolocalização Ativa (GPS Validados)</span>
                            </div>
                            <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 rounded-xl shadow-md cursor-pointer transition-all">
                              REGISTRAR PONTO
                            </button>
                          </div>
                        )}

                        {block.type === 'video' && (
                          <div className="pt-2 bg-slate-900 text-white p-6 rounded-xl border border-slate-800 text-center space-y-2 relative overflow-hidden group">
                            <div className="h-28 bg-slate-800 rounded-lg flex items-center justify-center relative">
                              <div className="p-3 bg-amber-500 rounded-full text-slate-950 shadow-xl transform group-hover:scale-110 transition-transform">
                                <Play className="h-6 w-6 fill-current" />
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-200 block">Vídeo Institucional de Integrantes & Onboarding</span>
                          </div>
                        )}

                        {block.type === 'button' && (
                          <div className="pt-2">
                            <button
                              className="w-full py-2.5 px-4 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                              style={{ backgroundColor: config.primaryColor }}
                            >
                              <MousePointer className="h-4 w-4" />
                              <span>{block.title || 'Clique Aqui'}</span>
                            </button>
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

              {/* PROPRIEDADES FUNCIONAIS */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                  PROPRIEDADES FUNCIONAIS
                </span>

                {/* Permissões de Acesso */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Permissão de Visualização</label>
                  <select
                    value={selectedBlock.permissionLevel || '3_developer'}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setSelectedBlock(prev => prev ? { ...prev, permissionLevel: val } : null);
                      const updatedPages = config.customPages.map(page => ({
                        ...page,
                        blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, permissionLevel: val } : b)
                      }));
                      setConfig(prev => ({ ...prev, customPages: updatedPages }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2"
                  >
                    <option value="3_developer">Todos os Usuários</option>
                    <option value="1_design">Somente Administradores (RH / Master)</option>
                    <option value="2_layout">Somente Perfis Gestores</option>
                  </select>
                </div>

                {/* Rota / Ação do Botão */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Ação / Rota de Destino</label>
                  <input
                    type="text"
                    placeholder="Ex: /rh/funcionarios ou modal:novo"
                    value={selectedBlock.content || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBlock(prev => prev ? { ...prev, content: val } : null);
                      const updatedPages = config.customPages.map(page => ({
                        ...page,
                        blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, content: val } : b)
                      }));
                      setConfig(prev => ({ ...prev, customPages: updatedPages }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 font-mono"
                  />
                </div>

                {/* Visibilidade Toggles */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-300 font-medium">Ocultar para Usuários Comuns:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = !selectedBlock.hidden;
                      setSelectedBlock(prev => prev ? { ...prev, hidden: val } : null);
                      const updatedPages = config.customPages.map(page => ({
                        ...page,
                        blocks: page.blocks.map(b => b.id === selectedBlock.id ? { ...b, hidden: val } : b)
                      }));
                      setConfig(prev => ({ ...prev, customPages: updatedPages }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                      selectedBlock.hidden ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {selectedBlock.hidden ? 'Sim (Oculto)' : 'Não (Visível)'}
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

              {/* Alignment & Font Size */}
              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block">Alinhamento do Texto</label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleUpdateBlockStyle('alignment', align)}
                      className={`p-1.5 rounded-lg border capitalize transition-all cursor-pointer ${
                        selectedBlock.style?.alignment === align ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                    </button>
                  ))}
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

      {/* 3. NEW PAGE MODAL WITH TEMPLATE OPTION */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">Criar Nova Página no GestRH</h3>
                <p className="text-[11px] text-slate-400">Escolha uma página em branco ou use um modelo pré-montado.</p>
              </div>
              <button
                onClick={() => setIsNewPageModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">1. Selecionar Modelo Pronto:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'blank', title: 'Página em Branco', desc: 'Sua tela livre para montar' },
                  { key: 'dashboard_rh', title: 'Dashboard Executivo', desc: 'KPIs, gráficos e tabelas' },
                  { key: 'funcionarios', title: 'Funcionários & Dossiê', desc: 'Lista + formulários' },
                  { key: 'recrutamento', title: 'Recrutamento ATS', desc: 'Kanban + banco de talentos' },
                  { key: 'portal_funcionario', title: 'Portal Colaborador', desc: 'Ponto + férias + solicitações' }
                ].map(tmpl => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => handleApplyTemplateToNewPage(tmpl.key)}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all hover:border-amber-500/50 cursor-pointer"
                  >
                    <span className="font-extrabold text-white block text-[11px] leading-tight mb-1">{tmpl.title}</span>
                    <span className="text-[10px] text-slate-400 block">{tmpl.desc}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-300 block mb-2">2. Ou crie com título personalizado:</span>
                <form onSubmit={handleCreatePage} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ex: Treinamento & Capacitação"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!newPageTitle.trim()}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer shrink-0"
                  >
                    Criar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAGE SETTINGS MODAL (PROMPT 06) */}
      {isPageSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">Configurações da Página</h3>
                <p className="text-[11px] text-slate-400">Edite o título, rota de navegação e permissões.</p>
              </div>
              <button
                onClick={() => setIsPageSettingsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePageSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título da Página</label>
                <input
                  type="text"
                  required
                  value={pageSettings.title}
                  onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">URL / Slug de Acesso</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500 font-mono text-xs">/</span>
                  <input
                    type="text"
                    required
                    value={pageSettings.slug}
                    onChange={(e) => setPageSettings({ ...pageSettings, slug: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="page_init"
                  checked={pageSettings.isInitialPage}
                  onChange={(e) => setPageSettings({ ...pageSettings, isInitialPage: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="page_init" className="text-xs font-bold text-slate-200 cursor-pointer">
                  Definir como Página Inicial Padrão do Sistema
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPageSettingsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VERSION HISTORY MODAL (PROMPT 06) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">Histórico de Versões do GestRH Builder</h3>
                <p className="text-[11px] text-slate-400">Restaure versões salvas anteriormente pelo MASTER.</p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {historyList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Nenhuma versão histórica gravada até o momento.
                </div>
              ) : (
                historyList.map((hist) => (
                  <div key={hist.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-amber-400 font-mono">v{hist.version}</span>
                        <span className="text-slate-300 font-bold">{hist.notes || 'Alterações no layout'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 pt-0.5">
                        {new Date(hist.updatedAt).toLocaleString('pt-BR')} • Autor: {hist.updatedBy}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleRestoreHistory(hist);
                        setIsHistoryModalOpen(false);
                      }}
                      className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Restaurar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
