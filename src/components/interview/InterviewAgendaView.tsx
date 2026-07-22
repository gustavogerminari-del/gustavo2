import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Video, 
  MapPin, 
  Phone, 
  Plus, 
  Play, 
  FileText, 
  User, 
  Filter,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { SmartInterview, InterviewModality, InterviewStatus } from '../../types_interview';

interface InterviewAgendaViewProps {
  interviews: SmartInterview[];
  onOpenNewModal: () => void;
  onSelectInterview: (interview: SmartInterview) => void;
  onEnterRoom: (interview: SmartInterview) => void;
}

export default function InterviewAgendaView({
  interviews,
  onOpenNewModal,
  onSelectInterview,
  onEnterRoom
}: InterviewAgendaViewProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedModality, setSelectedModality] = useState<string>('Todas');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'Todas' | 'Hoje' | 'EstaSemana' | 'Proximas'>('Todas');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredInterviews = interviews.filter(i => {
    const matchSearch = 
      i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.recruiterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedStatus === 'Todos' || i.status === selectedStatus;
    const matchModality = selectedModality === 'Todas' || i.modality === selectedModality;

    let matchDate = true;
    if (selectedDateFilter === 'Hoje') {
      matchDate = i.date === todayStr;
    } else if (selectedDateFilter === 'EstaSemana') {
      matchDate = true; // simplified demo logic
    } else if (selectedDateFilter === 'Proximas') {
      matchDate = i.date >= todayStr;
    }

    return matchSearch && matchStatus && matchModality && matchDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-widest font-mono mb-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Módulo de Entrevistas</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Agenda de Entrevistas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie sessões agendadas, presenciais, online e por telefone</p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Agendar Nova Entrevista</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        
        {/* Search Input */}
        <div className="relative flex items-center md:col-span-2">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por candidato, vaga ou recrutador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Agendada">Agendada</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Aprovada">Aprovada</option>
            <option value="Segunda Entrevista">Segunda Entrevista</option>
            <option value="Banco de Talentos">Banco de Talentos</option>
            <option value="Reprovada">Reprovada</option>
          </select>
        </div>

        {/* Modality Filter */}
        <div>
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="Todas">Todas as Modalidades</option>
            <option value="Online">Online</option>
            <option value="Presencial">Presencial</option>
            <option value="Telefone">Telefone</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="Todas">Todas as Datas</option>
            <option value="Hoje">Entrevistas de Hoje</option>
            <option value="Proximas">Próximas Entrevistas</option>
          </select>
        </div>

      </div>

      {/* List Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base">Nenhuma entrevista encontrada</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tente ajustar seus termos de busca ou filtros de modalidade e status.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedStatus('Todos'); setSelectedModality('Todas'); setSelectedDateFilter('Todas'); }}
              className="mt-4 bg-[#0b1d33] text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-[#0b1d33] text-amber-400 rounded-2xl shrink-0 font-mono text-center min-w-[64px]">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300">{interview.date.split('-')[1]}/{interview.date.split('-')[0]}</p>
                    <p className="text-base font-black text-white leading-none mt-0.5">{interview.time}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-display font-bold text-base text-slate-900">{interview.candidateName}</h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        interview.status === 'Em Andamento' ? 'bg-amber-500 text-slate-950 animate-pulse' :
                        interview.status === 'Aprovada' ? 'bg-emerald-100 text-emerald-800' :
                        interview.status === 'Segunda Entrevista' ? 'bg-purple-100 text-purple-800' :
                        interview.status === 'Banco de Talentos' ? 'bg-cyan-100 text-cyan-800' :
                        interview.status === 'Reprovada' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {interview.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{interview.jobTitle}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
                      <span className="flex items-center space-x-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>Recrutador: <strong>{interview.recruiterName}</strong></span>
                      </span>

                      <span className="flex items-center space-x-1">
                        {interview.modality === 'Online' ? <Video className="h-3.5 w-3.5 text-blue-500" /> :
                         interview.modality === 'Presencial' ? <MapPin className="h-3.5 w-3.5 text-amber-500" /> :
                         <Phone className="h-3.5 w-3.5 text-emerald-500" />}
                        <span>{interview.modality} ({interview.locationOrLink || 'Sede'})</span>
                      </span>

                      {interview.overallScore > 0 && (
                        <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-2 py-0.5 rounded font-mono">
                          Nota IA: {interview.overallScore}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                  {interview.status === 'Agendada' || interview.status === 'Em Andamento' ? (
                    <button
                      onClick={() => onEnterRoom(interview)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Iniciar Sala Virtual</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectInterview(interview)}
                      className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-amber-400" />
                      <span>Ver Relatório e Parecer IA</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
