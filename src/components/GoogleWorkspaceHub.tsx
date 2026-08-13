import React, { useState, useEffect } from 'react';
import { Mail, Video, MessageSquare, Send, Plus, RefreshCw, LogOut, CheckCircle, AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { 
  googleSignIn, 
  getAccessToken, 
  logoutWorkspace, 
  gmailService, 
  meetService, 
  chatService, 
  GmailMessage, 
  MeetSpace, 
  ChatSpace 
} from '../services/googleWorkspaceService';

interface GoogleWorkspaceHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'meet' | 'chat'>('gmail');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Gmail State
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState<boolean>(false);

  // Meet State
  const [createdMeet, setCreatedMeet] = useState<MeetSpace | null>(null);
  const [creatingMeet, setCreatingMeet] = useState<boolean>(false);

  // Chat State
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState<boolean>(false);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatText, setChatText] = useState<string>('');
  const [showChatConfirmModal, setShowChatConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      if (activeTab === 'gmail') loadGmailMessages();
      if (activeTab === 'chat') loadChatSpaces();
    }
  }, [isOpen, isAuthenticated, activeTab]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setIsAuthenticated(true);
        setStatusMessage({ type: 'success', text: 'Conectado ao Google Workspace com sucesso!' });
        loadGmailMessages();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao conectar com a conta do Google.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutWorkspace();
    setIsAuthenticated(false);
    setMessages([]);
    setChatSpaces([]);
    setCreatedMeet(null);
    setStatusMessage({ type: 'info', text: 'Sessão do Google encerrada.' });
  };

  const loadGmailMessages = async () => {
    if (!isAuthenticated) return;
    setLoadingMessages(true);
    try {
      const msgs = await gmailService.listMessages(8);
      setMessages(msgs);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Não foi possível carregar as mensagens do Gmail.' });
    } finally {
      setLoadingMessages(false);
    }
  };

  const confirmSendEmail = async () => {
    setShowEmailConfirmModal(false);
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await gmailService.sendEmail(emailTo, emailSubject, emailBody);
      setStatusMessage({ type: 'success', text: `E-mail enviado com sucesso para ${emailTo}!` });
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      loadGmailMessages();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao enviar e-mail.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeet = async () => {
    if (!isAuthenticated) return;
    setCreatingMeet(true);
    setStatusMessage(null);
    try {
      const meet = await meetService.createMeetingSpace();
      setCreatedMeet(meet);
      setStatusMessage({ type: 'success', text: 'Nova reunião do Google Meet criada com sucesso!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao criar reunião do Meet.' });
    } finally {
      setCreatingMeet(false);
    }
  };

  const loadChatSpaces = async () => {
    if (!isAuthenticated) return;
    setLoadingSpaces(true);
    try {
      const spaces = await chatService.listSpaces();
      setChatSpaces(spaces);
      if (spaces.length > 0 && !selectedSpace) {
        setSelectedSpace(spaces[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Não foi possível listar os espaços do Google Chat.' });
    } finally {
      setLoadingSpaces(false);
    }
  };

  const confirmSendChatMessage = async () => {
    setShowChatConfirmModal(false);
    if (!selectedSpace) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await chatService.postMessage(selectedSpace, chatText);
      setStatusMessage({ type: 'success', text: 'Mensagem enviada no Google Chat com sucesso!' });
      setChatText('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao enviar mensagem no Google Chat.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Google Workspace Hub</h2>
              <p className="text-xs text-slate-400">Integração oficial com Gmail, Google Meet e Google Chat</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center space-x-1 transition"
                title="Sair do Google Workspace"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div className={`px-6 py-3 flex items-center justify-between text-sm border-b ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              {statusMessage.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
              {statusMessage.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs font-semibold opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {!isAuthenticated ? (
          /* Sign In Screen */
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 shadow-inner">
              <Mail className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-display font-bold text-xl text-slate-800">Conecte sua conta do Google</h3>
              <p className="text-sm text-slate-600">
                Acesse seus e-mails do Gmail, crie salas de reunião do Google Meet e envie mensagens do Google Chat diretamente na plataforma GestRH.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-md flex items-center space-x-3 text-slate-700 font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Conectando...' : 'Entrar com o Google'}</span>
            </button>
          </div>
        ) : (
          /* Main Workspace Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-4 space-y-1 shrink-0">
              <button
                onClick={() => setActiveTab('gmail')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeTab === 'gmail' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Gmail</span>
              </button>

              <button
                onClick={() => setActiveTab('meet')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeTab === 'meet' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Video className="h-4 w-4" />
                <span>Google Meet</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeTab === 'chat' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Google Chat</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* TAB 1: GMAIL */}
              {activeTab === 'gmail' && (
                <div className="space-y-6">
                  {/* Compose Email */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                      <Send className="h-4 w-4 text-emerald-600" />
                      <span>Enviar E-mail via Gmail</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Para (E-mail):</label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={e => setEmailTo(e.target.value)}
                          placeholder="candidato@email.com"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Assunto:</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          placeholder="Convite para Entrevista - GestRH"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mensagem:</label>
                        <textarea
                          rows={3}
                          value={emailBody}
                          onChange={e => setEmailBody(e.target.value)}
                          placeholder="Olá, gostaríamos de agendar a sua entrevista..."
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!emailTo || !emailSubject || !emailBody) {
                            setStatusMessage({ type: 'error', text: 'Preencha todos os campos do e-mail.' });
                            return;
                          }
                          setShowEmailConfirmModal(true);
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center space-x-2 transition cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        <span>Enviar E-mail</span>
                      </button>
                    </div>
                  </div>

                  {/* Gmail Inbox List */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-emerald-600" />
                        <span>Caixa de Entrada Recent</span>
                      </h3>
                      <button
                        onClick={loadGmailMessages}
                        disabled={loadingMessages}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                        title="Atualizar e-mails"
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingMessages ? 'animate-spin text-emerald-600' : ''}`} />
                      </button>
                    </div>

                    {loadingMessages ? (
                      <div className="py-8 text-center text-sm text-slate-500">Carregando e-mails do Gmail...</div>
                    ) : messages.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-500">Nenhum e-mail encontrado na caixa de entrada.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                        {messages.map((msg) => (
                          <div key={msg.id} className="py-3 hover:bg-slate-50 px-2 rounded-lg transition">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                              <span className="font-medium text-slate-700 truncate max-w-[200px]">{msg.from}</span>
                              <span>{msg.date ? new Date(msg.date).toLocaleDateString('pt-BR') : ''}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 truncate">{msg.subject}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{msg.snippet}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE MEET */}
              {activeTab === 'meet' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Video className="h-6 w-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="font-display font-bold text-lg text-slate-800">Agendar / Criar Sala do Google Meet</h3>
                      <p className="text-xs text-slate-500">
                        Gere links oficiais de videochamadas do Google Meet instantaneamente para entrevistas com candidatos ou reuniões da equipe.
                      </p>
                    </div>

                    <button
                      onClick={handleCreateMeet}
                      disabled={creatingMeet}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow flex items-center space-x-2 mx-auto transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{creatingMeet ? 'Criando Reunião...' : 'Criar Nova Sala no Google Meet'}</span>
                    </button>
                  </div>

                  {createdMeet && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span>Sala do Google Meet Pronta!</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between text-sm">
                        <span className="font-mono text-emerald-700 font-bold select-all">{createdMeet.meetingUri}</span>
                        <a
                          href={createdMeet.meetingUri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <span>Entrar Agora</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GOOGLE CHAT */}
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        <span>Espaços do Google Chat</span>
                      </h3>
                      <button
                        onClick={loadChatSpaces}
                        disabled={loadingSpaces}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingSpaces ? 'animate-spin text-emerald-600' : ''}`} />
                      </button>
                    </div>

                    {loadingSpaces ? (
                      <div className="py-4 text-center text-sm text-slate-500">Carregando espaços do Google Chat...</div>
                    ) : chatSpaces.length === 0 ? (
                      <div className="py-4 text-center text-sm text-slate-500">
                        Nenhum espaço do Google Chat encontrado. Certifique-se de que você faz parte de pelo menos um espaço no Google Workspace.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione o Espaço/Canal:</label>
                          <select
                            value={selectedSpace}
                            onChange={e => setSelectedSpace(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                          >
                            {chatSpaces.map(sp => (
                              <option key={sp.name} value={sp.name}>
                                {sp.displayName || sp.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Sua Mensagem:</label>
                          <textarea
                            rows={3}
                            value={chatText}
                            onChange={e => setChatText(e.target.value)}
                            placeholder="Escreva uma mensagem para a equipe no Google Chat..."
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (!chatText || !selectedSpace) {
                              setStatusMessage({ type: 'error', text: 'Selecione um espaço e escreva a mensagem.' });
                              return;
                            }
                            setShowChatConfirmModal(true);
                          }}
                          disabled={isLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center space-x-2 transition cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                          <span>Publicar no Google Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION DIALOG FOR GMAIL SEND */}
      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-800">
              <ShieldAlert className="h-6 w-6 text-emerald-600 shrink-0" />
              <h3 className="font-display font-bold text-lg">Confirmar envio de e-mail</h3>
            </div>
            <p className="text-sm text-slate-600">
              Você tem certeza de que deseja enviar este e-mail através da sua conta oficial do Gmail?
            </p>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-700">
              <div><strong>Para:</strong> {emailTo}</div>
              <div><strong>Assunto:</strong> {emailSubject}</div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowEmailConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSendEmail}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR CHAT MESSAGE */}
      {showChatConfirmModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-slate-800">
              <ShieldAlert className="h-6 w-6 text-emerald-600 shrink-0" />
              <h3 className="font-display font-bold text-lg">Confirmar mensagem no Google Chat</h3>
            </div>
            <p className="text-sm text-slate-600">
              Você confirma o envio desta mensagem para o canal do Google Chat selecionado?
            </p>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 italic">
              "{chatText}"
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowChatConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSendChatMessage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
