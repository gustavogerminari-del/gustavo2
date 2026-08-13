/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Home, 
  Info, 
  Target, 
  CreditCard, 
  Image as ImageIcon, 
  Phone, 
  Share2, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  X,
  ExternalLink,
  Building,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  SiteConfig, 
  SiteHomeConfig, 
  SiteEmpresaConfig, 
  SitePlanoConfig, 
  SiteMidiaConfig, 
  SiteContatoConfig 
} from '../types_master';
import { firebaseService, DEFAULT_SITE_CONFIG, SiteConfigService } from '../services/centralServices';

interface SiteConfigManagerProps {
  onOpenPreview?: () => void;
}

export default function SiteConfigManager({ onOpenPreview }: SiteConfigManagerProps) {
  // Main Sub-Tab selection
  const [subTab, setSubTab] = useState<'home' | 'empresa' | 'missao' | 'planos' | 'midia' | 'contato' | 'redes'>('home');

  // Master Data State
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Home Form state
  const [homeForm, setHomeForm] = useState<SiteHomeConfig>(DEFAULT_SITE_CONFIG.home);

  // Empresa & Missão/Visão/Valores state
  const [empresaForm, setEmpresaForm] = useState<SiteEmpresaConfig>(DEFAULT_SITE_CONFIG.empresa);
  const [newValor, setNewValor] = useState('');

  // Planos state
  const [planosList, setPlanosList] = useState<SitePlanoConfig[]>(DEFAULT_SITE_CONFIG.planos);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SitePlanoConfig | null>(null);
  const [planForm, setPlanForm] = useState<{
    nome: string;
    descricao: string;
    valorMensal: string;
    valorAnual: string;
    beneficios: string[];
    newBeneficio: string;
    botaoTexto: string;
    botaoLink: string;
    ativo: boolean;
    destaque: boolean;
    badge: string;
  }>({
    nome: '',
    descricao: '',
    valorMensal: 'R$ 0,00',
    valorAnual: 'R$ 0,00',
    beneficios: [],
    newBeneficio: '',
    botaoTexto: 'Falar com Consultor',
    botaoLink: '#contato',
    ativo: true,
    destaque: false,
    badge: ''
  });

  // Mídia state
  const [midiaForm, setMidiaForm] = useState<SiteMidiaConfig>(DEFAULT_SITE_CONFIG.midia);

  // Contato & Redes Sociais state
  const [contatoForm, setContatoForm] = useState<SiteContatoConfig>(DEFAULT_SITE_CONFIG.contato);

  // Live Preview modal state
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Show Toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load site config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.db.getSiteConfig();
      setConfig(data);
      setHomeForm(data.home);
      setEmpresaForm(data.empresa);
      setPlanosList(data.planos || []);
      setMidiaForm(data.midia);
      setContatoForm(data.contato);
    } catch (err: any) {
      showToast('error', 'Falha ao carregar configurações do site.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS FOR SAVE ---

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await firebaseService.db.saveSiteHome(homeForm);
      setConfig(prev => ({ ...prev, home: homeForm }));
      showToast('success', '✓ Módulo Página Inicial atualizado com sucesso no Firebase!');
    } catch (err: any) {
      showToast('error', 'Erro ao salvar Página Inicial.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmpresaMissao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await firebaseService.db.saveSiteEmpresa(empresaForm);
      setConfig(prev => ({ ...prev, empresa: empresaForm }));
      showToast('success', '✓ Missão, Visão e Valores atualizados com sucesso no Firebase!');
    } catch (err: any) {
      showToast('error', 'Erro ao salvar Missão, Visão e Valores.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddValor = () => {
    if (!newValor.trim()) return;
    setEmpresaForm(prev => ({
      ...prev,
      valores: [...prev.valores, newValor.trim()]
    }));
    setNewValor('');
  };

  const handleRemoveValor = (index: number) => {
    setEmpresaForm(prev => ({
      ...prev,
      valores: prev.valores.filter((_, i) => i !== index)
    }));
  };

  // Plan Handlers
  const handleOpenNewPlanModal = () => {
    setEditingPlan(null);
    setPlanForm({
      nome: '',
      descricao: '',
      valorMensal: 'R$ 199,00/mês',
      valorAnual: 'R$ 1.990,00/ano',
      beneficios: ['Cadastro de funcionários', 'Gestão de vagas', 'Relatórios básicos'],
      newBeneficio: '',
      botaoTexto: 'Contratar Agora',
      botaoLink: '#contato',
      ativo: true,
      destaque: false,
      badge: ''
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlanModal = (plan: SitePlanoConfig) => {
    setEditingPlan(plan);
    setPlanForm({
      nome: plan.nome,
      descricao: plan.descricao,
      valorMensal: plan.valorMensal,
      valorAnual: plan.valorAnual,
      beneficios: [...plan.beneficios],
      newBeneficio: '',
      botaoTexto: plan.botaoTexto || 'Falar com Consultor',
      botaoLink: plan.botaoLink || '#contato',
      ativo: plan.ativo,
      destaque: plan.destaque || false,
      badge: plan.badge || ''
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlanForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.nome.trim()) {
      alert('O nome do plano é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      let updated: SitePlanoConfig[];

      if (editingPlan) {
        updated = planosList.map(p => p.id === editingPlan.id ? {
          ...p,
          nome: planForm.nome,
          descricao: planForm.descricao,
          valorMensal: planForm.valorMensal,
          valorAnual: planForm.valorAnual,
          beneficios: planForm.beneficios,
          botaoTexto: planForm.botaoTexto,
          botaoLink: planForm.botaoLink,
          ativo: planForm.ativo,
          destaque: planForm.destaque,
          badge: planForm.badge
        } : p);
      } else {
        const newPlan: SitePlanoConfig = {
          id: `plano-${Date.now()}`,
          nome: planForm.nome,
          descricao: planForm.descricao,
          valorMensal: planForm.valorMensal,
          valorAnual: planForm.valorAnual,
          beneficios: planForm.beneficios,
          botaoTexto: planForm.botaoTexto,
          botaoLink: planForm.botaoLink,
          ativo: planForm.ativo,
          ordem: planosList.length + 1,
          destaque: planForm.destaque,
          badge: planForm.badge
        };
        updated = [...planosList, newPlan];
      }

      setPlanosList(updated);
      await firebaseService.db.saveSitePlanos(updated);
      setConfig(prev => ({ ...prev, planos: updated }));
      setIsPlanModalOpen(false);
      showToast('success', editingPlan ? '✓ Plano atualizado com sucesso!' : '✓ Novo plano adicionado com sucesso!');
    } catch (err) {
      showToast('error', 'Erro ao salvar plano.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      setSaving(true);
      const updated = planosList.filter(p => p.id !== id);
      setPlanosList(updated);
      await firebaseService.db.saveSitePlanos(updated);
      setConfig(prev => ({ ...prev, planos: updated }));
      showToast('success', '✓ Plano removido com sucesso!');
    } catch (err) {
      showToast('error', 'Erro ao excluir plano.');
    } finally {
      setSaving(false);
    }
  };

  const handleMovePlan = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= planosList.length) return;

    const updated = [...planosList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update order
    const reordered = updated.map((p, idx) => ({ ...p, ordem: idx + 1 }));
    setPlanosList(reordered);
    await firebaseService.db.saveSitePlanos(reordered);
    setConfig(prev => ({ ...prev, planos: reordered }));
    showToast('success', '✓ Ordem dos planos atualizada!');
  };

  const handleTogglePlanStatus = async (id: string) => {
    const updated = planosList.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p);
    setPlanosList(updated);
    await firebaseService.db.saveSitePlanos(updated);
    setConfig(prev => ({ ...prev, planos: updated }));
    showToast('success', '✓ Status do plano alterado!');
  };

  const handleAddPlanBeneficio = () => {
    if (!planForm.newBeneficio.trim()) return;
    setPlanForm(prev => ({
      ...prev,
      beneficios: [...prev.beneficios, prev.newBeneficio.trim()],
      newBeneficio: ''
    }));
  };

  const handleRemovePlanBeneficio = (index: number) => {
    setPlanForm(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  // Save Mídia
  const handleSaveMidia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await firebaseService.db.saveSiteMidia(midiaForm);
      setConfig(prev => ({ ...prev, midia: midiaForm }));
      showToast('success', '✓ Mídia e Identidade Visual salvas com sucesso no Firebase!');
    } catch (err) {
      showToast('error', 'Erro ao salvar mídia.');
    } finally {
      setSaving(false);
    }
  };

  // File Upload Helper (converts to base64 DataURL or handles preview)
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'logo' | 'favicon' | 'bannerInicial' | 'homeImagem'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (targetField === 'homeImagem') {
        setHomeForm(prev => ({ ...prev, imagem: dataUrl }));
      } else if (targetField === 'logo') {
        setMidiaForm(prev => ({ ...prev, logo: dataUrl }));
      } else if (targetField === 'favicon') {
        setMidiaForm(prev => ({ ...prev, favicon: dataUrl }));
      } else if (targetField === 'bannerInicial') {
        setMidiaForm(prev => ({ ...prev, bannerInicial: dataUrl }));
      }
      showToast('success', '✓ Imagem carregada com sucesso! Clique em "Salvar Alterações" para publicar.');
    };
    reader.readAsDataURL(file);
  };

  // Save Contato & Redes
  const handleSaveContato = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await firebaseService.db.saveSiteContato(contatoForm);
      setConfig(prev => ({ ...prev, contato: contatoForm }));
      showToast('success', '✓ Dados de Contato e Redes Sociais salvos com sucesso!');
    } catch (err) {
      showToast('error', 'Erro ao salvar contatos.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Carregando gerenciador do site principal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center space-x-3 animate-in fade-in zoom-in-95 duration-200 ${
          toast.type === 'success' 
            ? 'bg-slate-900 text-emerald-400 border-emerald-500/40' 
            : 'bg-rose-900 text-rose-200 border-rose-500/40'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="font-medium text-sm text-white">{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
            <Globe className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-bold text-xl text-slate-900">Gerenciador do Site Principal</h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Edite as informações institucionais, imagens, planos e contatos exibidos no portal público.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (onOpenPreview) {
                onOpenPreview();
              } else {
                setShowLivePreviewModal(true);
              }
            }}
            className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Eye className="h-4 w-4 text-amber-400" />
            <span>Visualizar Site Público</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Menu Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setSubTab('home')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'home'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Página Inicial</span>
        </button>

        <button
          onClick={() => setSubTab('empresa')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'empresa'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Sobre a Empresa</span>
        </button>

        <button
          onClick={() => setSubTab('missao')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'missao'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Missão, Visão e Valores</span>
        </button>

        <button
          onClick={() => setSubTab('planos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'planos'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Gerenciamento de Planos ({planosList.length})</span>
        </button>

        <button
          onClick={() => setSubTab('midia')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'midia'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Imagens e Banners</span>
        </button>

        <button
          onClick={() => setSubTab('contato')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'contato'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Phone className="h-4 w-4" />
          <span>Contatos</span>
        </button>

        <button
          onClick={() => setSubTab('redes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'redes'
              ? 'bg-[#0b1d33] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>Redes Sociais</span>
        </button>
      </div>

      {/* --- MÓDULO 1: PÁGINA INICIAL --- */}
      {subTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Módulo 1 &bull; Página Inicial (Hero Banner)</h3>
                <p className="text-slate-500 text-xs">Configure o título principal, chamada para ação e imagem do cabeçalho público.</p>
              </div>
            </div>

            <form onSubmit={handleSaveHome} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Título Principal *</label>
                <input
                  type="text"
                  required
                  value={homeForm.titulo}
                  onChange={(e) => setHomeForm({ ...homeForm, titulo: e.target.value })}
                  placeholder="Ex: Conectando talentos às melhores oportunidades"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtítulo / Eyebrow Badge *</label>
                <input
                  type="text"
                  required
                  value={homeForm.subtitulo}
                  onChange={(e) => setHomeForm({ ...homeForm, subtitulo: e.target.value })}
                  placeholder="Ex: Plataforma de Recrutamento e Gestão de Pessoas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Texto de Apresentação *</label>
                <textarea
                  rows={3}
                  required
                  value={homeForm.descricao}
                  onChange={(e) => setHomeForm({ ...homeForm, descricao: e.target.value })}
                  placeholder="Ex: A plataforma digital completa de RH onde candidatos, empresas e gestão de pessoas se encontram em um só lugar."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Texto do Botão Principal *</label>
                  <input
                    type="text"
                    required
                    value={homeForm.botaoTexto}
                    onChange={(e) => setHomeForm({ ...homeForm, botaoTexto: e.target.value })}
                    placeholder="Ex: Cadastrar Currículo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Link do Botão *</label>
                  <input
                    type="text"
                    required
                    value={homeForm.botaoLink}
                    onChange={(e) => setHomeForm({ ...homeForm, botaoLink: e.target.value })}
                    placeholder="Ex: #tres-publicos ou /vagas"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Imagem / Banner Principal</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={homeForm.imagem}
                    onChange={(e) => setHomeForm({ ...homeForm, imagem: e.target.value })}
                    placeholder="URL da imagem (ex: https://...)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <label className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-2 shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>Upload de Arquivo</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'homeImagem')}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 italic">Salva diretamente na coleção site_config/home no Firebase</span>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Publicando...' : 'Salvar e Publicar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Card Preview */}
          <div className="bg-[#0b1d33] rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between border border-amber-500/20">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-4 bg-amber-500/10 px-3 py-1 rounded-full w-max border border-amber-500/30">
                <Sparkles className="h-3 w-3" />
                <span>PRÉVIA EM TEMPO REAL</span>
              </div>

              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
                <span className="text-amber-400 text-[11px] font-mono font-semibold uppercase">
                  {homeForm.subtitulo || 'Subtítulo da capa'}
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl text-white tracking-tight leading-snug mb-3">
                {homeForm.titulo || 'Título principal do site'}
              </h3>

              <p className="text-slate-300 text-xs font-light leading-relaxed mb-6">
                {homeForm.descricao || 'Descrição do serviço ou plataforma RH.'}
              </p>

              <div className="mb-6">
                <button className="bg-amber-500 text-[#0b1d33] font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-default">
                  {homeForm.botaoTexto || 'Botão Principal'} &rarr;
                </button>
              </div>

              {homeForm.imagem && (
                <div className="rounded-xl overflow-hidden border border-white/10 max-h-48">
                  <img src={homeForm.imagem} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-6 pt-3 border-t border-white/10">
              Esta é uma reprodução fiel do cabeçalho da sua página inicial pública.
            </p>
          </div>
        </div>
      )}

      {/* --- MÓDULO 2: SOBRE A EMPRESA / MISSÃO, VISÃO E VALORES --- */}
      {(subTab === 'empresa' || subTab === 'missao') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Módulo 2 &bull; Sobre a Empresa, Missão, Visão e Valores</h3>
              <p className="text-slate-500 text-xs">Apresente o propósito da sua empresa e a lista dinâmica de valores institucionais.</p>
            </div>
          </div>

          <form onSubmit={handleSaveEmpresaMissao} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Nossa Missão (Texto Longo) *</span>
              </label>
              <textarea
                rows={3}
                required
                value={empresaForm.missao}
                onChange={(e) => setEmpresaForm({ ...empresaForm, missao: e.target.value })}
                placeholder="Descreva a missão institucional da empresa..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                <Eye className="h-4 w-4 text-amber-500" />
                <span>Nossa Visão (Texto Longo) *</span>
              </label>
              <textarea
                rows={3}
                required
                value={empresaForm.visao}
                onChange={(e) => setEmpresaForm({ ...empresaForm, visao: e.target.value })}
                placeholder="Descreva a visão de futuro da empresa..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>

            {/* Valores - Dynamic List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Valores Institucionais (Lista Dinâmica)</span>
                </span>
                <span className="text-slate-400 font-normal text-[11px]">{empresaForm.valores.length} itens cadastrados</span>
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newValor}
                  onChange={(e) => setNewValor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddValor(); } }}
                  placeholder="Ex: Transparência, Inovação, LGPD..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddValor}
                  className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-amber-400" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[60px]">
                {empresaForm.valores.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">Nenhum valor adicionado ainda. Adicione itens acima.</p>
                ) : (
                  empresaForm.valores.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-amber-500/30 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center space-x-2"
                    >
                      <span className="text-amber-500 font-bold">&bull;</span>
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveValor(idx)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer ml-1"
                        title="Remover valor"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Missão, Visão e Valores'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MÓDULO 3: GERENCIAMENTO DE PLANOS --- */}
      {subTab === 'planos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Módulo 3 &bull; Gerenciamento de Planos Comercial</h3>
              <p className="text-slate-500 text-xs">Cadastre, edite, ordene e ative/desative os planos oferecidos às empresas no site principal.</p>
            </div>
            <button
              onClick={handleOpenNewPlanModal}
              className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Novo Plano</span>
            </button>
          </div>

          {/* Cards Grid of Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planosList.map((plan, index) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all relative ${
                  plan.destaque ? 'border-2 border-amber-500 shadow-xl' : 'border-slate-200 shadow-xs hover:border-slate-300'
                } ${!plan.ativo ? 'opacity-60 bg-slate-50' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-[#0b1d33] font-mono text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      plan.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {plan.ativo ? 'Ativo' : 'Inativo'}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMovePlan(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                        title="Mover para cima"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMovePlan(index, 'down')}
                        disabled={index === planosList.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-2xl text-slate-900 mb-1">{plan.nome}</h4>
                  <p className="text-amber-600 text-sm font-bold font-mono mb-2">{plan.valorMensal}</p>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">{plan.descricao}</p>

                  <div className="space-y-2 mb-6 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recursos e Benefícios:</p>
                    <ul className="space-y-2">
                      {plan.beneficios.map((ben, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2 text-slate-700 text-xs">
                          <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePlanStatus(plan.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      plan.ativo ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {plan.ativo ? 'Desativar' : 'Ativar'}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditPlanModal(plan)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer"
                      title="Editar plano"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                      title="Excluir plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MÓDULO 4: IMAGENS E IDENTIDADE VISUAL --- */}
      {subTab === 'midia' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Módulo 4 &bull; Imagens e Identidade Visual</h3>
              <p className="text-slate-500 text-xs">Gerencie a marca, logotipo principal, favicon e banners institucionais com suporte a upload.</p>
            </div>
          </div>

          <form onSubmit={handleSaveMidia} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Principal */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">Logo Principal da Marca</label>
                <p className="text-[11px] text-slate-500">Logotipo exibido no menu superior do site público e do sistema.</p>
                
                <input
                  type="text"
                  value={midiaForm.logo}
                  onChange={(e) => setMidiaForm({ ...midiaForm, logo: e.target.value })}
                  placeholder="URL do logotipo (ex: https://...)"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <label className="w-full bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center space-x-2">
                  <Upload className="h-4 w-4 text-amber-400" />
                  <span>Upload Logo (Arquivo)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </label>

                {midiaForm.logo && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <img src={midiaForm.logo} alt="Logo preview" className="max-h-16 mx-auto object-contain" />
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">Favicon do Site (Ícone de Aba)</label>
                <p className="text-[11px] text-slate-500">Ícone em formato quadrado exibido no navegador.</p>

                <input
                  type="text"
                  value={midiaForm.favicon}
                  onChange={(e) => setMidiaForm({ ...midiaForm, favicon: e.target.value })}
                  placeholder="URL do Favicon"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <label className="w-full bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center space-x-2">
                  <Upload className="h-4 w-4 text-amber-400" />
                  <span>Upload Favicon</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'favicon')}
                    className="hidden"
                  />
                </label>

                {midiaForm.favicon && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <img src={midiaForm.favicon} alt="Favicon preview" className="h-8 w-8 mx-auto object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Banner Inicial */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">Banner Inicial / Capa da Hero Section</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={midiaForm.bannerInicial}
                  onChange={(e) => setMidiaForm({ ...midiaForm, bannerInicial: e.target.value })}
                  placeholder="URL do Banner Principal"
                  className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <label className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center space-x-2 shrink-0">
                  <Upload className="h-4 w-4 text-amber-400" />
                  <span>Upload Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, 'bannerInicial')}
                    className="hidden"
                  />
                </label>
              </div>

              {midiaForm.bannerInicial && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-40">
                  <img src={midiaForm.bannerInicial} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Mídia e Identidade Visual'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MÓDULO 5: CONTATOS E REDES SOCIAIS --- */}
      {(subTab === 'contato' || subTab === 'redes') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Módulo 5 &bull; Contatos e Redes Sociais</h3>
              <p className="text-slate-500 text-xs">Atualize os canais de atendimento e links sociais exibidos no cabeçalho, rodapé e modais do site.</p>
            </div>
          </div>

          <form onSubmit={handleSaveContato} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone Principal *</label>
                <input
                  type="text"
                  required
                  value={contatoForm.telefone}
                  onChange={(e) => setContatoForm({ ...contatoForm, telefone: e.target.value })}
                  placeholder="Ex: (11) 3456-7890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp de Atendimento *</label>
                <input
                  type="text"
                  required
                  value={contatoForm.whatsapp}
                  onChange={(e) => setContatoForm({ ...contatoForm, whatsapp: e.target.value })}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={contatoForm.email}
                  onChange={(e) => setContatoForm({ ...contatoForm, email: e.target.value })}
                  placeholder="Ex: contato@rafaelalourenco.com.br"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Endereço Físico *</label>
                <input
                  type="text"
                  required
                  value={contatoForm.endereco}
                  onChange={(e) => setContatoForm({ ...contatoForm, endereco: e.target.value })}
                  placeholder="Ex: Av. Paulista, 1000, Bela Vista, São Paulo/SP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-amber-500" />
                <span>Links das Redes Sociais</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={contatoForm.redesSociais.linkedin || ''}
                    onChange={(e) => setContatoForm({
                      ...contatoForm,
                      redesSociais: { ...contatoForm.redesSociais, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/company/suaempresa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
                  <input
                    type="url"
                    value={contatoForm.redesSociais.instagram || ''}
                    onChange={(e) => setContatoForm({
                      ...contatoForm,
                      redesSociais: { ...contatoForm.redesSociais, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/suaempresa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook</label>
                  <input
                    type="url"
                    value={contatoForm.redesSociais.facebook || ''}
                    onChange={(e) => setContatoForm({
                      ...contatoForm,
                      redesSociais: { ...contatoForm.redesSociais, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/suaempresa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube</label>
                  <input
                    type="url"
                    value={contatoForm.redesSociais.youtube || ''}
                    onChange={(e) => setContatoForm({
                      ...contatoForm,
                      redesSociais: { ...contatoForm.redesSociais, youtube: e.target.value }
                    })}
                    placeholder="https://youtube.com/@suaempresa"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Contatos e Redes Sociais'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- PLAN FORM MODAL --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0b1d33] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base">
                  {editingPlan ? 'Editar Plano Comercial' : 'Criar Novo Plano Comercial'}
                </h3>
                <p className="text-slate-400 text-xs">Preencha os valores e benefícios exibidos no site público.</p>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Plano *</label>
                <input
                  type="text"
                  required
                  value={planForm.nome}
                  onChange={(e) => setPlanForm({ ...planForm, nome: e.target.value })}
                  placeholder="Ex: Plano Básico, Profissional, Enterprise"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Breve *</label>
                <textarea
                  rows={2}
                  required
                  value={planForm.descricao}
                  onChange={(e) => setPlanForm({ ...planForm, descricao: e.target.value })}
                  placeholder="Ex: Ideal para pequenas empresas contratando mensalmente..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Mensal *</label>
                  <input
                    type="text"
                    required
                    value={planForm.valorMensal}
                    onChange={(e) => setPlanForm({ ...planForm, valorMensal: e.target.value })}
                    placeholder="Ex: R$ 199/mês ou Sob consulta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Anual *</label>
                  <input
                    type="text"
                    required
                    value={planForm.valorAnual}
                    onChange={(e) => setPlanForm({ ...planForm, valorAnual: e.target.value })}
                    placeholder="Ex: R$ 1.990/ano ou Personalizado"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Benefícios List */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lista de Benefícios</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={planForm.newBeneficio}
                    onChange={(e) => setPlanForm({ ...planForm, newBeneficio: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPlanBeneficio(); } }}
                    placeholder="Ex: Acesso ao Banco de Talentos..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlanBeneficio}
                    className="bg-[#0b1d33] text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    + Add
                  </button>
                </div>

                <ul className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                  {planForm.beneficios.map((b, idx) => (
                    <li key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                      <span>✓ {b}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePlanBeneficio(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={planForm.botaoTexto}
                    onChange={(e) => setPlanForm({ ...planForm, botaoTexto: e.target.value })}
                    placeholder="Falar com Consultor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selo Destaque / Badge</label>
                  <input
                    type="text"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    placeholder="Ex: MAIS POPULAR"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.ativo}
                    onChange={(e) => setPlanForm({ ...planForm, ativo: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Plano Ativo no Site</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.destaque}
                    onChange={(e) => setPlanForm({ ...planForm, destaque: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Destacar Card (Borda Dourada)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIVE PREVIEW MODAL FOR MASTER --- */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0b1d33] text-white p-5 flex justify-between items-center sticky top-0 z-20 border-b border-amber-500/20">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-amber-400" />
                <div>
                  <h3 className="font-display font-bold text-base">Prévia do Site Principal Público</h3>
                  <p className="text-slate-300 text-xs">Sincronizado automaticamente com as configurações do Firebase.</p>
                </div>
              </div>
              <button onClick={() => setShowLivePreviewModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-8 bg-slate-50 font-sans">
              {/* Preview Hero Header */}
              <div className="bg-[#0b1d33] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="max-w-2xl">
                  <span className="text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full inline-block mb-3 border border-amber-500/30">
                    {config.home.subtitulo}
                  </span>
                  <h2 className="font-display font-bold text-3xl text-white mb-3 leading-snug">
                    {config.home.titulo}
                  </h2>
                  <p className="text-slate-300 text-xs leading-relaxed mb-6 font-light">
                    {config.home.descricao}
                  </p>
                  <button className="bg-amber-500 text-[#0b1d33] font-bold text-xs px-5 py-2.5 rounded-xl shadow-md">
                    {config.home.botaoTexto} &rarr;
                  </button>
                </div>
              </div>

              {/* Mission, Vision & Values */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                <h4 className="font-display font-bold text-lg text-slate-900 border-b pb-2">Sobre Nós &bull; Missão, Visão e Valores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <strong className="text-amber-600 block mb-1 uppercase font-bold text-[10px]">NOSSA MISSÃO</strong>
                    <p className="text-slate-700 leading-relaxed">{config.empresa.missao}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <strong className="text-amber-600 block mb-1 uppercase font-bold text-[10px]">NOSSA VISÃO</strong>
                    <p className="text-slate-700 leading-relaxed">{config.empresa.visao}</p>
                  </div>
                </div>

                <div>
                  <strong className="text-slate-800 block mb-2 text-xs font-bold">NOSSOS VALORES:</strong>
                  <div className="flex flex-wrap gap-2">
                    {config.empresa.valores.map((val, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-lg">
                        ✓ {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plans Preview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-display font-bold text-lg text-slate-900 mb-4 border-b pb-2">Planos Comerciais Disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.planos.filter(p => p.ativo).map((p) => (
                    <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-base">{p.nome}</h5>
                      <p className="text-amber-600 font-mono text-xs font-bold mb-2">{p.valorMensal}</p>
                      <p className="text-slate-600 text-xs mb-3">{p.descricao}</p>
                      <ul className="text-xs space-y-1 text-slate-700">
                        {p.beneficios.map((b, i) => (
                          <li key={i}>✓ {b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Footer Preview */}
              <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl text-xs space-y-2">
                <h5 className="font-bold text-white text-sm">Contatos Corporativos</h5>
                <p><strong>Telefone:</strong> {config.contato.telefone} | <strong>WhatsApp:</strong> {config.contato.whatsapp}</p>
                <p><strong>E-mail:</strong> {config.contato.email}</p>
                <p><strong>Endereço:</strong> {config.contato.endereco}</p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="bg-[#0b1d33] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Fechar Prévia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
