import React, { useState } from 'react';
import { 
  History, 
  Search, 
  FileText, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  Filter,
  Award,
  AlertCircle
} from 'lucide-react';
import { SmartInterview } from '../../types_interview';

interface InterviewHistoryViewProps {
  interviews: SmartInterview[];
  onSelectInterview: (interview: SmartInterview) => void;
  onOpenPdfPrint: (interview: SmartInterview) => void;
  onDeleteInterview: (id: string) => void;
}

export default function InterviewHistoryView({
  interviews,
  onSelectInterview,
  onOpenPdfPrint,
  onDeleteInterview
}: InterviewHistoryViewProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const historyInterviews = interviews.filter(i => {
    const matchSearch = 
      i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.recruiterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'Todos' || i.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest font-mono mb-1">
            <History className="h-4 w-4" />
            <span>Registro Geral</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Histórico de Entrevistas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Consulte gravações, pareceres, transcrições e decisões do comitê de contratação</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar histórico por candidato, vaga ou recrutador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Aprovada">Aprovada</option>
            <option value="Segunda Entrevista">Segunda Entrevista</option>
            <option value="Banco de Talentos">Banco de Talentos</option>
            <option value="Reprovada">Reprovada</option>
            <option value="Agendada">Agendada</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {historyInterviews.length === 0 ? (
          <div className="text-center py-16">
            <History className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum registro encontrado no histórico.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0b1d33] text-white font-display">
                  <th className="p-4">Candidato</th>
                  <th className="p-4">Vaga / Cargo</th>
                  <th className="p-4">Data / Duração</th>
                  <th className="p-4">Nota IA</th>
                  <th className="p-4">Decisão Final</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {historyInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{interview.candidateName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{interview.candidateEmail || interview.recruiterName}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{interview.jobTitle}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{interview.modality}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-mono text-slate-800 font-bold">{interview.date}</p>
                      <p className="text-[10px] text-slate-400">{Math.round((interview.durationSeconds || 1800) / 60)} min</p>
                    </td>

                    <td className="p-4 font-mono font-bold">
                      {interview.overallScore > 0 ? (
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                          {interview.overallScore} / 10
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Pendente</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        interview.finalDecision === 'Aprovado' || interview.status === 'Aprovada' ? 'bg-emerald-100 text-emerald-800' :
                        interview.finalDecision === 'Segunda Entrevista' || interview.status === 'Segunda Entrevista' ? 'bg-purple-100 text-purple-800' :
                        interview.finalDecision === 'Banco de Talentos' || interview.status === 'Banco de Talentos' ? 'bg-cyan-100 text-cyan-800' :
                        interview.finalDecision === 'Reprovado' || interview.status === 'Reprovada' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {interview.finalDecision || interview.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => onSelectInterview(interview)}
                        className="p-2 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 rounded-xl transition-all cursor-pointer inline-flex items-center"
                        title="Ver Parecer IA"
                      >
                        <FileText className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onOpenPdfPrint(interview)}
                        className="p-2 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-700 rounded-xl transition-all cursor-pointer inline-flex items-center"
                        title="Imprimir PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: 'Excluir Registro',
                            message: `Deseja excluir permanentemente o registro da entrevista de ${interview.candidateName}?`,
                            onConfirm: () => {
                              onDeleteInterview(interview.id);
                              setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            }
                          });
                        }}
                        className="p-2 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-400 rounded-xl transition-all cursor-pointer inline-flex items-center"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">{confirmModal.title}</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
