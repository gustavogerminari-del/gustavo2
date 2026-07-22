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
  Copy,
  Send,
  CalendarCheck,
  XCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Mail,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { SmartInterview, InterviewModality, InterviewStatus } from '../../types_interview';
import { VideoIntegrationService } from '../../services/videoIntegrationService';

interface InterviewAgendaViewProps {
  interviews: SmartInterview[];
  onOpenNewModal: () => void;
  onSelectInterview: (interview: SmartInterview) => void;
  onEnterRoom: (interview: SmartInterview) => void;
  onUpdateInterview?: (id: string, updates: Partial<SmartInterview>) => void;
  onDeleteInterview?: (id: string) => void;
}

export default function InterviewAgendaView({
  interviews,
  onOpenNewModal,
  onSelectInterview,
  onEnterRoom,
  onUpdateInterview,
  onDeleteInterview
}: InterviewAgendaViewProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedModality, setSelectedModality] = useState<string>('Todas');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'Todas' | 'Hoje' | 'EstaSemana' | 'Proximas'>('Todas');

  // Action Feedbacks & Reschedule modal
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [rescheduleModalInterview, setRescheduleModalInterview] = useState<SmartInterview | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyLink = (link: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    triggerToast('Link da reunião copiado com sucesso para a área de transferência!');
  };

  const handleSendInvite = (interview: SmartInterview) => {
    let linkToSend = interview.locationOrLink;
    
    // Auto replace dead placeholder domain meet.gestrh.com.br with functional Google Meet link
    if (linkToSend.includes('meet.gestrh.com.br')) {
      linkToSend = VideoIntegrationService.generateMeetingLink('Google Meet');
      if (onUpdateInterview) {
        onUpdateInterview(interview.id, {
          locationOrLink: linkToSend,
          videoPlatform: 'Google Meet'
        });
      }
    }

    const text = `Olá ${interview.candidateName}, sua entrevista para a vaga de ${interview.jobTitle} está agendada para ${interview.date} às ${interview.time}. Link da reunião: ${linkToSend}`;
    
    if (interview.candidatePhone) {
      const cleanPhone = interview.candidatePhone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (interview.candidateEmail) {
      window.open(`mailto:${interview.candidateEmail}?subject=${encodeURIComponent(`Convite de Entrevista - ${interview.jobTitle}`)}&body=${encodeURIComponent(text)}`, '_blank');
    }
    triggerToast('Convite enviado! O link foi atualizado para uma sala válida do Google Meet.');
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalInterview || !onUpdateInterview) return;

    onUpdateInterview(rescheduleModalInterview.id, {
      date: newDate,
      time: newTime,
      status: 'Agendada'
    });

    triggerToast(`Entrevista com ${rescheduleModalInterview.candidateName} reagendada para ${newDate} às ${newTime}!`);
    setRescheduleModalInterview(null);
  };

  const handleCancelInterview = (interview: SmartInterview) => {
    if (!onUpdateInterview) return;
    if (confirm(`Tem certeza que deseja cancelar o agendamento de ${interview.candidateName}?`)) {
      onUpdateInterview(interview.id, {
        status: 'Cancelada',
        notes: `${interview.notes || ''}\n[Cancelada pelo recrutador em ${new Date().toLocaleDateString('pt-BR')}]`
      });
      triggerToast(`Agendamento com ${interview.candidateName} cancelado.`);
    }
  };

  const handleDeleteInterview = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente o agendamento de ${name}?`)) {
      if (onDeleteInterview) {
        onDeleteInterview(id);
        triggerToast('Agendamento excluído com sucesso.');
      }
    }
  };

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
    } else if (selectedDateFilter === 'Proximas') {
      matchDate = i.date >= todayStr;
    }

    return matchSearch && matchStatus && matchModality && matchDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Floating Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-amber-400 border border-amber-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-extrabold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-widest font-mono mb-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Módulo de Entrevistas</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Agenda e Gerenciamento de Reuniões</h2>
          <p className="text-xs text-slate-500 mt-0.5">GestRH Meeting (LiveKit), Google Meet, Teams, Zoom, Daily e Agora.io</p>
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
            <option value="Cancelada">Cancelada</option>
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
            {filteredInterviews.map((interview) => {
              const platform = interview.videoPlatform || 'GestRH Meeting';
              const isConn = VideoIntegrationService.isConnected(platform);

              return (
                <div
                  key={interview.id}
                  className="p-5 hover:bg-slate-50/80 transition-all space-y-4"
                >
                  {/* Top Line Info */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Left details */}
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-[#0b1d33] text-amber-400 rounded-2xl shrink-0 font-mono text-center min-w-[70px] shadow-xs">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-300">{interview.date.split('-')[2]}/{interview.date.split('-')[1]}</p>
                        <p className="text-base font-black text-white leading-none mt-0.5">{interview.time}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-extrabold text-base text-slate-900">{interview.candidateName}</h4>
                          
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            interview.status === 'Em Andamento' ? 'bg-amber-500 text-slate-950 animate-pulse' :
                            interview.status === 'Aprovada' ? 'bg-emerald-100 text-emerald-800' :
                            interview.status === 'Segunda Entrevista' ? 'bg-purple-100 text-purple-800' :
                            interview.status === 'Banco de Talentos' ? 'bg-cyan-100 text-cyan-800' :
                            interview.status === 'Cancelada' ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                            interview.status === 'Reprovada' ? 'bg-rose-100 text-rose-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {interview.status}
                          </span>

                          {/* Video Platform Badge */}
                          {interview.modality === 'Online' && (
                            <span className="bg-slate-900 text-amber-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center space-x-1">
                              <Video className="h-3 w-3 text-amber-400" />
                              <span>{platform}</span>
                            </span>
                          )}

                          {/* Connection Status Badge */}
                          {interview.modality === 'Online' && (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                              isConn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span>{isConn ? '🟢 Conectado' : '🟡 Configurar'}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-700">{interview.jobTitle}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-0.5">
                          <span className="flex items-center space-x-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>Recrutador: <strong>{interview.recruiterName}</strong></span>
                          </span>

                          <span className="flex items-center space-x-1">
                            {interview.modality === 'Online' ? <Video className="h-3.5 w-3.5 text-blue-500" /> :
                             interview.modality === 'Presencial' ? <MapPin className="h-3.5 w-3.5 text-amber-500" /> :
                             <Phone className="h-3.5 w-3.5 text-emerald-500" />}
                            <span>{interview.modality}</span>
                          </span>

                          {interview.overallScore > 0 && (
                            <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-2 py-0.5 rounded font-mono">
                              Nota IA: {interview.overallScore}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Primary Actions */}
                    <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                      {interview.status === 'Agendada' || interview.status === 'Em Andamento' ? (
                        <button
                          onClick={() => onEnterRoom(interview)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Entrar na Entrevista</span>
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

                  {/* Meeting Link Bar & Card Toolbar Actions */}
                  <div className="space-y-2">
                    {interview.locationOrLink.includes('meet.gestrh.com.br') && (
                      <div className="bg-amber-50/90 border border-amber-300 p-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>Atenção:</strong> Este link contém o domínio fictício <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">meet.gestrh.com.br</code> que não abre na internet pública do candidato.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newMeetLink = VideoIntegrationService.generateMeetingLink('Google Meet');
                            if (onUpdateInterview) {
                              onUpdateInterview(interview.id, {
                                locationOrLink: newMeetLink,
                                videoPlatform: 'Google Meet'
                              });
                            }
                            triggerToast('Link atualizado para o Google Meet!');
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer shadow-xs flex items-center space-x-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Converter para Google Meet</span>
                        </button>
                      </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                      
                      {/* Link display */}
                      <div className="flex items-center space-x-2 min-w-0 w-full md:w-auto">
                        <span className="font-bold text-slate-500 shrink-0">Link da Reunião:</span>
                        <a
                          href={interview.locationOrLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-blue-600 hover:underline truncate bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                        >
                          {interview.locationOrLink}
                        </a>
                      </div>

                    {/* Toolbar buttons: Copiar Link, Enviar Convite, Reagendar, Cancelar */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleCopyLink(interview.locationOrLink)}
                        className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                        title="Copiar link para área de transferência"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Copiar Link</span>
                      </button>

                      <button
                        onClick={() => handleSendInvite(interview)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                        title="Enviar convite via WhatsApp / E-mail"
                      >
                        <Send className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Enviar Convite</span>
                      </button>

                      <button
                        onClick={() => {
                          setRescheduleModalInterview(interview);
                          setNewDate(interview.date);
                          setNewTime(interview.time);
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-xl border border-purple-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                        title="Reagendar data e horário"
                      >
                        <CalendarCheck className="h-3.5 w-3.5 text-purple-600" />
                        <span>Reagendar</span>
                      </button>

                      {interview.status !== 'Cancelada' && (
                        <button
                          onClick={() => handleCancelInterview(interview)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                          title="Cancelar agendamento de entrevista"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteInterview(interview.id, interview.candidateName)}
                        className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 transition-all flex items-center space-x-1 cursor-pointer"
                        title="Excluir agendamento permanentemente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Reagendar Entrevista
              </h3>
              <button
                onClick={() => setRescheduleModalInterview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Reagendando sessão de <strong>{rescheduleModalInterview.candidateName}</strong> para a vaga de <strong>{rescheduleModalInterview.jobTitle}</strong>.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nova Data</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Novo Horário</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalInterview(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Salvar Reagendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
