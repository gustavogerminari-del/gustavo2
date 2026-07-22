/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  User, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  Search, 
  Star,
  Users
} from 'lucide-react';
import { CandidatoConsultoria, PipelineStage, VagaConsultoria, ClienteEmpresa } from '../../types_consultor';

interface ConsultorPipelineProps {
  candidatos: CandidatoConsultoria[];
  vagas: VagaConsultoria[];
  clientes: ClienteEmpresa[];
  onUpdateCandidato: (candidato: CandidatoConsultoria) => void;
}

export default function ConsultorPipeline({
  candidatos,
  vagas,
  clientes,
  onUpdateCandidato
}: ConsultorPipelineProps) {
  const [vagaFilter, setVagaFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const PIPELINE_STAGES: PipelineStage[] = [
    'Novo',
    'Triagem',
    'Contato',
    'Entrevista RH',
    'Teste',
    'Entrevista Cliente',
    'Aprovado',
    'Contratado',
    'Banco de Talentos'
  ];

  const filteredCandidatos = candidatos.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cargoDesejado.toLowerCase().includes(search.toLowerCase());
    const matchVaga = vagaFilter === 'Todas' || c.vagaId === vagaFilter;

    return matchSearch && matchVaga;
  });

  const moveStage = (cand: CandidatoConsultoria, direction: 'next' | 'prev') => {
    const currentIndex = PIPELINE_STAGES.indexOf(cand.etapaPipeline);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= PIPELINE_STAGES.length) nextIndex = PIPELINE_STAGES.length - 1;

    const newStage = PIPELINE_STAGES[nextIndex];
    
    const updatedHistory = cand.historicoEtapas || [];
    updatedHistory.push({
      etapa: newStage,
      data: new Date().toISOString().split('T')[0],
      usuario: 'Rafaela Lourenço',
      observacao: `Movido para ${newStage}`
    });

    onUpdateCandidato({
      ...cand,
      etapaPipeline: newStage,
      historicoEtapas: updatedHistory
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-amber-500" />
            <span>Pipeline Kanban do Processo Seletivo</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe a movimentação dos candidatos entre todas as 9 etapas da seleção
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar candidato..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={vagaFilter}
            onChange={e => setVagaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="Todas">Todas as Vagas Ativas</option>
            {vagas.map(v => (
              <option key={v.id} value={v.id}>{v.cargo} ({v.clienteNome})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Horizontal Board */}
      <div className="flex space-x-4 overflow-x-auto pb-6 min-h-[600px] scrollbar-thin">
        {PIPELINE_STAGES.map((stage, sIdx) => {
          const stageCandidates = filteredCandidatos.filter(c => c.etapaPipeline === stage);

          return (
            <div key={stage} className="w-72 shrink-0 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 px-1 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h3 className="font-bold text-xs text-slate-900">{stage}</h3>
                </div>
                <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] pr-1">
                {stageCandidates.length === 0 ? (
                  <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                    Nenhum candidato nesta etapa
                  </div>
                ) : (
                  stageCandidates.map(cand => (
                    <div key={cand.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-2.5">
                      
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">{cand.nome}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{cand.cargoDesejado}</p>
                        </div>
                        {cand.aiScore && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                            {cand.aiScore}% Fit
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5">
                        <p className="truncate"><strong className="text-slate-900">Cliente:</strong> {cand.clienteNome || 'Em análise'}</p>
                        <p><strong className="text-slate-900">Salário:</strong> R$ {cand.pretensaoSalarial.toLocaleString('pt-BR')}</p>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <button
                          disabled={sIdx === 0}
                          onClick={() => moveStage(cand, 'prev')}
                          className="text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer font-semibold"
                        >
                          ← Voltar
                        </button>
                        <button
                          disabled={sIdx === PIPELINE_STAGES.length - 1}
                          onClick={() => moveStage(cand, 'next')}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded transition-all cursor-pointer shadow-2xs"
                        >
                          Avançar →
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
