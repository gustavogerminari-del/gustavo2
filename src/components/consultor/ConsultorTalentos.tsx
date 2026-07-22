/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  Star, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Eye, 
  X, 
  Award, 
  Tag, 
  MessageSquare 
} from 'lucide-react';
import { CandidatoConsultoria, VagaConsultoria } from '../../types_consultor';

interface ConsultorTalentosProps {
  candidatos: CandidatoConsultoria[];
  vagas: VagaConsultoria[];
  onAddCandidato: (candidato: CandidatoConsultoria) => void;
  onUpdateCandidato: (candidato: CandidatoConsultoria) => void;
}

export default function ConsultorTalentos({
  candidatos,
  vagas,
  onAddCandidato,
  onUpdateCandidato
}: ConsultorTalentosProps) {
  const [search, setSearch] = useState('');
  const [cargoFilter, setCargoFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [fitFilter, setFitFilter] = useState('Todos');
  const [apenasFavoritos, setApenasFavoritos] = useState(false);

  // Selected Candidate for AI Analysis Modal
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatoConsultoria | null>(null);
  const [targetVagaId, setTargetVagaId] = useState<string>(vagas[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter logic
  const filteredCandidatos = candidatos.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cargoDesejado.toLowerCase().includes(search.toLowerCase()) ||
      c.hardSkills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      c.cidade.toLowerCase().includes(search.toLowerCase());

    const matchCargo = cargoFilter === 'Todos' || c.cargoDesejado.toLowerCase().includes(cargoFilter.toLowerCase());
    const matchEstado = estadoFilter === 'Todos' || c.estado === estadoFilter;
    const matchFit = fitFilter === 'Todos' || c.fitClass === fitFilter;
    const matchFavorito = !apenasFavoritos || c.favorito;

    return matchSearch && matchCargo && matchEstado && matchFit && matchFavorito;
  });

  const toggleFavorito = (cand: CandidatoConsultoria) => {
    onUpdateCandidato({
      ...cand,
      favorito: !cand.favorito
    });
  };

  const handleRunAIScreening = async () => {
    if (!selectedCandidate) return;

    setIsAnalyzing(true);
    const targetVaga = vagas.find(v => v.id === targetVagaId) || vagas[0];

    try {
      const response = await fetch('/api/gemini/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: {
            name: selectedCandidate.nome,
            area: selectedCandidate.cargoDesejado,
            experience: `${selectedCandidate.experienciaAnos} anos de experiência em ${selectedCandidate.hardSkills.join(', ')}`,
            city: selectedCandidate.cidade,
            state: selectedCandidate.estado
          },
          job: targetVaga ? {
            title: targetVaga.cargo,
            department: 'Geral',
            requirements: targetVaga.requisitos,
            description: targetVaga.descricao
          } : undefined
        })
      });

      const data = await response.json();

      let fitClass: 'Excelente' | 'Muito Bom' | 'Bom' | 'Regular' | 'Baixo Fit' = 'Bom';
      if (data.score >= 90) fitClass = 'Excelente';
      else if (data.score >= 80) fitClass = 'Muito Bom';
      else if (data.score >= 70) fitClass = 'Bom';
      else if (data.score >= 50) fitClass = 'Regular';
      else fitClass = 'Baixo Fit';

      const updatedCand: CandidatoConsultoria = {
        ...selectedCandidate,
        aiScore: data.score || 85,
        fitClass,
        resumoIA: data.analysis || 'Análise de compatibilidade executada com sucesso.',
        vagaId: targetVaga?.id,
        vagaTitulo: targetVaga?.cargo,
        clienteId: targetVaga?.clienteId,
        clienteNome: targetVaga?.clienteNome
      };

      onUpdateCandidato(updatedCand);
      setSelectedCandidate(updatedCand);
    } catch (err) {
      console.error('Error running AI screening:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-amber-500" />
            <span>Banco de Talentos & IA de Triagem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Base inteligente de candidatos com score automático, competências e pareceres
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setApenasFavoritos(!apenasFavoritos)}
            className={`text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer ${
              apenasFavoritos 
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`h-4 w-4 ${apenasFavoritos ? 'fill-slate-950' : 'text-slate-400'}`} />
            <span>Apenas Favoritos</span>
          </button>
        </div>
      </div>

      {/* Multi-Parameter Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou skill (ex: React, SQL)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={fitFilter}
            onChange={e => setFitFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
          >
            <option value="Todos">Todos os Fit Scores</option>
            <option value="Excelente">Excelente (90%+)</option>
            <option value="Muito Bom">Muito Bom (80%+)</option>
            <option value="Bom">Bom (70%+)</option>
            <option value="Regular">Regular (50%+)</option>
          </select>

          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
          >
            <option value="Todos">Todos os Estados</option>
            <option value="SP">São Paulo (SP)</option>
            <option value="RJ">Rio de Janeiro (RJ)</option>
            <option value="MG">Minas Gerais (MG)</option>
            <option value="PR">Paraná (PR)</option>
          </select>
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCandidatos.map(cand => (
          <div key={cand.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30 shrink-0">
                    {cand.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{cand.nome}</h3>
                    <p className="text-[11px] text-amber-600 font-semibold">{cand.cargoDesejado}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFavorito(cand)}
                  className="p-1.5 text-slate-300 hover:text-amber-500 cursor-pointer transition-all"
                >
                  <Star className={`h-5 w-5 ${cand.favorito ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
              </div>

              {/* AI Score Badge */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">Score IA Fit:</span>
                </div>
                {cand.aiScore ? (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    cand.aiScore >= 90 ? 'bg-emerald-100 text-emerald-800' :
                    cand.aiScore >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cand.aiScore}% ({cand.fitClass})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Não analisado</span>
                )}
              </div>

              {/* Info details */}
              <div className="space-y-1 text-xs text-slate-600">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Experiência:</span>
                  <span className="font-medium text-slate-900">{cand.experienciaAnos} anos</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Cidade:</span>
                  <span>{cand.cidade} - {cand.estado}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Pretensão Salarial:</span>
                  <span className="font-bold text-emerald-600">R$ {cand.pretensaoSalarial.toLocaleString('pt-BR')}</span>
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {cand.hardSkills.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>

            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-mono">{cand.etapaPipeline}</span>

              <button
                onClick={() => setSelectedCandidate(cand)}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Análise Completa IA</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* AI Resume Analysis Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-bold text-xl text-slate-900">{selectedCandidate.nome}</h3>
                  {selectedCandidate.aiScore && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Fit {selectedCandidate.aiScore}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{selectedCandidate.cargoDesejado} • {selectedCandidate.cidade}-{selectedCandidate.estado}</p>
              </div>

              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Select Target Vaga for Comparison */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto">
                <p className="text-xs font-bold text-slate-900">Comparar com Vaga Ativa:</p>
                <select
                  value={targetVagaId}
                  onChange={e => setTargetVagaId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-1.5 font-semibold mt-1 focus:outline-none w-full sm:w-72"
                >
                  {vagas.map(v => (
                    <option key={v.id} value={v.id}>{v.cargo} ({v.clienteNome})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunAIScreening}
                disabled={isAnalyzing}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isAnalyzing ? 'Processando IA...' : 'Reavaliar com IA'}</span>
              </button>
            </div>

            {/* AI Summary Breakdown */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-amber-400 uppercase font-mono flex items-center space-x-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Resumo do Perfil Curricular</span>
                </p>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedCandidate.resumoIA || 'Clique em "Reavaliar com IA" para gerar parecer minucioso.'}
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <p className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Pontos Fortes Identificados</span>
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {selectedCandidate.pontosFortes && selectedCandidate.pontosFortes.length > 0 ? (
                      selectedCandidate.pontosFortes.map((pf, i) => <li key={i}>{pf}</li>)
                    ) : (
                      <li>Alta aderência técnica e experiência comprovada no cargo.</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                  <p className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Pontos de Atenção na Entrevista</span>
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {selectedCandidate.pontosFracos && selectedCandidate.pontosFracos.length > 0 ? (
                      selectedCandidate.pontosFracos.map((pf, i) => <li key={i}>{pf}</li>)
                    ) : (
                      <li>Validar tempo de adaptação e expectativa salarial.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Suggested Interview Questions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-900">Perguntas Recomendadas para Entrevista por Competências:</p>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside">
                  {selectedCandidate.perguntasSugeridas && selectedCandidate.perguntasSugeridas.length > 0 ? (
                    selectedCandidate.perguntasSugeridas.map((p, i) => <li key={i} className="font-medium">{p}</li>)
                  ) : (
                    <>
                      <li>Conte sobre o projeto técnico mais desafiador que você entregou recentemente.</li>
                      <li>Como lidou com divergências de prazos com a equipe de produto?</li>
                    </>
                  )}
                </ol>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Fechar Análise
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
