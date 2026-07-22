import React, { useState } from 'react';
import { Table, Plus, Trash2, Save, FileSpreadsheet, Percent, Calculator, History } from 'lucide-react';
import { INSSBracket, IRRFBracket } from '../types';

interface TaxTablesModuleProps {
  inssBrackets: INSSBracket[];
  irrfBrackets: IRRFBracket[];
  onUpdateInssBrackets: (brackets: INSSBracket[]) => void;
  onUpdateIrrfBrackets: (brackets: IRRFBracket[]) => void;
  triggerToast: (msg: string) => void;
}

export default function TaxTablesModule({
  inssBrackets,
  irrfBrackets,
  onUpdateInssBrackets,
  onUpdateIrrfBrackets,
  triggerToast
}: TaxTablesModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inss' | 'irrf'>('inss');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // INSS Local State for editing
  const [localInss, setLocalInss] = useState<INSSBracket[]>(inssBrackets);
  // IRRF Local State for editing
  const [localIrrf, setLocalIrrf] = useState<IRRFBracket[]>(irrfBrackets);

  const handleSaveInss = () => {
    onUpdateInssBrackets(localInss);
    triggerToast('✓ Tabela de alíquotas do INSS atualizada e aplicada aos cálculos!');
  };

  const handleSaveIrrf = () => {
    onUpdateIrrfBrackets(localIrrf);
    triggerToast('✓ Tabela de IRRF e deduções por dependentes salva com sucesso!');
  };

  const handleAddInssRow = () => {
    const newRow: INSSBracket = {
      id: `inss-${Date.now()}`,
      year: selectedYear,
      minSalary: 0,
      maxSalary: 9999.99,
      rate: 0.14,
      deductible: 0
    };
    setLocalInss([...localInss, newRow]);
  };

  const handleAddIrrfRow = () => {
    const newRow: IRRFBracket = {
      id: `irrf-${Date.now()}`,
      year: selectedYear,
      minSalary: 0,
      maxSalary: 9999.99,
      rate: 0.15,
      deduction: 0,
      dependentDeduction: 189.59
    };
    setLocalIrrf([...localIrrf, newRow]);
  };

  const handleDeleteInssRow = (id: string) => {
    setLocalInss(localInss.filter(item => item.id !== id));
  };

  const handleDeleteIrrfRow = (id: string) => {
    setLocalIrrf(localIrrf.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            <span>Tabelas de Impostos Oficiais (INSS & IRRF Progressive)</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Configure as faixas salariais, alíquotas e parcelas dedutíveis vigentes. O sistema aplica o cálculo progressivo automático na folha.
          </p>
        </div>

        {/* Year & Tab Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 px-2">Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white text-slate-800 font-bold text-xs py-1 px-2 rounded-lg border-0 shadow-sm"
            >
              <option value={2026}>2026 (Vigente)</option>
              <option value={2025}>2025 (Histórico)</option>
              <option value={2024}>2024 (Histórico)</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('inss')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'inss' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tabela INSS
            </button>
            <button
              onClick={() => setActiveSubTab('irrf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'irrf' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tabela IRRF
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: INSS TABLE */}
      {activeSubTab === 'inss' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Faixas e Alíquotas Progressivas do INSS ({selectedYear})</h4>
              <p className="text-slate-400 text-xs">Contribuição previdenciária descontada do salário bruto.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddInssRow}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Faixa</span>
              </button>

              <button
                onClick={handleSaveInss}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shadow-md"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Tabela INSS</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">Faixa Salarial Mínima (R$)</th>
                  <th className="p-3">Faixa Salarial Máxima (R$)</th>
                  <th className="p-3">Alíquota %</th>
                  <th className="p-3">Parcela Dedutível (R$)</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localInss.filter(b => b.year === selectedYear || !b.year).map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.minSalary}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalInss(localInss.map(item => item.id === row.id ? { ...item, minSalary: val } : item));
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-32 font-mono text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.maxSalary}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalInss(localInss.map(item => item.id === row.id ? { ...item, maxSalary: val } : item));
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-32 font-mono text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.1"
                          value={(row.rate * 100).toFixed(2)}
                          onChange={(e) => {
                            const val = (parseFloat(e.target.value) || 0) / 100;
                            setLocalInss(localInss.map(item => item.id === row.id ? { ...item, rate: val } : item));
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-24 font-bold text-xs"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.deductible || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalInss(localInss.map(item => item.id === row.id ? { ...item, deductible: val } : item));
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-32 font-mono text-xs"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteInssRow(row.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: IRRF TABLE */}
      {activeSubTab === 'irrf' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Tabela Mensal do Imposto de Renda (IRRF {selectedYear})</h4>
              <p className="text-slate-400 text-xs">Cálculo do imposto retido na fonte com parcela a deduzir e abatimento por dependentes.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddIrrfRow}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Faixa</span>
              </button>

              <button
                onClick={handleSaveIrrf}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shadow-md"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Tabela IRRF</span>
              </button>
            </div>
          </div>

          {/* Dedução por Dependente Banner */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Dedução por Dependente Legítimo (CLT):</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-800">R$</span>
              <input
                type="number"
                step="0.01"
                value={localIrrf[0]?.dependentDeduction || 189.59}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setLocalIrrf(localIrrf.map(item => ({ ...item, dependentDeduction: val })));
                }}
                className="bg-white border border-emerald-300 rounded-lg py-1 px-3 w-32 font-bold text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">Base de Cálculo Mínima (R$)</th>
                  <th className="p-3">Base de Cálculo Máxima (R$)</th>
                  <th className="p-3">Alíquota %</th>
                  <th className="p-3">Parcela a Deduzir (R$)</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localIrrf.filter(b => b.year === selectedYear || !b.year).map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.minSalary}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalIrrf(localIrrf.map(item => item.id === row.id ? { ...item, minSalary: val } : item));
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-32 font-mono text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.maxSalary}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalIrrf(localIrrf.map(item => item.id === row.id ? { ...item, maxSalary: val } : item));
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-32 font-mono text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.1"
                          value={(row.rate * 100).toFixed(2)}
                          onChange={(e) => {
                            const val = (parseFloat(e.target.value) || 0) / 100;
                            setLocalIrrf(localIrrf.map(item => item.id === row.id ? { ...item, rate: val } : item));
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-24 font-bold text-xs"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.deduction || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalIrrf(localIrrf.map(item => item.id === row.id ? { ...item, deduction: val } : item));
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-32 font-mono text-xs"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteIrrfRow(row.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
