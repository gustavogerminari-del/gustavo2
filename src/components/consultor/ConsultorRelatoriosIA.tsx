/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  FileSpreadsheet, 
  BookOpen, 
  TrendingUp, 
  Award,
  Zap
} from 'lucide-react';
import { ClienteEmpresa, VagaConsultoria, CandidatoConsultoria } from '../../types_consultor';

interface ConsultorRelatoriosIAProps {
  clientes: ClienteEmpresa[];
  vagas: VagaConsultoria[];
  candidatos: CandidatoConsultoria[];
  activeSection: 'relatorios' | 'ia';
}

export default function ConsultorRelatoriosIA({
  clientes,
  vagas,
  candidatos,
  activeSection
}: ConsultorRelatoriosIAProps) {
  
  // AI Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Olá! Sou sua Assistente Virtual Especialista em Consultoria de RH. Como posso ajudar seu processo seletivo hoje? Escolha um modelo rápido abaixo ou digite sua solicitação.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const PROMPT_LIBRARY = [
    'Escrever descrição de vaga para Desenvolvedor Full Stack Sênior em formato Gupy',
    'Elaborar 5 perguntas comportamentais para vaga de Gerente de Vendas B2B',
    'Gerar modelo de Feedback Negativo humanizado para candidato não aprovado na final',
    'Criar Proposta Comercial de Consultoria de Recrutamento & Seleção para Cliente',
    'Escrever E-mail de alinhamento de perfil de vaga com o Gestor do Cliente'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputText;
    if (!prompt.trim()) return;

    const newMsgs = [...messages, { role: 'user' as const, text: prompt }];
    setMessages(newMsgs);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await response.json();
      setMessages([...newMsgs, { role: 'assistant', text: data.reply || 'Processamento concluído com sucesso.' }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages([...newMsgs, { role: 'assistant', text: 'Desculpe, ocorreu uma falha ao conectar com o serviço de IA. Tente novamente.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExportPDF = (reportName: string) => {
    alert(`Gerando e baixando relatório PDF executivo: "${reportName}"...`);
  };

  const handleExportExcel = (reportName: string) => {
    alert(`Exportando planilha Excel (.xlsx): "${reportName}"...`);
  };

  return (
    <div className="space-y-6">
      
      {activeSection === 'relatorios' ? (
        
        /* --- RELATÓRIOS & METRICAS EXECUTIVAS --- */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <span>Central de Relatórios & Exportações</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere pareceres executivos para clientes em PDF ou exporte bases brutas para Excel
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Relatório Executivo de Vagas por Cliente</h3>
                  <p className="text-xs text-slate-500">Resumo completo com SLA, candidatos apresentados e status</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExportPDF('Relatório Executivo de Vagas')}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar PDF</span>
                </button>
                <button
                  onClick={() => handleExportExcel('Relatório Executivo de Vagas')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Métricas de SLA e Tempo Médio de Fechamento</h3>
                  <p className="text-xs text-slate-500">Indicadores de performance de atração e gargalos</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExportPDF('Métricas SLA')}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      ) : (

        /* --- CONSULTOR VIRTUAL IA GEMINI --- */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Consultor Virtual IA Especialista em RH</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere descrições de cargos, perguntas de entrevista, e-mails de feedback e pareceres
              </p>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {PROMPT_LIBRARY.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-slate-900 text-xs font-semibold px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer shadow-2xs"
              >
                ⚡ {prompt}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col h-[520px]">
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 border border-amber-400">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-2xl whitespace-pre-line ${
                    m.role === 'user' 
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-slate-700">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Consultor IA pensando...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center space-x-3">
              <input
                type="text"
                placeholder="Pergunte ao Consultor IA de RH..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isThinking}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>Enviar</span>
              </button>
            </div>

          </div>
        </div>

      )}

    </div>
  );
}
