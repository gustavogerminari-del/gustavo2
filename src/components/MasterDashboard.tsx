/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Package, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Calendar,
  Globe,
  Settings,
  Search,
  Activity
} from 'lucide-react';
import { firebaseService } from '../firebase';
import { SaaSModule, SaaSProduct, SaaSPlan, SaaSCompany, UserAccount } from '../types_master';

interface MasterDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
}

export default function MasterDashboard({ currentUser, onLogout }: MasterDashboardProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'products' | 'plans' | 'companies'>('overview');
  
  // Data State
  const [modules, setModules] = useState<SaaSModule[]>([]);
  const [products, setProducts] = useState<SaaSProduct[]>([]);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [companies, setCompanies] = useState<SaaSCompany[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Form states
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SaaSModule | null>(null);
  const [moduleForm, setModuleForm] = useState({ name: '', description: '', price: 0, status: 'Ativo' as 'Ativo' | 'Inativo' });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SaaSProduct | null>(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', monthlyPrice: 0, annualPrice: 0, status: 'Ativo' as 'Ativo' | 'Inativo', linkedModules: [] as string[] });

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', monthlyPrice: 0, annualPrice: 0, includedModules: [] as string[], userLimit: 10, status: 'Ativo' as 'Ativo' | 'Inativo' });

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<SaaSCompany | null>(null);
  const [companyForm, setCompanyForm] = useState({ 
    name: '', 
    cnpj: '', 
    adminEmail: '', 
    status: 'Ativo' as 'Ativo' | 'Bloqueado', 
    planId: '', 
    releasedModules: [] as string[], 
    userLimit: 10,
    address: '',
    contact: '',
    adminPassword: ''
  });

  // Load Data
  const loadSaaSData = async () => {
    try {
      setLoading(true);
      const [allMods, allProds, allPlans, allCompanies] = await Promise.all([
        firebaseService.db.getModules(),
        firebaseService.db.getProducts(),
        firebaseService.db.getPlans(),
        firebaseService.db.getCompanies()
      ]);
      setModules(allMods);
      setProducts(allProds);
      setPlans(allPlans);
      setCompanies(allCompanies);
    } catch (err: any) {
      showToast('error', 'Falha ao carregar dados do Firebase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaaSData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // --- MODULE ACTIONS ---
  const handleOpenModuleModal = (mod?: SaaSModule) => {
    if (mod) {
      setEditingModule(mod);
      setModuleForm({ name: mod.name, description: mod.description, price: mod.price, status: mod.status });
    } else {
      setEditingModule(null);
      setModuleForm({ name: '', description: '', price: 0, status: 'Ativo' });
    }
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.name) {
      showToast('error', 'Nome do módulo é obrigatório.');
      return;
    }
    try {
      const newMod: SaaSModule = {
        id: editingModule?.id || `mod-${Date.now()}`,
        name: moduleForm.name,
        description: moduleForm.description,
        price: Number(moduleForm.price),
        status: moduleForm.status
      };
      await firebaseService.db.saveModule(newMod);
      showToast('success', editingModule ? 'Módulo atualizado com sucesso!' : 'Módulo cadastrado com sucesso!');
      setIsModuleModalOpen(false);
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao salvar módulo.');
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este módulo de venda?')) return;
    try {
      await firebaseService.db.deleteModule(id);
      showToast('success', 'Módulo excluído com sucesso!');
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao excluir módulo.');
    }
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenProductModal = (prod?: SaaSProduct) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        description: prod.description,
        monthlyPrice: prod.monthlyPrice,
        annualPrice: prod.annualPrice,
        status: prod.status,
        linkedModules: prod.linkedModules || []
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', monthlyPrice: 0, annualPrice: 0, status: 'Ativo', linkedModules: [] });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) {
      showToast('error', 'Nome do produto é obrigatório.');
      return;
    }
    try {
      const newProd: SaaSProduct = {
        id: editingProduct?.id || `prod-${Date.now()}`,
        name: productForm.name,
        description: productForm.description,
        monthlyPrice: Number(productForm.monthlyPrice),
        annualPrice: Number(productForm.annualPrice),
        status: productForm.status,
        linkedModules: productForm.linkedModules
      };
      await firebaseService.db.saveProduct(newProd);
      showToast('success', editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      setIsProductModalOpen(false);
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao salvar produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este produto?')) return;
    try {
      await firebaseService.db.deleteProduct(id);
      showToast('success', 'Produto excluído com sucesso!');
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao excluir produto.');
    }
  };

  // --- PLAN ACTIONS ---
  const handleOpenPlanModal = (plan?: SaaSPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        includedModules: plan.includedModules || [],
        userLimit: plan.userLimit,
        status: plan.status
      });
    } else {
      setEditingPlan(null);
      setPlanForm({ name: '', monthlyPrice: 0, annualPrice: 0, includedModules: [], userLimit: 10, status: 'Ativo' });
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name) {
      showToast('error', 'Nome do plano é obrigatório.');
      return;
    }
    try {
      const newPlan: SaaSPlan = {
        id: editingPlan?.id || `plan-${Date.now()}`,
        name: planForm.name,
        monthlyPrice: Number(planForm.monthlyPrice),
        annualPrice: Number(planForm.annualPrice),
        includedModules: planForm.includedModules,
        userLimit: Number(planForm.userLimit),
        status: planForm.status
      };
      await firebaseService.db.savePlan(newPlan);
      showToast('success', editingPlan ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!');
      setIsPlanModalOpen(false);
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao salvar plano.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este plano?')) return;
    try {
      await firebaseService.db.deletePlan(id);
      showToast('success', 'Plano excluído com sucesso!');
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao excluir plano.');
    }
  };

  // --- COMPANY ACTIONS ---
  const handleOpenCompanyModal = (comp?: SaaSCompany) => {
    if (comp) {
      setEditingCompany(comp);
      setCompanyForm({
        name: comp.name,
        cnpj: comp.cnpj,
        adminEmail: comp.adminEmail,
        status: comp.status,
        planId: comp.planId,
        releasedModules: comp.releasedModules || [],
        userLimit: comp.userLimit,
        address: comp.address || '',
        contact: comp.contact || '',
        adminPassword: '' // keep empty on load; enter only to reset/update
      });
    } else {
      setEditingCompany(null);
      const defaultPlan = plans[0];
      setCompanyForm({ 
        name: '', 
        cnpj: '', 
        adminEmail: '', 
        status: 'Ativo', 
        planId: defaultPlan?.id || '', 
        releasedModules: defaultPlan?.includedModules || [], 
        userLimit: defaultPlan?.userLimit || 10,
        address: '',
        contact: '',
        adminPassword: ''
      });
    }
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.adminEmail) {
      showToast('error', 'Nome e E-mail de administração são obrigatórios.');
      return;
    }
    if (!editingCompany && !companyForm.adminPassword) {
      showToast('error', 'Defina uma senha de acesso para o login do administrador.');
      return;
    }
    try {
      const companyId = editingCompany?.id || `company-${Date.now()}`;
      
      let finalModules = companyForm.releasedModules;
      let finalUserLimit = companyForm.userLimit;
      
      const selectedPlan = plans.find(p => p.id === companyForm.planId);
      if ((!finalModules || finalModules.length === 0) && selectedPlan) {
        finalModules = selectedPlan.includedModules;
        finalUserLimit = selectedPlan.userLimit;
      }

      const newCompany: SaaSCompany = {
        id: companyId,
        name: companyForm.name,
        cnpj: companyForm.cnpj,
        adminEmail: companyForm.adminEmail,
        status: companyForm.status,
        planId: companyForm.planId,
        releasedModules: finalModules,
        userLimit: finalUserLimit,
        createdAt: editingCompany?.createdAt || new Date().toISOString().split('T')[0],
        address: companyForm.address,
        contact: companyForm.contact
      };

      // Optimistic local state update for instant UI feedback
      setCompanies(prev => {
        const idx = prev.findIndex(c => c.id === newCompany.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newCompany;
          return copy;
        }
        return [newCompany, ...prev];
      });

      await firebaseService.db.saveCompany(newCompany);

      // Create or update companion Admin UserAccount
      const allUsers = await firebaseService.db.getUsers();
      const existingAdmin = allUsers.find(u => u.email.trim().toLowerCase() === companyForm.adminEmail.trim().toLowerCase());

      if (existingAdmin) {
        // Update user information and update password if provided
        existingAdmin.name = `${companyForm.name} (Admin)`;
        if (companyForm.adminPassword) {
          existingAdmin.password = companyForm.adminPassword;
        }
        await firebaseService.db.saveUser(existingAdmin);
      } else {
        // Create new companion admin
        const adminUser: UserAccount = {
          id: `usr-${Date.now()}`,
          email: companyForm.adminEmail,
          name: `${companyForm.name} (Admin)`,
          role: 'Empresa Administradora',
          companyId: companyId,
          status: 'Ativo',
          password: companyForm.adminPassword
        };
        await firebaseService.db.saveUser(adminUser);
      }

      showToast('success', editingCompany ? 'Empresa cliente atualizada!' : 'Empresa cliente cadastrada com e-mail e senha de administração liberados!');
      setIsCompanyModalOpen(false);
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao salvar empresa.');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm('Deseja realmente remover esta empresa? Todos os acessos vinculados serão excluídos.')) return;
    try {
      await firebaseService.db.deleteCompany(id);
      showToast('success', 'Empresa cliente removida com sucesso!');
      loadSaaSData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao remover empresa.');
    }
  };

  // Toggle module in forms
  const toggleFormModule = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(x => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Calculated Stats
  const stats = {
    mrr: companies.reduce((acc, c) => {
      if (c.status === 'Bloqueado') return acc;
      const plan = plans.find(p => p.id === c.planId);
      return acc + (plan?.monthlyPrice || 0);
    }, 0),
    companiesCount: companies.length,
    activeCompanies: companies.filter(c => c.status === 'Ativo').length,
    blockedCompanies: companies.filter(c => c.status === 'Bloqueado').length,
    modulesCount: modules.length,
    plansCount: plans.length
  };

  // Filter lists based on search query
  const filteredModulesList = modules.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProductsList = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPlansList = plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCompaniesList = companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.cnpj.includes(searchQuery) || c.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Toast Notifier */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center space-x-3 animate-bounce ${
          toast.type === 'success' ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-rose-500/30 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium text-sm text-white">{toast.message}</span>
        </div>
      )}

      {/* Sidebar - Panel Master */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 rounded-xl text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase">Acesso Master</h1>
              <p className="text-amber-500 text-[10px] font-mono tracking-widest leading-none mt-0.5">SAAS OWNER</p>
            </div>
          </div>
          <div className="mt-4 bg-slate-950/50 rounded-lg p-2.5 border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Proprietário logado</p>
            <p className="text-white text-xs font-medium truncate">{currentUser.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'overview' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="h-4.5 w-4.5" />
            <span>Visão Geral & Métricas</span>
          </button>

          <button
            onClick={() => { setActiveTab('modules'); setSearchQuery(''); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'modules' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            <span>Gestão de Módulos ({modules.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'products' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="h-4.5 w-4.5" />
            <span>Gestão de Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('plans'); setSearchQuery(''); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'plans' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>Criador de Planos ({plans.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('companies'); setSearchQuery(''); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'companies' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="h-4.5 w-4.5" />
            <span>Empresas Clientes ({companies.length})</span>
          </button>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-4 py-3 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair do Painel Master</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Frame */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800 mb-8">
          <div>
            <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest mb-1">PROPRIETÁRIO DO SISTEMA (SAAS OWNER)</div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">
              {activeTab === 'overview' && 'Painel de Gestão e Métricas'}
              {activeTab === 'modules' && 'Módulos Comerciais Disponíveis'}
              {activeTab === 'products' && 'Produtos de Venda'}
              {activeTab === 'plans' && 'Criador e Gestão de Planos'}
              {activeTab === 'companies' && 'Controle de Empresas Clientes'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {activeTab === 'overview' && 'Monitore a receita, planos contratados e status do ecossistema SaaS.'}
              {activeTab === 'modules' && 'Cadastre e gerencie os micro-serviços licenciáveis do RH.'}
              {activeTab === 'products' && 'Combine módulos em pacotes de venda específicos para o mercado.'}
              {activeTab === 'plans' && 'Monte ofertas completas recorrentes (mensais / anuais) com limites de usuários.'}
              {activeTab === 'companies' && 'Cadastre corporações, altere assinaturas, libere módulos adicionais ou bloqueie acessos.'}
            </p>
          </div>

          {/* Search bar inside lists */}
          {activeTab !== 'overview' && (
            <div className="relative flex items-center max-w-xs w-full">
              <Search className="h-4 w-4 text-slate-500 absolute left-3" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-slate-400 text-xs">Comunicando com o Firestore Database...</p>
          </div>
        ) : (
          <>
            {/* --- TAB 1: VISÃO GERAL --- */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metric Bento Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-mono tracking-wider uppercase font-bold">MRR Estimado (Recorrência Mensal)</p>
                    <p className="text-2xl md:text-3xl font-semibold text-white tracking-tight mt-2">
                      {stats.mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-slate-500 text-[10px] font-medium mt-1">Soma das mensalidades dos planos ativos</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-mono tracking-wider uppercase font-bold">Total de Empresas Clientes</p>
                    <p className="text-2xl md:text-3xl font-semibold text-white tracking-tight mt-2">
                      {stats.companiesCount}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1 font-medium">
                      <span className="text-emerald-400">● {stats.activeCompanies} Ativas</span>
                      <span>•</span>
                      <span className="text-rose-400">● {stats.blockedCompanies} Bloqueadas</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                      <Layers className="h-5 w-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-mono tracking-wider uppercase font-bold">Módulos Cadastrados</p>
                    <p className="text-2xl md:text-3xl font-semibold text-white tracking-tight mt-2">
                      {stats.modulesCount}
                    </p>
                    <p className="text-slate-500 text-[10px] font-medium mt-1">Módulos de venda licenciáveis</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-mono tracking-wider uppercase font-bold">Planos Ativos</p>
                    <p className="text-2xl md:text-3xl font-semibold text-white tracking-tight mt-2">
                      {stats.plansCount}
                    </p>
                    <p className="text-slate-500 text-[10px] font-medium mt-1">Modelos de precificação montados</p>
                  </div>
                </div>

                {/* Info message for Master Role */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400 font-display">Apenas Você tem este Poder</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Como usuário **Master**, você é o único que possui permissão de escrita e edição nas regras globais do SaaS (Módulos, Produtos, Planos e cadastro de Empresas). Nenhuma empresa administradora ou profissional de RH poderá acessar ou alterar essas configurações, garantindo blindagem das definições financeiras e técnicas da plataforma.
                    </p>
                  </div>
                </div>

                {/* Subsections: Quick view of companies and plans */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                      <h3 className="font-semibold text-sm font-display text-white">Empresas Clientes Recentes</h3>
                      <button onClick={() => setActiveTab('companies')} className="text-xs text-amber-500 hover:underline">Ver todas &raquo;</button>
                    </div>
                    {companies.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">Nenhuma empresa registrada.</p>
                    ) : (
                      <div className="space-y-3.5">
                        {companies.slice(0, 4).map(c => {
                          const plan = plans.find(p => p.id === c.planId);
                          return (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/60">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">CNPJ: {c.cnpj} | {c.adminEmail}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="inline-block text-[10px] font-semibold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 mb-1">
                                  {plan?.name || 'Módulos customizados'}
                                </span>
                                <p className="text-[10px]">
                                  {c.status === 'Ativo' ? (
                                    <span className="text-emerald-400 font-semibold">● Ativo</span>
                                  ) : (
                                    <span className="text-rose-400 font-semibold">● Bloqueado</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                      <h3 className="font-semibold text-sm font-display text-white">Módulos e Valores Comerciais</h3>
                      <button onClick={() => setActiveTab('modules')} className="text-xs text-amber-500 hover:underline">Ver todos &raquo;</button>
                    </div>
                    <div className="space-y-3">
                      {modules.slice(0, 5).map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/60">
                          <div>
                            <p className="text-xs font-semibold text-white">{m.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-sm truncate">{m.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-emerald-400">{m.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${m.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 2: GESTÃO DE MÓDULOS --- */}
            {activeTab === 'modules' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total de {filteredModulesList.length} módulos disponíveis para venda</span>
                  <button
                    onClick={() => handleOpenModuleModal()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Novo Módulo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredModulesList.map(mod => (
                    <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-sm font-display text-white">{mod.name}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                            mod.status === 'Ativo' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/15 text-rose-400 border border-rose-500/10'
                          }`}>
                            {mod.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">{mod.description || 'Sem descrição cadastrada.'}</p>
                      </div>

                      <div className="border-t border-slate-800 pt-4 mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">Valor Mensal</p>
                          <p className="text-sm font-bold text-emerald-400">{mod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModuleModal(mod)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700"
                            title="Editar Módulo"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors border border-rose-500/20"
                            title="Excluir Módulo"
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

            {/* --- TAB 3: GESTÃO DE PRODUTOS --- */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total de {filteredProductsList.length} pacotes comerciais ativos</span>
                  <button
                    onClick={() => handleOpenProductModal()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Criar Novo Produto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProductsList.map(prod => (
                    <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-base font-display text-white">{prod.name}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${
                            prod.status === 'Ativo' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {prod.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">{prod.description}</p>

                        <div className="mb-4">
                          <p className="text-[10px] text-slate-400 font-mono uppercase mb-2">Módulos Vinculados neste Produto</p>
                          <div className="flex flex-wrap gap-1.5">
                            {prod.linkedModules && prod.linkedModules.length > 0 ? (
                              prod.linkedModules.map(mId => {
                                const modObj = modules.find(m => m.id === mId);
                                return (
                                  <span key={mId} className="text-[9px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded font-medium">
                                    {modObj ? modObj.name : mId}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Nenhum módulo vinculado</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                        <div className="flex space-x-6">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-mono">Mensal</p>
                            <p className="text-sm font-bold text-emerald-400">{prod.monthlyPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-mono">Anual</p>
                            <p className="text-sm font-bold text-emerald-400">{prod.annualPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenProductModal(prod)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors border border-rose-500/20"
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

            {/* --- TAB 4: CRIADOR DE PLANOS --- */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total de {filteredPlansList.length} planos estruturados</span>
                  <button
                    onClick={() => handleOpenPlanModal()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Montar Novo Plano</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlansList.map(plan => (
                    <div key={plan.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between border-t-4 border-t-amber-500">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-base font-display text-white">{plan.name}</h3>
                            <span className="text-[10px] text-slate-400 font-medium">Limite: {plan.userLimit === 999 ? 'Usuários Ilimitados' : `Até ${plan.userLimit} usuários`}</span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                            plan.status === 'Ativo' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {plan.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-6">
                          <p className="text-[9px] text-slate-400 font-mono uppercase">Módulos Inclusos neste Plano</p>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-40 overflow-y-auto space-y-1">
                            {plan.includedModules && plan.includedModules.length > 0 ? (
                              plan.includedModules.map(mId => {
                                const modObj = modules.find(m => m.id === mId);
                                return (
                                  <div key={mId} className="flex items-center space-x-2 text-[10px] text-slate-300">
                                    <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span className="truncate">{modObj ? modObj.name : mId}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-slate-500 italic text-center py-2">Sem módulos vinculados</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-4 mt-2">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-mono">Mensalidade</p>
                            <p className="text-sm font-bold text-emerald-400">{plan.monthlyPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-slate-400 uppercase font-mono">Anuidade</p>
                            <p className="text-sm font-bold text-emerald-400">{plan.annualPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenPlanModal(plan)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs py-2 rounded-lg transition-colors border border-slate-700 flex items-center justify-center space-x-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Configurar</span>
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-2 rounded-lg transition-all border border-rose-500/20"
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

            {/* --- TAB 5: GESTÃO DE EMPRESAS CLIENTES --- */}
            {activeTab === 'companies' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total de {filteredCompaniesList.length} empresas integradas</span>
                  <button
                    onClick={() => handleOpenCompanyModal()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Nova Empresa</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-mono uppercase">
                          <th className="p-4">Empresa / CNPJ</th>
                          <th className="p-4">E-mail Administrativo</th>
                          <th className="p-4">Plano Vinculado</th>
                          <th className="p-4">Limite Usuários</th>
                          <th className="p-4">Módulos Ativos</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredCompaniesList.map(comp => {
                          const activePlan = plans.find(p => p.id === comp.planId);
                          return (
                            <tr key={comp.id} className="hover:bg-slate-850/50 transition-colors">
                              <td className="p-4">
                                <p className="font-semibold text-white text-sm">{comp.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">CNPJ: {comp.cnpj || 'Não informado'}</p>
                                {(comp.address || comp.contact) && (
                                  <div className="text-[10px] text-slate-500 mt-1.5 space-y-0.5 border-t border-slate-800/40 pt-1.5 max-w-[240px]">
                                    {comp.address && <p className="truncate" title={comp.address}>📍 {comp.address}</p>}
                                    {comp.contact && <p className="truncate" title={comp.contact}>📞 {comp.contact}</p>}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 font-mono text-xs">{comp.adminEmail}</td>
                              <td className="p-4">
                                <span className="inline-block text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
                                  {activePlan?.name || 'Personalizado'}
                                </span>
                              </td>
                              <td className="p-4 text-center font-bold text-white">{comp.userLimit}</td>
                              <td className="p-4">
                                <span className="text-white font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                  {comp.releasedModules?.length || 0} de {modules.length}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  comp.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${comp.status === 'Ativo' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                  <span>{comp.status}</span>
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleOpenCompanyModal(comp)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700"
                                    title="Configurar Acesso e Plano"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCompany(comp.id)}
                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-colors border border-rose-500/20"
                                    title="Remover Empresa"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODALS FOR CREATING / EDITING --- */}

      {/* 1. MODULE MODAL */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveModule} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">{editingModule ? 'Editar Módulo de Venda' : 'Cadastrar Novo Módulo'}</h3>
                <p className="text-slate-400 text-[10px]">Licenciável por empresas clientes</p>
              </div>
              <button type="button" onClick={() => setIsModuleModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Nome do Módulo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banco de talentos"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Descrição Comercial</label>
                <textarea
                  rows={3}
                  placeholder="Descreva o que este módulo oferece para a empresa..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Valor Unitário Mensal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={moduleForm.price}
                    onChange={(e) => setModuleForm({ ...moduleForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Status de Venda</label>
                  <select
                    value={moduleForm.status}
                    onChange={(e) => setModuleForm({ ...moduleForm, status: e.target.value as 'Ativo' | 'Inativo' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsModuleModalOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold">Cancelar</button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/15">Salvar Módulo</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">{editingProduct ? 'Configurar Produto de Venda' : 'Criar Novo Produto de Venda'}</h3>
                <p className="text-slate-400 text-[10px]">Agrupe módulos em um pacote comercial</p>
              </div>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Nome do Pacote Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Suíte Gestão de Pessoas"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Destaque as principais vantagens deste pacote..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.monthlyPrice}
                    onChange={(e) => setProductForm({ ...productForm, monthlyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Valor Anual (R$) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.annualPrice}
                    onChange={(e) => setProductForm({ ...productForm, annualPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">Selecione os Módulos Vinculados *</label>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                    {modules.map(mod => (
                      <label key={mod.id} className="flex items-start space-x-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                        <input
                          type="checkbox"
                          checked={productForm.linkedModules.includes(mod.id)}
                          onChange={() => toggleFormModule(productForm.linkedModules, mod.id, (v) => setProductForm({ ...productForm, linkedModules: v }))}
                          className="mt-0.5 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-800"
                        />
                        <div>
                          <p className="font-semibold">{mod.name}</p>
                          <p className="text-[10px] text-slate-500">{mod.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Status</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as 'Ativo' | 'Inativo' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold">Cancelar</button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/15">Salvar Produto</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. PLAN MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePlan} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">{editingPlan ? 'Configurar Plano Recorrente' : 'Montar Novo Plano de Assinatura'}</h3>
                <p className="text-slate-400 text-[10px]">Crie ofertas que se tornam fáceis para os clientes contratarem</p>
              </div>
              <button type="button" onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Nome do Plano *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Plano Intermediário"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Limite Máximo de Usuários *</label>
                  <input
                    type="number"
                    required
                    value={planForm.userLimit}
                    onChange={(e) => setPlanForm({ ...planForm, userLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.monthlyPrice}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Valor Anual (R$) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.annualPrice}
                    onChange={(e) => setPlanForm({ ...planForm, annualPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">Módulos Inclusos de Fábrica neste Plano</label>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                  {modules.map(mod => (
                    <label key={mod.id} className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={planForm.includedModules.includes(mod.id)}
                        onChange={() => toggleFormModule(planForm.includedModules, mod.id, (v) => setPlanForm({ ...planForm, includedModules: v }))}
                        className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-800"
                      />
                      <span>{mod.name} <span className="text-[10px] text-slate-500 font-mono">({mod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês)</span></span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Status</label>
                <select
                  value={planForm.status}
                  onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as 'Ativo' | 'Inativo' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsPlanModalOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold">Cancelar</button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/15">Montar Plano</button>
            </div>
          </form>
        </div>
      )}

      {/* 4. COMPANY MODAL */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCompany} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">{editingCompany ? 'Vincular Plano & Configurar Empresa' : 'Cadastrar Empresa Cliente'}</h3>
                <p className="text-slate-400 text-[10px]">Associe planos, libere módulos adicionais ou altere permissões de acesso</p>
              </div>
              <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Nome Fantasia da Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Empresa Exemplo LTDA"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="Ex: 00.000.000/0001-00"
                    value={companyForm.cnpj}
                    onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista, 1000, São Paulo - SP"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Contato (Telefone/Nome)</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98765-4321 - João"
                    value={companyForm.contact}
                    onChange={(e) => setCompanyForm({ ...companyForm, contact: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">E-mail do Administrador Principal *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingCompany}
                    placeholder="Ex: admin@empresa.com"
                    value={companyForm.adminEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, adminEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                  {!editingCompany && <p className="text-[10px] text-slate-500 mt-1">Este e-mail será o usuário de login de Administrador.</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    {editingCompany ? 'Nova Senha (em branco para manter)' : 'Senha de Acesso Principal *'}
                  </label>
                  <input
                    type="password"
                    required={!editingCompany}
                    placeholder={editingCompany ? 'Sua nova senha' : 'Defina a senha do Administrador'}
                    value={companyForm.adminPassword}
                    onChange={(e) => setCompanyForm({ ...companyForm, adminPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Vincular Plano Contratado *</label>
                <select
                  value={companyForm.planId}
                  onChange={(e) => {
                    const selPlanId = e.target.value;
                    const planObj = plans.find(p => p.id === selPlanId);
                    setCompanyForm({
                      ...companyForm,
                      planId: selPlanId,
                      // Update default modules & user limit if plan is updated
                      releasedModules: planObj ? planObj.includedModules : [],
                      userLimit: planObj ? planObj.userLimit : 10
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Assinar Plano Customizado --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.monthlyPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês)</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">Liberar Módulos Conforme Compra Adicional</label>
                  <span className="text-[10px] text-amber-500 font-semibold font-mono">Modifique para vendas avulsas</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                  {modules.map(mod => (
                    <label key={mod.id} className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={companyForm.releasedModules.includes(mod.id)}
                        onChange={() => toggleFormModule(companyForm.releasedModules, mod.id, (v) => setCompanyForm({ ...companyForm, releasedModules: v }))}
                        className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-800"
                      />
                      <span>{mod.name} <span className="text-[10px] text-slate-500">({mod.description})</span></span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Limite Máximo de Colaboradores</label>
                  <input
                    type="number"
                    value={companyForm.userLimit}
                    onChange={(e) => setCompanyForm({ ...companyForm, userLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Acesso à Plataforma</label>
                  <select
                    value={companyForm.status}
                    onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value as 'Ativo' | 'Bloqueado' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Ativo">✔ Ativo (Liberado)</option>
                    <option value="Bloqueado">❌ Bloqueado (Suspender acesso)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsCompanyModalOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold">Cancelar</button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/15">Confirmar Vinculação</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
