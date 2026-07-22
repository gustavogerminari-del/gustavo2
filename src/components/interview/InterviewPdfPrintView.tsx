import React from 'react';
import { Printer, ArrowLeft, Building2, Sparkles } from 'lucide-react';
import { SmartInterview } from '../../types_interview';

interface InterviewPdfPrintViewProps {
  interview: SmartInterview;
  onBack: () => void;
}

export default function InterviewPdfPrintView({
  interview,
  onBack
}: InterviewPdfPrintViewProps) {

  const handlePrint = () => {
    window.print();
  };

  const competenciesList = interview.competencies ? Object.values(interview.competencies) : [];

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 animate-in fade-in duration-300 print:p-0 print:bg-white">
      
      {/* Top No-Print Header Bar */}
      <div className="max-w-4xl mx-auto mb-6 bg-[#0b1d33] text-white p-4 rounded-2xl flex items-center justify-between shadow-lg print:hidden">
        <button
          onClick={onBack}
          className="text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Sistema</span>
        </button>

        <button
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir / Salvar como PDF</span>
        </button>
      </div>

      {/* Printable Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 text-slate-900 font-sans leading-relaxed space-y-8">
        
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-black text-xl tracking-tight">
              <Building2 className="h-6 w-6 text-amber-500" />
              <span>{interview.companyName || 'GestRH Soluções'}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Módulo de Entrevista Inteligente com Inteligência Artificial</p>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              Parecer Técnico & Comportamental
            </span>
            <p className="text-xs text-slate-500 font-mono mt-1">Data: {interview.date}</p>
          </div>
        </div>

        {/* Candidate & Job Summary Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Candidato</span>
            <span className="font-bold text-slate-900 text-sm block">{interview.candidateName}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Vaga / Cargo</span>
            <span className="font-bold text-slate-900 text-sm block">{interview.jobTitle}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Recrutador</span>
            <span className="font-bold text-slate-900 text-sm block">{interview.recruiterName}</span>
          </div>

          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Nota Geral IA</span>
            <span className="font-black text-amber-600 text-sm block font-mono">{interview.overallScore} / 10 ({interview.jobCompatibility}% match)</span>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            1. Resumo Executivo e Parecer do Entrevistador
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {interview.finalParecer?.summary || interview.transcriptSummary || 'O candidato apresentou ótima fluência e domínio dos requisitos da vaga.'}
          </p>
        </div>

        {/* Matriz das 16 Competências */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            2. Matriz de Avaliação nas 16 Competências (IA)
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <th className="p-2">Competência</th>
                <th className="p-2">Categoria</th>
                <th className="p-2 text-center">Nota</th>
                <th className="p-2">Comentários & Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {competenciesList.map((c) => (
                <tr key={c.key}>
                  <td className="p-2 font-bold">{c.label}</td>
                  <td className="p-2 text-[10px] text-slate-500 font-mono">{c.category}</td>
                  <td className="p-2 text-center font-bold font-mono">{c.score} / 10</td>
                  <td className="p-2 text-[11px] text-slate-600">{c.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pontos Fortes e Melhoria */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-xs text-emerald-900 uppercase mb-2">Pontos Fortes Mapeados</h4>
            <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
              {(interview.strengths || []).map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <h4 className="font-bold text-xs text-amber-900 uppercase mb-2">Pontos de Acompanhamento</h4>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              {(interview.improvements || []).map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conclusão e Decisão Final */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">Decisão do Processo Seletivo</span>
            <span className="text-lg font-black text-amber-400 block mt-0.5">
              {interview.finalDecision || interview.suggestedDecision || 'Aprovado'}
            </span>
            <p className="text-xs text-slate-300 mt-1">{interview.decisionNotes || 'Parecer homologado pelo comitê de recrutamento.'}</p>
          </div>
        </div>

        {/* Assinatura Box */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs text-slate-500">
          <div>
            <div className="border-t border-slate-400 pt-2 font-bold text-slate-800">{interview.recruiterName}</div>
            <p className="text-[10px]">Recrutador Responsável / RH</p>
          </div>

          <div>
            <div className="border-t border-slate-400 pt-2 font-bold text-slate-800">Gestor da Área / Comitê</div>
            <p className="text-[10px]">Aprovação da Contratação</p>
          </div>
        </div>

      </div>

    </div>
  );
}
