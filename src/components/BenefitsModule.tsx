import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Plus, 
  Trash2, 
  Edit, 
  UserPlus, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  X,
  Users
} from 'lucide-react';
import { Benefit, EmployeeBenefit, Employee } from '../types';

interface BenefitsModuleProps {
  benefits: Benefit[];
  onUpdateBenefits: (benefits: Benefit[]) => void;
  employeeBenefits: EmployeeBenefit[];
  onUpdateEmployeeBenefits: (employeeBenefits: EmployeeBenefit[]) => void;
  employees: Employee[];
  triggerToast: (msg: string) => void;
}

export const BENEFIT_TYPES = [
  { value: 'VA', label: 'Vale Alimentação' },
  { value: 'VR', label: 'Vale Refeição' },
  { value: 'VT', label: 'Vale Transporte' },
  { value: 'Comissão', label: 'Comissão' },
  { value: 'Bonificação', label: 'Bonificação' },
  { value: 'Assiduidade', label: 'Assiduidade' },
  { value: 'Premiações', label: 'Premiações' },
  { value: 'Saúde', label: 'Plano de Saúde' },
  { value: 'Odonto', label: 'Plano Odontológico' },
  { value: 'Custom', label: 'Auxílio Personalizado' }
];

export default function BenefitsModule({
  benefits,
  onUpdateBenefits,
  employeeBenefits,
  onUpdateEmployeeBenefits,
  employees,
  triggerToast
}: BenefitsModuleProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [isNewBenefitOpen, setIsNewBenefitOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // New Benefit Template Form
  const [benName, setBenName] = useState('');
  const [benType, setBenType] = useState('VA');
  const [benCategory, setBenCategory] = useState<'Provento' | 'Desconto'>('Provento');
  const [benValueType, setBenValueType] = useState<'Fixo' | 'Porcentagem'>('Fixo');
  const [benValue, setBenValue] = useState('');

  // Assign Benefit Form
  const [assignBenId, setAssignBenId] = useState('');
  const [assignCustomValue, setAssignCustomValue] = useState('');

  // Find active employee details
  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmpId);
  }, [employees, selectedEmpId]);

  // Benefits currently allocated to the selected employee
  const allocatedBenefits = useMemo(() => {
    return employeeBenefits.filter(eb => eb.employeeId === selectedEmpId);
  }, [employeeBenefits, selectedEmpId]);

  // Summarize financial impact for selected employee
  const financialSummary = useMemo(() => {
    let proventos = 0;
    let descontos = 0;
    if (!selectedEmployee) return { proventos, descontos, totalImpact: 0 };

    allocatedBenefits.forEach(eb => {
      let actualValue = eb.value;
      if (eb.valueType === 'Porcentagem') {
        // Calculate percentage of base salary
        actualValue = (eb.value / 100) * selectedEmployee.salary;
      }

      if (eb.category === 'Provento') {
        proventos += actualValue;
      } else {
        descontos += actualValue;
      }
    });

    return {
      proventos,
      descontos,
      totalImpact: proventos - descontos
    };
  }, [allocatedBenefits, selectedEmployee]);

  // Save new benefit template
  const handleCreateBenefitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benName || !benValue) {
      alert('Por favor, preencha o nome e valor do benefício!');
      return;
    }

    const valueNum = parseFloat(benValue);
    if (isNaN(valueNum)) {
      alert('Valor inválido!');
      return;
    }

    const newBen: Benefit = {
      id: `ben-${Date.now()}`,
      name: benName,
      type: benType as any,
      category: benCategory,
      valueType: benValueType,
      value: valueNum,
      status: 'Ativo'
    };

    onUpdateBenefits([...benefits, newBen]);
    setIsNewBenefitOpen(false);
    triggerToast(`✓ Benefício "${benName}" cadastrado com sucesso!`);

    // Clear form
    setBenName('');
    setBenValue('');
  };

  // Assign benefit to selected employee
  const handleAssignBenefitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !assignBenId) {
      alert('Selecione um colaborador e um benefício!');
      return;
    }

    const emp = employees.find(e => e.id === selectedEmpId);
    const ben = benefits.find(b => b.id === assignBenId);
    if (!emp || !ben) return;

    // Check duplicate allocation
    const isDuplicate = employeeBenefits.some(eb => eb.employeeId === selectedEmpId && eb.benefitId === assignBenId);
    if (isDuplicate) {
      alert('Este colaborador já possui este benefício vinculado.');
      return;
    }

    const finalValue = assignCustomValue ? parseFloat(assignCustomValue) : ben.value;

    const newAllocation: EmployeeBenefit = {
      id: `eb-${Date.now()}`,
      employeeId: selectedEmpId,
      employeeName: emp.name,
      benefitId: assignBenId,
      benefitName: ben.name,
      benefitType: ben.type,
      category: ben.category,
      valueType: ben.valueType,
      value: finalValue,
      status: 'Ativo'
    };

    onUpdateEmployeeBenefits([...employeeBenefits, newAllocation]);
    setIsAssignOpen(false);
    setAssignBenId('');
    setAssignCustomValue('');
    triggerToast(`✓ Benefício "${ben.name}" vinculado a ${emp.name}!`);
  };

  // Remove allocation
  const handleRemoveAllocation = (id: string, name: string) => {
    if (confirm(`Remover benefício "${name}" para este colaborador?`)) {
      onUpdateEmployeeBenefits(employeeBenefits.filter(eb => eb.id !== id));
      triggerToast('✓ Benefício desvinculado com sucesso.');
    }
  };

  // Remove template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Excluir o benefício de cadastro "${name}" do sistema? (Colaboradores vinculados continuarão mantendo seu valor histórico).`)) {
      onUpdateBenefits(benefits.filter(b => b.id !== id));
      triggerToast(`✓ Cadastro de benefício "${name}" removido.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Lower grid: Employee selection and Allocations + Global Templates manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Employees Selector List */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-[650px]">
          <div className="mb-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Colaboradores Ativos ({employees.length})</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Selecione para ver benefícios vinculados.</p>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col space-y-1 cursor-pointer ${selectedEmpId === emp.id ? 'bg-[#0b1d33]/5 border-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}
              >
                <span className="font-bold text-slate-800 text-xs block">{emp.name}</span>
                <span className="text-[10px] text-slate-400 block">{emp.role} &bull; {emp.department}</span>
                
                {/* Micro counting badge */}
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block mt-2 self-start">
                  {employeeBenefits.filter(eb => eb.employeeId === emp.id).length} Benefícios
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center & Right Columns: Allocated benefits list and Templates Management */}
        <div className="lg:col-span-2 space-y-6 h-[650px] overflow-y-auto pr-1">
          
          {/* Section A: Allocated Benefits to the selected Employee */}
          {selectedEmployee ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900 flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-emerald-600" />
                    <span>Benefícios de {selectedEmployee.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Salário Base CLT: R$ {selectedEmployee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <button
                  onClick={() => setIsAssignOpen(true)}
                  className="bg-[#0b1d33] hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 shrink-0" />
                  <span>Vincular Benefício</span>
                </button>
              </div>

              {/* Financial summary metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Proventos Adicionais</span>
                  <span className="text-lg font-extrabold text-emerald-700 mt-1 block">
                    + R$ {financialSummary.proventos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Descontos em Folha</span>
                  <span className="text-lg font-extrabold text-rose-700 mt-1 block">
                    - R$ {financialSummary.descontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Impacto Líquido</span>
                  <span className={`text-lg font-extrabold mt-1 block ${financialSummary.totalImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {financialSummary.totalImpact >= 0 ? '+' : '-'} R$ {Math.abs(financialSummary.totalImpact).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {allocatedBenefits.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed text-xs text-slate-400">
                  Nenhum benefício ou desconto de commission/saúde vinculado a este colaborador.
                </div>
              ) : (
                <div className="space-y-3">
                  {allocatedBenefits.map(eb => (
                    <div key={eb.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex items-center justify-between transition-colors">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-800">{eb.benefitName}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${eb.category === 'Provento' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {eb.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Tipo: {eb.benefitType} &bull; {eb.valueType === 'Porcentagem' ? `${eb.value}% do Salário` : `Valor Fixo`}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-mono font-extrabold text-slate-900">
                          R$ {(eb.valueType === 'Porcentagem' ? (eb.value / 100) * selectedEmployee.salary : eb.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => handleRemoveAllocation(eb.id, eb.benefitName)}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Desvincular Benefício"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-xs text-slate-400">
              Cadastre um colaborador para gerenciar seus benefícios.
            </div>
          )}

          {/* Section B: Global Benefits Templates List */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">Cadastro Geral de Vales e Planos ({benefits.length})</h3>
                <p className="text-[10px] text-slate-400">Lista global de benefícios cadastrados para a empresa.</p>
              </div>
              <button
                onClick={() => setIsNewBenefitOpen(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>Cadastrar Benefício</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map(ben => (
                <div key={ben.id} className="p-4 bg-white border border-slate-150 rounded-2xl hover:shadow-sm transition-shadow flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{ben.name}</h5>
                    <div className="flex space-x-2 mt-1.5">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${ben.category === 'Provento' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {ben.category}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 uppercase font-mono">
                        {ben.type}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end space-y-2">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {ben.valueType === 'Porcentagem' ? `${ben.value}%` : `R$ ${ben.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </span>
                    <button
                      onClick={() => handleDeleteTemplate(ben.id, ben.name)}
                      className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Benefício"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: New Benefit Template */}
      {isNewBenefitOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display font-extrabold text-base text-slate-900">Cadastrar Modelo de Benefício</h3>
              <button onClick={() => setIsNewBenefitOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBenefitTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Benefício *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Vale Alimentação Sodexo, Unimed Empresarial"
                  value={benName}
                  onChange={(e) => setBenName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Benefício</label>
                  <select 
                    value={benType}
                    onChange={(e) => setBenType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {BENEFIT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Impacto Financeiro</label>
                  <select 
                    value={benCategory}
                    onChange={(e) => setBenCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Provento">Provento (Soma ao Salário)</option>
                    <option value="Desconto">Desconto (Abate em Folha)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-semibold">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Forma de Cálculo</label>
                  <select 
                    value={benValueType}
                    onChange={(e) => setBenValueType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Fixo">Valor Fixo (R$)</option>
                    <option value="Porcentagem">Porcentagem (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Ex: 450.00 ou 6"
                    value={benValue}
                    onChange={(e) => setBenValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewBenefitOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Benefit to Employee */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display font-extrabold text-base text-slate-900">Vincular Benefício ao Colaborador</h3>
              <button onClick={() => setIsAssignOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignBenefitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador Destinatário</label>
                <input 
                  type="text" 
                  value={selectedEmployee?.name || ''} 
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 font-bold"
                  disabled 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Benefício / Desconto *</label>
                <select 
                  value={assignBenId}
                  onChange={(e) => setAssignBenId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                >
                  <option value="">Selecione um benefício do catálogo...</option>
                  {benefits.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.valueType === 'Porcentagem' ? `${b.value}%` : `R$ ${b.value.toLocaleString('pt-BR')}`}) [{b.category}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Customizado (Opcional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Deixe vazio para usar o padrão"
                  value={assignCustomValue}
                  onChange={(e) => setAssignCustomValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Útil para fixar valores de co-participação médica ou comissão específica do mês.</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Vincular Benefício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
