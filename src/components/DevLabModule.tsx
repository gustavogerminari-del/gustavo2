/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Layers, 
  FileCode, 
  GitBranch, 
  Play, 
  Send, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  Server,
  Zap,
  Info
} from 'lucide-react';

interface DevFeature {
  id: string;
  name: string;
  description: string;
  category: 'UX/UI' | 'Funcionalidade' | 'Módulo IA' | 'Infraestrutura';
  status: 'Em Teste' | 'Homologado' | 'Aprovado' | 'Publicado';
  progress: number;
  flagKey: string;
  isEnabled: boolean;
  author: string;
  updatedAt: string;
}

interface ReleaseVersion {
  id: string;
  version: string;
  releaseName: string;
  status: 'Draft' | 'Em Teste' | 'Aprovado' | 'Publicado';
  changes: string[];
  date: string;
}

export default function DevLabModule() {
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Feature Flags & Improvements under test state
  const [features, setFeatures] = useState<DevFeature[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_dev_features');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading dev features', err);
    }
    return [
      {
        id: 'feat-1',
        name: 'Kanban ATS com Colunas Customizáveis e Dica de Uso',
        description: 'Permite criar, editar, reordenar, alterar temas de cores e definir gatilhos para cada etapa do recrutamento.',
        category: 'UX/UI',
        status: 'Homologado',
        progress: 100,
        flagKey: 'kanban_custom_columns',
        isEnabled: true,
        author: 'Equipe de Dev Master',
        updatedAt: '2026-07-22'
      },
      {
        id: 'feat-2',
        name: 'Painel Lateral de Candidato sem Sair da Tela (7 Abas)',
        description: 'Garante acesso imediato ao currículo, resumo, score de IA, anotações e documentos sem perder o contexto do Kanban.',
        category: 'UX/UI',
        status: 'Homologado',
        progress: 100,
        flagKey: 'candidate_side_drawer',
        isEnabled: true,
        author: 'UX Product Designer',
        updatedAt: '2026-07-22'
      },
      {
        id: 'feat-3',
        name: 'Motor de Entrevistas On-line com Assistente IA',
        description: 'Sala virtual interativa para entrevistas com transcrição e scoring de aptidão profissional.',
        category: 'Módulo IA',
        status: 'Homologado',
        progress: 95,
        flagKey: 'ai_smart_interviews',
        isEnabled: true,
        author: 'IA Engineer',
        updatedAt: '2026-07-21'
      },
      {
        id: 'feat-4',
        name: 'Consultor de RH Multi-Tenant (B2B SaaS)',
        description: 'Painel completo para consultorias gerenciarem múltiplos clientes, vagas e pipeline financeiro de contratações.',
        category: 'Funcionalidade',
        status: 'Aprovado',
        progress: 100,
        flagKey: 'consultor_rh_multitenant',
        isEnabled: true,
        author: 'SaaS Architect',
        updatedAt: '2026-07-20'
      }
    ];
  });

  // Release versions state
  const [releases, setReleases] = useState<ReleaseVersion[]>(() => {
    try {
      const saved = localStorage.getItem('gestrh_dev_releases');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading dev releases', err);
    }
    return [
      {
        id: 'rel-2.5.0',
        version: 'v2.5.0-SaaS',
        releaseName: 'Release de Reorganização e UX Premium ATS',
        status: 'Em Teste',
        changes: [
          'Reorganização do Menu Principal do RH em categorias intuitivas e sem poluição',
          'Novo Pipeline Kanban com Gestão Flexível de Colunas e regras por etapa',
          'Painel Lateral do Candidato com 7 Abas integradas (Resumo, Triagem IA, Entrevistas, etc.)',
          'Laboratório de Desenvolvimento exclusivo para Administrador Master'
        ],
        date: '2026-07-22'
      },
      {
        id: 'rel-2.4.0',
        version: 'v2.4.0-SaaS',
        releaseName: 'Módulo de Entrevistas Inteligentes com IA Gemini',
        status: 'Publicado',
        changes: [
          'Agendamento automático de entrevistas via e-mail e sala virtual',
          'Gerador de relatórios executivos de perfil comportamental por IA'
        ],
        date: '2026-07-15'
      }
    ];
  });

  // Active Tab in Dev Lab
  const [labTab, setLabTab] = useState<'features' | 'releases' | 'sandbox' | 'flags'>('features');

  // New Version Release Modal Form
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [newVersion, setNewVersion] = useState('v2.5.1-SaaS');
  const [newReleaseName, setNewReleaseName] = useState('');
  const [newChangesText, setNewChangesText] = useState('');

  // Save State
  const saveFeatures = (updated: DevFeature[]) => {
    setFeatures(updated);
    try {
      localStorage.setItem('gestrh_dev_features', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving dev features', e);
    }
  };

  const saveReleases = (updated: ReleaseVersion[]) => {
    setReleases(updated);
    try {
      localStorage.setItem('gestrh_dev_releases', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving dev releases', e);
    }
  };

  // Toggle Feature Flag
  const handleToggleFlag = (id: string) => {
    const updated = features.map(f => f.id === id ? { ...f, isEnabled: !f.isEnabled } : f);
    saveFeatures(updated);
    const feat = features.find(f => f.id === id);
    triggerToast(`✓ Feature Flag "${feat?.name}" ${!feat?.isEnabled ? 'ativada' : 'desativada'}.`);
  };

  // Add Release Log
  const handleCreateRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion || !newReleaseName) {
      triggerToast('⚠️ Preencha os campos obrigatórios da nova versão.');
      return;
    }

    const changesList = newChangesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const rel: ReleaseVersion = {
      id: `rel-${Date.now()}`,
      version: newVersion,
      releaseName: newReleaseName,
      status: 'Em Teste',
      changes: changesList.length > 0 ? changesList : ['Melhorias de desempenho e estabilidade'],
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [rel, ...releases];
    saveReleases(updated);
    setIsReleaseModalOpen(false);
    setNewReleaseName('');
    setNewChangesText('');
    triggerToast(`✓ Registro de versão ${newVersion} adicionado com sucesso!`);
  };

  // Approve Release for Production
  const handleApproveRelease = (releaseId: string) => {
    const updated = releases.map(r => r.id === releaseId ? { ...r, status: 'Publicado' as const } : r);
    saveReleases(updated);
    const rel = releases.find(r => r.id === releaseId);
    triggerToast(`🚀 Versão "${rel?.version} - ${rel?.releaseName}" APROVADA E PUBLICADA EM PRODUÇÃO!`);
  };

  // Launch Homologation Sandbox
  const handleLaunchSandboxMode = (role: string) => {
    triggerToast(`🔄 Ambiente de Homologação iniciado com perfil [${role}]. Dados de teste carregados.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notifier */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3.5 bg-slate-900 border border-amber-500/50 text-amber-300 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce text-xs font-bold">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider">
                EXCLUSIVO MASTER
              </span>
              <span className="text-xs text-amber-300 font-mono">v2.5.0-SaaS Homologation</span>
            </div>
            <h2 className="text-2xl font-black font-display text-white flex items-center space-x-2">
              <FlaskConical className="h-6 w-6 text-amber-400" />
              <span>🛠 Laboratório de Desenvolvimento</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Ambiente restrito do Administrador Master para testes de interface, controle de versões, simulação de homologação e aprovação de novas atualizações do SaaS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReleaseModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center space-x-2 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Nova Versão</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
          {[
            { id: 'features', label: 'Melhorias em Teste', icon: Sparkles, badge: features.length },
            { id: 'releases', label: 'Controle de Versões & Changelog', icon: GitBranch, badge: releases.length },
            { id: 'flags', label: 'Feature Flags & Interfaces', icon: Sliders, badge: features.filter(f => f.isEnabled).length },
            { id: 'sandbox', label: 'Ambiente de Homologação', icon: Server, badge: 'Ativo' }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = labTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLabTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                <IconComp className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono ${isActive ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-900 text-slate-400'}`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MELHORIAS EM TESTE */}
      {labTab === 'features' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-white">Visualizador de Recursos Sob Teste</h3>
              <p className="text-xs text-slate-400">Acompanhe o progresso de desenvolvimento e validação das novas interfaces.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              {features.filter(f => f.status === 'Homologado' || f.status === 'Aprovado').length} de {features.length} PRONTOS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(feat => (
              <div key={feat.id} className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700">
                      {feat.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-white">{feat.name}</h4>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    feat.status === 'Aprovado' || feat.status === 'Homologado'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {feat.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {feat.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Validação & Teste UX:</span>
                    <span className="text-amber-400">{feat.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all" style={{ width: `${feat.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span className="font-mono">Chave: <code className="text-amber-300">{feat.flagKey}</code></span>
                  
                  <button
                    onClick={() => handleToggleFlag(feat.id)}
                    className={`px-3 py-1 rounded-xl font-extrabold text-[10px] transition-all cursor-pointer flex items-center space-x-1 ${
                      feat.isEnabled 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    <Sliders className="h-3 w-3" />
                    <span>{feat.isEnabled ? 'Interface Ativa' : 'Interface Desativada'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTROLE DE VERSÕES & CHANGELOG */}
      {labTab === 'releases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-white">Histórico de Releases & Changelog do RH SaaS</h3>
              <p className="text-xs text-slate-400">Registro oficial de versões liberadas e alterações no sistema.</p>
            </div>
            <button
              onClick={() => setIsReleaseModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Versão</span>
            </button>
          </div>

          <div className="space-y-4">
            {releases.map(rel => (
              <div key={rel.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl font-mono">
                      {rel.version}
                    </span>
                    <div>
                      <h4 className="font-black text-base text-white">{rel.releaseName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Data do Registro: {rel.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                      rel.status === 'Publicado' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rel.status === 'Publicado' ? '🚀 Publicado em Produção' : '🧪 Em Homologação'}
                    </span>

                    {rel.status !== 'Publicado' && (
                      <button
                        onClick={() => handleApproveRelease(rel.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Aprovar Publicação</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-amber-400 flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Registro Oficial de Alterações (Changelog):</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                    {rel.changes.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE FLAGS & CHAVES DE INTERFACE */}
      {labTab === 'flags' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-white">Alternador Dinâmico de Interfaces (Feature Flags)</h3>
            <p className="text-xs text-slate-400">
              Ligue e desligue novas componentes e módulos em tempo real sem interrupções de serviço.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(feat => (
              <div key={feat.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-xs text-white">{feat.name}</h4>
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {feat.flagKey}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{feat.description}</p>
                </div>

                <button
                  onClick={() => handleToggleFlag(feat.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    feat.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform ${
                    feat.isEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AMBIENTE DE HOMOLOGAÇÃO */}
      {labTab === 'sandbox' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
              <Server className="h-5 w-5 text-amber-400" />
              <span>Ambiente Isolado de Homologação (Sandbox RH)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Simule a experiência do sistema como diferentes perfis de usuário ou em uma empresa de testes sem afetar o banco de produção.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { role: 'Administrador RH', desc: 'Acesso total às rotinas de DP e recrutamento', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
              { role: 'Gestor / Coordenador', desc: 'Aprovação de folha, horas extras e equipes', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
              { role: 'Funcionário', desc: 'Espelho de ponto, holerites e requerimentos', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
              { role: 'Consultor de RH', desc: 'Visão multi-tenant de clientes e pipeline B2B', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' }
            ].map(item => (
              <div key={item.role} className={`p-4 rounded-2xl border ${item.color} space-y-2 flex flex-col justify-between`}>
                <div>
                  <h4 className="font-extrabold text-xs text-white">{item.role}</h4>
                  <p className="text-[10px] text-slate-300 mt-1">{item.desc}</p>
                </div>

                <button
                  onClick={() => handleLaunchSandboxMode(item.role)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-1 mt-3"
                >
                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                  <span>Simular Perfil</span>
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-extrabold text-xs text-white">Redefinir Dados do Sandbox</span>
              <p className="text-[11px] text-slate-400">Restaura os dados demonstrativos para os padrões originais de fábrica.</p>
            </div>

            <button
              onClick={() => triggerToast('✓ Sandbox redefinido com sucesso com massa de dados oficial.')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restaurar Sandbox</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NOVA VERSÃO */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-800 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-amber-400" />
                <span>Registrar Nova Versão (Changelog)</span>
              </h3>
              <button onClick={() => setIsReleaseModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tag da Versão (SemVer) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: v2.5.1-SaaS"
                  value={newVersion}
                  onChange={e => setNewVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Título da Release / Release Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atualizações no Módulo de Ponto e Correção de Holerites"
                  value={newReleaseName}
                  onChange={e => setNewReleaseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Lista de Alterações (1 item por linha)</label>
                <textarea
                  rows={4}
                  placeholder="Reorganização de menus da sidebar&#10;Melhoria na velocidade do Kanban&#10;Nova aba de documentos do funcionário"
                  value={newChangesText}
                  onChange={e => setNewChangesText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-md"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
