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
  GripVertical,
  TrendingUp,
  Maximize2,
  Minimize2,
  Layers
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
  initialTab?: 'kanban' | 'curriculos' | 'vagas' | 'entrevistas';
}

const KANBAN_STAGES = [
  { id: 'Novo', label: 'Novos / Recebidos', color: 'border-blue-200/90 bg-blue-50/40 text-blue-900', badge: 'bg-blue-100 text-blue-800', barColor: 'bg-blue-500', headerBg: 'bg-blue-500/10 text-blue-700' },
  { id: 'Triagem', label: 'Em Triagem', color: 'border-amber-200/90 bg-amber-50/40 text-amber-900', badge: 'bg-amber-100 text-amber-800', barColor: 'bg-amber-500', headerBg: 'bg-amber-500/10 text-amber-700' },
  { id: 'Entrevista RH', label: 'Entrevista RH', color: 'border-purple-200/90 bg-purple-50/40 text-purple-900', badge: 'bg-purple-100 text-purple-800', barColor: 'bg-purple-500', headerBg: 'bg-purple-500/10 text-purple-700' },
  { id: 'Entrevista Técnica', label: 'Entrevista Técnica', color: 'border-indigo-200/90 bg-indigo-50/40 text-indigo-900', badge: 'bg-indigo-100 text-indigo-800', barColor: 'bg-indigo-500', headerBg: 'bg-indigo-500/10 text-indigo-700' },
  { id: 'Proposta', label: 'Proposta / Oferta', color: 'border-cyan-200/90 bg-cyan-50/40 text-cyan-900', badge: 'bg-cyan-100 text-cyan-800', barColor: 'bg-cyan-500', headerBg: 'bg-cyan-500/10 text-cyan-700' },
  { id: 'Aprovado', label: 'Aprovados', color: 'border-emerald-200/90 bg-emerald-50/40 text-emerald-900', badge: 'bg-emerald-100 text-emerald-800', barColor: 'bg-emerald-500', headerBg: 'bg-emerald-500/10 text-emerald-700' },
  { id: 'Reprovado', label: 'Reprovados / Banco', color: 'border-rose-200/90 bg-rose-50/40 text-rose-900', badge: 'bg-rose-100 text-rose-800', barColor: 'bg-rose-500', headerBg: 'bg-rose-500/10 text-rose-700' }
];

export default function RecruitmentModule({
  jobs,
  candidates,
  onUpdateJobs,
  onUpdateCandidates,
  triggerToast,
  initialTab
}: RecruitmentModuleProps) {
  // Navigation Tabs: 'kanban' | 'curriculos' | 'vagas' | 'entrevistas'
  const [activeTab, setActiveTab] = useState<'kanban' | 'curriculos' | 'vagas' | 'entrevistas'>(initialTab || 'kanban');

  // Selected & Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
  const [viewingPublicJob, setViewingPublicJob] = useState<Job | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [analyticsModalJob, setAnalyticsModalJob] = useState<Job | null>(null);
  const [shareModalJob, setShareModalJob] = useState<Job | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal for Viewing Candidates received for a specific job
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<Job | null>(null);
  const [jobModalSearch, setJobModalSearch] = useState('');
  const [jobModalStageFilter, setJobModalStageFilter] = useState('Todos');

  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [isGeneratingJob, setIsGeneratingJob] = useState(false);

  // Candidate Detail Modal state
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [candidateNoteInput, setCandidateNoteInput] = useState('');

  // New Candidate Manual Entry Modal state
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandName, setNewCandName] = useState('');
  const [newCandEmail, setNewCandEmail] = useState('');
  const [newCandPhone, setNewCandPhone] = useState('');
  const [newCandCity, setNewCandCity] = useState('São Paulo');
  const [newCandState, setNewCandState] = useState('SP');
  const [newCandArea, setNewCandArea] = useState('TI');
  const [newCandJobId, setNewCandJobId] = useState('');
  const [newCandExperience, setNewCandExperience] = useState('');
  const [newCandResumeText, setNewCandResumeText] = useState('');
  const [newCandSalary, setNewCandSalary] = useState('');

  // Filters state for Jobs
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Filters state for Candidates / Kanban
  const [kanbanJobFilter, setKanbanJobFilter] = useState('Todas');
  const [kanbanSearch, setKanbanSearch] = useState('');
  const [candSearch, setCandSearch] = useState('');
  const [candJobFilter, setCandJobFilter] = useState('Todos');
  const [candStatusFilter, setCandStatusFilter] = useState('Todos');

  // Modern Drag and Drop & View Mode state for Kanban
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [kanbanViewMode, setKanbanViewMode] = useState<'board' | 'compact'>('board');

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
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      const updated = jobs.filter(j => j.id !== id);
      onUpdateJobs(updated);
      if (selectedJob?.id === id) {
        setSelectedJob(updated[0] || null);
      }
      triggerToast('✓ Vaga excluída com sucesso.');
    }
  };

  const handleToggleCancelJob = (job: Job) => {
    const isClosed = job.status === 'Encerrada' || job.status === 'Cancelada' || (!job.active && job.status !== 'Rascunho' && job.status !== 'Publicada');
    if (isClosed) {
      if (confirm(`Deseja reabrir a vaga "${job.title}" e ativá-la no portal público?`)) {
        const updated = jobs.map(j => j.id === job.id ? { ...j, status: 'Publicada' as const, active: true, publishedToPortal: true } : j);
        onUpdateJobs(updated);
        triggerToast(`✓ Vaga "${job.title}" foi reaberta e ativada!`);
      }
    } else {
      if (confirm(`Tem certeza que deseja cancelar/encerrar a vaga "${job.title}"?\n\nEla deixará de receber novas candidaturas públicas.`)) {
        const updated = jobs.map(j => j.id === job.id ? { ...j, status: 'Encerrada' as const, active: false, publishedToPortal: false } : j);
        onUpdateJobs(updated);
        if (selectedJob?.id === job.id) {
          setSelectedJob(null);
        }
        triggerToast(`✓ Vaga "${job.title}" foi cancelada/encerrada.`);
      }
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
        triggerToast('✓ Imagem de banner carregada!');
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Generator & Optimizer
  const handleAIGenerateJob = async () => {
    if (!jobTitle) {
      alert('Digite o título da vaga para que a IA possa otimizar os textos.');
      return;
    }
    setIsGeneratingJob(true);
    try {
      const response = await fetch('/api/gemini/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: jobTitle, 
          department: jobDept, 
          workModel: jobModel, 
          type: jobType 
        })
      });
      const data = await response.json();
      if (response.ok) {
        setJobDesc(data.description || '');
        setJobReqsText((data.requirements || []).join('\n'));
        setResponsibilitiesText((data.responsibilities || [
          `Liderar o desenvolvimento e manutenção das soluções do departamento de ${jobDept}.`,
          'Trabalhar alinhado às melhores práticas do mercado.',
          'Garantir a qualidade técnica e performance do produto.'
        ]).join('\n'));
        setBenefitsText('Vale Refeição / Alimentação (R$ 40/dia)\nPlano de Saúde e Odontológico Bradesco\nAuxílio Home Office / Equipamento completo\nGympass e Seguro de Vida');
        setSeoTitle(`${jobTitle} - Vaga ${jobModel} na ${companyName}`);
        setSeoDescription(`Venha trabalhar como ${jobTitle} na ${companyName}! Vaga ${jobModel} em ${city}-${stateUF}. Salário ${jobSalary}. Inscreva-se já!`);
        setSeoKeywordsText(`${jobTitle}, vaga ${jobDept}, ${jobModel}, emprego em ${city}, contratação ${jobType}`);
        triggerToast('✓ Vaga, Benefícios e SEO otimizados com Inteligência Artificial!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(error);
      alert('Erro ao gerar com IA: ' + error.message);
    } finally {
      setIsGeneratingJob(false);
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) {
      alert('Por favor, preencha o título da vaga.');
      return;
    }

    const descriptionToSave = jobDesc || `Vaga para ${jobTitle} em ${jobDept}. Atuação em modelo ${jobModel} e contrato ${jobType}.`;
    const jobIdToUse = editingJob ? editingJob.id : `job-${Date.now()}`;
    const slugToUse = editingJob?.slug || generateJobSlug(jobTitle, jobIdToUse);

    const isPublic = jobStatus === 'Publicada';
    const jobData: Job = {
      id: jobIdToUse,
      title: jobTitle,
      role: jobTitle,
      department: jobDept,
      location: `${city} - ${stateUF}`,
      type: jobType,
      workModel: jobModel,
      salaryRange: jobSalary || 'R$ 8.000,00',
      description: descriptionToSave,
      requirements: jobReqsText.split('\n').map(r => r.trim()).filter(Boolean),
      active: isPublic,
      status: jobStatus,
      publishedToPortal: isPublic,
      createdAt: editingJob ? editingJob.createdAt : new Date().toISOString().split('T')[0],
      publishedAt: editingJob?.publishedAt || (isPublic ? new Date().toISOString().split('T')[0] : undefined),
      companyName: companyName || 'TECHCORP INOVAÇÕES',
      companyLogo: companyLogo || undefined,
      bannerUrl: bannerUrl || getDefaultBanner(jobDept),
      city: city,
      state: stateUF,
      responsibilities: responsibilitiesText.split('\n').map(r => r.trim()).filter(Boolean),
      differentials: differentialsText.split('\n').map(r => r.trim()).filter(Boolean),
      benefits: benefitsText.split('\n').map(r => r.trim()).filter(Boolean),
      workHours: workHours || '44h semanais, Seg a Sex',
      vacanciesCount: Number(vacanciesCount) || 1,
      prazo: jobPrazo || '2026-08-30',
      slug: slugToUse,
      seoTitle: seoTitle || `${jobTitle} | ${companyName}`,
      seoDescription: seoDescription || descriptionToSave.slice(0, 150),
      seoKeywords: seoKeywordsText.split(',').map(k => k.trim()).filter(Boolean),
      analytics: editingJob?.analytics || {
        views: Math.floor(Math.random() * 45) + 12,
        clicks: Math.floor(Math.random() * 20) + 5,
        applications: Math.floor(Math.random() * 8) + 2,
        sources: { Direct: 12, WhatsApp: 5, LinkedIn: 8, Google: 3 }
      }
    };

    if (editingJob) {
      const updated = jobs.map(j => j.id === jobData.id ? jobData : j);
      onUpdateJobs(updated);
      setSelectedJob(jobData);
      triggerToast(`✓ Vaga "${jobTitle}" atualizada e Página Pública atualizada!`);
    } else {
      const updated = [jobData, ...jobs];
      onUpdateJobs(updated);
      setSelectedJob(jobData);
      triggerToast(`✓ Vaga para "${jobTitle}" criada e Página Pública gerada!`);
    }

    setIsNewJobOpen(false);
  };

  // Candidate Screening via AI
  const handleAICandidateScreening = async (candidate: Candidate) => {
    const jobToUse = selectedJob || jobs.find(j => j.id === candidate.jobId) || jobs[0];
    if (!jobToUse) {
      alert('Nenhuma vaga selecionada para efetuar a triagem.');
      return;
    }
    setIsAnalyzing(candidate.id);
    try {
      const response = await fetch('/api/gemini/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, job: jobToUse })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = candidates.map(c => {
          if (c.id === candidate.id) {
            return {
              ...c,
              aiScore: data.score,
              aiAnalysis: data.analysis,
              jobId: jobToUse.id,
              jobTitle: jobToUse.title
            };
          }
          return c;
        });
        onUpdateCandidates(updated);
        
        if (selectedCandidateDetail?.id === candidate.id) {
          setSelectedCandidateDetail(prev => prev ? {
            ...prev,
            aiScore: data.score,
            aiAnalysis: data.analysis,
            jobId: jobToUse.id,
            jobTitle: jobToUse.title
          } : null);
        }

        triggerToast(`✓ Triagem IA realizada para ${candidate.name}! (Score: ${data.score}%)`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(error);
      alert('Erro na triagem IA: ' + error.message);
    } finally {
      setIsAnalyzing(null);
    }
  };

  // Move candidate between stages
  const handleChangeCandidateStage = (candidateId: string, newStage: string) => {
    const updated = candidates.map(c => c.id === candidateId ? { ...c, status: newStage } : c);
    onUpdateCandidates(updated);
    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail(prev => prev ? { ...prev, status: newStage } : null);
    }
    triggerToast(`✓ Candidato movido para a etapa: ${newStage}`);
  };

  const handleMoveCandidateStage = (candidateId: string, currentStage: string | undefined, direction: 'next' | 'prev') => {
    const normalizeStage = (st?: string) => {
      if (!st || st === 'Novo' || st === 'Inscrito') return 'Novo';
      if (st === 'Triagem' || st === 'Em Triagem') return 'Triagem';
      if (st === 'Entrevista' || st === 'Entrevista RH') return 'Entrevista RH';
      if (st === 'Entrevista Técnica') return 'Entrevista Técnica';
      if (st === 'Proposta') return 'Proposta';
      if (st === 'Aprovado' || st === 'Contratado') return 'Aprovado';
      if (st === 'Reprovado' || st === 'Banco') return 'Reprovado';
      return 'Novo';
    };

    const cur = normalizeStage(currentStage);
    const stageIds = KANBAN_STAGES.map(s => s.id);
    const currentIndex = stageIds.indexOf(cur);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < stageIds.length) {
      const nextStage = stageIds[targetIndex];
      handleChangeCandidateStage(candidateId, nextStage);
    }
  };

  // Delete Candidate
  const handleDeleteCandidate = (candId: string) => {
    if (confirm('Tem certeza que deseja remover este candidato?')) {
      const updated = candidates.filter(c => c.id !== candId);
      onUpdateCandidates(updated);
      if (selectedCandidateDetail?.id === candId) {
        setSelectedCandidateDetail(null);
      }
      triggerToast('✓ Candidato removido.');
    }
  };

  // Save Recruiter Notes
  const handleSaveCandidateNotes = (candId: string) => {
    const updated = candidates.map(c => c.id === candId ? { ...c, notes: candidateNoteInput } : c);
    onUpdateCandidates(updated);
    if (selectedCandidateDetail?.id === candId) {
      setSelectedCandidateDetail(prev => prev ? { ...prev, notes: candidateNoteInput } : null);
    }
    triggerToast('✓ Anotações salvas com sucesso!');
  };

  // Manual Creation of Candidate
  const handleSaveManualCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName || !newCandEmail) {
      alert('Por favor, informe Nome e E-mail.');
      return;
    }

    const linkedJ = jobs.find(j => j.id === newCandJobId);
    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      name: newCandName,
      email: newCandEmail,
      phone: newCandPhone || '(11) 90000-0000',
      city: newCandCity || 'São Paulo',
      state: newCandState || 'SP',
      area: newCandArea || linkedJ?.department || 'TI',
      experience: newCandExperience || 'Candidato cadastrado manualmente pelo RH.',
      resumeText: newCandResumeText || newCandExperience || 'Currículo anexado.',
      jobId: linkedJ?.id,
      jobTitle: linkedJ?.title,
      status: 'Novo',
      createdAt: new Date().toISOString().split('T')[0],
      expectedSalary: newCandSalary
    };

    onUpdateCandidates([newCand, ...candidates]);
    setIsAddCandidateOpen(false);
    setNewCandName('');
    setNewCandEmail('');
    setNewCandPhone('');
    setNewCandExperience('');
    setNewCandResumeText('');
    triggerToast(`✓ Candidato "${newCandName}" adicionado ao banco de currículos!`);
  };

  const handleCopyLink = (job: Job) => {
    const url = getPublicJobUrl(job);
    navigator.clipboard.writeText(url);
    setCopiedId(job.id);
    triggerToast('✓ Link público da vaga copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase());

      const matchDept = deptFilter === 'Todos' || j.department === deptFilter;
      const currentStatus = (j as any).status || (j.active ? 'Em Andamento' : 'Pausada');
      const matchStatus = statusFilter === 'Todos' || currentStatus === statusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [jobs, search, deptFilter, statusFilter]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(jobs.map(j => j.department).filter(Boolean));
    return Array.from(depts);
  }, [jobs]);

  // Filtered Candidates for Resume Bank tab
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const query = candSearch.toLowerCase();
      const matchSearch = !query || 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(query)) ||
        (c.experience && c.experience.toLowerCase().includes(query));

      const matchJob = candJobFilter === 'Todos' || c.jobId === candJobFilter;
      
      const matchStatus = candStatusFilter === 'Todos' || (() => {
        const st = c.status || 'Novo';
        if (candStatusFilter === 'Novo') return st === 'Novo' || st === 'Inscrito';
        if (candStatusFilter === 'Triagem') return st === 'Triagem' || st === 'Em Triagem';
        if (candStatusFilter === 'Entrevista') return st.includes('Entrevista');
        if (candStatusFilter === 'Proposta') return st === 'Proposta';
        if (candStatusFilter === 'Aprovado') return st === 'Aprovado' || st === 'Contratado';
        if (candStatusFilter === 'Reprovado') return st === 'Reprovado' || st === 'Banco';
        return st === candStatusFilter;
      })();

      return matchSearch && matchJob && matchStatus;
    });
  }, [candidates, candSearch, candJobFilter, candStatusFilter]);

  // Candidate stage helper for Kanban grouping
  const getCandidateStage = (c: Candidate): string => {
    const st = c.status || 'Novo';
    if (st === 'Novo' || st === 'Inscrito') return 'Novo';
    if (st === 'Triagem' || st === 'Em Triagem') return 'Triagem';
    if (st === 'Entrevista' || st === 'Entrevista RH') return 'Entrevista RH';
    if (st === 'Entrevista Técnica') return 'Entrevista Técnica';
    if (st === 'Proposta') return 'Proposta';
    if (st === 'Aprovado' || st === 'Contratado') return 'Aprovado';
    if (st === 'Reprovado' || st === 'Banco') return 'Reprovado';
    return 'Novo';
  };

  // Candidates for Kanban Board
  const kanbanCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchJob = kanbanJobFilter === 'Todas' || c.jobId === kanbanJobFilter;
      const query = kanbanSearch.toLowerCase();
      const matchSearch = !query || 
        c.name.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(query)) ||
        (c.experience && c.experience.toLowerCase().includes(query));

      return matchJob && matchSearch;
    });
  }, [candidates, kanbanJobFilter, kanbanSearch]);

  const linkedCandidates = useMemo(() => {
    if (!selectedJob) return [];
    return candidates.filter(c => c.jobId === selectedJob.id || (!c.jobId && (
      c.area === selectedJob.department || 
      (selectedJob.department === 'TI' && c.area === 'TI')
    )));
  }, [selectedJob, candidates]);

  const rankedCandidates = useMemo(() => {
    return [...linkedCandidates].sort((a, b) => {
      const scoreA = a.aiScore !== undefined ? a.aiScore : -1;
      const scoreB = b.aiScore !== undefined ? b.aiScore : -1;
      return scoreB - scoreA;
    });
  }, [linkedCandidates]);

  // Helper to get candidates for a job
  const getJobCandidatesList = (jobId: string) => {
    const targetJob = jobs.find(j => j.id === jobId);
    return candidates.filter(c => 
      c.jobId === jobId || 
      (!c.jobId && targetJob && (c.area === targetJob.department || (targetJob.department === 'TI' && c.area === 'TI')))
    );
  };

  const handleViewJobResumes = (job: Job) => {
    setSelectedJobForCandidates(job);
    setSelectedJob(job);
    setJobModalSearch('');
    setJobModalStageFilter('Todos');
  };

  const candidatesForSelectedJobModal = useMemo(() => {
    if (!selectedJobForCandidates) return [];
    return candidates.filter(c => {
      const isForJob = c.jobId === selectedJobForCandidates.id || (
        !c.jobId && (
          c.area === selectedJobForCandidates.department ||
          (selectedJobForCandidates.department === 'TI' && c.area === 'TI')
        )
      );
      if (!isForJob) return false;

      const query = jobModalSearch.toLowerCase();
      const matchesSearch = !query ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        (c.experience && c.experience.toLowerCase().includes(query));

      const matchesStage = jobModalStageFilter === 'Todos' || getCandidateStage(c) === jobModalStageFilter;

      return matchesSearch && matchesStage;
    });
  }, [candidates, selectedJobForCandidates, jobModalSearch, jobModalStageFilter]);

  // Current Form Object for Live Preview
  const currentFormJobState: Partial<Job> = {
    id: editingJob?.id || 'new-job',
    title: jobTitle || 'Nova Vaga',
    department: jobDept,
    companyName,
    companyLogo,
    bannerUrl,
    location: `${city} - ${stateUF}`,
    city,
    state: stateUF,
    workModel: jobModel,
    type: jobType,
    salaryRange: jobSalary,
    description: jobDesc,
    requirements: jobReqsText.split('\n').map(r => r.trim()).filter(Boolean),
    responsibilities: responsibilitiesText.split('\n').map(r => r.trim()).filter(Boolean),
    differentials: differentialsText.split('\n').map(r => r.trim()).filter(Boolean),
    benefits: benefitsText.split('\n').map(r => r.trim()).filter(Boolean),
    workHours,
    vacanciesCount: Number(vacanciesCount) || 1,
    prazo: jobPrazo,
    seoTitle,
    seoDescription,
    seoKeywords: seoKeywordsText.split(',').map(k => k.trim()).filter(Boolean)
  };

  // Render Full Public Page View mode if triggered
  if (viewingPublicJob) {
    return (
      <PublicJobPage 
        job={viewingPublicJob}
        onBack={() => setViewingPublicJob(null)}
        onCandidateSubmit={(newCand) => {
          const fullCand: Candidate = {
            ...newCand,
            id: `cand-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0]
          };
          onUpdateCandidates([fullCand, ...candidates]);
          triggerToast('✓ Nova candidatura registrada no sistema!');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-amber-500" />
            <span>Recrutamento & Seleção Inteligente</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie o pipeline Kanban, analise os currículos recebidos e publique vagas com páginas exclusivas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>+ Cadastrar Currículo</span>
          </button>

          <button
            onClick={openAddModal}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Nova Vaga + Página Pública</span>
          </button>
        </div>
      </div>

      {/* Main Module Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'kanban'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Columns className="h-4 w-4" />
          <span>Pipeline Kanban</span>
          <span className="ml-1 bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
            {candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('curriculos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'curriculos'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Inbox className="h-4 w-4" />
          <span>Recebimento de Currículos</span>
          <span className="ml-1 bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
            {candidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vagas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'vagas'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Vagas & Divulgação Pública</span>
          <span className="ml-1 bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('entrevistas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'entrevistas'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Entrevista Inteligente (IA)</span>
          <span className="ml-1 bg-amber-400/30 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
            NOVO
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PIPELINE KANBAN DO PROCESSO SELETIVO (MODERNO) */}
      {/* ========================================================================= */}
      {activeTab === 'kanban' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Kanban Top Analytics & Funnel Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Pipeline Interativo Kanban
                  </span>
                  <span className="text-slate-400 text-xs">
                    Arraste os cards para avançar de etapa
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-white flex items-center space-x-2">
                  <span>Gestão do Processo Seletivo</span>
                </h3>
              </div>

              {/* Quick Metrics Cards */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">No Pipeline</span>
                  <span className="font-extrabold text-sm text-amber-400">{kanbanCandidates.length}</span>
                </div>

                <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Entrevistas</span>
                  <span className="font-extrabold text-sm text-purple-400">
                    {kanbanCandidates.filter(c => {
                      const st = getCandidateStage(c);
                      return st === 'Entrevista RH' || st === 'Entrevista Técnica';
                    }).length}
                  </span>
                </div>

                <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Aprovados</span>
                  <span className="font-extrabold text-sm text-emerald-400">
                    {kanbanCandidates.filter(c => getCandidateStage(c) === 'Aprovado').length}
                  </span>
                </div>

                {kanbanCandidates.some(c => c.aiScore === undefined) && (
                  <button
                    onClick={() => {
                      const unanalyzed = kanbanCandidates.filter(c => c.aiScore === undefined);
                      if (unanalyzed.length === 0) return;
                      triggerToast(`Iniciando triagem em lote para ${unanalyzed.length} candidatos...`);
                      unanalyzed.forEach((c, idx) => {
                        setTimeout(() => handleAICandidateScreening(c), idx * 600);
                      });
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shrink-0"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Triagem IA em Lote</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stage Distribution Progress Funnel Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  <span>Distribuição do Funil de Recrutamento</span>
                </span>
                <span>{kanbanCandidates.length} candidatos totais</span>
              </div>

              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                {KANBAN_STAGES.map(stg => {
                  const count = kanbanCandidates.filter(c => getCandidateStage(c) === stg.id).length;
                  const pct = kanbanCandidates.length > 0 ? (count / kanbanCandidates.length) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={stg.id}
                      style={{ width: `${pct}%` }}
                      className={`${stg.barColor} transition-all duration-500`}
                      title={`${stg.label}: ${count} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Filter Pills by Job Opening */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Briefcase className="h-4 w-4 text-amber-500" />
                <span>Filtrar Vagas de Emprego Ativas:</span>
              </span>

              {kanbanJobFilter !== 'Todas' && (
                <button
                  onClick={() => setKanbanJobFilter('Todas')}
                  className="text-xs text-amber-600 hover:text-amber-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Limpar filtro de vaga</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setKanbanJobFilter('Todas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  kanbanJobFilter === 'Todas'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas as Vagas ({candidates.length})
              </button>

              {jobs.map(j => {
                const jobCandCount = candidates.filter(c => c.jobId === j.id || (
                  !c.jobId && (c.area === j.department || (j.department === 'TI' && c.area === 'TI'))
                )).length;

                return (
                  <button
                    key={j.id}
                    onClick={() => setKanbanJobFilter(j.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                      kanbanJobFilter === j.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{j.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      kanbanJobFilter === j.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {jobCandCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kanban Control & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar candidato por nome, cidade ou cargo..."
                value={kanbanSearch}
                onChange={e => setKanbanSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center space-x-1">
                <button
                  onClick={() => setKanbanViewMode('board')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    kanbanViewMode === 'board' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Modo Quadro Completo"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setKanbanViewMode('compact')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    kanbanViewMode === 'compact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Modo Compacto"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsAddCandidateOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>+ Candidato</span>
              </button>
            </div>
          </div>

          {/* Modern Interactive Drag & Drop Kanban Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3.5 overflow-x-auto pb-6 pt-1 items-start">
            {KANBAN_STAGES.map(stage => {
              const stageCandidates = kanbanCandidates.filter(c => getCandidateStage(c) === stage.id);
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
                  className={`rounded-2xl border ${stage.color} p-3 flex flex-col min-h-[540px] transition-all duration-200 shadow-2xs ${
                    isOver ? 'ring-2 ring-amber-500 bg-amber-100/60 scale-[1.01] shadow-lg border-amber-400' : ''
                  }`}
                >
                  {/* Column Header */}
                  <div className="pb-2 mb-3 border-b border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-xs tracking-tight uppercase text-slate-900 flex items-center space-x-1.5">
                        <span className={`h-2 w-2 rounded-full ${stage.barColor}`} />
                        <span>{stage.label}</span>
                      </h3>
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full font-mono ${stage.badge}`}>
                        {stageCandidates.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        {kanbanCandidates.length > 0 
                          ? `${((stageCandidates.length / kanbanCandidates.length) * 100).toFixed(0)}% do total`
                          : '0%'}
                      </span>

                      <button
                        onClick={() => {
                          if (kanbanJobFilter !== 'Todas') {
                            setNewCandJobId(kanbanJobFilter);
                          }
                          setIsAddCandidateOpen(true);
                        }}
                        className="hover:text-amber-600 font-bold flex items-center space-x-0.5 cursor-pointer"
                        title="Adicionar direto nesta etapa"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Candidate Cards Container inside Column */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-0.5">
                    {stageCandidates.length === 0 ? (
                      <div className={`text-center py-12 px-2 text-[11px] text-slate-400 border-2 border-dashed rounded-2xl transition-all ${
                        isOver ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold' : 'border-slate-200/80 bg-white/40'
                      }`}>
                        {isOver ? 'Solte para mover aqui!' : 'Arraste candidatos para esta etapa'}
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
                            className={`bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all space-y-2.5 cursor-grab active:cursor-grabbing group ${
                              isBeingDragged ? 'opacity-40 scale-95 border-amber-500 shadow-xl ring-2 ring-amber-400' : ''
                            } ${kanbanViewMode === 'compact' ? 'p-2.5 space-y-1.5' : ''}`}
                          >
                            {/* Card Top Header Line */}
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center space-x-2 min-w-0">
                                <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                                
                                <div className="h-7 w-7 bg-slate-900 text-amber-400 font-extrabold rounded-xl flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                  {c.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-xs text-slate-900 leading-snug truncate">
                                    {c.name}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 block truncate font-medium">
                                    {c.city} - {c.state}
                                  </span>
                                </div>
                              </div>

                              {/* AI Score Badge */}
                              {c.aiScore !== undefined ? (
                                <span className="bg-amber-50 text-amber-800 font-extrabold text-[10px] px-1.5 py-0.5 rounded-lg border border-amber-200 flex items-center space-x-0.5 shrink-0 shadow-2xs">
                                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                  <span>{c.aiScore}%</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAICandidateScreening(c)}
                                  disabled={isAnalyzing === c.id}
                                  className="text-[9px] bg-slate-900 hover:bg-emerald-600 text-amber-400 hover:text-white font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 shrink-0 shadow-2xs"
                                  title="Analisar Compatibilidade com IA"
                                >
                                  <Sparkles className="h-2.5 w-2.5" />
                                  <span>{isAnalyzing === c.id ? '...' : 'IA'}</span>
                                </button>
                              )}
                            </div>

                            {/* Job position badge */}
                            <div className="bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-1 rounded-xl truncate flex items-center justify-between">
                              <span className="truncate">💼 {c.jobTitle || c.area || 'Geral'}</span>
                              {c.salaryExpectation && (
                                <span className="text-[9px] text-slate-500 shrink-0 ml-1">
                                  {c.salaryExpectation}
                                </span>
                              )}
                            </div>

                            {kanbanViewMode !== 'compact' && (
                              <>
                                {/* Contact Direct Links */}
                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                                  <div className="flex items-center space-x-2">
                                    {waUrl && (
                                      <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200"
                                        title="Chamar no WhatsApp"
                                      >
                                        <MessageSquare className="h-3 w-3" />
                                        <span>Whats</span>
                                      </a>
                                    )}
                                    <a 
                                      href={`mailto:${c.email}`} 
                                      className="text-blue-600 hover:underline truncate max-w-[70px]"
                                      title={c.email}
                                    >
                                      Email
                                    </a>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedCandidateDetail(c);
                                      setCandidateNoteInput(c.notes || '');
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-2 py-0.5 rounded-md transition-all text-[10px] cursor-pointer"
                                  >
                                    Ver CV &rarr;
                                  </button>
                                </div>
                              </>
                            )}

                            {/* Stage Stepper Navigation Controls */}
                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => handleMoveCandidateStage(c.id, c.status, 'prev')}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                                title="Mover para etapa anterior"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>

                              <select
                                value={getCandidateStage(c)}
                                onChange={e => handleChangeCandidateStage(c.id, e.target.value)}
                                className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-0.5 font-bold text-slate-800 focus:outline-none"
                              >
                                {KANBAN_STAGES.map(s => (
                                  <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                              </select>

                              <button
                                onClick={() => handleMoveCandidateStage(c.id, c.status, 'next')}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                                title="Mover para próxima etapa"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
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
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RECEBIMENTO DE CURRÍCULOS & BANCO DE TALENTOS */}
      {/* ========================================================================= */}
      {activeTab === 'curriculos' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Recebidos</span>
              <span className="font-display font-extrabold text-xl text-slate-900 mt-0.5 block">{candidates.length}</span>
              <span className="text-[10px] text-slate-500">No banco de dados</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Aguardando Triagem</span>
              <span className="font-display font-extrabold text-xl text-blue-900 mt-0.5 block">
                {candidates.filter(c => getCandidateStage(c) === 'Novo').length}
              </span>
              <span className="text-[10px] text-blue-600">Novos currículos</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Em Processo Seletivo</span>
              <span className="font-display font-extrabold text-xl text-amber-900 mt-0.5 block">
                {candidates.filter(c => ['Triagem', 'Entrevista RH', 'Entrevista Técnica', 'Proposta'].includes(getCandidateStage(c))).length}
              </span>
              <span className="text-[10px] text-amber-600">Em avaliação e entrevistas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Aprovados / Contratados</span>
              <span className="font-display font-extrabold text-xl text-emerald-900 mt-0.5 block">
                {candidates.filter(c => getCandidateStage(c) === 'Aprovado').length}
              </span>
              <span className="text-[10px] text-emerald-600">Finalizados com sucesso</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, telefone, habilidades..."
                value={candSearch}
                onChange={e => setCandSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={candJobFilter}
                onChange={e => setCandJobFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
              >
                <option value="Todos">Todas as Vagas</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              <select
                value={candStatusFilter}
                onChange={e => setCandStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
              >
                <option value="Todos">Todas as Etapas</option>
                {KANBAN_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              <button
                onClick={() => setIsAddCandidateOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>+ Cadastrar Currículo</span>
              </button>
            </div>
          </div>

          {/* Candidates List / Grid */}
          <div className="space-y-3">
            {filteredCandidates.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">Nenhum currículo encontrado</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Ajuste os filtros de busca ou cadastre um novo candidato manualmente.
                </p>
              </div>
            ) : (
              filteredCandidates.map(c => {
                const phoneClean = c.phone ? c.phone.replace(/\D/g, '') : '';
                const waUrl = phoneClean ? `https://wa.me/55${phoneClean}` : null;
                const stageObj = KANBAN_STAGES.find(s => s.id === getCandidateStage(c)) || KANBAN_STAGES[0];

                return (
                  <div 
                    key={c.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="h-11 w-11 bg-slate-900 text-amber-400 font-extrabold rounded-2xl flex items-center justify-center shrink-0 text-base">
                        {c.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">({c.city}-{c.state})</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stageObj.badge}`}>
                            {stageObj.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{c.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </span>
                          {waUrl && (
                            <a 
                              href={waUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-600 font-bold flex items-center space-x-1 hover:underline"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 italic line-clamp-1 mt-1">
                          "{c.experience}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                      
                      <div className="text-left md:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Vaga Vinculada</span>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[160px]">
                          {c.jobTitle || c.area || 'Geral'}
                        </span>
                      </div>

                      {c.aiScore !== undefined ? (
                        <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 text-center shrink-0">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Match IA</span>
                          <span className="font-extrabold text-xs flex items-center justify-center space-x-1">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            <span>{c.aiScore}%</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAICandidateScreening(c)}
                          disabled={isAnalyzing === c.id}
                          className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{isAnalyzing === c.id ? 'Analisando...' : 'Triagem IA'}</span>
                        </button>
                      )}

                      <select
                        value={getCandidateStage(c)}
                        onChange={e => handleChangeCandidateStage(c.id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-xl text-xs px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
                      >
                        {KANBAN_STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          setSelectedCandidateDetail(c);
                          setCandidateNoteInput(c.notes || '');
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver CV Completo</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCandidate(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                        title="Remover Candidato"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GESTÃO DE VAGAS & DIVULGAÇÃO PÚBLICA */}
      {/* ========================================================================= */}
      {activeTab === 'vagas' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cargo, empresa ou cidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
              >
                <option value="Todos">Todos os Departamentos</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-medium focus:outline-none"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Aberta">Aberta</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Pausada">Pausada</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* Vagas Cards List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">Nenhuma vaga encontrada</h3>
                <p className="text-slate-400 text-xs mt-1">Crie uma nova vaga ou ajuste os filtros para visualizar resultados.</p>
              </div>
            ) : (
              filteredJobs.map(job => {
                const prazoVal = job.prazo || '30/08/2026';
                const isSelected = selectedJob?.id === job.id;

                return (
                  <div 
                    key={job.id} 
                    className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-900 text-amber-400 font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          {job.department || 'GERAL'}
                        </span>
                        <span className="bg-blue-50 text-blue-700 font-semibold text-[10px] px-2.5 py-0.5 rounded-md">
                          {job.workModel}
                        </span>
                        <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-0.5 rounded-md">
                          {job.type}
                        </span>
                        {job.status === 'Publicada' || job.active ? (
                          <span className="bg-emerald-50 text-emerald-800 font-semibold text-[10px] px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span>Página Pública Ativa</span>
                          </span>
                        ) : job.status === 'Rascunho' ? (
                          <span className="bg-amber-50 text-amber-800 font-semibold text-[10px] px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                            <span>Rascunho (Privado)</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 font-semibold text-[10px] px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                            <span>Encerrada</span>
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => handleViewJobResumes(job)}
                        className="font-display font-bold text-base sm:text-lg text-slate-900 hover:text-amber-600 cursor-pointer transition-colors flex items-center space-x-2 group"
                        title="Clique para ver os currículos recebidos desta vaga"
                      >
                        <span>{job.title}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.companyName || 'TechCorp'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center space-x-1 font-semibold text-slate-900">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{job.salaryRange}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Prazo: {prazoVal}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        job.status === 'Publicada' || (job.status !== 'Rascunho' && job.status !== 'Encerrada' && job.active)
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'Rascunho'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.status || (job.active ? 'Publicada' : 'Encerrada')}
                      </span>

                      {/* Ver Currículos Recebidos */}
                      <button
                        onClick={() => handleViewJobResumes(job)}
                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        title="Ver Currículos Recebidos desta Vaga"
                      >
                        <Inbox className="h-3.5 w-3.5" />
                        <span>Currículos ({getJobCandidatesList(job.id).length})</span>
                      </button>

                      {/* Ver Página Pública */}
                      <button
                        onClick={() => setViewingPublicJob(job)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        title="Ver Página Pública da Vaga"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>Página Pública</span>
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(job)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        title="Copiar Link da Vaga"
                      >
                        {copiedId === job.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                      </button>

                      {/* Share Modal */}
                      <button
                        onClick={() => setShareModalJob(job)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        title="Compartilhar & QR Code"
                      >
                        <Share2 className="h-3.5 w-3.5 text-slate-600" />
                      </button>

                      {/* Analytics Modal */}
                      <button
                        onClick={() => setAnalyticsModalJob(job)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        title="Análise de Desempenho e Métricas"
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-purple-600" />
                      </button>

                      {/* Triagem IA Toggle */}
                      <button
                        onClick={() => setSelectedJob(isSelected ? null : job)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isSelected ? 'Ocultar Triagem' : 'Triagem IA'}</span>
                      </button>

                      {/* Cancelar / Encerrar / Reabrir Vaga button */}
                      <button
                        onClick={() => handleToggleCancelJob(job)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          job.status === 'Encerrada' || job.status === 'Cancelada'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                        title={job.status === 'Encerrada' || job.status === 'Cancelada' ? 'Reabrir Vaga' : 'Cancelar / Encerrar Vaga'}
                      >
                        {job.status === 'Encerrada' || job.status === 'Cancelada' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Reabrir</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            <span>Cancelar Vaga</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                          title="Editar Vaga"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                          title="Excluir Vaga Permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Expanded Selected Job AI Candidate Triagem Section */}
          {selectedJob && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm animate-in fade-in">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Painel de Avaliação por IA</span>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 mt-0.5">{selectedJob.title}</h3>
                  <p className="text-xs text-slate-500">{selectedJob.department} &bull; {selectedJob.location} &bull; {selectedJob.salaryRange}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Descrição da Vaga</h4>
                <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedJob.description}
                </p>
              </div>

              {/* Candidates Funnel with AI Ranking */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <span>Ranking de Triagem Inteligente de Candidatos</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Candidatos ranqueados e avaliados por compatibilidade técnica.</p>
                  </div>
                </div>

                {rankedCandidates.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-xs text-slate-400">
                    Nenhum candidato cadastrado ou compatível com a área de atuação desta vaga.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rankedCandidates.map(cand => (
                      <div 
                        key={cand.id} 
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between md:items-center gap-4 ${cand.aiScore !== undefined ? 'bg-gradient-to-r from-emerald-50/20 to-slate-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="h-9 w-9 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                            {cand.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-slate-900">{cand.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">({cand.city}-{cand.state})</span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate max-w-md mt-0.5 italic">"{cand.experience}"</p>
                            
                            {cand.aiAnalysis && (
                              <div className="mt-2 text-[10px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                                {cand.aiAnalysis}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 self-end md:self-center">
                          {cand.aiScore !== undefined ? (
                            <div className="text-center shrink-0">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Aderência IA</span>
                              <div className="flex items-center justify-center mt-0.5">
                                <Star className={`h-4 w-4 ${cand.aiScore >= 80 ? 'text-amber-500 fill-amber-500' : 'text-slate-300 fill-slate-300'}`} />
                                <span className="text-base font-extrabold text-slate-900 ml-1">{cand.aiScore}%</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAICandidateScreening(cand)}
                              disabled={isAnalyzing !== null}
                              className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                            >
                              {isAnalyzing === cand.id ? (
                                <>
                                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1" />
                                  <span>Analisando...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                                  <span>Triagem IA</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CANDIDATE FULL RESUME & DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-5 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-slate-900 text-amber-400 font-extrabold rounded-2xl flex items-center justify-center text-lg shrink-0">
                  {selectedCandidateDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Perfil Completo do Candidato</span>
                  <h3 className="font-display font-extrabold text-lg text-slate-900">{selectedCandidateDetail.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedCandidateDetail.city} - {selectedCandidateDetail.state} &bull; Cadastrado em {selectedCandidateDetail.createdAt}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCandidateDetail(null)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Status Bar & Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Contatos</span>
                <p className="text-slate-900 font-semibold flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedCandidateDetail.email}</span>
                </p>
                <p className="text-slate-900 font-semibold flex items-center space-x-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedCandidateDetail.phone}</span>
                </p>
                {selectedCandidateDetail.phone && (
                  <a
                    href={`https://wa.me/55${selectedCandidateDetail.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-600 font-bold hover:underline mt-1"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Iniciar conversa no WhatsApp &rarr;</span>
                  </a>
                )}
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
                <span className="font-bold text-slate-500 block text-[10px] uppercase">Vaga & Etapa Atual</span>
                <p className="text-slate-900 font-bold">
                  💼 {selectedCandidateDetail.jobTitle || selectedCandidateDetail.area || 'Geral'}
                </p>
                <div className="pt-1 flex items-center space-x-2">
                  <span className="text-[11px] text-slate-600 font-semibold">Alterar Etapa:</span>
                  <select
                    value={getCandidateStage(selectedCandidateDetail)}
                    onChange={e => handleChangeCandidateStage(selectedCandidateDetail.id, e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-xs px-2 py-1 font-bold text-slate-800"
                  >
                    {KANBAN_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AI Triagem Score & Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Avaliação por Inteligência Artificial</span>
                </h4>

                <button
                  onClick={() => handleAICandidateScreening(selectedCandidateDetail)}
                  disabled={isAnalyzing === selectedCandidateDetail.id}
                  className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isAnalyzing === selectedCandidateDetail.id ? 'Analisando...' : 'Re-executar IA'}</span>
                </button>
              </div>

              {selectedCandidateDetail.aiScore !== undefined ? (
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <span className="font-extrabold text-lg text-slate-900">{selectedCandidateDetail.aiScore}% de Compatibilidade</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-emerald-100">
                    {selectedCandidateDetail.aiAnalysis}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  Candidato ainda não passou pela triagem IA. Clique no botão acima para analisar a compatibilidade com a vaga.
                </div>
              )}
            </div>

            {/* Resume / Experience Text */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Currículo & Resumo Profissional</span>
              </h4>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-3">
                <p className="whitespace-pre-line leading-relaxed font-sans">
                  {selectedCandidateDetail.resumeText || selectedCandidateDetail.experience}
                </p>

                {selectedCandidateDetail.resumeUrl && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Arquivo Anexo do Currículo:</span>
                    <a
                      href={`#`}
                      onClick={(e) => { e.preventDefault(); alert('Download de arquivo em ambiente de demonstração.'); }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Baixar Currículo (PDF/DOCX)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Recruiter Notes / Anotações */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Anotações Internas do Recrutador</h4>
              <textarea
                rows={3}
                placeholder="Escreva observações da entrevista, feedbacks de gestores ou pretensão salarial negociada..."
                value={candidateNoteInput}
                onChange={e => setCandidateNoteInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveCandidateNotes(selectedCandidateDetail.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Salvar Anotações
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => handleDeleteCandidate(selectedCandidateDetail.id)}
                className="text-rose-600 hover:underline font-bold text-xs flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Candidato</span>
              </button>

              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="bg-slate-100 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-200"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CADASTRAR CURRÍCULO MANUALLY */}
      {/* ========================================================================= */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Inbox className="h-5 w-5 text-amber-500" />
                <span>Cadastrar Novo Currículo / Candidato</span>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={newCandPhone}
                    onChange={e => setNewCandPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UF</label>
                  <input
                    type="text"
                    placeholder="SP"
                    maxLength={2}
                    value={newCandState}
                    onChange={e => setNewCandState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vaga Vinculada</label>
                  <select
                    value={newCandJobId}
                    onChange={e => setNewCandJobId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value="">Nenhuma (Banco de Talentos)</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pretensão Salarial</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 6.000,00"
                    value={newCandSalary}
                    onChange={e => setNewCandSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resumo da Experiência</label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor React com 4 anos de experiência em startups fintechs."
                  value={newCandExperience}
                  onChange={e => setNewCandExperience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Texto do Currículo / Habilidades</label>
                <textarea
                  rows={4}
                  placeholder="Cole aqui o texto do currículo, histórico de empresas, formação e conhecimentos..."
                  value={newCandResumeText}
                  onChange={e => setNewCandResumeText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Currículo
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATION / EDITING JOB MODAL */}
      {/* ========================================================================= */}
      {isNewJobOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Configuração de Vaga Pública</span>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-amber-500" />
                  <span>{editingJob ? 'Editar Vaga e Página Pública' : 'Criar Nova Vaga com Página Pública'}</span>
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="h-4 w-4" />
                  <span>Pré-Visualização em Tempo Real</span>
                </button>

                <button 
                  onClick={() => setIsNewJobOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              
              {/* Top Banner Image Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Banner da Vaga (Página Pública)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="h-24 w-full sm:w-48 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative shrink-0">
                    <img 
                      src={bannerUrl || getDefaultBanner(jobDept)} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Banner Atual
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center space-x-2">
                      <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 cursor-pointer flex items-center space-x-1.5 transition-all">
                        <Upload className="h-4 w-4 text-slate-500" />
                        <span>Enviar Foto (JPG, PNG, WEBP)</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerUpload} className="hidden" />
                      </label>
                      
                      {bannerUrl && (
                        <button
                          type="button"
                          onClick={() => setBannerUrl('')}
                          className="text-xs text-rose-600 hover:underline font-semibold"
                        >
                          Usar Padrão do Sistema
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Envie uma foto de capa personalizada para dar destaque à sua vaga no portal público.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Grid Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título da Vaga *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Desenvolvedor Full Stack Sênior"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    placeholder="Ex: TI, Comercial, RH, Financeiro"
                    value={jobDept}
                    onChange={e => setJobDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    placeholder="TECHCORP INOVAÇÕES"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modelo de Trabalho</label>
                  <select
                    value={jobModel}
                    onChange={e => setJobModel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Contrato</label>
                  <select
                    value={jobType}
                    onChange={e => setJobType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="CLT">CLT (Efetivo)</option>
                    <option value="PJ">PJ (Pessoa Jurídica)</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Temporário">Temporário</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faixa Salarial / Pretensão</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 8.000,00 - R$ 10.000,00"
                    value={jobSalary}
                    onChange={e => setJobSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="SP"
                    value={stateUF}
                    onChange={e => setStateUF(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prazo limite de inscrição</label>
                  <input
                    type="date"
                    value={jobPrazo}
                    onChange={e => setJobPrazo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Status & Public Options */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Status da Divulgação</span>
                  <p className="text-[10px] text-slate-500">
                    Ao selecionar 'Publicada', a vaga ficará ativa imediatamente no portal de carreiras e disponível para inscritos.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <label className="font-bold text-slate-700">Status:</label>
                  <select
                    value={jobStatus}
                    onChange={e => setJobStatus(e.target.value as any)}
                    className="bg-white border border-slate-300 font-bold rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="Publicada">Publicada (Ativa)</option>
                    <option value="Rascunho">Rascunho (Privado)</option>
                    <option value="Encerrada">Encerrada</option>
                  </select>
                </div>
              </div>

              {/* AI Auto Generator Trigger Button */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] font-bold text-slate-500">Textos & Requisitos da Vaga</span>
                <button
                  type="button"
                  onClick={handleAIGenerateJob}
                  disabled={isGeneratingJob}
                  className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-400 text-amber-400 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isGeneratingJob ? 'Gerando com IA...' : 'Otimizar Descrição e Requisitos com IA'}</span>
                </button>
              </div>

              {/* Textareas */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o propósito da vaga, ambiente de trabalho, cultura da empresa..."
                    value={jobDesc}
                    onChange={e => setJobDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Requisitos Exigidos (1 por linha)</label>
                    <textarea
                      rows={3}
                      placeholder="Ensino superior completo&#10;Experiência sólida com React e TypeScript&#10;Inglês intermediário"
                      value={jobReqsText}
                      onChange={e => setJobReqsText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Responsabilidades (1 por linha)</label>
                    <textarea
                      rows={3}
                      placeholder="Desenvolver componentes escaláveis&#10;Liderar code reviews de pares&#10;Garantir alta qualidade nos testes"
                      value={responsibilitiesText}
                      onChange={e => setResponsibilitiesText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diferenciais Desejáveis (1 por linha)</label>
                    <textarea
                      rows={2}
                      placeholder="Conhecimento em Docker / Kubernetes&#10;Experiência com arquitetura Serverless"
                      value={differentialsText}
                      onChange={e => setDifferentialsText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Benefícios da Vaga (1 por linha)</label>
                    <textarea
                      rows={2}
                      placeholder="Vale Refeição R$ 40/dia&#10;Plano de Saúde Bradesco&#10;Auxílio Home Office"
                      value={benefitsText}
                      onChange={e => setBenefitsText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewJobOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingJob ? 'Salvar Alterações da Vaga' : 'Criar Vaga & Publicar Página'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Realtime Preview Modal */}
      <PublicJobPreviewModal 
        job={currentFormJobState}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Share & QR Code Modal */}
      {shareModalJob && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Compartilhar Vaga Pública</h3>
              <button onClick={() => setShareModalJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 block">{shareModalJob.title}</span>
              <span className="text-slate-500 text-[11px] block">{shareModalJob.companyName || 'TechCorp'} &bull; {shareModalJob.location}</span>
              <code className="text-[10px] text-amber-600 font-mono break-all block mt-1">
                {getPublicJobUrl(shareModalJob)}
              </code>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCopyLink(shareModalJob)}
                className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 px-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar Link Exclusivo</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira esta vaga para ${shareModalJob.title}:\n${getPublicJobUrl(shareModalJob)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all text-center"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPublicJobUrl(shareModalJob))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 text-blue-800 font-bold text-xs py-2 px-3 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all text-center"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <button
              onClick={() => setShareModalJob(null)}
              className="w-full bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-xl hover:bg-slate-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsModalJob && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Métricas de Acesso e Candidaturas</span>
                <h3 className="font-extrabold text-base text-slate-900">{analyticsModalJob.title}</h3>
              </div>
              <button onClick={() => setAnalyticsModalJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Visualizações</span>
                <span className="font-extrabold text-lg text-slate-900 mt-1 block">
                  {analyticsModalJob.analytics?.views || 38}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cliques CTA</span>
                <span className="font-extrabold text-lg text-amber-600 mt-1 block">
                  {analyticsModalJob.analytics?.clicks || 19}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidaturas</span>
                <span className="font-extrabold text-lg text-emerald-600 mt-1 block">
                  {analyticsModalJob.analytics?.applications || 8}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Conversão</span>
                <span className="font-extrabold text-lg text-purple-600 mt-1 block">
                  {Math.round(((analyticsModalJob.analytics?.applications || 8) / (analyticsModalJob.analytics?.views || 38)) * 100)}%
                </span>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Origem dos Acessos (Canais)</h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(analyticsModalJob.analytics?.sources || { Direct: 12, WhatsApp: 8, LinkedIn: 14, Google: 4 }).map(([src, count]) => (
                  <div key={src} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">{src}</span>
                    <span className="font-mono font-bold text-slate-900">{count} visitas</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setAnalyticsModalJob(null)}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800"
            >
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CURRÍCULOS RECEBIDOS POR VAGA */}
      {/* ========================================================================= */}
      {selectedJobForCandidates && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full space-y-5 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-amber-500 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      Currículos Recebidos
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {getJobCandidatesList(selectedJobForCandidates.id).length} candidatos
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 mt-0.5">
                    {selectedJobForCandidates.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedJobForCandidates.department} &bull; {selectedJobForCandidates.location} &bull; {selectedJobForCandidates.workModel || 'Híbrido'} &bull; {selectedJobForCandidates.salaryRange}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    setKanbanJobFilter(selectedJobForCandidates.id);
                    setActiveTab('kanban');
                    setSelectedJobForCandidates(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Columns className="h-4 w-4" />
                  <span>Ver no Pipeline Kanban</span>
                </button>

                <button 
                  onClick={() => setSelectedJobForCandidates(null)} 
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl bg-slate-50 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar inside modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar candidato por nome ou habilidades..."
                  value={jobModalSearch}
                  onChange={e => setJobModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-500 shrink-0">Etapa:</span>
                <select
                  value={jobModalStageFilter}
                  onChange={e => setJobModalStageFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Todos">Todas as Etapas</option>
                  {KANBAN_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate List Cards */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {candidatesForSelectedJobModal.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                  <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Nenhum currículo encontrado para esta vaga</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Nenhum candidato se inscreveu ainda ou os filtros aplicados não retornaram resultados.
                  </p>
                  <button
                    onClick={() => {
                      setNewCandJobId(selectedJobForCandidates.id);
                      setNewCandArea(selectedJobForCandidates.department);
                      setIsAddCandidateOpen(true);
                      setSelectedJobForCandidates(null);
                    }}
                    className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Currículo para esta Vaga</span>
                  </button>
                </div>
              ) : (
                candidatesForSelectedJobModal.map(cand => {
                  const phoneClean = cand.phone ? cand.phone.replace(/\D/g, '') : '';
                  const waUrl = phoneClean ? `https://wa.me/55${phoneClean}` : null;
                  const stageObj = KANBAN_STAGES.find(s => s.id === getCandidateStage(cand)) || KANBAN_STAGES[0];

                  return (
                    <div 
                      key={cand.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5 min-w-0">
                        <div className="h-11 w-11 bg-slate-900 text-amber-400 font-extrabold rounded-2xl flex items-center justify-center shrink-0 text-base shadow-xs">
                          {cand.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{cand.name}</h4>
                            <span className="text-xs text-slate-500 font-medium">({cand.city}-{cand.state})</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${stageObj.badge}`}>
                              {stageObj.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>{cand.email}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{cand.phone}</span>
                            </span>
                            {waUrl && (
                              <a 
                                href={waUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-600 font-bold flex items-center space-x-1 hover:underline"
                                title="Falar no WhatsApp"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 italic line-clamp-1">
                            "{cand.experience}"
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                        {cand.aiScore !== undefined ? (
                          <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 text-center shrink-0">
                            <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Compatibilidade</span>
                            <span className="font-extrabold text-xs flex items-center justify-center space-x-1">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span>{cand.aiScore}%</span>
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAICandidateScreening(cand)}
                            disabled={isAnalyzing === cand.id}
                            className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{isAnalyzing === cand.id ? 'Analisando...' : 'Triagem IA'}</span>
                          </button>
                        )}

                        <select
                          value={getCandidateStage(cand)}
                          onChange={e => handleChangeCandidateStage(cand.id, e.target.value)}
                          className="bg-slate-100 border border-slate-200 rounded-xl text-xs px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
                        >
                          {KANBAN_STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            setSelectedCandidateDetail(cand);
                            setCandidateNoteInput(cand.notes || '');
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver CV</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCandidate(cand.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                          title="Remover Candidato"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ENTREVISTA INTELIGENTE COM IA */}
      {/* ========================================================================= */}
      {activeTab === 'entrevistas' && (
        <div className="animate-in fade-in pt-1">
          <SmartInterviewModule 
            jobs={jobs}
            candidates={candidates}
          />
        </div>
      )}

    </div>
  );
}
