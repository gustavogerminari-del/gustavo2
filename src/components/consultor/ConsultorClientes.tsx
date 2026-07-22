/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Users, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Briefcase, 
  X, 
  Eye, 
  MessageSquare,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { ClienteEmpresa, VagaConsultoria, CandidatoConsultoria } from '../../types_consultor';

interface ConsultorClientesProps {
  clientes: ClienteEmpresa[];
  vagas: VagaConsultoria[];
  candidatos: CandidatoConsultoria[];
  onAddCliente: (cliente: ClienteEmpresa) => void;
  onUpdateCliente: (cliente: ClienteEmpresa) => void;
  onDeleteCliente: (id: string) => void;
}

export default function ConsultorClientes({
  clientes,
  vagas,
  candidatos,
  onAddCliente,
  onUpdateCliente,
  onDeleteCliente
}: ConsultorClientesProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modal State for Add/Edit Client
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClienteEmpresa | null>(null);

  // Form states
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [site, setSite] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [segmento, setSegmento] = useState('Tecnologia');
  const [numeroFuncionarios, setNumeroFuncionarios] = useState('50');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo' | 'Lead' | 'Proposta'>('Ativo');

  // Detailed Profile View Modal for Client
  const [selectedCliente, setSelectedCliente] = useState<ClienteEmpresa | null>(null);
  const [clientTab, setClientTab] = useState<'dados' | 'vagas' | 'contratacoes' | 'financeiro' | 'documentos'>('dados');

  const openAddModal = () => {
    setEditingCliente(null);
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setResponsavel('');
    setTelefone('');
    setWhatsapp('');
    setEmail('');
    setSite('');
    setEndereco('');
    setCidade('São Paulo');
    setEstado('SP');
    setSegmento('Tecnologia');
    setNumeroFuncionarios('50');
    setObservacoes('');
    setStatus('Ativo');
    setIsModalOpen(true);
  };

  const openEditModal = (cli: ClienteEmpresa) => {
    setEditingCliente(cli);
    setRazaoSocial(cli.razaoSocial);
    setNomeFantasia(cli.nomeFantasia);
    setCnpj(cli.cnpj);
    setResponsavel(cli.responsavel);
    setTelefone(cli.telefone);
    setWhatsapp(cli.whatsapp);
    setEmail(cli.email);
    setSite(cli.site);
    setEndereco(cli.endereco);
    setCidade(cli.cidade);
    setEstado(cli.estado);
    setSegmento(cli.segmento);
    setNumeroFuncionarios(String(cli.numeroFuncionarios));
    setObservacoes(cli.observacoes || '');
    setStatus(cli.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !nomeFantasia) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const clienteData: ClienteEmpresa = {
      id: editingCliente ? editingCliente.id : `cli-${Date.now()}`,
      razaoSocial,
      nomeFantasia,
      cnpj: cnpj || '00.000.000/0001-00',
      responsavel,
      telefone,
      whatsapp: whatsapp || telefone,
      email,
      site,
      endereco,
      cidade,
      estado,
      segmento,
      numeroFuncionarios: Number(numeroFuncionarios) || 10,
      observacoes,
      status,
      consultorResponsavelId: 'cons-1',
      consultorName: 'Rafaela Lourenço',
      dataCadastro: editingCliente ? editingCliente.dataCadastro : new Date().toISOString().split('T')[0]
    };

    if (editingCliente) {
      onUpdateCliente(clienteData);
    } else {
      onAddCliente(clienteData);
    }

    setIsModalOpen(false);
  };

  const filteredClientes = clientes.filter(c => {
    const matchSearch = c.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
      c.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.segmento.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            <span>Gestão de Clientes (Empresas)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre empresas parceiras, acompanhe vagas por cliente e dados financeiros
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nome, CNPJ ou Segmento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Proposta">Em Proposta</option>
            <option value="Lead">Leads</option>
            <option value="Inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClientes.map(cli => {
          const clientVagas = vagas.filter(v => v.clienteId === cli.id);
          const activeVagasCount = clientVagas.filter(v => v.status === 'Aberta' || v.status === 'Em Andamento').length;

          return (
            <div key={cli.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-4">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    {cli.logoUrl ? (
                      <img src={cli.logoUrl} alt={cli.nomeFantasia} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-500/30">
                        {cli.nomeFantasia.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{cli.nomeFantasia}</h3>
                      <p className="text-[10px] text-slate-400">{cli.razaoSocial}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cli.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' :
                    cli.status === 'Proposta' ? 'bg-amber-100 text-amber-800' :
                    cli.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cli.status}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">CNPJ:</span>
                    <span className="font-mono font-medium">{cli.cnpj}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Contato:</span>
                    <span className="font-medium text-slate-900">{cli.responsavel}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Cidade/UF:</span>
                    <span>{cli.cidade} - {cli.estado}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Segmento:</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">{cli.segmento}</span>
                  </p>
                </div>

                {/* Active Vagas Count */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Vagas em Aberto:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {activeVagasCount} Vagas
                  </span>
                </div>

              </div>

              {/* Action buttons */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCliente(cli)}
                  className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Página do Cliente</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(cli)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="Editar Cliente"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCliente(cli.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all cursor-pointer"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <span>{editingCliente ? 'Editar Cliente' : 'Novo Cliente Empresarial'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={razaoSocial}
                    onChange={e => setRazaoSocial(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Ex: TechCorp Inovações Ltda"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    value={nomeFantasia}
                    onChange={e => setNomeFantasia(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Ex: TechCorp"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="00.000.000/0001-00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsável / Contato *</label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={e => setResponsavel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Nome do Diretor ou RH do cliente"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="contato@empresa.com.br"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="(11) 98765-4321"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / Estado</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={cidade}
                      onChange={e => setCidade(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Cidade"
                    />
                    <input
                      type="text"
                      value={estado}
                      onChange={e => setEstado(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-bold uppercase"
                      placeholder="UF"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Segmento de Atuação</label>
                  <input
                    type="text"
                    value={segmento}
                    onChange={e => setSegmento(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Ex: Tecnologia, Finanças, Logística"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status do Cliente</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Proposta">Em Proposta</option>
                    <option value="Lead">Lead Comercial</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd. Funcionários</label>
                  <input
                    type="number"
                    value={numeroFuncionarios}
                    onChange={e => setNumeroFuncionarios(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações Internas</label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Anotações sobre perfil de vagas preferidas, política salarial ou histórico..."
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
                  Salvar Cliente
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Dedicated Client Profile Page / Modal */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xl border border-amber-500/30 shrink-0">
                  {selectedCliente.nomeFantasia.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-display font-bold text-xl text-slate-900">{selectedCliente.nomeFantasia}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedCliente.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedCliente.razaoSocial} • CNPJ: {selectedCliente.cnpj}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCliente(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-1">
              <button
                onClick={() => setClientTab('dados')}
                className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${clientTab === 'dados' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                Dados Cadastrais
              </button>
              <button
                onClick={() => setClientTab('vagas')}
                className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${clientTab === 'vagas' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                Vagas do Cliente ({vagas.filter(v => v.clienteId === selectedCliente.id).length})
              </button>
              <button
                onClick={() => setClientTab('contratacao')}
                className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${clientTab === 'contratacao' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                Contratações
              </button>
              <button
                onClick={() => setClientTab('financeiro')}
                className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${clientTab === 'financeiro' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                Financeiro
              </button>
            </div>

            {/* Tab Contents */}
            {clientTab === 'dados' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Responsável</p>
                  <p className="font-semibold text-sm text-slate-900">{selectedCliente.responsavel}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Contato Direto</p>
                  <p className="font-semibold text-sm text-slate-900">{selectedCliente.telefone} / {selectedCliente.email}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Localização</p>
                  <p className="font-semibold text-slate-900">{selectedCliente.endereco}, {selectedCliente.cidade} - {selectedCliente.estado}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Consultor Responsável</p>
                  <p className="font-semibold text-amber-600">{selectedCliente.consultorName}</p>
                </div>
                <div className="md:col-span-2 pt-2 border-t border-slate-200">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Observações de Relacionamento</p>
                  <p className="mt-1 text-slate-600">{selectedCliente.observacoes || 'Sem observações cadastradas.'}</p>
                </div>
              </div>
            )}

            {clientTab === 'vagas' && (
              <div className="space-y-3">
                {vagas.filter(v => v.clienteId === selectedCliente.id).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhuma vaga aberta para este cliente.</p>
                ) : (
                  vagas.filter(v => v.clienteId === selectedCliente.id).map(vaga => (
                    <div key={vaga.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{vaga.cargo}</h4>
                        <p className="text-slate-500">{vaga.modalidade} • {vaga.cidade}-{vaga.estado} • Salário: {vaga.salario}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-[11px]">
                        {vaga.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {clientTab === 'contratacao' && (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <UserCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-900 text-sm">Histórico de Contratações</p>
                <p className="mt-1">Nenhum candidato recém-efetivado nesta competência.</p>
              </div>
            )}

            {clientTab === 'financeiro' && (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <DollarSign className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-900 text-sm">Contrato de Recrutamento & Seleção</p>
                <p>Cobrança: 100% de 1 salário contratado por vaga fechada com sucesso.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
