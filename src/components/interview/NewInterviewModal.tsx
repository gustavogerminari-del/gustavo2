import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Building2, 
  Briefcase, 
  User, 
  FileText, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Settings,
  Link,
  ShieldCheck,
  Send
} from 'lucide-react';
import { SmartInterview, InterviewModality } from '../../types_interview';
import { Candidate, Job } from '../../types';
import { VideoProvider, VideoIntegrationService } from '../../services/videoIntegrationService';
import VideoPlatformConnectModal from './VideoPlatformConnectModal';

interface NewInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interviewData: Omit<SmartInterview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  jobs: Job[];
  candidates: Candidate[];
}

const ALL_PLATFORMS: Array<{ id: VideoProvider; name: string; description: string; tag: string }> = [
  { id: 'GestRH Meeting', name: 'GestRH Meeting (LiveKit)', description: 'Provedor padrão seguro e sem necessidade de login ou chave API', tag: 'Padrão Sistema' },
  { id: 'Google Meet', name: 'Google Meet', description: 'Reuniões instantâneas sincronizadas com Google Calendar', tag: 'Google Workspace' },
  { id: 'Microsoft Teams', name: 'Microsoft Teams', description: 'Integração direta com o ecossistema Microsoft 365 Corporativo', tag: 'Microsoft 365' },
  { id: 'Zoom', name: 'Zoom Meetings', description: 'Salas virtuais de alta qualidade com Account ID / JWT', tag: 'Zoom Cloud' },
  { id: 'Daily.co', name: 'Daily.co', description: 'Videochamadas WebRTC rápidas via API Key do Daily', tag: 'WebRTC API' },
  { id: 'Agora.io', name: 'Agora.io', description: 'Streaming de áudio e vídeo de baixa latência via App ID', tag: 'Agora RTC' },
];

export default function NewInterviewModal({
  isOpen,
  onClose,
  onSave,
  jobs,
  candidates
}: NewInterviewModalProps) {

  const [companyName, setCompanyName] = useState('GestRH Soluções');
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || '');
  const [candidateNameInput, setCandidateNameInput] = useState('');
  const [recruiterName, setRecruiterName] = useState('Diana Santos (RH)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [modality, setModality] = useState<InterviewModality>('Online');
  
  // Platform & Video Integration State
  const [selectedPlatform, setSelectedPlatform] = useState<VideoProvider>('GestRH Meeting');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');

  // Unconnected modal trigger
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [pendingPlatform, setPendingPlatform] = useState<VideoProvider>('Google Meet');

  // Sync initial link when modal opens or platform changes
  useEffect(() => {
    if (modality === 'Online') {
      const isConn = VideoIntegrationService.isConnected(selectedPlatform);
      if (isConn) {
        const generated = VideoIntegrationService.generateMeetingLink(selectedPlatform);
        setLocationOrLink(generated);
      }
    }
  }, [selectedPlatform, modality]);

  if (!isOpen) return null;

  const handleSelectPlatform = (platform: VideoProvider) => {
    setSelectedPlatform(platform);

    if (platform === 'GestRH Meeting') {
      const link = VideoIntegrationService.generateMeetingLink('GestRH Meeting');
      setLocationOrLink(link);
      return;
    }

    const isConn = VideoIntegrationService.isConnected(platform);
    if (isConn) {
      const link = VideoIntegrationService.generateMeetingLink(platform);
      setLocationOrLink(link);
    } else {
      // Platform not connected -> trigger modal
      setPendingPlatform(platform);
      setConnectModalOpen(true);
    }
  };

  const handleConnectionSuccess = (provider: VideoProvider, generatedLink: string) => {
    setSelectedPlatform(provider);
    setLocationOrLink(generatedLink);
    setConnectModalOpen(false);
  };

  const handleFallbackToGestRH = () => {
    setSelectedPlatform('GestRH Meeting');
    const link = VideoIntegrationService.generateMeetingLink('GestRH Meeting');
    setLocationOrLink(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const selectedCand = candidates.find(c => c.id === selectedCandidateId);
    const candName = selectedCand ? selectedCand.name : (candidateNameInput || 'Candidato Convocado');

    const isConn = VideoIntegrationService.isConnected(selectedPlatform);

    onSave({
      companyName: companyName || 'GestRH Soluções',
      jobId: selectedJobId || 'job-general',
      jobTitle: selectedJob ? selectedJob.title : 'Vaga em Aberto',
      candidateId: selectedCandidateId || 'cand-new',
      candidateName: candName,
      candidateEmail: selectedCand?.email || '',
      candidatePhone: selectedCand?.phone || '',
      recruiterId: 'recruiter-1',
      recruiterName: recruiterName || 'Recrutador Responsável',
      date,
      time,
      modality,
      videoPlatform: modality === 'Online' ? selectedPlatform : undefined,
      videoPlatformConnected: isConn,
      locationOrLink: locationOrLink || (modality === 'Online' ? VideoIntegrationService.generateMeetingLink(selectedPlatform) : 'Sala de Reuniões RH'),
      notes,
      status: 'Agendada',
      durationSeconds: 0,
      hasAudioRecording: true,
      hasVideoRecording: modality === 'Online',
      uploadedFiles: [],
      overallScore: 0,
      jobCompatibility: 85,
      strengths: [],
      improvements: []
    });

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
          
          {/* Header */}
          <div className="bg-[#0b1d33] text-white p-6 sm:px-8 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                <Sparkles className="h-3 w-3" />
                <span>Agendamento de Entrevista</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">Nova Entrevista Inteligente</h3>
              <p className="text-slate-300 text-xs">A reunião será criada e sincronizada na plataforma escolhida</p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-xs font-medium">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Empresa */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Empresa / Unidade</label>
                <div className="relative flex items-center">
                  <Building2 className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Vaga */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Vaga de Emprego</label>
                <div className="relative flex items-center">
                  <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Selecione a Vaga...</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Candidato */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Candidato</label>
                <div className="relative flex items-center">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Selecione o Candidato...</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.area})</option>
                    ))}
                    <option value="custom">Outro (Digitar Nome abaixo)...</option>
                  </select>
                </div>
              </div>

              {/* Recrutador */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Recrutador Responsável</label>
                <input
                  type="text"
                  required
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            {selectedCandidateId === 'custom' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome Completo do Candidato</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={candidateNameInput}
                  onChange={(e) => setCandidateNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {/* Data */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Data da Entrevista</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Horário</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Modalidade */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Modalidade</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as InterviewModality)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                >
                  <option value="Online">Online (Videochamada)</option>
                  <option value="Presencial">Presencial (Sede/Filial)</option>
                  <option value="Telefone">Telefone / Ligação</option>
                </select>
              </div>
            </div>

            {/* SEÇÃO: PLATAFORMA DA ENTREVISTA */}
            {modality === 'Online' && (
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                      <Video className="h-4 w-4 text-amber-500" />
                      <span>Plataforma da Entrevista</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Escolha o provedor de videoconferência para criar a reunião automaticamente
                    </p>
                  </div>

                  {/* Selected platform status badge */}
                  <div className="shrink-0">
                    {VideoIntegrationService.isConnected(selectedPlatform) ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Conectado e Ativo</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingPlatform(selectedPlatform);
                          setConnectModalOpen(true);
                        }}
                        className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300 flex items-center space-x-1 hover:bg-amber-200 transition-all cursor-pointer"
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Requer Configuração</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Platforms Grid Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {ALL_PLATFORMS.map(p => {
                    const isConnected = VideoIntegrationService.isConnected(p.id);
                    const isSelected = selectedPlatform === p.id;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPlatform(p.id)}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`font-extrabold text-xs truncate ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                              {p.name}
                            </span>
                            {isConnected ? (
                              <span className={`h-2 w-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`} title="Conectado" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Pendente de conexão" />
                            )}
                          </div>
                          <p className={`text-[10px] line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {p.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-100/20 flex items-center justify-between text-[9px] font-bold">
                          <span className={`${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                            {p.tag}
                          </span>
                          <span className={isConnected ? (isSelected ? 'text-emerald-400 font-extrabold' : 'text-emerald-600') : (isSelected ? 'text-amber-400' : 'text-amber-600')}>
                            {isConnected ? '🟢 Conectado' : '🟡 Configurar'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Link da Reunião / Endereço */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                <span>
                  {modality === 'Online' ? `Link da Reunião (${selectedPlatform})` : modality === 'Presencial' ? 'Endereço / Sala de Reunião' : 'Número de Telefone'}
                </span>
                {modality === 'Online' && (
                  <button
                    type="button"
                    onClick={() => {
                      const link = VideoIntegrationService.generateMeetingLink(selectedPlatform);
                      setLocationOrLink(link);
                    }}
                    className="text-[10px] text-amber-600 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Gerar Novo Link</span>
                  </button>
                )}
              </label>

              <div className="relative flex items-center">
                <Link className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {modality === 'Online' && (
                <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1 mt-2">
                  <div className="font-extrabold flex items-center space-x-1.5 text-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Dica para Envio de Link ao Candidato</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Domínios internos fictícios (como <em>meet.gestrh.com.br</em>) não abrem no navegador do candidato fora do sistema. Para entrevistas com envio por WhatsApp ou e-mail, selecione <strong>Google Meet</strong>, <strong>Microsoft Teams</strong> ou <strong>Zoom</strong> acima, ou cole uma URL válida de reunião.
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Observações e Roteiro Prévio</label>
              <textarea
                rows={2}
                placeholder="Instruções para a entrevista, tópicos a aprofundar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Agendar e Enviar Reunião</span>
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Video Platform Credentials Modal */}
      <VideoPlatformConnectModal
        isOpen={connectModalOpen}
        platform={pendingPlatform}
        onClose={() => setConnectModalOpen(false)}
        onSuccess={handleConnectionSuccess}
        onFallbackToGestRH={handleFallbackToGestRH}
      />
    </>
  );
}
