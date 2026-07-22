/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Users, 
  Building2, 
  FileText, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Award, 
  Database, 
  UserPlus, 
  DollarSign, 
  Phone, 
  Mail, 
  Building,
  CheckCircle2,
  X,
  Upload,
  User,
  Heart
} from 'lucide-react';
import { Job, Candidate } from '../types';

interface LandingPageProps {
  jobs: Job[];
  onNavigateToDashboard: () => void;
  onAddCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt'>) => void;
}

export default function LandingPage({ jobs, onNavigateToDashboard, onAddCandidate }: LandingPageProps) {
  // Search parameters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Page state ('home' | 'vagas')
  const [activePage, setActivePage] = useState<'home' | 'vagas'>('home');

  // Modals state
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAllJobsModalOpen, setIsAllJobsModalOpen] = useState(false);
  const [modalDepartmentFilter, setModalDepartmentFilter] = useState('Todos');
  const [modalWorkModelFilter, setModalWorkModelFilter] = useState('Todos');
  const [modalSearch, setModalSearch] = useState('');

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [applyJobFormOpen, setApplyJobFormOpen] = useState(false);

  // Success toast/message state
  const [showToast, setShowToast] = useState<string | null>(null);

  // Candidate register form
  const [cvName, setCvName] = useState('');
  const [cvEmail, setCvEmail] = useState('');
  const [cvPhone, setCvPhone] = useState('');
  const [cvCity, setCvCity] = useState('');
  const [cvState, setCvState] = useState('');
  const [cvArea, setCvArea] = useState('TI');
  const [cvExperience, setCvExperience] = useState('');
  const [cvFileSelected, setCvFileSelected] = useState<string | null>(null);

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Apply to job form
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyCity, setApplyCity] = useState('');
  const [applyState, setApplyState] = useState('');
  const [applyExperience, setApplyExperience] = useState('');
  const [applyFileSelected, setApplyFileSelected] = useState<string | null>(null);

  // Toast trigger
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(null);
    }, 4500);
  };

  // Filtered jobs for section
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchKeyword = keyword === '' || 
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.department.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase()) ||
        job.requirements.some(r => r.toLowerCase().includes(keyword.toLowerCase()));
      
      const matchLocation = location === '' || 
        job.location.toLowerCase().includes(location.toLowerCase());

      return matchKeyword && matchLocation && job.active !== false;
    });
  }, [jobs, keyword, location]);

  // All active jobs for modal
  const allActiveJobs = useMemo(() => {
    return jobs.filter(j => j.active !== false);
  }, [jobs]);

  const modalFilteredJobs = useMemo(() => {
    return allActiveJobs.filter(job => {
      const matchSearch = modalSearch === '' ||
        job.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
        job.department.toLowerCase().includes(modalSearch.toLowerCase()) ||
        job.location.toLowerCase().includes(modalSearch.toLowerCase()) ||
        job.description.toLowerCase().includes(modalSearch.toLowerCase());
      
      const matchDept = modalDepartmentFilter === 'Todos' || job.department === modalDepartmentFilter;
      const matchModel = modalWorkModelFilter === 'Todos' || job.workModel === modalWorkModelFilter;

      return matchSearch && matchDept && matchModel;
    });
  }, [allActiveJobs, modalSearch, modalDepartmentFilter, modalWorkModelFilter]);

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    allActiveJobs.forEach(j => depts.add(j.department));
    return ['Todos', ...Array.from(depts)];
  }, [allActiveJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTriggered(true);
    // Scroll smoothly to Job Section
    const element = document.getElementById('vagas-disponiveis');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvName || !cvEmail || !cvPhone || !cvCity || !cvState) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onAddCandidate({
      name: cvName,
      email: cvEmail,
      phone: cvPhone,
      city: cvCity,
      state: cvState,
      area: cvArea,
      experience: cvExperience || 'Candidato cadastrado pelo portal de talentos.',
      resumeText: `${cvName} - ${cvArea}. Contato: ${cvEmail}, ${cvPhone}. Experiência: ${cvExperience}. Arquivo enviado: ${cvFileSelected || 'Nenhum'}`
    });

    setIsCvModalOpen(false);
    triggerToast('✓ Currículo cadastrado com sucesso no Banco de Talentos!');
    
    // Reset form
    setCvName('');
    setCvEmail('');
    setCvPhone('');
    setCvCity('');
    setCvState('');
    setCvArea('TI');
    setCvExperience('');
    setCvFileSelected(null);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactModalOpen(false);
    triggerToast('✓ Solicitação enviada! Um de nossos consultores entrará em contato em breve.');
    
    setContactName('');
    setContactCompany('');
    setContactEmail('');
    setContactPhone('');
    setContactMessage('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyName || !applyEmail || !applyPhone || !applyCity || !applyState) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Add to candidates list in our system
    onAddCandidate({
      name: applyName,
      email: applyEmail,
      phone: applyPhone,
      city: applyCity,
      state: applyState,
      area: selectedJob?.department || 'Geral',
      experience: `Candidatou-se para a vaga de "${selectedJob?.title}". Experiência: ${applyExperience}`,
      resumeText: `Candidatura para Vaga: ${selectedJob?.title}. Candidato: ${applyName}. Experiência: ${applyExperience}`
    });

    setApplyJobFormOpen(false);
    setSelectedJob(null);
    triggerToast(`✓ Candidatura para "${selectedJob?.title}" enviada com sucesso!`);

    // Reset apply form
    setApplyName('');
    setApplyEmail('');
    setApplyPhone('');
    setApplyCity('');
    setApplyState('');
    setApplyExperience('');
    setApplyFileSelected(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/30 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-sm text-white">{showToast}</span>
        </div>
      )}

      {/* --- FULL PAGE CONDITIONAL RENDERING --- */}
      {activePage === 'vagas' ? (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans animate-in fade-in duration-200">
          {/* Header Navigation Bar */}
          <header className="bg-[#0b1d33] text-white py-5 border-b border-white/10 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer" 
                onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <div className="p-2 bg-amber-500 rounded-xl text-[#0b1d33] flex items-center justify-center shadow-md">
                  <Briefcase className="h-5 w-5 font-bold" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-base tracking-wider leading-none text-white">RAFAELA LOURENÇO</h1>
                  <p className="text-amber-500 font-mono text-[10px] font-semibold tracking-widest mt-0.5">RH &bull; VAGAS DE EMPREGO</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
                <button 
                  onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="hover:text-amber-400 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>&larr; Voltar ao Início</span>
                </button>
                <button 
                  onClick={() => { setActivePage('vagas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                  className="text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5 cursor-pointer"
                >
                  Todas as Vagas ({allActiveJobs.length})
                </button>
                <button 
                  onClick={() => setIsCvModalOpen(true)} 
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Cadastrar Currículo
                </button>
                <button 
                  onClick={() => setIsContactModalOpen(true)} 
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Contato
                </button>
              </div>

              <div>
                <button 
                  id="btn-sistema-rh-vagas-page"
                  onClick={onNavigateToDashboard}
                  className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-display font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Sistema de RH
                </button>
              </div>
            </div>
          </header>

          {/* Hero Header Banner */}
          <section className="bg-[#0b1d33] text-white py-12 md:py-16 relative overflow-hidden border-b border-amber-500/20">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3.5 py-1 mb-4">
                <span className="text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                  PORTAL COMPLETO DE OPORTUNIDADES
                </span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-3 tracking-tight">
                Todas as Vagas de Emprego
              </h2>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl font-light leading-relaxed mb-8">
                Encontre a oportunidade ideal para o seu perfil profissional. Filtre por área, cidade ou modelo de trabalho e candidate-se com praticidade.
              </p>

              {/* Live Filters Bar */}
              <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-800">
                <div className="relative flex items-center md:col-span-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="Buscar cargo, área ou palavra..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="md:col-span-1">
                  <select
                    value={modalDepartmentFilter}
                    onChange={(e) => setModalDepartmentFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Todos">Todas as Áreas ({availableDepartments.length - 1})</option>
                    {availableDepartments.filter(d => d !== 'Todos').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1">
                  <select
                    value={modalWorkModelFilter}
                    onChange={(e) => setModalWorkModelFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Todos">Todos os Modelos de Trabalho</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>

                <div className="md:col-span-1 flex items-center space-x-2">
                  <button
                    onClick={() => { setModalSearch(''); setModalDepartmentFilter('Todos'); setModalWorkModelFilter('Todos'); }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer text-center shadow-xs"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Page Content Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">
                  Catálogo de Vagas Abertas
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Exibindo <strong className="text-slate-900 font-bold">{modalFilteredJobs.length}</strong> de <strong className="text-slate-900 font-bold">{allActiveJobs.length}</strong> vagas disponíveis
                </p>
              </div>

              <button
                onClick={() => setIsCvModalOpen(true)}
                className="bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Upload className="h-4 w-4 text-amber-400" />
                <span>Cadastrar Currículo no Banco Geral</span>
              </button>
            </div>

            {modalFilteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">Nenhuma vaga encontrada com os filtros selecionados</h4>
                <p className="text-slate-500 text-xs mt-1">Tente ajustar a busca ou redefinir a área e o modelo de trabalho.</p>
                <button
                  onClick={() => { setModalSearch(''); setModalDepartmentFilter('Todos'); setModalWorkModelFilter('Todos'); }}
                  className="mt-4 bg-[#0b1d33] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modalFilteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-[#0b1d33] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          {job.department}
                        </span>
                        <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md">
                          {job.workModel} &bull; {job.type}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-xl text-slate-900 group-hover:text-amber-900 transition-colors mb-2 leading-snug">
                        {job.title}
                      </h4>

                      <div className="flex items-center space-x-3 text-xs text-slate-500 mb-3 font-medium">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{job.location}</span>
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="font-extrabold text-slate-900 font-mono">
                          {job.salaryRange}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed mb-4">
                        {job.description}
                      </p>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="space-y-1 mb-4 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requisitos:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.slice(0, 3).map((req, rIdx) => (
                              <span key={rIdx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Postada em {job.createdAt}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplyJobFormOpen(false);
                        }}
                        className="bg-[#0b1d33] hover:bg-amber-500 hover:text-[#0b1d33] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>Ver Vaga e Candidatar-se</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Vagas Footer */}
          <footer className="bg-[#0b1d33] text-white py-8 border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 rounded-xl text-[#0b1d33]">
                  <Briefcase className="h-5 w-5 font-bold" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-white">RAFAELA LOURENÇO RH</p>
                  <p className="text-slate-400 text-xs">Gestão Estratégica de Pessoas e Vagas de Emprego</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-amber-400 font-bold text-xs hover:underline cursor-pointer"
                >
                  &larr; Voltar à Página Inicial
                </button>
                <button 
                  onClick={onNavigateToDashboard}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Acessar Sistema de RH
                </button>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* --- HOME LANDING PAGE CONTENT --- */
        <>
          {/* Hero Header Area (Navy Background `#0b1d33`) */}
          <header className="bg-[#0b1d33] text-white py-12 md:pb-24 relative overflow-hidden" id="inicio">
        {/* Abstract Light Background effect */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar / Navigation */}
          <nav className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 md:pb-20 border-b border-white/10" id="landing-navbar">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="p-2.5 bg-amber-500 rounded-xl text-[#0b1d33] flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Briefcase className="h-6 w-6 font-bold" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-wider leading-none text-white">RAFAELA LOURENÇO</h1>
                <p className="text-amber-500 font-mono text-xs font-semibold tracking-widest mt-0.5">RH</p>
              </div>
            </div>

            {/* Menu options */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-5 md:gap-x-8 text-sm text-gray-300 font-medium">
              <button 
                onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className={`hover:text-amber-400 transition-colors cursor-pointer ${activePage === 'home' ? 'text-amber-400 font-bold' : ''}`}
              >
                Início
              </button>
              <button 
                onClick={() => { setActivePage('vagas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className={`hover:text-amber-400 transition-colors cursor-pointer ${activePage === 'vagas' ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-0.5' : ''}`}
              >
                Vagas
              </button>
              <a href="#tres-publicos" onClick={() => setActivePage('home')} className="hover:text-amber-400 transition-colors">Banco de Talentos</a>
              <a href="#planos" onClick={() => setActivePage('home')} className="hover:text-amber-400 transition-colors">Empresas</a>
              <a href="#como-funciona" onClick={() => setActivePage('home')} className="hover:text-amber-400 transition-colors">Recrutamento</a>
              <span className="text-white/20 hidden sm:inline">|</span>
              <a href="#seguro-lgpd" onClick={() => setActivePage('home')} className="hover:text-amber-400 transition-colors hidden sm:inline">Sobre Nós</a>
              <button onClick={() => setIsContactModalOpen(true)} className="hover:text-amber-400 transition-colors cursor-pointer">Contato</button>
            </div>

            {/* Button on the Right: System Direct Access */}
            <div>
              <button 
                id="btn-sistema-rh-header"
                onClick={onNavigateToDashboard}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-display font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Sistema de RH
              </button>
            </div>
          </nav>

          {/* Hero Main Content */}
          <div className="pt-8 pb-12 max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
                Plataforma de Recrutamento e Gestão de Pessoas
              </span>
            </div>

            <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1] mb-6">
              Conectando talentos às <br />
              <span className="text-amber-500">melhores oportunidades</span>
            </h2>

            <p className="text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-8">
              A plataforma digital completa de RH onde candidatos, empresas e gestão de pessoas se encontram em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                id="btn-cadastrar-cv-hero"
                onClick={() => setIsCvModalOpen(true)}
                className="inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 group"
              >
                <span>Cadastrar Currículo</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => { setActivePage('vagas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-semibold px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Ver Vagas
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar Block (Overlapping layout) */}
      <section className="relative -mt-10 z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <form 
          onSubmit={handleSearch}
          className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4"
          id="form-busca-vagas"
        >
          <div className="flex-1 min-w-0 relative flex items-center">
            <Search className="h-5 w-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cargo, área ou palavra-chave" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex-1 min-w-0 relative flex items-center">
            <MapPin className="h-5 w-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cidade ou estado" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          <button 
            type="submit" 
            id="btn-buscar-vagas"
            className="bg-[#0b1d33] hover:bg-slate-800 text-white font-medium text-sm px-8 py-3.5 rounded-xl transition-colors shrink-0"
          >
            Buscar Vagas
          </button>
        </form>
      </section>

      {/* Section: Uma plataforma, três públicos */}
      <section className="py-20 bg-white" id="tres-publicos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="font-display font-bold text-3xl text-slate-900 tracking-tight mb-4">
              Uma plataforma, três públicos
            </h3>
            <p className="text-slate-500 text-sm">
              Conectamos candidatos, empresas e a gestão de RH em um único sistema inteligente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100/50 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="p-3 bg-[#0b1d33] text-white inline-block rounded-xl mb-6 shadow-md shadow-slate-900/10">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-display font-semibold text-xl text-slate-900 mb-3">Banco de Talentos</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Cadastre seu currículo e seja encontrado por empresas em busca de profissionais qualificados.
                </p>
              </div>
              <button 
                onClick={() => setIsCvModalOpen(true)}
                className="text-amber-600 hover:text-amber-700 font-semibold text-sm inline-flex items-center space-x-1 hover:underline"
              >
                <span>Saiba mais</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100/50 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="p-3 bg-[#0b1d33] text-white inline-block rounded-xl mb-6 shadow-md shadow-slate-900/10">
                  <Building2 className="h-6 w-6" />
                </div>
                <h4 className="font-display font-semibold text-xl text-slate-900 mb-3">Para Empresas</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Acesse um banco de candidatos qualificados e encontre o profissional ideal para sua empresa.
                </p>
              </div>
              <a 
                href="#planos" 
                className="text-amber-600 hover:text-amber-700 font-semibold text-sm inline-flex items-center space-x-1 hover:underline"
              >
                <span>Saiba mais</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100/50 hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="p-3 bg-[#0b1d33] text-white inline-block rounded-xl mb-6 shadow-md shadow-slate-900/10">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="font-display font-semibold text-xl text-slate-900 mb-3">Vagas Disponíveis</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Explore oportunidades de trabalho e candidate-se às vagas que combinam com seu perfil.
                </p>
              </div>
              <a 
                href="#vagas-disponiveis" 
                className="text-amber-600 hover:text-amber-700 font-semibold text-sm inline-flex items-center space-x-1 hover:underline"
              >
                <span>Saiba mais</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Como Funciona */}
      <section className="py-20 bg-slate-50 border-t border-slate-100" id="como-funciona">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="font-display font-bold text-3xl text-slate-900 tracking-tight mb-4">
              Como funciona
            </h3>
            <p className="text-slate-500 text-sm">
              Do cadastro à contratação, um processo simples e eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <p className="text-amber-500 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">PASSO 1</p>
              <h4 className="font-display font-semibold text-lg text-slate-900 mb-2">Cadastro</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Candidato cadastra currículo uma única vez no banco de talentos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <p className="text-amber-500 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">PASSO 2</p>
              <h4 className="font-display font-semibold text-lg text-slate-900 mb-2">Busca Inteligente</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Empresas encontram candidatos por cargo, área, cidade e competências.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <p className="text-amber-500 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">PASSO 3</p>
              <h4 className="font-display font-semibold text-lg text-slate-900 mb-2">Convite</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Empresa envia convite para entrevista e inicia o processo seletivo integrado.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <p className="text-amber-500 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">PASSO 4</p>
              <h4 className="font-display font-semibold text-lg text-slate-900 mb-2">Contratação</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Candidato é avaliado, aprovado e contratado de forma rápida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Job Listings Section */}
      <section className="py-20 bg-white" id="vagas-disponiveis">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-amber-600 text-xs font-mono font-bold uppercase tracking-wider block mb-2">NOSSAS OPORTUNIDADES</span>
              <h3 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                Vagas em Destaque
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-500">
              <span>Mostrando <span className="font-semibold text-slate-800">{filteredJobs.length}</span> vagas ativas {keyword || location ? 'para a busca' : ''}</span>
              <button 
                onClick={() => { setActivePage('vagas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="bg-[#0b1d33] hover:bg-amber-500 hover:text-[#0b1d33] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Ver Catálogo Completo de Vagas ({allActiveJobs.length})
              </button>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center max-w-xl mx-auto">
              <Search className="h-8 w-8 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-700 font-semibold mb-2">Nenhuma vaga encontrada</p>
              <p className="text-slate-500 text-xs">
                Não encontramos vagas que correspondam à sua busca por "{keyword}" {location ? `em ${location}` : ''}. Tente outros termos ou limpe o filtro.
              </p>
              <button 
                onClick={() => { setKeyword(''); setLocation(''); }}
                className="mt-4 text-xs font-semibold bg-[#0b1d33] text-white px-4 py-2 rounded-xl"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-[#0b1d33]/5 text-[#0b1d33] font-semibold text-xs px-3 py-1.5 rounded-full">
                        {job.department}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {job.createdAt}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-xl text-slate-950 mb-2 leading-tight">
                      {job.title}
                    </h4>

                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{job.location}</span>
                      </span>
                      <span className="bg-amber-500/15 text-amber-800 font-medium px-2 py-0.5 rounded text-[11px]">
                        {job.workModel}
                      </span>
                      <span className="bg-slate-200 text-slate-800 font-medium px-2 py-0.5 rounded text-[11px]">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-6">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                    <span className="text-slate-900 font-semibold text-sm font-mono">
                      {job.salaryRange}
                    </span>
                    <button
                      onClick={() => { setSelectedJob(job); setApplyJobFormOpen(false); }}
                      className="bg-[#0b1d33] hover:bg-amber-500 hover:text-[#0b1d33] text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section: Planos para Empresas */}
      <section className="py-20 bg-slate-50 border-t border-slate-100" id="planos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="font-display font-bold text-3xl text-slate-900 tracking-tight mb-4">
              Planos para Empresas
            </h3>
            <p className="text-slate-500 text-sm">
              Escolha o plano ideal para o tamanho da sua empresa e suas necessidades de recrutamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1 - Básico */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h4 className="font-display font-bold text-2xl text-slate-900 mb-1">Básico</h4>
                <p className="text-amber-600 text-sm font-semibold mb-6">Sob consulta</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Publicação de vagas</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Triagem de candidatos</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Painel da empresa</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => { setSelectedPlan('Básico'); setIsContactModalOpen(true); }}
                className="w-full bg-[#0b1d33] hover:bg-slate-800 text-white font-medium text-sm py-3.5 rounded-xl transition-colors text-center"
              >
                Falar com Consultor
              </button>
            </div>

            {/* Plan 2 - Profissional (Popular) */}
            <div className="bg-white rounded-2xl p-8 border-2 border-amber-500 relative flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-[#0b1d33] font-mono text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                MAIS POPULAR
              </div>

              <div className="pt-2">
                <h4 className="font-display font-bold text-2xl text-slate-900 mb-1">Profissional</h4>
                <p className="text-amber-600 text-sm font-semibold mb-6">Sob consulta</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Tudo do Básico</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Acesso ao Banco de Talentos</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Filtros avançados de candidatos</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Salvar favoritos</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => { setSelectedPlan('Profissional'); setIsContactModalOpen(true); }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-semibold text-sm py-3.5 rounded-xl transition-colors text-center shadow-lg shadow-amber-500/10"
              >
                Falar com Consultor
              </button>
            </div>

            {/* Plan 3 - Premium */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h4 className="font-display font-bold text-2xl text-slate-900 mb-1">Premium</h4>
                <p className="text-amber-600 text-sm font-semibold mb-6">Sob consulta</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Tudo do Profissional</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Banco de Talentos completo</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Recrutamento pela Rafaela Lourenço RH</span>
                  </li>
                  <li className="flex items-start space-x-3 text-slate-600 text-sm">
                    <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Serviços de RH e DP</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => { setSelectedPlan('Premium'); setIsContactModalOpen(true); }}
                className="w-full bg-[#0b1d33] hover:bg-slate-800 text-white font-medium text-sm py-3.5 rounded-xl transition-colors text-center"
              >
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Section */}
      <section className="bg-[#0b1d33] text-white py-16 border-t border-white/5" id="seguro-lgpd">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-5">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h5 className="font-display font-semibold text-lg text-white mb-2">Seguro e LGPD</h5>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                Proteção de dados e total conformidade com a Lei Geral de Proteção de Dados (LGPD) em todas as etapas de contratação.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-5">
                <Award className="h-8 w-8" />
              </div>
              <h5 className="font-display font-semibold text-lg text-white mb-2">Profissional e Moderno</h5>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                Plataforma corporativa de alto padrão tecnológico para impulsionar seu recrutamento e a excelência da gestão de pessoas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-5">
                <Database className="h-8 w-8" />
              </div>
              <h5 className="font-display font-semibold text-lg text-white mb-2">Tudo em um só lugar</h5>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                Integração completa: Banco de talentos nacional, controle de vagas ativas, recrutamento inteligente e departamento pessoal ágil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="bg-slate-950 text-gray-400 py-12 border-t border-slate-900" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-amber-500 rounded-lg text-slate-950 flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="font-display font-bold text-base tracking-wider text-white">RAFAELA LOURENÇO RH</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-6">
                Conectando profissionais brilhantes a corporações excepcionais. Soluções completas de atração de talentos e modernização de RH.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-amber-500 text-slate-500 transition-colors"><Mail className="h-5 w-5" /></a>
                <a href="#" className="hover:text-amber-500 text-slate-500 transition-colors"><Phone className="h-5 w-5" /></a>
              </div>
            </div>

            <div>
              <h6 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-4">Links Úteis</h6>
              <ul className="space-y-2 text-xs">
                <li><a href="#vagas-disponiveis" className="hover:text-white transition-colors">Vagas Abertas</a></li>
                <li><a href="#tres-publicos" className="hover:text-white transition-colors">Cadastrar Currículo</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Preços para Empresas</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              </ul>
            </div>

            <div>
              <h6 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-4">Contato & Suporte</h6>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Fones: (11) 3456-7890 / (11) 98765-4321</li>
                <li>Email: contato@rafaelalourenco.com.br</li>
                <li>Endereço: Av. Paulista, 1000, Bela Vista, São Paulo/SP</li>
                <li className="pt-2">
                  <button 
                    onClick={onNavigateToDashboard}
                    className="text-amber-500 hover:underline font-semibold"
                  >
                    Acesso Administrador &raquo;
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 text-center flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs text-slate-600">
            <p>&copy; 2026 Rafaela Lourenço RH. Todos os direitos reservados. GestRH v1.0.0</p>
            <p>Conformidade de LGPD auditada e criptografada.</p>
          </div>
        </div>
      </footer>
    </>
  )}

      {/* --- MODALS --- */}

      {/* 1. Cadastrar Currículo Modal */}
      {isCvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0b1d33] text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg">Cadastro no Banco de Talentos</h3>
                <p className="text-amber-400 font-mono text-[10px] tracking-widest mt-0.5 uppercase">Insira seu currículo</p>
              </div>
              <button 
                onClick={() => setIsCvModalOpen(false)}
                className="text-slate-400 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCvSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail corporativo ou pessoal *</label>
                  <input 
                    type="email" 
                    required
                    value={cvEmail}
                    onChange={(e) => setCvEmail(e.target.value)}
                    placeholder="Ex: joao@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Celular / WhatsApp *</label>
                  <input 
                    type="tel" 
                    required
                    value={cvPhone}
                    onChange={(e) => setCvPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Área de Atuação principal *</label>
                  <select 
                    value={cvArea}
                    onChange={(e) => setCvArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="TI">TI / Tecnologia</option>
                    <option value="Comercial">Comercial / Vendas</option>
                    <option value="Financeiro">Financeiro / Contas</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Logística">Logística / Operacional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade *</label>
                  <input 
                    type="text" 
                    required
                    value={cvCity}
                    onChange={(e) => setCvCity(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF) *</label>
                  <input 
                    type="text" 
                    required
                    maxLength={2}
                    value={cvState}
                    onChange={(e) => setCvState(e.target.value)}
                    placeholder="Ex: SP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resumo das principais competências / experiências</label>
                <textarea 
                  rows={3}
                  value={cvExperience}
                  onChange={(e) => setCvExperience(e.target.value)}
                  placeholder="Escreva um breve resumo da sua jornada profissional e principais habilidades..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              {/* Upload CV Box */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  id="cv-file-upload" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCvFileSelected(file.name);
                    }
                  }}
                />
                <label htmlFor="cv-file-upload" className="cursor-pointer block">
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    {cvFileSelected ? `✓ Selecionado: ${cvFileSelected}` : 'Clique para enviar seu currículo (PDF, Word)'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Limite: 5MB</p>
                </label>
              </div>

              {/* LGPD compliance check */}
              <div className="flex items-start space-x-2 bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg">
                <input type="checkbox" required id="lgpd-agree" className="mt-0.5 rounded text-amber-500" />
                <label htmlFor="lgpd-agree" className="text-[10px] text-slate-600 leading-normal">
                  Autorizo o tratamento de meus dados pessoais para cadastro no banco de talentos corporativo e processos de contratação, nos termos da Lei nº 13.709 (LGPD).
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCvModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  id="btn-confirmar-cadastro-cv"
                  className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Plan Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0b1d33] text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-lg">Solicitar plano {selectedPlan}</h3>
                <p className="text-amber-400 font-mono text-[10px] tracking-widest mt-0.5 uppercase">Contato Comercial</p>
              </div>
              <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome *</label>
                <input 
                  type="text" 
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nome do solicitante"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Empresa *</label>
                <input 
                  type="text" 
                  required
                  value={contactCompany}
                  onChange={(e) => setContactCompany(e.target.value)}
                  placeholder="Ex: Minha Empresa S/A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Corporativo *</label>
                <input 
                  type="email" 
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Ex: contato@empresa.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Comercial *</label>
                <input 
                  type="tel" 
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ex: (11) 3456-7890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mensagem Adicional</label>
                <textarea 
                  rows={2}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Conte-nos brevemente o tamanho do seu time e o que busca..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsContactModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs px-4 py-2.5 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg"
                >
                  Solicitar Demonstração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Job Details / Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#0b1d33] text-white p-6 flex justify-between items-center">
              <div>
                <span className="bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider block mb-1.5 w-max">
                  {selectedJob.department}
                </span>
                <h3 className="font-display font-bold text-xl leading-tight">{selectedJob.title}</h3>
                <div className="flex flex-wrap gap-x-4 text-xs text-gray-300 mt-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{selectedJob.location}</span>
                  </span>
                  <span>|</span>
                  <span>{selectedJob.workModel} ({selectedJob.type})</span>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedJob(null); setApplyJobFormOpen(false); }} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/15"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content view toggle (Details vs Apply Form) */}
            {!applyJobFormOpen ? (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 mb-2">Descrição da Vaga</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 mb-2">Requisitos Necessários</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-600 text-xs">
                        <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">FAIXA SALARIAL</span>
                    <span className="text-slate-900 font-bold font-mono text-base">{selectedJob.salaryRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold text-right">MODELO DE CONTRATO</span>
                    <span className="text-slate-800 font-semibold text-xs text-right block">{selectedJob.type} - {selectedJob.workModel}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs px-4 py-2.5 rounded-xl"
                  >
                    Fechar
                  </button>
                  <button 
                    onClick={() => setApplyJobFormOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/10"
                  >
                    Candidatar-se para Vaga
                  </button>
                </div>
              </div>
            ) : (
              // Apply Form
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-slate-800 text-xs flex items-start space-x-2 mb-2">
                  <UserPlus className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Você está se candidatando para <strong>{selectedJob.title}</strong>. Preencha seus dados para envio direto ao RH.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      required
                      value={applyName}
                      onChange={(e) => setApplyName(e.target.value)}
                      placeholder="Ex: Mariana Silva"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail *</label>
                    <input 
                      type="email" 
                      required
                      value={applyEmail}
                      onChange={(e) => setApplyEmail(e.target.value)}
                      placeholder="Ex: mariana@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Celular / WhatsApp *</label>
                    <input 
                      type="tel" 
                      required
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value)}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade *</label>
                      <input 
                        type="text" 
                        required
                        value={applyCity}
                        onChange={(e) => setApplyCity(e.target.value)}
                        placeholder="Cidade"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Estado *</label>
                      <input 
                        type="text" 
                        required
                        maxLength={2}
                        value={applyState}
                        onChange={(e) => setApplyState(e.target.value)}
                        placeholder="UF"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resuma suas experiências nesta área</label>
                  <textarea 
                    rows={3}
                    value={applyExperience}
                    onChange={(e) => setApplyExperience(e.target.value)}
                    placeholder="Quais ferramentas e experiências você possui que se alinham aos requisitos?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>

                {/* Upload cv simulation */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <input 
                    type="file" 
                    id="apply-file-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setApplyFileSelected(file.name);
                      }
                    }}
                  />
                  <label htmlFor="apply-file-upload" className="cursor-pointer block">
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      {applyFileSelected ? `✓ Selecionado: ${applyFileSelected}` : 'Clique para anexar seu CV / Portfólio'}
                    </p>
                  </label>
                </div>

                <div className="flex items-start space-x-2 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                  <input type="checkbox" required id="lgpd-apply-agree" className="mt-0.5 rounded text-amber-500" />
                  <label htmlFor="lgpd-apply-agree" className="text-[9px] text-slate-600 leading-normal">
                    Autorizo o compartilhamento seguro de meus dados com o departamento de recrutamento desta oportunidade, nos termos da LGPD.
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setApplyJobFormOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs px-4 py-2.5 rounded-xl"
                  >
                    Voltar aos Detalhes
                  </button>
                  <button 
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-[#0b1d33] font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg"
                  >
                    Enviar Candidatura
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Job details & application modals remain accessible in both home and vagas views */}
    </div>
  );
}
