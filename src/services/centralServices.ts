/**
 * RL CONNECT - Centralized Services & Database Layer
 * Clean multi-tenant architecture using isolated storage per companyId/empresaId.
 * NO FIREBASE DEPENDENCIES.
 */

import { 
  Job, 
  Candidate, 
  Employee, 
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
} from '../types';

import { 
  UserAccount,
  UserRole,
  SaaSCompany,
  SaaSModule, 
  SaaSProduct, 
  SaaSPlan, 
  SiteConfig 
} from '../types_master';

import { 
  ClienteEmpresa, 
  VagaConsultoria, 
  CandidatoConsultoria, 
  FinanceiroContrato,
  CRMDeal
} from '../types_consultor';

import { SmartInterview } from '../types_interview';

import { INITIAL_EMPLOYEES, INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_TIME_REGISTERS, INITIAL_VACATION_REQUESTS, INITIAL_PAYSLIPS, INITIAL_DOCUMENTS, INITIAL_CONTRACTS, INITIAL_BENEFITS, INITIAL_EMPLOYEE_BENEFITS, INITIAL_TERMINATIONS } from '../data';
import { INITIAL_CLIENTES, INITIAL_VAGAS_CONSULTORIA, INITIAL_CONTRATOS_FINANCEIRO } from '../data_consultor';

// Helper for localStorage keys
const key = (collection: string, companyId: string = 'company-1') => `rl_connect_${companyId}_${collection}`;
const globalKey = (collection: string) => `rl_connect_global_${collection}`;

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  home: {
    titulo: 'Conectando talentos às melhores oportunidades',
    subtitulo: 'R Lourenço Recrutamento e Seleção',
    descricao: 'A plataforma digital completa onde candidatos, empresas e gestão de pessoas se encontram com inteligência e ágil seleção.',
    botaoTexto: 'Cadastrar Currículo',
    botaoLink: '#vagas',
    imagem: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  },
  empresa: {
    missao: 'Transformar a atração de talentos e a gestão de pessoas no Brasil conectando empresas aos profissionais ideais com transparência, agilidade e inteligência humana.',
    visao: 'Ser referência nacional em soluções de Recrutamento & Seleção, Headhunting e Inteligência de Departamento Pessoal.',
    valores: [
      'Inovação e Excelência',
      'Transparência e Ética',
      'Atendimento Humanizado',
      'Foco em Resultados',
      'Conformidade com LGPD'
    ]
  },
  planos: [
    {
      id: 'plano-1',
      nome: 'Básico',
      descricao: 'Para empresas em estruturação do setor de RH.',
      valorMensal: 'Sob consulta',
      valorAnual: 'Sob consulta',
      beneficios: [
        'Publicação de vagas no Portal',
        'Triagem inicial de candidatos',
        'Banco de Talentos básico'
      ],
      botaoTexto: 'Falar com Consultor',
      botaoLink: '#contato',
      ativo: true,
      ordem: 1,
      destaque: false
    },
    {
      id: 'plano-2',
      nome: 'Profissional',
      descricao: 'Para empresas em crescimento com seleção contínua.',
      valorMensal: 'Sob consulta',
      valorAnual: 'Sob consulta',
      beneficios: [
        'Todas as funções do Plano Básico',
        'Acesso completo ao Banco de Talentos RL CONNECT',
        'Match Inteligente por Competências com IA',
        'Módulo Entrevistas'
      ],
      botaoTexto: 'Falar com Consultor',
      botaoLink: '#contato',
      ativo: true,
      ordem: 2,
      destaque: true,
      badge: 'MAIS POPULAR'
    },
    {
      id: 'plano-3',
      nome: 'Enterprise & Headhunter',
      descricao: 'Solução corporativa completa com assessoria especializada R Lourenço.',
      valorMensal: 'Personalizado',
      valorAnual: 'Personalizado',
      beneficios: [
        'Tudo do Plano Profissional',
        'Consultoria Headhunter R Lourenço',
        'Gravação e diagnóstico IA de entrevistas',
        'Módulo DP e Folha de Pagamento completo'
      ],
      botaoTexto: 'Falar com Consultor',
      botaoLink: '#contato',
      ativo: true,
      ordem: 3,
      destaque: false
    }
  ],
  midia: {
    logo: '',
    favicon: '',
    bannerInicial: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    imagensInstitucionais: []
  },
  contato: {
    telefone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    email: 'contato@rlourenco.com.br',
    endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
    redesSociais: {
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      youtube: 'https://youtube.com',
      twitter: ''
    }
  }
};

// Generic Collection Helper
function getLocalCollection<T>(collection: string, companyId: string, initialDefaults: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key(collection, companyId));
    if (raw) {
      return JSON.parse(raw) as T[];
    }
  } catch (e) {
    console.warn(`Error reading collection ${collection}:`, e);
  }
  // Initialize with defaults if empty
  if (initialDefaults.length > 0) {
    saveLocalCollection(collection, companyId, initialDefaults);
    return initialDefaults;
  }
  return [];
}

function saveLocalCollection<T>(collection: string, companyId: string, data: T[]): void {
  try {
    localStorage.setItem(key(collection, companyId), JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving collection ${collection}:`, e);
  }
}

function getGlobalCollection<T>(collection: string, initialDefaults: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(globalKey(collection));
    if (raw) {
      return JSON.parse(raw) as T[];
    }
  } catch (e) {
    console.warn(`Error reading global collection ${collection}:`, e);
  }
  if (initialDefaults.length > 0) {
    saveGlobalCollection(collection, initialDefaults);
    return initialDefaults;
  }
  return [];
}

function saveGlobalCollection<T>(collection: string, data: T[]): void {
  try {
    localStorage.setItem(globalKey(collection), JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving global collection ${collection}:`, e);
  }
}

// 1. AUTH SERVICE
export const AuthService = {
  getCurrentUser(): UserAccount | null {
    try {
      const raw = localStorage.getItem('rl_connect_current_user');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('AuthService error:', e);
    }
    return null;
  },

  async signIn(email: string, password: string): Promise<UserAccount> {
    const users = UserService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    
    // Check existing users
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      if (user.password && user.password !== password) {
        throw new Error('Senha incorreta.');
      }
      if (user.status === 'Bloqueado') {
        throw new Error('Usuário bloqueado. Entre em contato com o suporte.');
      }
      localStorage.setItem('rl_connect_current_user', JSON.stringify(user));
      return user;
    }

    // Default master admin fallback
    if (cleanEmail === 'master@rlourenco.com.br' || cleanEmail === 'admin@rlourenco.com.br' || cleanEmail === 'gustavogerminari@gmail.com') {
      const masterUser: UserAccount = {
        id: 'user-master-1',
        name: 'Administrador RL CONNECT',
        email: cleanEmail,
        role: 'Master',
        status: 'Ativo',
        companyId: 'company-1'
      };
      UserService.saveUser(masterUser);
      localStorage.setItem('rl_connect_current_user', JSON.stringify(masterUser));
      return masterUser;
    }

    // Demo auto-login for testing if not found
    const demoUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0] || 'Usuário RL CONNECT',
      email: cleanEmail,
      role: 'RH',
      status: 'Ativo',
      companyId: 'company-1'
    };
    UserService.saveUser(demoUser);
    localStorage.setItem('rl_connect_current_user', JSON.stringify(demoUser));
    return demoUser;
  },

  async signUp(email: string, name: string, role: UserRole | string, companyId: string = 'company-1', employeeId?: string, password?: string): Promise<UserAccount> {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: (role as UserRole) || 'RH',
      companyId,
      status: 'Ativo',
      password
    };
    UserService.saveUser(newUser);
    localStorage.setItem('rl_connect_current_user', JSON.stringify(newUser));
    return newUser;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('rl_connect_current_user');
  }
};

// 2. COMPANY SERVICE
export const CompanyService = {
  getCompanies(): SaaSCompany[] {
    const defaultCompanies: SaaSCompany[] = [
      { id: 'company-1', name: 'R Lourenço Recrutamento & Seleção', cnpj: '12.345.678/0001-90', adminEmail: 'contato@rlourenco.com.br', status: 'Ativo', planId: 'plano-3', releasedModules: ['mod-recrutamento', 'mod-dp', 'mod-headhunter'], userLimit: 50, createdAt: new Date().toISOString() },
      { id: 'company-2', name: 'Tech Inovações Corp', cnpj: '98.765.432/0001-10', adminEmail: 'admin@techcorp.com.br', status: 'Ativo', planId: 'plano-2', releasedModules: ['mod-recrutamento'], userLimit: 10, createdAt: new Date().toISOString() }
    ];
    return getGlobalCollection<SaaSCompany>('COMPANIES', defaultCompanies);
  },

  saveCompany(company: SaaSCompany): SaaSCompany {
    const companies = this.getCompanies();
    const idx = companies.findIndex(c => c.id === company.id);
    if (idx >= 0) {
      companies[idx] = company;
    } else {
      companies.push(company);
    }
    saveGlobalCollection('COMPANIES', companies);
    return company;
  },

  deleteCompany(id: string): void {
    const companies = this.getCompanies().filter(c => c.id !== id);
    saveGlobalCollection('COMPANIES', companies);
  }
};

// 3. USER SERVICE
export const UserService = {
  getUsers(companyId?: string): UserAccount[] {
    const defaultUsers: UserAccount[] = [
      { id: 'u1', name: 'Rafaela Lourenço', email: 'rafaela@rlourenco.com.br', role: 'RH', status: 'Ativo', companyId: 'company-1' },
      { id: 'u2', name: 'Gustavo Germinari', email: 'gustavo@rlourenco.com.br', role: 'Master', status: 'Ativo', companyId: 'company-1' }
    ];
    const all = getGlobalCollection<UserAccount>('USERS', defaultUsers);
    if (companyId) {
      return all.filter(u => u.companyId === companyId || u.role === 'Master');
    }
    return all;
  },

  saveUser(user: UserAccount): UserAccount {
    const users = getGlobalCollection<UserAccount>('USERS');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    saveGlobalCollection('USERS', users);
    return user;
  },

  deleteUser(id: string): void {
    const users = getGlobalCollection<UserAccount>('USERS').filter(u => u.id !== id);
    saveGlobalCollection('USERS', users);
  }
};

// 4. JOB SERVICE
export const JobService = {
  getJobs(companyId: string): Job[] {
    return getLocalCollection<Job>('JOBS', companyId, INITIAL_JOBS.map(j => ({ ...j, companyId })));
  },

  getPublicJobs(): Job[] {
    // Collect public jobs across companies marked as active
    const companies = CompanyService.getCompanies();
    let allPublic: Job[] = [];
    companies.forEach(c => {
      const jobs = this.getJobs(c.id);
      const activePublic = jobs.filter(j => j.active && (j.publishedToPortal !== false));
      allPublic = [...allPublic, ...activePublic];
    });
    if (allPublic.length === 0) {
      return INITIAL_JOBS;
    }
    return allPublic;
  },

  saveJob(job: Job, companyId: string): Job {
    const jobs = this.getJobs(companyId);
    const updatedJob = { ...job, companyId };
    const idx = jobs.findIndex(j => j.id === job.id);
    if (idx >= 0) {
      jobs[idx] = updatedJob;
    } else {
      jobs.unshift(updatedJob);
    }
    saveLocalCollection('JOBS', companyId, jobs);
    return updatedJob;
  },

  deleteJob(id: string, companyId: string): void {
    const jobs = this.getJobs(companyId).filter(j => j.id !== id);
    saveLocalCollection('JOBS', companyId, jobs);
  }
};

// 5. CANDIDATE SERVICE
export const CandidateService = {
  getCandidates(companyId: string): Candidate[] {
    return getLocalCollection<Candidate>('CANDIDATES', companyId, INITIAL_CANDIDATES.map(c => ({ ...c, companyId })));
  },

  getCandidateById(id: string, companyId: string): Candidate | undefined {
    return this.getCandidates(companyId).find(c => c.id === id);
  },

  saveCandidate(candidate: Candidate, companyId: string): Candidate {
    const candidates = this.getCandidates(companyId);
    const updated = { ...candidate, companyId };
    const idx = candidates.findIndex(c => c.id === candidate.id);
    if (idx >= 0) {
      candidates[idx] = updated;
    } else {
      candidates.unshift(updated);
    }
    saveLocalCollection('CANDIDATES', companyId, candidates);
    return updated;
  },

  deleteCandidate(id: string, companyId: string): void {
    const candidates = this.getCandidates(companyId).filter(c => c.id !== id);
    saveLocalCollection('CANDIDATES', companyId, candidates);
  },

  // ✨ Match Talentos (strict same company filter)
  matchCandidatesForJob(job: Job, companyId: string): Array<{ candidate: Candidate; matchScore: number; reasons: string[] }> {
    const candidates = this.getCandidates(companyId);
    
    return candidates.map(c => {
      let score = 50;
      const reasons: string[] = [];

      // Title/Role match
      if (job.title && c.area && c.area.toLowerCase().includes(job.title.toLowerCase().split(' ')[0])) {
        score += 20;
        reasons.push('Área de atuação compatível com o cargo da vaga');
      }

      // Location match
      if (job.location && c.city && c.city.toLowerCase() === job.location.toLowerCase()) {
        score += 15;
        reasons.push(`Localização coincidente (${c.city})`);
      }

      // Work model
      if (job.workModel && c.workModel && job.workModel.toLowerCase() === c.workModel.toLowerCase()) {
        score += 10;
        reasons.push(`Modalidade de trabalho compatível (${job.workModel})`);
      }

      // Skills match
      if (job.requirements && c.skills && c.skills.length > 0) {
        const matchedSkills = c.skills.filter(s => job.requirements.some(r => r.toLowerCase().includes(s.toLowerCase())));
        if (matchedSkills.length > 0) {
          score += 15;
          reasons.push(`Competências correspondentes: ${matchedSkills.join(', ')}`);
        }
      }

      // Availability
      if (c.screening?.availability === 'Imediata') {
        score += 5;
        reasons.push('Disponibilidade imediata');
      }

      const finalScore = Math.min(Math.max(score, 10), 99);
      return {
        candidate: c,
        matchScore: finalScore,
        reasons: reasons.length > 0 ? reasons : ['Compatibilidade geral com os requisitos da vaga']
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
};

// 6. INTERVIEW SERVICE
export const InterviewService = {
  getInterviews(companyId: string): SmartInterview[] {
    return getLocalCollection<SmartInterview>('INTERVIEWS', companyId, []);
  },

  getInterviewById(id: string, companyId: string): SmartInterview | undefined {
    return this.getInterviews(companyId).find(i => i.id === id);
  },

  saveInterview(interview: SmartInterview, companyId: string): SmartInterview {
    const list = this.getInterviews(companyId);
    const idx = list.findIndex(i => i.id === interview.id);
    if (idx >= 0) {
      list[idx] = interview;
    } else {
      list.unshift(interview);
    }
    saveLocalCollection('INTERVIEWS', companyId, list);
    return interview;
  },

  deleteInterview(id: string, companyId: string): void {
    const list = this.getInterviews(companyId).filter(i => i.id !== id);
    saveLocalCollection('INTERVIEWS', companyId, list);
  }
};

// 7. HEADHUNTER SERVICE
export const HeadhunterService = {
  getClients(companyId: string): ClienteEmpresa[] {
    return getLocalCollection<ClienteEmpresa>('HEADHUNTER_CLIENTS', companyId, INITIAL_CLIENTES);
  },

  saveClient(client: ClienteEmpresa, companyId: string): ClienteEmpresa {
    const list = this.getClients(companyId);
    const idx = list.findIndex(c => c.id === client.id);
    if (idx >= 0) {
      list[idx] = client;
    } else {
      list.unshift(client);
    }
    saveLocalCollection('HEADHUNTER_CLIENTS', companyId, list);
    return client;
  },

  deleteClient(id: string, companyId: string): void {
    const list = this.getClients(companyId).filter(c => c.id !== id);
    saveLocalCollection('HEADHUNTER_CLIENTS', companyId, list);
  },

  getFinancialContracts(companyId: string): FinanceiroContrato[] {
    return getLocalCollection<FinanceiroContrato>('HEADHUNTER_FINANCE', companyId, INITIAL_CONTRATOS_FINANCEIRO);
  },

  saveFinancialContract(contract: FinanceiroContrato, companyId: string): FinanceiroContrato {
    const list = this.getFinancialContracts(companyId);
    // Sanitize status from invalid spellings
    if ((contract.status as string) === 'GUARDANDO_COBRANCA') {
      contract.status = 'AGUARDANDO_COBRANCA' as any;
    }
    const idx = list.findIndex(f => f.id === contract.id);
    if (idx >= 0) {
      list[idx] = contract;
    } else {
      list.unshift(contract);
    }
    saveLocalCollection('HEADHUNTER_FINANCE', companyId, list);
    return contract;
  }
};

// 8. DP SERVICE
export const DpService = {
  getEmployees(companyId: string): Employee[] {
    return getLocalCollection<Employee>('EMPLOYEES', companyId, INITIAL_EMPLOYEES.map(e => ({ ...e, companyId })));
  },
  saveEmployee(emp: Employee, companyId: string): Employee {
    const list = this.getEmployees(companyId);
    const updated = { ...emp, companyId };
    const idx = list.findIndex(e => e.id === emp.id);
    if (idx >= 0) list[idx] = updated;
    else list.unshift(updated);
    saveLocalCollection('EMPLOYEES', companyId, list);
    return updated;
  },

  getTimeRegisters(companyId: string): TimeRegister[] {
    return getLocalCollection<TimeRegister>('TIME_REGISTERS', companyId, INITIAL_TIME_REGISTERS);
  },
  saveTimeRegisters(regs: TimeRegister[], companyId: string): void {
    saveLocalCollection('TIME_REGISTERS', companyId, regs);
  },

  getVacationRequests(companyId: string): VacationRequest[] {
    return getLocalCollection<VacationRequest>('VACATION_REQUESTS', companyId, INITIAL_VACATION_REQUESTS);
  },
  saveVacationRequests(reqs: VacationRequest[], companyId: string): void {
    saveLocalCollection('VACATION_REQUESTS', companyId, reqs);
  },

  getPayslips(companyId: string): PaySlip[] {
    return getLocalCollection<PaySlip>('PAYSLIPS', companyId, INITIAL_PAYSLIPS);
  },
  savePayslips(slips: PaySlip[], companyId: string): void {
    saveLocalCollection('PAYSLIPS', companyId, slips);
  },

  getDocuments(companyId: string): DocumentFile[] {
    return getLocalCollection<DocumentFile>('DOCUMENTS', companyId, INITIAL_DOCUMENTS);
  },
  saveDocuments(docs: DocumentFile[], companyId: string): void {
    saveLocalCollection('DOCUMENTS', companyId, docs);
  },

  getContracts(companyId: string): OnboardingContract[] {
    return getLocalCollection<OnboardingContract>('CONTRACTS', companyId, INITIAL_CONTRACTS);
  },
  saveContracts(contracts: OnboardingContract[], companyId: string): void {
    saveLocalCollection('CONTRACTS', companyId, contracts);
  },

  getBenefits(companyId: string): Benefit[] {
    return getLocalCollection<Benefit>('BENEFITS', companyId, INITIAL_BENEFITS);
  },
  saveBenefits(benefits: Benefit[], companyId: string): void {
    saveLocalCollection('BENEFITS', companyId, benefits);
  },

  getEmployeeBenefits(companyId: string): EmployeeBenefit[] {
    return getLocalCollection<EmployeeBenefit>('EMPLOYEE_BENEFITS', companyId, INITIAL_EMPLOYEE_BENEFITS);
  },
  saveEmployeeBenefits(ebs: EmployeeBenefit[], companyId: string): void {
    saveLocalCollection('EMPLOYEE_BENEFITS', companyId, ebs);
  },

  getTerminations(companyId: string): Termination[] {
    return getLocalCollection<Termination>('TERMINATIONS', companyId, INITIAL_TERMINATIONS);
  },
  saveTerminations(terms: Termination[], companyId: string): void {
    saveLocalCollection('TERMINATIONS', companyId, terms);
  },

  getExtraHours(companyId: string): ExtraHourRequest[] {
    return getLocalCollection<ExtraHourRequest>('HORAS_EXTRAS', companyId, []);
  },
  saveExtraHours(he: ExtraHourRequest[], companyId: string): void {
    saveLocalCollection('HORAS_EXTRAS', companyId, he);
  },

  getPointCorrections(companyId: string): PointCorrectionRequest[] {
    return getLocalCollection<PointCorrectionRequest>('CORRECOES_PONTO', companyId, []);
  },
  savePointCorrections(pc: PointCorrectionRequest[], companyId: string): void {
    saveLocalCollection('CORRECOES_PONTO', companyId, pc);
  },

  getINSSBrackets(companyId: string): INSSBracket[] {
    return getLocalCollection<INSSBracket>('TABELA_INSS', companyId, []);
  },
  saveINSSBrackets(inss: INSSBracket[], companyId: string): void {
    saveLocalCollection('TABELA_INSS', companyId, inss);
  },

  getIRRFBrackets(companyId: string): IRRFBracket[] {
    return getLocalCollection<IRRFBracket>('TABELA_IRRF', companyId, []);
  },
  saveIRRFBrackets(irrf: IRRFBracket[], companyId: string): void {
    saveLocalCollection('TABELA_IRRF', companyId, irrf);
  }
};

// 9. SITE CONFIG SERVICE
export const SiteConfigService = {
  getSiteConfig(): SiteConfig {
    try {
      const raw = localStorage.getItem('rl_connect_site_config');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('SiteConfigService error:', e);
    }
    return DEFAULT_SITE_CONFIG;
  },

  saveSiteConfig(config: SiteConfig): void {
    localStorage.setItem('rl_connect_site_config', JSON.stringify(config));
  }
};

// Backward-compatibility wrapper for legacy firebaseService calls
export const firebaseService = {
  auth: {
    getCurrentUser() { return AuthService.getCurrentUser(); },
    signIn(e: string, p: string) { return AuthService.signIn(e, p); },
    signUp(e: string, n: string, r: string, c: string, emp?: string, pass?: string) { return AuthService.signUp(e, n, r, c, emp, pass); },
    signOut() { return AuthService.signOut(); }
  },
  db: {
    async getCollection<T>(collectionName: string, companyId: string = 'company-1'): Promise<T[]> {
      if (collectionName === 'JOBS') return JobService.getJobs(companyId) as unknown as T[];
      if (collectionName === 'CANDIDATES') return CandidateService.getCandidates(companyId) as unknown as T[];
      if (collectionName === 'EMPLOYEES') return DpService.getEmployees(companyId) as unknown as T[];
      if (collectionName === 'TIME_REGISTERS') return DpService.getTimeRegisters(companyId) as unknown as T[];
      if (collectionName === 'VACATION_REQUESTS') return DpService.getVacationRequests(companyId) as unknown as T[];
      if (collectionName === 'PAYSLIPS') return DpService.getPayslips(companyId) as unknown as T[];
      if (collectionName === 'DOCUMENTS') return DpService.getDocuments(companyId) as unknown as T[];
      if (collectionName === 'CONTRACTS') return DpService.getContracts(companyId) as unknown as T[];
      if (collectionName === 'BENEFITS') return DpService.getBenefits(companyId) as unknown as T[];
      if (collectionName === 'EMPLOYEE_BENEFITS') return DpService.getEmployeeBenefits(companyId) as unknown as T[];
      if (collectionName === 'TERMINATIONS') return DpService.getTerminations(companyId) as unknown as T[];
      if (collectionName === 'HORAS_EXTRAS') return DpService.getExtraHours(companyId) as unknown as T[];
      if (collectionName === 'CORRECOES_PONTO') return DpService.getPointCorrections(companyId) as unknown as T[];
      if (collectionName === 'TABELA_INSS') return DpService.getINSSBrackets(companyId) as unknown as T[];
      if (collectionName === 'TABELA_IRRF') return DpService.getIRRFBrackets(companyId) as unknown as T[];
      if (collectionName === 'MODULES') return getGlobalCollection<SaaSModule>('MODULES') as unknown as T[];
      if (collectionName === 'PRODUCTS') return getGlobalCollection<SaaSProduct>('PRODUCTS') as unknown as T[];
      if (collectionName === 'PLANS') return getGlobalCollection<SaaSPlan>('PLANS') as unknown as T[];
      if (collectionName === 'COMPANIES') return CompanyService.getCompanies() as unknown as T[];
      if (collectionName === 'USERS') return UserService.getUsers() as unknown as T[];
      return getLocalCollection<T>(collectionName, companyId);
    },
    async saveDoc<T>(collectionName: string, docData: any, companyId: string = 'company-1'): Promise<T> {
      if (collectionName === 'JOBS') return JobService.saveJob(docData, companyId) as unknown as T;
      if (collectionName === 'CANDIDATES') return CandidateService.saveCandidate(docData, companyId) as unknown as T;
      if (collectionName === 'EMPLOYEES') return DpService.saveEmployee(docData, companyId) as unknown as T;
      if (collectionName === 'MODULES') { saveGlobalCollection('MODULES', [docData]); return docData as T; }
      if (collectionName === 'COMPANIES') return CompanyService.saveCompany(docData) as unknown as T;
      if (collectionName === 'USERS') return UserService.saveUser(docData) as unknown as T;
      const list = getLocalCollection<any>(collectionName, companyId);
      const idx = list.findIndex(i => i.id === docData.id);
      if (idx >= 0) list[idx] = docData;
      else list.push(docData);
      saveLocalCollection(collectionName, companyId, list);
      return docData as T;
    },
    async deleteDoc(collectionName: string, id: string, companyId: string = 'company-1'): Promise<void> {
      const list = getLocalCollection<any>(collectionName, companyId).filter(i => i.id !== id);
      saveLocalCollection(collectionName, companyId, list);
    },
    async getSiteConfig(): Promise<SiteConfig> {
      return SiteConfigService.getSiteConfig();
    },
    async saveSiteHome(home: any): Promise<void> {
      const cfg = SiteConfigService.getSiteConfig();
      cfg.home = { ...cfg.home, ...home };
      SiteConfigService.saveSiteConfig(cfg);
    },
    async saveSiteEmpresa(empresa: any): Promise<void> {
      const cfg = SiteConfigService.getSiteConfig();
      cfg.empresa = { ...cfg.empresa, ...empresa };
      SiteConfigService.saveSiteConfig(cfg);
    },
    async saveSitePlanos(planos: any): Promise<void> {
      const cfg = SiteConfigService.getSiteConfig();
      cfg.planos = planos;
      SiteConfigService.saveSiteConfig(cfg);
    },
    async saveSiteMidia(midia: any): Promise<void> {
      const cfg = SiteConfigService.getSiteConfig();
      cfg.midia = { ...cfg.midia, ...midia };
      SiteConfigService.saveSiteConfig(cfg);
    },
    async saveSiteContato(contato: any): Promise<void> {
      const cfg = SiteConfigService.getSiteConfig();
      cfg.contato = { ...cfg.contato, ...contato };
      SiteConfigService.saveSiteConfig(cfg);
    },
    async saveCompany(company: SaaSCompany): Promise<SaaSCompany> {
      return CompanyService.saveCompany(company);
    },
    async deleteCompany(id: string): Promise<void> {
      CompanyService.deleteCompany(id);
    },
    async getUsers(): Promise<UserAccount[]> {
      return UserService.getUsers();
    },
    async saveUser(user: UserAccount): Promise<UserAccount> {
      return UserService.saveUser(user);
    },
    async getModules(): Promise<SaaSModule[]> {
      return getGlobalCollection<SaaSModule>('MODULES');
    },
    async saveModule(module: SaaSModule): Promise<SaaSModule> {
      const modules = getGlobalCollection<SaaSModule>('MODULES');
      const idx = modules.findIndex(m => m.id === module.id);
      if (idx >= 0) modules[idx] = module;
      else modules.push(module);
      saveGlobalCollection('MODULES', modules);
      return module;
    },
    async getProducts(): Promise<SaaSProduct[]> {
      return getGlobalCollection<SaaSProduct>('PRODUCTS');
    },
    async getPlans(): Promise<SaaSPlan[]> {
      return getGlobalCollection<SaaSPlan>('PLANS');
    },
    async getCompanies(): Promise<SaaSCompany[]> {
      return CompanyService.getCompanies();
    },
    async deleteModule(id: string): Promise<void> {
      const modules = getGlobalCollection<SaaSModule>('MODULES').filter(m => m.id !== id);
      saveGlobalCollection('MODULES', modules);
    },
    async saveProduct(product: SaaSProduct): Promise<SaaSProduct> {
      const products = getGlobalCollection<SaaSProduct>('PRODUCTS');
      const idx = products.findIndex(p => p.id === product.id);
      if (idx >= 0) products[idx] = product;
      else products.push(product);
      saveGlobalCollection('PRODUCTS', products);
      return product;
    },
    async deleteProduct(id: string): Promise<void> {
      const products = getGlobalCollection<SaaSProduct>('PRODUCTS').filter(p => p.id !== id);
      saveGlobalCollection('PRODUCTS', products);
    },
    async savePlan(plan: SaaSPlan): Promise<SaaSPlan> {
      const plans = getGlobalCollection<SaaSPlan>('PLANS');
      const idx = plans.findIndex(p => p.id === plan.id);
      if (idx >= 0) plans[idx] = plan;
      else plans.push(plan);
      saveGlobalCollection('PLANS', plans);
      return plan;
    },
    async deletePlan(id: string): Promise<void> {
      const plans = getGlobalCollection<SaaSPlan>('PLANS').filter(p => p.id !== id);
      saveGlobalCollection('PLANS', plans);
    }
  },
  master: {
    getModules(): Promise<SaaSModule[]> { return Promise.resolve(getGlobalCollection<SaaSModule>('MODULES')); },
    saveModule(module: SaaSModule): Promise<SaaSModule> { saveGlobalCollection('MODULES', [module]); return Promise.resolve(module); },
    deleteModule(id: string): Promise<void> { return Promise.resolve(); },
    getProducts(): Promise<SaaSProduct[]> { return Promise.resolve(getGlobalCollection<SaaSProduct>('PRODUCTS')); },
    saveProduct(product: SaaSProduct): Promise<SaaSProduct> { return Promise.resolve(product); },
    deleteProduct(id: string): Promise<void> { return Promise.resolve(); },
    getPlans(): Promise<SaaSPlan[]> { return Promise.resolve(getGlobalCollection<SaaSPlan>('PLANS')); },
    savePlan(plan: SaaSPlan): Promise<SaaSPlan> { return Promise.resolve(plan); },
    deletePlan(id: string): Promise<void> { return Promise.resolve(); },
    getCompanies(): Promise<SaaSCompany[]> { return Promise.resolve(CompanyService.getCompanies()); },
    saveCompany(company: SaaSCompany): Promise<SaaSCompany> { return Promise.resolve(CompanyService.saveCompany(company)); },
    deleteCompany(id: string): Promise<void> { CompanyService.deleteCompany(id); return Promise.resolve(); },
    getUsers(): Promise<UserAccount[]> { return Promise.resolve(UserService.getUsers()); },
    saveUser(user: UserAccount): Promise<UserAccount> { return Promise.resolve(UserService.saveUser(user)); },
    deleteUser(id: string): Promise<void> { UserService.deleteUser(id); return Promise.resolve(); }
  }
};
