import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Award, 
  Video, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Play
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { SmartInterview, InterviewStats } from '../../types_interview';

interface InterviewDashboardViewProps {
  stats: InterviewStats;
  interviews: SmartInterview[];
  onOpenNewModal: () => void;
  onSelectInterview: (interview: SmartInterview) => void;
  onEnterRoom: (interview: SmartInterview) => void;
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#64748b'];

export default function InterviewDashboardView({
  stats,
  interviews,
  onOpenNewModal,
  onSelectInterview,
  onEnterRoom
}: InterviewDashboardViewProps) {

  // Prepare chart data for status breakdown
  const statusChartData = [
    { name: 'Agendadas', value: stats.scheduledCount, color: '#3b82f6' },
    { name: 'Em Andamento', value: stats.inProgressCount, color: '#f59e0b' },
    { name: 'Aprovadas', value: stats.approvedCount, color: '#10b981' },
    { name: 'Segunda Entrevista', value: stats.secondInterviewCount, color: '#8b5cf6' },
    { name: 'Banco Talentos', value: stats.talentBankCount, color: '#06b6d4' },
    { name: 'Reprovadas', value: stats.rejectedCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Competencies overview averages
  const competencyData = [
    { name: 'Comunicação', score: 8.8 },
    { name: 'Conhecimento Técnico', score: 8.5 },
    { name: 'Perfil Comportamental', score: 8.9 },
    { name: 'Resolução Problemas', score: 8.2 },
    { name: 'Liderança', score: 7.9 },
    { name: 'Trabalho em Equipe', score: 9.1 },
    { name: 'Adaptabilidade', score: 8.7 }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayInterviews = interviews.filter(i => i.date === todayStr);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Action */}
      <div className="bg-gradient-to-r from-[#0b1d33] via-slate-900 to-[#1e3a8a] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recrutamento Inteligente com IA</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Painel Geral de Entrevistas Inteligentes
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Grave, transcreva e analise o perfil técnico e comportamental dos candidatos em tempo real com avaliação em 16 competências e parecer automático.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex flex-wrap gap-3">
          <button
            onClick={onOpenNewModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer shadow-lg flex items-center space-x-2 transform hover:-translate-y-0.5"
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar Nova Entrevista</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Entrevistas Hoje */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Hoje</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.todayCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Sessões agendadas para hoje</p>
        </div>

        {/* Agendadas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Agendadas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.scheduledCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Aguardando realização</p>
        </div>

        {/* Em Andamento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Em Andamento</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl animate-pulse">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">{stats.inProgressCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Sala ativa agora</p>
        </div>

        {/* Aprovadas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Aprovadas</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">{stats.approvedCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Aprovados pela IA e RH</p>
        </div>

        {/* 2ª Entrevista / Banco */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Segunda Etapa</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 font-mono">{stats.secondInterviewCount}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Encaminhados p/ liderança</p>
        </div>

      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-xs font-medium">Banco de Talentos</p>
            <p className="text-xl font-bold font-mono mt-1">{stats.talentBankCount} candidatos</p>
          </div>
          <Users className="h-8 w-8 text-cyan-400 opacity-80" />
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-xs font-medium">Tempo Médio de Duração</p>
            <p className="text-xl font-bold font-mono mt-1">{stats.avgDurationMinutes} min / sessão</p>
          </div>
          <Clock className="h-8 w-8 text-amber-400 opacity-80" />
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-xs font-medium">Nota Média Geral da IA</p>
            <p className="text-xl font-bold font-mono mt-1 text-emerald-400">{stats.avgScore} / 10</p>
          </div>
          <Award className="h-8 w-8 text-emerald-400 opacity-80" />
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-xs font-medium">Reprovadas / Incompatíveis</p>
            <p className="text-xl font-bold font-mono mt-1 text-rose-400">{stats.rejectedCount} candidatos</p>
          </div>
          <XCircle className="h-8 w-8 text-rose-400 opacity-80" />
        </div>
      </div>

      {/* Main Charts & Today Agenda Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Média de Notas por Competência */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  <span>Médias Gerais por Competência (IA)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pontuação consolidada dos candidatos nas 16 áreas de avaliação</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={130} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1d33', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} 
                  />
                  <Bar dataKey="score" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-1/2">
              <h3 className="font-display font-bold text-base text-slate-900 mb-1">
                Distribuição dos Candidatos
              </h3>
              <p className="text-xs text-slate-500 mb-4">Status de todas as entrevistas realizadas e agendadas</p>
              
              <div className="space-y-2">
                {statusChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-52 w-full sm:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0b1d33', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Today's Scheduled Interviews */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Entrevistas de Hoje ({todayInterviews.length})</span>
              </h3>
            </div>

            {todayInterviews.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Nenhuma entrevista agendada para hoje.</p>
                <button
                  onClick={onOpenNewModal}
                  className="mt-3 text-xs font-bold text-amber-600 hover:underline"
                >
                  + Agendar entrevista
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-4 bg-slate-50 hover:bg-amber-50/30 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#0b1d33] text-white">
                          {interview.time}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">
                          {interview.candidateName}
                        </h4>
                        <p className="text-xs text-slate-500">{interview.jobTitle}</p>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        interview.status === 'Em Andamento' ? 'bg-amber-500 text-slate-950 animate-pulse' :
                        interview.status === 'Finalizada' ? 'bg-slate-200 text-slate-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {interview.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-400 text-[11px]">{interview.modality}</span>
                      
                      {interview.status === 'Em Andamento' || interview.status === 'Agendada' ? (
                        <button
                          onClick={() => onEnterRoom(interview)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Entrar na Sala</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectInterview(interview)}
                          className="text-slate-700 hover:text-amber-600 font-bold text-xs flex items-center space-x-1"
                        >
                          <span>Ver Análise IA</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-6 rounded-3xl shadow-lg font-sans">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-5 w-5 font-bold" />
              <h4 className="font-display font-black text-sm uppercase tracking-wider">Como funciona a IA?</h4>
            </div>
            <p className="text-xs font-medium leading-relaxed opacity-90">
              Ao encerrar a entrevista gravada na Sala Virtual, a IA gera a transcrição por tópicos e pontua o candidato de 0 a 10 nas 16 competências técnicas e comportamentais, fornecendo parecer e sugestão de decisão.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
