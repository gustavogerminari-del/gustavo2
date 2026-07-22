/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Wallet, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Check, 
  X, 
  Building2, 
  PlusCircle, 
  UserX,
  CreditCard,
  FolderOpen,
  Settings,
  HelpCircle,
  Menu,
  ChevronRight,
  LogOut,
  Sliders,
  DollarSign,
  Download,
  Upload,
  CalendarCheck2,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Heart,
  Bot,
  Sparkles,
  FileSignature,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';

import { 
  Employee, 
  Job, 
  Candidate, 
  TimeRegister, 
  VacationRequest, 
  PaySlip, 
  DocumentFile, 
  AppSettings,
  EmployeeStatus,
  OnboardingContract,
  Benefit,
  EmployeeBenefit,
  Termination,
  ExtraHourRequest,
  PointCorrectionRequest,
  INSSBracket,
  IRRFBracket
} from '../types';

import { UserAccount } from '../types_master';

// Import new modular sub-components
import RecruitmentModule from './RecruitmentModule';
import OnboardingModule from './OnboardingModule';
import BenefitsModule from './BenefitsModule';
import TerminationModule from './TerminationModule';
import AIChatModule from './AIChatModule';
import TalentBankModule from './TalentBankModule';
import PayrollModule from './PayrollModule';
import ExtraHoursApprovalModule from './ExtraHoursApprovalModule';
import TaxTablesModule from './TaxTablesModule';
import EmployeePortalRequestsModal from './EmployeePortalRequestsModal';
import ConsultorRHModule from './ConsultorRHModule';
import SmartInterviewModule from './interview/SmartInterviewModule';

interface AdminDashboardProps {
  employees: Employee[];
  jobs: Job[];
  candidates: Candidate[];
  timeRegisters: TimeRegister[];
  vacationRequests: VacationRequest[];
  payslips: PaySlip[];
  documents: DocumentFile[];
  settings: AppSettings;
  currentUser?: UserAccount;
  onLogout?: () => void;
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateJobs: (jobs: Job[]) => void;
  onUpdateCandidates: (candidates: Candidate[]) => void;
  onUpdateTimeRegisters: (registers: TimeRegister[]) => void;
  onUpdateVacationRequests: (requests: VacationRequest[]) => void;
  onUpdatePayslips: (payslips: PaySlip[]) => void;
  onUpdateDocuments: (documents: DocumentFile[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onBackToPortal: () => void;

  contracts: OnboardingContract[];
  benefits: Benefit[];
  employeeBenefits: EmployeeBenefit[];
  terminations: Termination[];
  onUpdateContracts: (contracts: OnboardingContract[]) => void;
  onUpdateBenefits: (benefits: Benefit[]) => void;
  onUpdateEmployeeBenefits: (employeeBenefits: EmployeeBenefit[]) => void;
  onUpdateTerminations: (terminations: Termination[]) => void;

  extraHours: ExtraHourRequest[];
  pointCorrections: PointCorrectionRequest[];
  inssBrackets: INSSBracket[];
  irrfBrackets: IRRFBracket[];
  onUpdateExtraHours: (extraHours: ExtraHourRequest[]) => void;
  onUpdatePointCorrections: (corrections: PointCorrectionRequest[]) => void;
  onUpdateInssBrackets: (brackets: INSSBracket[]) => void;
  onUpdateIrrfBrackets: (brackets: IRRFBracket[]) => void;
}

export default function AdminDashboard({
  employees: rawEmployees,
  jobs,
  candidates,
  timeRegisters: rawTimeRegisters,
  vacationRequests: rawVacationRequests,
  payslips: rawPayslips,
  documents: rawDocuments,
  settings,
  currentUser,
  onLogout,
  onUpdateEmployees,
  onUpdateJobs,
  onUpdateCandidates,
  onUpdateTimeRegisters,
  onUpdateVacationRequests,
  onUpdatePayslips,
  onUpdateDocuments,
  onUpdateSettings,
  onBackToPortal,

  contracts,
  benefits,
  employeeBenefits,
  terminations,
  onUpdateContracts,
  onUpdateBenefits,
  onUpdateEmployeeBenefits,
  onUpdateTerminations,

  extraHours,
  pointCorrections,
  inssBrackets,
  irrfBrackets,
  onUpdateExtraHours,
  onUpdatePointCorrections,
  onUpdateInssBrackets,
  onUpdateIrrfBrackets
}: AdminDashboardProps) {
  
  // Current Tab / Active Section
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === 'Funcionário') return 'ponto';
    if (currentUser?.role === 'Consultor RH' || (currentUser?.role as string) === 'Consultor de RH') return 'consultor-rh';
    return 'dashboard';
  });

  const [consultorSubTab, setConsultorSubTab] = useState<string>('dashboard');

  // --- ROLE AND MULTI-TENANT ISOLATION SHADOWING ---
  const matchedEmployee = useMemo(() => {
    return rawEmployees.find(e => e.id === currentUser?.employeeId || e.email?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase());
  }, [rawEmployees, currentUser]);

  const employees = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      return rawEmployees.filter(e => e.id === matchedEmployee?.id);
    }
    return rawEmployees;
  }, [rawEmployees, currentUser, matchedEmployee]);

  const timeRegisters = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      return rawTimeRegisters.filter(r => r.employeeId === matchedEmployee?.id);
    }
    return rawTimeRegisters;
  }, [rawTimeRegisters, currentUser, matchedEmployee]);

  const vacationRequests = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      return rawVacationRequests.filter(v => v.employeeId === matchedEmployee?.id);
    }
    return rawVacationRequests;
  }, [rawVacationRequests, currentUser, matchedEmployee]);

  const payslips = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      return rawPayslips.filter(p => p.employeeId === matchedEmployee?.id);
    }
    return rawPayslips;
  }, [rawPayslips, currentUser, matchedEmployee]);

  const documents = useMemo(() => {
    if (currentUser?.role === 'Funcionário') {
      return rawDocuments.filter(d => d.employeeId === matchedEmployee?.id);
    }
    return rawDocuments;
  }, [rawDocuments, currentUser, matchedEmployee]);

  // Interactive Toast
  const [showToast, setShowToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 4000);
  };

  // Sidebar responsive mobile state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- LOCAL COMPONENT STATES ---
  
  // Search and Filter states
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('Todos');
  const [empStatusFilter, setEmpStatusFilter] = useState('Todos');

  // Candidate/Recruitment search states
  const [candSearch, setCandSearch] = useState('');
  const [candAreaFilter, setCandAreaFilter] = useState('Todos');

  // Point search state
  const [pointSearch, setPointSearch] = useState('');

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [isPunchClockOpen, setIsPunchClockOpen] = useState(false);
  const [punchEmployeeId, setPunchEmployeeId] = useState('');
  const [punchActionType, setPunchActionType] = useState<'entrada' | 'almoco_saida' | 'almoco_retorno' | 'saida'>('entrada');
  const [punchTime, setPunchTime] = useState('08:00');

  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [vacationEmpId, setVacationEmpId] = useState('');
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docEmpId, setDocEmpId] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'Contrato' | 'Identidade' | 'Comprovante' | 'Exame Médico' | 'Outro'>('Contrato');
  const [docFileName, setDocFileName] = useState('');

  // Payslip viewing modal
  const [viewingPayslip, setViewingPayslip] = useState<PaySlip | null>(null);

  // Portal Requests Modal state
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [portalModalType, setPortalModalType] = useState<'hora_extra' | 'correcao_ponto' | 'beneficios'>('hora_extra');

  // --- SUB-FORMS SUBMISSIONS ---

  // Add / Edit Employee Form state
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDept, setEmpDept] = useState('TI');
  const [empRole, setEmpRole] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empStatus, setEmpStatus] = useState<EmployeeStatus>('Ativo');
  const [empAdmission, setEmpAdmission] = useState('2026-07-21');
  
  // VT & Dependents & Coordinator
  const [empHasVT, setEmpHasVT] = useState(false);
  const [empTicketPrice, setEmpTicketPrice] = useState('4.40');
  const [empDaysUsed, setEmpDaysUsed] = useState('22');
  const [empDependentsCount, setEmpDependentsCount] = useState('0');
  const [empCoordinatorId, setEmpCoordinatorId] = useState('');

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpDept('TI');
    setEmpRole('');
    setEmpSalary('');
    setEmpStatus('Ativo');
    setEmpAdmission('2026-07-21');
    setEmpHasVT(false);
    setEmpTicketPrice('4.40');
    setEmpDaysUsed('22');
    setEmpDependentsCount('0');
    setEmpCoordinatorId('');
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpEmail(emp.email);
    setEmpPhone(emp.phone);
    setEmpDept(emp.department);
    setEmpRole(emp.role);
    setEmpSalary(emp.salary.toString());
    setEmpStatus(emp.status);
    setEmpAdmission(emp.admissionDate);
    setEmpHasVT(!!emp.hasValeTransporte);
    setEmpTicketPrice((emp.ticketPrice || 4.40).toString());
    setEmpDaysUsed((emp.daysUsed || 22).toString());
    setEmpDependentsCount((emp.dependentsCount || 0).toString());
    setEmpCoordinatorId(emp.coordinatorId || '');
    setIsEmployeeModalOpen(true);
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empEmail || !empRole || !empSalary) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const salaryNum = parseFloat(empSalary);
    if (isNaN(salaryNum)) {
      alert('Salário inválido!');
      return;
    }

    const ticketPriceNum = parseFloat(empTicketPrice) || 0;
    const daysUsedNum = parseInt(empDaysUsed) || 22;
    const dependentsCountNum = parseInt(empDependentsCount) || 0;
    const vtMonthlyValueNum = ticketPriceNum * daysUsedNum * 2;
    const selectedCoordinator = employees.find(c => c.id === empCoordinatorId);

    if (editingEmployee) {
      // Edit
      const updated = employees.map(emp => {
        if (emp.id === editingEmployee.id) {
          return {
            ...emp,
            name: empName,
            email: empEmail,
            phone: empPhone,
            department: empDept,
            role: empRole,
            salary: salaryNum,
            status: empStatus,
            admissionDate: empAdmission,
            hasValeTransporte: empHasVT,
            ticketPrice: ticketPriceNum,
            daysUsed: daysUsedNum,
            vtMonthlyValue: vtMonthlyValueNum,
            dependentsCount: dependentsCountNum,
            coordinatorId: empCoordinatorId,
            coordinatorName: selectedCoordinator ? selectedCoordinator.name : emp.coordinatorName
          };
        }
        return emp;
      });
      onUpdateEmployees(updated);
      triggerToast(`✓ Colaborador "${empName}" atualizado com sucesso!`);
    } else {
      // Add
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: empName,
        email: empEmail,
        phone: empPhone,
        department: empDept,
        role: empRole,
        salary: salaryNum,
        status: empStatus,
        admissionDate: empAdmission,
        hasValeTransporte: empHasVT,
        ticketPrice: ticketPriceNum,
        daysUsed: daysUsedNum,
        vtMonthlyValue: vtMonthlyValueNum,
        dependentsCount: dependentsCountNum,
        coordinatorId: empCoordinatorId,
        coordinatorName: selectedCoordinator ? selectedCoordinator.name : undefined
      };
      onUpdateEmployees([...employees, newEmp]);
      triggerToast(`✓ Novo colaborador "${empName}" cadastrado com sucesso!`);
    }

    setIsEmployeeModalOpen(false);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja desligar/remover o colaborador ${name}?`)) {
      const updated = employees.map(emp => {
        if (emp.id === id) {
          return { ...emp, status: 'Desligado' as EmployeeStatus };
        }
        return emp;
      });
      onUpdateEmployees(updated);
      triggerToast(`✓ Colaborador "${name}" desligado e marcado como inativo.`);
    }
  };

  // Punch point clock simulation
  const handlePunchClockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchEmployeeId) {
      alert('Selecione um colaborador!');
      return;
    }

    const emp = employees.find(e => e.id === punchEmployeeId);
    if (!emp) return;

    // Check if there is already a register for today (2026-07-21)
    const todayStr = '2026-07-21';
    const existingIndex = timeRegisters.findIndex(r => r.employeeId === punchEmployeeId && r.date === todayStr);

    if (existingIndex >= 0) {
      const existing = timeRegisters[existingIndex];
      const updatedRegister = { ...existing };

      if (punchActionType === 'entrada') {
        updatedRegister.clockIn = punchTime;
      } else if (punchActionType === 'almoco_saida') {
        updatedRegister.lunchOut = punchTime;
      } else if (punchActionType === 'almoco_retorno') {
        updatedRegister.lunchIn = punchTime;
      } else if (punchActionType === 'saida') {
        updatedRegister.clockOut = punchTime;
      }

      // Calculate total hours
      let hours = 8.0; // default
      if (updatedRegister.clockIn && updatedRegister.clockOut) {
        const [inH, inM] = updatedRegister.clockIn.split(':').map(Number);
        const [outH, outM] = updatedRegister.clockOut.split(':').map(Number);
        let totalMin = (outH * 60 + outM) - (inH * 60 + inM);

        // Deduct lunch break
        if (updatedRegister.lunchOut && updatedRegister.lunchIn) {
          const [lOutH, lOutM] = updatedRegister.lunchOut.split(':').map(Number);
          const [lInH, lInM] = updatedRegister.lunchIn.split(':').map(Number);
          const lunchMin = (lInH * 60 + lInM) - (lOutH * 60 + lOutM);
          if (lunchMin > 0) {
            totalMin -= lunchMin;
          }
        } else {
          totalMin -= 60; // default 1 hour lunch deduction if not registered
        }

        hours = Math.max(0, parseFloat((totalMin / 60).toFixed(2)));
      }

      updatedRegister.totalHours = hours;
      const normalHours = settings.baseWorkHoursPerDay;
      updatedRegister.extraHours = Math.max(0, parseFloat((hours - normalHours).toFixed(2)));

      const nextRegisters = [...timeRegisters];
      nextRegisters[existingIndex] = updatedRegister;
      onUpdateTimeRegisters(nextRegisters);
      triggerToast(`✓ Ponto atualizado para "${emp.name}" às ${punchTime}!`);

    } else {
      // Create new register
      const newReg: TimeRegister = {
        id: `tr-${Date.now()}`,
        employeeId: punchEmployeeId,
        employeeName: emp.name,
        date: todayStr,
        clockIn: punchActionType === 'entrada' ? punchTime : '08:00',
        lunchOut: punchActionType === 'almoco_saida' ? punchTime : undefined,
        lunchIn: punchActionType === 'almoco_retorno' ? punchTime : undefined,
        clockOut: punchActionType === 'saida' ? punchTime : undefined,
        totalHours: 8.0,
        extraHours: 0,
        status: 'Aprovado'
      };

      onUpdateTimeRegisters([...timeRegisters, newReg]);
      triggerToast(`✓ Ponto registrado de Entrada para "${emp.name}" às ${punchTime}!`);
    }

    setIsPunchClockOpen(false);
  };

  const handleApprovePoint = (id: string) => {
    const updated = timeRegisters.map(r => {
      if (r.id === id) return { ...r, status: 'Aprovado' as const };
      return r;
    });
    onUpdateTimeRegisters(updated);
    triggerToast('✓ Registro de ponto aprovado com sucesso!');
  };

  // Vacation schedules submission
  const handleVacationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacationEmpId || !vacationStart || !vacationEnd) {
      alert('Preencha todos os campos!');
      return;
    }

    const emp = employees.find(e => e.id === vacationEmpId);
    if (!emp) return;

    const start = new Date(vacationStart);
    const end = new Date(vacationEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: VacationRequest = {
      id: `vac-${Date.now()}`,
      employeeId: vacationEmpId,
      employeeName: emp.name,
      department: emp.department,
      startDate: vacationStart,
      endDate: vacationEnd,
      days: diffDays,
      status: 'Pendente'
    };

    onUpdateVacationRequests([...vacationRequests, newRequest]);
    setIsVacationModalOpen(false);
    triggerToast(`✓ Solicitação de férias de ${diffDays} dias para "${emp.name}" criada com sucesso!`);
  };

  const handleApproveVacation = (id: string, action: 'Aprovado' | 'Rejeitado' | 'Em andamento') => {
    const req = vacationRequests.find(r => r.id === id);
    if (!req) return;

    const updatedRequests = vacationRequests.map(r => {
      if (r.id === id) return { ...r, status: action };
      return r;
    });
    onUpdateVacationRequests(updatedRequests);

    // If approved, update employee status to "Em Férias"
    if (action === 'Em andamento' || action === 'Aprovado') {
      const updatedEmployees = employees.map(emp => {
        if (emp.id === req.employeeId) {
          return { ...emp, status: 'Em Férias' as EmployeeStatus };
        }
        return emp;
      });
      onUpdateEmployees(updatedEmployees);
    }

    triggerToast(`✓ Solicitação de férias de "${req.employeeName}" atualizada para ${action}!`);
  };

  // Document Upload submission
  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docEmpId || !docTitle || !docFileName) {
      alert('Preencha os dados obrigatórios!');
      return;
    }

    const emp = employees.find(e => e.id === docEmpId);
    if (!emp) return;

    const newDoc: DocumentFile = {
      id: `doc-${Date.now()}`,
      employeeId: docEmpId,
      employeeName: emp.name,
      title: docTitle,
      category: docCategory,
      uploadDate: '2026-07-21',
      fileName: docFileName.split('\\').pop() || 'documento.pdf',
      fileSize: '350 KB'
    };

    onUpdateDocuments([...documents, newDoc]);
    setIsDocModalOpen(false);
    triggerToast(`✓ Documento "${docTitle}" anexado com sucesso ao perfil de ${emp.name}!`);
    setDocTitle('');
    setDocFileName('');
  };

  // Generate / Close Monthly Payroll
  const handleCalculatePayroll = () => {
    const generatedMonth = '2026-07';
    
    // Check if payroll already closed
    const pendingCount = employees.filter(e => e.status !== 'Desligado').length;
    
    const calculatedPaySlips: PaySlip[] = employees
      .filter(e => e.status !== 'Desligado')
      .map(emp => {
        // Find total extra hours for this employee
        const empPoints = timeRegisters.filter(r => r.employeeId === emp.id && r.date.startsWith(generatedMonth));
        const totalExtra = empPoints.reduce((acc, curr) => acc + curr.extraHours, 0);

        // Hourly rate estimate based on monthly salary (assume 160h work month)
        const hourlyRate = emp.salary / 160;
        const extraEarnings = parseFloat((totalExtra * hourlyRate * settings.extraHoursMultiplier).toFixed(2));
        
        // Deductions simulation (standard taxes around 10-12%)
        const deductions = parseFloat((emp.salary * 0.10).toFixed(2));
        const netSalary = parseFloat((emp.salary + extraEarnings - deductions).toFixed(2));

        return {
          id: `ps-${emp.id}-${Date.now()}`,
          employeeId: emp.id,
          employeeName: emp.name,
          month: generatedMonth,
          baseSalary: emp.salary,
          extraHoursEarnings: extraEarnings,
          deductions: deductions,
          netSalary: netSalary,
          status: 'Pendente',
          generatedAt: '2026-07-21'
        };
      });

    onUpdatePayslips(calculatedPaySlips);
    triggerToast(`✓ Folha de Pagamento de 07/2026 fechada com sucesso para ${calculatedPaySlips.length} colaboradores!`);
  };

  const handlePayPayslip = (id: string) => {
    const updated = payslips.map(ps => {
      if (ps.id === id) return { ...ps, status: 'Pago' as const };
      return ps;
    });
    onUpdatePayslips(updated);
    triggerToast('✓ Pagamento de holerite efetuado com sucesso!');
  };

  // --- DYNAMIC CALCULATIONS FOR THE DASHBOARD STATS ---

  const totalEmployeesCount = employees.length;
  const activeCount = employees.filter(e => e.status === 'Ativo').length;
  const inVacationCount = employees.filter(e => e.status === 'Em Férias').length;
  const awayCount = employees.filter(e => e.status === 'Afastado').length;
  const dismissedCount = employees.filter(e => e.status === 'Desligado').length;

  const presentTodayCount = useMemo(() => {
    // Counts points recorded today (2026-07-21)
    const todayStr = '2026-07-21';
    return timeRegisters.filter(r => r.date === todayStr && r.clockIn).length;
  }, [timeRegisters]);

  const totalPayrollCost = useMemo(() => {
    // Calculate total salaries of current active, vacation and away employees
    return employees
      .filter(e => e.status !== 'Desligado')
      .reduce((acc, curr) => acc + curr.salary, 0);
  }, [employees]);

  const totalHoursWorkedMonth = useMemo(() => {
    return timeRegisters.reduce((acc, curr) => acc + curr.totalHours, 0) || 70.0;
  }, [timeRegisters]);

  const totalExtraHoursMonth = useMemo(() => {
    return timeRegisters.reduce((acc, curr) => acc + curr.extraHours, 0) || 6.5;
  }, [timeRegisters]);


  // --- CHART FORMATTING ---

  // 1. Department Distribution Data
  const deptChartData = useMemo(() => {
    const counts: Record<string, number> = {
      'Financeiro': 0,
      'Comercial': 0,
      'Administrativo': 0,
      'Recursos Humanos': 0,
      'TI': 0,
      'Logística': 0
    };

    employees.filter(e => e.status !== 'Desligado').forEach(e => {
      if (counts[e.department] !== undefined) {
        counts[e.department]++;
      } else {
        counts[e.department] = 1;
      }
    });

    return Object.keys(counts).map(key => ({
      name: key,
      'Funcionários': counts[key]
    }));
  }, [employees]);

  // 2. Status Donut Data
  const statusChartData = useMemo(() => {
    return [
      { name: 'Ativos', value: activeCount, color: '#10b981' }, // emerald green
      { name: 'Férias', value: inVacationCount, color: '#f59e0b' }, // amber
      { name: 'Afastados', value: awayCount, color: '#94a3b8' } // slate
    ].filter(item => item.value > 0);
  }, [activeCount, inVacationCount, awayCount]);

  // 3. Simulated monthly hours trends for Line Chart
  const hoursTrendsData = [
    { name: 'Jan', 'Horas Normais': 65, 'Horas Extras': 4.5 },
    { name: 'Fev', 'Horas Normais': 68, 'Horas Extras': 5.0 },
    { name: 'Mar', 'Horas Normais': 72, 'Horas Extras': 6.2 },
    { name: 'Abr', 'Horas Normais': 70, 'Horas Extras': 5.8 },
    { name: 'Mai', 'Horas Normais': 74, 'Horas Extras': 7.0 },
    { name: 'Jun', 'Horas Normais': 71, 'Horas Extras': 6.5 },
    { name: 'Jul', 'Horas Normais': totalHoursWorkedMonth, 'Horas Extras': totalExtraHoursMonth },
    { name: 'Ago', 'Horas Normais': 68, 'Horas Extras': 5.5 },
    { name: 'Set', 'Horas Normais': 75, 'Horas Extras': 8.0 },
    { name: 'Out', 'Horas Normais': 70, 'Horas Extras': 6.0 },
    { name: 'Nov', 'Horas Normais': 72, 'Horas Extras': 6.8 },
    { name: 'Dez', 'Horas Normais': 69, 'Horas Extras': 5.0 },
  ];


  // --- SEARCH FILTERS FOR LISTS ---

  const filteredEmployeesList = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = empSearch === '' || 
        (e.name || '').toLowerCase().includes(empSearch.toLowerCase()) ||
        (e.role || '').toLowerCase().includes(empSearch.toLowerCase()) ||
        (e.email || '').toLowerCase().includes(empSearch.toLowerCase());
      
      const matchDept = empDeptFilter === 'Todos' || e.department === empDeptFilter;
      const matchStatus = empStatusFilter === 'Todos' || e.status === empStatusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, empSearch, empDeptFilter, empStatusFilter]);

  const filteredCandidatesList = useMemo(() => {
    return candidates.filter(c => {
      const matchSearch = candSearch === '' ||
        (c.name || '').toLowerCase().includes(candSearch.toLowerCase()) ||
        (c.experience || '').toLowerCase().includes(candSearch.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(candSearch.toLowerCase());

      const matchArea = candAreaFilter === 'Todos' || c.area === candAreaFilter;

      return matchSearch && matchArea;
    });
  }, [candidates, candSearch, candAreaFilter]);

  const filteredTimeRegistersList = useMemo(() => {
    return timeRegisters.filter(r => {
      return pointSearch === '' || 
        (r.employeeName || '').toLowerCase().includes(pointSearch.toLowerCase()) ||
        r.date.includes(pointSearch);
    }).reverse(); // Most recent first
  }, [timeRegisters, pointSearch]);  const releasedModules = useMemo<string[]>(() => {
    if (!currentUser || currentUser.role === 'Master') {
      return ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-7', 'mod-8', 'mod-9', 'mod-10', 'mod-11', 'mod-12', 'mod-13', 'mod-14', 'mod-15'];
    }
    const companyId = currentUser.companyId || 'company-1';
    try {
      const companiesStr = localStorage.getItem('firebase_companies');
      if (companiesStr) {
        const companies = JSON.parse(companiesStr);
        const company = companies.find((c: any) => c.id === companyId);
        if (company) {
          return company.releasedModules || [];
        }
      }
    } catch (e) {
      console.error("Error loading company modules:", e);
    }
    return ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6', 'mod-7', 'mod-8', 'mod-9', 'mod-10', 'mod-11', 'mod-12', 'mod-13', 'mod-14', 'mod-15'];
  }, [currentUser]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Toast alert */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/30 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-sm text-white">{showToast}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="bg-[#047857] text-white p-4 flex md:hidden items-center justify-between border-b border-emerald-600 shadow-md">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-emerald-300" />
          <span className="font-display font-bold text-base">GestRH</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-emerald-800 rounded-lg text-emerald-100"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* --- SIDEBAR LAYOUT (Green Theme) --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#047857] text-white flex flex-col justify-between 
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
        transition-transform duration-300 ease-in-out border-r border-emerald-700 shrink-0 shadow-xl md:shadow-none
      `}>
        <div>
          {/* Company Brand Logo */}
          <div className="p-6 border-b border-emerald-600 flex items-center space-x-3 justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-xl text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg leading-none">GestRH</h2>
                <p className="text-emerald-300 text-[10px] tracking-wider uppercase font-semibold mt-0.5">Sistema de RH</p>
              </div>
            </div>
            <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]" id="admin-sidebar-menu">
            {/* 1. Dashboard Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && (
              <button
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Sliders className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )}

            {/* 2. Funcionários Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-1') && (
              <button
                onClick={() => { setActiveTab('funcionarios'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'funcionarios' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Users className="h-4 w-4" />
                <span>Funcionários</span>
              </button>
            )}

            {/* 3. Ponto Eletrônico Tab */}
            {releasedModules.includes('mod-6') && (
              <button
                onClick={() => { setActiveTab('ponto'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'ponto' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Clock className="h-4 w-4" />
                <span>{currentUser?.role === 'Funcionário' ? 'Meu Ponto' : 'Ponto Eletrônico'}</span>
              </button>
            )}

            {/* 4. Folha de Pagamento Tab */}
            {releasedModules.includes('mod-7') && (
              <button
                onClick={() => { setActiveTab('folha'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'folha' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Wallet className="h-4 w-4" />
                <span>{currentUser?.role === 'Funcionário' ? 'Meus Holerites' : 'Folha de Pagamento'}</span>
              </button>
            )}

            {/* 5. Férias Tab */}
            {releasedModules.includes('mod-1') && (
              <button
                onClick={() => { setActiveTab('ferias'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'ferias' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Calendar className="h-4 w-4" />
                <span>{currentUser?.role === 'Funcionário' ? 'Minhas Férias' : 'Férias'}</span>
              </button>
            )}

            {/* 6. Documentos Tab */}
            {releasedModules.includes('mod-1') && (
              <button
                onClick={() => { setActiveTab('documentos'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'documentos' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <FileText className="h-4 w-4" />
                <span>{currentUser?.role === 'Funcionário' ? 'Meus Documentos' : 'Documentos'}</span>
              </button>
            )}

            {/* --- NEW HR GESTÃO DE PESSOAS MODULES --- */}

            {/* 7. Recrutamento e Seleção Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-2') && (
              <button
                onClick={() => { setActiveTab('recrutamento'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'recrutamento' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Briefcase className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Recrutamento & Seleção</span>
              </button>
            )}

            {/* Entrevista Inteligente com IA Tab (Módulo 15) */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-15') && (
              <button
                onClick={() => { setActiveTab('entrevistas-ia'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'entrevistas-ia' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' : 'text-amber-300 hover:bg-emerald-600/50'}`}
              >
                <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                <span className="flex-1 font-bold">Entrevista Inteligente (IA)</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase font-mono shadow-sm">
                  NOVO
                </span>
              </button>
            )}

            {/* 8. Banco de Talentos Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-3') && (
              <button
                onClick={() => { setActiveTab('banco-talentos'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'banco-talentos' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Users className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Banco de Talentos</span>
              </button>
            )}

            {/* 9. Módulo Contratação Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-11') && (
              <button
                onClick={() => { setActiveTab('contratacao'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'contratacao' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <FileSignature className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Contratação & Onboarding</span>
              </button>
            )}

            {/* 10. Módulo Benefícios Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-9') && (
              <button
                onClick={() => { setActiveTab('beneficios'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'beneficios' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Heart className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Gestão de Benefícios</span>
              </button>
            )}

            {/* 11. Módulo Rescisão Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-12') && (
              <button
                onClick={() => { setActiveTab('rescisao'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'rescisao' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <UserMinus className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Rescisões & Offboarding</span>
              </button>
            )}

            {/* Aprovações & Horas Extras Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário' || (currentUser.role as string) === 'Coordenador') && currentUser?.role !== 'Consultor RH' && (currentUser?.role as string) !== 'Consultor de RH' && releasedModules.includes('mod-6') && (
              <button
                onClick={() => { setActiveTab('aprovacoes'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'aprovacoes' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Aprovações & Horas Extras</span>
              </button>
            )}

            {/* 12. Assistente IA RH Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-13') && (
              <button
                onClick={() => { setActiveTab('chat-ia'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'chat-ia' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Bot className="h-4 w-4 text-emerald-300" />
                <span className="flex-1">Assistente IA RH</span>
              </button>
            )}

            {/* Módulo Consultor de RH Multi-Tenant */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-14') && (
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('consultor-rh'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${activeTab === 'consultor-rh' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' : 'text-amber-300 hover:bg-emerald-600/50'}`}
                >
                  <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
                  <span className="flex-1 font-bold">Consultor de RH</span>
                  <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
                    SaaS
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeTab === 'consultor-rh' ? 'rotate-180' : ''}`} />
                </button>

                {/* Nested Sub-options directly inside main sidebar */}
                {activeTab === 'consultor-rh' && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-amber-400/60 ml-4 my-1">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { id: 'clientes', label: 'Clientes', icon: Building2 },
                      { id: 'vagas', label: 'Vagas', icon: Briefcase },
                      { id: 'banco', label: 'Banco de Talentos', icon: Users },
                      { id: 'pipeline', label: 'Pipeline Kanban', icon: UserCheck },
                      { id: 'entrevistas', label: 'Entrevistas', icon: Calendar },
                      { id: 'crm', label: 'CRM Comercial', icon: TrendingUp },
                      { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
                      { id: 'relatorios', label: 'Relatórios', icon: FileText },
                      { id: 'ia', label: 'Consultor IA', icon: Sparkles }
                    ].map((subItem) => {
                      const IconComponent = subItem.icon;
                      const isSubActive = consultorSubTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setActiveTab('consultor-rh');
                            setConsultorSubTab(subItem.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer ${
                            isSubActive
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                              : 'text-emerald-100 hover:bg-emerald-600/50 hover:text-white'
                          }`}
                        >
                          <IconComponent className={`h-3.5 w-3.5 shrink-0 ${isSubActive ? 'text-slate-950' : 'text-amber-300'}`} />
                          <span className="truncate">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 13. Relatórios Tab */}
            {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-10') && (
              <button
                onClick={() => { setActiveTab('relatorios'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'relatorios' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Relatórios</span>
              </button>
            )}

            {/* 14. Configurações Tab */}
            {(!currentUser || (currentUser.role !== 'Funcionário' && currentUser.role !== 'RH')) && (
              <button
                onClick={() => { setActiveTab('configuracoes'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${activeTab === 'configuracoes' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-600/50'}`}
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </button>
            )}
          </nav>
        </div>

        {/* User profile details bottom */}
        <div className="p-4 border-t border-emerald-600/80 bg-emerald-950/25">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 bg-emerald-500 text-white font-bold flex items-center justify-center rounded-full text-xs shrink-0 border border-emerald-400">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white leading-none">{currentUser?.name || 'Administrador'}</p>
              <p className="text-[9px] text-emerald-300 truncate mt-1 uppercase font-mono font-bold tracking-wider">
                {currentUser?.role || 'Empresa Administradora'}
              </p>
            </div>
          </div>

          <button 
            id="btn-voltar-ao-portal"
            onClick={onLogout || onBackToPortal}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600/40 hover:bg-rose-600 border border-emerald-500/20 hover:border-rose-500 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE WRAPPER --- */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        
        {/* --- HEADER TITLE BAR --- */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8" id="admin-main-header">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-1">
              <span>GestRH</span>
              <ChevronRight className="h-3 w-3" />
              <span className="capitalize">{activeTab}</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-900 leading-tight">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'funcionarios' && 'Colaboradores'}
              {activeTab === 'ponto' && 'Ponto Eletrônico'}
              {activeTab === 'folha' && 'Folha de Pagamento'}
              {activeTab === 'ferias' && 'Programação de Férias'}
              {activeTab === 'documentos' && 'Gestão Documental'}
              {activeTab === 'relatorios' && 'Relatórios e Métricas'}
              {activeTab === 'configuracoes' && 'Configurações Globais'}
              {activeTab === 'recrutamento' && 'Atração, Triagem IA e Seleção'}
              {activeTab === 'banco-talentos' && 'Banco de Talentos'}
              {activeTab === 'contratacao' && 'Processos de Admissão & Onboarding'}
              {activeTab === 'beneficios' && 'Gestão de Benefícios Corporativos'}
              {activeTab === 'rescisao' && 'Cálculo de Desligamento & Offboarding'}
              {activeTab === 'chat-ia' && 'Assistente de RH com Inteligência Artificial'}
              {activeTab === 'consultor-rh' && 'Consultor de RH — Ecossistema Multiempresa'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {activeTab === 'dashboard' && 'Visão geral da gestão de pessoas.'}
              {activeTab === 'funcionarios' && 'Adicione, edite e gerencie o histórico profissional do seu time.'}
              {activeTab === 'ponto' && 'Verifique, aprove e acompanhe o registro diário de horas.'}
              {activeTab === 'folha' && 'Gerencie o faturamento salarial, holerites e horas extras do mês.'}
              {activeTab === 'ferias' && 'Agendamento de férias dos colaboradores de forma prática.'}
              {activeTab === 'documentos' && 'Anexe contratos, exames médicos periódicos e documentos gerais.'}
              {activeTab === 'relatorios' && 'Gráficos corporativos estruturados de headcount e despesas.'}
              {activeTab === 'configuracoes' && 'Gerencie taxas corporativas e horários padrão.'}
              {activeTab === 'recrutamento' && 'Crie vagas com inteligência artificial, analise compatibilidades de candidatos e gerencie o funil de seleção.'}
              {activeTab === 'banco-talentos' && 'Pesquise, filtre e visualize o currículo de candidatos e profissionais pré-selecionados para contratações.'}
              {activeTab === 'contratacao' && 'Prepare contratos de trabalho CLT, PJ ou Estágio, e gerencie o checklist documental admissional.'}
              {activeTab === 'beneficios' && 'Cadastre auxílios de refeição, transporte, bônus e planos de saúde com regras de proventos e descontos.'}
              {activeTab === 'rescisao' && 'Simule e calcule verbas rescisórias, férias vencidas, 13º salário e controle a entrega de checklists de desligamento.'}
              {activeTab === 'chat-ia' && 'Tire dúvidas jurídicas sobre a CLT, elabore políticas internas de feedback ou prepare comunicados em segundos.'}
              {activeTab === 'consultor-rh' && 'Gestão de múltiplos clientes, vagas, pipeline kanban, CRM comercial, finanças e IA de triagem.'}
            </p>
          </div>

          {/* Right Area Date badge (Matching Tuesday, 21 July) */}
          <div className="shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-center shadow-sm">
            terça-feira, 21 de julho
          </div>
        </header>

        {/* --- 1. DASHBOARD VIEW (Prinstine Match to Screenshot 4) --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8" id="dashboard-view">
            
            {/* Grid of 8 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 - Total de Funcionários */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total de Funcionários</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{totalEmployeesCount}</span>
                  <span className="text-emerald-600 text-[10px] font-semibold block mt-1">+3 este mês</span>
                </div>
              </div>

              {/* Card 2 - Ativos */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Ativos</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{activeCount + inVacationCount}</span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">77% do total</span>
                </div>
              </div>

              {/* Card 3 - Desligados */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                  <UserMinus className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Desligados</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{dismissedCount}</span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">no histórico</span>
                </div>
              </div>

              {/* Card 4 - Presentes Hoje */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Presentes Hoje</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{presentTodayCount}</span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">
                    {activeCount > 0 ? `${Math.round((presentTodayCount / activeCount) * 100)}% dos ativos` : '0% dos ativos'}
                  </span>
                </div>
              </div>

              {/* Card 5 - Horas no Mês */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Horas no Mês</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{totalHoursWorkedMonth}h</span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">Horas trabalhadas</span>
                </div>
              </div>

              {/* Card 6 - Horas Extras */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Horas Extras</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{totalExtraHoursMonth}h</span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">no mês</span>
                </div>
              </div>

              {/* Card 7 - Em Férias */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-purple-50 text-purple-500 rounded-xl shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Em Férias</span>
                  <span className="text-2xl font-bold text-slate-900 block leading-tight mt-1">{inVacationCount}</span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">{awayCount} afastados</span>
                </div>
              </div>

              {/* Card 8 - Custo da Folha */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex items-start space-x-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shrink-0">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Custo da Folha</span>
                  <span className="text-xl font-bold text-slate-900 block leading-tight mt-1">
                    R$ {totalPayrollCost.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-slate-500 text-[10px] font-semibold block mt-1">mês atual</span>
                </div>
              </div>

            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Chart 1: Horas trabalhadas por mês */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2">
                <h3 className="font-display font-semibold text-sm text-slate-900 mb-6">Horas trabalhadas por mês</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hoursTrendsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #f1f5f9' }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Horas Normais" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="Horas Extras" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Status dos funcionários (Donut Chart) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="font-display font-semibold text-sm text-slate-900 mb-6">Status dos funcionários</h3>
                <div className="h-60 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Stat */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-slate-900">{totalEmployeesCount - dismissedCount}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Equipe Ativa</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex justify-center space-x-6 text-[10px] font-semibold mt-4">
                  {statusChartData.map((item, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-500">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Section: Departments and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Department distribution Bar Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2">
                <h3 className="font-display font-semibold text-sm text-slate-900 mb-6">Funcionários por departamento</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Bar dataKey="Funcionários" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <h3 className="font-display font-semibold text-sm text-slate-900 mb-6">Ações rápidas</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Action 1: Novo Funcionário */}
                  <button 
                    onClick={openAddEmployeeModal}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl transition-all text-center group cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 shrink-0 mb-2">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Novo Colaborador</span>
                  </button>

                  {/* Action 2: Vagas Abertas */}
                  <button 
                    onClick={() => {
                      if (currentUser?.role === 'Consultor RH' || (currentUser?.role as string) === 'Consultor de RH') {
                        setActiveTab('consultor-rh');
                        setConsultorSubTab('vagas');
                      } else {
                        setActiveTab('recrutamento');
                      }
                    }}
                    className="flex flex-col items-center justify-center p-3.5 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 hover:border-amber-300 rounded-2xl transition-all text-center group cursor-pointer"
                  >
                    <div className="p-2 bg-amber-500 text-slate-950 rounded-xl group-hover:scale-105 shrink-0 mb-2 shadow-xs">
                      <Briefcase className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-950">Vagas de Emprego</span>
                  </button>

                  {/* Action 3: Registrar Ponto */}
                  <button 
                    onClick={() => { setIsPunchClockOpen(true); setPunchEmployeeId(''); }}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl transition-all text-center group cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 shrink-0 mb-2">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Registrar Ponto</span>
                  </button>

                  {/* Action 4: Folha Mensal */}
                  <button 
                    onClick={() => setActiveTab('folha')}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl transition-all text-center group cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 shrink-0 mb-2">
                      <Wallet className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Folha Mensal</span>
                  </button>

                  {/* Action 5: Aprovar Férias */}
                  <button 
                    onClick={() => setActiveTab('ferias')}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl transition-all text-center group cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 shrink-0 mb-2">
                      <CalendarCheck2 className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Aprovar Férias</span>
                  </button>

                  {/* Action 6: Banco de Talentos */}
                  <button 
                    onClick={() => setActiveTab('banco-talentos')}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl transition-all text-center group cursor-pointer"
                  >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 shrink-0 mb-2">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Banco Talentos</span>
                  </button>
                </div>

                {/* Vagas em Seleção - Direct Navigation Section */}
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
                    <span className="flex items-center space-x-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                      <span>Vagas Recentes Abertas</span>
                    </span>
                    <button 
                      onClick={() => {
                        if (currentUser?.role === 'Consultor RH' || (currentUser?.role as string) === 'Consultor de RH') {
                          setActiveTab('consultor-rh');
                          setConsultorSubTab('vagas');
                        } else {
                          setActiveTab('recrutamento');
                        }
                      }} 
                      className="text-amber-600 hover:text-amber-700 font-bold text-[11px] hover:underline cursor-pointer"
                    >
                      Ver Todas as Vagas &raquo;
                    </button>
                  </div>

                  <div className="space-y-2">
                    {jobs.slice(0, 3).map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          if (currentUser?.role === 'Consultor RH' || (currentUser?.role as string) === 'Consultor de RH') {
                            setActiveTab('consultor-rh');
                            setConsultorSubTab('vagas');
                          } else {
                            setActiveTab('recrutamento');
                          }
                        }}
                        className="w-full flex items-center justify-between p-2.5 bg-amber-50/40 hover:bg-amber-100/60 rounded-xl border border-amber-200/60 transition-all text-left cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">{job.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{job.department} &bull; {job.location} &bull; <strong className="text-amber-700">{job.workModel}</strong></p>
                        </div>
                        <span className="bg-amber-500 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
                          {job.salaryRange || 'Aberto'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
                    <span>Candidatos no Banco</span>
                    <button onClick={() => setActiveTab('banco-talentos')} className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] hover:underline cursor-pointer">Ver Todos &raquo;</button>
                  </div>

                  <div className="space-y-2">
                    {candidates.slice(0, 2).map((cand, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{cand.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{cand.area} &bull; {cand.city}-{cand.state}</p>
                        </div>
                        <span className="bg-[#0b1d33]/5 text-[#0b1d33] font-bold text-[9px] px-2 py-1 rounded-full shrink-0">Novo</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- 2. COLABORADORES (EMPLOYEES) VIEW --- */}
        {activeTab === 'funcionarios' && (
          <div className="space-y-6" id="funcionarios-tab-content">
            
            {/* Action buttons and filters bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome, cargo ou e-mail..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Dept filter */}
                <select 
                  value={empDeptFilter}
                  onChange={(e) => setEmpDeptFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Todos">Todos Departamentos</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Comercial">Comercial</option>
                  <option value="TI">TI</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Logística">Logística</option>
                </select>

                {/* Status filter */}
                <select 
                  value={empStatusFilter}
                  onChange={(e) => setEmpStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Ativo">Ativos</option>
                  <option value="Em Férias">Em Férias</option>
                  <option value="Afastado">Afastados</option>
                  <option value="Desligado">Desligados</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={openAddEmployeeModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shrink-0 shadow-md shadow-emerald-600/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Colaborador</span>
                </button>
              </div>
            </div>

            {/* Main Employees Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                      <th className="py-4 px-6">Colaborador</th>
                      <th className="py-4 px-6">Departamento / Cargo</th>
                      <th className="py-4 px-6">Data de Admissão</th>
                      <th className="py-4 px-6">Salário CLT</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredEmployeesList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          Nenhum colaborador corresponde aos critérios de pesquisa.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployeesList.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-9 w-9 bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center rounded-xl">
                                {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{emp.name}</span>
                                <span className="text-slate-400 text-[10px] block mt-0.5">{emp.email} &bull; {emp.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-800 block">{emp.department}</span>
                            <span className="text-slate-400 text-[11px] block mt-0.5">{emp.role}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-mono">
                            {emp.admissionDate.split('-').reverse().join('/')}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-900 font-mono">
                            R$ {emp.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`
                              font-semibold text-[10px] px-2.5 py-1 rounded-full inline-block
                              ${emp.status === 'Ativo' && 'bg-emerald-50 text-emerald-700'}
                              ${emp.status === 'Em Férias' && 'bg-amber-50 text-amber-700'}
                              ${emp.status === 'Afastado' && 'bg-slate-100 text-slate-600'}
                              ${emp.status === 'Desligado' && 'bg-rose-50 text-rose-600'}
                            `}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button 
                              onClick={() => openEditEmployeeModal(emp)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors inline-block"
                              title="Editar Colaborador"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {emp.status !== 'Desligado' && (
                              <button 
                                onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-block"
                                title="Desligar Colaborador"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recruitment Pool (Candidates) Block */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Banco de Talentos Recebidos</h3>
                  <p className="text-slate-500 text-xs">Candidatos que se inscreveram através do portal de carreiras e vagas.</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Filtrar candidatos..."
                    value={candSearch}
                    onChange={(e) => setCandSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                  />
                  <select
                    value={candAreaFilter}
                    onChange={(e) => setCandAreaFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                  >
                    <option value="Todos">Todas as Áreas</option>
                    <option value="TI">TI / Tecnologia</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidatesList.map((cand) => (
                  <div key={cand.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 hover:shadow-md transition-shadow relative">
                    <span className="absolute top-4 right-4 bg-amber-500/10 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                      {cand.area}
                    </span>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">{cand.name}</h4>
                    <p className="text-slate-400 text-[10px] mb-3">{cand.city} - {cand.state} &bull; {cand.phone}</p>
                    
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                      {cand.experience}
                    </p>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          // Contract candidate simulation
                          const confirmContract = confirm(`Contratar ${cand.name} como colaborador?`);
                          if (confirmContract) {
                            const newEmp: Employee = {
                              id: `emp-${Date.now()}`,
                              name: cand.name,
                              email: cand.email,
                              phone: cand.phone,
                              department: cand.area,
                              role: `Analista de ${cand.area} Júnior`,
                              salary: 2800,
                              admissionDate: '2026-07-21',
                              status: 'Ativo'
                            };
                            onUpdateEmployees([...employees, newEmp]);
                            onUpdateCandidates(candidates.filter(c => c.id !== cand.id));
                            triggerToast(`✓ ${cand.name} contratado com sucesso e adicionado ao quadro de colaboradores!`);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-colors w-full"
                      >
                        Contratar Candidato
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- 3. PONTO ELETRÔNICO (CLOCK CONTROL) VIEW --- */}
        {activeTab === 'ponto' && (
          <div className="space-y-6" id="ponto-tab-content">

            {/* Quick Actions for Employee / Coordinator Requests */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-300" />
                  <span>Portal de Solicitações do Funcionário</span>
                </h3>
                <p className="text-emerald-100/80 text-xs mt-1">
                  Envie solicitações de horas extras, correções de ponto com foto de comprovantes e consulte o benefício de Vale Transporte.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setPortalModalType('hora_extra');
                    setPortalModalOpen(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Solicitar Hora Extra</span>
                </button>

                <button
                  onClick={() => {
                    setPortalModalType('correcao_ponto');
                    setPortalModalOpen(true);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center space-x-1.5"
                >
                  <Edit className="h-4 w-4" />
                  <span>Ajuste de Ponto</span>
                </button>

                <button
                  onClick={() => {
                    setPortalModalType('beneficios');
                    setPortalModalOpen(true);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center space-x-1.5"
                >
                  <Heart className="h-4 w-4" />
                  <span>Meus Benefícios / VT</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Interactive Simulator Card (Real-time Ponto Punch) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-1 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-700 mb-4">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-display font-bold text-sm">Registrador de Ponto Digital</h3>
                </div>
                
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  Simule o registro de ponto de entrada, almoço e saída de qualquer colaborador para o dia de hoje (<strong>2026-07-21</strong>).
                </p>

                <form onSubmit={handlePunchClockSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Colaborador</label>
                    <select
                      value={punchEmployeeId}
                      onChange={(e) => setPunchEmployeeId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Selecionar --</option>
                      {employees.filter(e => e.status !== 'Desligado').map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Registro</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer hover:bg-slate-50 text-xs">
                        <input 
                          type="radio" 
                          name="punchType" 
                          checked={punchActionType === 'entrada'} 
                          onChange={() => setPunchActionType('entrada')} 
                          className="text-emerald-600"
                        />
                        <span>Entrada</span>
                      </label>
                      <label className="border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer hover:bg-slate-50 text-xs">
                        <input 
                          type="radio" 
                          name="punchType" 
                          checked={punchActionType === 'almoco_saida'} 
                          onChange={() => setPunchActionType('almoco_saida')} 
                          className="text-emerald-600"
                        />
                        <span>Almoço Ida</span>
                      </label>
                      <label className="border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer hover:bg-slate-50 text-xs">
                        <input 
                          type="radio" 
                          name="punchType" 
                          checked={punchActionType === 'almoco_retorno'} 
                          onChange={() => setPunchActionType('almoco_retorno')} 
                          className="text-emerald-600"
                        />
                        <span>Almoço Volta</span>
                      </label>
                      <label className="border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer hover:bg-slate-50 text-xs">
                        <input 
                          type="radio" 
                          name="punchType" 
                          checked={punchActionType === 'saida'} 
                          onChange={() => setPunchActionType('saida')} 
                          className="text-emerald-600"
                        />
                        <span>Saída</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Horário (HH:MM)</label>
                    <input 
                      type="time" 
                      value={punchTime}
                      onChange={(e) => setPunchTime(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md"
                  >
                    Registrar Ponto
                  </button>
                </form>
              </div>

              {/* Point registers log list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-sm">Histórico de Registros de Ponto</h3>
                    <p className="text-slate-400 text-xs">Acompanhamento e auditoria de registros.</p>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome..."
                    value={pointSearch}
                    onChange={(e) => setPointSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4">Colaborador</th>
                        <th className="py-3 px-4">Data</th>
                        <th className="py-3 px-4">Entrada</th>
                        <th className="py-3 px-4">Almoço Saída / Retorno</th>
                        <th className="py-3 px-4">Saída</th>
                        <th className="py-3 px-4">Total / Extras</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTimeRegistersList.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{reg.employeeName}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">{reg.date.split('-').reverse().join('/')}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">{reg.clockIn || '--:--'}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {reg.lunchOut || '--:--'} &bull; {reg.lunchIn || '--:--'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{reg.clockOut || '--:--'}</td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-slate-900 block">{reg.totalHours}h total</span>
                            {reg.extraHours > 0 && (
                              <span className="text-amber-600 font-semibold text-[10px] block mt-0.5">+{reg.extraHours}h extras</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {reg.status === 'Pendente' ? (
                              <button 
                                onClick={() => handleApprovePoint(reg.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[9px] px-2.5 py-1 rounded-md"
                              >
                                Aprovar
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-semibold">✓ Aprovado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- 4. FOLHA DE PAGAMENTO VIEW --- */}
        {activeTab === 'folha' && (
          <div className="space-y-6" id="folha-tab-content">
            <PayrollModule
              employees={employees}
              timeRegisters={timeRegisters}
              employeeBenefits={employeeBenefits}
              payslips={payslips}
              extraHours={extraHours}
              inssBrackets={inssBrackets}
              irrfBrackets={irrfBrackets}
              onUpdatePayslips={onUpdatePayslips}
              settings={settings}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {/* --- 5. FÉRIAS VIEW --- */}
        {activeTab === 'ferias' && (
          <div className="space-y-6" id="ferias-tab-content">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Controle de Férias e Licenças</h3>
                <p className="text-slate-400 text-xs">Agende novas concessões de férias, monitore prazos e aprove solicitações pendentes.</p>
              </div>

              <button
                onClick={() => { setIsVacationModalOpen(true); setVacationEmpId(''); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Programar Férias</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Active vacations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-display font-bold text-sm text-slate-900 mb-4">Colaboradores em Férias Atualmente</h3>
                
                <div className="space-y-3">
                  {employees.filter(e => e.status === 'Em Férias').map((emp) => {
                    const activeVac = vacationRequests.find(r => r.employeeId === emp.id && r.status === 'Em andamento');
                    return (
                      <div key={emp.id} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{emp.name}</span>
                          <span className="text-slate-400 text-[11px] block mt-0.5">{emp.department} &bull; {emp.role}</span>
                          {activeVac && (
                            <span className="text-amber-700 text-[10px] font-medium block mt-2">
                              Período: {activeVac.startDate.split('-').reverse().join('/')} até {activeVac.endDate.split('-').reverse().join('/')} ({activeVac.days} dias)
                            </span>
                          )}
                        </div>
                        <span className="bg-amber-500 text-[#0b1d33] font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0">
                          FÉRIAS ATIVAS
                        </span>
                      </div>
                    );
                  })}
                  {employees.filter(e => e.status === 'Em Férias').length === 0 && (
                    <p className="text-slate-400 text-xs text-center py-6">Nenhum colaborador usufruindo férias no momento.</p>
                  )}
                </div>
              </div>

              {/* Vacation requests list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-display font-bold text-sm text-slate-900 mb-4">Solicitações e Planejamentos</h3>
                
                <div className="space-y-4">
                  {vacationRequests.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                          <span className="bg-slate-200 text-slate-700 text-[9px] px-2 py-0.5 rounded-full">{req.department}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          {req.startDate.split('-').reverse().join('/')} a {req.endDate.split('-').reverse().join('/')} &bull; <strong>{req.days} dias</strong>
                        </p>
                        <div className="mt-2 flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full 
                            ${req.status === 'Pendente' && 'bg-amber-500'}
                            ${req.status === 'Em andamento' && 'bg-emerald-500'}
                            ${req.status === 'Aprovado' && 'bg-emerald-500'}
                            ${req.status === 'Rejeitado' && 'bg-rose-500'}
                          `}></span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{req.status}</span>
                        </div>
                      </div>

                      {req.status === 'Pendente' && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleApproveVacation(req.id, 'Em andamento')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg"
                          >
                            Aprovar / Iniciar
                          </button>
                          <button
                            onClick={() => handleApproveVacation(req.id, 'Rejeitado')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] px-3 py-1.5 rounded-lg"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- 6. GESTÃO DOCUMENTAL VIEW --- */}
        {activeTab === 'documentos' && (
          <div className="space-y-6" id="documentos-tab-content">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Pasta Geral de Documentos de Funcionários</h3>
                <p className="text-slate-400 text-xs">Acesse contratos assinados, exames médicos periódicos e identificações oficiais de forma digitalizada.</p>
              </div>

              {(!currentUser || currentUser.role !== 'Funcionário') && (
                <button
                  onClick={() => { setIsDocModalOpen(true); setDocEmpId(''); }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-md"
                >
                  <Upload className="h-4 w-4" />
                  <span>Anexar Documento</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow relative flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-1 rounded-full">
                        {doc.category}
                      </span>
                      <span className="text-slate-400 text-[10px]">{doc.uploadDate}</span>
                    </div>

                    <h4 className="font-bold text-slate-950 text-sm mb-1">{doc.title}</h4>
                    <p className="text-slate-500 text-xs mb-3">Pertence a: <strong>{doc.employeeName}</strong></p>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center space-x-2 text-xs text-slate-600 font-mono">
                      <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="truncate flex-1">{doc.fileName}</span>
                      <span className="text-slate-400 text-[10px] shrink-0">{doc.fileSize}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => alert(`Simulação: Baixando arquivo ${doc.fileName}...`)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold text-xs inline-flex items-center space-x-1 hover:underline"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span>Download Arquivo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* --- 7. RELATÓRIOS (REPORTS) VIEW --- */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6" id="relatorios-tab-content">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Relatório Consolidado de Gestão de Pessoas</h3>
                <p className="text-slate-400 text-xs">Gere e baixe dados corporativos de headcount, distribuição salarial e horas extras.</p>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center space-x-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Imprimir Relatório</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Report distribution info cards */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Resumo Financeiro da Folha</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">TOTAL DE SALÁRIOS BASE</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">R$ {totalPayrollCost.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">MÉDIA SALARIAL</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      R$ {totalEmployeesCount > 0 ? Math.round(totalPayrollCost / (totalEmployeesCount - dismissedCount)).toLocaleString('pt-BR') : '0'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">HORAS EXTRAS TOTAIS</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">{totalExtraHoursMonth}h</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">PREVISTO ENCARGOS (12%)</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">R$ {Math.round(totalPayrollCost * 0.12).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl leading-relaxed">
                  <strong>Auditoria Mensal GestRH:</strong> Folha de pagamento consolidada sem pendências ativas de tributos estaduais ou trabalhistas.
                </div>
              </div>

              {/* Department representation stats */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-display font-bold text-sm text-slate-900 mb-4">Censo e Força de Trabalho por Setor</h3>
                
                <div className="space-y-3">
                  {deptChartData.map((dept, i) => {
                    const percent = Math.round((dept['Funcionários'] / (totalEmployeesCount - dismissedCount)) * 100) || 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{dept.name}</span>
                          <span className="font-mono text-slate-500">{dept['Funcionários']} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- 8. CONFIGURAÇÕES VIEW --- */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6" id="configuracoes-tab-content">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-6 border-b border-slate-100 pb-3">Parâmetros Gerais do Sistema</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); triggerToast('✓ Configurações salvas com sucesso!'); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Empresa</label>
                    <input 
                      type="text" 
                      defaultValue={settings.companyName}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail para Alertas de RH</label>
                    <input 
                      type="email" 
                      defaultValue={settings.contactEmail}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Multiplicador de Hora Extra</label>
                    <input 
                      type="number" 
                      step="0.1"
                      defaultValue={settings.extraHoursMultiplier}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Carga Horária Padrão Diária (Horas)</label>
                    <input 
                      type="number" 
                      defaultValue={settings.baseWorkHoursPerDay}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Físico Corporativo</label>
                  <input 
                    type="text" 
                    defaultValue={settings.address}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Salvar Preferências
                </button>
              </form>
            </div>

            {/* Configurable INSS and IRRF Tax Tables */}
            <TaxTablesModule
              inssBrackets={inssBrackets}
              irrfBrackets={irrfBrackets}
              onUpdateInssBrackets={onUpdateInssBrackets}
              onUpdateIrrfBrackets={onUpdateIrrfBrackets}
              triggerToast={triggerToast}
            />

          </div>
        )}

        {/* --- CENTRAL DE APROVAÇÕES DE HORAS EXTRAS & CORREÇÃO DE PONTO --- */}
        {activeTab === 'aprovacoes' && (
          <ExtraHoursApprovalModule
            extraHours={extraHours}
            pointCorrections={pointCorrections}
            employees={employees}
            currentUser={currentUser}
            onUpdateExtraHours={onUpdateExtraHours}
            onUpdatePointCorrections={onUpdatePointCorrections}
            triggerToast={triggerToast}
          />
        )}

        {/* --- 9. RECRUTAMENTO E SELEÇÃO --- */}
        {activeTab === 'recrutamento' && (
          <RecruitmentModule 
            jobs={jobs}
            candidates={candidates}
            onUpdateJobs={onUpdateJobs}
            onUpdateCandidates={onUpdateCandidates}
            triggerToast={triggerToast}
          />
        )}

        {/* --- 10. BANCO DE TALENTOS --- */}
        {activeTab === 'banco-talentos' && (
          <TalentBankModule 
            candidates={candidates}
            jobs={jobs}
            onUpdateCandidates={onUpdateCandidates}
            triggerToast={triggerToast}
          />
        )}

        {/* --- 11. CONTRATAÇÃO & ONBOARDING --- */}
        {activeTab === 'contratacao' && (
          <OnboardingModule 
            contracts={contracts}
            employees={employees}
            onUpdateContracts={onUpdateContracts}
            onUpdateEmployees={onUpdateEmployees}
            triggerToast={triggerToast}
          />
        )}

        {/* --- 12. GESTÃO DE BENEFÍCIOS --- */}
        {activeTab === 'beneficios' && (
          <BenefitsModule 
            benefits={benefits}
            employeeBenefits={employeeBenefits}
            employees={employees}
            onUpdateBenefits={onUpdateBenefits}
            onUpdateEmployeeBenefits={onUpdateEmployeeBenefits}
            triggerToast={triggerToast}
          />
        )}

        {/* --- 13. RESCISÃO & OFFBOARDING --- */}
        {activeTab === 'rescisao' && (
          <TerminationModule 
            terminations={terminations}
            employees={employees}
            onUpdateTerminations={onUpdateTerminations}
            onUpdateEmployees={onUpdateEmployees}
            triggerToast={triggerToast}
            currentUser={currentUser}
          />
        )}

        {/* --- 14. ASSISTENTE IA RH --- */}
        {activeTab === 'chat-ia' && (
          <AIChatModule />
        )}

        {/* --- 15. CONSULTOR DE RH MODULE --- */}
        {activeTab === 'consultor-rh' && (
          <ConsultorRHModule subTab={consultorSubTab} onSubTabChange={setConsultorSubTab} />
        )}

        {/* --- 16. ENTREVISTA INTELIGENTE COM IA MODULE (DENTRO DE RECRUTAMENTO & SELEÇÃO) --- */}
        {activeTab === 'entrevistas-ia' && (
          <RecruitmentModule 
            initialTab="entrevistas"
            jobs={jobs}
            candidates={candidates}
            onUpdateJobs={onUpdateJobs}
            onUpdateCandidates={onUpdateCandidates}
            triggerToast={triggerToast}
          />
        )}

      </main>

      {/* --- ADMIN MODALS --- */}

      {/* 1. Add/Edit Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            <div className="bg-[#047857] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base">
                  {editingEmployee ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}
                </h3>
                <p className="text-emerald-100 text-[10px] font-semibold mt-0.5 uppercase">
                  {editingEmployee ? 'Atualize os dados no banco' : 'Cadastre no quadro de funcionários'}
                </p>
              </div>
              <button 
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Nome completo do funcionário"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Corporativo *</label>
                  <input 
                    type="email" 
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="email@gestrh.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Celular corporativo</label>
                  <input 
                    type="tel" 
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento *</label>
                  <select 
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  >
                    <option value="TI">TI</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Logística">Logística</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo *</label>
                  <input 
                    type="text" 
                    required
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    placeholder="Ex: Desenvolvedor React"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salário Bruto Mensal *</label>
                  <input 
                    type="number" 
                    required
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                    placeholder="Valor em Real (R$)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Contratual</label>
                  <select 
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as EmployeeStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em Férias">Em Férias</option>
                    <option value="Afastado">Afastado</option>
                    <option value="Desligado">Desligado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Admissão</label>
                  <input 
                    type="date" 
                    value={empAdmission}
                    onChange={(e) => setEmpAdmission(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
              </div>

              {/* Coordinator and IRRF Dependents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coordenador Direto</label>
                  <select
                    value={empCoordinatorId}
                    onChange={(e) => setEmpCoordinatorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  >
                    <option value="">-- Selecionar Coordenador --</option>
                    {employees.filter(e => e.id !== editingEmployee?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.department} - {c.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nº de Dependentes (IRRF)</label>
                  <input
                    type="number"
                    min="0"
                    value={empDependentsCount}
                    onChange={(e) => setEmpDependentsCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Vale Transporte Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Benefício Vale Transporte (VT CLT)</span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={empHasVT}
                      onChange={(e) => setEmpHasVT(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-emerald-800">Possui VT?</span>
                  </label>
                </div>

                {empHasVT && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor da Passagem (R$)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={empTicketPrice}
                        onChange={(e) => setEmpTicketPrice(e.target.value)}
                        placeholder="Ex: 4.40"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dias Utilizados/Mês</label>
                      <input
                        type="number"
                        value={empDaysUsed}
                        onChange={(e) => setEmpDaysUsed(e.target.value)}
                        placeholder="22"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div className="col-span-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 flex justify-between items-center">
                      <span>Desconto Máx. de 6% do Salário Base:</span>
                      <strong className="font-bold text-emerald-900">
                        - R$ {Math.min(
                          (parseFloat(empTicketPrice) || 0) * (parseInt(empDaysUsed) || 22) * 2,
                          (parseFloat(empSalary) || 0) * 0.06
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#047857] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Programar Férias Modal */}
      {isVacationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-[#047857] text-white p-5 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm">Programar Férias de Colaborador</h3>
              <button onClick={() => setIsVacationModalOpen(false)} className="text-emerald-100 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleVacationSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Colaborador</label>
                <select
                  value={vacationEmpId}
                  onChange={(e) => setVacationEmpId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                >
                  <option value="">-- Selecionar --</option>
                  {employees.filter(e => e.status !== 'Desligado').map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Início do Período</label>
                  <input 
                    type="date" 
                    required
                    value={vacationStart}
                    onChange={(e) => setVacationStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fim do Período</label>
                  <input 
                    type="date" 
                    required
                    value={vacationEnd}
                    onChange={(e) => setVacationEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsVacationModalOpen(false)} className="bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl">Programar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-[#047857] text-white p-5 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm">Anexar Documento de Colaborador</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-emerald-100 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDocSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Colaborador Pertencente</label>
                <select
                  value={docEmpId}
                  onChange={(e) => setDocEmpId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                >
                  <option value="">-- Selecionar --</option>
                  {employees.filter(e => e.status !== 'Desligado').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Documento *</label>
                <input 
                  type="text" 
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Ex: Atestado de Saúde Ocupacional"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs"
                >
                  <option value="Contrato">Contrato</option>
                  <option value="Identidade">Identidade</option>
                  <option value="Comprovante">Comprovante</option>
                  <option value="Exame Médico">Exame Médico</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selecionar Arquivo PDF *</label>
                <input 
                  type="file" 
                  required
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsDocModalOpen(false)} className="bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl">Anexar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Payslip Holerite Modal View */}
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden font-mono text-xs text-slate-800 p-8">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="font-bold text-sm tracking-tight">{settings.companyName.toUpperCase()}</h3>
                <p className="text-[10px] mt-1">{settings.address}</p>
                <p className="text-[10px]">CNPJ: 45.582.827/0001-01</p>
              </div>
              <div className="text-right">
                <span className="font-bold border border-slate-800 px-3 py-1.5 inline-block">DEMONSTRATIVO DE PAGAMENTO</span>
                <p className="text-[10px] mt-2">Mês de Referência: <strong>{viewingPayslip.month.split('-').reverse().join('/')}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 mb-4">
              <div>
                <p>Cód. Func: <strong>{viewingPayslip.employeeId}</strong></p>
                <p className="font-bold text-slate-900 mt-1">Nome: {viewingPayslip.employeeName}</p>
              </div>
              <div className="text-right">
                <p>Banco: Itau S/A &bull; Ag: 3456 CC: 23456-1</p>
                <p className="mt-1">Status: <strong>{viewingPayslip.status}</strong></p>
              </div>
            </div>

            {/* Holerite Items table */}
            <table className="w-full text-left border-collapse border border-slate-200 mb-6">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-200">
                  <th className="p-2">Cód</th>
                  <th className="p-2">Descrição</th>
                  <th className="p-2 text-right">Vencimentos</th>
                  <th className="p-2 text-right">Descontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2">101</td>
                  <td className="p-2">Salário Base Mensal</td>
                  <td className="p-2 text-right">R$ {viewingPayslip.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2 text-right">--</td>
                </tr>
                {viewingPayslip.extraHoursEarnings > 0 && (
                  <tr>
                    <td className="p-2">204</td>
                    <td className="p-2">Adicional de Horas Extras (150%)</td>
                    <td className="p-2 text-right">R$ {viewingPayslip.extraHoursEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 text-right">--</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2">501</td>
                  <td className="p-2">Retenção Previdenciária (INSS)</td>
                  <td className="p-2 text-right">--</td>
                  <td className="p-2 text-right">R$ {viewingPayslip.deductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-800 pt-4 mb-8">
              <div>
                <p>Total Vencimentos: <strong>R$ {(viewingPayslip.baseSalary + viewingPayslip.extraHoursEarnings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                <p>Total Descontos: <strong>R$ {viewingPayslip.deductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
              </div>
              <div className="text-right">
                <span className="text-sm bg-slate-950 text-white px-4 py-2 font-bold inline-block">
                  LÍQUIDO A RECEBER: R$ {viewingPayslip.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <p>Gerado pelo GestRH em 21/07/2026. Assinado digitalmente.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded"
                >
                  Imprimir
                </button>
                <button 
                  onClick={() => setViewingPayslip(null)}
                  className="bg-slate-200 text-slate-800 hover:bg-slate-300 font-bold px-3 py-1.5 rounded"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Employee Portal Requests Modal */}
      {portalModalOpen && (
        <EmployeePortalRequestsModal
          employee={employees.find(e => e.email === currentUser?.email) || employees[0]}
          isOpen={portalModalOpen}
          type={portalModalType}
          onClose={() => setPortalModalOpen(false)}
          coordinators={employees.filter(e => (e.role || '').toLowerCase().includes('coordenador') || (e.role || '').toLowerCase().includes('gerente') || (e.role || '').toLowerCase().includes('líder'))}
          onSubmitExtraHour={(req) => onUpdateExtraHours([...extraHours, req])}
          onSubmitPointCorrection={(req) => onUpdatePointCorrections([...pointCorrections, req])}
          triggerToast={triggerToast}
        />
      )}

    </div>
  );
}
