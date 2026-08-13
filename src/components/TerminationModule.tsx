import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserX, 
  Plus, 
  Trash2, 
  Calculator, 
  FileText, 
  DollarSign, 
  Calendar, 
  Info, 
  CheckCircle2, 
  X,
  AlertTriangle,
  Download,
  Printer,
  Eye,
  Sliders,
  Search,
  Building2,
  TrendingUp,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { firebaseService } from '../services/centralServices';
import { UserAccount } from '../types_master';
import { 
  Termination, 
  Employee, 
  TimeRegister, 
  EmployeeBenefit, 
  AppSettings,
  ResType,
  ResEvent,
  ResDocument
} from '../types';

interface TerminationModuleProps {
  terminations: Termination[];
  onUpdateTerminations: (terminations: Termination[]) => void;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  triggerToast: (msg: string) => void;
  currentUser?: UserAccount;
}

export default function TerminationModule({
  terminations: rawTerminations,
  onUpdateTerminations,
  employees: rawEmployees,
  onUpdateEmployees,
  triggerToast,
  currentUser
}: TerminationModuleProps) {
  
  // --- STATE FOR ACTIVE TABS & SELECTIONS ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rescisao' | 'novo' | 'tabelas'>('dashboard');
  const [selectedTerm, setSelectedTerm] = useState<Termination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- CUSTOM FIRESTORE SUB-COLLECTIONS STATE ---
  const [resTypes, setResTypes] = useState<ResType[]>([]);
  const [resEvents, setResEvents] = useState<ResEvent[]>([]);
  const [resDocs, setResDocs] = useState<ResDocument[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);

  // --- FORM FIELDS FOR NEW TERMINATION ---
  const [empId, setEmpId] = useState('');
  const [selectedResTypeCode, setSelectedResTypeCode] = useState('T01'); // Default Demissão sem Justa Causa
  const [resignationDate, setResignationDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [noticeType, setNoticeType] = useState<'Trabalhado' | 'Indenizado' | 'Dispensado'>('Indenizado');
  const [reasonNotes, setReasonNotes] = useState('');
  const [customCPF, setCustomCPF] = useState('');
  const [contractType, setContractType] = useState<'CLT' | 'Experiência' | 'Temporário' | 'PJ' | 'Estágio'>('CLT');

  // Interactive numeric variables for the calculation motor
  const [vacationVencidasDays, setVacationVencidasDays] = useState<number>(0);
  const [pendingExtraHours, setPendingExtraHours] = useState<number>(0);
  const [customCommissions, setCustomCommissions] = useState<number>(0);
  const [customBonuses, setCustomBonuses] = useState<number>(0);
  const [customAdditions, setCustomAdditions] = useState<number>(0); // Periculosidade / Insalubridade
  
  const [customAbsencesDays, setCustomAbsencesDays] = useState<number>(0);
  const [customAdvances, setCustomAdvances] = useState<number>(0);
  const [customLoans, setCustomLoans] = useState<number>(0);
  const [customOtherDeductions, setCustomOtherDeductions] = useState<number>(0);

  // --- DOCUMENT VIEWER STATE ---
  const [viewingDoc, setViewingDoc] = useState<{
    term: Termination;
    docType: 'TRCT' | 'Aviso Prévio' | 'Termo de Quitação' | 'Demonstrativo de Cálculos' | 'Comprovante de Pagamento';
  } | null>(null);

  // --- MULTI-TENANCY FILTERING ---
  const companyId = useMemo(() => {
    return currentUser?.companyId || 'company-1';
  }, [currentUser]);

  // Load custom collections simulating Firestore
  useEffect(() => {
    const loadFirestoreCollections = async () => {
      try {
        setLoadingCollections(true);
        // Load /configuracoes/tipos_rescisao
        const types = await firebaseService.db.getCollection<ResType>('RES_TYPES');
        setResTypes(types);

        // Load /eventos_rescisao
        const events = await firebaseService.db.getCollection<ResEvent>('RES_EVENTS');
        setResEvents(events);

        // Load /documentos_rescisao
        const docs = await firebaseService.db.getCollection<ResDocument>('RES_DOCS', companyId);
        setResDocs(docs);
      } catch (err) {
        console.error('Error loading termination sub-collections:', err);
      } finally {
        setLoadingCollections(false);
      }
    };
    loadFirestoreCollections();
  }, [companyId]);

  // --- ROLE-BASED ACCESS CONTROLS ---
  // MASTER SaaS: Can see all companies (we show all or active tenant data)
  // ADMIN EMPRESA: Full management & deletion
  // RH: Full management, calculate and print (deletion hidden or blocked)
  // GESTOR (role === 'Funcionário'): Only views their team/department, cannot calculate or delete
  const userEmployee = useMemo(() => {
    if (currentUser?.role === 'Funcionário' && currentUser?.employeeId) {
      return rawEmployees.find(e => e.id === currentUser.employeeId);
    }
    return null;
  }, [currentUser, rawEmployees]);

  const userDept = useMemo(() => {
    return userEmployee?.department || null;
  }, [userEmployee]);

  // Filter employees and terminations based on role permissions
  const filteredEmployees = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      // Gestor views only active employees in their department
      return rawEmployees.filter(e => e.department === userDept && e.status !== 'Desligado');
    }
    return rawEmployees.filter(e => e.status !== 'Desligado');
  }, [rawEmployees, currentUser, userDept]);

  const terminations = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      // Gestor views only terminations of employees in their department
      return rawTerminations.filter(term => term.department === userDept);
    }
    return rawTerminations;
  }, [rawTerminations, currentUser, userDept]);

  // List of active employees for selection dropdown
  const selectedEmployee = useMemo(() => {
    return rawEmployees.find(e => e.id === empId);
  }, [rawEmployees, empId]);

  // Set default values when selected employee changes
  useEffect(() => {
    if (selectedEmployee) {
      // Simulate random realistic CPF if not set
      const cpfRandom = customCPF || `341.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
      setCustomCPF(cpfRandom);
      
      // Auto pre-populate some benefits and hours
      // Get suggested values from employeeBenefits or timeRegisters if available
      setCustomCommissions(selectedEmployee.salary > 3000 ? 350 : 0);
      setPendingExtraHours(Math.floor(Math.random() * 10)); // simulated pending hours from point register
    } else {
      setCustomCPF('');
      setPendingExtraHours(0);
      setCustomCommissions(0);
    }
  }, [selectedEmployee]);

  // --- AUTOMATIC CALCULATION MOTOR ---
  // Real-time calculated values based on selected options and parameters
  const calcs = useMemo(() => {
    if (!selectedEmployee) return null;

    const baseSalary = selectedEmployee.salary;
    const admission = new Date(selectedEmployee.admissionDate);
    const resignation = new Date(resignationDate);
    const selectedResType = resTypes.find(t => t.code === selectedResTypeCode) || resTypes[0];

    // 1. Saldo de Salário (R001)
    // Formula: (Salary / 30) * days worked in final month
    const finalMonthDays = resignation.getDate();
    const saldoSalario = (baseSalary / 30) * finalMonthDays;

    // 2. Anos Trabalhados (for Notice Period increase)
    const timeDiff = resignation.getTime() - admission.getTime();
    const yearsWorked = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));

    // 3. Aviso Prévio CLT: 30 days basic + 3 days per complete year worked, max 90 days
    const totalNoticeDays = selectedResType?.permiteAvisoPrevio ? (30 + Math.min(60, yearsWorked * 3)) : 0;
    
    // Notice Pay (R002) - only if notice is "Indenizado"
    const avisoPrevioIndenizadoVal = noticeType === 'Indenizado' && selectedResType?.permiteAvisoPrevio
      ? (baseSalary / 30) * totalNoticeDays
      : 0;

    // Notice Pay Discounted (D003) - if voluntary resignation and employee is dispensado or indenizado by employee
    const avisoPrevioDescontadoVal = (selectedResTypeCode === 'T02' && noticeType === 'Dispensado')
      ? baseSalary
      : 0;

    // 4. Férias Vencidas (R003) + Proporcionais (R004) + 1/3 (R005)
    // Férias Vencidas based on days inputted
    const feriasVencidasValor = (baseSalary / 30) * vacationVencidasDays;

    // Férias Proporcionais: 1/12 per month since last work anniversary
    // Find last anniversary date in current cycle
    const lastAnniversary = new Date(resignation.getFullYear(), admission.getMonth(), admission.getDate());
    if (lastAnniversary > resignation) {
      lastAnniversary.setFullYear(lastAnniversary.getFullYear() - 1);
    }
    const daysSinceAnniversary = Math.round((resignation.getTime() - lastAnniversary.getTime()) / (1000 * 60 * 60 * 24));
    let monthsSinceAnniversary = Math.floor(daysSinceAnniversary / 30.4);
    const remainingDaysInMonth = daysSinceAnniversary % 30.4;
    if (remainingDaysInMonth >= 15) {
      monthsSinceAnniversary += 1;
    }
    const mesesFeriasProporcionais = Math.min(12, Math.max(0, monthsSinceAnniversary));
    const feriasProporcionaisValor = (baseSalary / 12) * mesesFeriasProporcionais;

    // 1/3 Constitucional (R005)
    const tercoConstitucionalValor = (feriasVencidasValor + feriasProporcionaisValor) / 3;

    // 5. 13º Salário Proporcional (R006)
    // Calculated based on calendar year worked months (from Jan 1st to resignation, or admission date if within current year)
    const startOfCurrentYear = new Date(resignation.getFullYear(), 0, 1);
    const effectiveStart13 = admission > startOfCurrentYear ? admission : startOfCurrentYear;
    
    // Total calendar days worked this year
    const daysWorkedThisYear = Math.round((resignation.getTime() - effectiveStart13.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let months13 = Math.floor(daysWorkedThisYear / 30.4);
    if (daysWorkedThisYear % 30.4 >= 15) {
      months13 += 1;
    }
    const meses13Proporcional = Math.min(12, Math.max(0, months13));
    const decimoTerceiroValor = (baseSalary / 12) * meses13Proporcional;

    // 6. Horas Extras (R007)
    const hourlyRate = baseSalary / 160;
    const horaExtraValor = pendingExtraHours * hourlyRate * 1.5;

    // 7. Event-based entries
    const comissaoValor = customCommissions;
    const bonificacaoValor = customBonuses;
    const adicionaisValor = customAdditions;

    // 8. DEDUCTIONS (Descontos)
    // Faltas (D004)
    const faltasValor = (baseSalary / 30) * customAbsencesDays;
    
    // Taxes base: Saldo salário + 13º + Horas extras + comissão - faltas
    const baseTributos = Math.max(0, saldoSalario + decimoTerceiroValor + horaExtraValor + comissaoValor - faltasValor);

    // INSS Progressive Calculation (D001)
    let inssValor = 0;
    if (baseTributos > 0) {
      if (baseTributos <= 1412.00) inssValor = baseTributos * 0.075;
      else if (baseTributos <= 2666.68) inssValor = (1412.00 * 0.075) + ((baseTributos - 1412.00) * 0.09);
      else if (baseTributos <= 4000.03) inssValor = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((baseTributos - 2666.68) * 0.12);
      else inssValor = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((baseTributos - 4000.03) * 0.14);
    }

    // IRRF Progressive Calculation (D002)
    let irrfValor = 0;
    const irrfBase = baseTributos - inssValor;
    if (irrfBase > 2259.20) {
      if (irrfBase <= 2826.65) irrfValor = (irrfBase * 0.075) - 169.44;
      else if (irrfBase <= 3751.05) irrfValor = (irrfBase * 0.15) - 381.44;
      else if (irrfBase <= 4664.68) irrfValor = (irrfBase * 0.225) - 662.77;
      else irrfValor = (irrfBase * 0.275) - 896.00;
    }

    // 9. FGTS calculations for display (Does not subtract from net payable but impacts company cost)
    const mesesTotaisTrabalhados = Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24 * 30.4)));
    const fgtsAcumuladoEstimado = baseSalary * 0.08 * mesesTotaisTrabalhados;
    
    let fgtsFineMultiplier = 0;
    if (selectedResType?.geraMultaFGTS) {
      if (selectedResTypeCode === 'T01') fgtsFineMultiplier = 0.40; // 40% for dismissal without cause
      else if (selectedResTypeCode === 'T03') fgtsFineMultiplier = 0.20; // 20% for mutual agreement
      else if (selectedResTypeCode === 'T06') fgtsFineMultiplier = 0.40; // 40% for early termination
    }
    const multaFGTSValor = fgtsAcumuladoEstimado * fgtsFineMultiplier;

    // TOTALS
    const totalProventos = saldoSalario + avisoPrevioIndenizadoVal + feriasVencidasValor + feriasProporcionaisValor + tercoConstitucionalValor + decimoTerceiroValor + horaExtraValor + comissaoValor + bonificacaoValor + adicionaisValor;
    const totalDescontos = inssValor + irrfValor + avisoPrevioDescontadoVal + faltasValor + customAdvances + customLoans + customOtherDeductions;
    const valorLiquido = totalProventos - totalDescontos;

    return {
      saldoSalario,
      avisoPrevioIndenizadoVal,
      avisoPrevioDescontadoVal,
      totalNoticeDays,
      yearsWorked,
      feriasVencidasValor,
      feriasProporcionaisValor,
      mesesFeriasProporcionais,
      tercoConstitucionalValor,
      decimoTerceiroValor,
      meses13Proporcional,
      horaExtraValor,
      comissaoValor,
      bonificacaoValor,
      adicionaisValor,
      faltasValor,
      inssValor,
      irrfValor,
      fgtsAcumuladoEstimado,
      multaFGTSValor,
      totalProventos,
      totalDescontos,
      valorLiquido
    };
  }, [selectedEmployee, selectedResTypeCode, resignationDate, noticeType, vacationVencidasDays, pendingExtraHours, customCommissions, customBonuses, customAdditions, customAbsencesDays, customAdvances, customLoans, customOtherDeductions, resTypes]);

  // --- SUBMIT CADASTRO / HOMOLOGAÇÃO ---
  const handleProcessTermination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId || !selectedEmployee || !calcs) {
      triggerToast('⚠️ Por favor, selecione um colaborador válido!');
      return;
    }

    const resTypeObj = resTypes.find(t => t.code === selectedResTypeCode);
    
    if (!window.confirm(`Tem certeza que deseja processar e homologar a rescisão contratual de ${selectedEmployee.name}? O status do funcionário será alterado para "Desligado".`)) {
      return;
    }

    const termId = `term-${Date.now()}`;

    // Standard record matching BOTH legacy UI and official Firestore specifications:
    const newTermination: Termination = {
      id: termId,
      employeeId: empId,
      employeeName: selectedEmployee.name,
      role: selectedEmployee.role,
      department: selectedEmployee.department,
      salary: selectedEmployee.salary,
      type: (resTypeObj?.name || selectedResTypeCode) as any,
      date: resignationDate,
      noticePeriod: noticeType,
      salaryBalance: calcs.saldoSalario,
      proportional13th: calcs.decimoTerceiroValor,
      proportionalVacation: calcs.feriasProporcionaisValor + calcs.tercoConstitucionalValor,
      fgtsFine: calcs.multaFGTSValor,
      totalDeductions: calcs.totalDescontos,
      netPayable: calcs.valorLiquido,
      status: 'Pago',
      createdAt: new Date().toISOString().split('T')[0],
      notes: reasonNotes || `Desligamento oficial homologado via GestRH.`,

      // Strict pt-BR Firestore properties
      funcionarioId: empId,
      dataAdmissao: selectedEmployee.admissionDate,
      dataDesligamento: resignationDate,
      tipoRescisao: resTypeObj?.name || selectedResTypeCode,
      motivo: reasonNotes || 'Motivo de desligamento padrão',
      salarioBase: selectedEmployee.salary,
      avisoPrevio: noticeType,
      ferias: calcs.feriasProporcionaisValor + calcs.tercoConstitucionalValor,
      decimoTerceiro: calcs.decimoTerceiroValor,
      proventos: calcs.totalProventos,
      descontos: calcs.totalDescontos,
      valorLiquido: calcs.valorLiquido,
      usuarioResponsavel: currentUser?.name || 'Gestor de RH',
      dataCriacao: new Date().toISOString().split('T')[0],
      companyId: companyId
    };

    try {
      // 1. Direct save of termination into simulated Firestore
      await firebaseService.db.saveDoc('TERMINATIONS', newTermination, companyId);
      
      // 2. Automatically generate the 5 official documents requested:
      const docsToSave: ResDocument[] = [
        { id: `doc-${termId}-trct`, rescisaoId: termId, tipoDocumento: 'TRCT', arquivoPDF: 'trct_official_form_pdf', dataGeracao: new Date().toISOString().split('T')[0], companyId },
        { id: `doc-${termId}-aviso`, rescisaoId: termId, tipoDocumento: 'Aviso Prévio', arquivoPDF: 'aviso_previo_document_pdf', dataGeracao: new Date().toISOString().split('T')[0], companyId },
        { id: `doc-${termId}-quitacao`, rescisaoId: termId, tipoDocumento: 'Termo de Quitação', arquivoPDF: 'termo_quitacao_document_pdf', dataGeracao: new Date().toISOString().split('T')[0], companyId },
        { id: `doc-${termId}-demonstrativo`, rescisaoId: termId, tipoDocumento: 'Demonstrativo de Cálculos', arquivoPDF: 'demonstrativo_calculos_pdf', dataGeracao: new Date().toISOString().split('T')[0], companyId },
        { id: `doc-${termId}-comprovante`, rescisaoId: termId, tipoDocumento: 'Comprovante de Pagamento', arquivoPDF: 'comprovante_pagamento_pdf', dataGeracao: new Date().toISOString().split('T')[0], companyId }
      ];

      for (const doc of docsToSave) {
        await firebaseService.db.saveDoc('RES_DOCS', doc, companyId);
      }
      
      // Update local states
      setResDocs(prev => [...prev, ...docsToSave]);
      onUpdateTerminations([...rawTerminations, newTermination]);

      // 3. Update employee status to 'Desligado'
      const updatedEmployees = rawEmployees.map(emp => {
        if (emp.id === empId) {
          return { ...emp, status: 'Desligado' as const };
        }
        return emp;
      });
      onUpdateEmployees(updatedEmployees);

      // 4. Auto-block user account point access on termination
      try {
        const users = await firebaseService.db.getCollection<UserAccount>('USERS');
        const linkedUser = users.find(u => u.employeeId === empId || u.email.trim().toLowerCase() === selectedEmployee.email.trim().toLowerCase());
        if (linkedUser) {
          const nowStr = `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`;
          const blockedUser: UserAccount = {
            ...linkedUser,
            status: 'Bloqueado',
            permitirAplicativoPonto: false,
            blockedDate: nowStr,
            logs: [
              ...(linkedUser.logs || []),
              {
                id: `log-${Date.now()}`,
                action: 'Bloqueio',
                timestamp: nowStr,
                performedBy: currentUser?.name || 'Sistema (Desligamento)',
                details: `Bloqueio automático de acesso ao ponto devido ao desligamento/rescisão do funcionário.`
              }
            ]
          };
          await firebaseService.db.saveDoc('USERS', blockedUser);
        }
      } catch (err) {
        console.error('Error auto-blocking terminated employee user account:', err);
      }

      // Clean up form and redirect to history
      setSelectedTerm(newTermination);
      setActiveTab('rescisao');
      setEmpId('');
      setReasonNotes('');
      setVacationVencidasDays(0);
      setCustomAbsencesDays(0);
      setCustomAdvances(0);
      setCustomLoans(0);
      setCustomOtherDeductions(0);
      
      triggerToast(`✓ Rescisão processada e 5 documentos salvos no Firestore com sucesso!`);
    } catch (err) {
      console.error(err);
      triggerToast('❌ Erro ao homologar a rescisão no Firebase.');
    }
  };

  // --- DELETE TERMINATION (RE-ACTIVATE EMPLOYEE) ---
  const handleDeleteTermination = async (id: string, employeeId: string, name: string) => {
    if (currentUser?.role === 'RH') {
      triggerToast('⚠️ Usuários com nível de RH não têm permissão para deletar homologações.');
      return;
    }

    if (!window.confirm(`Atenção: Excluir o registro de rescisão de ${name}? O status do funcionário será reativado para "Ativo" no sistema.`)) {
      return;
    }

    try {
      // 1. Delete termination doc
      await firebaseService.db.deleteDoc('TERMINATIONS', id);
      
      // 2. Delete linked documents
      const companyDocs = resDocs.filter(d => d.rescisaoId === id);
      for (const doc of companyDocs) {
        await firebaseService.db.deleteDoc('RES_DOCS', doc.id);
      }
      
      setResDocs(prev => prev.filter(d => d.rescisaoId !== id));
      onUpdateTerminations(rawTerminations.filter(t => t.id !== id));

      // 3. Reactivate employee
      const updatedEmployees = rawEmployees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, status: 'Ativo' as const };
        }
        return emp;
      });
      onUpdateEmployees(updatedEmployees);

      setSelectedTerm(null);
      triggerToast(`✓ Homologação excluída. ${name} reativado com sucesso!`);
    } catch (err) {
      console.error(err);
      triggerToast('❌ Erro ao deletar do Firebase.');
    }
  };

  // --- SEARCH FILTERING ---
  const searchedTerms = useMemo(() => {
    return terminations.filter(t => 
      t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [terminations, searchQuery]);

  // --- DASHBOARD MATHS ---
  const stats = useMemo(() => {
    const activeTerms = terminations; // Multi-tenant filtered
    
    // Total spent
    const totalPaid = activeTerms.reduce((acc, curr) => acc + (curr.netPayable || curr.valorLiquido || 0), 0);
    const count = activeTerms.length;
    const avgCost = count > 0 ? totalPaid / count : 0;

    // Resignations in the current month (July 2026)
    const currentMonthTerms = activeTerms.filter(t => {
      const d = t.date || t.dataDesligamento;
      return d && d.startsWith('2026-07');
    });

    // Reason frequency counting
    const reasonCounts: Record<string, number> = {};
    activeTerms.forEach(t => {
      const typeStr = t.type || t.tipoRescisao || 'Outros';
      reasonCounts[typeStr] = (reasonCounts[typeStr] || 0) + 1;
    });
    const reasonChartData = Object.keys(reasonCounts).map(k => ({
      name: k,
      value: reasonCounts[k]
    }));

    // Cost by department
    const deptCosts: Record<string, number> = {};
    activeTerms.forEach(t => {
      const deptStr = t.department || 'Outros';
      const costVal = t.netPayable || t.valorLiquido || 0;
      deptCosts[deptStr] = (deptCosts[deptStr] || 0) + costVal;
    });
    const deptChartData = Object.keys(deptCosts).map(k => ({
      name: k,
      'Custo Total': deptCosts[k]
    }));

    return {
      totalPaid,
      count,
      avgCost,
      currentMonthCount: currentMonthTerms.length,
      reasonChartData,
      deptChartData
    };
  }, [terminations]);

  const COLORS = ['#0f172a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6" id="termination-module-root">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
            <UserX className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-extrabold text-lg text-slate-900">Módulo de Rescisão e Desligamento</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <Building2 className="h-3 w-3 shrink-0" />
                <span>Multi-tenant</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Gestão de offboarding, homologações com cálculos fiscais automáticos e geração de TRCT.</p>
          </div>
        </div>

        {/* ROLE BADGE */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            <span>Nível de Acesso:</span>
            <span className="font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded-md uppercase text-[10px]">
              {currentUser?.role || 'RH'}
            </span>
          </div>
        </div>
      </div>

      {/* MULTI-TAB NAVIGATION BAR */}
      <div className="flex overflow-x-auto space-x-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Dashboard de Offboarding</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('rescisao');
            if (terminations.length > 0 && !selectedTerm) {
              setSelectedTerm(terminations[0]);
            }
          }}
          className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'rescisao' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <UserX className="h-4 w-4" />
          <span>Histórico & Documentos</span>
        </button>
        
        {currentUser?.role !== 'Funcionário' && (
          <button
            onClick={() => setActiveTab('novo')}
            className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'novo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Cálculo Rescisório</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('tabelas')}
          className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all ${activeTab === 'tabelas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Sliders className="h-4 w-4" />
          <span>Tabelas de Configuração</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD DE OFFBOARDING */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6" id="dashboard-tab-content">
          {/* STATS COUNTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Rescisões no Mês</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{stats.currentMonthCount}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Ref: Julho/2026</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Custo Total Homologado</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-extrabold text-rose-600">
                  R$ {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Funcionários Desligados</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{stats.count}</span>
                <span className="text-[10px] text-slate-400 font-semibold">Total histórico</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Custo Médio de Saída</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-xl font-extrabold text-slate-950">
                  R$ {stats.avgCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* CHARTS CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reason chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[320px]">
              <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Motivos mais Comuns de Desligamento</h4>
              <div className="flex-1 min-h-0">
                {stats.reasonChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    Nenhum desligamento cadastrado neste tenant.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.reasonChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.reasonChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} colaborador(es)`, 'Frequência']} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Cost by Department */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[320px]">
              <h4 className="font-display font-bold text-sm text-slate-800 mb-4">Impacto Financeiro Rescisório por Setor</h4>
              <div className="flex-1 min-h-0">
                {stats.deptChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    Nenhum dado financeiro para exibir.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.deptChartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Total Pago']} />
                      <Bar dataKey="Custo Total" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* SYSTEM SECURITY NOTICE */}
          <div className="bg-[#0b1d33]/5 border border-slate-200/50 p-4 rounded-xl flex items-start space-x-3">
            <Info className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>Multi-empresa SaaS Ativo:</strong> Todos os valores listados acima estão rigorosamente isolados na empresa <strong>{currentUser?.companyId || 'company-1'}</strong>. Nenhuma outra empresa cliente do SaaS RH tem visibilidade ou cruzamento sobre essas rescisões.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO & DOCUMENTOS */}
      {activeTab === 'rescisao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="history-tab-content">
          {/* SIDEBAR LIST */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col h-[650px]">
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar desligamento por nome..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {searchedTerms.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  Nenhuma rescisão encontrada com os filtros atuais.
                </div>
              ) : (
                searchedTerms.map(term => (
                  <button
                    key={term.id}
                    onClick={() => setSelectedTerm(term)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col space-y-2 cursor-pointer ${selectedTerm?.id === term.id ? 'bg-slate-50 border-rose-500 shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{term.employeeName}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                        Desligado
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className="truncate max-w-[120px]">{term.type || term.tipoRescisao}</span>
                      <span>&bull;</span>
                      <span>{(term.date || term.dataDesligamento || '').split('-').reverse().join('/')}</span>
                    </div>
                    <div className="text-[10px] text-slate-950 font-bold font-mono">
                      Líquido: R$ {Number(term.netPayable || term.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* CALCULATED STATEMENT BLOCK */}
          <div className="lg:col-span-2">
            {selectedTerm ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 h-[650px] overflow-y-auto">
                <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-slate-950">{selectedTerm.employeeName}</h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {selectedTerm.role} &bull; Setor: {selectedTerm.department}
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 tracking-wide uppercase">
                    Homologado no Firebase
                  </span>
                </div>

                {/* DETAILS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações base */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                    <h5 className="font-bold text-slate-900 uppercase text-[9px] tracking-wider mb-2 flex items-center space-x-1">
                      <Info className="h-3.5 w-3.5 text-slate-500" />
                      <span>Metadados Trabalhistas</span>
                    </h5>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tipo de Rescisão:</span>
                      <span className="font-bold text-slate-800">{selectedTerm.type || selectedTerm.tipoRescisao}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Desligamento:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {(selectedTerm.date || selectedTerm.dataDesligamento || '').split('-').reverse().join('/')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Aviso Prévio:</span>
                      <span className="font-bold text-slate-800">{selectedTerm.noticePeriod || selectedTerm.avisoPrevio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Salário Base:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        R$ {Number(selectedTerm.salary || selectedTerm.salarioBase || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Responsável:</span>
                      <span className="font-semibold text-slate-700">{selectedTerm.usuarioResponsavel || 'Sistema'}</span>
                    </div>
                  </div>

                  {/* Calculations breakdown list */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-900 uppercase text-[9px] tracking-wider mb-2 flex items-center space-x-1">
                      <Calculator className="h-3.5 w-3.5 text-slate-500" />
                      <span>Resumo Consolidado</span>
                    </h5>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Proventos (+):</span>
                      <span className="font-bold text-slate-800 font-mono">
                        R$ {Number(selectedTerm.proventos || selectedTerm.salaryBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Descontos (-):</span>
                      <span className="font-bold text-rose-600 font-mono">
                        - R$ {Number(selectedTerm.descontos || selectedTerm.totalDeductions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {selectedTerm.fgtsFine ? (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Multa FGTS Rescisório:</span>
                        <span className="font-bold text-emerald-600 font-mono">
                          + R$ {selectedTerm.fgtsFine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : null}

                    <div className="flex justify-between border-t border-slate-200 pt-2.5 text-emerald-800 font-extrabold bg-emerald-50/50 p-2 rounded-lg">
                      <span>Valor Líquido Recebido:</span>
                      <span className="font-mono">
                        R$ {Number(selectedTerm.netPayable || selectedTerm.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AUTOMATICALLY GENERATED DOCUMENTS SHEETS */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <FileText className="h-4.5 w-4.5 text-rose-600" />
                    <span>Documentos Oficiais Gerados ({resDocs.filter(d => d.rescisaoId === selectedTerm.id).length || 5})</span>
                  </h4>
                  <p className="text-slate-400 text-xs">Os 5 documentos da homologação foram compilados em tempo real e persistidos no Firebase Storage.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['TRCT', 'Aviso Prévio', 'Termo de Quitação', 'Demonstrativo de Cálculos', 'Comprovante de Pagamento'].map((docType) => {
                      return (
                        <div key={docType} className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-rose-300 transition-colors">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                              <FileText className="h-4 w-4 text-rose-600" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 block truncate">{docType}</span>
                              <span className="text-[10px] text-slate-400">PDF Homologado</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setViewingDoc({ term: selectedTerm, docType: docType as any })}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] px-3 py-2 rounded-lg border border-slate-200 shrink-0"
                          >
                            Visualizar / Imprimir
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* EXCLUDE ACTION PANEL */}
                {currentUser?.role !== 'Funcionário' && (
                  <div className="border-t border-slate-100 pt-6 flex justify-end">
                    <button
                      onClick={() => handleDeleteTermination(selectedTerm.id, selectedTerm.employeeId, selectedTerm.employeeName)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Excluir e Reativar Colaborador</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center h-[650px] flex flex-col justify-center items-center">
                <UserX className="h-10 w-10 text-slate-300 mb-4" />
                <h3 className="font-display font-bold text-base text-slate-800">Selecione uma rescisão</h3>
                <p className="text-slate-400 text-xs mt-1">Navegue pelas rescisões homologadas de seu tenant à esquerda para acessar cálculos e imprimir documentos.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOVO CÁLCULO RESCISÓRIO */}
      {activeTab === 'novo' && currentUser?.role !== 'Funcionário' && (
        <form onSubmit={handleProcessTermination} className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in fade-in duration-200" id="new-calculation-tab">
          
          {/* LEFT FORM PARAMS */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <h3 className="font-display font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">Ficha de Desligamento</h3>
            
            {/* COLLABORATOR SELECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Colaborador Ativo *</label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Selecione um funcionário ativo...</option>
                  {filteredEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Rescisão *</label>
                <select
                  value={selectedResTypeCode}
                  onChange={(e) => setSelectedResTypeCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {resTypes.map(t => (
                    <option key={t.id} value={t.code}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DYNAMIC READ-ONLY EMPLOYEE INFO */}
            {selectedEmployee && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">CPF do Colaborador:</span>
                  <input 
                    type="text" 
                    value={customCPF} 
                    onChange={(e) => setCustomCPF(e.target.value)} 
                    className="font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Cargo / Departamento:</span>
                  <span className="font-bold text-slate-900">{selectedEmployee.role} ({selectedEmployee.department})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Data de Admissão:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedEmployee.admissionDate.split('-').reverse().join('/')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Salário Base:</span>
                  <span className="font-bold text-slate-900 font-mono">R$ {selectedEmployee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {/* DATES & NOTICES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data de Desligamento *</label>
                <input 
                  type="date" 
                  value={resignationDate}
                  onChange={(e) => setResignationDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aviso Prévio *</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Indenizado">Indenizado (Pago)</option>
                  <option value="Trabalhado">Trabalhado</option>
                  <option value="Dispensado">Dispensado</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Contrato</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="CLT">CLT Determinado</option>
                  <option value="Experiência">Experiência</option>
                  <option value="Temporário">Temporário</option>
                  <option value="PJ">PJ (Simulado)</option>
                  <option value="Estágio">Estágio</option>
                </select>
              </div>
            </div>

            {/* INTERACTIVE EVENT CONTROLS (PROVENTOS & DESCONTOS VARIABLES) */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Variáveis e Eventos do Mês</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PROVENTOS inputs */}
                <div className="space-y-3 p-4 bg-[#10b981]/5 border border-[#10b981]/10 rounded-xl">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase block tracking-wider font-mono">Verbas / Adicionais (+)</span>
                  
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Férias Vencidas (Dias)</label>
                      <input 
                        type="number" 
                        value={vacationVencidasDays}
                        onChange={(e) => setVacationVencidasDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                        max={30}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Horas Extras Pendentes</label>
                      <input 
                        type="number" 
                        value={pendingExtraHours}
                        onChange={(e) => setPendingExtraHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Comissões (R$)</label>
                      <input 
                        type="number" 
                        value={customCommissions}
                        onChange={(e) => setCustomCommissions(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Prêmios / Gratificações (R$)</label>
                      <input 
                        type="number" 
                        value={customBonuses}
                        onChange={(e) => setCustomBonuses(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* DESCONTOS inputs */}
                <div className="space-y-3 p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-rose-800 uppercase block tracking-wider font-mono">Deduções / Descontos (-)</span>
                  
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Faltas no Período (Dias)</label>
                      <input 
                        type="number" 
                        value={customAbsencesDays}
                        onChange={(e) => setCustomAbsencesDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Adiantamento Mensal (R$)</label>
                      <input 
                        type="number" 
                        value={customAdvances}
                        onChange={(e) => setCustomAdvances(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Empréstimos Consignados</label>
                      <input 
                        type="number" 
                        value={customLoans}
                        onChange={(e) => setCustomLoans(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Outros Descontos (R$)</label>
                      <input 
                        type="number" 
                        value={customOtherDeductions}
                        onChange={(e) => setCustomOtherDeductions(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REASON TEXT FIELD */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Justificativa / Motivo detalhado</label>
              <textarea 
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
                placeholder="Ex: Demissão amigável motivada por reestruturação corporativa do setor comercial."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs h-16 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>

          {/* RIGHT RECT REAL-TIME STATEMENT */}
          <div className="lg:col-span-2 space-y-4">
            {calcs && selectedEmployee ? (
              <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-6 shadow-xl sticky top-4">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase font-mono tracking-widest block">Simulador Rescisório Integrado</span>
                  <h4 className="text-sm font-bold mt-1 text-slate-100">{selectedEmployee.name}</h4>
                  <p className="text-[10px] text-slate-400">{selectedEmployee.role}</p>
                </div>

                {/* CALCULATIONS DISPLAY */}
                <div className="space-y-3.5 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saldo Salário ({resignationDate.split('-')[2]} dias) [R001]:</span>
                    <span className="font-mono text-slate-200">R$ {calcs.saldoSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {calcs.avisoPrevioIndenizadoVal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Aviso Prévio ({calcs.totalNoticeDays} dias) [R002]:</span>
                      <span className="font-mono">+ R$ {calcs.avisoPrevioIndenizadoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {calcs.feriasVencidasValor > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Férias Vencidas ({vacationVencidasDays} dias) [R003]:</span>
                      <span className="font-mono text-slate-200">R$ {calcs.feriasVencidasValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Férias Prop. ({calcs.mesesFeriasProporcionais}/12 avos) [R004]:</span>
                    <span className="font-mono text-slate-200">R$ {calcs.feriasProporcionaisValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">1/3 Constitucional Férias [R005]:</span>
                    <span className="font-mono text-slate-200">R$ {calcs.tercoConstitucionalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">13º Proporcional ({calcs.meses13Proporcional}/12 avos) [R006]:</span>
                    <span className="font-mono text-slate-200">R$ {calcs.decimoTerceiroValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {calcs.horaExtraValor > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Horas Extras ({pendingExtraHours}h) [R007]:</span>
                      <span className="font-mono">+ R$ {calcs.horaExtraValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* TAXES & DEDUCTIONS */}
                  <div className="border-t border-slate-800 pt-3.5 space-y-2 text-rose-400">
                    <div className="flex justify-between text-[11px]">
                      <span>Contribuição INSS [D001]:</span>
                      <span className="font-mono">- R$ {calcs.inssValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {calcs.irrfValor > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span>Imposto de Renda IRRF [D002]:</span>
                        <span className="font-mono">- R$ {calcs.irrfValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {calcs.avisoPrevioDescontadoVal > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span>Aviso Prévio Descontado [D003]:</span>
                        <span className="font-mono">- R$ {calcs.avisoPrevioDescontadoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {calcs.faltasValor > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span>Faltas ({customAbsencesDays} dias) [D004]:</span>
                        <span className="font-mono">- R$ {calcs.faltasValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {(customAdvances + customLoans + customOtherDeductions) > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span>Adiantamentos & Outros [D005]:</span>
                        <span className="font-mono">- R$ {(customAdvances + customLoans + customOtherDeductions).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>

                  {/* FGTS FINE ONLY FOR DEMISSÃO SEM JUSTA CAUSA */}
                  {calcs.multaFGTSValor > 0 && (
                    <div className="border-t border-slate-800 pt-3 text-slate-400 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>FGTS Estimado Acumulado:</span>
                        <span className="font-mono">R$ {calcs.fgtsAcumuladoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Multa Rescisória (40%):</span>
                        <span className="font-mono">R$ {calcs.multaFGTSValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  {/* NET TOTAL */}
                  <div className="border-t border-slate-800 pt-4 flex justify-between text-sm font-extrabold text-emerald-400 bg-slate-800/50 p-3 rounded-xl">
                    <span>LÍQUIDO A PAGAR:</span>
                    <span className="font-mono">R$ {calcs.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* HOMOLOGAR ACTION */}
                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-rose-600/15 cursor-pointer"
                >
                  Confirmar e Homologar Rescisão
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-400 rounded-2xl p-8 text-center h-[350px] flex flex-col justify-center items-center border border-slate-800">
                <Calculator className="h-8 w-8 text-slate-700 mb-3" />
                <h4 className="font-bold text-sm text-slate-200">Aguardando Seleção</h4>
                <p className="text-[11px] mt-1 text-slate-500">Selecione um colaborador à esquerda para ver a simulação rescisória instantânea em tempo real com regras da CLT.</p>
              </div>
            )}
          </div>
        </form>
      )}

      {/* TAB 4: CONFIGURAÇÕES RESCISÓRIAS */}
      {activeTab === 'tabelas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="configs-tab-content">
          
          {/* TIPOS DE RESCISÃO */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <Building2 className="h-4.5 w-4.5 text-emerald-600" />
                <span>Tipos de Rescisão (/configuracoes/tipos_rescisao)</span>
              </h3>
              <p className="text-slate-400 text-[10px] mt-0.5">Parâmetros tributários e previdenciários homologados para homologações.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Cod</th>
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">FGTS Saque</th>
                    <th className="py-3 px-4">Multa FGTS</th>
                    <th className="py-3 px-4">Seguro Desemp</th>
                    <th className="py-3 px-4">Aviso Prev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {resTypes.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{t.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.geraFGTS ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {t.geraFGTS ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.geraMultaFGTS ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {t.geraMultaFGTS ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.geraSeguroDesemprego ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {t.geraSeguroDesemprego ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.permiteAvisoPrevio ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {t.permiteAvisoPrevio ? 'Sim' : 'Não'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EVENTOS DE RESCISÃO */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <Sliders className="h-4.5 w-4.5 text-rose-600" />
                <span>Relação de Eventos Rescisórios (/eventos_rescisao)</span>
              </h3>
              <p className="text-slate-400 text-[10px] mt-0.5">Eventos oficiais de Provento e Desconto cadastrados no motor fiscal.</p>
            </div>

            <div className="overflow-x-auto h-[450px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100 sticky top-0">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Descrição do Evento</th>
                    <th className="py-3 px-4">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {resEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{ev.code}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{ev.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{ev.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold text-[9px] px-2 py-0.5 rounded-full ${ev.type === 'Provento' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {ev.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCUMENT PRINT PREVIEW MODAL --- */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-4xl w-full p-6 shadow-2xl relative flex flex-col h-[90vh] print:h-auto print:shadow-none print:border-none print:p-0">
            
            {/* Modal actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 print:hidden">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-rose-600" />
                <h3 className="font-display font-extrabold text-slate-900 text-sm">
                  Visualização de Documento Oficial Homologado ({viewingDoc.docType})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT BODY - STYLED TO PRINT PERFECTLY IN A4 */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 border border-slate-200 rounded-xl mt-4 print:bg-white print:border-none print:p-0 print:m-0 font-serif text-slate-900">
              <div className="max-w-[700px] mx-auto bg-white p-10 border border-slate-200/50 min-h-[900px] shadow-sm print:shadow-none print:border-none print:p-0">
                
                {/* HEADER LOGO */}
                <div className="text-center space-y-2 border-b-2 border-slate-950 pb-6 mb-6">
                  <h1 className="text-xl font-extrabold uppercase tracking-wide">MINISTÉRIO DO TRABALHO E EMPREGO</h1>
                  <h2 className="text-sm font-bold uppercase text-slate-600">SISTEMA GESTRH SAAS DE RECURSOS HUMANOS</h2>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                    EMPRESA CLIENTE: {currentUser?.companyId === 'company-2' ? 'Tech Solutions Corp' : 'Rafaela Lourenço RH & GestRH'} &bull; CNPJ: {currentUser?.companyId === 'company-2' ? '98.765.432/0001-10' : '12.345.678/0001-90'}
                  </p>
                </div>

                {/* --- 1. TRCT PRINT --- */}
                {viewingDoc.docType === 'TRCT' && (
                  <div className="space-y-6 text-xs">
                    <div className="bg-slate-100 p-2 font-bold text-center border border-slate-950 text-[11px] uppercase">
                      TERMO DE RESCISÃO DO CONTRATO DE TRABALHO (TRCT)
                    </div>

                    {/* IDENTIFICATION BLOCKS */}
                    <div className="border border-slate-950 divide-y divide-slate-950">
                      <div className="grid grid-cols-2 divide-x divide-slate-950 p-2 font-bold uppercase text-[9px] bg-slate-50">
                        <div>01 CNPJ/CEI: <span className="font-mono ml-2">{currentUser?.companyId === 'company-2' ? '98.765.432/0001-10' : '12.345.678/0001-90'}</span></div>
                        <div>02 Razão Social: <span className="ml-2">{currentUser?.companyId === 'company-2' ? 'Tech Solutions Corp' : 'Rafaela Lourenço RH & GestRH'}</span></div>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-slate-950 p-2 font-bold uppercase text-[9px]">
                        <div className="col-span-2">03 Nome do Colaborador: <span className="ml-2 font-extrabold">{viewingDoc.term.employeeName}</span></div>
                        <div>04 CPF: <span className="font-mono ml-2">341.405.803-91</span></div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-950 p-2 font-bold uppercase text-[9px]">
                        <div>05 Cargo: <span className="ml-2">{viewingDoc.term.role}</span></div>
                        <div>06 Setor: <span className="ml-2">{viewingDoc.term.department}</span></div>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-slate-950 p-2 font-bold uppercase text-[9px] bg-slate-50">
                        <div>07 Admissão: <span className="font-mono ml-2">{(viewingDoc.term.dataAdmissao || '15/03/2023').split('-').reverse().join('/')}</span></div>
                        <div>08 Afastamento: <span className="font-mono ml-2">{(viewingDoc.term.date || '').split('-').reverse().join('/')}</span></div>
                        <div>09 Causa Afastamento: <span className="ml-2">{viewingDoc.term.type}</span></div>
                      </div>
                    </div>

                    {/* ITEMIZED CALCULATIONS TABLE */}
                    <div className="space-y-2">
                      <div className="font-bold border-b border-slate-950 uppercase text-[10px] pb-1">COMPOSIÇÃO DAS VERBAS RESCISÓRIAS</div>
                      <table className="w-full text-left text-[11px] border border-slate-950 border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-950 uppercase font-bold text-[9px]">
                            <th className="py-2 px-3 border-r border-slate-950">Rúbrica</th>
                            <th className="py-2 px-3 border-r border-slate-950">Descrição do Evento</th>
                            <th className="py-2 px-3 text-right">Valor Líquido</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-950">
                          <tr>
                            <td className="py-1.5 px-3 border-r border-slate-950 font-mono">R001</td>
                            <td className="py-1.5 px-3 border-r border-slate-950">Saldo Salário</td>
                            <td className="py-1.5 px-3 text-right font-mono">R$ {Number(viewingDoc.term.salaryBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 border-r border-slate-950 font-mono">R004</td>
                            <td className="py-1.5 px-3 border-r border-slate-950">Férias Proporcionais + Terço Constitucional</td>
                            <td className="py-1.5 px-3 text-right font-mono">R$ {Number(viewingDoc.term.proportionalVacation || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 border-r border-slate-950 font-mono">R006</td>
                            <td className="py-1.5 px-3 border-r border-slate-950">13º Salário Proporcional</td>
                            <td className="py-1.5 px-3 text-right font-mono">R$ {Number(viewingDoc.term.proportional13th || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          {viewingDoc.term.fgtsFine ? (
                            <tr>
                              <td className="py-1.5 px-3 border-r border-slate-950 font-mono">R005</td>
                              <td className="py-1.5 px-3 border-r border-slate-950">Multa Rescisória de FGTS</td>
                              <td className="py-1.5 px-3 text-right font-mono">R$ {viewingDoc.term.fgtsFine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ) : null}
                          <tr className="bg-rose-50/50">
                            <td className="py-1.5 px-3 border-r border-slate-950 font-mono text-rose-700">D001/02</td>
                            <td className="py-1.5 px-3 border-r border-slate-950 text-rose-700 font-bold">Deduções Fiscais (INSS/IRRF)</td>
                            <td className="py-1.5 px-3 text-right font-mono text-rose-700">- R$ {Number(viewingDoc.term.totalDeductions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                          <tr className="bg-slate-100 font-bold">
                            <td colSpan={2} className="py-2.5 px-3 border-r border-slate-950 uppercase text-[10px]">VALOR LÍQUIDO RESCISÓRIO</td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-950">
                              R$ {Number(viewingDoc.term.netPayable || viewingDoc.term.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SIGNATURE FIELDS */}
                    <div className="grid grid-cols-2 gap-8 pt-12">
                      <div className="border-t border-slate-950 pt-3 text-center text-[10px]">
                        <span className="font-bold block uppercase">{currentUser?.companyId === 'company-2' ? 'Tech Solutions Corp' : 'Rafaela Lourenço RH & GestRH'}</span>
                        <span>Assinatura do Empregador</span>
                      </div>
                      <div className="border-t border-slate-950 pt-3 text-center text-[10px]">
                        <span className="font-bold block uppercase">{viewingDoc.term.employeeName}</span>
                        <span>Assinatura do Colaborador</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 2. AVISO PRÉVIO PRINT --- */}
                {viewingDoc.docType === 'Aviso Prévio' && (
                  <div className="space-y-6 text-xs text-justify font-serif">
                    <div className="bg-slate-100 p-2 font-bold text-center border border-slate-950 text-[11px] uppercase">
                      COMUNICADO DE AVISO PRÉVIO {viewingDoc.term.noticePeriod === 'Indenizado' ? 'INDENIZADO' : 'TRABALHADO'}
                    </div>

                    <p className="font-mono text-right font-bold text-slate-500">São Paulo, {(viewingDoc.term.date || '').split('-').reverse().join('/')}</p>

                    <p className="leading-relaxed">
                      Ao Sr(a). <strong>{viewingDoc.term.employeeName}</strong>,<br />
                      CPF: 341.405.803-91.
                    </p>

                    <p className="leading-relaxed">
                      Comunicamos que, por decisão administrativa da empresa, seus serviços profissionais contratados em <strong>{(viewingDoc.term.dataAdmissao || '15/03/2023').split('-').reverse().join('/')}</strong> deixarão de ser necessários a partir de <strong>{(viewingDoc.term.date || '').split('-').reverse().join('/')}</strong>, encerrando-se assim o seu contrato individual de trabalho.
                    </p>

                    <p className="leading-relaxed">
                      De acordo com a legislação em vigor (Artigo 487 da CLT), a empresa optou pela dispensa do cumprimento de suas atividades funcionais sob regime de <strong>Aviso Prévio {viewingDoc.term.noticePeriod}</strong>. Os haveres rescisórios de lei serão pagos e homologados nos prazos fixados pela CLT.
                    </p>

                    <p className="leading-relaxed">
                      Solicitamos o seu comparecimento ao departamento pessoal para recolhimento e entrega de sua carteira de trabalho (CTPS) e regularização de homologação.
                    </p>

                    <div className="grid grid-cols-2 gap-8 pt-16">
                      <div className="border-t border-slate-950 pt-3 text-center text-[10px]">
                        <span className="font-bold block uppercase">{currentUser?.companyId === 'company-2' ? 'Tech Solutions Corp' : 'Rafaela Lourenço RH & GestRH'}</span>
                        <span>Assinatura do Empregador</span>
                      </div>
                      <div className="border-t border-slate-950 pt-3 text-center text-[10px]">
                        <span className="font-bold block uppercase">{viewingDoc.term.employeeName}</span>
                        <span>Ciente do Colaborador</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 3. TERMO DE QUITAÇÃO PRINT --- */}
                {viewingDoc.docType === 'Termo de Quitação' && (
                  <div className="space-y-6 text-xs text-justify">
                    <div className="bg-slate-100 p-2 font-bold text-center border border-slate-950 text-[11px] uppercase">
                      TERMO DE QUITAÇÃO DE CONTRATO DE TRABALHO
                    </div>

                    <p className="leading-relaxed">
                      Declaramos, para os devidos fins de direito, que o colaborador <strong>{viewingDoc.term.employeeName}</strong> recebeu em sua conta corrente, nas datas fiscais de lei, a quantia líquida de <strong>R$ {Number(viewingDoc.term.netPayable || viewingDoc.term.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>, correspondente à quitação das verbas rescisórias declaradas em seu Termo de Rescisão (TRCT).
                    </p>

                    <p className="leading-relaxed">
                      O colaborador outorga à empresa plena, geral e irrevogável quitação quanto aos títulos fiscais e trabalhistas calculados no demonstrativo, sem mais nada a reclamar a qualquer título sobre o contrato de trabalho extinto na data de <strong>{(viewingDoc.term.date || '').split('-').reverse().join('/')}</strong>.
                    </p>

                    <p className="font-bold text-center pt-8 font-mono">São Paulo, {(viewingDoc.term.date || '').split('-').reverse().join('/')}</p>

                    <div className="grid grid-cols-2 gap-8 pt-12">
                      <div className="border-t border-slate-950 pt-3 text-center text-[10px]">
                        <span className="font-bold block uppercase">{currentUser?.companyId === 'company-2' ? 'Tech Solutions Corp' : 'Rafaela Lourenço RH & GestRH'}</span>
                        <span>Assinatura do Empregador</span>
                      </div>
                      <div className="border-t border-slate-950 pt-3 text-center text-[10px]">
                        <span className="font-bold block uppercase">{viewingDoc.term.employeeName}</span>
                        <span>Assinatura do Colaborador</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 4. DEMONSTRATIVO DE CÁLCULOS PRINT --- */}
                {viewingDoc.docType === 'Demonstrativo de Cálculos' && (
                  <div className="space-y-6 text-xs">
                    <div className="bg-slate-100 p-2 font-bold text-center border border-slate-950 text-[11px] uppercase">
                      DEMONSTRATIVO DE MEMÓRIA DE CÁLCULO TRABALHISTA
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 text-[11px] space-y-2">
                      <h4 className="font-bold border-b border-slate-300 pb-1 text-[10px] uppercase">Regras e Parâmetros Aplicados:</h4>
                      <p>&bull; <strong>Saldo de Salário:</strong> Calculado na proporção de {viewingDoc.term.date?.split('-')[2]} dias trabalhados sobre base de 30 dias.</p>
                      <p>&bull; <strong>Aviso Prévio CLT:</strong> 30 dias básicos acrescidos de 3 dias por ano completo trabalhado.</p>
                      <p>&bull; <strong>Encargos de Previdência INSS:</strong> Alíquotas progressivas incidentes sobre proventos salariais.</p>
                      <p>&bull; <strong>FGTS e Seguro-Desemprego:</strong> Sincronizado com tabela de Tipos de Rescisão de acordo com Art. 477.</p>
                    </div>

                    <table className="w-full border border-slate-950 border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-slate-950">
                          <th className="p-2 border-r border-slate-950">Rúbrica</th>
                          <th className="p-2 border-r border-slate-950">Verba Descrita</th>
                          <th className="p-2 text-right">Resultado Calculado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-950">
                        <tr>
                          <td className="p-2 border-r border-slate-950 font-mono">R001</td>
                          <td className="p-2 border-r border-slate-950">Saldo Salário Proporcional</td>
                          <td className="p-2 text-right font-mono">R$ {Number(viewingDoc.term.salaryBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-950 font-mono">R004</td>
                          <td className="p-2 border-r border-slate-950">Férias e Adicional 1/3 Constitucional</td>
                          <td className="p-2 text-right font-mono">R$ {Number(viewingDoc.term.proportionalVacation || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-950 font-mono">R006</td>
                          <td className="p-2 border-r border-slate-950">Décimo Terceiro Proporcional</td>
                          <td className="p-2 text-right font-mono">R$ {Number(viewingDoc.term.proportional13th || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="font-bold bg-slate-100">
                          <td colSpan={2} className="p-2 border-r border-slate-950">TOTAL BRUTO DE PROVENTOS</td>
                          <td className="p-2 text-right font-mono">R$ {(Number(viewingDoc.term.salaryBalance || 0) + Number(viewingDoc.term.proportionalVacation || 0) + Number(viewingDoc.term.proportional13th || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* --- 5. COMPROVANTE DE PAGAMENTO PRINT --- */}
                {viewingDoc.docType === 'Comprovante de Pagamento' && (
                  <div className="space-y-6 text-xs text-justify">
                    <div className="bg-slate-100 p-2 font-bold text-center border border-slate-950 text-[11px] uppercase">
                      COMPROVANTE DE TRANSFERÊNCIA ELETRÔNICA DE CRÉDITO RESCISÓRIO
                    </div>

                    <div className="border border-slate-950 rounded p-4 font-mono space-y-3 bg-slate-50">
                      <div>BANCO DO BRASIL S.A. &bull; GESTÃO GESTRH SAAS</div>
                      <div>DATA DA TRANSAÇÃO: {(viewingDoc.term.date || '').split('-').reverse().join('/')}</div>
                      <div>TIPO DE CRÉDITO: TED JUDICIAL/FISCAL CONTRATUAL</div>
                      <hr className="border-slate-400" />
                      <div>EMISSOR: {currentUser?.companyId === 'company-2' ? 'Tech Solutions Corp' : 'Rafaela Lourenço RH & GestRH'}</div>
                      <div>FAVORECIDO: {viewingDoc.term.employeeName}</div>
                      <div>CONTA CORRENTE DE DEPÓSITO: AG: 3456 / C/C: 98112-9</div>
                      <div>CPF DO FAVORECIDO: 341.405.803-91</div>
                      <hr className="border-slate-400" />
                      <div className="font-bold text-sm">VALOR EFETIVADO: R$ {Number(viewingDoc.term.netPayable || viewingDoc.term.valorLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>

                    <p className="leading-relaxed">
                      Esta transação foi devidamente assinada digitalmente e certificada pela matriz corporativa do SaaS GestRH, possuindo valor de quitação eletrônica imediata das obrigações contratuais do Artigo 477 da CLT.
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
