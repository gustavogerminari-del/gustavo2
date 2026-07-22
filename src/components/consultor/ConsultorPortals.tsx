/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Clock, 
  FileText, 
  Calendar, 
  Video, 
  Upload, 
  Send,
  Star
} from 'lucide-react';
import { ClienteEmpresa, VagaConsultoria, CandidatoConsultoria } from '../../types_consultor';

interface ConsultorPortalsProps {
  clientes: ClienteEmpresa[];
  vagas: VagaConsultoria[];
  candidatos: CandidatoConsultoria[];
  activePortal: 'cliente' | 'candidato';
}

export default function ConsultorPortals({
  clientes,
  vagas,
  candidatos,
  activePortal
}: ConsultorPortalsProps) {

  // Selected Client Portal Simulation
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || '');
  const activeCliente = clientes.find(c => c.id === selectedClienteId) || clientes[0];
  const clientVagas = vagas.filter(v => v.clienteId === activeCliente?.id);

  // Candidate Portal Simulation
  const [appliedJob, setAppliedJob] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      
      {activePortal === 'cliente' ? (
        
        /* --- PORTAL EXCLUSIVO DO CLIENTE --- */
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Building2 className="h-4 w-4" />
                <span>Portal Corporativo do Cliente</span>
              </div>
              <h2 className="font-display text-2xl font-bold">
                Área de Acompanhamento do Cliente
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualização exclusiva para diretores e gestores da empresa contratante
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-2xl border border-slate-700">
              <span className="text-xs text-slate-400 font-medium pl-2">Empresa Simulada:</span>
              <select
                value={selectedClienteId}
                onChange={e => setSelectedClienteId(e.target.value)}
                className="bg-slate-900 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none"
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Vagas for Client */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Processos Seletivos em Andamento</h3>
            
            {clientVagas.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                Nenhum processo seletivo ativo no momento para esta empresa.
              </div>
            ) : (
              clientVagas.map(vaga => {
                const vagaCandidatos = candidatos.filter(c => c.vagaId === vaga.id || c.clienteId === activeCliente?.id);

                return (
                  <div key={vaga.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{vaga.cargo}</h4>
                        <p className="text-xs text-slate-500">{vaga.modalidade} • {vaga.cidade}-{vaga.estado} • {vaga.tipoContratacao}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full self-start sm:self-auto">
                        {vaga.status}
                      </span>
                    </div>

                    {/* Submitted Candidates for Approval */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-900">Candidatos Apresentados pela Consultoria de RH:</p>
                      {vagaCandidatos.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Consultor de RH realizando triagem de currículos...</p>
                      ) : (
                        vagaCandidatos.map(cand => (
                          <div key={cand.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center space-x-2">
                                <strong className="text-slate-900 text-sm">{cand.nome}</strong>
                                {cand.aiScore && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Score {cand.aiScore}% Fit
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 mt-0.5">{cand.cargoDesejado} • {cand.experienciaAnos} anos de exp.</p>
                              <p className="text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-200/60">
                                "{cand.resumoIA || 'Perfil recomendado pela consultoria de RH.'}"
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                onClick={() => alert(`Candidato ${cand.nome} APROVADO para Entrevista com o Gestor!`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Aprovar para Entrevista</span>
                              </button>
                              <button
                                onClick={() => alert(`Feedback registrado para ${cand.nome}.`)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Recusar</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      ) : (

        /* --- PORTAL EXCLUSIVO DO CANDIDATO --- */
        <div className="space-y-6">
          
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <User className="h-4 w-4" />
                <span>Portal de Oportunidades & Carreiras</span>
              </div>
              <h2 className="font-display text-2xl font-bold">
                Área Exclusiva do Candidato
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Candidate-se às melhores vagas do mercado e acompanhe o status de sua seleção
              </p>
            </div>

            <button
              onClick={() => alert('Envio de Currículo em PDF aberto!')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <Upload className="h-4 w-4" />
              <span>Atualizar Meu Currículo PDF</span>
            </button>
          </div>

          {/* Vagas feed for candidate */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Vagas Recomendadas para Seu Perfil</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vagas.map(vaga => (
                <div key={vaga.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-900 text-amber-400 font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                        {vaga.clienteNome}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">{vaga.salario}</span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 mt-2">{vaga.cargo}</h4>
                    <p className="text-xs text-slate-500">{vaga.modalidade} • {vaga.cidade}-{vaga.estado} • {vaga.tipoContratacao}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">{vaga.descricao}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Publicada recentemente</span>
                    
                    {appliedJob === vaga.id ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Candidatura Enviada!</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setAppliedJob(vaga.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                      >
                        Quero me Candidatar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      )}

    </div>
  );
}
