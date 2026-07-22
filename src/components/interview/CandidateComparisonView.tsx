import React, { useState } from 'react';
import { Users, Award, Trophy, CheckCircle, ArrowUpRight, BarChart3, Target, Sparkles } from 'lucide-react';
import { SmartInterview } from '../../types_interview';

interface CandidateComparisonViewProps {
  interviews: SmartInterview[];
  onSelectInterview: (interview: SmartInterview) => void;
}

export default function CandidateComparisonView({
  interviews,
  onSelectInterview
}: CandidateComparisonViewProps) {

  const completedInterviews = interviews.filter(i => i.overallScore > 0);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    completedInterviews.slice(0, 3).map(i => i.id)
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // Keep at least 1
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedInterviews = completedInterviews.filter(i => selectedIds.includes(i.id));

  // Sort selected by overallScore descending for automatic ranking
  const rankedInterviews = [...selectedInterviews].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest font-mono mb-1">
            <Trophy className="h-4 w-4" />
            <span>Matriz Comparativa</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Comparativo Lado a Lado & Ranking</h2>
          <p className="text-xs text-slate-500 mt-0.5">Selecione candidatos avaliados para comparar notas de IA e competências em tempo real</p>
        </div>
      </div>

      {/* Candidate Selector Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          Selecione Candidatos Avaliados ({selectedIds.length} selecionados):
        </p>

        <div className="flex flex-wrap gap-2">
          {completedInterviews.map((interview) => {
            const isSelected = selectedIds.includes(interview.id);
            return (
              <button
                key={interview.id}
                onClick={() => toggleSelect(interview.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{interview.candidateName}</span>
                <span className="text-[10px] opacity-80">({interview.jobTitle})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automatic Ranking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rankedInterviews.map((interview, index) => (
          <div
            key={interview.id}
            className={`bg-white p-6 rounded-3xl border shadow-xs relative overflow-hidden flex flex-col justify-between ${
              index === 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
            }`}
          >
            {index === 0 && (
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-2xl uppercase tracking-widest flex items-center space-x-1">
                <Trophy className="h-3.5 w-3.5" />
                <span>1º Lugar - Top Match</span>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`h-12 w-12 rounded-2xl font-black flex items-center justify-center font-display text-lg ${
                  index === 0 ? 'bg-amber-500 text-slate-950' : 'bg-[#0b1d33] text-white'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">{interview.candidateName}</h3>
                  <p className="text-xs text-slate-500">{interview.jobTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nota Geral IA</p>
                  <p className="text-xl font-black text-amber-600 font-mono mt-0.5">{interview.overallScore} / 10</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Compatibilidade</p>
                  <p className="text-xl font-black text-emerald-600 font-mono mt-0.5">{interview.jobCompatibility}%</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-slate-800 text-[11px] uppercase">Pontos Fortes:</p>
                {(interview.strengths || []).slice(0, 2).map((s, sIdx) => (
                  <p key={sIdx} className="text-[11px] text-slate-600 flex items-start space-x-1">
                    <span className="text-emerald-500 font-bold">&bull;</span>
                    <span>{s}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {interview.finalDecision || interview.suggestedDecision}
              </span>

              <button
                onClick={() => onSelectInterview(interview)}
                className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center space-x-1"
              >
                <span>Ver Parecer Completo</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0b1d33] text-white font-display">
              <th className="p-4 rounded-tl-3xl">Critério de Avaliação</th>
              {selectedInterviews.map((item) => (
                <th key={item.id} className="p-4 text-center font-bold">
                  {item.candidateName}
                  <div className="text-[10px] text-amber-400 font-mono font-normal">{item.jobTitle}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            <tr>
              <td className="p-4 font-bold bg-slate-50">Nota Geral IA</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-black font-mono text-base text-amber-600">
                  {i.overallScore} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Compatibilidade com Vaga</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-black font-mono text-base text-emerald-600">
                  {i.jobCompatibility}%
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Comunicação</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold font-mono">
                  {i.competencies?.comunicacao?.score || 8.5} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Conhecimento Técnico</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold font-mono">
                  {i.competencies?.conhecimentoTecnico?.score || 8.2} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Experiência Relevante</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold font-mono">
                  {i.competencies?.experiencia?.score || 8.8} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Perfil Comportamental</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold font-mono">
                  {i.competencies?.perfilComportamental?.score || 8.9} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Liderança</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold font-mono">
                  {i.competencies?.lideranca?.score || 8.0} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Resolução de Problemas</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold font-mono">
                  {i.competencies?.resolucaoProblemas?.score || 8.6} / 10
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold bg-slate-50">Decisão Recomendada</td>
              {selectedInterviews.map((i) => (
                <td key={i.id} className="p-4 text-center font-bold text-xs">
                  <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                    {i.finalDecision || i.suggestedDecision}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
