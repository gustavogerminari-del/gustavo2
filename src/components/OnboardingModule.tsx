import React, { useState } from 'react';
import { 
  FileSignature, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserPlus, 
  Upload, 
  Trash2, 
  Check, 
  X,
  UserCheck
} from 'lucide-react';
import { OnboardingContract, Employee } from '../types';

interface OnboardingModuleProps {
  contracts: OnboardingContract[];
  onUpdateContracts: (contracts: OnboardingContract[]) => void;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  triggerToast: (msg: string) => void;
}

export const DOCUMENT_TEMPLATES = [
  "Documento de Identidade (RG/CNH)",
  "Cadastro de Pessoa Física (CPF)",
  "Comprovante de Residência (últimos 90 dias)",
  "Título de Eleitor",
  "Atestado de Saúde Ocupacional (ASO Admissional)",
  "Carteira de Trabalho (CTPS Digital)"
];

export default function OnboardingModule({
  contracts,
  onUpdateContracts,
  employees,
  onUpdateEmployees,
  triggerToast
}: OnboardingModuleProps) {
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<OnboardingContract | null>(contracts[0] || null);

  // New contract form states
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDept, setEmpDept] = useState('TI');
  const [empType, setEmpType] = useState<'CLT' | 'Experiência' | 'Temporário' | 'PJ' | 'Estágio' | 'Aprendiz' | 'Terceirizado'>('CLT');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [empSalary, setEmpSalary] = useState('');

  // Simulating File Uploading
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empEmail || !empRole || !empSalary) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const salaryNum = parseFloat(empSalary);
    if (isNaN(salaryNum)) {
      alert('Salário inválido!');
      return;
    }

    // Default checklist depending on contract type
    const defaultDocs = empType === 'PJ' ? [
      { id: 'pj-1', name: 'Contrato Social / MEI', status: 'Pendente' as const },
      { id: 'pj-2', name: 'Comprovante de Conta Corrente PJ', status: 'Pendente' as const },
      { id: 'pj-3', name: 'Documento do Representante Legal', status: 'Pendente' as const }
    ] : DOCUMENT_TEMPLATES.map((name, i) => ({
      id: `doc-tmpl-${i}-${Date.now()}`,
      name,
      status: 'Pendente' as const
    }));

    const newContract: OnboardingContract = {
      id: `ct-${Date.now()}`,
      employeeName: empName,
      email: empEmail,
      phone: empPhone,
      role: empRole,
      department: empDept,
      type: empType,
      startDate,
      salary: salaryNum,
      status: 'Pendente',
      createdAt: new Date().toISOString().split('T')[0],
      checklistDocuments: defaultDocs
    };

    onUpdateContracts([...contracts, newContract]);
    setSelectedContract(newContract);
    setIsNewContractOpen(false);
    triggerToast(`✓ Pré-contrato criado para ${empName}! Checklist admissional liberado.`);

    // Clear form
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpRole('');
    setEmpSalary('');
  };

  // Toggle status of a checklist document
  const handleUpdateDocStatus = (contractId: string, docId: string, newStatus: 'Pendente' | 'Recebido' | 'Validado') => {
    const updated = contracts.map(c => {
      if (c.id === contractId) {
        const updatedDocs = c.checklistDocuments.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              status: newStatus,
              ...(newStatus === 'Recebido' ? { fileName: `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_upload.pdf`, uploadedAt: '2026-07-21' } : {}),
              ...(newStatus === 'Pendente' ? { fileName: undefined, uploadedAt: undefined } : {})
            };
          }
          return d;
        });

        // Auto calculate status of contract onboarding
        const allValidated = updatedDocs.every(d => d.status === 'Validado');
        const someReceived = updatedDocs.some(d => d.status === 'Recebido' || d.status === 'Validado');
        let nextStatus = c.status;
        if (allValidated) {
          nextStatus = 'Assinado';
        } else if (someReceived) {
          nextStatus = 'Em análise';
        } else {
          nextStatus = 'Pendente';
        }

        return {
          ...c,
          status: nextStatus as any,
          checklistDocuments: updatedDocs
        };
      }
      return c;
    });

    onUpdateContracts(updated);
    const updatedSelected = updated.find(c => c.id === contractId);
    if (updatedSelected) setSelectedContract(updatedSelected);
    triggerToast('✓ Status do documento admissional atualizado!');
  };

  // Finalize Onboarding and promote candidate to active Employee
  const handleCompleteOnboarding = (contract: OnboardingContract) => {
    if (contract.status !== 'Assinado') {
      if (!confirm('Alguns documentos ainda não foram totalmente validados. Deseja efetivar o colaborador mesmo assim?')) {
        return;
      }
    }

    // Add to employees list
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: contract.employeeName,
      email: contract.email,
      phone: contract.phone,
      department: contract.department,
      role: contract.role,
      salary: contract.salary,
      admissionDate: contract.startDate,
      status: 'Ativo'
    };

    onUpdateEmployees([...employees, newEmployee]);

    // Update contract status
    const updated = contracts.map(c => {
      if (c.id === contract.id) {
        return { ...c, status: 'Efetivado' as const };
      }
      return c;
    });

    onUpdateContracts(updated);
    const updatedSelected = updated.find(c => c.id === contract.id);
    if (updatedSelected) setSelectedContract(updatedSelected);
    triggerToast(`✓ Colaborador(a) ${contract.employeeName} efetivado com sucesso em GestRH!`);
  };

  // Simulating File upload trigger
  const triggerSimulatedUpload = (contractId: string, docId: string) => {
    setUploadingDocId(docId);
    setTimeout(() => {
      handleUpdateDocStatus(contractId, docId, 'Recebido');
      setUploadingDocId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Panel: Contracts List & Sidebar details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Onboarding Pre-contracts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-[650px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
              <FileSignature className="h-5 w-5 text-emerald-600" />
              <span>Contratações em Andamento ({contracts.length})</span>
            </h3>
            <button 
              onClick={() => setIsNewContractOpen(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
              title="Nova Contratação"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {contracts.map(contract => (
              <button
                key={contract.id}
                onClick={() => setSelectedContract(contract)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col space-y-2 cursor-pointer ${selectedContract?.id === contract.id ? 'bg-[#0b1d33]/5 border-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{contract.employeeName}</span>
                  <span className={`
                    text-[9px] font-bold px-2.5 py-0.5 rounded-full
                    ${contract.status === 'Pendente' && 'bg-amber-50 text-amber-700'}
                    ${contract.status === 'Em análise' && 'bg-blue-50 text-blue-700'}
                    ${contract.status === 'Assinado' && 'bg-emerald-50 text-emerald-700'}
                    ${contract.status === 'Efetivado' && 'bg-purple-50 text-purple-700'}
                  `}>
                    {contract.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{contract.role}</span>
                  <span>&bull;</span>
                  <span className="font-semibold">{contract.type}</span>
                </div>
                
                {/* Onboarding progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.round(
                        (contract.checklistDocuments.filter(d => d.status === 'Validado').length / contract.checklistDocuments.length) * 100
                      )}%` 
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected contract checklist view */}
        <div className="lg:col-span-2 space-y-6">
          {selectedContract ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 h-[650px] overflow-y-auto">
              
              {/* Header contract info */}
              <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-xl text-slate-900">{selectedContract.employeeName}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">{selectedContract.role} &bull; {selectedContract.department}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-slate-50 border border-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 rounded-lg">Início: {selectedContract.startDate.split('-').reverse().join('/')}</span>
                    <span className="bg-slate-50 border border-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 rounded-lg">Regime: {selectedContract.type}</span>
                    <span className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 rounded-lg">Salário: R$ {selectedContract.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {selectedContract.status === 'Efetivado' ? (
                    <div className="bg-purple-50 text-purple-700 px-4 py-3 rounded-2xl border border-purple-100 text-center flex flex-col items-center">
                      <UserCheck className="h-5 w-5 mb-1" />
                      <span className="text-xs font-bold block">Admissão Efetivada</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteOnboarding(selectedContract)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                      Efetivar Colaborador(a)
                    </button>
                  )}
                </div>
              </div>

              {/* Onboarding status stats */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Pendentes</span>
                  <span className="text-lg font-extrabold text-amber-600 block mt-1">
                    {selectedContract.checklistDocuments.filter(d => d.status === 'Pendente').length}
                  </span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Enviados</span>
                  <span className="text-lg font-extrabold text-blue-600 block mt-1">
                    {selectedContract.checklistDocuments.filter(d => d.status === 'Recebido').length}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Validados</span>
                  <span className="text-lg font-extrabold text-emerald-600 block mt-1">
                    {selectedContract.checklistDocuments.filter(d => d.status === 'Validado').length}
                  </span>
                </div>
              </div>

              {/* Document checklist table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Checklist de Documentação Admissional</h4>
                
                <div className="space-y-3">
                  {selectedContract.checklistDocuments.map(doc => (
                    <div key={doc.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${doc.status === 'Validado' ? 'bg-emerald-50 text-emerald-600' : doc.status === 'Recebido' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                          {doc.fileName ? (
                            <p className="text-[10px] text-emerald-600 mt-1 font-mono truncate max-w-[200px]">
                              {doc.fileName} {doc.uploadedAt && `(${doc.uploadedAt.split('-').reverse().join('/')})`}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 mt-1">Nenhum arquivo enviado</p>
                          )}
                        </div>
                      </div>

                      {/* Document interactive actions */}
                      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                        {doc.status === 'Pendente' && (
                          <button
                            onClick={() => triggerSimulatedUpload(selectedContract.id, doc.id)}
                            disabled={uploadingDocId === doc.id}
                            className="bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            {uploadingDocId === doc.id ? (
                              <>
                                <div className="animate-spin h-3 w-3 border-2 border-emerald-600 border-t-transparent rounded-full mr-1" />
                                <span>Enviando...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3 shrink-0" />
                                <span>Simular Envio</span>
                              </>
                            )}
                          </button>
                        )}

                        {doc.status === 'Recebido' && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleUpdateDocStatus(selectedContract.id, doc.id, 'Validado')}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-1.5 rounded-lg transition-all"
                              title="Validar Documento"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateDocStatus(selectedContract.id, doc.id, 'Pendente')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-1.5 rounded-lg transition-all"
                              title="Recusar Documento"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {doc.status === 'Validado' && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-1 shrink-0" />
                            <span>Validado</span>
                          </span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center h-[650px] flex flex-col justify-center items-center">
              <FileSignature className="h-10 w-10 text-slate-300 mb-4" />
              <h3 className="font-display font-bold text-base text-slate-800">Selecione uma contratação para gerenciar</h3>
              <p className="text-slate-400 text-xs mt-1">Selecione uma contratação pendente na barra lateral ou cadastre uma nova.</p>
            </div>
          )}
        </div>

      </div>

      {/* New Contract Modal */}
      {isNewContractOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-display font-extrabold text-base text-slate-900">Iniciar Nova Contratação / Admissão</h3>
              <button 
                onClick={() => setIsNewContractOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo do Candidato *</label>
                <input 
                  type="text" 
                  placeholder="Nome completo do contratado"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail de Contato *</label>
                  <input 
                    type="email" 
                    placeholder="email@candidato.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp / Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo Desejado *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Desenvolvedor Senior, Vendedor B2B"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento</label>
                  <select 
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="TI">TI</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Logística">Logística</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Contrato</label>
                  <select 
                    value={empType}
                    onChange={(e) => setEmpType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="CLT">CLT</option>
                    <option value="Experiência">Experiência</option>
                    <option value="Temporário">Temporário</option>
                    <option value="PJ">PJ</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Aprendiz">Aprendiz</option>
                    <option value="Terceirizado">Terceirizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Início</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remuneração / Salário *</label>
                  <input 
                    type="number" 
                    placeholder="R$ 3500.00"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewContractOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Criar Pré-Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
