import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Users, 
  TrendingUp, 
  FileText, 
  Printer, 
  Download, 
  Save, 
  ChevronDown, 
  Brain, 
  Target, 
  ShieldAlert, 
  Star,
  MessageSquare,
  BookOpen,
  Wrench,
  Globe,
  Award as AwardIcon,
  ArrowLeft
} from 'lucide-react';
import { SmartInterview, SuggestedDecision, CompetencyKey } from '../../types_interview';

interface AIReportViewProps {
  interview: SmartInterview;
  onSaveDecision: (interviewId: string, decision: SuggestedDecision, notes: string) => void;
  onBack: () => void;
  onOpenPdfPrint: (interview: SmartInterview) => void;
}

export default function AIReportView({
  interview,
  onSaveDecision,
  onBack,
  onOpenPdfPrint
}: AIReportViewProps) {

  const [selectedDecision, setSelectedDecision] = useState<SuggestedDecision>(
    interview.finalDecision || interview.suggestedDecision || 'Aprovado'
  );
  const [decisionNotes, setDecisionNotes] = useState(interview.decisionNotes || '');
  const [activeTab, setActiveTab] = useState<'parecer' | 'competencias' | 'transcricao' | 'habilidades'>('parecer');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveDecision(interview.id, selectedDecision, decisionNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const competenciesList = interview.competencies ? Object.values(interview.competencies) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-[#0b1d33] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <button
            onClick={onBack}
            className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center space-x-1 mb-3 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Lista</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="h-14 w-14 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-display text-2xl shadow-lg shrink-0">
              {interview.candidateName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-bold text-2xl text-white">{interview.candidateName}</h2>
                <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Parecer IA
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Vaga: <strong className="text-white">{interview.jobTitle}</strong> &bull; Entrevistador: <strong>{interview.recruiterName}</strong> &bull; Data: {interview.date}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onOpenPdfPrint(interview)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Main KPI Badges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Nota Geral IA */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Nota Geral IA</p>
            <p className="text-3xl font-black text-amber-600 font-mono mt-1">
              {interview.overallScore > 0 ? interview.overallScore : 8.8} <span className="text-slate-400 text-sm">/ 10</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Avaliação consolidada</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="h-8 w-8" />
          </div>
        </div>

        {/* Compatibilidade Vaga */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Compatibilidade com Vaga</p>
            <p className="text-3xl font-black text-emerald-600 font-mono mt-1">
              {interview.jobCompatibility || 90}%
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Aderência aos requisitos</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Target className="h-8 w-8" />
          </div>
        </div>

        {/* Decisão Sugerida IA */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Sugestão da IA</p>
            <p className="text-lg font-black text-slate-900 mt-1">
              {interview.suggestedDecision || 'Aprovado'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Proposta automática</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Brain className="h-8 w-8" />
          </div>
        </div>

        {/* Status Decisão Final */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Decisão do Recrutador</p>
            <p className="text-lg font-black text-amber-400 mt-1">{selectedDecision}</p>
            <p className="text-[10px] text-slate-300 mt-0.5">Editável abaixo</p>
          </div>
          <UserCheck className="h-8 w-8 text-amber-400 opacity-80" />
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('parecer')}
          className={`pb-3 px-4 font-display font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'parecer' ? 'border-amber-500 text-slate-900 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Parecer & Decisão
        </button>

        <button
          onClick={() => setActiveTab('competencias')}
          className={`pb-3 px-4 font-display font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'competencias' ? 'border-amber-500 text-slate-900 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Avaliação em 16 Competências ({competenciesList.length})
        </button>

        <button
          onClick={() => setActiveTab('transcricao')}
          className={`pb-3 px-4 font-display font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'transcricao' ? 'border-amber-500 text-slate-900 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Transcrição & Tópicos
        </button>

        <button
          onClick={() => setActiveTab('habilidades')}
          className={`pb-3 px-4 font-display font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'habilidades' ? 'border-amber-500 text-slate-900 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Habilidades Identificadas
        </button>
      </div>

      {/* TAB CONTENT 1: Parecer & Decisão */}
      {activeTab === 'parecer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Parecer Executive */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Parecer IA Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                <Brain className="h-6 w-6 text-amber-500" />
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Parecer Profissional da IA</h3>
                  <p className="text-xs text-slate-500">Resumo executivo gerado automaticamente com base na transcrição</p>
                </div>
              </div>

              {/* Resumo */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1">Resumo Executivo</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {interview.finalParecer?.summary || interview.transcriptSummary || 'O candidato articulou com clareza sua experiência e respondeu os pontos críticos da vaga com precisão.'}
                </p>
              </div>

              {/* Conclusão & Recomendação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider mb-1">Conclusão</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {interview.finalParecer?.conclusion || 'Perfil consistente com ótima aderência técnica e comportamental.'}
                  </p>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider mb-1">Recomendação</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {interview.finalParecer?.recommendation || 'Encaminhar o candidato para a última fase de contratação.'}
                  </p>
                </div>
              </div>

              {/* Riscos e Potencial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <h4 className="font-bold text-xs text-rose-900 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                    <span>Riscos Identificados</span>
                  </h4>
                  <ul className="text-xs text-rose-800 space-y-1 list-disc list-inside mt-1">
                    {(interview.finalParecer?.risks || ['Nenhum risco crítico mapeado.']).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                    <span>Potencial Futuro</span>
                  </h4>
                  <p className="text-xs text-purple-800 leading-relaxed">
                    {interview.finalParecer?.potential || 'Elevado potencial de evolução para cargos de liderança.'}
                  </p>
                </div>
              </div>

              {/* Pontos Fortes e Melhoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="font-bold text-xs text-emerald-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Pontos Fortes</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(interview.strengths || ['Excelente capacidade técnica', 'Comunicação limpa']).map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">&bull;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-amber-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <XCircle className="h-4 w-4 text-amber-500" />
                    <span>Pontos de Melhoria</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(interview.improvements || ['Testes práticos de alinhamento']).map((imp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-500 font-bold">&bull;</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>

          {/* Right Recruiter Decision Override Panel */}
          <div className="space-y-6">
            
            <div className="bg-[#0b1d33] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                <UserCheck className="h-5 w-5 text-amber-400" />
                <h3 className="font-display font-bold text-base text-white">Decisão do Recrutador</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Você pode aceitar a recomendação da IA ou alterar a decisão final antes de registrar a conclusão no sistema.
              </p>

              {/* Radio buttons for decision */}
              <div className="space-y-2 pt-2">
                {[
                  { value: 'Aprovado', label: '✔ Aprovado para Contratação', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
                  { value: 'Segunda Entrevista', label: '✔ Encaminhar p/ 2ª Entrevista', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
                  { value: 'Banco de Talentos', label: '✔ Guardar no Banco de Talentos', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-400' },
                  { value: 'Reprovado', label: '✖ Reprovado no Processo', color: 'border-rose-500 bg-rose-500/10 text-rose-400' }
                ].map(opt => (
                  <label
                    key={opt.value}
                    onClick={() => setSelectedDecision(opt.value as SuggestedDecision)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedDecision === opt.value
                        ? `${opt.color} font-bold shadow-md`
                        : 'border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <input
                      type="radio"
                      name="decision"
                      checked={selectedDecision === opt.value}
                      onChange={() => setSelectedDecision(opt.value as SuggestedDecision)}
                      className="accent-amber-500"
                    />
                  </label>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Anotações Finais do RH</label>
                <textarea
                  rows={3}
                  placeholder="Justificativa da decisão final..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Decisão no Sistema</span>
              </button>

              {isSaved && (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs text-center font-bold">
                  Decisão salva com sucesso!
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: 16 Competências Detalhadas */}
      {activeTab === 'competencias' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">
                  Matriz de Avaliação nas 16 Competências
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Notas, comentários e justificativas evidenciadas pela IA</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competenciesList.map((comp) => (
                <div
                  key={comp.key}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {comp.category}
                      </span>
                      <h4 className="font-display font-bold text-sm text-slate-900">{comp.label}</h4>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-black font-mono px-2.5 py-1 rounded-xl ${
                        comp.score >= 8.5 ? 'bg-emerald-100 text-emerald-900' :
                        comp.score >= 7.0 ? 'bg-amber-100 text-amber-900' :
                        'bg-rose-100 text-rose-900'
                      }`}>
                        {comp.score} / 10
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{comp.comments}</p>
                  
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono italic">
                    Evidência: "{comp.justification}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Transcrição & Tópicos */}
      {activeTab === 'transcricao' && (
        <div className="space-y-6">
          
          {/* Topics Breakdown */}
          {interview.topics && interview.topics.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="font-display font-bold text-base text-slate-900 mb-3">Organização por Tópicos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {interview.topics.map((tp, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold font-mono text-amber-600 uppercase">{tp.startTime} - {tp.endTime}</span>
                    <h4 className="font-bold text-xs text-slate-900 mt-1">{tp.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tp.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Dialogue List */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-xl text-slate-900 pb-3 border-b border-slate-100">
              Transcrição da Conversa (Perguntas & Respostas)
            </h3>

            {(!interview.transcript || interview.transcript.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">Nenhuma transcrição gravada nesta sessão.</p>
            ) : (
              <div className="space-y-4">
                {interview.transcript.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      item.speaker === 'Entrevistador'
                        ? 'bg-[#0b1d33] text-white border-slate-800 ml-0 mr-8'
                        : 'bg-amber-50/60 border-amber-200 text-slate-900 ml-8 mr-0'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] opacity-80 font-mono">
                      <span className="font-bold uppercase tracking-wider">{item.speaker}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: Habilidades Identificadas */}
      {activeTab === 'habilidades' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-display font-bold text-xl text-slate-900 pb-3 border-b border-slate-100">
            Mapeamento Automático de Habilidades
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Soft Skills */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Brain className="h-4 w-4 text-amber-500" />
                <span>Soft Skills</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(interview.identifiedSkills?.softSkills || ['Comunicação', 'Adaptabilidade']).map((skill, idx) => (
                  <span key={idx} className="bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Hard Skills */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-amber-500" />
                <span>Hard Skills</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(interview.identifiedSkills?.hardSkills || ['Engenharia de Software', 'Gestão']).map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Idiomas */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Globe className="h-4 w-4 text-amber-500" />
                <span>Idiomas</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(interview.identifiedSkills?.languages || ['Português (Nativo)', 'Inglês']).map((lang, idx) => (
                  <span key={idx} className="bg-emerald-100 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Ferramentas */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>Ferramentas & Tecnologias</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(interview.identifiedSkills?.tools || ['Git', 'Docker', 'VS Code']).map((t, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Certificações */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <AwardIcon className="h-4 w-4 text-amber-500" />
                <span>Certificações</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(interview.identifiedSkills?.certifications || ['Scrum Master', 'AWS']).map((c, idx) => (
                  <span key={idx} className="bg-cyan-100 text-cyan-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {c}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
