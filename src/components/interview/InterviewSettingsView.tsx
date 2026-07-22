import React, { useState } from 'react';
import { Settings, Save, Sparkles, Sliders, ShieldCheck, Database, Lock } from 'lucide-react';

export default function InterviewSettingsView() {
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [passingScore, setPassingScore] = useState('7.5');
  const [aiPromptStyle, setAiPromptStyle] = useState('Rigoroso e Focado em Evidências');
  const [defaultDuration, setDefaultDuration] = useState('45');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest font-mono mb-1">
            <Settings className="h-4 w-4" />
            <span>Parâmetros do Sistema</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Configurações da Entrevista IA</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ajuste os parâmetros de avaliação de competências, prompts e armazenamento</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs font-medium">
        
        {/* Section 1: AI Prompt & Scoring */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Comportamento da Inteligência Artificial</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tom de Avaliação da IA</label>
              <select
                value={aiPromptStyle}
                onChange={(e) => setAiPromptStyle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Rigoroso e Focado em Evidências">Rigoroso e Focado em Evidências</option>
                <option value="Equilibrado e Construtivo">Equilibrado e Construtivo</option>
                <option value="Foco em Fit Cultural">Foco em Fit Cultural e Soft Skills</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Nota Mínima Recomendada para Aprovação</label>
              <input
                type="number"
                step="0.1"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-800 text-xs">Transcrição Automática ao Encerrar Gravação</p>
              <p className="text-[11px] text-slate-500">Transcrever o áudio do microfone usando speech-to-text imediatamente ao término da sessão</p>
            </div>
            <input
              type="checkbox"
              checked={autoTranscribe}
              onChange={(e) => setAutoTranscribe(e.target.checked)}
              className="h-5 w-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: Future Firebase Architecture Notice */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0b1d33] text-white rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Database className="h-4 w-4" />
            <span className="uppercase tracking-wider font-mono text-[11px]">Arquitetura de Dados Pronta para Firebase</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Este módulo foi projetado em camada assíncrona desacoplada (<code className="text-amber-300 font-mono">InterviewService</code>). No ambiente atual de desenvolvimento, os dados são persistidos no <code className="text-amber-300 font-mono">localStorage</code> do navegador. Toda a estrutura de coleções e schemas está pronta para migração transparente para o <strong>Firebase Firestore</strong> e <strong>Firebase Storage</strong> quando solicitado.
          </p>
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-emerald-600 font-bold text-xs">✔ Configurações salvas com sucesso!</span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

      </form>

    </div>
  );
}
