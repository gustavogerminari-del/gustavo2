import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, Building2, Briefcase, User, FileText, Sparkles } from 'lucide-react';
import { SmartInterview, InterviewModality } from '../../types_interview';
import { Candidate, Job } from '../../types';

interface NewInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interviewData: Omit<SmartInterview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  jobs: Job[];
  candidates: Candidate[];
}

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
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/gestrh-entrevista');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const selectedCand = candidates.find(c => c.id === selectedCandidateId);

    const candName = selectedCand ? selectedCand.name : (candidateNameInput || 'Candidato Convocado');

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
      locationOrLink: locationOrLink || (modality === 'Online' ? 'Link do Google Meet / Zoom' : 'Sala de Reuniões RH'),
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-[#0b1d33] text-white p-6 sm:px-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Agendamento de Entrevista</span>
            </div>
            <h3 className="font-display font-bold text-xl text-white">Nova Entrevista Inteligente</h3>
            <p className="text-slate-300 text-xs">Preencha os dados da sessão com o candidato</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 text-xs font-medium">
          
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Online">Online (Videochamada)</option>
                <option value="Presencial">Presencial (Sede/Filial)</option>
                <option value="Telefone">Telefone / Ligação</option>
              </select>
            </div>
          </div>

          {/* Local ou Link */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {modality === 'Online' ? 'Link do Google Meet / Teams' : modality === 'Presencial' ? 'Endereço / Sala de Reunião' : 'Número de Telefone'}
            </label>
            <input
              type="text"
              required
              placeholder={modality === 'Online' ? 'https://meet.google.com/abc-defg-hij' : 'Sala de Reuniões B'}
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Observações e Roteiro Prévio</label>
            <textarea
              rows={3}
              placeholder="Instruções para a entrevista, tópicos a aprofundar, perguntas sobre pretensão salarial..."
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
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Agendar Entrevista
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
