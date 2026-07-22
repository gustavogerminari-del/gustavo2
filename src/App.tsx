/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import MasterDashboard from './components/MasterDashboard';
import LoginPortal from './components/LoginPortal';
import { firebaseService } from './firebase';
import { UserAccount } from './types_master';
import { 
  Employee, 
  Job, 
  Candidate, 
  TimeRegister, 
  VacationRequest, 
  PaySlip, 
  DocumentFile, 
  AppSettings,
  OnboardingContract,
  Benefit,
  EmployeeBenefit,
  Termination,
  ExtraHourRequest,
  PointCorrectionRequest,
  INSSBracket,
  IRRFBracket
} from './types';

import {
  INITIAL_EMPLOYEES,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_TIME_REGISTERS,
  INITIAL_VACATION_REQUESTS,
  INITIAL_PAYSLIPS,
  INITIAL_DOCUMENTS,
  INITIAL_SETTINGS,
  INITIAL_CONTRACTS,
  INITIAL_BENEFITS,
  INITIAL_EMPLOYEE_BENEFITS,
  INITIAL_TERMINATIONS
} from './data';

export default function App() {
  // Navigation / View Controller ('portal' | 'login' | 'admin')
  const [view, setView] = useState<'portal' | 'login' | 'admin'>('portal');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return firebaseService.auth.getCurrentUser();
  });

  // --- STATE PERSISTENCE ENGINE (isolated by companyId) ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const savedFirebase = localStorage.getItem('firebase_jobs') || localStorage.getItem('JOBS');
      if (savedFirebase) {
        const parsed = JSON.parse(savedFirebase);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const savedConsultor = localStorage.getItem('gestrh_consultor_vagas');
      if (savedConsultor) {
        const parsedVagas = JSON.parse(savedConsultor);
        if (Array.isArray(parsedVagas) && parsedVagas.length > 0) {
          return parsedVagas.map((v: any) => ({
            id: v.id,
            title: v.cargo,
            department: v.clienteNome || 'Consultoria',
            location: `${v.cidade || ''} - ${v.estado || ''}`,
            type: v.tipoContratacao || 'CLT',
            workModel: v.modalidade || 'Híbrido',
            salaryRange: typeof v.salario === 'number' ? `R$ ${v.salario.toLocaleString('pt-BR')}` : String(v.salario || 'A combinar'),
            description: v.descricao,
            requirements: v.requisitos || [],
            active: v.status === 'Aberta' || v.status === 'Em Andamento',
            createdAt: v.dataCriacao || new Date().toISOString().split('T')[0]
          }));
        }
      }
    } catch (e) {
      console.error('Error initializing jobs state:', e);
    }
    return INITIAL_JOBS;
  });

  // Sync jobs if updated elsewhere in localStorage
  useEffect(() => {
    const syncJobs = () => {
      try {
        const savedFirebase = localStorage.getItem('firebase_jobs') || localStorage.getItem('JOBS');
        if (savedFirebase) {
          const parsed = JSON.parse(savedFirebase);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJobs(parsed);
          }
        }
      } catch (e) {
        console.error('Error syncing jobs from storage:', e);
      }
    };

    window.addEventListener('jobsUpdated', syncJobs);
    window.addEventListener('storage', syncJobs);
    return () => {
      window.removeEventListener('jobsUpdated', syncJobs);
      window.removeEventListener('storage', syncJobs);
    };
  }, []);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [timeRegisters, setTimeRegisters] = useState<TimeRegister[]>([]);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [contracts, setContracts] = useState<OnboardingContract[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefit[]>([]);
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [extraHours, setExtraHours] = useState<ExtraHourRequest[]>([]);
  const [pointCorrections, setPointCorrections] = useState<PointCorrectionRequest[]>([]);
  const [inssBrackets, setInssBrackets] = useState<INSSBracket[]>([]);
  const [irrfBrackets, setIrrfBrackets] = useState<IRRFBracket[]>([]);

  // Sync state whenever the current user changes (Load multi-tenant Firestore data)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Master') {
        // Master has access to global SaaS models, so no company-specific state needed here
        setView('admin');
        return;
      }

      const companyId = currentUser.companyId || 'company-1';

      // Load all sub-collections asynchronously simulating Firestore
      const loadData = async () => {
        try {
          // 1. Employees
          const emps = await firebaseService.db.getCollection<Employee>('EMPLOYEES', companyId);
          if (emps.length === 0 && companyId === 'company-1') {
            // Seed company-1 with initial data on first load
            await Promise.all(INITIAL_EMPLOYEES.map(e => firebaseService.db.saveDoc('EMPLOYEES', e, companyId)));
            const seededEmps = await firebaseService.db.getCollection<Employee>('EMPLOYEES', companyId);
            setEmployees(seededEmps);
          } else {
            setEmployees(emps);
          }

          // 2. Jobs
          const jbs = await firebaseService.db.getCollection<Job>('JOBS', companyId);
          if (jbs.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_JOBS.map(j => firebaseService.db.saveDoc('JOBS', j, companyId)));
            const seededJobs = await firebaseService.db.getCollection<Job>('JOBS', companyId);
            setJobs(seededJobs);
          } else {
            setJobs(jbs);
          }

          // 3. Candidates
          const cands = await firebaseService.db.getCollection<Candidate>('CANDIDATES', companyId);
          if (cands.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_CANDIDATES.map(c => firebaseService.db.saveDoc('CANDIDATES', c, companyId)));
            const seededCands = await firebaseService.db.getCollection<Candidate>('CANDIDATES', companyId);
            setCandidates(seededCands);
          } else {
            setCandidates(cands);
          }

          // 4. Time Registers
          const regs = await firebaseService.db.getCollection<TimeRegister>('TIME_REGISTERS', companyId);
          if (regs.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_TIME_REGISTERS.map(r => firebaseService.db.saveDoc('TIME_REGISTERS', r, companyId)));
            const seededRegs = await firebaseService.db.getCollection<TimeRegister>('TIME_REGISTERS', companyId);
            setTimeRegisters(seededRegs);
          } else {
            setTimeRegisters(regs);
          }

          // 5. Vacation Requests
          const vacs = await firebaseService.db.getCollection<VacationRequest>('VACATION_REQUESTS', companyId);
          if (vacs.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_VACATION_REQUESTS.map(v => firebaseService.db.saveDoc('VACATION_REQUESTS', v, companyId)));
            const seededVacs = await firebaseService.db.getCollection<VacationRequest>('VACATION_REQUESTS', companyId);
            setVacationRequests(seededVacs);
          } else {
            setVacationRequests(vacs);
          }

          // 6. Payslips
          const slips = await firebaseService.db.getCollection<PaySlip>('PAYSLIPS', companyId);
          if (slips.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_PAYSLIPS.map(p => firebaseService.db.saveDoc('PAYSLIPS', p, companyId)));
            const seededSlips = await firebaseService.db.getCollection<PaySlip>('PAYSLIPS', companyId);
            setPayslips(seededSlips);
          } else {
            setPayslips(slips);
          }

          // 7. Documents
          const docs = await firebaseService.db.getCollection<DocumentFile>('DOCUMENTS', companyId);
          if (docs.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_DOCUMENTS.map(d => firebaseService.db.saveDoc('DOCUMENTS', d, companyId)));
            const seededDocs = await firebaseService.db.getCollection<DocumentFile>('DOCUMENTS', companyId);
            setDocuments(seededDocs);
          } else {
            setDocuments(docs);
          }

          // 8. Settings
          const stgsList = await firebaseService.db.getCollection<AppSettings>('SETTINGS', companyId);
          if (stgsList && stgsList.length > 0) {
            setSettings(stgsList[0]);
          } else {
            const initialCompanySettings = { ...INITIAL_SETTINGS, companyName: 'Minha Empresa SaaS' };
            await firebaseService.db.saveDoc('SETTINGS', initialCompanySettings, companyId);
            setSettings(initialCompanySettings);
          }

          // 9. Onboarding Contracts
          const contrs = await firebaseService.db.getCollection<OnboardingContract>('CONTRACTS', companyId);
          if (contrs.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_CONTRACTS.map(c => firebaseService.db.saveDoc('CONTRACTS', c, companyId)));
            const seeded = await firebaseService.db.getCollection<OnboardingContract>('CONTRACTS', companyId);
            setContracts(seeded);
          } else {
            setContracts(contrs);
          }

          // 10. Benefits
          const bens = await firebaseService.db.getCollection<Benefit>('BENEFITS', companyId);
          if (bens.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_BENEFITS.map(b => firebaseService.db.saveDoc('BENEFITS', b, companyId)));
            const seeded = await firebaseService.db.getCollection<Benefit>('BENEFITS', companyId);
            setBenefits(seeded);
          } else {
            setBenefits(bens);
          }

          // 11. Employee Benefits
          const empBens = await firebaseService.db.getCollection<EmployeeBenefit>('EMPLOYEE_BENEFITS', companyId);
          if (empBens.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_EMPLOYEE_BENEFITS.map(eb => firebaseService.db.saveDoc('EMPLOYEE_BENEFITS', eb, companyId)));
            const seeded = await firebaseService.db.getCollection<EmployeeBenefit>('EMPLOYEE_BENEFITS', companyId);
            setEmployeeBenefits(seeded);
          } else {
            setEmployeeBenefits(empBens);
          }

          // 12. Terminations
          const terms = await firebaseService.db.getCollection<Termination>('TERMINATIONS', companyId);
          if (terms.length === 0 && companyId === 'company-1') {
            await Promise.all(INITIAL_TERMINATIONS.map(t => firebaseService.db.saveDoc('TERMINATIONS', t, companyId)));
            const seeded = await firebaseService.db.getCollection<Termination>('TERMINATIONS', companyId);
            setTerminations(seeded);
          } else {
            setTerminations(terms);
          }

          // 13. Horas Extras
          const heList = await firebaseService.db.getCollection<ExtraHourRequest>('HORAS_EXTRAS', companyId);
          if (heList.length === 0 && companyId === 'company-1') {
            const initialHE: ExtraHourRequest[] = [
              {
                id: 'he-1',
                employeeId: 'emp-1',
                employeeName: 'Ana Silva',
                department: 'Financeiro',
                coordinatorId: 'emp-6',
                coordinatorName: 'Fernanda Lima',
                date: '2026-07-15',
                startTime: '17:00',
                endTime: '19:00',
                hoursCount: 2,
                type: '50%',
                reason: 'Fechamento de balanço trimestral',
                status: 'Validado RH',
                approvals: [
                  { step: 'Coordenador', user: 'Fernanda Lima', action: 'Aprovar', date: '2026-07-15', notes: 'Aprovado para fechamento' },
                  { step: 'RH', user: 'Diana Santos', action: 'Validar', date: '2026-07-16', notes: 'Validado conforme política' }
                ]
              },
              {
                id: 'he-2',
                employeeId: 'emp-1',
                employeeName: 'Ana Silva',
                department: 'Financeiro',
                coordinatorId: 'emp-6',
                coordinatorName: 'Fernanda Lima',
                date: '2026-07-20',
                startTime: '17:00',
                endTime: '20:00',
                hoursCount: 3,
                type: '100%',
                reason: 'Apoio auditoria externa de urgência',
                status: 'Pendente Coordenador'
              }
            ];
            await Promise.all(initialHE.map(h => firebaseService.db.saveDoc('HORAS_EXTRAS', h, companyId)));
            const seeded = await firebaseService.db.getCollection<ExtraHourRequest>('HORAS_EXTRAS', companyId);
            setExtraHours(seeded);
          } else {
            setExtraHours(heList);
          }

          // 14. Correções de Ponto
          const pcList = await firebaseService.db.getCollection<PointCorrectionRequest>('CORRECOES_PONTO', companyId);
          if (pcList.length === 0 && companyId === 'company-1') {
            const initialPC: PointCorrectionRequest[] = [
              {
                id: 'pc-1',
                employeeId: 'emp-1',
                employeeName: 'Ana Silva',
                department: 'Financeiro',
                date: '2026-07-10',
                clockIn: '08:00',
                lunchOut: '12:00',
                lunchIn: '13:00',
                clockOut: '17:00',
                reason: 'Esquecimento de registro físico na saída',
                status: 'Pendente'
              }
            ];
            await Promise.all(initialPC.map(p => firebaseService.db.saveDoc('CORRECOES_PONTO', p, companyId)));
            const seeded = await firebaseService.db.getCollection<PointCorrectionRequest>('CORRECOES_PONTO', companyId);
            setPointCorrections(seeded);
          } else {
            setPointCorrections(pcList);
          }

          // 15. INSS e IRRF
          const inssList = await firebaseService.db.getCollection<INSSBracket>('TABELA_INSS', companyId);
          setInssBrackets(inssList);

          const irrfList = await firebaseService.db.getCollection<IRRFBracket>('TABELA_IRRF', companyId);
          setIrrfBrackets(irrfList);

          setView('admin');
        } catch (error) {
          console.error('Error loading tenant database collections:', error);
        }
      };

      loadData();
    } else {
      // Clean local state on logout to prevent cross-contamination
      setEmployees([]);
      setJobs([]);
      setCandidates([]);
      setTimeRegisters([]);
      setVacationRequests([]);
      setPayslips([]);
      setDocuments([]);
      setSettings(INITIAL_SETTINGS);
      setContracts([]);
      setBenefits([]);
      setEmployeeBenefits([]);
      setTerminations([]);
      setExtraHours([]);
      setPointCorrections([]);
      setInssBrackets([]);
      setIrrfBrackets([]);
      setView('portal');
    }
  }, [currentUser]);

  // Auth logout handler
  const handleLogout = async () => {
    await firebaseService.auth.signOut();
    setCurrentUser(null);
  };

  // --- PERSISTENCE UPDATE HANDLERS (Write-back to virtual Firestore database) ---
  const handleUpdateEmployees = async (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      // Find what changed/added and update in localstorage db simulation
      // For simplicity, we can rewrite the collection state, or write them individually.
      // Since our virtual saveDoc replaces/appends to storage, we can trigger individually or bulk-write.
      // Bulk writing is clean because it aligns the full state.
      localStorage.setItem(`firebase_employees`, JSON.stringify(
        updatedEmployees.map(e => ({ ...e, companyId }))
      ));
    }
  };

  const handleUpdateJobs = async (updatedJobs: Job[]) => {
    setJobs(updatedJobs);
    const companyId = currentUser?.companyId || 'company-1';
    const dataToSave = updatedJobs.map(j => ({ ...j, companyId }));
    try {
      localStorage.setItem('firebase_jobs', JSON.stringify(dataToSave));
      localStorage.setItem('JOBS', JSON.stringify(dataToSave));
      window.dispatchEvent(new Event('jobsUpdated'));
    } catch (e) {
      console.error('Error saving jobs:', e);
    }
  };

  const handleUpdateCandidates = async (updatedCandidates: Candidate[]) => {
    setCandidates(updatedCandidates);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_candidates`, JSON.stringify(
        updatedCandidates.map(c => ({ ...c, companyId }))
      ));
    }
  };

  const handleUpdateTimeRegisters = async (updatedRegisters: TimeRegister[]) => {
    setTimeRegisters(updatedRegisters);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_time_registers`, JSON.stringify(
        updatedRegisters.map(r => ({ ...r, companyId }))
      ));
    }
  };

  const handleUpdateVacationRequests = async (updatedRequests: VacationRequest[]) => {
    setVacationRequests(updatedRequests);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_time_registers`, JSON.stringify(
        updatedRequests.map(v => ({ ...v, companyId }))
      ));
    }
  };

  const handleUpdatePayslips = async (updatedPayslips: PaySlip[]) => {
    setPayslips(updatedPayslips);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_payslips`, JSON.stringify(
        updatedPayslips.map(p => ({ ...p, companyId }))
      ));
    }
  };

  const handleUpdateDocuments = async (updatedDocuments: DocumentFile[]) => {
    setDocuments(updatedDocuments);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_documents`, JSON.stringify(
        updatedDocuments.map(d => ({ ...d, companyId }))
      ));
    }
  };

  const handleUpdateSettings = async (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      await firebaseService.db.saveDoc('SETTINGS', updatedSettings, companyId);
    }
  };

  const handleUpdateContracts = async (updatedContracts: OnboardingContract[]) => {
    setContracts(updatedContracts);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_contracts`, JSON.stringify(
        updatedContracts.map(c => ({ ...c, companyId }))
      ));
    }
  };

  const handleUpdateBenefits = async (updatedBenefits: Benefit[]) => {
    setBenefits(updatedBenefits);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_benefits`, JSON.stringify(
        updatedBenefits.map(b => ({ ...b, companyId }))
      ));
    }
  };

  const handleUpdateEmployeeBenefits = async (updatedEmployeeBenefits: EmployeeBenefit[]) => {
    setEmployeeBenefits(updatedEmployeeBenefits);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_employee_benefits`, JSON.stringify(
        updatedEmployeeBenefits.map(eb => ({ ...eb, companyId }))
      ));
    }
  };

  const handleUpdateTerminations = async (updatedTerminations: Termination[]) => {
    setTerminations(updatedTerminations);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_terminations`, JSON.stringify(
        updatedTerminations.map(t => ({ ...t, companyId }))
      ));
    }
  };

  const handleUpdateExtraHours = async (updatedExtraHours: ExtraHourRequest[]) => {
    setExtraHours(updatedExtraHours);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_horas_extras`, JSON.stringify(
        updatedExtraHours.map(h => ({ ...h, companyId }))
      ));
    }
  };

  const handleUpdatePointCorrections = async (updatedCorrections: PointCorrectionRequest[]) => {
    setPointCorrections(updatedCorrections);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_correcoes_ponto`, JSON.stringify(
        updatedCorrections.map(c => ({ ...c, companyId }))
      ));
    }
  };

  const handleUpdateInssBrackets = async (updatedBrackets: INSSBracket[]) => {
    setInssBrackets(updatedBrackets);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_tabela_inss`, JSON.stringify(
        updatedBrackets.map(b => ({ ...b, companyId }))
      ));
    }
  };

  const handleUpdateIrrfBrackets = async (updatedBrackets: IRRFBracket[]) => {
    setIrrfBrackets(updatedBrackets);
    if (currentUser) {
      const companyId = currentUser.companyId || 'company-1';
      localStorage.setItem(`firebase_tabela_irrf`, JSON.stringify(
        updatedBrackets.map(b => ({ ...b, companyId }))
      ));
    }
  };

  // Handle adding candidate from career portal (public)
  const handleAddCandidate = async (newCand: Omit<Candidate, 'id' | 'createdAt'>) => {
    const fullCand: Candidate = {
      ...newCand,
      id: `cand-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    // Default to company-1 since candidate applying on public landing
    const companyId = 'company-1';
    await firebaseService.db.saveDoc('CANDIDATES', fullCand, companyId);
    
    // If we're logged into company-1, append to live react state
    if (currentUser?.companyId === 'company-1') {
      setCandidates(prev => [...prev, fullCand]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'portal' && (
        <LandingPage 
          jobs={jobs.length > 0 ? jobs : INITIAL_JOBS}
          onNavigateToDashboard={() => setView('login')}
          onAddCandidate={handleAddCandidate}
        />
      )}

      {view === 'login' && (
        <LoginPortal 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          onBackToPortal={() => setView('portal')}
        />
      )}

      {view === 'admin' && currentUser && (
        currentUser.role === 'Master' ? (
          <MasterDashboard 
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        ) : (
          <AdminDashboard 
            employees={employees}
            jobs={jobs}
            candidates={candidates}
            timeRegisters={timeRegisters}
            vacationRequests={vacationRequests}
            payslips={payslips}
            documents={documents}
            settings={settings}
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateEmployees={handleUpdateEmployees}
            onUpdateJobs={handleUpdateJobs}
            onUpdateCandidates={handleUpdateCandidates}
            onUpdateTimeRegisters={handleUpdateTimeRegisters}
            onUpdateVacationRequests={handleUpdateVacationRequests}
            onUpdatePayslips={handleUpdatePayslips}
            onUpdateDocuments={handleUpdateDocuments}
            onUpdateSettings={handleUpdateSettings}
            onBackToPortal={() => setView('portal')}
            
            contracts={contracts}
            benefits={benefits}
            employeeBenefits={employeeBenefits}
            terminations={terminations}
            onUpdateContracts={handleUpdateContracts}
            onUpdateBenefits={handleUpdateBenefits}
            onUpdateEmployeeBenefits={handleUpdateEmployeeBenefits}
            onUpdateTerminations={handleUpdateTerminations}

            extraHours={extraHours}
            pointCorrections={pointCorrections}
            inssBrackets={inssBrackets}
            irrfBrackets={irrfBrackets}
            onUpdateExtraHours={handleUpdateExtraHours}
            onUpdatePointCorrections={handleUpdatePointCorrections}
            onUpdateInssBrackets={handleUpdateInssBrackets}
            onUpdateIrrfBrackets={handleUpdateIrrfBrackets}
          />
        )
      )}
    </div>
  );
}
