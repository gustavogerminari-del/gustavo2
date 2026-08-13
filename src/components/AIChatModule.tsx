import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  HelpCircle, 
  MessageSquare, 
  ArrowRight, 
  Check, 
  RefreshCw,
  Clock,
  X
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatModuleProps {
  isFloating?: boolean;
  onClose?: () => void;
}

const QUICK_PROMPTS = [
  { label: "Fracionamento de Férias CLT", text: "Quais as regras da CLT para fracionamento de férias?" },
  { label: "Documentos para Admissão", text: "Quais documentos admissionais devo exigir na contratação CLT?" },
  { label: "Simular Rescisão Sem Justa Causa", text: "Como calcular o saldo de salário em uma rescisão sem justa causa?" },
  { label: "VT e Alimentação em Folha", text: "Quais as taxas e descontos permitidos em folha para Vale-Transporte e VR?" }
];

export default function AIChatModule({ isFloating = false, onClose }: AIChatModuleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `### Olá! Sou o Assistente IA de Gestão de Pessoas do GestRH

Estou conectado em tempo real e pronto para ajudar você e sua equipe de Recursos Humanos com:

1. **Dúvidas Trabalhistas:** Esclareça regras de férias, banco de horas, aviso prévio, acordos e a CLT brasileira.
2. **Documentação e Admissão:** Saiba quais checklists preparar ou como formalizar contratos de CLT, PJ ou Estágio.
3. **Criação de Vagas e Feedbacks:** Peça sugestões de redação para anúncios ou comunicados corporativos.

*Selecione uma das perguntas rápidas abaixo para começar ou digite sua dúvida no campo de texto!*`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Map existing messages to history payload excluding the latest user query
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        text: m.text
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.text || 'Desculpe, não consegui obter uma resposta.' }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          text: `⚠️ **Erro na conexão:** Não foi possível contactar o servidor do Assistente. \n\n*Detalhe técnico: ${error.message}*` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render basic markdown elements natively in React safely
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Titles ###
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-sm font-bold text-slate-900 mt-4 mb-2 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1"></span>
            <span>{line.replace('### ', '')}</span>
          </h3>
        );
      }
      // Titles ##
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-base font-extrabold text-slate-950 mt-4 mb-2 border-b border-slate-100 pb-1">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // List items starting with 1. or -
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('- ')) {
        const clean = line.replace(/^(\d+\.\s+|- \s+)/, '');
        
        // Extract inner bold text if any
        return (
          <li key={i} className="ml-4 list-decimal text-xs text-slate-600 leading-relaxed my-1 font-medium pl-1">
            {renderLineWithBold(clean)}
          </li>
        );
      }
      
      return (
        <p key={i} className="text-xs text-slate-600 leading-relaxed my-1.5 font-medium">
          {renderLineWithBold(line)}
        </p>
      );
    });
  };

  // Extract inline **bold** markers
  const renderLineWithBold = (line: string) => {
    const parts = line.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={isFloating ? "bg-white flex flex-col h-full p-3 sm:p-4 text-left font-sans overflow-hidden" : "bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-[650px] shadow-sm"}>
      
      {/* Header Info (Shown if not floating, or shown compactly) */}
      {!isFloating && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center border border-emerald-100/50">
              <Bot className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>Assistente Jurídico & Operacional IA</span>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 font-mono">Conectado</span>
              </h3>
              <p className="text-[10px] text-slate-400">Tire dúvidas sobre a CLT brasileira, políticas de benefícios e contratos em tempo real.</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream Thread */}
      <div className={`flex-1 overflow-y-auto ${isFloating ? 'py-2 space-y-3 pr-1' : 'py-6 space-y-4 pr-1'}`}>
        {messages.map((msg, index) => {
          const isAI = msg.role === 'model';
          return (
            <div 
              key={index} 
              className={`flex items-start space-x-2.5 ${isAI ? 'mr-4' : 'ml-auto flex-row-reverse mr-0 pl-4'}`}
            >
              {/* Avatar Icon */}
              <div className={`h-7 w-7 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${isAI ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-600 text-white'}`}>
                {isAI ? <Bot className="h-4 w-4" /> : 'U'}
              </div>

              {/* Text Bubble */}
              <div className={`p-3 sm:p-3.5 rounded-2xl ${isAI ? 'bg-slate-50 border border-slate-100' : 'bg-[#0b1d33] text-white'}`}>
                {isAI ? (
                  <div className="space-y-1">
                    {renderFormattedText(msg.text)}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed font-semibold">{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5 mr-4">
            <div className="h-7 w-7 bg-slate-900 text-emerald-400 rounded-xl shrink-0 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-semibold">Analisando legislação e respondendo</span>
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestions list */}
      <div className="py-2 border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto shrink-0">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt.text)}
            disabled={isLoading}
            className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-800 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1 shrink-0"
          >
            <HelpCircle className="h-3 w-3 shrink-0 text-slate-400 hover:text-emerald-600" />
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
        className="pt-2 border-t border-slate-100 flex items-center space-x-2 shrink-0"
      >
        <input 
          type="text"
          placeholder="Pergunte sobre regras da CLT, contratações, demissões..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-emerald-600/10"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
