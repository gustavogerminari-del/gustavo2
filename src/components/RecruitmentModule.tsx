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
  Gift,
  Award,
  Link
} from 'lucide-react';
import { Job, Candidate } from '../types';
import PublicJobPage from './PublicJobPage';
import PublicJobPreviewModal from './PublicJobPreviewModal';
import { generateJobSlug, getPublicJobUrl, getDefaultBanner } from './publicJobUtils';

interface RecruitmentModuleProps {
  jobs: Job[];
  candidates: Candidate[];
  onUpdateJobs: (jobs: Job[]) => void;
  onUpdateCandidates: (candidates: Candidate[]) => void;
  triggerToast: (msg: string) => void;
}

export default function RecruitmentModule({
  jobs,
  candidates,
  onUpdateJobs,
  onUpdateCandidates,
  triggerToast
}: RecruitmentModuleProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
  const [viewingPublicJob, setViewingPublicJob] = useState<Job | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [analyticsModalJob, setAnalyticsModalJob] = useState<Job | null>(null);
  const [shareModalJob, setShareModalJob] = useState<Job | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [isGeneratingJob, setIsGeneratingJob] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

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
  const [jobStatus, setJobStatus] = useState<'Aberta' | 'Em Andamento' | 'Pausada' | 'Finalizada'>('Em Andamento');
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
    setJobStatus('Em Andamento');
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
    setJobStatus((job as any).status || (job.active ? 'Em Andamento' : 'Pausada'));
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

    const jobData: Job = {
      id: jobIdToUse,
      title: jobTitle,
      department: jobDept,
      location: `${city} - ${stateUF}`,
      type: jobType,
      workModel: jobModel,
      salaryRange: jobSalary || 'R$ 8.000,00',
      description: descriptionToSave,
      requirements: jobReqsText.split('\n').map(r => r.trim()).filter(Boolean),
      active: jobStatus === 'Aberta' || jobStatus === 'Em Andamento',
      createdAt: editingJob ? editingJob.createdAt : new Date().toISOString().split('T')[0],
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
      },
      ...( { prazo: jobPrazo, status: jobStatus } as any)
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

  // Candidate Screening
  const handleAICandidateScreening = async (candidate: Candidate) => {
    if (!selectedJob) return;
    setIsAnalyzing(candidate.id);
    try {
      const response = await fetch('/api/gemini/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, job: selectedJob })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = candidates.map(c => {
          if (c.id === candidate.id) {
            return {
              ...c,
              aiScore: data.score,
              aiAnalysis: data.analysis,
              jobId: selectedJob.id
            };
          }
          return c;
        });
        onUpdateCandidates(updated);
        triggerToast('✓ Triagem realizada pela IA com sucesso!');
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

  const handleCopyLink = (job: Job) => {
    const url = getPublicJobUrl(job);
    navigator.clipboard.writeText(url);
    setCopiedId(job.id);
    triggerToast('✓ Link público da vaga copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2500);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-amber-500" />
            <span>Gestão de Vagas & Páginas Públicas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie vagas com páginas públicas exclusivas, links curtos, QR Code, banners e triagem IA.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Nova Vaga + Página Pública</span>
        </button>
      </div>

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
            const currentStatus = (job as any).status || (job.active ? 'Em Andamento' : 'Pausada');
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
                    <span className="bg-emerald-50 text-emerald-800 font-semibold text-[10px] px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>Página Pública Ativa</span>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">{job.title}</h3>

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
                    currentStatus === 'Em Andamento' || currentStatus === 'Aberta' ? 'bg-emerald-100 text-emerald-800' :
                    currentStatus === 'Pausada' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {currentStatus}
                  </span>

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
                      title="Excluir Vaga"
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

      {/* Add / Edit Vaga Modal with Real-Time Preview & Extended Public Fields */}
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
                      Caso não envie uma imagem, o sistema utilizará um banner profissional padrão ajustado ao departamento.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa / Cliente *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: TECHCORP INOVAÇÕES"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Título da Vaga *</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder="Ex: Desenvolvedor Full Stack React/Node Sênior"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleAIGenerateJob}
                      disabled={isGeneratingJob || !jobTitle}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl shrink-0 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isGeneratingJob ? 'Otimizando...' : 'IA Otimizar'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departamento</label>
                  <select 
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                  >
                    <option value="TI">TI / Tecnologia</option>
                    <option value="Comercial">Comercial / Vendas</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Financeiro">Financeiro / Contábil</option>
                    <option value="Logística">Logística / Operações</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salário / Faixa Salarial</label>
                  <input 
                    type="text" 
                    placeholder="Ex: R$ 8.000,00 ou R$ 12.000,00"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modalidade & Regime</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={jobModel}
                      onChange={(e) => setJobModel(e.target.value as any)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Remoto">Remoto</option>
                    </select>

                    <select 
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                    >
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Estágio">Estágio</option>
                      <option value="Temporário">Temporário</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade e Estado (UF)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      placeholder="Cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input 
                      type="text" 
                      placeholder="UF"
                      value={stateUF}
                      onChange={(e) => setStateUF(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade de Vagas & Carga Horária</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="number" 
                      min="1"
                      value={vacanciesCount}
                      onChange={(e) => setVacanciesCount(Number(e.target.value))}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold"
                      title="Quantidade de vagas"
                    />
                    <input 
                      type="text" 
                      placeholder="Carga horária (ex: 44h)"
                      value={workHours}
                      onChange={(e) => setWorkHours(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prazo & Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      value={jobPrazo}
                      onChange={(e) => setJobPrazo(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                    <select 
                      value={jobStatus}
                      onChange={(e) => setJobStatus(e.target.value as any)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold"
                    >
                      <option value="Aberta">Aberta</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Pausada">Pausada</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Cargo / Resumo</label>
                <textarea 
                  rows={3}
                  placeholder="Resumo do desafio, contexto da posição e metas..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsabilidades e Atribuições (1 por linha)</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Liderar projetos de desenvolvimento&#10;Garantir arquitetura escalável&#10;Mentoria do time júnior"
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requisitos & Qualificações (1 por linha)</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Experiência com React e TypeScript&#10;Conhecimento de Tailwind CSS&#10;Inglês técnico"
                    value={jobReqsText}
                    onChange={(e) => setJobReqsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diferenciais (1 por linha)</label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Conhecimento em AWS / Docker&#10;Experiência prévia em SaaS"
                    value={differentialsText}
                    onChange={(e) => setDifferentialsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Benefícios Oferecidos (1 por linha)</label>
                  <textarea 
                    rows={2}
                    placeholder="Ex: Vale Refeição R$ 40/dia&#10;Plano de Saúde Bradesco&#10;Day Off no Aniversário"
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* SEO Configurations */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                  Configurações de SEO & Motores de Busca (Google)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Título SEO (Meta Title)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Vaga Desenvolvedor Front-End - TechCorp"
                      value={seoTitle}
                      onChange={e => setSeoTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Palavras-chave (separadas por vírgula)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: react, typescript, desenvolvimento, emprego sp"
                      value={seoKeywordsText}
                      onChange={e => setSeoKeywordsText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Descrição SEO (Meta Description)</label>
                  <input 
                    type="text" 
                    placeholder="Resumo que aparece no Google quando alguém pesquisa esta vaga..."
                    value={seoDescription}
                    onChange={e => setSeoDescription(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>Pré-Visualização em Tempo Real</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNewJobOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm"
                  >
                    {editingJob ? 'Salvar Alterações' : 'Publicar Vaga & Gerar Link'}
                  </button>
                </div>
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

    </div>
  );
}
