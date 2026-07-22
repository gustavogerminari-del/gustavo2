/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Building2, 
  Plus, 
  CheckCircle2, 
  X, 
  Copy, 
  ExternalLink, 
  FileText, 
  Star 
} from 'lucide-react';
import { EntrevistaConsultoria, CandidatoConsultoria, VagaConsultoria, ClienteEmpresa } from '../../types_consultor';

interface ConsultorEntrevistasProps {
  entrevistas: EntrevistaConsultoria[];
  candidatos: CandidatoConsultoria[];
  vagas: VagaConsultoria[];
  clientes: ClienteEmpresa[];
  onAddEntrevista: (entrevista: EntrevistaConsultoria) => void;
  onUpdateEntrevista: (entrevista: EntrevistaConsultoria) => void;
}

export default function ConsultorEntrevistas({
  entrevistas,
  candidatos,
  vagas,
  clientes,
  onAddEntrevista,
  onUpdateEntrevista
}: ConsultorEntrevistasProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [candidatoId, setCandidatoId] = useState(candidatos[0]?.id || '');
  const [vagaId, setVagaId] = useState(vagas[0]?.id || '');
  const [data, setData] = useState('2026-07-25');
  const [hora, setHora] = useState('14:00');
  const [tipo, setTipo] = useState<'Presencial' | 'Google Meet' | 'Zoom' | 'MS Teams'>('Google Meet');
  const [linkMeet, setLinkMeet] = useState('https://meet.google.com/abc-defg-hij');
  const [responsavel, setResponsavel] = useState('Rafaela Lourenço');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidatos.find(c => c.id === candidatoId) || candidatos[0];
    const vaga = vagas.find(v => v.id === vagaId) || vagas[0];

    const newEntrevista: EntrevistaConsultoria = {
      id: `ent-${Date.now()}`,
      candidatoId: cand.id,
      candidatoNome: cand.nome,
      vagaId: vaga.id,
      vagaTitulo: vaga.cargo,
      clienteId: vaga.clienteId,
      clienteNome: vaga.clienteNome,
      data,
      hora,
      tipo,
      linkMeet,
      responsavel,
      status: 'Agendada',
      checklist: [
        { item: 'Validar testes e histórico técnico', concluido: false },
        { item: 'Conferir pretensão salarial', concluido: false },
        { item: 'Enviar parecer técnico ao cliente', concluido: false }
      ],
      notas
    };

    onAddEntrevista(newEntrevista);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <span>Gestão de Entrevistas & Pareceres Tecnicos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Agendamentos com integração Google Meet, Zoom, MS Teams e checklist de avaliação
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Agendar Entrevista</span>
        </button>
      </div>

      {/* Entrevistas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {entrevistas.map(ent => (
          <div key={ent.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {ent.status}
                </span>
                <h3 className="font-display font-bold text-base text-slate-900 mt-1">{ent.candidatoNome}</h3>
                <p className="text-xs text-slate-500">{ent.vagaTitulo} • <strong className="text-slate-900">{ent.clienteNome}</strong></p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">{ent.data}</span>
                <span className="text-xs font-semibold text-amber-600">{ent.hora}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{ent.tipo}</span>
              {ent.linkMeet && (
                <a
                  href={ent.linkMeet}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Acessar Sala</span>
                </a>
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-bold text-slate-900">Checklist da Entrevista:</p>
              {ent.checklist.map((chk, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={chk.concluido}
                    onChange={() => {
                      const updatedChecklist = [...ent.checklist];
                      updatedChecklist[i].concluido = !updatedChecklist[i].concluido;
                      onUpdateEntrevista({ ...ent, checklist: updatedChecklist });
                    }}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className={chk.concluido ? 'line-through text-slate-400' : ''}>{chk.item}</span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* Agendar Entrevista Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                <span>Agendar Nova Entrevista</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidato *</label>
                <select
                  value={candidatoId}
                  onChange={e => setCandidatoId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {candidatos.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.cargoDesejado})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vaga *</label>
                <select
                  value={vagaId}
                  onChange={e => setVagaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {vagas.map(v => (
                    <option key={v.id} value={v.id}>{v.cargo} - {v.clienteNome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={e => setHora(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plataforma / Canal</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="MS Teams">Microsoft Teams</option>
                  <option value="Presencial">Presencial no Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link de Acesso</label>
                <input
                  type="text"
                  value={linkMeet}
                  onChange={e => setLinkMeet(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
