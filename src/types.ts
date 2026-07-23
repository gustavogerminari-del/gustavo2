/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  area: string;
  experience: string;
  resumeUrl?: string;
  resumeText?: string;
  createdAt: string;
  jobId?: string; // Vaga vinculada
  jobTitle?: string; // Título da vaga para facilidade
  aiScore?: number; // Pontuação da IA (0-100)
  aiAnalysis?: string; // Análise detalhada do currículo pela IA
  status?: 'Recebidos' | 'Novo' | 'Triagem IA' | 'Triagem RH' | 'Triagem' | 'Entrevista' | 'Entrevista RH' | 'Entrevista Técnica' | 'Teste' | 'Proposta' | 'Contratação' | 'Aprovado' | 'Banco de Talentos' | 'Reprovados' | 'Reprovado' | string;
  notes?: string; // Anotações do recrutador
  rating?: number; // Avaliação manual 1-5
  expectedSalary?: string;
  salaryExpectation?: string;
  cpf?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  videoUrl?: string;
  isFavorite?: boolean;
  education?: string;
  workModel?: 'Presencial' | 'Híbrido' | 'Remoto' | string;
  languages?: string[];
  skills?: string[];
  previousCompany?: string;
  screening?: {
    generalRating?: number;
    iaCompatibility?: number;
    experienceLevel?: 'Excelente' | 'Boa' | 'Regular' | 'Baixa';
    educationLevel?: 'Compatível' | 'Parcial' | 'Não Compatível';
    techKnowledge?: 'Excelente' | 'Bom' | 'Regular' | 'Baixo';
    communicationLevel?: 'Excelente' | 'Boa' | 'Regular' | 'Ruim';
    availability?: 'Imediata' | '15 dias' | '30 dias' | 'Outro';
    expectedSalary?: string;
    rhComments?: string;
    privateNotes?: string;
  };
  aiInsights?: {
    matchScore?: number;
    summary?: string;
    skillsIdentified?: string[];
    strengths?: string[];
    concerns?: string[];
    interviewQuestions?: string[];
    turnoverRisk?: 'Baixo' | 'Médio' | 'Alto';
    behavioralProfile?: string;
    recommendation?: 'Aprovar' | 'Segunda Entrevista' | 'Banco de Talentos' | 'Reprovar';
  };
}

export interface JobAnalytics {
  views: number;
  clicks: number;
  applications: number;
  sources?: Record<string, number>;
}

export interface Job {
  id: string;
  title: string;
  role?: string;
  department: string;
  location: string;
  type: string; // CLT, PJ, Estágio, Temporário
  workModel: string; // Presencial, Híbrido, Remoto
  salaryRange: string;
  description: string;
  requirements: string[];
  active: boolean;
  createdAt: string;
  publishedAt?: string;
  publishedToPortal?: boolean; // Publicar automaticamente no portal
  status?: 'Rascunho' | 'Publicada' | 'Encerrada' | string;

  // Campos para Página Pública da Vaga
  slug?: string;
  companyName?: string;
  companyLogo?: string;
  bannerUrl?: string;
  city?: string;
  state?: string;
  responsibilities?: string[];
  differentials?: string[];
  benefits?: string[];
  workHours?: string;
  vacanciesCount?: number;
  prazo?: string;

  // SEO Meta
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Métricas e Análise
  analytics?: JobAnalytics;
}

export type EmployeeStatus = 'Ativo' | 'Em Férias' | 'Afastado' | 'Desligado';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  salary: number;
  admissionDate: string;
  status: EmployeeStatus;
  avatarUrl?: string;
  companyId?: string;

  // Vale Transporte (VT)
  hasValeTransporte?: boolean;
  ticketPrice?: number;
  daysUsed?: number;
  vtMonthlyValue?: number;
  vtEmployeeDiscount?: number;
  vtCompanyPaid?: number;

  // Dependentes (para cálculo de IRRF)
  dependentsCount?: number;

  // Vínculo com Coordenador
  coordinatorId?: string;
  coordinatorName?: string;
}

export interface TimeRegister {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  lunchOut?: string; // HH:MM
  lunchIn?: string; // HH:MM
  clockOut?: string; // HH:MM
  totalHours: number;
  extraHours: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Em andamento' | 'Concluído';
}

export interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  extraHoursEarnings: number;
  deductions: number;
  netSalary: number;
  status: 'Pendente' | 'Pago';
  generatedAt: string;
  // Manual entry fields (Proventos)
  he50?: number;
  he100?: number;
  adicionalNoturno?: number;
  comissao?: number;
  bonificacao?: number;
  premio?: number;
  assiduidade?: number;
  outrosAdicionais?: number;
  // Manual entry fields (Descontos)
  inss?: number;
  irrf?: number;
  valeTransporte?: number;
  faltas?: number;
  atrasos?: number;
  adiantamentos?: number;
}

export interface DocumentFile {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: 'Contrato' | 'Identidade' | 'Comprovante' | 'Exame Médico' | 'Outro';
  uploadDate: string;
  fileName: string;
  fileSize: string;
}

export interface AppSettings {
  companyName: string;
  contactEmail: string;
  phone: string;
  address: string;
  baseWorkHoursPerDay: number;
  extraHoursMultiplier: number;
}

// === NOVOS MÓDULOS DE GESTÃO DE PESSOAS ===

export interface OnboardingContract {
  id: string;
  employeeName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  type: 'CLT' | 'Experiência' | 'Temporário' | 'PJ' | 'Estágio' | 'Aprendiz' | 'Terceirizado';
  startDate: string;
  salary: number;
  status: 'Pendente' | 'Em análise' | 'Assinado' | 'Efetivado' | 'Ativo';
  createdAt: string;
  checklistDocuments: {
    id: string;
    name: string;
    status: 'Pendente' | 'Recebido' | 'Validado';
    fileName?: string;
    uploadedAt?: string;
  }[];
}

export interface Benefit {
  id: string;
  name: string;
  type: 'VT' | 'VA' | 'VR' | 'Comissão' | 'Bonificação' | 'Assiduidade' | 'Premiação' | 'Premiações' | 'Saúde' | 'Odonto' | 'Custom';
  category: 'Provento' | 'Desconto';
  valueType: 'Fixo' | 'Porcentagem';
  value: number;
  status: 'Ativo' | 'Inativo';
}

export interface EmployeeBenefit {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitId: string;
  benefitName: string;
  benefitType: string;
  category: 'Provento' | 'Desconto';
  valueType: 'Fixo' | 'Porcentagem';
  value: number;
  status: 'Ativo' | 'Suspenso';
}

export interface Termination {
  id: string;
  employeeId: string;
  employeeName: string;
  role?: string;
  department?: string;
  salary?: number;
  type: 'Sem justa causa' | 'Justa causa' | 'Pedido de demissão' | 'Acordo legal' | 'Encerramento de contrato';
  date?: string;
  noticePeriod?: 'Trabalhado' | 'Indenizado' | 'Dispensado';
  salaryBalance?: number;
  proportional13th?: number;
  proportionalVacation?: number;
  fgtsFine?: number;
  totalDeductions?: number;
  netPayable?: number;
  status: 'Pendente' | 'Aprovado' | 'Calculado' | 'Pago';
  createdAt?: string;
  notes?: string;
  requestDate?: string;
  terminationDate?: string;
  vacationBalance?: number;
  proportionalThirteenth?: number;
  totalLiquido?: number;
  checklistDocuments?: any[];

  // Multi-tenant Firebase Firestore fields
  funcionarioId?: string;
  dataAdmissao?: string;
  dataDesligamento?: string;
  tipoRescisao?: string;
  motivo?: string;
  salarioBase?: number;
  avisoPrevio?: string | number;
  ferias?: number;
  decimoTerceiro?: number;
  proventos?: number;
  descontos?: number;
  valorLiquido?: number;
  usuarioResponsavel?: string;
  dataCriacao?: string;
  companyId?: string;
}

export interface ResType {
  id: string;
  code: string;
  name: string;
  geraFGTS: boolean;
  geraMultaFGTS: boolean;
  geraSeguroDesemprego: boolean;
  permiteAvisoPrevio: boolean;
}

export interface ResEvent {
  id: string;
  code: string;
  name: string;
  type: 'Provento' | 'Desconto';
  description?: string;
}

export interface ResDocument {
  id: string;
  rescisaoId: string;
  tipoDocumento: 'TRCT' | 'Aviso Prévio' | 'Termo de Quitação' | 'Demonstrativo de Cálculos' | 'Comprovante de Pagamento';
  arquivoPDF: string; // Base64 representing PDF document contents or custom visual representation
  dataGeracao: string;
  companyId?: string;
}

export interface ExtraHourRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  coordinatorId?: string;
  coordinatorName?: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursCount: number;
  type: '50%' | '100%' | 'Banco de Horas' | 'Banco de horas';
  reason: string;
  status: 'Pendente Coordenador' | 'Aprovado Coordenador' | 'Rejeitado Coordenador' | 'Validado RH' | 'Rejeitado RH';
  approvals?: {
    step: 'Coordenador' | 'RH';
    user: string;
    action: 'Aprovar' | 'Rejeitar' | 'Validar';
    date: string;
    notes?: string;
  }[];
  createdAt?: string;
  companyId?: string;
}

export interface PointCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  clockIn: string;
  lunchOut?: string;
  lunchIn?: string;
  clockOut?: string;
  reason: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  approvedBy?: string;
  approvedDate?: string;
  createdAt?: string;
  companyId?: string;
}

export interface INSSBracket {
  id: string;
  year: number;
  minSalary: number;
  maxSalary: number;
  rate: number; // e.g. 0.075 for 7.5%
  deductible: number;
  companyId?: string;
}

export interface IRRFBracket {
  id: string;
  year: number;
  minSalary: number;
  maxSalary: number;
  rate: number; // e.g. 0.075 for 7.5%
  deduction: number;
  dependentDeduction: number;
  companyId?: string;
}


