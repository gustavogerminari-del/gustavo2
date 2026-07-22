import React from 'react';
import { X, ExternalLink, QrCode, Sparkles, Eye, Share2, Copy, Check } from 'lucide-react';
import { Job } from '../types';
import PublicJobPage from './PublicJobPage';
import { getPublicJobUrl } from './publicJobUtils';

interface PublicJobPreviewModalProps {
  job: Partial<Job>;
  isOpen: boolean;
  onClose: () => void;
}

export default function PublicJobPreviewModal({ job, isOpen, onClose }: PublicJobPreviewModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const mockJob: Job = {
    id: job.id || 'preview-job-1',
    title: job.title || 'Título da Vaga Exemplo',
    department: job.department || 'TI',
    location: job.location || 'São Paulo - SP',
    type: job.type || 'CLT',
    workModel: job.workModel || 'Híbrido',
    salaryRange: job.salaryRange || 'R$ 8.000,00',
    description: job.description || 'Descrição detalhada da vaga em tempo real...',
    requirements: job.requirements && job.requirements.length > 0 ? job.requirements : ['Requisito Exemplo 1', 'Requisito Exemplo 2'],
    active: true,
    createdAt: job.createdAt || new Date().toISOString().split('T')[0],
    companyName: job.companyName || 'TECHCORP INOVAÇÕES',
    companyLogo: job.companyLogo,
    bannerUrl: job.bannerUrl,
    city: job.city || 'São Paulo',
    state: job.state || 'SP',
    responsibilities: job.responsibilities,
    differentials: job.differentials,
    benefits: job.benefits,
    workHours: job.workHours || '44h semanais, Seg a Sex',
    vacanciesCount: job.vacanciesCount || 1,
    prazo: job.prazo || '2026-08-30',
    slug: job.slug,
    seoTitle: job.seoTitle,
    seoDescription: job.seoDescription,
    seoKeywords: job.seoKeywords
  };

  const publicUrl = getPublicJobUrl(mockJob);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-2 sm:p-6 animate-in fade-in">
      
      {/* Top Bar for Preview Controls */}
      <div className="bg-slate-900 text-white w-full max-w-7xl rounded-t-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center space-x-1">
            <Eye className="h-3.5 w-3.5" />
            <span>Pré-Visualização em Tempo Real</span>
          </span>
          <span className="text-xs text-slate-300 hidden md:inline truncate max-w-md">
            Link público: <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono text-[11px]">{publicUrl}</code>
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Abrir Aba Exclusiva</span>
          </a>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-xl transition-all cursor-pointer"
            title="Fechar Pré-visualização"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Render Full Page inside Modal Frame */}
      <div className="w-full max-w-7xl bg-slate-100 rounded-b-2xl overflow-y-auto flex-1 border-x border-b border-slate-800 shadow-2xl">
        <PublicJobPage job={mockJob} />
      </div>

    </div>
  );
}
