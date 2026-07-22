/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Plus, 
  CheckCircle2, 
  FileText, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Download, 
  Printer, 
  Clock,
  Briefcase
} from 'lucide-react';
import { CRMDeal, FinanceiroContrato, ReceitaDespesa } from '../../types_consultor';

interface ConsultorCRMFinanceiroProps {
  deals: CRMDeal[];
  contratos: FinanceiroContrato[];
  receitasDespesas: ReceitaDespesa[];
  onAddDeal: (deal: CRMDeal) => void;
  onUpdateDeal: (deal: CRMDeal) => void;
  onAddReceitaDespesa: (item: ReceitaDespesa) => void;
  activeSection: 'crm' | 'financeiro';
}

export default function ConsultorCRMFinanceiro({
  deals,
  contratos,
  receitasDespesas,
  onAddDeal,
  onUpdateDeal,
  onAddReceitaDespesa,
  activeSection
}: ConsultorCRMFinanceiroProps) {
  
  // Local state for modals & forms
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isReceitaModalOpen, setIsReceitaModalOpen] = useState(false);

  // CRM Form
  const [clienteEmpresa, setClienteEmpresa] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [valorEstimado, setValorEstimado] = useState('25000');
  const [etapa, setEtapa] = useState<CRMDeal['etapa']>('Proposta');

  // Financeiro Form
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'Receita' | 'Despesa'>('Receita');
  const [valor, setValor] = useState('15000');
  const [vencimento, setVencimento] = useState('2026-08-10');

  const handleAddDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeal: CRMDeal = {
      id: `deal-${Date.now()}`,
      clienteEmpresa,
      responsavel,
      telefone: '(11) 98888-7777',
      email: 'contato@empresa.com.br',
      valorEstimado: Number(valorEstimado) || 20000,
      etapa,
      probabilidade: 80,
      dataPrevisaoFechamento: '2026-08-15',
      consultorResponsavel: 'Rafaela Lourenço',
      historicoAtividades: [],
      dataCriacao: new Date().toISOString().split('T')[0]
    };
    onAddDeal(newDeal);
    setIsDealModalOpen(false);
  };

  const handleAddReceitaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ReceitaDespesa = {
      id: `rec-${Date.now()}`,
      descricao,
      tipo,
      categoria: tipo === 'Receita' ? 'Honorários de Recrutamento' : 'Ferramentas',
      valor: Number(valor) || 10000,
      dataVencimento: vencimento,
      status: 'Pendente'
    };
    onAddReceitaDespesa(newItem);
    setIsReceitaModalOpen(false);
  };

  // Calculations
  const totalReceitas = receitasDespesas.filter(r => r.tipo === 'Receita').reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = receitasDespesas.filter(r => r.tipo === 'Despesa').reduce((sum, r) => sum + r.valor, 0);
  const saldoCaixa = totalReceitas - totalDespesas;

  return (
    <div className="space-y-6">
      
      {activeSection === 'crm' ? (
        
        /* --- CRM COMERCIAL SECTION --- */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <span>CRM Comercial & Pipeline de Vendas B2B</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Funil de prospecção: Lead → Contato → Reunião → Proposta → Negociação → Contrato
              </p>
            </div>

            <button
              onClick={() => setIsDealModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Oportunidade</span>
            </button>
          </div>

          {/* CRM Funnel Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map(deal => (
              <div key={deal.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {deal.etapa}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    R$ {deal.valorEstimado.toLocaleString('pt-BR')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{deal.clienteEmpresa}</h3>
                <p className="text-xs text-slate-500">Contato: {deal.responsavel}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Previsão: {deal.dataPrevisaoFechamento}</span>
                  <span className="font-bold text-slate-700">{deal.probabilidade}% Chance</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (

        /* --- FINANCEIRO SECTION --- */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <span>Gestão Financeira & Fluxo de Caixa</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Contratos, mensalidades, faturamento por vaga fechada e emissão de recibos
              </p>
            </div>

            <button
              onClick={() => setIsReceitaModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Lançar Receita/Despesa</span>
            </button>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Total de Receitas</p>
              <p className="text-2xl font-bold font-display text-emerald-400 mt-1">
                R$ {totalReceitas.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Total de Despesas Operacionais</p>
              <p className="text-2xl font-bold font-display text-rose-400 mt-1">
                R$ {totalDespesas.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Saldo de Caixa Líquido</p>
              <p className="text-2xl font-bold font-display text-amber-400 mt-1">
                R$ {saldoCaixa.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Receitas e Despesas Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              Lançamentos Financeiros do Mês
            </div>
            <div className="divide-y divide-slate-100">
              {receitasDespesas.map(item => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition-all">
                  <div>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] mr-2 ${
                      item.tipo === 'Receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.tipo}
                    </span>
                    <strong className="text-slate-900">{item.descricao}</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Vencimento: {item.dataVencimento}</p>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${
                      item.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {item.tipo === 'Receita' ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR')}
                    </span>
                    <button 
                      onClick={() => alert(`Recibo emitido com sucesso para: ${item.descricao}`)} 
                      className="block text-[10px] text-amber-600 hover:underline font-semibold mt-0.5 ml-auto cursor-pointer"
                    >
                      Emitir Recibo PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      )}

      {/* Modal Add Deal */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Nova Oportunidade Comercial</h3>
            <form onSubmit={handleAddDealSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa Cliente *</label>
                <input
                  type="text"
                  required
                  value={clienteEmpresa}
                  onChange={e => setClienteEmpresa(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsável *</label>
                <input
                  type="text"
                  required
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor Estimado (R$)</label>
                <input
                  type="number"
                  value={valorEstimado}
                  onChange={e => setValorEstimado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsDealModalOpen(false)} className="px-4 py-2 border text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Receita */}
      {isReceitaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Lançamento Financeiro</h3>
            <form onSubmit={handleAddReceitaSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Receita">Receita (+)</option>
                  <option value="Despesa">Despesa (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsReceitaModalOpen(false)} className="px-4 py-2 border text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
