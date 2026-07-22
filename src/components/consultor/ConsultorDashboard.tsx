/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target, 
  Sparkles,
  ArrowUpRight,
  UserCheck,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { ClienteEmpresa, VagaConsultoria, CandidatoConsultoria, EntrevistaConsultoria } from '../../types_consultor';

interface ConsultorDashboardProps {
  clientes: ClienteEmpresa[];
  vagas: VagaConsultoria[];
  candidatos: CandidatoConsultoria[];
  entrevistas: EntrevistaConsultoria[];
  onNavigate: (tab: string) => void;
}

export default function ConsultorDashboard({
  clientes,
  vagas,
  candidatos,
  entrevistas,
  onNavigate
}: ConsultorDashboardProps) {
  // Metrics
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
  const vagasAbertas = vagas.filter(v => v.status === 'Aberta' || v.status === 'Em Andamento').length;
  const vagasFinalizadas = vagas.filter(v => v.status === 'Finalizada').length;
  const curriculosRecebidos = candidatos.length;
  const entrevistasAgendadas = entrevistas.filter(e => e.status === 'Agendada').length;
  const contratacoes = candidatos.filter(c => c.etapaPipeline === 'Contratado' || c.etapaPipeline === 'Aprovado').length;
  const taxaConversao = curriculosRecebidos > 0 ? Math.round((contratacoes / curriculosRecebidos) * 100) : 0;
  const tempoMedio = 18; // dias
  const receitaMes = 26500; // R$

  // Chart Data
  const monthlyData = [
    { mes: 'Jan', vagas: 12, contratacoes: 8, receita: 18000 },
    { mes: 'Fev', vagas: 15, contratacoes: 10, receita: 22000 },
    { mes: 'Mar', vagas: 18, contratacoes: 14, receita: 28500 },
    { mes: 'Abr', vagas: 14, contratacoes: 11, receita: 21000 },
    { mes: 'Mai', vagas: 22, contratacoes: 16, receita: 32000 },
    { mes: 'Jun', vagas: 20, contratacoes: 15, receita: 29000 },
    { mes: 'Jul', vagas: 25, contratacoes: 19, receita: 35000 }
  ];

  const stageData = [
    { name: 'Novos', value: candidatos.filter(c => c.etapaPipeline === 'Novo').length || 4 },
    { name: 'Triagem', value: candidatos.filter(c => c.etapaPipeline === 'Triagem').length || 6 },
    { name: 'Entrevista RH', value: candidatos.filter(c => c.etapaPipeline === 'Entrevista RH').length || 5 },
    { name: 'Entrevista Cliente', value: candidatos.filter(c => c.etapaPipeline === 'Entrevista Cliente').length || 3 },
    { name: 'Aprovados', value: candidatos.filter(c => c.etapaPipeline === 'Aprovado' || c.etapaPipeline === 'Contratado').length || 2 }
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#1e293b] p-6 rounded-2xl border border-amber-500/20 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Painel Executivo de Consultoria de RH</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Visão Geral do Ecossistema
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Acompanhe os principais indicadores de desempenho, fluxo de candidaturas, entrevistas ativas e receita gerada por processos seletivos.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('vagas')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Briefcase className="h-4 w-4" />
              <span>Nova Vaga</span>
            </button>
            <button
              onClick={() => onNavigate('ia')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Consultor IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 10 Executive Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1 */}
        <button 
          onClick={() => onNavigate('clientes')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="group-hover:text-slate-900 transition-colors">Clientes Totais</span>
            <Building2 className="h-4 w-4 text-slate-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-slate-900">{totalClientes}</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              {clientesAtivos} Ativos
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Empresas atendidas</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </button>

        {/* Card 2 - Vagas Abertas (Clicking navigates to All Vagas) */}
        <button 
          onClick={() => onNavigate('vagas')}
          className="bg-white p-4 rounded-2xl border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group bg-gradient-to-br from-white to-amber-50/20"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="group-hover:text-amber-700 transition-colors font-bold text-amber-900">Vagas Abertas</span>
            <Briefcase className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-slate-900">{vagasAbertas}</span>
            <span className="text-[10px] text-slate-500 font-medium">/ {vagasFinalizadas} Concluídas</span>
          </div>
          <p className="text-[11px] text-amber-600 font-bold mt-1 flex items-center justify-between">
            <span>Ver todas as vagas &rarr;</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-amber-500" />
          </p>
        </button>

        {/* Card 3 */}
        <button 
          onClick={() => onNavigate('banco')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="group-hover:text-blue-700 transition-colors">Currículos</span>
            <Users className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-slate-900">{curriculosRecebidos}</span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">+12 hoje</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Banco de talentos</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </button>

        {/* Card 4 */}
        <button 
          onClick={() => onNavigate('entrevistas')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="group-hover:text-indigo-700 transition-colors">Entrevistas</span>
            <Calendar className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-slate-900">{entrevistasAgendadas}</span>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Agendadas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Agenda de seleções</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </button>

        {/* Card 5 */}
        <button 
          onClick={() => onNavigate('pipeline')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span className="group-hover:text-emerald-700 transition-colors">Contratações</span>
            <Award className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-display text-emerald-600">{contratacoes}</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              {taxaConversao}% Fit
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Ver no Pipeline Kanban</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </button>

      </div>

      {/* Secondary Performance Indicator Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Tempo Médio de Contratação</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-display text-amber-400">{tempoMedio} dias</span>
              <span className="text-[10px] text-emerald-400 font-semibold">-3 dias que média de mercado</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Taxa de Conversão (Triagem-Admissão)</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-display text-emerald-400">{taxaConversao}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">+18% de precisão IA</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Target className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Faturamento Estimado no Mês</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-display text-amber-400">
                R$ {receitaMes.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">+12.5% vs Mês Anterior</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Active Jobs Quick Access Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Vagas Abertas em Seleção</h3>
              <p className="text-xs text-slate-500">Clique em qualquer vaga para acessar a página de todas as vagas e gerenciar candidatos</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('vagas')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Ver Todas as Vagas</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vagas.slice(0, 6).map((vaga) => {
            const cliente = clientes.find(c => c.id === vaga.clienteId);
            return (
              <div
                key={vaga.id}
                onClick={() => onNavigate('vagas')}
                className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/20 hover:from-amber-50/40 hover:to-amber-100/40 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {vaga.modalidade}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {vaga.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-900 transition-colors line-clamp-1">
                    {vaga.cargo}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center space-x-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cliente?.nomeFantasia || cliente?.razaoSocial || 'Empresa Cliente'}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {vaga.descricao}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 font-mono">
                    {typeof vaga.salario === 'number' ? `R$ ${vaga.salario.toLocaleString('pt-BR')}` : vaga.salario}
                  </span>
                  <span className="text-amber-700 font-bold group-hover:underline flex items-center space-x-1">
                    <span>Acessar vaga</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Vagas e Receita */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Evolução de Vagas & Receita de Consultoria</h3>
              <p className="text-xs text-slate-500">Histórico mensal de fechamentos e faturamento em R$</p>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">2026</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="vagas" name="Vagas Fechadas" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="contratacoes" name="Contratações" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart: Pipeline Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Distribuição no Funil</h3>
              <p className="text-xs text-slate-500">Candidatos por etapa ativa</p>
            </div>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stageData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={4}
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            {stageData.map((item, i) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="truncate">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Activity Feeds: Upcoming Interviews & Latest Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Próximas Entrevistas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>Próximas Entrevistas Agendadas</span>
            </h3>
            <button 
              onClick={() => onNavigate('entrevistas')} 
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            {entrevistas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma entrevista agendada para os próximos dias.</p>
            ) : (
              entrevistas.slice(0, 3).map(ent => (
                <div key={ent.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 truncate">{ent.candidatoNome}</p>
                    <p className="text-[11px] text-slate-500 truncate">{ent.vagaTitulo} • <strong className="text-slate-700">{ent.clienteNome}</strong></p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{ent.tipo}</span>
                      <span>{ent.data} às {ent.hora}</span>
                    </div>
                  </div>
                  {ent.linkMeet && (
                    <a 
                      href={ent.linkMeet} 
                      target="_blank" 
                      rel="noreferrer"
                      className="ml-3 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Entrar
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimos Candidatos Cadastrados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Últimos Candidatos Cadastrados</span>
            </h3>
            <button 
              onClick={() => onNavigate('banco')} 
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Banco de Talentos →
            </button>
          </div>
          <div className="space-y-3">
            {candidatos.slice(0, 3).map(cand => (
              <div key={cand.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-xs text-slate-900 truncate">{cand.nome}</p>
                    {cand.aiScore && (
                      <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-1.5 py-0.5 rounded">
                        Score {cand.aiScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{cand.cargoDesejado} • {cand.cidade}-{cand.estado}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Disponibilidade: {cand.disponibilidade}</p>
                </div>
                <button 
                  onClick={() => onNavigate('pipeline')}
                  className="ml-3 shrink-0 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-xs hover:shadow cursor-pointer"
                >
                  Ver no Pipeline
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
