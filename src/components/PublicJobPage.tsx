import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Send, 
  Check, 
  ArrowLeft, 
  Users, 
  Sparkles, 
  FileText, 
  Upload, 
  X, 
  QrCode, 
  ExternalLink,
  Gift,
  Award
} from 'lucide-react';
import { Job, Candidate } from '../types';
import { getDefaultBanner, getPublicJobUrl, trackJobMetric } from './publicJobUtils';

interface PublicJobPageProps {
  job: Job;
  onBack?: () => void;
  onCandidateSubmit?: (candidate: Omit<Candidate, 'id' | 'createdAt'>) => void;
}

export default function PublicJobPage({ job, onBack, onCandidateSubmit }: PublicJobPageProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Application Form State
  const [candName, setCandName] = useState('');
  const [candCpf, setCandCpf] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candCity, setCandCity] = useState(job.city || job.location?.split('-')[0]?.trim() || 'São Paulo');
  const [candState, setCandState] = useState(job.state || job.location?.split('-')[1]?.trim() || 'SP');
  const [candLinkedin, setCandLinkedin] = useState('');
  const [candPortfolio, setCandPortfolio] = useState('');
  const [candSalary, setCandSalary] = useState('');
  const [candMessage, setCandMessage] = useState('');
  const [candResumeName, setCandResumeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect referral source
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src') || 'Direct';
    trackJobMetric(job.id, 'views', src);

    // Dynamic SEO Document Title
    const originalTitle = document.title;
    document.title = job.seoTitle || `${job.title} | ${job.companyName || 'Portal de Carreiras'}`;

    return () => {
      document.title = originalTitle;
    };
  }, [job]);

  const publicUrl = getPublicJobUrl(job);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    trackJobMetric(job.id, 'clicks', 'CopyLink');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = (platform: 'whatsapp' | 'linkedin' | 'facebook' | 'email') => {
    trackJobMetric(job.id, 'clicks', platform);
    const text = `Confira esta vaga para ${job.title} na ${job.companyName || 'TechCorp'}!`;
    const encodedUrl = encodeURIComponent(publicUrl);
    const encodedText = encodeURIComponent(`${text}\n${publicUrl}`);

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Vaga: ${job.title}`)}&body=${encodedText}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCandResumeName(e.target.files[0].name);
    }
  };

  const handleOpenApplyModal = () => {
    trackJobMetric(job.id, 'clicks', 'ApplyButton');
    setIsApplyOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candEmail || !candPhone) {
      alert('Por favor, preencha os campos obrigatórios (Nome, E-mail e Telefone).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const candidateData: Omit<Candidate, 'id' | 'createdAt'> = {
        name: candName,
        email: candEmail,
        phone: candPhone,
        city: candCity,
        state: candState,
        area: job.department || 'Geral',
        experience: candMessage || `Candidatura enviada para a vaga ${job.title}. pretensão: ${candSalary || 'A combinar'}`,
        jobId: job.id,
        jobTitle: job.title,
        status: 'Novo',
        resumeUrl: candResumeName ? `files/${candResumeName}` : undefined
      };

      if (onCandidateSubmit) {
        onCandidateSubmit(candidateData);
      }

      trackJobMetric(job.id, 'applications', 'PublicForm');
      setIsSubmitting(false);
      setAppliedSuccess(true);
    }, 800);
  };

  const bannerImg = job.bannerUrl || getDefaultBanner(job.department);
  const companyLogo = job.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80';
  const companyName = job.companyName || 'TechCorp Inovações';

  const defaultBenefits = job.benefits && job.benefits.length > 0 ? job.benefits : [
    'Vale Refeição / Alimentação (R$ 40/dia)',
    'Plano de Saúde e Odontológico Bradesco',
    'Auxílio Home Office / Equipamento',
    'Gympass / TotalPass',
    'Seguro de Vida',
    'Day Off no Aniversário'
  ];

  const defaultResponsibilities = job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [
    `Atuar diretamente nos projetos de ${job.department}, garantindo prazos e entregas de alta qualidade.`,
    'Colaborar com times multidisciplinares propondo soluções inovadoras e eficientes.',
    'Participar de reuniões de alinhamento, planejamento de sprints e revisões de código/processos.',
    'Identificar pontos de melhoria nos fluxos existentes e promover continuous delivery.'
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-16">
      
      {/* Top Header / Nav */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all flex items-center space-x-1 text-xs cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                RH
              </div>
              <span className="font-display font-extrabold text-sm sm:text-base tracking-tight">
                {companyName} <span className="text-amber-400 font-normal">| Carreiras</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenApplyModal}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Candidatar-se</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-slate-200">
          <div className="h-48 sm:h-72 w-full relative">
            <img 
              src={bannerImg} 
              alt={job.title} 
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Banner Overlaid Content */}
          <div className="relative -mt-16 sm:-mt-20 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-start sm:items-end space-x-4">
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white shadow-lg object-cover bg-white shrink-0"
              />
              <div className="text-white space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {job.department || 'GERAL'}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white font-semibold text-[10px] px-2.5 py-0.5 rounded-md">
                    {job.workModel}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white font-semibold text-[10px] px-2.5 py-0.5 rounded-md">
                    {job.type}
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">{job.title}</h1>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{companyName}</span>
                  <span>&bull;</span>
                  <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{job.location}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenApplyModal}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
            >
              <Send className="h-5 w-5" />
              <span>Candidatar-se Agora</span>
            </button>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Cols: Main Job Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Highlights Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faixa Salarial</span>
                <span className="font-extrabold text-sm text-emerald-700 mt-0.5 block">{job.salaryRange || 'A combinar'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Regime / Modelo</span>
                <span className="font-bold text-sm text-slate-800 mt-0.5 block">{job.type} &bull; {job.workModel}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vagas Abertas</span>
                <span className="font-bold text-sm text-slate-800 mt-0.5 block">{job.vacanciesCount || 1} vaga(s)</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prazo Final</span>
                <span className="font-bold text-sm text-amber-600 mt-0.5 block">{job.prazo || '30/08/2026'}</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <span>Sobre a Vaga</span>
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Responsabilidades e Atribuições</span>
              </h2>
              <ul className="space-y-3">
                {defaultResponsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements & Qualifications */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span>Requisitos e Qualificações</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(job.requirements && job.requirements.length > 0 ? job.requirements : ['Comunicação', 'Proatividade', 'Trabalho em Equipe']).map((req, i) => (
                  <span key={i} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{req}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Differentials if available */}
            {job.differentials && job.differentials.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Diferenciais</span>
                </h2>
                <ul className="space-y-2">
                  {job.differentials.map((diff, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-2">
                      <span className="text-amber-500 font-bold">&bull;</span>
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <span>Benefícios Exclusivos</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defaultBenefits.map((ben, i) => (
                  <div key={i} className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center space-x-3 text-xs font-semibold text-purple-950">
                    <Gift className="h-4 w-4 text-purple-600 shrink-0" />
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Hours & Additional info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h2 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Informações Complementares</span>
              </h2>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Jornada / Carga Horária:</strong> {job.workHours || '44h semanais, Segunda a Sexta-feira das 08h00 às 18h00'}</p>
                <p><strong>Data de Publicação:</strong> {job.createdAt ? job.createdAt.split('-').reverse().join('/') : '22/07/2026'}</p>
                <p><strong>Prazo Final para Inscrições:</strong> {job.prazo || '30/08/2026'}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar with Application CTA & Social Sharing */}
          <div className="space-y-6 lg:sticky lg:top-20">
            
            {/* Primary Action Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Processo Seletivo Aberto</span>
                <h3 className="font-display font-bold text-lg text-white">Gostou dessa oportunidade?</h3>
                <p className="text-xs text-slate-300">Candidate-se em menos de 2 minutos preenchendo o formulário oficial.</p>
              </div>

              <button
                onClick={handleOpenApplyModal}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Quero me Candidatar</span>
              </button>

              <div className="text-center">
                <p className="text-[10px] text-slate-400">Processo 100% gratuito e seguro</p>
              </div>
            </div>

            {/* Social Sharing Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-amber-500" />
                <span>Compartilhar Vaga</span>
              </h3>

              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>{copied ? 'Link Copiado!' : 'Copiar Link Exclusivo'}</span>
                  </span>
                  {copied && <Check className="h-4 w-4 text-emerald-600" />}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleShare('linkedin')}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>LinkedIn</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={() => handleShare('email')}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>E-mail</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsQrOpen(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
                >
                  <QrCode className="h-4 w-4 text-amber-400" />
                  <span>Gerar QR Code da Vaga</span>
                </button>
              </div>
            </div>

            {/* Company Info Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-center">
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-16 w-16 rounded-xl mx-auto border border-slate-200 object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{companyName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Empresa verificada no Portal de Carreiras</p>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* MODAL DE CANDIDATURA */}
      {isApplyOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Inscrição de Candidato</span>
                <h3 className="font-display font-extrabold text-lg text-slate-900">{job.title}</h3>
              </div>
              <button 
                onClick={() => { setIsApplyOpen(false); setAppliedSuccess(false); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {appliedSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900">Candidatura Enviada com Sucesso!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Seus dados e currículo foram recebidos pela equipe de recrutamento da <strong>{companyName}</strong>. 
                  Caso seu perfil seja selecionado para as próximas etapas, entraremos em contato via WhatsApp ou E-mail.
                </p>
                <button
                  onClick={() => { setIsApplyOpen(false); setAppliedSuccess(false); }}
                  className="bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Maria Silva Santos"
                    value={candName}
                    onChange={e => setCandName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail *</label>
                    <input 
                      type="email" 
                      placeholder="maria@email.com"
                      value={candEmail}
                      onChange={e => setCandEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                    <input 
                      type="text" 
                      placeholder="(11) 99999-8888"
                      value={candPhone}
                      onChange={e => setCandPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Cidade *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: São Paulo"
                      value={candCity}
                      onChange={e => setCandCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estado *</label>
                    <input 
                      type="text" 
                      placeholder="SP"
                      value={candState}
                      onChange={e => setCandState(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CPF (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00"
                      value={candCpf}
                      onChange={e => setCandCpf(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pretensão Salarial (R$)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: R$ 6.500,00"
                      value={candSalary}
                      onChange={e => setCandSalary(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Perfil do LinkedIn</label>
                    <input 
                      type="url" 
                      placeholder="https://linkedin.com/in/perfil"
                      value={candLinkedin}
                      onChange={e => setCandLinkedin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Portfólio / GitHub</label>
                    <input 
                      type="url" 
                      placeholder="https://github.com/usuario"
                      value={candPortfolio}
                      onChange={e => setCandPortfolio(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anexar Currículo (PDF, DOC, DOCX)</label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-all">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="font-bold text-slate-700 text-xs">
                      {candResumeName ? `Anexado: ${candResumeName}` : 'Clique para selecionar seu currículo'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Tamanho máximo: 10MB</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mensagem ao Recrutador</label>
                  <textarea 
                    rows={3}
                    placeholder="Apresente brevemente sua trajetória e por que se interessou por esta vaga..."
                    value={candMessage}
                    onChange={e => setCandMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Confirmar Candidatura</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {isQrOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">QR Code da Vaga</h3>
              <button onClick={() => setIsQrOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto">
              {/* Dynamic QR Code SVG simulation */}
              <svg className="w-48 h-48 mx-auto text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0 0h30v30H0zM5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zM75 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zM5 75h20v20H5zM10 80h10v10H10zM40 10h10v10H40zM50 20h10v10H50zM30 40h20v10H30zM60 40h30v10H60zM40 60h10v30H40zM60 70h20v10H60zM70 80h30v20H70z" />
              </svg>
            </div>

            <p className="text-xs text-slate-600">
              Aponte a câmera do celular para abrir a página pública desta vaga diretamente no seu dispositivo.
            </p>

            <button
              onClick={() => setIsQrOpen(false)}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
