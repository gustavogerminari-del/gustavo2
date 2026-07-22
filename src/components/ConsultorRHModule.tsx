/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Sparkles, 
  LayoutDashboard, 
  UserCheck, 
  Globe, 
  User, 
  Settings, 
  ChevronRight,
  ShieldAlert,
  ArrowLeftRight
} from 'lucide-react';

import { 
  INITIAL_CLIENTES, 
  INITIAL_VAGAS_CONSULTORIA, 
  INITIAL_CANDIDATOS_CONSULTORIA, 
  INITIAL_ENTREVISTAS, 
  INITIAL_CRM_DEALS, 
  INITIAL_CONTRATOS_FINANCEIRO, 
  INITIAL_RECEITAS_DESPESAS 
} from '../data_consultor';

import { 
  ClienteEmpresa, 
  VagaConsultoria, 
  CandidatoConsultoria, 
  EntrevistaConsultoria, 
  CRMDeal, 
  FinanceiroContrato, 
  ReceitaDespesa 
} from '../types_consultor';

// Import Subcomponents
import ConsultorDashboard from './consultor/ConsultorDashboard';
import ConsultorClientes from './consultor/ConsultorClientes';
import ConsultorVagas from './consultor/ConsultorVagas';
import ConsultorTalentos from './consultor/ConsultorTalentos';
import ConsultorPipeline from './consultor/ConsultorPipeline';
import ConsultorEntrevistas from './consultor/ConsultorEntrevistas';
import ConsultorCRMFinanceiro from './consultor/ConsultorCRMFinanceiro';
import ConsultorRelatoriosIA from './consultor/ConsultorRelatoriosIA';
import ConsultorPortals from './consultor/ConsultorPortals';
import SmartInterviewModule from './interview/SmartInterviewModule';

interface ConsultorRHModuleProps {
  subTab?: string;
  onSubTabChange?: (tab: string) => void;
}

export default function ConsultorRHModule({ subTab, onSubTabChange }: ConsultorRHModuleProps = {}) {
  
  // Navigation State
  const [internalTab, setInternalTab] = useState<
    'dashboard' | 'clientes' | 'vagas' | 'banco' | 'pipeline' | 'entrevistas' | 'crm' | 'financeiro' | 'relatorios' | 'ia' | 'portal-cliente' | 'portal-candidato'
  >('dashboard');

  const activeTab = (subTab as any) || internalTab;
  const setActiveTab = (tab: any) => {
    setInternalTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // Persona Switcher State (Multi-tenant Simulation)
  const [activePersona, setActivePersona] = useState<'consultor' | 'cliente' | 'candidato'>('consultor');

  // Main Datasets in State for full interactivity with LocalStorage Persistence
  const [clientes, setClientes] = useState<ClienteEmpresa[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_clientes');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
    } catch {
      return INITIAL_CLIENTES;
    }
  });

  const [vagas, setVagas] = useState<VagaConsultoria[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_vagas');
      return saved ? JSON.parse(saved) : INITIAL_VAGAS_CONSULTORIA;
    } catch {
      return INITIAL_VAGAS_CONSULTORIA;
    }
  });

  const [candidatos, setCandidatos] = useState<CandidatoConsultoria[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_candidatos');
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATOS_CONSULTORIA;
    } catch {
      return INITIAL_CANDIDATOS_CONSULTORIA;
    }
  });

  const [entrevistas, setEntrevistas] = useState<EntrevistaConsultoria[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_entrevistas');
      return saved ? JSON.parse(saved) : INITIAL_ENTREVISTAS;
    } catch {
      return INITIAL_ENTREVISTAS;
    }
  });

  const [deals, setDeals] = useState<CRMDeal[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_deals');
      return saved ? JSON.parse(saved) : INITIAL_CRM_DEALS;
    } catch {
      return INITIAL_CRM_DEALS;
    }
  });

  const [contratos, setContratos] = useState<FinanceiroContrato[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_contratos');
      return saved ? JSON.parse(saved) : INITIAL_CONTRATOS_FINANCEIRO;
    } catch {
      return INITIAL_CONTRATOS_FINANCEIRO;
    }
  });

  const [receitasDespesas, setReceitasDespesas] = useState<ReceitaDespesa[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_consultor_receitas');
      return saved ? JSON.parse(saved) : INITIAL_RECEITAS_DESPESAS;
    } catch {
      return INITIAL_RECEITAS_DESPESAS;
    }
  });

  // Persist dataset updates to localStorage
  useEffect(() => {
    localStorage.setItem('gestrh_consultor_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('gestrh_consultor_vagas', JSON.stringify(vagas));
  }, [vagas]);

  useEffect(() => {
    localStorage.setItem('gestrh_consultor_candidatos', JSON.stringify(candidatos));
  }, [candidatos]);

  useEffect(() => {
    localStorage.setItem('gestrh_consultor_entrevistas', JSON.stringify(entrevistas));
  }, [entrevistas]);

  useEffect(() => {
    localStorage.setItem('gestrh_consultor_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('gestrh_consultor_contratos', JSON.stringify(contratos));
  }, [contratos]);

  useEffect(() => {
    localStorage.setItem('gestrh_consultor_receitas', JSON.stringify(receitasDespesas));
  }, [receitasDespesas]);

  // Handlers
  const handleAddCliente = (cli: ClienteEmpresa) => setClientes([cli, ...clientes]);
  const handleUpdateCliente = (cli: ClienteEmpresa) => setClientes(clientes.map(c => c.id === cli.id ? cli : c));
  const handleDeleteCliente = (id: string) => setClientes(clientes.filter(c => c.id !== id));

  const syncVagasToFirebaseJobs = (updatedVagas: VagaConsultoria[]) => {
    try {
      const convertedJobs = updatedVagas.map(v => ({
        id: v.id,
        title: v.cargo,
        department: v.clienteNome || 'Consultoria',
        location: `${v.cidade || ''} - ${v.estado || ''}`,
        type: v.tipoContratacao || 'CLT',
        workModel: v.modalidade || 'Híbrido',
        salaryRange: typeof v.salario === 'number' ? `R$ ${v.salario.toLocaleString('pt-BR')}` : String(v.salario || 'A combinar'),
        description: v.descricao,
        requirements: v.requisitos || [],
        active: v.status === 'Aberta' || v.status === 'Em Andamento',
        createdAt: v.dataCriacao || new Date().toISOString().split('T')[0]
      }));

      // Merge converted jobs with existing non-consultor jobs
      const existingRaw = localStorage.getItem('firebase_jobs') || localStorage.getItem('JOBS');
      let existingJobs: any[] = existingRaw ? JSON.parse(existingRaw) : [];

      const jobMap = new Map<string, any>();
      existingJobs.forEach(j => jobMap.set(j.id, j));
      convertedJobs.forEach(j => jobMap.set(j.id, j));

      const merged = Array.from(jobMap.values());
      localStorage.setItem('firebase_jobs', JSON.stringify(merged));
      localStorage.setItem('JOBS', JSON.stringify(merged));
      window.dispatchEvent(new Event('jobsUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddVaga = (vaga: VagaConsultoria) => {
    const updated = [vaga, ...vagas];
    setVagas(updated);
    syncVagasToFirebaseJobs(updated);
  };
  const handleUpdateVaga = (vaga: VagaConsultoria) => {
    const updated = vagas.map(v => v.id === vaga.id ? vaga : v);
    setVagas(updated);
    syncVagasToFirebaseJobs(updated);
  };
  const handleDeleteVaga = (id: string) => {
    const updated = vagas.filter(v => v.id !== id);
    setVagas(updated);
    syncVagasToFirebaseJobs(updated);
  };

  const handleAddCandidato = (cand: CandidatoConsultoria) => setCandidatos([cand, ...candidatos]);
  const handleUpdateCandidato = (cand: CandidatoConsultoria) => setCandidatos(candidatos.map(c => c.id === cand.id ? cand : c));

  const handleAddEntrevista = (ent: EntrevistaConsultoria) => setEntrevistas([ent, ...entrevistas]);
  const handleUpdateEntrevista = (ent: EntrevistaConsultoria) => setEntrevistas(entrevistas.map(e => e.id === ent.id ? ent : e));

  const handleAddDeal = (deal: CRMDeal) => setDeals([deal, ...deals]);
  const handleUpdateDeal = (deal: CRMDeal) => setDeals(deals.map(d => d.id === deal.id ? deal : d));

  const handleAddReceitaDespesa = (rec: ReceitaDespesa) => setReceitasDespesas([rec, ...receitasDespesas]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar / Persona Switcher & Module Branding */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-lg text-sm border border-amber-300">
              RH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-bold text-base tracking-tight text-white">
                  Consultor de RH
                </h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                  Multi-Tenant SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Consultoria Estratégica & Recrutamento com IA</p>
            </div>
          </div>

          {/* Persona Switcher Bar */}
          <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700/80 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] px-2 font-mono flex items-center space-x-1">
              <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />
              <span>Visão de Perfil:</span>
            </span>

            <button
              onClick={() => {
                setActivePersona('consultor');
                if (activeTab === 'portal-cliente' || activeTab === 'portal-candidato') setActiveTab('dashboard');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
                activePersona === 'consultor' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Consultor RH</span>
            </button>

            <button
              onClick={() => {
                setActivePersona('cliente');
                setActiveTab('portal-cliente');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
                activePersona === 'cliente' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Empresa Cliente</span>
            </button>

            <button
              onClick={() => {
                setActivePersona('candidato');
                setActiveTab('portal-candidato');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
                activePersona === 'candidato' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Candidato</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Module Layout with Navigation Sidebar on Left */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Module Section Navigation Left Sidebar */}
          {activePersona === 'consultor' && !subTab && (
            <aside className="w-full lg:w-64 shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1 sticky top-20 z-10">
              <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span>Menu do Consultor</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">10 abas</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'dashboard' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </div>
                  {activeTab === 'dashboard' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('clientes')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'clientes' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>Clientes</span>
                  </div>
                  {activeTab === 'clientes' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('vagas')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'vagas' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    <span>Vagas</span>
                  </div>
                  {activeTab === 'vagas' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('banco')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'banco' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Banco de Talentos</span>
                  </div>
                  {activeTab === 'banco' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'pipeline' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span>Pipeline Kanban</span>
                  </div>
                  {activeTab === 'pipeline' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('entrevistas')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'entrevistas' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Entrevistas</span>
                  </div>
                  {activeTab === 'entrevistas' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('crm')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'crm' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    <span>CRM Comercial</span>
                  </div>
                  {activeTab === 'crm' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('financeiro')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'financeiro' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span>Financeiro</span>
                  </div>
                  {activeTab === 'financeiro' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('relatorios')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'relatorios' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>Relatórios</span>
                  </div>
                  {activeTab === 'relatorios' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>

                <button
                  onClick={() => setActiveTab('ia')}
                  className={`w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    activeTab === 'ia' ? 'bg-slate-900 text-amber-400 shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Consultor IA</span>
                  </div>
                  {activeTab === 'ia' && <ChevronRight className="h-4 w-4 hidden lg:block opacity-70" />}
                </button>
              </div>
            </aside>
          )}

          {/* Main Area View */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {activeTab === 'dashboard' && (
              <ConsultorDashboard
                clientes={clientes}
                vagas={vagas}
                candidatos={candidatos}
                entrevistas={entrevistas}
                onNavigate={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'clientes' && (
              <ConsultorClientes
                clientes={clientes}
                vagas={vagas}
                candidatos={candidatos}
                onAddCliente={handleAddCliente}
                onUpdateCliente={handleUpdateCliente}
                onDeleteCliente={handleDeleteCliente}
              />
            )}

            {activeTab === 'vagas' && (
              <ConsultorVagas
                vagas={vagas}
                clientes={clientes}
                onAddVaga={handleAddVaga}
                onUpdateVaga={handleUpdateVaga}
                onDeleteVaga={handleDeleteVaga}
              />
            )}

            {activeTab === 'banco' && (
              <ConsultorTalentos
                candidatos={candidatos}
                vagas={vagas}
                onAddCandidato={handleAddCandidato}
                onUpdateCandidato={handleUpdateCandidato}
              />
            )}

            {activeTab === 'pipeline' && (
              <ConsultorPipeline
                candidatos={candidatos}
                vagas={vagas}
                clientes={clientes}
                onUpdateCandidato={handleUpdateCandidato}
              />
            )}

            {activeTab === 'entrevistas' && (
              <SmartInterviewModule
                jobs={vagas.map(v => ({
                  id: v.id,
                  title: v.titulo,
                  department: v.area,
                  location: v.modalidade,
                  type: 'CLT',
                  status: 'Aberta',
                  description: v.descricao,
                  requirements: v.requisitos,
                  salaryRange: `R$ ${v.salarioBase?.toLocaleString('pt-BR') || 'A combinar'}`
                }))}
                candidates={candidatos.map(c => ({
                  id: c.id,
                  name: c.nome,
                  email: c.email,
                  phone: c.telefone,
                  area: c.cargoDesejado,
                  experience: c.pretensaoSalarial,
                  skills: c.habilidades,
                  education: c.senioridade,
                  resumeUrl: '#',
                  appliedDate: c.cadastradoEm,
                  status: c.status
                }))}
              />
            )}

            {(activeTab === 'crm' || activeTab === 'financeiro') && (
              <ConsultorCRMFinanceiro
                deals={deals}
                contratos={contratos}
                receitasDespesas={receitasDespesas}
                onAddDeal={handleAddDeal}
                onUpdateDeal={handleUpdateDeal}
                onAddReceitaDespesa={handleAddReceitaDespesa}
                activeSection={activeTab}
              />
            )}

            {(activeTab === 'relatorios' || activeTab === 'ia') && (
              <ConsultorRelatoriosIA
                clientes={clientes}
                vagas={vagas}
                candidatos={candidatos}
                activeSection={activeTab}
              />
            )}

            {(activeTab === 'portal-cliente' || activePersona === 'cliente') && (
              <ConsultorPortals
                clientes={clientes}
                vagas={vagas}
                candidatos={candidatos}
                activePortal="cliente"
              />
            )}

            {(activeTab === 'portal-candidato' || activePersona === 'candidato') && (
              <ConsultorPortals
                clientes={clientes}
                vagas={vagas}
                candidatos={candidatos}
                activePortal="candidato"
              />
            )}
          </main>

        </div>
      </div>

    </div>
  );
}
