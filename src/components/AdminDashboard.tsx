/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import PointAccessManager from './PointAccessManager';
import FirstAccessModal from './FirstAccessModal';
import MasterVisualBuilder from './MasterVisualBuilder';
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
  ChevronDown,
  Palette,
  Key,
  Lock,
  Unlock,
  Send,
  Share2,
  MessageSquare,
  Mail,
  RefreshCw,
  Copy,
  ShieldAlert,
  Eye,
  ShieldCheck,
  Shield,
  UserPlus,
  ExternalLink,
  MapPin,
  Camera,
  Scan,
  Navigation,
  Maximize2
} from 'lucide-react';

import { firebaseService } from '../firebase';

import { layoutService, CompanyLayoutConfig } from '../services/layoutService';

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

import { UserAccount, EmployeeAccessPermissions } from '../types_master';

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
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';

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
  onUpdateCurrentUser?: (user: UserAccount) => void;
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
  onUpdateCurrentUser,
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
  const [isWorkspaceHubOpen, setIsWorkspaceHubOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

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

  // SaaS Company Custom Layout Config with Real-Time Firestore Sync
  const [currentCompanyLayout, setCurrentCompanyLayout] = useState<CompanyLayoutConfig>(() => {
    const compId = currentUser?.companyId || 'company-1';
    return layoutService.getCompanyLayout(compId, settings?.companyName || 'Empresa ABC');
  });

  useEffect(() => {
    const compId = currentUser?.companyId || 'company-1';
    
    // Async fetch from Firestore so client page always has latest saved layout
    layoutService.loadCompanyLayoutAsync(compId, settings?.companyName || 'Empresa ABC').then(loaded => {
      setCurrentCompanyLayout(loaded);
      layoutService.applyCompanyStylesToDOM(loaded);
    });

    // Real-time listener for layout changes saved in Master / Client editor
    const handleLayoutUpdated = (e: any) => {
      const updatedLayoutFromEvent = e.detail;
      const eventCompId = updatedLayoutFromEvent?.companyId;
      if (!eventCompId || eventCompId === compId) {
        if (updatedLayoutFromEvent && updatedLayoutFromEvent.identity) {
          setCurrentCompanyLayout(updatedLayoutFromEvent);
          layoutService.applyCompanyStylesToDOM(updatedLayoutFromEvent);
        } else {
          const fresh = layoutService.getCompanyLayout(compId, settings?.companyName || 'Empresa ABC');
          setCurrentCompanyLayout(fresh);
          layoutService.applyCompanyStylesToDOM(fresh);
        }
      }
    };

    window.addEventListener('gestrh_layout_changed', handleLayoutUpdated);
    window.addEventListener('gestrh_global_designer_changed', handleLayoutUpdated);
    window.addEventListener('gestrh_client_models_changed', handleLayoutUpdated);

    return () => {
      window.removeEventListener('gestrh_layout_changed', handleLayoutUpdated);
      window.removeEventListener('gestrh_global_designer_changed', handleLayoutUpdated);
      window.removeEventListener('gestrh_client_models_changed', handleLayoutUpdated);
    };
  }, [currentUser, settings]);

  const companyLayout = currentCompanyLayout;

  // Menu customization helper
  const getCustomMenuLabel = (menuId: string, defaultName: string) => {
    const custom = companyLayout?.menus?.find(m => m.id === menuId || m.originalLabel.toLowerCase().includes(defaultName.toLowerCase()));
    return custom?.customLabel || defaultName;
  };

  const isMenuVisible = (menuId: string) => {
    const item = companyLayout?.menus?.find(m => m.id === menuId);
    return item ? item.visible : true;
  };

  // Master Visual Builder (Master Designer No-Code)
  const [isMasterBuilderModalOpen, setIsMasterBuilderModalOpen] = useState(false);
  const [builderInitialPageId, setBuilderInitialPageId] = useState<string>('page-dashboard');

  const getPageIdFromTab = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'page-dashboard';
      case 'funcionarios': return 'page-rh-emp';
      case 'ponto':
      case 'acessos-ponto': return 'page-rh-ponto';
      case 'folha': return 'page-rh-hol';
      case 'ferias': return 'page-rh-ferias';
      case 'beneficios': return 'page-rh-ben';
      case 'vagas': return 'page-rec-vagas';
      case 'triagem':
      case 'recrutamento': return 'page-rec-ats';
      case 'banco-talentos': return 'page-rec-talentos';
      case 'entrevistas-ia': return 'page-rec-ia';
      case 'relatorios': return 'page-reports';
      case 'configuracoes': return 'page-config';
      case 'chat-ia': return 'page-chat-ia';
      default: return 'page-dashboard';
    }
  };

  const handleOpenPageEditor = () => {
    const pageId = getPageIdFromTab(activeTab);
    setBuilderInitialPageId(pageId);
    setIsMasterBuilderModalOpen(true);
  };

  // Layout Request Modal for Client Admin
  const [isLayoutRequestModalOpen, setIsLayoutRequestModalOpen] = useState(false);
  const [layoutRequestText, setLayoutRequestText] = useState('');

  const handleSendLayoutRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!layoutRequestText.trim()) return;
    layoutService.addChangeRequest({
      companyId: currentUser?.companyId || 'company-1',
      companyName: settings?.companyName || 'Empresa ABC',
      requestedBy: currentUser?.name || 'Administrador do Cliente',
      description: layoutRequestText
    });
    setIsLayoutRequestModalOpen(false);
    setLayoutRequestText('');
    triggerToast('✓ Solicitação de alteração de layout enviada com sucesso para a equipe MASTER!');
  };

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
  
  // Real-time clock & Date state
  const [realTimeClock, setRealTimeClock] = useState('');
  const [realTimeDateStr, setRealTimeDateStr] = useState('');
  const [useRealTimeClock, setUseRealTimeClock] = useState(true);
  const [punchTime, setPunchTime] = useState('');

  // Geolocation state
  const [punchLocation, setPunchLocation] = useState('Obtendo geolocalização GPS...');
  const [punchCoords, setPunchCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Facial Recognition Biometrics state
  const [facialActive, setFacialActive] = useState(true);
  const [facialScanning, setFacialScanning] = useState(false);
  const [facialMatchScore, setFacialMatchScore] = useState(99.8);
  const [capturedFacialPhoto, setCapturedFacialPhoto] = useState<string | null>(null);

  // Detail Modal for TimeRegister receipt
  const [viewingTimeRegisterDetail, setViewingTimeRegisterDetail] = useState<TimeRegister | null>(null);

  // Real-Time Clock Interval Effect
  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStrWithSeconds = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const timeShort = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateFormatted = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
      
      setRealTimeClock(timeStrWithSeconds);
      setRealTimeDateStr(dateFormatted);

      if (useRealTimeClock) {
        setPunchTime(timeShort);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [useRealTimeClock]);

  // Automatic GPS Geolocation Fetch
  const fetchCurrentLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          setPunchCoords({ lat, lng });
          setPunchLocation(`São Paulo, SP - Brasil (GPS: ${lat}, ${lng})`);
          setIsGettingLocation(false);
        },
        (err) => {
          console.warn('GPS fallback:', err);
          setPunchCoords({ lat: -23.5505, lng: -46.6333 });
          setPunchLocation('Sede Matriz GestRH - São Paulo/SP (GPS Validado)');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setPunchCoords({ lat: -23.5505, lng: -46.6333 });
      setPunchLocation('Sede Matriz GestRH - São Paulo/SP (GPS Ativo)');
      setIsGettingLocation(false);
    }
  };

  React.useEffect(() => {
    fetchCurrentLocation();
  }, []);

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

  // System Access States
  const [systemUsers, setSystemUsers] = useState<UserAccount[]>([]);
  const [employeeModalTab, setEmployeeModalTab] = useState<'dados' | 'acesso'>('dados');
  const [tempPassAlert, setTempPassAlert] = useState<{
    isOpen: boolean;
    userName: string;
    userEmail: string;
    username: string;
    tempPass: string;
  } | null>(null);
  const [editingUserForm, setEditingUserForm] = useState<UserAccount | null>(null);
  const [inviteModalUser, setInviteModalUser] = useState<UserAccount | null>(null);

  // Load System Users
  const loadSystemUsers = async () => {
    try {
      const list = await firebaseService.db.getCollection<UserAccount>('USERS');
      setSystemUsers(list || []);
    } catch (err) {
      console.error('Error loading system users:', err);
    }
  };

  React.useEffect(() => {
    loadSystemUsers();
  }, []);

  const handleCreateAccess = async (targetEmp: Employee) => {
    if (!targetEmp || !targetEmp.id) return;

    // Check duplicate
    const existing = systemUsers.find(
      u => u.employeeId === targetEmp.id || u.email.trim().toLowerCase() === targetEmp.email.trim().toLowerCase()
    );
    if (existing) {
      triggerToast(`⚠️ Este colaborador já possui acesso cadastrado (${existing.email}).`);
      return;
    }

    const tempPass = `GestRH@${Math.floor(1000 + Math.random() * 9000)}`;
    const username = targetEmp.email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');

    const newAccess: UserAccount = {
      id: `usr-${Date.now()}`,
      email: targetEmp.email.trim(),
      name: targetEmp.name,
      username,
      role: 'Funcionário',
      companyId: targetEmp.companyId || 'company-1',
      employeeId: targetEmp.id,
      status: 'Ativo',
      temporaryPassword: tempPass,
      password: tempPass,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      lastLogin: 'Nunca acessou',
      permissions: {
        portalColaborador: true,
        aplicativoPonto: true,
        holerites: true,
        ferias: true,
        documentos: true,
        bancoHoras: true,
        beneficios: true
      }
    };

    try {
      await firebaseService.db.saveDoc('USERS', newAccess);
      await loadSystemUsers();
      triggerToast(`✓ Acesso ao sistema criado com sucesso para ${targetEmp.name}!`);
      setTempPassAlert({
        isOpen: true,
        userName: targetEmp.name,
        userEmail: targetEmp.email,
        username,
        tempPass
      });
    } catch (err: any) {
      alert(`Erro ao criar acesso: ${err.message || err}`);
    }
  };

  const handleResetPassword = async (user: UserAccount) => {
    const newPass = `GestRH@${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = {
      ...user,
      temporaryPassword: newPass,
      password: newPass
    };

    try {
      await firebaseService.db.saveDoc('USERS', updated);
      await loadSystemUsers();
      triggerToast(`✓ Senha redefinida com sucesso para ${user.name}!`);
      setTempPassAlert({
        isOpen: true,
        userName: user.name,
        userEmail: user.email,
        username: user.username || user.email.split('@')[0],
        tempPass: newPass
      });
    } catch (err: any) {
      alert(`Erro ao redefinir senha: ${err.message || err}`);
    }
  };

  const handleToggleUserStatus = async (user: UserAccount) => {
    const nextStatus: 'Ativo' | 'Bloqueado' = user.status === 'Ativo' ? 'Bloqueado' : 'Ativo';
    const updated = {
      ...user,
      status: nextStatus
    };

    try {
      await firebaseService.db.saveDoc('USERS', updated);
      await loadSystemUsers();
      triggerToast(`✓ Status de acesso alterado para: ${nextStatus === 'Ativo' ? '🟢 Ativo' : '🟠 Bloqueado'}`);
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message || err}`);
    }
  };

  const handleRemoveAccess = async (user: UserAccount) => {
    if (!confirm(`Tem certeza que deseja REMOVER O ACESSO AO SISTEMA de "${user.name}"?\n\nIMPORTANTE: O cadastro do funcionário no sistema NÃO será alterado nem excluído.`)) {
      return;
    }

    try {
      await firebaseService.db.deleteDoc('USERS', user.id);
      await loadSystemUsers();
      triggerToast(`✓ Acesso ao sistema do funcionário "${user.name}" foi removido. Cadastro preservado.`);
    } catch (err: any) {
      alert(`Erro ao remover acesso: ${err.message || err}`);
    }
  };

  const handleTogglePermission = async (linkedUser: UserAccount, key: keyof EmployeeAccessPermissions) => {
    const currentPerms = linkedUser.permissions || {
      portalColaborador: true,
      aplicativoPonto: true,
      holerites: true,
      ferias: true,
      documentos: true,
      bancoHoras: true,
      beneficios: true
    };
    const updatedPerms: EmployeeAccessPermissions = {
      ...currentPerms,
      [key]: !currentPerms[key]
    };
    const updatedUser: UserAccount = {
      ...linkedUser,
      permitirAplicativoPonto: updatedPerms.aplicativoPonto,
      permissions: updatedPerms,
      logs: [
        ...(linkedUser.logs || []),
        {
          id: `log-${Date.now()}`,
          action: 'Alteração',
          timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          performedBy: currentUser?.name || 'Administrador/RH',
          details: `Permissão do módulo "${key}" alterada para ${updatedPerms[key] ? 'LIBERADO' : 'BLOQUEADO'}`
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', updatedUser);
      await loadSystemUsers();
      triggerToast(`✓ Módulo ${updatedPerms[key] ? 'LIBERADO' : 'BLOQUEADO'} para ${linkedUser.name}`);
    } catch (err: any) {
      alert(`Erro ao alterar módulo: ${err.message || err}`);
    }
  };

  const handleToggleAllPermissions = async (linkedUser: UserAccount, enableAll: boolean) => {
    const updatedPerms: EmployeeAccessPermissions = {
      portalColaborador: enableAll,
      aplicativoPonto: enableAll,
      holerites: enableAll,
      ferias: enableAll,
      documentos: enableAll,
      bancoHoras: enableAll,
      beneficios: enableAll
    };
    const updatedUser: UserAccount = {
      ...linkedUser,
      permitirAplicativoPonto: enableAll,
      permissions: updatedPerms,
      logs: [
        ...(linkedUser.logs || []),
        {
          id: `log-${Date.now()}`,
          action: 'Alteração',
          timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          performedBy: currentUser?.name || 'Administrador/RH',
          details: enableAll ? 'Todos os módulos foram LIBERADOS' : 'Todos os módulos foram BLOQUEADOS'
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', updatedUser);
      await loadSystemUsers();
      triggerToast(enableAll ? `✓ Todos os módulos foram LIBERADOS para ${linkedUser.name}` : `⚠️ Todos os módulos foram BLOQUEADOS para ${linkedUser.name}`);
    } catch (err: any) {
      alert(`Erro ao alterar módulos: ${err.message || err}`);
    }
  };

  const sendWhatsAppInvite = (user: UserAccount, tempPass?: string) => {
    const pass = tempPass || user.temporaryPassword || user.password || 'GestRH@2026';
    const message = `Olá *${user.name}*!\n\nSeu acesso ao Portal do Colaborador *GestRH* foi liberado:\n\n*E-mail:* ${user.email}\n*Usuário:* ${user.username || user.email.split('@')[0]}\n*Senha Temporária:* ${pass}\n\nAcesse o portal no link: ${window.location.origin}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const sendEmailInvite = (user: UserAccount, tempPass?: string) => {
    const pass = tempPass || user.temporaryPassword || user.password || 'GestRH@2026';
    const subject = encodeURIComponent('Acesso ao Portal do Colaborador - GestRH');
    const body = encodeURIComponent(`Olá ${user.name},\n\nSeu acesso ao Portal do Colaborador GestRH foi criado com sucesso!\n\nE-mail de acesso: ${user.email}\nUsuário: ${user.username || user.email.split('@')[0]}\nSenha temporária: ${pass}\n\nAcesse o portal e realize seu login: ${window.location.origin}\n\nAtenciosamente,\nEquipe de RH`);
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmployeeModalTab('dados');
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

  const openEditEmployeeModal = (emp: Employee, tab: 'dados' | 'acesso' = 'dados') => {
    setEditingEmployee(emp);
    setEmployeeModalTab(tab);
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

    // Check point access permission
    if (emp.status === 'Desligado') {
      alert('🚫 Erro: O colaborador selecionado está DESLIGADO da empresa. Registro de ponto cancelado.');
      return;
    }

    const userAcc = systemUsers.find(u => u.employeeId === emp.id || u.email.trim().toLowerCase() === emp.email.trim().toLowerCase());
    if (userAcc) {
      if (userAcc.status === 'Bloqueado' || userAcc.status === 'Inativo') {
        alert(`🚫 Erro: O acesso ao ponto para "${emp.name}" está ${userAcc.status.toUpperCase()}. Fale com o Administrador/RH.`);
        return;
      }
      if (userAcc.permitirAplicativoPonto === false) {
        alert(`🚫 Erro: O aplicativo de ponto não está liberado para "${emp.name}". Liberar o acesso na aba "Acesso ao Ponto".`);
        return;
      }
    } else {
      alert(`⚠️ Erro: "${emp.name}" ainda não possui um acesso ao ponto criado pelo Administrador ou RH.`);
      return;
    }

    // Check if there is already a register for today
    const todayStr = new Date().toISOString().split('T')[0];
    const existingIndex = timeRegisters.findIndex(r => r.employeeId === punchEmployeeId && r.date === todayStr);

    if (existingIndex >= 0) {
      const existing = timeRegisters[existingIndex];
      const updatedRegister = { 
        ...existing,
        location: punchLocation,
        latitude: punchCoords?.lat,
        longitude: punchCoords?.lng,
        facialVerified: true,
        facialPhotoUrl: emp.avatar || capturedFacialPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

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
      triggerToast(`✓ Ponto atualizado para "${emp.name}" às ${punchTime} | GPS & Biometria Facial validados!`);

    } else {
      // Create new register
      const newReg: TimeRegister = {
        id: `tr-${Date.now()}`,
        employeeId: punchEmployeeId,
        employeeName: emp.name,
        date: todayStr,
        clockIn: punchActionType === 'entrada' ? punchTime : (punchTime || '08:00'),
        lunchOut: punchActionType === 'almoco_saida' ? punchTime : undefined,
        lunchIn: punchActionType === 'almoco_retorno' ? punchTime : undefined,
        clockOut: punchActionType === 'saida' ? punchTime : undefined,
        totalHours: 8.0,
        extraHours: 0,
        status: 'Aprovado',
        location: punchLocation,
        latitude: punchCoords?.lat,
        longitude: punchCoords?.lng,
        facialVerified: true,
        facialPhotoUrl: emp.avatar || capturedFacialPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

      onUpdateTimeRegisters([...timeRegisters, newReg]);
      triggerToast(`✓ Ponto registrado de ${punchActionType.replace('_', ' ').toUpperCase()} para "${emp.name}" às ${punchTime} com Reconhecimento Facial & GPS!`);
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
      <div 
        id="admin-mobile-header"
        style={{ backgroundColor: companyLayout?.identity?.secondaryColor || '#1e293b' }}
        className="text-white p-4 flex md:hidden items-center justify-between border-b border-white/10 shadow-md"
      >
        <div className="flex items-center space-x-2">
          {companyLayout?.identity?.logoUrl ? (
            <img src={companyLayout.identity.logoUrl} alt="Logo" className="h-6 w-auto object-contain rounded" />
          ) : (
            <Building2 className="h-6 w-6 text-slate-300" />
          )}
          <span className="font-display font-bold text-base">{companyLayout?.identity?.displayName || 'GestRH'}</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* --- SIDEBAR LAYOUT --- */}
      <aside 
        id="admin-main-sidebar"
        style={{ backgroundColor: companyLayout?.identity?.secondaryColor || '#1e293b' }}
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 text-white flex flex-col justify-between 
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
          transition-transform duration-300 ease-in-out border-r border-white/10 shrink-0 shadow-xl md:shadow-none
        `}
      >
        <div>
          {/* Company Brand Logo */}
          <div className="p-6 border-b border-white/10 flex items-center space-x-3 justify-between">
            <div className="flex items-center space-x-3">
              {companyLayout?.identity?.logoUrl ? (
                <img src={companyLayout.identity.logoUrl} alt="Logo" className="h-8 w-auto max-w-[120px] object-contain rounded" />
              ) : (
                <div 
                  className="p-2 rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: companyLayout?.identity?.primaryColor || '#475569' }}
                >
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <div>
                <h2 className="font-display font-bold text-lg leading-none">
                  {companyLayout?.identity?.displayName || 'GestRH'}
                </h2>
                <p className="text-white/70 text-[10px] tracking-wider uppercase font-semibold mt-0.5">
                  Plataforma de RH
                </p>
              </div>
            </div>
            <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] text-xs font-semibold" id="admin-sidebar-menu">
            
            {/* 1. VISÃO GERAL */}
            <div className="space-y-1">
              {(!currentUser || currentUser.role !== 'Funcionário') && isMenuVisible('dashboard') && (
                <button
                  onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${activeTab === 'dashboard' ? 'bg-slate-700 text-white shadow-md shadow-slate-950/20 font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <Sliders className="h-4 w-4 shrink-0" />
                  <span>{getCustomMenuLabel('dashboard', 'Dashboard Principal')}</span>
                </button>
              )}
            </div>

            {/* 2. GESTÃO DE PESSOAS */}
            {(!currentUser || currentUser.role !== 'Funcionário') && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  👥 Gestão de Pessoas
                </div>

                {releasedModules.includes('mod-1') && isMenuVisible('funcionarios') && (
                  <button
                    onClick={() => { setActiveTab('funcionarios'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'funcionarios' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <Users className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{getCustomMenuLabel('funcionarios', 'Funcionários')}</span>
                  </button>
                )}

                {releasedModules.includes('mod-11') && (
                  <button
                    onClick={() => { setActiveTab('contratacao'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'contratacao' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <FileSignature className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">Contratação & Onboarding</span>
                  </button>
                )}

                {releasedModules.includes('mod-12') && (
                  <button
                    onClick={() => { setActiveTab('rescisao'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'rescisao' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <UserMinus className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">Rescisões & Offboarding</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. RECRUTAMENTO E SELEÇÃO */}
            {(!currentUser || currentUser.role !== 'Funcionário') && (releasedModules.includes('mod-2') || releasedModules.includes('mod-3') || releasedModules.includes('mod-15')) && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  🎯 Recrutamento e Seleção
                </div>

                {releasedModules.includes('mod-2') && (
                  <>
                    <button
                      onClick={() => { setActiveTab('vagas'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'vagas' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                    >
                      <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="flex-1">Vagas de Emprego</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('triagem'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'triagem' || activeTab === 'recrutamento' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                    >
                      <Filter className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="flex-1">Triagem & Pipeline</span>
                    </button>
                  </>
                )}

                {releasedModules.includes('mod-15') && (
                  <button
                    onClick={() => { setActiveTab('entrevistas-ia'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'entrevistas-ia' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' : 'text-amber-300 hover:bg-slate-800/80'}`}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
                    <span className="flex-1 font-bold">Entrevista Inteligente (IA)</span>
                    <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase font-mono shadow-xs">
                      NOVO
                    </span>
                  </button>
                )}

                {releasedModules.includes('mod-3') && (
                  <button
                    onClick={() => { setActiveTab('banco-talentos'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'banco-talentos' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <Users className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">Banco de Talentos</span>
                  </button>
                )}
              </div>
            )}

            {/* 4. JORNADA E PONTO */}
            {releasedModules.includes('mod-6') && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ⏰ Jornada e Ponto
                </div>

                <button
                  onClick={() => { setActiveTab('ponto'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'ponto' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{currentUser?.role === 'Funcionário' ? 'Meu Ponto' : 'Ponto Eletrônico'}</span>
                </button>

                {(!currentUser || currentUser.role !== 'Funcionário') && (
                  <button
                    onClick={() => { setActiveTab('acessos-ponto'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'acessos-ponto' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">Acessos ao Ponto</span>
                  </button>
                )}

                {(!currentUser || currentUser.role !== 'Funcionário' || (currentUser.role as string) === 'Coordenador') && currentUser?.role !== 'Consultor RH' && (currentUser?.role as string) !== 'Consultor de RH' && (
                  <button
                    onClick={() => { setActiveTab('aprovacoes'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'aprovacoes' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">Aprovações & Horas Extras</span>
                  </button>
                )}
              </div>
            )}

            {/* 5. FOLHA DE PAGAMENTO & BENEFÍCIOS */}
            {(releasedModules.includes('mod-7') || releasedModules.includes('mod-9')) && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  💰 Folha e Benefícios
                </div>

                {releasedModules.includes('mod-7') && (
                  <button
                    onClick={() => { setActiveTab('folha'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'folha' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{currentUser?.role === 'Funcionário' ? 'Meus Holerites' : 'Folha de Pagamento'}</span>
                  </button>
                )}

                {(!currentUser || currentUser.role !== 'Funcionário') && releasedModules.includes('mod-9') && (
                  <button
                    onClick={() => { setActiveTab('beneficios'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'beneficios' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <Heart className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">Gestão de Benefícios</span>
                  </button>
                )}
              </div>
            )}

            {/* 6. FÉRIAS E DOCUMENTOS */}
            {releasedModules.includes('mod-1') && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  🏖 Férias e Documentos
                </div>

                <button
                  onClick={() => { setActiveTab('ferias'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'ferias' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{currentUser?.role === 'Funcionário' ? 'Minhas Férias' : 'Solicitações de Férias'}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('documentos'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'documentos' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{currentUser?.role === 'Funcionário' ? 'Meus Documentos' : 'Documentos do RH'}</span>
                </button>
              </div>
            )}

            {/* 7. RELATÓRIOS & CONSULTORIA */}
            {(!currentUser || currentUser.role !== 'Funcionário') && (releasedModules.includes('mod-10') || releasedModules.includes('mod-13') || releasedModules.includes('mod-14')) && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  📊 Relatórios e Inteligência
                </div>

                {releasedModules.includes('mod-10') && (
                  <button
                    onClick={() => { setActiveTab('relatorios'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'relatorios' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <TrendingUp className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Central de Relatórios</span>
                  </button>
                )}

                {releasedModules.includes('mod-13') && (
                  <button
                    onClick={() => { setIsAiAssistantOpen(prev => !prev); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all cursor-pointer ${isAiAssistantOpen ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 border border-emerald-500/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                  >
                    <Bot className={`h-4 w-4 shrink-0 ${isAiAssistantOpen ? 'text-white' : 'text-emerald-400'}`} />
                    <span className="flex-1">Assistente IA RH</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isAiAssistantOpen ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {isAiAssistantOpen ? 'Aberto' : 'Pop-up'}
                    </span>
                  </button>
                )}

                {releasedModules.includes('mod-14') && (
                  <div className="space-y-1">
                    <button
                      onClick={() => { setActiveTab('consultor-rh'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all cursor-pointer ${activeTab === 'consultor-rh' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' : 'text-amber-300 hover:bg-slate-800/80'}`}
                    >
                      <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
                      <span className="flex-1 font-bold">Consultor de RH</span>
                      <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
                        SaaS
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeTab === 'consultor-rh' ? 'rotate-180' : ''}`} />
                    </button>

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
                                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
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
              </div>
            )}

            {/* 8. CONFIGURAÇÕES */}
            {(!currentUser || (currentUser.role !== 'Funcionário' && currentUser.role !== 'RH')) && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ⚙️ Sistema
                </div>
                <button
                  onClick={() => { setActiveTab('configuracoes'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all ${activeTab === 'configuracoes' ? 'bg-slate-700 text-white shadow-md font-bold border border-slate-600/50' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <Settings className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Configurações & Tabelas</span>
                </button>
              </div>
            )}

          </nav>
        </div>

        {/* User profile details bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 bg-slate-700 text-white font-bold flex items-center justify-center rounded-full text-xs shrink-0 border border-slate-600">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-white leading-none">{currentUser?.name || 'Administrador'}</p>
              <p className="text-[9px] text-slate-400 truncate mt-1 uppercase font-mono font-bold tracking-wider">
                {currentUser?.role || 'Empresa Administradora'}
              </p>
            </div>
          </div>



          <button 
            id="btn-voltar-ao-portal"
            onClick={onLogout || onBackToPortal}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 text-slate-200 hover:text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
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
              {activeTab === 'acessos-ponto' && 'Acessos ao Aplicativo de Ponto'}
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

          {/* Right Area Actions & Date badge */}
          <div className="flex items-center space-x-3 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsWorkspaceHubOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 flex items-center space-x-2 transition cursor-pointer"
              title="Acessar Gmail, Google Meet e Google Chat"
            >
              <Mail className="h-4 w-4 text-emerald-600" />
              <span>Google Workspace</span>
            </button>

            {((currentUser?.role as string) === 'Master' || (currentUser?.role as string) === 'MASTER' || (currentUser?.role as string) === 'OWNER') && (
              <button
                type="button"
                onClick={handleOpenPageEditor}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 border border-amber-300 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Entrar no GestRH Builder para editar o layout desta página"
              >
                <Sparkles className="h-4 w-4 animate-pulse text-slate-950" />
                <span>Editar esta página</span>
              </button>
            )}

            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">
              terça-feira, 21 de julho
            </div>
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
                  onClick={() => setActiveTab('acessos-ponto')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2 shrink-0 transition-colors cursor-pointer"
                  title="Ir para a gestão central de logins e permissões do ponto eletrônico"
                >
                  <Lock className="h-4 w-4 text-emerald-600" />
                  <span>Gerenciar Acessos</span>
                </button>
                <button 
                  onClick={openAddEmployeeModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shrink-0 shadow-md shadow-emerald-600/10 cursor-pointer"
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
                      <th className="py-4 px-6">Acesso ao Sistema</th>
                      <th className="py-4 px-6">Data de Admissão</th>
                      <th className="py-4 px-6">Salário CLT</th>
                      <th className="py-4 px-6">Status Contratual</th>
                      <th className="py-4 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredEmployeesList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          Nenhum colaborador corresponde aos critérios de pesquisa.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployeesList.map(emp => {
                        const userAcc = systemUsers.find(u => u.employeeId === emp.id || u.email.trim().toLowerCase() === emp.email.trim().toLowerCase());
                        return (
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
                            <td className="py-4 px-6">
                              {!userAcc ? (
                                <button 
                                  onClick={() => openEditEmployeeModal(emp, 'acesso')}
                                  className="inline-flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-rose-200 shadow-xs cursor-pointer transition-colors"
                                  title="Clique para cadastrar/liberar acesso ao sistema para este colaborador"
                                >
                                  <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0" />
                                  <span>🔴 Sem acesso criado</span>
                                </button>
                              ) : userAcc.status === 'Ativo' ? (
                                <button 
                                  onClick={() => openEditEmployeeModal(emp, 'acesso')}
                                  className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200 shadow-xs cursor-pointer transition-colors"
                                  title="Clique para ver ou gerenciar o acesso deste colaborador"
                                >
                                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>🟢 Conta Ativa</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => openEditEmployeeModal(emp, 'acesso')}
                                  className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-200 shadow-xs cursor-pointer transition-colors"
                                  title="Clique para desbloquear ou gerenciar o acesso deste colaborador"
                                >
                                  <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                                  <span>🟠 Acesso Bloqueado</span>
                                </button>
                              )}
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
                              onClick={() => openEditEmployeeModal(emp, 'acesso')}
                              className="p-1.5 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors inline-block"
                              title="Cadastrar / Gerenciar Acesso ao Ponto"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => openEditEmployeeModal(emp, 'dados')}
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
                      );
                    })
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
              
              {/* Interactive Simulator Card (Real-time Ponto Punch with GPS and Facial Recognition) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-1 shadow-sm flex flex-col justify-between">
                <div>
                  {/* Header & Live Clock Banner */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <Clock className="h-5 w-5 animate-pulse text-emerald-600" />
                      <h3 className="font-display font-bold text-sm text-slate-900">Registrador de Ponto Digital</h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>AO VIVO</span>
                    </span>
                  </div>

                  {/* Real-time Clock Widget */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 mb-5 text-center relative overflow-hidden shadow-inner">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider block mb-1">
                      {realTimeDateStr || 'Hoje • Horário Oficial de Brasília'}
                    </span>
                    <div className="text-3xl font-mono font-extrabold tracking-widest text-emerald-300 drop-shadow">
                      {realTimeClock || '00:00:00'}
                    </div>
                  </div>

                  <form onSubmit={handlePunchClockSubmit} className="space-y-4">
                    {/* Employee Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Colaborador *</label>
                      <select
                        value={punchEmployeeId}
                        onChange={(e) => setPunchEmployeeId(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="">-- Selecionar --</option>
                        {employees.filter(e => e.status !== 'Desligado').map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                        ))}
                      </select>
                    </div>

                    {/* Punch Action Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Registro *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`border rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer transition-all text-xs font-semibold ${punchActionType === 'entrada' ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                          <input 
                            type="radio" 
                            name="punchType" 
                            checked={punchActionType === 'entrada'} 
                            onChange={() => setPunchActionType('entrada')} 
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Entrada</span>
                        </label>

                        <label className={`border rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer transition-all text-xs font-semibold ${punchActionType === 'almoco_saida' ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                          <input 
                            type="radio" 
                            name="punchType" 
                            checked={punchActionType === 'almoco_saida'} 
                            onChange={() => setPunchActionType('almoco_saida')} 
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Almoço Ida</span>
                        </label>

                        <label className={`border rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer transition-all text-xs font-semibold ${punchActionType === 'almoco_retorno' ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                          <input 
                            type="radio" 
                            name="punchType" 
                            checked={punchActionType === 'almoco_retorno'} 
                            onChange={() => setPunchActionType('almoco_retorno')} 
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Almoço Volta</span>
                        </label>

                        <label className={`border rounded-xl p-2.5 flex items-center space-x-2 cursor-pointer transition-all text-xs font-semibold ${punchActionType === 'saida' ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                          <input 
                            type="radio" 
                            name="punchType" 
                            checked={punchActionType === 'saida'} 
                            onChange={() => setPunchActionType('saida')} 
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Saída</span>
                        </label>
                      </div>
                    </div>

                    {/* Horário Atual & Sincronização */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Horário do Registro</span>
                        </label>
                        <label className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={useRealTimeClock}
                            onChange={(e) => setUseRealTimeClock(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Usar horário atual</span>
                        </label>
                      </div>

                      <input 
                        type="time" 
                        value={punchTime}
                        disabled={useRealTimeClock}
                        onChange={(e) => setPunchTime(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                      />
                      {useRealTimeClock && (
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Sincronizado automaticamente com o relógio do dispositivo ({realTimeClock})</span>
                        </p>
                      )}
                    </div>

                    {/* Localidade / Geolocalização GPS */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Localidade de Registro</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={fetchCurrentLocation}
                          disabled={isGettingLocation}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 bg-emerald-100/80 px-2 py-0.5 rounded-md transition-all"
                        >
                          <RefreshCw className={`h-3 w-3 ${isGettingLocation ? 'animate-spin' : ''}`} />
                          <span>Atualizar GPS</span>
                        </button>
                      </div>

                      <div className="flex items-start space-x-2 text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                        <Navigation className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800 text-[11px]">{punchLocation}</p>
                          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                            ✓ Validação de Cerca Geográfica (Geofence Ativo)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reconhecimento Facial / Biometria */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                          <Camera className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Reconhecimento Facial</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>IA Biométrica Ativa</span>
                        </span>
                      </div>

                      {/* Camera Viewfinder Simulation */}
                      <div className="relative bg-slate-900 rounded-xl p-3 text-center overflow-hidden border border-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none"></div>
                        
                        {/* Scanning frame animation */}
                        <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-emerald-400 p-1 flex items-center justify-center relative my-1">
                          <div className="w-full h-full rounded-full bg-emerald-950/80 overflow-hidden flex items-center justify-center relative">
                            {punchEmployeeId ? (
                              <img 
                                src={employees.find(e => e.id === punchEmployeeId)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                                alt="Face Scanner" 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <Scan className="h-8 w-8 text-emerald-400 animate-pulse" />
                            )}
                            {/* Scanning line animation */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                          </div>
                          <span className="absolute -bottom-1 right-0 bg-emerald-500 text-white rounded-full p-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <p className="text-[10px] font-mono text-emerald-300 font-bold mt-1">
                          MATCH BIOMÉTRICO: 99.8%
                        </p>
                        <p className="text-[9px] text-slate-400">
                          Anti-spoofing e Detecção de Liveness Validados
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Registrar Ponto (Horário + GPS + Facial)</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Point registers log list */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">Histórico de Registros de Ponto</h3>
                    <p className="text-slate-400 text-xs">Acompanhamento, auditoria biométrica e geolocalização.</p>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Filtrar por colaborador..."
                    value={pointSearch}
                    onChange={(e) => setPointSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-3">Colaborador</th>
                        <th className="py-3 px-3">Data</th>
                        <th className="py-3 px-3">Entrada / Saída</th>
                        <th className="py-3 px-3">Localização (GPS)</th>
                        <th className="py-3 px-3">Biometria</th>
                        <th className="py-3 px-3">Total / Extras</th>
                        <th className="py-3 px-3 text-right">Comprovante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTimeRegistersList.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center space-x-2">
                              {reg.facialPhotoUrl ? (
                                <img src={reg.facialPhotoUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-emerald-200" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                                  {reg.employeeName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 block">{reg.employeeName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {reg.employeeId}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-slate-600 font-medium">
                            {reg.date.split('-').reverse().join('/')}
                          </td>

                          <td className="py-3.5 px-3 font-mono">
                            <div className="space-y-0.5 text-[11px]">
                              <div><span className="text-slate-400 text-[9px]">Entrada:</span> <strong className="text-emerald-700">{reg.clockIn || '--:--'}</strong></div>
                              {reg.clockOut && <div><span className="text-slate-400 text-[9px]">Saída:</span> <strong className="text-slate-800">{reg.clockOut}</strong></div>}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center space-x-1 text-slate-700 max-w-[140px] truncate" title={reg.location || 'São Paulo, SP'}>
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate text-[11px] font-medium">{reg.location ? reg.location.split('-')[0] : 'São Paulo, SP'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              <span>Facial OK</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono">
                            <span className="font-bold text-slate-900 block">{reg.totalHours}h</span>
                            {reg.extraHours > 0 && (
                              <span className="text-amber-600 font-semibold text-[10px] block">+{reg.extraHours}h extras</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <button 
                              type="button"
                              onClick={() => setViewingTimeRegisterDetail(reg)}
                              className="bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all inline-flex items-center space-x-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Ver</span>
                            </button>
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

        {/* --- ACESSOS AO PONTO ELETRÔNICO VIEW --- */}
        {activeTab === 'acessos-ponto' && (
          <PointAccessManager
            currentUser={currentUser}
            employees={employees}
            systemUsers={systemUsers}
            onRefreshUsers={loadSystemUsers}
            onOpenEmployeeModal={(emp, tab) => openEditEmployeeModal(emp, tab === 'dados' ? 'dados' : 'acesso')}
            triggerToast={triggerToast}
          />
        )}
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

        {/* --- 9. RECRUTAMENTO E SELEÇÃO - VAGAS --- */}
        {activeTab === 'vagas' && (
          <RecruitmentModule 
            initialTab="vagas"
            jobs={jobs}
            candidates={candidates}
            onUpdateJobs={onUpdateJobs}
            onUpdateCandidates={onUpdateCandidates}
            triggerToast={triggerToast}
          />
        )}

        {/* --- 9. RECRUTAMENTO E SELEÇÃO - TRIAGEM & PIPELINE --- */}
        {(activeTab === 'triagem' || activeTab === 'recrutamento') && (
          <RecruitmentModule 
            initialTab="triagem"
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="bg-[#047857] text-white p-5 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-bold text-base">
                    {editingEmployee ? `Editar: ${editingEmployee.name}` : 'Adicionar Novo Colaborador'}
                  </h3>
                  {editingEmployee && (() => {
                    const acc = systemUsers.find(u => u.employeeId === editingEmployee.id || u.email.trim().toLowerCase() === editingEmployee.email.trim().toLowerCase());
                    if (!acc) return <span className="text-[10px] bg-rose-500/30 text-rose-100 font-bold px-2 py-0.5 rounded-full border border-rose-300/30">🔴 Sem acesso criado</span>;
                    if (acc.status === 'Ativo') return <span className="text-[10px] bg-emerald-400/30 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">🟢 Conta Ativa</span>;
                    return <span className="text-[10px] bg-amber-400/30 text-amber-100 font-bold px-2 py-0.5 rounded-full border border-amber-300/30">🟠 Acesso Bloqueado</span>;
                  })()}
                </div>
                <p className="text-emerald-100 text-[10px] font-semibold mt-0.5 uppercase">
                  {editingEmployee ? 'Atualize os dados e gerencie a conta de acesso ao sistema' : 'Cadastre no quadro de funcionários'}
                </p>
              </div>
              <button 
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3">
              <button
                type="button"
                onClick={() => setEmployeeModalTab('dados')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
                  employeeModalTab === 'dados'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>👤 Dados Cadastrais</span>
              </button>

              <button
                type="button"
                onClick={() => setEmployeeModalTab('acesso')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
                  employeeModalTab === 'acesso'
                    ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>🔐 Acesso ao Sistema</span>
                {editingEmployee && (() => {
                  const acc = systemUsers.find(u => u.employeeId === editingEmployee.id || u.email.trim().toLowerCase() === editingEmployee.email.trim().toLowerCase());
                  return acc ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-rose-500 inline-block"></span>
                  );
                })()}
              </button>
            </div>

            {/* TAB 1: DADOS CADASTRAIS FORM */}
            {employeeModalTab === 'dados' && (
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
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#047857] hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Confirmar Cadastro
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: ACESSO AO SISTEMA */}
            {employeeModalTab === 'acesso' && (
              <div className="p-6 space-y-5">
                {!editingEmployee ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                    <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-900">Salve o colaborador primeiro</h4>
                      <p className="text-xs text-amber-700 mt-1 max-w-sm mx-auto">
                        Preencha e confirme o formulário na aba <strong>Dados Cadastrais</strong> para cadastrar o funcionário e liberar o gerenciamento de acesso ao sistema.
                      </p>
                    </div>
                  </div>
                ) : (() => {
                  const linkedUser = systemUsers.find(
                    u => u.employeeId === editingEmployee.id || u.email.trim().toLowerCase() === editingEmployee.email.trim().toLowerCase()
                  );

                  if (!linkedUser) {
                    return (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Status Header */}
                        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                              <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-rose-900 block">🔴 Sem acesso criado</span>
                              <span className="text-[11px] text-rose-700 block">Este funcionário ainda não possui login no Portal do Colaborador.</span>
                            </div>
                          </div>
                        </div>

                        {/* Summary Details Table */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                          <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-500 font-medium">Status da Conta:</span>
                            <span className="font-bold text-rose-600">Sem acesso criado</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-500 font-medium">Usuário sugerido:</span>
                            <span className="font-mono text-slate-800 font-bold">{editingEmployee.email.split('@')[0]}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-500 font-medium">E-mail de Acesso:</span>
                            <span className="font-semibold text-slate-800">{editingEmployee.email}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-500 font-medium">Perfil de Acesso:</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Funcionário</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">ID de Vínculo:</span>
                            <span className="font-mono text-[11px] text-slate-600">{editingEmployee.id}</span>
                          </div>
                        </div>

                        {/* Unlocked Features List */}
                        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 text-xs space-y-2.5">
                          <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">
                            Módulos e Recursos que serão liberados:
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 font-medium">
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Portal do Colaborador</span></div>
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Aplicativo de Ponto</span></div>
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Holerites</span></div>
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Férias</span></div>
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Documentos</span></div>
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Banco de Horas</span></div>
                            <div className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span>Benefícios</span></div>
                          </div>
                        </div>

                        {/* Action Button: Criar Acesso */}
                        <button
                          type="button"
                          onClick={() => handleCreateAccess(editingEmployee)}
                          className="w-full bg-[#047857] hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.01]"
                        >
                          <Key className="h-5 w-5" />
                          <span>Criar Acesso ao Sistema</span>
                        </button>
                      </div>
                    );
                  }

                  // If user ALREADY has access
                  return (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Header Status Card */}
                      <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-2xs ${
                        linkedUser.status === 'Ativo' ? 'bg-emerald-50/90 border-emerald-200' : 'bg-amber-50/90 border-amber-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            linkedUser.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block">
                              {linkedUser.status === 'Ativo' ? '🟢 Conta Ativa' : '🟠 Acesso Bloqueado'}
                            </span>
                            <span className="text-[11px] text-slate-600 block mt-0.5">
                              Vinculado ao funcionário: <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">{editingEmployee.id}</code>
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          linkedUser.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/40' : 'bg-amber-100 text-amber-800 border border-amber-300/40'
                        }`}>
                          {linkedUser.status}
                        </span>
                      </div>

                      {/* Access Attributes Table */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">Usuário:</span>
                          <span className="font-mono font-bold text-slate-900">{linkedUser.username || linkedUser.email.split('@')[0]}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">E-mail de Acesso:</span>
                          <span className="font-semibold text-slate-900">{linkedUser.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">Perfil de Acesso:</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Funcionário</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">Último Login:</span>
                          <span className="font-mono text-slate-700">{linkedUser.lastLogin || 'Nunca acessou'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-slate-500 font-medium">Data de Criação:</span>
                          <span className="font-mono text-slate-700">{linkedUser.createdAt || '21/07/2026'}</span>
                        </div>
                        <div className="flex justify-between pt-0.5">
                          <span className="text-slate-500 font-medium">Senha Temporária:</span>
                          <span className="font-mono text-slate-800 font-bold bg-slate-200/70 px-2 py-0.5 rounded">{linkedUser.temporaryPassword || linkedUser.password || 'GestRH@2026'}</span>
                        </div>
                      </div>

                      {/* Permissions List / Interactive Module Access Configurator */}
                      <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <div>
                            <span className="font-extrabold text-emerald-950 block text-[11px] uppercase tracking-wider">
                              Módulos Liberados para o Colaborador
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Marque/desmarque para liberar ou revogar o acesso do colaborador.
                            </span>
                          </div>
                          <div className="flex space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleAllPermissions(linkedUser, true)}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Liberar todos os módulos"
                            >
                              Liberar Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAllPermissions(linkedUser, false)}
                              className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Bloquear todos os módulos"
                            >
                              Bloquear Todos
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {[
                            { key: 'portalColaborador', label: 'Portal do Colaborador', desc: 'Acesso ao dashboard principal' },
                            { key: 'aplicativoPonto', label: 'Aplicativo de Ponto', desc: 'Registro de ponto eletrônico' },
                            { key: 'holerites', label: 'Holerites & Contracheques', desc: 'Visualização de holerites' },
                            { key: 'ferias', label: 'Solicitações de Férias', desc: 'Solicitar e acompanhar férias' },
                            { key: 'documentos', label: 'Gestão de Documentos', desc: 'Envio de comprovantes e arquivos' },
                            { key: 'bancoHoras', label: 'Banco de Horas', desc: 'Extrato de horas acumuladas' },
                            { key: 'beneficios', label: 'Gestão de Benefícios', desc: 'Consulta de VT, VR e planos' },
                          ].map((m) => {
                            const perms = linkedUser.permissions || {
                              portalColaborador: true,
                              aplicativoPonto: true,
                              holerites: true,
                              ferias: true,
                              documentos: true,
                              bancoHoras: true,
                              beneficios: true,
                            };
                            const isAllowed = perms[m.key as keyof EmployeeAccessPermissions] !== false;

                            return (
                              <div
                                key={m.key}
                                onClick={() => handleTogglePermission(linkedUser, m.key as keyof EmployeeAccessPermissions)}
                                className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isAllowed
                                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs hover:bg-emerald-100/80'
                                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-80 hover:opacity-100 hover:bg-slate-100/80'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  readOnly
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0 pointer-events-none"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className={`font-bold text-[11px] leading-tight ${isAllowed ? 'text-emerald-950' : 'text-slate-600'}`}>
                                      {m.label}
                                    </span>
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                                      isAllowed ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                      {isAllowed ? 'Liberado' : 'Bloqueado'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{m.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Buttons Grid */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ações de Gerenciamento do Acesso:</span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {/* Redefinir Senha */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(linkedUser)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Redefinir Senha</span>
                          </button>

                          {/* Editar Usuário */}
                          <button
                            type="button"
                            onClick={() => setEditingUserForm(linkedUser)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-700" />
                            <span>Editar Usuário</span>
                          </button>

                          {/* Bloquear / Desbloquear */}
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(linkedUser)}
                            className={`font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                              linkedUser.status === 'Ativo'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {linkedUser.status === 'Ativo' ? (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                <span>Bloquear Acesso</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3.5 w-3.5" />
                                <span>Desbloquear Acesso</span>
                              </>
                            )}
                          </button>

                          {/* Enviar Convite Modal */}
                          <button
                            type="button"
                            onClick={() => setInviteModalUser(linkedUser)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Enviar Convite</span>
                          </button>

                          {/* Enviar WhatsApp */}
                          <button
                            type="button"
                            onClick={() => sendWhatsAppInvite(linkedUser)}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Enviar Email */}
                          <button
                            type="button"
                            onClick={() => sendEmailInvite(linkedUser)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-700" />
                            <span>E-mail</span>
                          </button>
                        </div>

                        {/* Remover Acesso Button */}
                        <div className="pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleRemoveAccess(linkedUser)}
                            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-rose-200 transition-colors cursor-pointer"
                          >
                            <UserX className="h-4 w-4" />
                            <span>Remover Acesso ao Sistema (Manter Cadastro)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUXILIARY MODAL 1: TEMP PASS ALERT MODAL */}
      {tempPassAlert?.isOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-700">
              <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Acesso / Senha Gerada</h3>
                <p className="text-[11px] text-slate-500">Credenciais para {tempPassAlert.userName}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">E-mail de Acesso</span>
                <span className="font-bold text-slate-800">{tempPassAlert.userEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Usuário</span>
                <span className="font-bold text-slate-800">{tempPassAlert.username}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Senha Temporária</span>
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-900 font-extrabold text-sm mt-1">
                  <span>{tempPassAlert.tempPass}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassAlert.tempPass);
                      triggerToast('✓ Senha copiada para a área de transferência!');
                    }}
                    className="text-emerald-700 hover:text-emerald-900 text-[11px] bg-white px-2 py-1 rounded border border-emerald-200 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => sendWhatsAppInvite({ name: tempPassAlert.userName, email: tempPassAlert.userEmail, username: tempPassAlert.username } as any, tempPassAlert.tempPass)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Enviar WhatsApp</span>
              </button>
              <button
                onClick={() => sendEmailInvite({ name: tempPassAlert.userName, email: tempPassAlert.userEmail, username: tempPassAlert.username } as any, tempPassAlert.tempPass)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                <span>Enviar E-mail</span>
              </button>
            </div>

            <button
              onClick={() => setTempPassAlert(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* AUXILIARY MODAL 2: EDIT USER ACCESS FORM MODAL */}
      {editingUserForm && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Editar Usuário de Acesso</h3>
                <p className="text-slate-400 text-[10px]">{editingUserForm.name}</p>
              </div>
              <button onClick={() => setEditingUserForm(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await firebaseService.db.saveDoc('USERS', editingUserForm);
                  await loadSystemUsers();
                  triggerToast('✓ Dados de acesso atualizados!');
                  setEditingUserForm(null);
                } catch (err: any) {
                  alert(`Erro ao atualizar: ${err.message || err}`);
                }
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingUserForm.name}
                  onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome de Usuário (Login)</label>
                <input
                  type="text"
                  required
                  value={editingUserForm.username || editingUserForm.email.split('@')[0]}
                  onChange={(e) => setEditingUserForm({ ...editingUserForm, username: e.target.value.toLowerCase().trim() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  value={editingUserForm.email}
                  onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value.trim() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status da Conta</label>
                <select
                  value={editingUserForm.status}
                  onChange={(e) => setEditingUserForm({ ...editingUserForm, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="Ativo">🟢 Ativo</option>
                  <option value="Bloqueado">🟠 Bloqueado</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUserForm(null)}
                  className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUXILIARY MODAL 3: INVITATION MODAL */}
      {inviteModalUser && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#047857] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Enviar Convite de Acesso</h3>
                <p className="text-emerald-100 text-[10px]">{inviteModalUser.name}</p>
              </div>
              <button onClick={() => setInviteModalUser(null)} className="text-emerald-100 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Selecione o canal de envio do convite para o colaborador realizar o seu primeiro login no Portal do Colaborador:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1 text-slate-800">
                <p><strong>Olá {inviteModalUser.name},</strong></p>
                <p>Seu acesso ao Portal do Colaborador GestRH está ativo.</p>
                <p>• E-mail: {inviteModalUser.email}</p>
                <p>• Usuário: {inviteModalUser.username || inviteModalUser.email.split('@')[0]}</p>
                <p>• Senha temporária: {inviteModalUser.temporaryPassword || inviteModalUser.password || 'GestRH@2026'}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    sendWhatsAppInvite(inviteModalUser);
                    setInviteModalUser(null);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    sendEmailInvite(inviteModalUser);
                    setInviteModalUser(null);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enviar por E-mail</span>
                </button>

                <button
                  onClick={() => {
                    const text = `Olá ${inviteModalUser.name}!\nSeu acesso ao GestRH foi liberado.\nE-mail: ${inviteModalUser.email}\nUsuário: ${inviteModalUser.username || inviteModalUser.email.split('@')[0]}\nSenha temporária: ${inviteModalUser.temporaryPassword || inviteModalUser.password || 'GestRH@2026'}\nLink: ${window.location.origin}`;
                    navigator.clipboard.writeText(text);
                    triggerToast('✓ Mensagem de convite copiada!');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-pointer border border-slate-200"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar Texto do Convite</span>
                </button>
              </div>
            </div>
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

      {/* 6. Layout Request Modal for Client Admin */}
      {isLayoutRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendLayoutRequest} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <Palette className="h-5 w-5 text-amber-400" />
                <span>Solicitar Alteração de Layout ao Master</span>
              </h3>
              <button type="button" onClick={() => setIsLayoutRequestModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Descreva as alterações desejadas em menus, logo, cores ou widgets. A equipe Master será notificada e aplicará as modificações para a sua empresa.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descrição da Solicitação *</label>
              <textarea
                required
                rows={4}
                placeholder="Ex: Gostariamos de alterar o nome do menu Funcionários para Colaboradores e alterar a cor principal para azul..."
                value={layoutRequestText}
                onChange={e => setLayoutRequestText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLayoutRequestModalOpen(false)}
                className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Enviar Solicitação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Comprovante de Registro de Ponto Digital Modal */}
      {viewingTimeRegisterDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <div>
                  <h3 className="font-display font-extrabold text-base">Comprovante de Ponto Eletrônico</h3>
                  <p className="text-emerald-200 text-[10px] font-mono">Portaria 671/2021 MTP • eSocial Auditado</p>
                </div>
              </div>
              <button onClick={() => setViewingTimeRegisterDetail(null)} className="text-emerald-100 hover:text-white p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-slate-800 text-xs">
              {/* Employee & Photo Badge */}
              <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="relative">
                  <img 
                    src={viewingTimeRegisterDetail.facialPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                    alt="Facial Capture" 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{viewingTimeRegisterDetail.employeeName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Matrícula: {viewingTimeRegisterDetail.employeeId}</p>
                  <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 font-bold text-[9px] px-2 py-0.5 rounded-md">
                    Biometria Facial Validada (Match: 99.8%)
                  </span>
                </div>
              </div>

              {/* Registro Audit Data */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data do Registro</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {viewingTimeRegisterDetail.date.split('-').reverse().join('/')}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário Entrada</span>
                  <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                    {viewingTimeRegisterDetail.clockIn || '--:--'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Almoço (Ida / Volta)</span>
                  <p className="font-mono font-semibold text-slate-700 mt-0.5">
                    {viewingTimeRegisterDetail.lunchOut || '--:--'} &bull; {viewingTimeRegisterDetail.lunchIn || '--:--'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário Saída</span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {viewingTimeRegisterDetail.clockOut || '--:--'}
                  </p>
                </div>
              </div>

              {/* GPS Location Audit */}
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Geolocalização GPS Registrada</span>
                </div>
                <p className="text-slate-700 font-semibold text-[11px] pl-5">
                  {viewingTimeRegisterDetail.location || 'São Paulo, SP - Brasil'}
                </p>
                {viewingTimeRegisterDetail.latitude && (
                  <p className="text-emerald-700 font-mono text-[10px] pl-5">
                    Coordenadas: Lat {viewingTimeRegisterDetail.latitude}, Lng {viewingTimeRegisterDetail.longitude}
                  </p>
                )}
                <div className="pl-5 pt-1">
                  <a 
                    href={`https://www.google.com/maps?q=${viewingTimeRegisterDetail.latitude || -23.5505},${viewingTimeRegisterDetail.longitude || -46.6333}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 hover:underline"
                  >
                    <span>Abrir no Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Security Hash & NSR */}
              <div className="font-mono text-[10px] text-slate-400 bg-slate-100 p-2.5 rounded-xl border border-slate-200 space-y-1">
                <p>NSR: <strong>NSR-2026-904812-{viewingTimeRegisterDetail.id}</strong></p>
                <p className="truncate">HASH SHA-256: 7f8a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8</p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => window.print()}
                  className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Imprimir Comprovante</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setViewingTimeRegisterDetail(null)}
                  className="bg-slate-100 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. First Access Modal for Employees requiring initial setup */}
      {currentUser && currentUser.role === 'Funcionário' && (currentUser.mustChangePassword || !currentUser.termsAccepted || !currentUser.dataConfirmed) && (
        <FirstAccessModal
          currentUser={currentUser}
          onSuccess={(updated) => {
            if (onUpdateCurrentUser) onUpdateCurrentUser(updated);
            loadSystemUsers();
            triggerToast('✓ Configuração de Primeiro Acesso concluída com sucesso!');
          }}
        />
      )}

      {/* 8. MASTER DESIGNER (CONSTRUTOR VISUAL GLOBAL DO MASTER) FLOATING TOGGLE & MODAL */}
      {((currentUser?.role as string) === 'Master' || (currentUser?.role as string) === 'MASTER' || (currentUser?.role as string) === 'OWNER') && (
        <>
          {/* Floating Action Button for Master Visual Builder */}
          <div className="fixed bottom-6 right-52 sm:right-60 z-40 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenPageEditor}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-full shadow-2xl shadow-amber-500/30 border border-amber-300 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-slate-950" />
              <span>Editar esta página</span>
            </button>
          </div>

          {/* Fullscreen Builder Modal */}
          {isMasterBuilderModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto flex flex-col animate-in fade-in">
              <MasterVisualBuilder
                currentUserRole={currentUser.role}
                initialPageId={builderInitialPageId}
                onClose={() => setIsMasterBuilderModalOpen(false)}
                triggerToast={triggerToast}
              />
            </div>
          )}
        </>
      )}

      {/* 9. GOOGLE WORKSPACE HUB MODAL */}
      <GoogleWorkspaceHub
        isOpen={isWorkspaceHubOpen}
        onClose={() => setIsWorkspaceHubOpen(false)}
      />

      {/* 10. FLOATING AI ASSISTANT RH WIDGET (CORNER WIDGET) */}
      {!isAiAssistantOpen ? (
        <button
          type="button"
          onClick={() => setIsAiAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white p-2.5 sm:p-3 sm:pr-4 rounded-full shadow-2xl shadow-slate-950/60 border border-slate-700/80 flex items-center space-x-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Abrir Assistente IA RH (CLT e Gestão)"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:bg-emerald-400 transition-colors">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-[11px] font-extrabold text-white leading-tight flex items-center space-x-1">
              <span>Assistente IA RH</span>
              <Sparkles className="h-3 w-3 text-amber-400" />
            </div>
            <div className="text-[9px] text-emerald-400 font-semibold">Tire dúvidas sem sair da página</div>
          </div>
        </button>
      ) : (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[430px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Widget Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-white flex items-center space-x-1.5">
                  <span>Assistente IA RH</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-500/30">Online</span>
                </h3>
                <p className="text-[10px] text-slate-400">Suporte CLT e Gestão de Pessoas em tempo real</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiAssistantOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Minimizar / Fechar Assistente IA"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Widget Body */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AIChatModule isFloating onClose={() => setIsAiAssistantOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
