/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  X, 
  Share2, 
  FileText 
} from 'lucide-react';
import { VagaConsultoria, ClienteEmpresa } from '../../types_consultor';

interface ConsultorVagasProps {
  vagas: VagaConsultoria[];
  clientes: ClienteEmpresa[];
  onAddVaga: (vaga: VagaConsultoria) => void;
  onUpdateVaga: (vaga: VagaConsultoria) => void;
  onDeleteVaga: (id: string) => void;
}

export default function ConsultorVagas({
  vagas,
  clientes,
  onAddVaga,
  onUpdateVaga,
  onDeleteVaga
}: ConsultorVagasProps) {
  const [search, setSearch] = useState('');
  const [clienteFilter, setClienteFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaga, setEditingVaga] = useState<VagaConsultoria | null>(null);

  // Form State
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '');
  const [cargo, setCargo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsabilidadesText, setResponsabilidadesText] = useState('');
  const [requisitosText, setRequisitosText] = useState('');
  const [beneficiosText, setBeneficiosText] = useState('');
  const [salario, setSalario] = useState('R$ 8.000,00');
  const [cidade, setCidade] = useState('São Paulo');
  const [estado, setEstado] = useState('SP');
  const [modalidade, setModalidade] = useState<'Presencial' | 'Remoto' | 'Híbrido'>('Híbrido');
  const [tipoContratacao, setTipoContratacao] = useState<'CLT' | 'PJ' | 'Estágio' | 'Temporário'>('CLT');
  const [quantidade, setQuantidade] = useState('1');
  const [prazo, setPrazo] = useState('2026-08-30');
  const [status, setStatus] = useState<'Aberta' | 'Em Andamento' | 'Pausada' | 'Finalizada' | 'Cancelada'>('Em Andamento');
  
  // AI Generation Loading State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const openAddModal = () => {
    setEditingVaga(null);
    setClienteId(clientes[0]?.id || '');
    setCargo('');
    setDescricao('');
    setResponsabilidadesText('');
    setRequisitosText('');
    setBeneficiosText('');
    setSalario('R$ 8.000,00');
    setCidade('São Paulo');
    setEstado('SP');
    setModalidade('Híbrido');
    setTipoContratacao('CLT');
    setQuantidade('1');
    setPrazo('2026-08-30');
    setStatus('Em Andamento');
    setIsModalOpen(true);
  };

  const openEditModal = (vaga: VagaConsultoria) => {
    setEditingVaga(vaga);
    setClienteId(vaga.clienteId);
    setCargo(vaga.cargo);
    setDescricao(vaga.descricao);
    setResponsabilidadesText(vaga.responsabilidades.join('\n'));
    setRequisitosText(vaga.requisitos.join('\n'));
    setBeneficiosText(vaga.beneficios.join('\n'));
    setSalario(String(vaga.salario));
    setCidade(vaga.cidade);
    setEstado(vaga.estado);
    setModalidade(vaga.modalidade);
    setTipoContratacao(vaga.tipoContratacao);
    setQuantidade(String(vaga.quantidade));
    setPrazo(vaga.prazo);
    setStatus(vaga.status);
    setIsModalOpen(true);
  };

  const handleGenerateAIJob = async () => {
    if (!cargo) {
      alert('Informe o título do cargo para a IA gerar a descrição!');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/gemini/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cargo,
          department: 'Geral',
          workModel: modalidade,
          type: tipoContratacao
        })
      });

      const data = await response.json();
      if (data.description) {
        setDescricao(data.description);
      }
      if (data.requirements && Array.isArray(data.requirements)) {
        setRequisitosText(data.requirements.join('\n'));
      }
    } catch (err) {
      console.error('Error generating job description:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === clienteId) || clientes[0];

    const vagaData: VagaConsultoria = {
      id: editingVaga ? editingVaga.id : `vag-${Date.now()}`,
      clienteId: cliente?.id || 'cli-1',
      clienteNome: cliente?.nomeFantasia || 'Cliente Consultoria',
      cargo,
      descricao,
      responsabilidades: responsabilidadesText.split('\n').filter(r => r.trim() !== ''),
      requisitos: requisitosText.split('\n').filter(r => r.trim() !== ''),
      beneficios: beneficiosText.split('\n').filter(b => b.trim() !== ''),
      salario,
      cidade,
      estado,
      modalidade,
      tipoContratacao,
      quantidade: Number(quantidade) || 1,
      prazo,
      status,
      publicadoPortal: true,
      canaisPublicacao: ['LinkedIn Recruiter', 'Portal Rafaela Lourenço RH'],
      dataCriacao: editingVaga ? editingVaga.dataCriacao : new Date().toISOString().split('T')[0],
      consultorId: 'cons-1'
    };

    if (editingVaga) {
      onUpdateVaga(vagaData);
    } else {
      onAddVaga(vagaData);
    }

    setIsModalOpen(false);
  };

  const filteredVagas = vagas.filter(v => {
    const matchSearch = v.cargo.toLowerCase().includes(search.toLowerCase()) ||
      v.clienteNome.toLowerCase().includes(search.toLowerCase()) ||
      v.cidade.toLowerCase().includes(search.toLowerCase());

    const matchCliente = clienteFilter === 'Todos' || v.clienteId === clienteFilter;
    const matchStatus = statusFilter === 'Todos' || v.status === statusFilter;

    return matchSearch && matchCliente && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-amber-500" />
            <span>Gestão de Vagas & Processos Seletivos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie e gerencie descrições de cargos com IA, prazos e canais de publicação
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Nova Vaga</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cargo, cliente ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={clienteFilter}
            onChange={e => setClienteFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
          >
            <option value="Todos">Todos os Clientes</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Aberta">Aberta</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Pausada">Pausada</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      {/* Vagas List */}
      <div className="space-y-4">
        {filteredVagas.map(vaga => (
          <div key={vaga.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-900 text-amber-400 font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {vaga.clienteNome}
                </span>
                <span className="bg-blue-50 text-blue-700 font-semibold text-[10px] px-2.5 py-0.5 rounded-md">
                  {vaga.modalidade}
                </span>
                <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-0.5 rounded-md">
                  {vaga.tipoContratacao}
                </span>
              </div>

              <h3 className="font-display font-bold text-base text-slate-900">{vaga.cargo}</h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{vaga.cidade} - {vaga.estado}</span>
                </span>
                <span className="flex items-center space-x-1 font-semibold text-slate-900">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{vaga.salario}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Prazo: {vaga.prazo}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                vaga.status === 'Em Andamento' || vaga.status === 'Aberta' ? 'bg-emerald-100 text-emerald-800' :
                vaga.status === 'Pausada' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {vaga.status}
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(vaga)}
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  title="Editar Vaga"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteVaga(vaga.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  title="Excluir Vaga"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Vaga Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-amber-500" />
                <span>{editingVaga ? 'Editar Vaga' : 'Criar Nova Vaga para Cliente'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={clienteId}
                    onChange={e => setClienteId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeFantasia} ({c.segmento})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Título da Vaga *</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      required
                      value={cargo}
                      onChange={e => setCargo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Ex: Desenvolvedor Full Stack Sênior"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateAIJob}
                      disabled={isGeneratingAI}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl shrink-0 transition-all flex items-center space-x-1 cursor-pointer"
                      title="Gerar Descrição Automática com IA"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salário / Faixa Salarial</label>
                  <input
                    type="text"
                    value={salario}
                    onChange={e => setSalario(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modalidade & Contratação</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={modalidade}
                      onChange={e => setModalidade(e.target.value as any)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Remoto">Remoto</option>
                    </select>

                    <select
                      value={tipoContratacao}
                      onChange={e => setTipoContratacao(e.target.value as any)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                    >
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Estágio">Estágio</option>
                      <option value="Temporário">Temporário</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Estado</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={cidade}
                      onChange={e => setCidade(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={estado}
                      onChange={e => setEstado(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prazo de Encerramento</label>
                  <input
                    type="date"
                    value={prazo}
                    onChange={e => setPrazo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Cargo (Markdown)</label>
                <textarea
                  rows={4}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Resumo do desafio e perfil esperado..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requisitos (1 por linha)</label>
                  <textarea
                    rows={3}
                    value={requisitosText}
                    onChange={e => setRequisitosText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="5+ anos em React&#10;Inglês intermediário"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Benefícios (1 por linha)</label>
                  <textarea
                    rows={3}
                    value={beneficiosText}
                    onChange={e => setBeneficiosText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Plano de Saúde&#10;Vale Refeição R$ 1.200"
                  />
                </div>
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
                  Salvar Vaga
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
