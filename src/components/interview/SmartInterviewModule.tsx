import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  FileText, 
  Trophy, 
  History, 
  Settings, 
  Plus, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { SmartInterview, InterviewStats, SuggestedDecision } from '../../types_interview';
import { InterviewService } from '../../services/interviewService';
import InterviewDashboardView from './InterviewDashboardView';
import InterviewAgendaView from './InterviewAgendaView';
import InterviewRoomView from './InterviewRoomView';
import AIReportView from './AIReportView';
import CandidateComparisonView from './CandidateComparisonView';
import InterviewHistoryView from './InterviewHistoryView';
import InterviewSettingsView from './InterviewSettingsView';
import InterviewPdfPrintView from './InterviewPdfPrintView';
import NewInterviewModal from './NewInterviewModal';
import { Job, Candidate } from '../../types';

interface SmartInterviewModuleProps {
  jobs: Job[];
  candidates: Candidate[];
  onBackToSystem?: () => void;
}

export default function SmartInterviewModule({
  jobs,
  candidates,
  onBackToSystem
}: SmartInterviewModuleProps) {

  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'room' | 'report' | 'comparative' | 'history' | 'settings' | 'print'>('dashboard');
  
  const [interviews, setInterviews] = useState<SmartInterview[]>([]);
  const [stats, setStats] = useState<InterviewStats>({
    totalInterviews: 0,
    todayCount: 0,
    scheduledCount: 0,
    inProgressCount: 0,
    finishedCount: 0,
    approvedCount: 0,
    secondInterviewCount: 0,
    talentBankCount: 0,
    rejectedCount: 0,
    avgScore: 0,
    avgDurationMinutes: 0
  });

  const [selectedInterview, setSelectedInterview] = useState<SmartInterview | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await InterviewService.getInterviews();
    const st = await InterviewService.getStats();
    setInterviews(data);
    setStats(st);
    setLoading(false);
  };

  // Handlers
  const handleOpenNewModal = () => {
    setIsNewModalOpen(true);
  };

  const handleCreateInterview = async (data: Omit<SmartInterview, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await InterviewService.createInterview(data);
    await loadData();
    // Navigate to agenda
    setActiveTab('agenda');
  };

  const handleSelectInterview = (interview: SmartInterview) => {
    setSelectedInterview(interview);
    setActiveTab('report');
  };

  const handleEnterRoom = (interview: SmartInterview) => {
    setSelectedInterview(interview);
    setActiveTab('room');
  };

  const handleOpenPdfPrint = (interview: SmartInterview) => {
    setSelectedInterview(interview);
    setActiveTab('print');
  };

  const handleUpdateInterview = async (updates: Partial<SmartInterview>) => {
    if (!selectedInterview) return;
    const updated = await InterviewService.updateInterview(selectedInterview.id, updates);
    if (updated) {
      setSelectedInterview(updated);
      await loadData();
    }
  };

  const handleFinishAndAnalyze = async (customNotes: string) => {
    if (!selectedInterview) return;
    const analyzed = await InterviewService.analyzeInterviewWithAI(selectedInterview.id, customNotes);
    setSelectedInterview(analyzed);
    await loadData();
    setActiveTab('report');
  };

  const handleSaveDecision = async (interviewId: string, decision: SuggestedDecision, notes: string) => {
    const updated = await InterviewService.saveFinalDecision(interviewId, decision, notes);
    if (updated) {
      setSelectedInterview(updated);
      await loadData();
    }
  };

  const handleDeleteInterview = async (id: string) => {
    await InterviewService.deleteInterview(id);
    await loadData();
  };

  if (activeTab === 'print' && selectedInterview) {
    return (
      <InterviewPdfPrintView
        interview={selectedInterview}
        onBack={() => setActiveTab('report')}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Main Module Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          {onBackToSystem && (
            <button
              onClick={onBackToSystem}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer"
              title="Voltar ao Painel Geral RH"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="p-3 bg-[#0b1d33] text-amber-400 rounded-2xl shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                Entrevista Inteligente com IA
              </h1>
              <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                Módulo RH
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gravação, transcrição e avaliação em 16 competências com parecer executivo
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'agenda'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Agenda</span>
          </button>

          {selectedInterview && (
            <button
              onClick={() => setActiveTab('room')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'room'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Sala de Entrevista</span>
            </button>
          )}

          {selectedInterview && (
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'report'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Parecer IA</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('comparative')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'comparative'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Comparativo</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Histórico</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações</span>
          </button>

        </div>

      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <Sparkles className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">Carregando Módulo de Entrevistas...</p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <InterviewDashboardView
              stats={stats}
              interviews={interviews}
              onOpenNewModal={handleOpenNewModal}
              onSelectInterview={handleSelectInterview}
              onEnterRoom={handleEnterRoom}
            />
          )}

          {activeTab === 'agenda' && (
            <InterviewAgendaView
              interviews={interviews}
              onOpenNewModal={handleOpenNewModal}
              onSelectInterview={handleSelectInterview}
              onEnterRoom={handleEnterRoom}
            />
          )}

          {activeTab === 'room' && selectedInterview && (
            <InterviewRoomView
              interview={selectedInterview}
              onUpdateInterview={handleUpdateInterview}
              onFinishAndAnalyze={handleFinishAndAnalyze}
              onBack={() => setActiveTab('agenda')}
            />
          )}

          {activeTab === 'report' && selectedInterview && (
            <AIReportView
              interview={selectedInterview}
              onSaveDecision={handleSaveDecision}
              onBack={() => setActiveTab('agenda')}
              onOpenPdfPrint={handleOpenPdfPrint}
            />
          )}

          {activeTab === 'comparative' && (
            <CandidateComparisonView
              interviews={interviews}
              onSelectInterview={handleSelectInterview}
            />
          )}

          {activeTab === 'history' && (
            <InterviewHistoryView
              interviews={interviews}
              onSelectInterview={handleSelectInterview}
              onOpenPdfPrint={handleOpenPdfPrint}
              onDeleteInterview={handleDeleteInterview}
            />
          )}

          {activeTab === 'settings' && (
            <InterviewSettingsView />
          )}
        </>
      )}

      {/* New Interview Modal */}
      <NewInterviewModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleCreateInterview}
        jobs={jobs}
        candidates={candidates}
      />

    </div>
  );
}
