import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Star, 
  User, 
  MapPin, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  BadgeAlert,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Building2,
  Eye,
  Share2,
  Copy,
  BarChart3,
  QrCode,
  ExternalLink,
  Upload,
  Globe,
  RotateCcw,
  Gift,
  Award,
  Link,
  Columns,
  Inbox,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GripVertical,
  TrendingUp,
  Maximize2,
  Minimize2,
  Layers,
  Video,
  Calendar,
  Shield,
  Bookmark,
  Play,
  Heart,
  ThumbsUp,
  ThumbsDown,
  SlidersHorizontal,
  CheckSquare,
  MessageCircle,
  MoreVertical,
  Paperclip,
  ChevronDown,
  BriefcaseIcon,
  HelpCircle,
  Info,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Palette,
  Settings
} from 'lucide-react';
import { Job, Candidate } from '../types';
import PublicJobPage from './PublicJobPage';
import PublicJobPreviewModal from './PublicJobPreviewModal';
import { generateJobSlug, getPublicJobUrl, getDefaultBanner } from './publicJobUtils';
import SmartInterviewModule from './interview/SmartInterviewModule';

interface RecruitmentModuleProps {
  jobs: Job[];
  candidates: Candidate[];
  onUpdateJobs: (jobs: Job[]) => void;
  onUpdateCandidates: (candidates: Candidate[]) => void;
  triggerToast: (msg: string) => void;
  initialTab?: 'curriculos' | 'vagas' | 'triagem' | 'entrevistas';
}

export interface KanbanStage {
  id: string;
  label: string;
  color: string;
  badge: string;
  barColor: string;
  headerBg: string;
  isDefault?: boolean;
  hidden?: boolean;
  whenRule?: string;
}

export const COLOR_THEMES: Record<string, { label: string, color: string, badge: string, barColor: string, headerBg: string }> = {
  slate: { label: 'Cinza (Geral)', color: 'border-slate-200 bg-slate-50 text-slate-800', badge: 'bg-slate-200 text-slate-800 font-bold', barColor: 'bg-slate-500', headerBg: 'bg-slate-100 text-slate-700' },
  blue: { label: 'Azul (Triagem)', color: 'border-blue-200 bg-blue-50/60 text-blue-900', badge: 'bg-blue-100 text-blue-900 font-bold', barColor: 'bg-blue-600', headerBg: 'bg-blue-500/10 text-blue-800' },
  amber: { label: 'Âmbar (Alerta / IA)', color: 'border-amber-200 bg-amber-50/60 text-amber-900', badge: 'bg-amber-100 text-amber-900 font-bold', barColor: 'bg-amber-500', headerBg: 'bg-amber-500/10 text-amber-800' },
  purple: { label: 'Roxo (Entrevista)', color: 'border-purple-200 bg-purple-50/60 text-purple-900', badge: 'bg-purple-100 text-purple-900 font-bold', barColor: 'bg-purple-600', headerBg: 'bg-purple-500/10 text-purple-800' },
  indigo: { label: 'Índigo (Técnico)', color: 'border-indigo-200 bg-indigo-50/60 text-indigo-900', badge: 'bg-indigo-100 text-indigo-900 font-bold', barColor: 'bg-indigo-600', headerBg: 'bg-indigo-500/10 text-indigo-800' },
  cyan: { label: 'Ciano (Avaliação)', color: 'border-cyan-200 bg-cyan-50/60 text-cyan-900', badge: 'bg-cyan-100 text-cyan-900 font-bold', barColor: 'bg-cyan-600', headerBg: 'bg-cyan-500/10 text-cyan-800' },
  teal: { label: 'Teal (Proposta)', color: 'border-teal-200 bg-teal-50/60 text-teal-900', badge: 'bg-teal-100 text-teal-900 font-bold', barColor: 'bg-teal-600', headerBg: 'bg-teal-500/10 text-teal-800' },
  emerald: { label: 'Esmeralda (Contratação)', color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900', badge: 'bg-emerald-100 text-emerald-900 font-bold', barColor: 'bg-emerald-600', headerBg: 'bg-emerald-500/10 text-emerald-800' },
  rose: { label: 'Rosa (Reprovados)', color: 'border-rose-200 bg-rose-50/60 text-rose-900', badge: 'bg-rose-100 text-rose-900 font-bold', barColor: 'bg-rose-600', headerBg: 'bg-rose-500/10 text-rose-800' },
  orange: { label: 'Laranja (Pendente)', color: 'border-orange-200 bg-orange-50/60 text-orange-900', badge: 'bg-orange-100 text-orange-900 font-bold', barColor: 'bg-orange-600', headerBg: 'bg-orange-500/10 text-orange-800' }
};

export const DEFAULT_KANBAN_STAGES: KanbanStage[] = [
  { id: 'Recebidos', label: 'Recebidos', color: 'border-slate-200 bg-slate-50 text-slate-800', badge: 'bg-slate-200 text-slate-800', barColor: 'bg-slate-500', headerBg: 'bg-slate-100 text-slate-700', isDefault: true, whenRule: 'Candidato inscrito no portal de vagas ou cadastrado manualmente pelo recrutador.' },
  { id: 'Triagem IA', label: 'Triagem IA', color: 'border-amber-200 bg-amber-50/60 text-amber-900', badge: 'bg-amber-100 text-amber-900 font-bold', barColor: 'bg-amber-500', headerBg: 'bg-amber-500/10 text-amber-800', isDefault: true, whenRule: 'Currículo submetido para análise automatizada de perfil e compatibilidade por IA.' },
  { id: 'Triagem RH', label: 'Triagem RH', color: 'border-blue-200 bg-blue-50/60 text-blue-900', badge: 'bg-blue-100 text-blue-900 font-bold', barColor: 'bg-blue-600', headerBg: 'bg-blue-500/10 text-blue-800', isDefault: true, whenRule: 'Validação prévia de requisitos da vaga e pretensão salarial pelo time de RH.' },
  { id: 'Entrevista RH', label: 'Entrevista RH', color: 'border-purple-200 bg-purple-50/60 text-purple-900', badge: 'bg-purple-100 text-purple-900 font-bold', barColor: 'bg-purple-600', headerBg: 'bg-purple-500/10 text-purple-800', isDefault: true, whenRule: 'Agendamento de entrevista inicial comportamental e alinhamento de valores com o RH.' },
  { id: 'Entrevista Técnica', label: 'Entrevista Técnica', color: 'border-indigo-200 bg-indigo-50/60 text-indigo-900', badge: 'bg-indigo-100 text-indigo-900 font-bold', barColor: 'bg-indigo-600', headerBg: 'bg-indigo-500/10 text-indigo-800', isDefault: true, whenRule: 'Avaliação técnica aprofundada com o líder direto ou gestor da área.' },
  { id: 'Teste', label: 'Teste', color: 'border-cyan-200 bg-cyan-50/60 text-cyan-900', badge: 'bg-cyan-100 text-cyan-900 font-bold', barColor: 'bg-cyan-600', headerBg: 'bg-cyan-500/10 text-cyan-800', isDefault: true, whenRule: 'Envio ou apresentação de desafio prático, case de negócios ou teste prático.' },
  { id: 'Proposta', label: 'Proposta', color: 'border-teal-200 bg-teal-50/60 text-teal-900', badge: 'bg-teal-100 text-teal-900 font-bold', barColor: 'bg-teal-600', headerBg: 'bg-teal-500/10 text-teal-800', isDefault: true, whenRule: 'Apresentação formal da proposta salarial e negociação de benefícios.' },
  { id: 'Contratação', label: 'Contratação', color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900', badge: 'bg-emerald-100 text-emerald-900 font-bold', barColor: 'bg-emerald-600', headerBg: 'bg-emerald-500/10 text-emerald-800', isDefault: true, whenRule: 'Proposta aceita, solicitação de documentação para admissão e onboarding.' },
  { id: 'Banco de Talentos', label: 'Banco de Talentos', color: 'border-purple-300 bg-purple-50/80 text-purple-950', badge: 'bg-purple-200 text-purple-900 font-bold', barColor: 'bg-purple-700', headerBg: 'bg-purple-500/20 text-purple-900', isDefault: true, whenRule: 'Candidato com alto potencial guardado para oportunidades futuras.' },
  { id: 'Reprovados', label: 'Reprovados', color: 'border-rose-200 bg-rose-50/60 text-rose-900', badge: 'bg-rose-100 text-rose-900 font-bold', barColor: 'bg-rose-600', headerBg: 'bg-rose-500/10 text-rose-800', isDefault: true, whenRule: 'Candidato desclassificado no processo seletivo atual.' }
];

export const KANBAN_STAGES = DEFAULT_KANBAN_STAGES;

export function getCandidateStage(candidate: Candidate, stagesList?: KanbanStage[]): string {
  const st = (candidate.status || 'Recebidos').trim();
  const list = stagesList || DEFAULT_KANBAN_STAGES;
  const match = list.find(s => s.id === st || s.label.toLowerCase() === st.toLowerCase());
  if (match) return match.id;

  if (st === 'Novo' || st === 'Novos' || st === 'Recebidos' || st === 'Recebido') return 'Recebidos';
  if (st === 'Triagem IA' || st === 'IA') return 'Triagem IA';
  if (st === 'Triagem RH' || st === 'Triagem' || st === 'Em Triagem') return 'Triagem RH';
  if (st === 'Entrevista RH' || st === 'Entrevista') return 'Entrevista RH';
  if (st === 'Entrevista Técnica' || st === 'Técnica') return 'Entrevista Técnica';
  if (st === 'Teste' || st === 'Testes') return 'Teste';
  if (st === 'Proposta' || st === 'Oferta') return 'Proposta';
  if (st === 'Contratação' || st === 'Contratado' || st === 'Aprovado' || st === 'Aprovados') return 'Contratação';
  if (st === 'Banco de Talentos' || st === 'Banco') return 'Banco de Talentos';
  if (st === 'Reprovado' || st === 'Reprovados' || st === 'Descartado') return 'Reprovados';

  return list[0]?.id || 'Recebidos';
}

export default function RecruitmentModule({
  jobs,
  candidates,
  onUpdateJobs,
  onUpdateCandidates,
  triggerToast,
  initialTab
}: RecruitmentModuleProps) {

  // Active Sub-Tab State ('vagas' | 'triagem' | 'entrevistas')
  const [subTab, setSubTab] = useState<'vagas' | 'triagem' | 'entrevistas'>(() => {
    if (initialTab === 'vagas') return 'vagas';
    if (initialTab === 'entrevistas') return 'entrevistas';
    return 'triagem';
  });

  React.useEffect(() => {
    if (initialTab === 'vagas') setSubTab('vagas');
    else if (initialTab === 'entrevistas') setSubTab('entrevistas');
    else if ((initialTab as string) === 'triagem' || initialTab === 'curriculos') setSubTab('triagem');
  }, [initialTab]);

  // Selected & Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
  const [viewingPublicJob, setViewingPublicJob] = useState<Job | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [analyticsModalJob, setAnalyticsModalJob] = useState<Job | null>(null);
  const [shareModalJob, setShareModalJob] = useState<Job | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active view overlay mode for SmartInterview / GestRH Meeting
  const [meetingCandidate, setMeetingCandidate] = useState<Candidate | null>(null);
  const [showSmartInterviewModule, setShowSmartInterviewModule] = useState(false);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    isDanger: true,
    onConfirm: () => {}
  });

  // Candidate Drawer state
  const [drawerCandidate, setDrawerCandidate] = useState<Candidate | null>(null);
  const [drawerTab, setDrawerTab] = useState<'resumo' | 'triagem' | 'acoes' | 'ia' | 'curriculo' | 'portfolio' | 'experiencias' | 'entrevistas' | 'anotacoes'>('resumo');

  // Drag and Drop & View Mode state for Kanban
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [kanbanViewMode, setKanbanViewMode] = useState<'board' | 'compact'>('board');

  // Dynamic Kanban Stages State
  const [kanbanStages, setKanbanStages] = useState<KanbanStage[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_kanban_stages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Error loading kanban stages', err);
    }
    return DEFAULT_KANBAN_STAGES;
  });

  const visibleStages = useMemo(() => kanbanStages.filter(s => !s.hidden), [kanbanStages]);

  const saveStages = (newStages: KanbanStage[]) => {
    setKanbanStages(newStages);
    try {
      localStorage.setItem('gestrh_kanban_stages', JSON.stringify(newStages));
    } catch (err) {
      console.error('Error saving kanban stages', err);
    }
  };

  // Column Modal States
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<KanbanStage | null>(null);
  const [columnName, setColumnName] = useState('');
  const [columnColorKey, setColumnColorKey] = useState('blue');
  const [columnWhenRule, setColumnWhenRule] = useState('');
  const [insertAfterId, setInsertAfterId] = useState('end');

  // Manage Columns Modal
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  // Remove Column Confirmation Modal State
  const [removeColumnModal, setRemoveColumnModal] = useState<{
    isOpen: boolean;
    stageToRemove: KanbanStage | null;
    targetStageId: string;
  }>({
    isOpen: false,
    stageToRemove: null,
    targetStageId: 'Recebidos'
  });

  // Filter States
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'Todas' | 'Ativas' | 'Encerradas'>('Todas');
  const [jobDepartmentFilter, setJobDepartmentFilter] = useState<string>('Todos');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterJobId, setFilterJobId] = useState<string>('Todas');
  const [filterCity, setFilterCity] = useState<string>('Todas');
  const [filterExp, setFilterExp] = useState<string>('Todas');
  const [filterEdu, setFilterEdu] = useState<string>('Todas');
  const [filterWorkModel, setFilterWorkModel] = useState<string>('Todos');
  const [filterSalary, setFilterSalary] = useState<string>('Todas');
  const [filterMatchIA, setFilterMatchIA] = useState<string>('Todos');
  const [filterDate, setFilterDate] = useState<string>('Todas');
  const [filterOnlyFavorites, setFilterOnlyFavorites] = useState(false);

  // Screening Form State (inside drawer)
  const [screeningData, setScreeningData] = useState<{
    generalRating: number;
    iaCompatibility: number;
    experienceLevel: 'Excelente' | 'Boa' | 'Regular' | 'Baixa';
    educationLevel: 'Compatível' | 'Parcial' | 'Não Compatível';
    techKnowledge: 'Excelente' | 'Bom' | 'Regular' | 'Baixo';
    communicationLevel: 'Excelente' | 'Boa' | 'Regular' | 'Ruim';
    availability: 'Imediata' | '15 dias' | '30 dias' | 'Outro';
    expectedSalary: string;
    rhComments: string;
    privateNotes: string;
  }>({
    generalRating: 4,
    iaCompatibility: 85,
    experienceLevel: 'Boa',
    educationLevel: 'Compatível',
    techKnowledge: 'Bom',
    communicationLevel: 'Boa',
    availability: 'Imediata',
    expectedSalary: 'R$ 8.000,00',
    rhComments: '',
    privateNotes: ''
  });

  // Extended Job Form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('TI');
  const [companyName, setCompanyName] = useState('TECHCORP INOVAÇÕES');
  const [companyLogo, setCompanyLogo] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [jobModel, setJobModel] = useState<'Presencial' | 'Híbrido' | 'Remoto'>('Híbrido');
  const [jobType, setJobType] = useState('CLT');
  const [jobSalary, setJobSalary] = useState('R$ 8.000,00');
  const [jobLocation, setJobLocation] = useState('São Paulo - SP');
  const [city, setCity] = useState('São Paulo');
  const [stateUF, setStateUF] = useState('SP');
  const [jobPrazo, setJobPrazo] = useState('2026-08-30');
  const [jobStatus, setJobStatus] = useState<'Rascunho' | 'Publicada' | 'Encerrada'>('Publicada');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqsText, setJobReqsText] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [differentialsText, setDifferentialsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [workHours, setWorkHours] = useState('44h semanais, Segunda a Sexta');
  const [vacanciesCount, setVacanciesCount] = useState(1);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywordsText, setSeoKeywordsText] = useState('');

  // New Candidate Form State
  const [newCandName, setNewCandName] = useState('');
  const [newCandEmail, setNewCandEmail] = useState('');
  const [newCandPhone, setNewCandPhone] = useState('');
  const [newCandCity, setNewCandCity] = useState('São Paulo');
  const [newCandState, setNewCandState] = useState('SP');
  const [newCandArea, setNewCandArea] = useState('TI');
  const [newCandExp, setNewCandExp] = useState('Sênior (5+ anos)');
  const [newCandJobId, setNewCandJobId] = useState('');
  const [newCandResumeText, setNewCandResumeText] = useState('');
  const [newCandSalary, setNewCandSalary] = useState('R$ 8.000,00');

  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

  // Sync candidate screening data when drawer opens
  const handleOpenCandidateDrawer = (cand: Candidate) => {
    setDrawerCandidate(cand);
    setDrawerTab('resumo');
    setScreeningData({
      generalRating: cand.screening?.generalRating || cand.rating || 4,
      iaCompatibility: cand.screening?.iaCompatibility || cand.aiScore || 85,
      experienceLevel: cand.screening?.experienceLevel || 'Boa',
      educationLevel: cand.screening?.educationLevel || 'Compatível',
      techKnowledge: cand.screening?.techKnowledge || 'Bom',
      communicationLevel: cand.screening?.communicationLevel || 'Boa',
      availability: cand.screening?.availability || 'Imediata',
      expectedSalary: cand.screening?.expectedSalary || cand.salaryExpectation || cand.expectedSalary || 'R$ 8.000,00',
      rhComments: cand.screening?.rhComments || cand.notes || '',
      privateNotes: cand.screening?.privateNotes || ''
    });
  };

  // Job Modal Handlers
  const openAddModal = () => {
    setEditingJob(null);
    setJobTitle('');
    setJobDept('TI');
    setCompanyName('TECHCORP INOVAÇÕES');
    setCompanyLogo('');
    setBannerUrl('');
    setJobModel('Híbrido');
    setJobType('CLT');
    setJobSalary('R$ 8.000,00');
    setJobLocation('São Paulo - SP');
    setCity('São Paulo');
    setStateUF('SP');
    setJobPrazo('2026-08-30');
    setJobStatus('Publicada');
    setJobDesc('');
    setJobReqsText('');
    setResponsibilitiesText('');
    setDifferentialsText('');
    setBenefitsText('Vale Refeição / Alimentação (R$ 40/dia)\nPlano de Saúde e Odontológico\nAuxílio Home Office\nGympass / TotalPass');
    setWorkHours('44h semanais, Seg a Sex');
    setVacanciesCount(1);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywordsText('');
    setIsNewJobOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setJobTitle(job.title);
    setJobDept(job.department || 'TI');
    setCompanyName(job.companyName || 'TECHCORP INOVAÇÕES');
    setCompanyLogo(job.companyLogo || '');
    setBannerUrl(job.bannerUrl || '');
    setJobModel((job.workModel as any) || 'Híbrido');
    setJobType(job.type || 'CLT');
    setJobSalary(job.salaryRange || 'R$ 8.000,00');
    setJobLocation(job.location || 'São Paulo - SP');
    setCity(job.city || job.location?.split('-')[0]?.trim() || 'São Paulo');
    setStateUF(job.state || job.location?.split('-')[1]?.trim() || 'SP');
    setJobPrazo((job as any).prazo || '2026-08-30');
    setJobStatus(
      job.status === 'Rascunho' || job.status === 'Encerrada' || job.status === 'Publicada'
        ? (job.status as 'Rascunho' | 'Publicada' | 'Encerrada')
        : job.active ? 'Publicada' : 'Rascunho'
    );
    setJobDesc(job.description || '');
    setJobReqsText((job.requirements || []).join('\n'));
    setResponsibilitiesText((job.responsibilities || []).join('\n'));
    setDifferentialsText((job.differentials || []).join('\n'));
    setBenefitsText((job.benefits || ['Vale Refeição (R$ 40/dia)', 'Plano de Saúde Bradesco', 'Auxílio Home Office']).join('\n'));
    setWorkHours(job.workHours || '44h semanais, Seg a Sex');
    setVacanciesCount(job.vacanciesCount || 1);
    setSeoTitle(job.seoTitle || '');
    setSeoDescription(job.seoDescription || '');
    setSeoKeywordsText((job.seoKeywords || []).join(', '));
    setIsNewJobOpen(true);
  };

  const handleDeleteJob = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Vaga',
      message: 'Tem certeza que deseja excluir esta vaga permanentemente?',
      confirmText: 'Sim, Excluir Vaga',
      isDanger: true,
      onConfirm: () => {
        const updated = jobs.filter(j => j.id !== id);
        onUpdateJobs(updated);
        if (selectedJob?.id === id) {
          setSelectedJob(updated[0] || null);
        }
        triggerToast('✓ Vaga excluída com sucesso.');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJobId = editingJob ? editingJob.id : `JOB-${Date.now()}`;
    const slug = generateJobSlug(jobTitle, newJobId);
    const reqs = jobReqsText.split('\n').filter(r => r.trim() !== '');
    const resps = responsibilitiesText.split('\n').filter(r => r.trim() !== '');
    const diffs = differentialsText.split('\n').filter(r => r.trim() !== '');
    const bens = benefitsText.split('\n').filter(r => r.trim() !== '');
    const keywords = seoKeywordsText.split(',').map(k => k.trim()).filter(Boolean);

    if (editingJob) {
      const updatedJobs = jobs.map(j => j.id === editingJob.id ? {
        ...j,
        title: jobTitle,
        department: jobDept,
        companyName,
        companyLogo,
        bannerUrl: bannerUrl || getDefaultBanner(jobDept),
        workModel: jobModel,
        type: jobType,
        salaryRange: jobSalary,
        location: `${city} - ${stateUF}`,
        city,
        state: stateUF,
        description: jobDesc,
        requirements: reqs,
        responsibilities: resps,
        differentials: diffs,
        benefits: bens,
        workHours,
        vacanciesCount,
        seoTitle: seoTitle || jobTitle,
        seoDescription: seoDescription || jobDesc.substring(0, 150),
        seoKeywords: keywords,
        status: jobStatus,
        active: jobStatus === 'Publicada',
        publishedToPortal: jobStatus === 'Publicada',
        prazo: jobPrazo
      } : j);
      onUpdateJobs(updatedJobs);
      triggerToast('✓ Vaga atualizada com sucesso!');
    } else {
      const newJob: Job = {
        id: `JOB-${Date.now()}`,
        title: jobTitle,
        department: jobDept,
        companyName,
        companyLogo,
        bannerUrl: bannerUrl || getDefaultBanner(jobDept),
        workModel: jobModel,
        type: jobType,
        salaryRange: jobSalary,
        location: `${city} - ${stateUF}`,
        city,
        state: stateUF,
        description: jobDesc,
        requirements: reqs,
        responsibilities: resps,
        differentials: diffs,
        benefits: bens,
        workHours,
        vacanciesCount,
        seoTitle: seoTitle || jobTitle,
        seoDescription: seoDescription || jobDesc.substring(0, 150),
        seoKeywords: keywords,
        status: jobStatus,
        active: jobStatus === 'Publicada',
        publishedToPortal: jobStatus === 'Publicada',
        prazo: jobPrazo,
        createdAt: new Date().toISOString().split('T')[0],
        slug,
        analytics: { views: 0, clicks: 0, applications: 0, sources: {} }
      };
      onUpdateJobs([newJob, ...jobs]);
      setSelectedJob(newJob);
      triggerToast('✓ Nova vaga cadastrada com sucesso!');
    }
    setIsNewJobOpen(false);
  };

  // Save manual candidate
  const handleSaveManualCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const selJob = jobs.find(j => j.id === newCandJobId);
    const newCand: Candidate = {
      id: `CAND-${Date.now()}`,
      name: newCandName,
      email: newCandEmail,
      phone: newCandPhone,
      city: newCandCity,
      state: newCandState,
      area: newCandArea,
      experience: newCandExp,
      createdAt: new Date().toISOString().split('T')[0],
      jobId: newCandJobId || undefined,
      jobTitle: selJob ? selJob.title : undefined,
      resumeText: newCandResumeText || `${newCandName} - ${newCandArea}. Experiência em ${newCandExp}.`,
      status: 'Recebidos',
      expectedSalary: newCandSalary,
      salaryExpectation: newCandSalary,
      aiScore: Math.floor(Math.random() * 20) + 78,
      aiAnalysis: `Avaliando percurso profissional de ${newCandName}. Forte aderência à área de ${newCandArea}.`
    };

    onUpdateCandidates([newCand, ...candidates]);
    triggerToast(`✓ Candidato ${newCandName} cadastrado no sistema!`);
    setIsAddCandidateOpen(false);
    setNewCandName('');
    setNewCandEmail('');
    setNewCandPhone('');
    setNewCandResumeText('');
  };

  // Change Candidate Stage
  const handleChangeCandidateStage = (candId: string, newStage: string) => {
    const updated = candidates.map(c => c.id === candId ? { ...c, status: newStage } : c);
    onUpdateCandidates(updated);
    if (drawerCandidate && drawerCandidate.id === candId) {
      setDrawerCandidate(prev => prev ? { ...prev, status: newStage } : null);
    }
    const cand = candidates.find(c => c.id === candId);
    triggerToast(`✓ ${cand?.name || 'Candidato'} movido para "${newStage}".`);
  };

  // Move candidate prev/next stage
  const handleMoveCandidateStage = (candId: string, currentStatus?: string, direction: 'prev' | 'next' = 'next') => {
    const cand = candidates.find(c => c.id === candId);
    if (!cand) return;
    const currentStageId = getCandidateStage(cand, kanbanStages);
    const currentIndex = visibleStages.findIndex(s => s.id === currentStageId);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= visibleStages.length) targetIndex = visibleStages.length - 1;

    const targetStage = visibleStages[targetIndex];
    handleChangeCandidateStage(candId, targetStage.id);
  };

  // Column Management Handlers
  const handleOpenAddColumnModal = (afterStageId: string = 'end') => {
    setEditingStage(null);
    setColumnName('');
    setColumnColorKey('blue');
    setColumnWhenRule('');
    setInsertAfterId(afterStageId);
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumnModal = (stage: KanbanStage) => {
    setEditingStage(stage);
    setColumnName(stage.label);
    const themeKey = Object.keys(COLOR_THEMES).find(k => COLOR_THEMES[k].color === stage.color) || 'blue';
    setColumnColorKey(themeKey);
    setColumnWhenRule(stage.whenRule || '');
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = columnName.trim();
    if (!nameTrim) {
      triggerToast('⚠️ Por favor, informe o nome da coluna.');
      return;
    }

    const theme = COLOR_THEMES[columnColorKey] || COLOR_THEMES.blue;

    if (editingStage) {
      const updated = kanbanStages.map(s => s.id === editingStage.id ? {
        ...s,
        label: nameTrim,
        color: theme.color,
        badge: theme.badge,
        barColor: theme.barColor,
        headerBg: theme.headerBg,
        whenRule: columnWhenRule.trim() || undefined
      } : s);
      saveStages(updated);
      triggerToast(`✓ Coluna "${nameTrim}" atualizada com sucesso!`);
    } else {
      if (kanbanStages.some(s => s.id.toLowerCase() === nameTrim.toLowerCase())) {
        triggerToast(`⚠️ Já existe uma coluna com o nome "${nameTrim}".`);
        return;
      }
      const newStage: KanbanStage = {
        id: nameTrim,
        label: nameTrim,
        color: theme.color,
        badge: theme.badge,
        barColor: theme.barColor,
        headerBg: theme.headerBg,
        whenRule: columnWhenRule.trim() || undefined
      };

      let updatedStages = [...kanbanStages];
      if (insertAfterId && insertAfterId !== 'end') {
        const idx = updatedStages.findIndex(s => s.id === insertAfterId);
        if (idx !== -1) {
          updatedStages.splice(idx + 1, 0, newStage);
        } else {
          updatedStages.push(newStage);
        }
      } else {
        updatedStages.push(newStage);
      }
      saveStages(updatedStages);
      triggerToast(`✓ Nova coluna "${nameTrim}" adicionada ao Kanban!`);
    }

    setIsColumnModalOpen(false);
  };

  const handleInitRemoveColumn = (stage: KanbanStage) => {
    if (kanbanStages.length <= 1) {
      triggerToast('⚠️ O Kanban deve manter pelo menos 1 coluna ativa.');
      return;
    }
    const candidatesInStage = candidates.filter(c => getCandidateStage(c, kanbanStages) === stage.id);
    const otherStages = kanbanStages.filter(s => s.id !== stage.id && !s.hidden);
    setRemoveColumnModal({
      isOpen: true,
      stageToRemove: stage,
      targetStageId: otherStages[0]?.id || 'Recebidos'
    });
  };

  const handleConfirmRemoveColumn = () => {
    if (!removeColumnModal.stageToRemove) return;
    const stageIdToRemove = removeColumnModal.stageToRemove.id;
    const targetId = removeColumnModal.targetStageId;

    let reassignedCount = 0;
    const updatedCandidates = candidates.map(c => {
      if (getCandidateStage(c, kanbanStages) === stageIdToRemove) {
        reassignedCount++;
        return { ...c, status: targetId };
      }
      return c;
    });

    if (reassignedCount > 0) {
      onUpdateCandidates(updatedCandidates);
    }

    const filteredStages = kanbanStages.filter(s => s.id !== stageIdToRemove);
    saveStages(filteredStages);

    const removedName = removeColumnModal.stageToRemove.label;
    setRemoveColumnModal({ isOpen: false, stageToRemove: null, targetStageId: 'Recebidos' });
    triggerToast(`✓ Coluna "${removedName}" removida! ${reassignedCount > 0 ? `${reassignedCount} candidato(s) foram movidos para "${targetId}".` : ''}`);
  };

  const handleMoveStagePos = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= visibleStages.length) return;
    
    const stage1 = visibleStages[index];
    const stage2 = visibleStages[targetIndex];
    const idx1 = kanbanStages.findIndex(s => s.id === stage1.id);
    const idx2 = kanbanStages.findIndex(s => s.id === stage2.id);
    
    if (idx1 !== -1 && idx2 !== -1) {
      const updated = [...kanbanStages];
      const temp = updated[idx1];
      updated[idx1] = updated[idx2];
      updated[idx2] = temp;
      saveStages(updated);
      triggerToast(`✓ Posição da coluna "${stage1.label}" alterada.`);
    }
  };

  const handleToggleStageVisibility = (stageId: string) => {
    const updated = kanbanStages.map(s => s.id === stageId ? { ...s, hidden: !s.hidden } : s);
    saveStages(updated);
    const st = kanbanStages.find(s => s.id === stageId);
    triggerToast(`✓ Coluna "${st?.label}" ${st?.hidden ? 'exibida' : 'ocultada'} no Kanban.`);
  };

  const handleResetStagesToDefault = () => {
    saveStages(DEFAULT_KANBAN_STAGES);
    triggerToast('✓ Colunas restauradas para o padrão oficial do GestRH (10 etapas).');
  };

  // Toggle favorite candidate
  const handleToggleFavorite = (candId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = candidates.map(c => c.id === candId ? { ...c, isFavorite: !c.isFavorite } : c);
    onUpdateCandidates(updated);
    if (drawerCandidate && drawerCandidate.id === candId) {
      setDrawerCandidate(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    const cand = candidates.find(c => c.id === candId);
    triggerToast(`⭐ Status favorito de ${cand?.name} atualizado.`);
  };

  // Save Screening Form
  const handleSaveScreening = () => {
    if (!drawerCandidate) return;
    const updated = candidates.map(c => c.id === drawerCandidate.id ? {
      ...c,
      rating: screeningData.generalRating,
      aiScore: screeningData.iaCompatibility,
      expectedSalary: screeningData.expectedSalary,
      salaryExpectation: screeningData.expectedSalary,
      notes: screeningData.rhComments,
      screening: { ...screeningData }
    } : c);
    onUpdateCandidates(updated);
    setDrawerCandidate(prev => prev ? {
      ...prev,
      rating: screeningData.generalRating,
      aiScore: screeningData.iaCompatibility,
      expectedSalary: screeningData.expectedSalary,
      screening: { ...screeningData }
    } : null);
    triggerToast(`✓ Triagem estruturada de ${drawerCandidate.name} salva com sucesso!`);
  };

  // AI Candidate Screening AI trigger
  const handleAICandidateScreening = async (cand: Candidate) => {
    setIsAnalyzing(cand.id);
    setTimeout(() => {
      const matchScore = Math.floor(Math.random() * 20) + 80;
      const aiAnalysisText = `Análise Inteligente Concluída:\n\n• Compatibilidade Técnica: ${matchScore}%\n• Perfil Comportamental: Alta resiliência, liderança técnica comunicativa e proatividade.\n• Pontos Fortes: Sólida formação, vivência em projetos ágeis de alto impacto.\n• Recomendação IA: Avançar para a próxima etapa do processo seletivo.`;

      const aiInsightsObj = {
        matchScore,
        summary: `Candidato com forte alinhamento cultural e técnico com a vaga. Demonstra senioridade e domínio das competências requeridas.`,
        skillsIdentified: ['Comunicação Assertiva', 'Trabalho em Equipe', 'Gestão de Projetos', 'Resolução de Problemas Complexos'],
        strengths: ['Experiência consolidada no setor', 'Boa pretensão salarial dentro do orçamento', 'Disponibilidade rápida para início'],
        concerns: ['Avaliar conhecimento em inglês técnico na entrevista'],
        interviewQuestions: [
          'Qual foi o maior desafio técnico que você enfrentou recentemente e como o superou?',
          'Como você lida com prioridades conflitantes em momentos de alta demanda?',
          'Quais são suas expectativas de desenvolvimento profissional para os próximos 2 anos?'
        ],
        turnoverRisk: 'Baixo' as const,
        behavioralProfile: 'Executor / Analítico (Perfil de alta entrega)',
        recommendation: 'Aprovar' as const
      };

      const updated = candidates.map(c => c.id === cand.id ? {
        ...c,
        aiScore: matchScore,
        aiAnalysis: aiAnalysisText,
        aiInsights: aiInsightsObj
      } : c);

      onUpdateCandidates(updated);
      if (drawerCandidate && drawerCandidate.id === cand.id) {
        setDrawerCandidate(prev => prev ? {
          ...prev,
          aiScore: matchScore,
          aiAnalysis: aiAnalysisText,
          aiInsights: aiInsightsObj
        } : null);
      }
      setIsAnalyzing(null);
      triggerToast(`🤖 Triagem por IA concluída para ${cand.name}! Match: ${matchScore}%`);
    }, 900);
  };

  // Delete Candidate
  const handleDeleteCandidate = (candId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remover Candidato',
      message: 'Tem certeza que deseja remover este candidato da lista?',
      confirmText: 'Sim, Remover',
      isDanger: true,
      onConfirm: () => {
        const updated = candidates.filter(c => c.id !== candId);
        onUpdateCandidates(updated);
        if (drawerCandidate?.id === candId) {
          setDrawerCandidate(null);
        }
        triggerToast('✓ Candidato removido.');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Text Search across Name, Phone, Email, Cargo, City, CPF
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchName = c.name.toLowerCase().includes(query);
        const matchEmail = c.email.toLowerCase().includes(query);
        const matchPhone = c.phone.toLowerCase().includes(query);
        const matchCity = c.city.toLowerCase().includes(query);
        const matchCargo = (c.jobTitle || c.area || '').toLowerCase().includes(query);
        const matchCPF = (c.cpf || '').toLowerCase().includes(query);
        const matchPrev = (c.previousCompany || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchPhone && !matchCity && !matchCargo && !matchCPF && !matchPrev) {
          return false;
        }
      }

      // Filter Job
      if (filterJobId !== 'Todas') {
        if (c.jobId !== filterJobId) {
          const targetJob = jobs.find(j => j.id === filterJobId);
          if (!targetJob) return false;
          const matchArea = c.area === targetJob.department;
          if (!matchArea) return false;
        }
      }

      // Filter City
      if (filterCity !== 'Todas' && c.city !== filterCity) return false;

      // Filter Exp
      if (filterExp !== 'Todas' && !c.experience.toLowerCase().includes(filterExp.toLowerCase())) return false;

      // Filter WorkModel
      if (filterWorkModel !== 'Todos' && c.workModel && c.workModel !== filterWorkModel) return false;

      // Filter Match IA
      if (filterMatchIA !== 'Todos') {
        const score = c.aiScore || 0;
        if (filterMatchIA === '> 80%' && score < 80) return false;
        if (filterMatchIA === '> 60%' && score < 60) return false;
        if (filterMatchIA === '> 40%' && score < 40) return false;
      }

      // Filter Favorites
      if (filterOnlyFavorites && !c.isFavorite) return false;

      return true;
    });
  }, [
    candidates,
    searchQuery,
    filterJobId,
    filterCity,
    filterExp,
    filterWorkModel,
    filterMatchIA,
    filterOnlyFavorites,
    jobs
  ]);

  // Dashboard Indicators calculations
  const totalReceived = candidates.length;
  const awaitingTriage = candidates.filter(c => {
    const st = getCandidateStage(c);
    return st === 'Recebidos' || st === 'Triagem IA';
  }).length;
  const inProcess = candidates.filter(c => {
    const st = getCandidateStage(c);
    return st === 'Triagem RH' || st === 'Entrevista RH' || st === 'Entrevista Técnica' || st === 'Teste';
  }).length;
  const scheduledInterviews = candidates.filter(c => {
    const st = getCandidateStage(c);
    return st === 'Entrevista RH' || st === 'Entrevista Técnica';
  }).length;
  const proposalsSent = candidates.filter(c => getCandidateStage(c) === 'Proposta').length;
  const hiresCount = candidates.filter(c => getCandidateStage(c) === 'Contratação').length;
  const avgHiringDays = '14 dias';
  const aiAnalyzedCount = candidates.filter(c => c.aiScore !== undefined || c.aiAnalysis).length;

  // City options for filter
  const cityOptions = useMemo(() => {
    const setCities = new Set<string>();
    candidates.forEach(c => { if (c.city) setCities.add(c.city); });
    return Array.from(setCities);
  }, [candidates]);

  // Renders Public Job Page preview
  if (viewingPublicJob) {
    return (
      <PublicJobPage
        job={viewingPublicJob}
        onBack={() => setViewingPublicJob(null)}
        onCandidateSubmit={(candData) => {
          const newCand: Candidate = {
            id: `CAND-${Date.now()}`,
            name: candData.name,
            email: candData.email,
            phone: candData.phone,
            city: candData.city,
            state: candData.state,
            area: viewingPublicJob.department,
            experience: candData.experience || 'Pleno (3-5 anos)',
            createdAt: new Date().toISOString().split('T')[0],
            jobId: viewingPublicJob.id,
            jobTitle: viewingPublicJob.title,
            resumeText: candData.resumeText,
            status: 'Recebidos',
            aiScore: Math.floor(Math.random() * 20) + 78,
            aiAnalysis: `Candidatura direta pública via GestRH Portal. Perfil compatível com a vaga ${viewingPublicJob.title}.`
          };
          onUpdateCandidates([newCand, ...candidates]);
          triggerToast(`🎉 Candidatura de ${candData.name} enviada com sucesso!`);
        }}
      />
    );
  }

  // Sub-Navigation Pills Component
  const renderSubNavPills = () => (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
      <button
        onClick={() => { setShowSmartInterviewModule(false); setSubTab('vagas'); }}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
          subTab === 'vagas' && !showSmartInterviewModule
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Briefcase className="h-4 w-4" />
        <span>Vagas de Emprego ({jobs.length})</span>
      </button>

      <button
        onClick={() => { setShowSmartInterviewModule(false); setSubTab('triagem'); }}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
          subTab === 'triagem' && !showSmartInterviewModule
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Triagem & Pipeline ({candidates.length})</span>
      </button>

      <button
        onClick={() => setSubTab('entrevistas')}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
          subTab === 'entrevistas' || showSmartInterviewModule
            ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Sparkles className="h-4 w-4 text-amber-950" />
        <span>Entrevista Inteligente (IA)</span>
        <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
          NOVO
        </span>
      </button>
    </div>
  );

  // If SmartInterview / GestRH Meeting room or entrevistas subTab is active
  if (showSmartInterviewModule || subTab === 'entrevistas') {
    return (
      <div className="space-y-6 animate-in fade-in pb-12">
        {renderSubNavPills()}

        <SmartInterviewModule
          jobs={jobs}
          candidates={candidates}
          onBackToSystem={() => {
            setShowSmartInterviewModule(false);
            setSubTab('triagem');
            setMeetingCandidate(null);
          }}
        />
      </div>
    );
  }

  // If VAGAS subTab is active (Dedicated Vagas Page)
  if (subTab === 'vagas') {
    const filteredJobs = jobs.filter(j => {
      const matchSearch = !jobSearchQuery || 
        j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) || 
        j.department.toLowerCase().includes(jobSearchQuery.toLowerCase()) || 
        j.location.toLowerCase().includes(jobSearchQuery.toLowerCase());
      
      const matchDept = jobDepartmentFilter === 'Todos' || j.department === jobDepartmentFilter;
      
      const isActive = j.status === 'Publicada' || j.active;
      const matchStatus = jobStatusFilter === 'Todas' || 
        (jobStatusFilter === 'Ativas' && isActive) || 
        (jobStatusFilter === 'Encerradas' && !isActive);

      return matchSearch && matchDept && matchStatus;
    });

    const activeJobsCount = jobs.filter(j => j.status === 'Publicada' || j.active).length;
    const closedJobsCount = jobs.length - activeJobsCount;

    return (
      <div className="space-y-6 animate-in fade-in pb-12">
        {renderSubNavPills()}

        {/* Header Vagas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Gestão de Oportunidades
              </span>
              <span className="text-slate-400 text-xs font-semibold">&bull; {jobs.length} Vagas Cadastradas</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
              Vagas de Emprego
            </h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium max-w-2xl">
              Página exclusiva para criar, editar, ativar, pausar e acompanhar o engajamento e métricas de cada vaga aberta no Portal de Carreiras.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={openAddModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Vaga</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total de Vagas</span>
            <p className="text-2xl font-black text-slate-900">{jobs.length}</p>
            <span className="text-[10px] text-slate-400">Oportunidades no sistema</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Vagas Ativas</span>
            <p className="text-2xl font-black text-emerald-600">{activeJobsCount}</p>
            <span className="text-[10px] text-slate-400">Publicadas no Portal</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase">Vagas Encerradas</span>
            <p className="text-2xl font-black text-rose-600">{closedJobsCount}</p>
            <span className="text-[10px] text-slate-400">Pausadas ou preenchidas</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase">Total de Candidatos</span>
            <p className="text-2xl font-black text-blue-600">{candidates.length}</p>
            <span className="text-[10px] text-slate-400">Inscritos nas vagas</span>
          </div>
        </div>

        {/* Filter & Search Bar for Jobs */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cargo, departamento ou cidade..."
              value={jobSearchQuery}
              onChange={e => setJobSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <select
              value={jobDepartmentFilter}
              onChange={e => setJobDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todos">Todos os Departamentos</option>
              {Array.from(new Set(jobs.map(j => j.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={jobStatusFilter}
              onChange={e => setJobStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todas">Todos os Status</option>
              <option value="Ativas">Apenas Ativas / Publicadas</option>
              <option value="Encerradas">Apenas Encerradas / Rascunhos</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Briefcase className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Nenhuma vaga encontrada</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tente ajustar os filtros ou clique no botão acima para criar uma nova vaga de emprego.
              </p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const jobCandCount = candidates.filter(c => c.jobId === job.id || (
                !c.jobId && (c.area === job.department || (job.department === 'TI' && c.area === 'TI'))
              )).length;

              const jobInterviewsCount = candidates.filter(c => {
                const isJobMatch = c.jobId === job.id || (!c.jobId && c.area === job.department);
                const st = getCandidateStage(c);
                return isJobMatch && (st === 'Entrevista RH' || st === 'Entrevista Técnica');
              }).length;

              return (
                <div
                  key={job.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-500 transition-all space-y-4 shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {job.department}
                      </span>

                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        job.status === 'Publicada' || job.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {job.status || (job.active ? 'Publicada' : 'Encerrada')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{job.title}</h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{job.location} &bull; {job.workModel}</span>
                      </p>
                      {job.salaryRange && (
                        <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center space-x-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{job.salaryRange}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-700 pt-1">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-bold flex items-center space-x-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{jobCandCount} inscritos</span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-bold flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        <span>{jobInterviewsCount} entrevistas</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setFilterJobId(job.id);
                        setSubTab('triagem');
                        triggerToast(`Abrindo Triagem e Pipeline para "${job.title}"`);
                      }}
                      className="w-full bg-slate-900 hover:bg-emerald-600 text-amber-400 hover:text-white font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Abrir Triagem & Pipeline (Kanban)</span>
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-all"
                          title="Editar Vaga"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShareModalJob(job)}
                          className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-all"
                          title="Compartilhar Link do Portal"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAnalyticsModalJob(job)}
                          className="p-2 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded-lg transition-all"
                          title="Ver Indicadores da Vaga"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewingPublicJob(job)}
                          className="p-2 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-all"
                          title="Pré-visualizar no Portal"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const isCurrentlyActive = job.active || job.status === 'Publicada';
                          const updated = jobs.map(j => j.id === job.id ? {
                            ...j,
                            active: !isCurrentlyActive,
                            status: isCurrentlyActive ? 'Encerrada' : 'Publicada'
                          } : j);
                          onUpdateJobs(updated);
                          triggerToast(`Status da vaga "${job.title}" alterado.`);
                        }}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          job.active || job.status === 'Publicada'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {job.active || job.status === 'Publicada' ? 'Pausar Vaga' : 'Ativar Vaga'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">

      {renderSubNavPills()}

      {/* ========================================================================= */}
      {/* 1. TOPO DA PÁGINA (HEADER LIMPO & PROFISSIONAL) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Módulo ATS GestRH
            </span>
            <span className="text-slate-400 text-xs font-semibold">&bull; Inteligência Artificial Ativa</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Recrutamento e Seleção
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium max-w-2xl">
            Gerencie vagas, candidatos, entrevistas e contratações em um único lugar utilizando Inteligência Artificial.
          </p>
        </div>

        {/* Action Buttons Right Side */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Vaga</span>
          </button>

          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl border border-slate-300 shadow-xs transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <User className="h-4 w-4 text-slate-600" />
            <span>Cadastrar Candidato</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CARDS DE INDICADORES (DASHBOARD METRICS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Metric 1 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Recebidos</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalReceived}</p>
          <span className="text-[10px] text-slate-400 block truncate">Total de inscritos</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider truncate">Aguard. Triagem</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-600">{awaitingTriage}</p>
          <span className="text-[10px] text-slate-400 block truncate">Pendentes de análise</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider truncate">Em Processo</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-blue-600">{inProcess}</p>
          <span className="text-[10px] text-slate-400 block truncate">Etapas ativas</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider truncate">Entrevistas</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-purple-600">{scheduledInterviews}</p>
          <span className="text-[10px] text-slate-400 block truncate">RH e Técnica</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider truncate">Propostas</span>
            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-teal-600">{proposalsSent}</p>
          <span className="text-[10px] text-slate-400 block truncate">Ofertas em negociação</span>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate">Contratações</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-600">{hiresCount}</p>
          <span className="text-[10px] text-slate-400 block truncate">Admissões concluídas</span>
        </div>

        {/* Metric 7 */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">Tempo Médio</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-800">{avgHiringDays}</p>
          <span className="text-[10px] text-slate-400 block truncate">Média de fechamento</span>
        </div>

        {/* Metric 8 */}
        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-white shadow-md hover:shadow-xl transition-all space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider truncate">Analises IA</span>
            <div className="p-1.5 bg-amber-400/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-400">{aiAnalyzedCount}</p>
          <span className="text-[10px] text-slate-300 block truncate">Triados com IA</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA DE FILTROS RÁPIDOS & BUSCA AVANÇADA */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        
        {/* Top Search Input & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Advanced Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone, e-mail, cargo, cidade, CPF ou empresa anterior..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setFilterOnlyFavorites(!filterOnlyFavorites)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-1.5 cursor-pointer ${
                filterOnlyFavorites
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Star className={`h-4 w-4 ${filterOnlyFavorites ? 'fill-slate-950' : 'text-amber-500'}`} />
              <span>Favoritos</span>
            </button>

            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center space-x-1">
              <button
                onClick={() => setKanbanViewMode('board')}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  kanbanViewMode === 'board' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização Normal"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setKanbanViewMode('compact')}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  kanbanViewMode === 'compact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização Compacta"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Job Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Vaga / Cargo</label>
            <select
              value={filterJobId}
              onChange={e => setFilterJobId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todas">Todas as Vagas</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Cidade</label>
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todas">Todas as Cidades</option>
              {cityOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Work Model */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Modelo de Trabalho</label>
            <select
              value={filterWorkModel}
              onChange={e => setFilterWorkModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todos">Todos os Modelos</option>
              <option value="Presencial">Presencial</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Nível de Experiência</label>
            <select
              value={filterExp}
              onChange={e => setFilterExp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todas">Todos os Níveis</option>
              <option value="Júnior">Júnior</option>
              <option value="Pleno">Pleno</option>
              <option value="Sênior">Sênior</option>
              <option value="Especialista">Especialista / Gestão</option>
            </select>
          </div>

          {/* Match IA */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Compatibilidade IA</label>
            <select
              value={filterMatchIA}
              onChange={e => setFilterMatchIA(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="Todos">Qualquer Match</option>
              <option value="> 80%">Alto Match (&gt; 80%)</option>
              <option value="> 60%">Médio Match (&gt; 60%)</option>
              <option value="> 40%">Abaixo 60%</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterJobId('Todas');
                setFilterCity('Todas');
                setFilterExp('Todas');
                setFilterWorkModel('Todos');
                setFilterMatchIA('Todos');
                setFilterOnlyFavorites(false);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpar Filtros</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. PIPELINE KANBAN DO PROCESSO SELETIVO */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Pipeline Board Header & Batch AI Screening Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-3xl shadow-md border border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                Kanban ATS GestRH
              </span>
              <span className="text-xs text-slate-300">Arraste cards entre as colunas ou gerencie as etapas</span>
            </div>
            <h2 className="font-display font-black text-lg text-white">Pipeline de Candidatos</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold text-amber-400 mr-1">
              {filteredCandidates.length} candidatos
            </span>

            <button
              onClick={() => handleOpenAddColumnModal('end')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs px-3 py-2 rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Adicionar nova coluna ao Kanban"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Coluna</span>
            </button>

            <button
              onClick={() => setIsManageColumnsOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Gerenciar colunas do Kanban"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-300" />
              <span>Gerenciar Colunas</span>
            </button>

            <button
              onClick={() => {
                const unanalyzed = filteredCandidates.filter(c => c.aiScore === undefined);
                if (unanalyzed.length === 0) {
                  triggerToast('Todos os candidatos exibidos já passaram pela triagem da IA!');
                  return;
                }
                triggerToast(`Iniciando triagem em lote para ${unanalyzed.length} candidatos...`);
                unanalyzed.forEach((c, idx) => {
                  setTimeout(() => handleAICandidateScreening(c), idx * 500);
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Triagem IA em Lote</span>
            </button>
          </div>
        </div>

        {/* Dynamic Columns Horizontal Scroll Board */}
        <div className="flex gap-3 overflow-x-auto pb-6 pt-1 items-start scrollbar-thin">
          {visibleStages.map((stage, stageIdx) => {
            const stageCandidates = filteredCandidates.filter(c => getCandidateStage(c, kanbanStages) === stage.id);
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={() => setDragOverStage(stage.id)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={e => {
                  e.preventDefault();
                  const candId = e.dataTransfer.getData('text/plain');
                  if (candId) {
                    handleChangeCandidateStage(candId, stage.id);
                  }
                  setDragOverStage(null);
                  setDraggedCandidateId(null);
                }}
                className={`rounded-2xl border ${stage.color} p-2.5 flex flex-col min-h-[580px] w-[260px] shrink-0 transition-all duration-200 shadow-2xs ${
                  isOver ? 'ring-2 ring-emerald-600 bg-emerald-100/60 scale-[1.01] shadow-lg border-emerald-400' : ''
                }`}
              >
                {/* Stage Header */}
                <div className="pb-2 mb-2.5 border-b border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${stage.barColor}`} />
                      <h3 className="font-extrabold text-[11px] tracking-tight uppercase text-slate-900 truncate" title={stage.label}>
                        {stage.label}
                      </h3>
                      {stage.whenRule && (
                        <div className="relative group/rule">
                          <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-amber-600 cursor-pointer shrink-0" />
                          <div className="absolute left-0 top-full mt-1 hidden group-hover/rule:block z-40 w-56 p-2.5 bg-slate-900 text-white text-[10px] rounded-2xl shadow-xl border border-slate-700 leading-snug">
                            <p className="font-bold text-amber-400 mb-1 flex items-center space-x-1">
                              <span>💡 Quando utilizar esta etapa:</span>
                            </p>
                            <p className="text-slate-200 font-medium">{stage.whenRule}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md font-mono ${stage.badge}`}>
                        {stageCandidates.length}
                      </span>

                      {/* Stage Menu Options Dropdown */}
                      <div className="relative group/stagemenu">
                        <button
                          className="p-1 hover:bg-slate-200/80 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Opções da coluna"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        <div className="absolute right-0 top-full mt-1 hidden group-hover/stagemenu:block z-40 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 text-xs space-y-0.5 animate-in fade-in">
                          <button
                            onClick={() => handleOpenEditColumnModal(stage)}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-bold text-slate-700 flex items-center space-x-2 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-600" />
                            <span>Editar Coluna</span>
                          </button>

                          {stageIdx > 0 && (
                            <button
                              onClick={() => handleMoveStagePos(stageIdx, 'left')}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-medium text-slate-700 flex items-center space-x-2 cursor-pointer"
                            >
                              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
                              <span>Mover para Esquerda</span>
                            </button>
                          )}

                          {stageIdx < visibleStages.length - 1 && (
                            <button
                              onClick={() => handleMoveStagePos(stageIdx, 'right')}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-medium text-slate-700 flex items-center space-x-2 cursor-pointer"
                            >
                              <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                              <span>Mover para Direita</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenAddColumnModal(stage.id)}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-medium text-slate-700 flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Inserir Coluna Após</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            onClick={() => handleInitRemoveColumn(stage)}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-xl font-bold text-rose-600 flex items-center space-x-2 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            <span>Remover Coluna</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500">
                    <span>
                      {candidates.length > 0 
                        ? `${((stageCandidates.length / candidates.length) * 100).toFixed(0)}% do total`
                        : '0%'}
                    </span>

                    <button
                      onClick={() => setIsAddCandidateOpen(true)}
                      className="hover:text-emerald-700 font-bold flex items-center space-x-0.5 cursor-pointer"
                      title="Adicionar candidato nesta coluna"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Cadastrar</span>
                    </button>
                  </div>
                </div>

                {/* Candidate Cards Column Area */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-0.5 scrollbar-none">
                  {stageCandidates.length === 0 ? (
                    <div className={`text-center py-10 px-2 text-[10px] text-slate-400 border-2 border-dashed rounded-xl transition-all ${
                      isOver ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200/80 bg-white/40'
                    }`}>
                      {isOver ? 'Solte aqui!' : 'Nenhum candidato'}
                    </div>
                  ) : (
                    stageCandidates.map(c => {
                      const phoneClean = c.phone ? c.phone.replace(/\D/g, '') : '';
                      const waUrl = phoneClean ? `https://wa.me/55${phoneClean}` : null;
                      const isBeingDragged = draggedCandidateId === c.id;

                      return (
                        <div
                          key={c.id}
                          draggable={true}
                          onDragStart={e => {
                            e.dataTransfer.setData('text/plain', c.id);
                            setDraggedCandidateId(c.id);
                          }}
                          onDragEnd={() => setDraggedCandidateId(null)}
                          onClick={() => handleOpenCandidateDrawer(c)}
                          className={`bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all space-y-2 cursor-pointer group active:cursor-grabbing ${
                            isBeingDragged ? 'opacity-40 scale-95 border-emerald-600 shadow-xl ring-2 ring-emerald-500' : ''
                          } ${kanbanViewMode === 'compact' ? 'p-2 space-y-1' : ''}`}
                        >
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center space-x-2 min-w-0">
                              <GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />

                              <div className="h-7 w-7 bg-slate-900 text-amber-400 font-black rounded-xl flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                {c.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-extrabold text-xs text-slate-900 leading-snug truncate group-hover:text-emerald-700">
                                  {c.name}
                                </h4>
                                <span className="text-[10px] text-slate-500 block truncate font-medium">
                                  {c.city} - {c.state}
                                </span>
                              </div>
                            </div>

                            {/* Favorite Star */}
                            <button
                              onClick={(e) => handleToggleFavorite(c.id, e)}
                              className="p-1 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer"
                              title="Favoritar"
                            >
                              <Star className={`h-3.5 w-3.5 ${c.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                            </button>
                          </div>

                          {/* Job & Salary Badge */}
                          <div className="bg-slate-50 text-slate-800 font-bold text-[10px] px-2 py-1 rounded-xl truncate flex items-center justify-between border border-slate-100">
                            <span className="truncate">💼 {c.jobTitle || c.area || 'Geral'}</span>
                            {c.aiScore !== undefined && (
                              <span className="bg-amber-100 text-amber-900 font-extrabold text-[9px] px-1.5 py-0.2 rounded-md flex items-center space-x-0.5 shrink-0">
                                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                <span>{c.aiScore}%</span>
                              </span>
                            )}
                          </div>

                          {/* Card Actions & Direct Links */}
                          {kanbanViewMode !== 'compact' && (
                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                              <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                                {waUrl && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="WhatsApp Direct"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </a>
                                )}
                                <a
                                  href={`mailto:${c.email}`}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Enviar E-mail"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </a>
                                <a
                                  href={`tel:${c.phone}`}
                                  className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Ligar para candidato"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMeetingCandidate(c);
                                  setShowSmartInterviewModule(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] px-2 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                                title="Entrar na Entrevista (GestRH Meeting)"
                              >
                                <Video className="h-3 w-3" />
                                <span>Entrevista</span>
                              </button>
                            </div>
                          )}

                          {/* Stage Stepper Dropdown */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleMoveCandidateStage(c.id, c.status, 'prev')}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
                              title="Etapa anterior"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>

                            <select
                              value={getCandidateStage(c, kanbanStages)}
                              onChange={e => handleChangeCandidateStage(c.id, e.target.value)}
                              className="text-[9px] bg-slate-50 border border-slate-200 rounded-lg px-1 py-0.5 font-extrabold text-slate-800 focus:outline-none"
                            >
                              {visibleStages.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleMoveCandidateStage(c.id, c.status, 'next')}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
                              title="Próxima etapa"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}

          {/* End Shortcut Card - Add Column */}
          <button
            onClick={() => handleOpenAddColumnModal('end')}
            className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 p-4 flex flex-col items-center justify-center min-h-[580px] w-[200px] shrink-0 transition-all duration-200 group cursor-pointer text-slate-500 hover:text-emerald-700 space-y-2"
          >
            <div className="p-3 bg-white group-hover:bg-emerald-600 group-hover:text-white rounded-2xl border border-slate-200 shadow-2xs transition-all group-hover:scale-110">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-xs">Nova Coluna</span>
            <span className="text-[10px] text-slate-400 text-center max-w-[140px]">
              Adicionar etapa personalizada ao fluxo de seleção
            </span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. SEÇÃO DE VAGAS (TODAS AS VAGAS NO FINAL DA PÁGINA) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-900 flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <span>Vagas de Emprego em Aberto</span>
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhe o desempenho e clique para filtrar o Pipeline Kanban especificamente para cada vaga.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nova Vaga</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => {
            const jobCandCount = candidates.filter(c => c.jobId === job.id || (
              !c.jobId && (c.area === job.department || (job.department === 'TI' && c.area === 'TI'))
            )).length;

            const jobInterviewsCount = candidates.filter(c => {
              const isJobMatch = c.jobId === job.id || (!c.jobId && c.area === job.department);
              const st = getCandidateStage(c);
              return isJobMatch && (st === 'Entrevista RH' || st === 'Entrevista Técnica');
            }).length;

            return (
              <div
                key={job.id}
                className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all space-y-3 shadow-2xs hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                      {job.department}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-1">{job.title}</h3>
                    <p className="text-xs text-slate-500">{job.location} &bull; {job.workModel}</p>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    job.status === 'Publicada' || job.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {job.status || (job.active ? 'Publicada' : 'Encerrada')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-700 pt-1">
                  <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-bold flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{jobCandCount} inscritos</span>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-bold flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    <span>{jobInterviewsCount} entrevistas</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setFilterJobId(job.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                      triggerToast(`Pipeline filtrado para a vaga "${job.title}"`);
                    }}
                    className="bg-slate-900 hover:bg-emerald-600 text-amber-400 hover:text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Abrir no Pipeline</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                      title="Editar Vaga"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewingPublicJob(job)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-blue-600 transition-colors"
                      title="Ver Página Pública"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. PAINEL LATERAL COMPLETO DO CANDIDATO (DRAWER LATERAL) */}
      {/* ========================================================================= */}
      {drawerCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerCandidate(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              
              {/* Drawer Top Header */}
              <div className="bg-slate-900 text-white p-5 flex items-start justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-start space-x-3.5">
                  <div className="h-12 w-12 bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-md">
                    {drawerCandidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-display font-extrabold text-lg text-white">{drawerCandidate.name}</h3>
                      <button
                        onClick={(e) => handleToggleFavorite(drawerCandidate.id, e)}
                        className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Star className={`h-4 w-4 ${drawerCandidate.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300">
                      💼 {drawerCandidate.jobTitle || drawerCandidate.area} &bull; {drawerCandidate.city} - {drawerCandidate.state}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Cadastrado em {drawerCandidate.createdAt} &bull; Salário esperado: {drawerCandidate.salaryExpectation || drawerCandidate.expectedSalary || 'R$ 8.000,00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={getCandidateStage(drawerCandidate)}
                    onChange={e => handleChangeCandidateStage(drawerCandidate.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    {KANBAN_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setDrawerCandidate(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Navigation Tabs Bar */}
              <div className="flex items-center space-x-1 bg-slate-100 p-2 overflow-x-auto border-b border-slate-200 shrink-0 text-xs scrollbar-none">
                <button
                  onClick={() => setDrawerTab('resumo')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'resumo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Resumo
                </button>
                <button
                  onClick={() => setDrawerTab('triagem')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'triagem' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Triagem RH
                </button>
                <button
                  onClick={() => setDrawerTab('acoes')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'acoes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ações Rápidas
                </button>
                <button
                  onClick={() => setDrawerTab('ia')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1 ${
                    drawerTab === 'ia' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Avaliação IA</span>
                </button>
                <button
                  onClick={() => setDrawerTab('curriculo')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'curriculo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Currículo
                </button>
                <button
                  onClick={() => setDrawerTab('portfolio')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'portfolio' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portfólio / Vídeo
                </button>
                <button
                  onClick={() => setDrawerTab('experiencias')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'experiencias' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Competências
                </button>
                <button
                  onClick={() => setDrawerTab('entrevistas')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'entrevistas' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entrevistas 🎥
                </button>
                <button
                  onClick={() => setDrawerTab('anotacoes')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                    drawerTab === 'anotacoes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Anotações
                </button>
              </div>

              {/* Drawer Main Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-800">

                {/* TAB: RESUMO DO CANDIDATO */}
                {drawerTab === 'resumo' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Contact Channels Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-xs uppercase text-slate-700 tracking-wider">Canais de Contato Direto</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {drawerCandidate.phone && (
                          <a
                            href={`https://wa.me/55${drawerCandidate.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <a
                          href={`mailto:${drawerCandidate.email}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Mail className="h-4 w-4" />
                          <span>E-mail</span>
                        </a>

                        <a
                          href={`tel:${drawerCandidate.phone}`}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold p-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Telefone</span>
                        </a>
                      </div>
                    </div>

                    {/* Quick Bio Info */}
                    <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">E-mail</span>
                        <span className="font-bold text-slate-900">{drawerCandidate.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Telefone</span>
                        <span className="font-bold text-slate-900">{drawerCandidate.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Cidade / UF</span>
                        <span className="font-bold text-slate-900">{drawerCandidate.city} - {drawerCandidate.state}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Experiência</span>
                        <span className="font-bold text-slate-900">{drawerCandidate.experience}</span>
                      </div>
                    </div>

                    {/* Quick Action Button to Enter Meeting */}
                    <div className="bg-gradient-to-r from-slate-900 to-purple-950 p-4 rounded-2xl text-white flex items-center justify-between">
                      <div>
                        <span className="text-amber-400 text-[10px] font-extrabold uppercase block">GestRH Meeting Integração</span>
                        <h4 className="font-extrabold text-sm text-white">Pronto para entrevistar este candidato?</h4>
                      </div>
                      <button
                        onClick={() => {
                          setMeetingCandidate(drawerCandidate);
                          setShowSmartInterviewModule(true);
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                      >
                        <Video className="h-4 w-4" />
                        <span>Entrar na Entrevista</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB: TRIAGEM DO CANDIDATO (ESTRUTURADA) */}
                {drawerTab === 'triagem' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-1">
                      <h4 className="font-extrabold text-xs text-emerald-900 uppercase">Formulário Oficial de Triagem RH</h4>
                      <p className="text-[11px] text-emerald-800">Preencha a avaliação criteriosa do candidato antes de avançar de etapa.</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                      
                      {/* Rating & Compatibility */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Avaliação Geral (1 a 5 Estrelas)</label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setScreeningData(prev => ({ ...prev, generalRating: star }))}
                                className="p-1 text-amber-500 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star className={`h-6 w-6 ${star <= screeningData.generalRating ? 'fill-amber-500' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Compatibilidade IA (0 - 100%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={screeningData.iaCompatibility}
                            onChange={e => setScreeningData(prev => ({ ...prev, iaCompatibility: Number(e.target.value) }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Dropdown Criteria */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Nível de Experiência</label>
                          <select
                            value={screeningData.experienceLevel}
                            onChange={e => setScreeningData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="Excelente">Excelente</option>
                            <option value="Boa">Boa</option>
                            <option value="Regular">Regular</option>
                            <option value="Baixa">Baixa</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Escolaridade / Formação</label>
                          <select
                            value={screeningData.educationLevel}
                            onChange={e => setScreeningData(prev => ({ ...prev, educationLevel: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="Compatível">Compatível</option>
                            <option value="Parcial">Parcial</option>
                            <option value="Não Compatível">Não Compatível</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Conhecimento Técnico</label>
                          <select
                            value={screeningData.techKnowledge}
                            onChange={e => setScreeningData(prev => ({ ...prev, techKnowledge: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="Excelente">Excelente</option>
                            <option value="Bom">Bom</option>
                            <option value="Regular">Regular</option>
                            <option value="Baixo">Baixo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Comunicação & Postura</label>
                          <select
                            value={screeningData.communicationLevel}
                            onChange={e => setScreeningData(prev => ({ ...prev, communicationLevel: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="Excelente">Excelente</option>
                            <option value="Boa">Boa</option>
                            <option value="Regular">Regular</option>
                            <option value="Ruim">Ruim</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Disponibilidade de Início</label>
                          <select
                            value={screeningData.availability}
                            onChange={e => setScreeningData(prev => ({ ...prev, availability: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                          >
                            <option value="Imediata">Imediata</option>
                            <option value="15 dias">15 dias</option>
                            <option value="30 dias">30 dias</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">Pretensão Salarial</label>
                          <input
                            type="text"
                            value={screeningData.expectedSalary}
                            onChange={e => setScreeningData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 mb-1">Comentários do Recrutador RH</label>
                        <textarea
                          rows={3}
                          value={screeningData.rhComments}
                          onChange={e => setScreeningData(prev => ({ ...prev, rhComments: e.target.value }))}
                          placeholder="Análise de perfil, pontos positivos e impressões da entrevista prévia..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 mb-1">Anotações Privadas (Invisível ao candidato)</label>
                        <textarea
                          rows={2}
                          value={screeningData.privateNotes}
                          onChange={e => setScreeningData(prev => ({ ...prev, privateNotes: e.target.value }))}
                          placeholder="Observações de negociação ou restrições internas..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                        />
                      </div>

                      <button
                        onClick={handleSaveScreening}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all cursor-pointer text-xs"
                      >
                        Salvar Triagem Estruturada
                      </button>

                    </div>
                  </div>
                )}

                {/* TAB: AÇÕES RÁPIDAS */}
                {drawerTab === 'acoes' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h4 className="font-extrabold text-xs uppercase text-slate-700 tracking-wider">Ações Rápidas do Processo Seletivo</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Triagem RH')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Mover p/ Triagem RH</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Entrevista RH')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Mover p/ Entrevista RH</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Entrevista Técnica')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Mover p/ Entrevista Técnica</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Teste')}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Enviar Teste Prático</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setMeetingCandidate(drawerCandidate);
                          setShowSmartInterviewModule(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Agendar / Entrar na Entrevista</span>
                        <Video className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Proposta')}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Enviar Proposta / Oferta</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Contratação')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black p-3 rounded-2xl flex items-center justify-between cursor-pointer shadow-md"
                      >
                        <span>Aprovar & Contratar</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Banco de Talentos')}
                        className="bg-purple-800 hover:bg-purple-900 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      >
                        <span>Guardar no Banco de Talentos</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleChangeCandidateStage(drawerCandidate.id, 'Reprovados')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold p-3 rounded-2xl flex items-center justify-between cursor-pointer col-span-1 sm:col-span-2"
                      >
                        <span>Reprovar Candidato</span>
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: PAINEL DE IA */}
                {drawerTab === 'ia' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                        <h4 className="font-extrabold text-sm text-white">Análise Preditiva de IA</h4>
                      </div>

                      <button
                        onClick={() => handleAICandidateScreening(drawerCandidate)}
                        disabled={isAnalyzing === drawerCandidate.id}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        {isAnalyzing === drawerCandidate.id ? 'Analisando...' : 'Re-Analisar com IA'}
                      </button>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-amber-950">Pontuação de Compatibilidade</span>
                        <span className="text-xl font-black text-amber-600">{drawerCandidate.aiScore || 88}% Match</span>
                      </div>

                      <p className="text-xs text-amber-900 leading-relaxed bg-white p-3 rounded-xl border border-amber-100">
                        {drawerCandidate.aiAnalysis || drawerCandidate.aiInsights?.summary || 'Candidato com forte aderência técnica às demandas da posição. Excelente comunicação e trajetória profissional contínua.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                        <span className="font-extrabold text-emerald-900 text-[10px] uppercase block mb-1">Pontos Fortes</span>
                        <ul className="list-disc list-inside text-emerald-800 text-[11px] space-y-1 font-medium">
                          <li>Sólida bagagem técnica</li>
                          <li>Pretensão alinhada à vaga</li>
                          <li>Boa comunicação interpessoal</li>
                        </ul>
                      </div>

                      <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                        <span className="font-extrabold text-rose-900 text-[10px] uppercase block mb-1">Pontos de Atenção</span>
                        <ul className="list-disc list-inside text-rose-800 text-[11px] space-y-1 font-medium">
                          <li>Aprofundar testes de inglês</li>
                          <li>Verificar disponibilidade de viagens</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-extrabold text-xs uppercase text-slate-700">Sugestão de Perguntas p/ Entrevista (IA)</span>
                      <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 font-medium">
                        <li>Conte sobre um projeto desafiador que você liderou e como lidou com prazos curtos.</li>
                        <li>Como você lida com divergências técnicas com outros membros da equipe?</li>
                        <li>Qual o seu principal objetivo de aprendizado para os próximos 12 meses?</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* TAB: CURRÍCULO */}
                {drawerTab === 'curriculo' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs uppercase text-slate-700">Currículo Formatado</h4>
                      <button
                        onClick={() => alert('Download do currículo em formato PDF/DOCX')}
                        className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Baixar PDF
                      </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-sans leading-relaxed whitespace-pre-line text-xs text-slate-800">
                      {drawerCandidate.resumeText || drawerCandidate.experience || 'Currículo completo não informado.'}
                    </div>
                  </div>
                )}

                {/* TAB: PORTFÓLIO E VÍDEO */}
                {drawerTab === 'portfolio' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h4 className="font-extrabold text-xs uppercase text-slate-700">Links & Apresentações</h4>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                      {drawerCandidate.linkedinUrl ? (
                        <a href={drawerCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold block">
                          🌐 Perfil no LinkedIn
                        </a>
                      ) : (
                        <span className="text-slate-500 block">LinkedIn: linkedin.com/in/candidato</span>
                      )}

                      {drawerCandidate.portfolioUrl ? (
                        <a href={drawerCandidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-bold block">
                          🎨 Portfólio / GitHub
                        </a>
                      ) : (
                        <span className="text-slate-500 block">Portfólio: github.com/candidato</span>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: EXPERIÊNCIAS */}
                {drawerTab === 'experiencias' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h4 className="font-extrabold text-xs uppercase text-slate-700">Histórico Profissional e Competências</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-extrabold text-slate-900 block">{drawerCandidate.experience}</span>
                      <p className="text-slate-600 text-xs">Empresas anteriores e realizações destacadas no mercado de trabalho.</p>
                    </div>
                  </div>
                )}

                {/* TAB: ENTREVISTAS */}
                {drawerTab === 'entrevistas' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-purple-900">GestRH Meeting Sala Online</h4>
                        <p className="text-purple-800 text-xs">Realize a videoconferência diretamente na plataforma.</p>
                      </div>

                      <button
                        onClick={() => {
                          setMeetingCandidate(drawerCandidate);
                          setShowSmartInterviewModule(true);
                        }}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md"
                      >
                        Entrar na Reunião
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: ANOTAÇÕES */}
                {drawerTab === 'anotacoes' && (
                  <div className="space-y-4 animate-in fade-in">
                    <h4 className="font-extrabold text-xs uppercase text-slate-700">Anotações do Recrutador</h4>
                    <textarea
                      rows={5}
                      value={screeningData.rhComments}
                      onChange={e => setScreeningData(prev => ({ ...prev, rhComments: e.target.value }))}
                      placeholder="Anote impressões da entrevista ou histórico de contatos..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3"
                    />
                    <button
                      onClick={handleSaveScreening}
                      className="bg-slate-900 text-white font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Salvar Anotações
                    </button>
                  </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  onClick={() => handleDeleteCandidate(drawerCandidate.id)}
                  className="text-rose-600 hover:underline font-extrabold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir Candidato</span>
                </button>

                <button
                  onClick={() => setDrawerCandidate(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Fechar Painel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAIS (CADASTRAR CANDIDATO & CRIAR/EDITAR VAGA) */}
      {/* ========================================================================= */}

      {/* MODAL CADASTRAR CANDIDATO */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                <User className="h-5 w-5 text-emerald-600" />
                <span>Cadastrar Novo Candidato</span>
              </h3>
              <button onClick={() => setIsAddCandidateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={newCandName}
                  onChange={e => setNewCandName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@gmail.com"
                    value={newCandEmail}
                    onChange={e => setNewCandEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={newCandPhone}
                    onChange={e => setNewCandPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={newCandCity}
                    onChange={e => setNewCandCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UF</label>
                  <input
                    type="text"
                    placeholder="SP"
                    value={newCandState}
                    onChange={e => setNewCandState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vaga Vinculada</label>
                <select
                  value={newCandJobId}
                  onChange={e => setNewCandJobId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Nenhuma (Banco de Talentos Geral)</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} - {j.department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pretensão Salarial</label>
                <input
                  type="text"
                  placeholder="R$ 8.000,00"
                  value={newCandSalary}
                  onChange={e => setNewCandSalary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Texto do Currículo / Resumo Profissional</label>
                <textarea
                  rows={4}
                  placeholder="Cole aqui o texto do currículo do candidato..."
                  value={newCandResumeText}
                  onChange={e => setNewCandResumeText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Salvar Candidato
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL CRIAR / EDITAR VAGA */}
      {isNewJobOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <span>{editingJob ? 'Editar Vaga de Emprego' : 'Criar Nova Vaga de Emprego'}</span>
              </h3>
              <button onClick={() => setIsNewJobOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Título da Vaga *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Desenvolvedor React Sênior"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento / Área</label>
                  <input
                    type="text"
                    placeholder="Tecnologia, Vendas, RH..."
                    value={jobDept}
                    onChange={e => setJobDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modelo de Trabalho</label>
                  <select
                    value={jobModel}
                    onChange={e => setJobModel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faixa Salarial</label>
                  <input
                    type="text"
                    placeholder="R$ 8.000,00 - R$ 10.000,00"
                    value={jobSalary}
                    onChange={e => setJobSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="São Paulo - SP"
                    value={jobLocation}
                    onChange={e => setJobLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada da Vaga</label>
                <textarea
                  rows={4}
                  placeholder="Escreva sobre o objetivo da vaga, desafio do time e ambiente de trabalho..."
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requisitos Exigidos (Um por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Experiência com React e TypeScript&#10;Domínio de Tailwind CSS&#10;Boa comunicação interpessoal"
                  value={jobReqsText}
                  onChange={e => setJobReqsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewJobOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  {editingJob ? 'Salvar Alterações' : 'Publicar Vaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR / EDITAR COLUNA KANBAN */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                <Palette className="h-5 w-5 text-emerald-600" />
                <span>{editingStage ? 'Editar Coluna do Kanban' : 'Nova Coluna do Kanban'}</span>
              </h3>
              <button onClick={() => setIsColumnModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveColumn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Coluna / Etapa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Entrevista com CEO, Teste Prático, Fit Cultural..."
                  value={columnName}
                  onChange={e => setColumnName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E quando utilizar esta etapa? (Regra / Gatilho)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Mover candidatos aprovados na fase de teste técnico para agendamento de conversa com o lider de engenharia..."
                  value={columnWhenRule}
                  onChange={e => setColumnWhenRule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Esta instrução é exibida ao passar o mouse no ícone 💡 da coluna.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Tema de Cor do Card e Cabeçalho</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl">
                  {Object.keys(COLOR_THEMES).map(key => {
                    const t = COLOR_THEMES[key];
                    const isSel = columnColorKey === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setColumnColorKey(key)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2 ${
                          isSel ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/40' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full shrink-0 ${t.barColor}`} />
                        <span className="font-bold text-[10px] text-slate-800 truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!editingStage && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Posição na Esteira Kanban</label>
                  <select
                    value={insertAfterId}
                    onChange={e => setInsertAfterId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="end">Ao Final da Esteira (Última Coluna)</option>
                    {kanbanStages.map(s => (
                      <option key={s.id} value={s.id}>Inserir após "{s.label}"</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsColumnModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  {editingStage ? 'Salvar Alterações' : 'Criar Coluna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REMOVER COLUNA KANBAN */}
      {removeColumnModal.isOpen && removeColumnModal.stageToRemove && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Remover Coluna "{removeColumnModal.stageToRemove.label}"?
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Confirme a exclusão desta etapa do fluxo de recrutamento
                </span>
              </div>
            </div>

            {(() => {
              const countInStage = candidates.filter(c => getCandidateStage(c, kanbanStages) === removeColumnModal.stageToRemove?.id).length;
              return countInStage > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs text-amber-900">
                  <p className="font-extrabold flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Atenção: Existem {countInStage} candidato(s) nesta coluna!</span>
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Selecione para qual etapa deseja mover automaticamente esses candidatos antes de remover a coluna:
                  </p>
                  <select
                    value={removeColumnModal.targetStageId}
                    onChange={e => setRemoveColumnModal(prev => ({ ...prev, targetStageId: e.target.value }))}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {kanbanStages
                      .filter(s => s.id !== removeColumnModal.stageToRemove?.id && !s.hidden)
                      .map(s => (
                        <option key={s.id} value={s.id}>Mover para "{s.label}"</option>
                      ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Não há candidatos atualmente nesta coluna. Ela será excluída com segurança do seu Kanban.
                </p>
              );
            })()}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRemoveColumnModal({ isOpen: false, stageToRemove: null, targetStageId: 'Recebidos' })}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveColumn}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GERENCIAR COLUNAS DO KANBAN */}
      {isManageColumnsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                  <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                  <span>Gerenciar Colunas do Kanban</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Reordene, adicione, edite ou altere a visibilidade das colunas do seu processo seletivo
                </span>
              </div>
              <button onClick={() => setIsManageColumnsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0">
              <span className="text-xs font-bold text-slate-700">
                {kanbanStages.length} colunas cadastradas ({visibleStages.length} visíveis)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetStagesToDefault}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                  title="Restaurar as 10 etapas oficiais padrão"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <button
                  onClick={() => {
                    setIsManageColumnsOpen(false);
                    handleOpenAddColumnModal('end');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nova Coluna</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {kanbanStages.map((stage, idx) => {
                const countCandidates = candidates.filter(c => getCandidateStage(c, kanbanStages) === stage.id).length;
                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      stage.hidden ? 'bg-slate-50/60 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className={`h-3 w-3 rounded-full shrink-0 ${stage.barColor}`} />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">
                            {stage.label}
                          </h4>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${stage.badge}`}>
                            {countCandidates} cands
                          </span>
                          {stage.hidden && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded-md">
                              Oculta
                            </span>
                          )}
                        </div>
                        {stage.whenRule && (
                          <p className="text-[10px] text-slate-500 truncate max-w-md">
                            💡 {stage.whenRule}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleToggleStageVisibility(stage.id)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          stage.hidden ? 'text-slate-400 hover:bg-slate-200' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={stage.hidden ? 'Exibir no Kanban' : 'Ocultar no Kanban'}
                      >
                        {stage.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => {
                          setIsManageColumnsOpen(false);
                          handleOpenEditColumnModal(stage);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        title="Editar coluna"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleInitRemoveColumn(stage)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Excluir coluna"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsManageColumnsOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">{confirmModal.title}</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                  confirmModal.isDanger !== false 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700 font-extrabold'
                }`}
              >
                {confirmModal.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
