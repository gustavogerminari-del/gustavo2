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
  ExternalLink
} from 'lucide-react';
import { Candidate, Job } from '../types';

interface TalentBankModuleProps {
  candidates: Candidate[];
  jobs: Job[];
  onUpdateCandidates: (candidates: Candidate[]) => void;
  triggerToast: (msg: string) => void;
}

export default function TalentBankModule({
  candidates,
  jobs,
  onUpdateCandidates,
  triggerToast
}: TalentBankModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todos');
  const [selectedEdu, setSelectedEdu] = useState('Todos');

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

  const educations = useMemo(() => {
    const list = new Set<string>();
    candidates.forEach(c => { if (c.experience) {
      // General categories or fallback
    }});
    return ['Todos', 'Ensino Médio', 'Ensino Superior Incompleto', 'Ensino Superior Completo', 'Pós-graduação / MBA'];
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = !searchTerm || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.resumeText && c.resumeText.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesArea = selectedArea === 'Todos' || c.area === selectedArea;
      const matchesCity = selectedCity === 'Todos' || c.city === selectedCity;
      
      return matchesSearch && matchesArea && matchesCity;
    });
  }, [candidates, searchTerm, selectedArea, selectedCity]);

  return (
    <div className="space-y-6" id="banco-talentos-tab-content">
      
      {/* Filter and Search Bar Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar currículos por nome, palavras-chave ou experiências..."
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
          filteredCandidates.map((cand) => (
            <div 
              key={cand.id}
              className="bg-white border border-slate-100 hover:border-emerald-100 p-6 rounded-2xl shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
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
                      <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-1.5 inline-block font-mono">
                        {cand.area || 'Geral'}
                      </span>
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
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono">Cadastrado em {cand.createdAt}</span>
                <div className="flex space-x-2">
                  {cand.resumeUrl && (
                    <a 
                      href={cand.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all inline-flex items-center space-x-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Visualizar PDF</span>
                    </a>
                  )}
                  <button 
                    onClick={() => {
                      triggerToast(`✓ Contato enviado para o candidato ${cand.name}!`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Iniciar Processo</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center col-span-full h-80 flex flex-col justify-center items-center">
            <Users className="h-8 w-8 text-slate-300 mb-2" />
            <h4 className="font-display font-bold text-sm text-slate-700">Nenhum candidato encontrado</h4>
            <p className="text-slate-400 text-xs mt-1">Experimente remover os termos de busca ou mudar os filtros de localidade.</p>
          </div>
        )}
      </div>

    </div>
  );
}
