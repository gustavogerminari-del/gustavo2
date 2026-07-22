import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Mail, 
  FileText,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Link,
  X,
  FileSignature,
  CheckCircle2
} from 'lucide-react';
import { Candidate, Job, OnboardingContract } from '../types';

interface TalentBankModuleProps {
  candidates: Candidate[];
  jobs: Job[];
  contracts?: OnboardingContract[];
  onUpdateCandidates: (candidates: Candidate[]) => void;
  onUpdateContracts?: (contracts: OnboardingContract[]) => void;
  triggerToast: (msg: string) => void;
}

export default function TalentBankModule({
  candidates,
  jobs,
  contracts = [],
  onUpdateCandidates,
  onUpdateContracts,
  triggerToast
}: TalentBankModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todos');

  // Link Modal State
  const [linkingCandidate, setLinkingCandidate] = useState<Candidate | null>(null);
  const [selectedJobIdForLink, setSelectedJobIdForLink] = useState('');

  // Promote to Onboarding Modal State
  const [promotingCandidate, setPromotingCandidate] = useState<Candidate | null>(null);
  const [onboardingRole, setOnboardingRole] = useState('');
  const [onboardingDepartment, setOnboardingDepartment] = useState('');
  const [onboardingSalary, setOnboardingSalary] = useState('5000');
  const [onboardingType, setOnboardingType] = useState<'CLT' | 'Experiência' | 'PJ' | 'Estágio'>('CLT');

  // Unique lists for dropdowns
  const areas = useMemo(() => {
    const list = new Set<string>();
    candidates.forEach(c => { if (c.area) list.add(c.area); });
    return ['Todos', ...Array.from(list)];
  }, [candidates]);

  const cities = useMemo(() => {
    const list = new Set<string>();
    candidates.forEach(c => { if (c.city) list.add(c.city); });
    return ['Todos', ...Array.from(list)];
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = !searchTerm || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.resumeText && c.resumeText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesArea = selectedArea === 'Todos' || c.area === selectedArea;
      const matchesCity = selectedCity === 'Todos' || c.city === selectedCity;
      
      return matchesSearch && matchesArea && matchesCity;
    });
  }, [candidates, searchTerm, selectedArea, selectedCity]);

  // Handle Link Candidate to Job
  const handleConfirmLinkToJob = () => {
    if (!linkingCandidate) return;
    const targetJob = jobs.find(j => j.id === selectedJobIdForLink);
    
    const updatedCandidates = candidates.map(c => {
      if (c.id === linkingCandidate.id) {
        return {
          ...c,
          jobId: targetJob ? targetJob.id : undefined,
          jobTitle: targetJob ? targetJob.title : undefined,
          area: targetJob ? targetJob.department : c.area,
          status: targetJob ? ('Triagem' as const) : c.status
        };
      }
      return c;
    });

    onUpdateCandidates(updatedCandidates);
    if (targetJob) {
      triggerToast(`✓ Candidato ${linkingCandidate.name} vinculado à vaga "${targetJob.title}"!`);
    } else {
      triggerToast(`✓ Vinculação do candidato ${linkingCandidate.name} removida.`);
    }
    setLinkingCandidate(null);
  };

  // Handle Promote Candidate to Onboarding Contract
  const handleConfirmPromoteToOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingCandidate || !onUpdateContracts) return;

    const newContract: OnboardingContract = {
      id: `cnt-${Date.now()}`,
      employeeName: promotingCandidate.name,
      email: promotingCandidate.email,
      phone: promotingCandidate.phone,
      role: onboardingRole || promotingCandidate.jobTitle || 'Colaborador',
      department: onboardingDepartment || promotingCandidate.area || 'Operacional',
      type: onboardingType,
      startDate: new Date().toISOString().split('T')[0],
      salary: parseFloat(onboardingSalary) || 5000,
      status: 'Pendente',
      createdAt: new Date().toISOString().split('T')[0],
      checklistDocuments: [
        { id: 'doc-1', name: 'Documento de Identidade (RG/CPF)', status: 'Pendente' },
        { id: 'doc-2', name: 'Comprovante de Residência Atualizado', status: 'Pendente' },
        { id: 'doc-3', name: 'Carteira de Trabalho (CTPS Digital)', status: 'Pendente' },
        { id: 'doc-4', name: 'Atestado de Saúde Ocupacional (ASO Admissional)', status: 'Pendente' },
        { id: 'doc-5', name: 'Dados Bancários para Pagamento', status: 'Pendente' }
      ]
    };

    onUpdateContracts([newContract, ...contracts]);
    
    // Also update candidate status
    const updatedCandidates = candidates.map(c => {
      if (c.id === promotingCandidate.id) {
        return { ...c, status: 'Aprovado' as const };
      }
      return c;
    });
    onUpdateCandidates(updatedCandidates);

    triggerToast(`✓ ${promotingCandidate.name} promovido(a) com sucesso para o módulo de Admissão & Onboarding!`);
    setPromotingCandidate(null);
  };

  return (
    <div className="space-y-6" id="banco-talentos-tab-content">
      
      {/* Filter and Search Bar Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar currículos por nome, palavras-chave ou vaga vinculada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            {/* Area Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Área:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold focus:outline-none"
              >
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Cidade:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold focus:outline-none"
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Talent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((cand) => {
            const linkedJob = jobs.find(j => j.id === cand.jobId);
            const jobDisplayTitle = cand.jobTitle || linkedJob?.title;

            return (
              <div 
                key={cand.id}
                className="bg-white border border-slate-100 hover:border-emerald-200 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-extrabold text-sm border border-emerald-100/50">
                        {cand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-slate-900 leading-none">{cand.name}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                            {cand.area || 'Geral'}
                          </span>
                          
                          {/* Linked Job Badge */}
                          {jobDisplayTitle ? (
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <Briefcase className="h-2.5 w-2.5" />
                              <span>{jobDisplayTitle}</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-medium px-2 py-0.5 rounded-full">
                              Sem vaga vinculada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Compatibility Badge if present */}
                    {cand.aiScore !== undefined && (
                      <div className="bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-xl text-right">
                        <span className="text-[8px] font-bold block uppercase font-mono tracking-wider">AI Score</span>
                        <span className="text-xs font-extrabold">{cand.aiScore}% Match</span>
                      </div>
                    )}
                  </div>

                  {/* Candidate detailed sections */}
                  <div className="space-y-3 text-xs">
                    {/* Local info */}
                    <div className="flex items-center text-slate-500 space-x-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium">{cand.city} - {cand.state}</span>
                    </div>

                    {/* Professional summary */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Último Cargo / Experiência</span>
                      <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        {cand.experience || 'Nenhuma experiência cadastrada.'}
                      </p>
                    </div>

                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a 
                        href={`mailto:${cand.email}`}
                        className="flex items-center text-slate-500 hover:text-emerald-700 space-x-1.5 bg-slate-50/50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate text-[10px] font-semibold">{cand.email}</span>
                      </a>
                      <a 
                        href={`tel:${cand.phone}`}
                        className="flex items-center text-slate-500 hover:text-emerald-700 space-x-1.5 bg-slate-50/50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                      >
                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate text-[10px] font-semibold">{cand.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action buttons footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[9px] text-slate-400 font-mono">Cadastrado em {cand.createdAt}</span>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Button Link to Job */}
                    <button
                      onClick={() => {
                        setLinkingCandidate(cand);
                        setSelectedJobIdForLink(cand.jobId || '');
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-1.5 px-2.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                      title="Vincular a uma vaga aberta"
                    >
                      <Link className="h-3 w-3 shrink-0" />
                      <span>{jobDisplayTitle ? 'Alterar Vaga' : 'Vincular a Vaga'}</span>
                    </button>

                    {/* Button Promote to Onboarding */}
                    {onUpdateContracts && (
                      <button
                        onClick={() => {
                          setPromotingCandidate(cand);
                          setOnboardingRole(jobDisplayTitle || 'Colaborador');
                          setOnboardingDepartment(cand.area || 'Operacional');
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold py-1.5 px-2.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                        title="Promover diretamente para processo de contratação"
                      >
                        <FileSignature className="h-3 w-3 shrink-0" />
                        <span>Admissão</span>
                      </button>
                    )}

                    {cand.resumeUrl && (
                      <a 
                        href={cand.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-2.5 rounded-xl transition-all inline-flex items-center space-x-1"
                      >
                        <FileText className="h-3 w-3" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center col-span-full h-80 flex flex-col justify-center items-center">
            <Users className="h-8 w-8 text-slate-300 mb-2" />
            <h4 className="font-display font-bold text-sm text-slate-700">Nenhum candidato encontrado</h4>
            <p className="text-slate-400 text-xs mt-1">Experimente remover os termos de busca ou mudar os filtros de localidade.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: Vincular Candidato a Vaga */}
      {linkingCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm">Vincular Candidato a Vaga Seletiva</h3>
                <p className="text-blue-100 text-[10px] mt-0.5">{linkingCandidate.name}</p>
              </div>
              <button onClick={() => setLinkingCandidate(null)} className="text-blue-100 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione a Vaga de Destino *</label>
                <select
                  value={selectedJobIdForLink}
                  onChange={(e) => setSelectedJobIdForLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sem vaga (Manter somente no Banco Geral) --</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.department} - {j.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                Ao vincular, o candidato passará a aparecer diretamente no <strong>Módulo de Recrutamento & Seleção</strong> associado a essa vaga específica.
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setLinkingCandidate(null)} 
                  className="bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmLinkToJob} 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-xl"
                >
                  Confirmar Vinculação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Promover Candidato para Admissão/Onboarding */}
      {promotingCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
            <div className="bg-purple-700 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm">Iniciar Admissão & Pre-Contrato</h3>
                <p className="text-purple-100 text-[10px] mt-0.5">{promotingCandidate.name}</p>
              </div>
              <button onClick={() => setPromotingCandidate(null)} className="text-purple-100 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPromoteToOnboarding} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo Proposto *</label>
                <input 
                  type="text" 
                  required
                  value={onboardingRole}
                  onChange={(e) => setOnboardingRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento</label>
                  <input 
                    type="text" 
                    value={onboardingDepartment}
                    onChange={(e) => setOnboardingDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Contrato</label>
                  <select
                    value={onboardingType}
                    onChange={(e) => setOnboardingType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
                  >
                    <option value="CLT">CLT</option>
                    <option value="Experiência">Experiência</option>
                    <option value="PJ">PJ</option>
                    <option value="Estágio">Estágio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salário Acordado (R$) *</label>
                <input 
                  type="number" 
                  required
                  value={onboardingSalary}
                  onChange={(e) => setOnboardingSalary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
                Este processo gerará automaticamente a checklist de documentos e o pré-contrato no módulo de <strong>Contratação & Onboarding</strong>.
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setPromotingCandidate(null)} 
                  className="bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold px-5 py-2 rounded-xl"
                >
                  Efetivar Pré-Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
