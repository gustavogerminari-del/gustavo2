import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  PhoneOff,
  MessageSquare,
  Maximize2,
  Minimize2,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { InterviewService } from '../../services/interviewService';
import { SmartInterview } from '../../types_interview';

export default function CandidateInterviewRoom() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [interview, setInterview] = useState<SmartInterview | null>(null);
  const [candidateName, setCandidateName] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);

  // Media state
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Sistema', text: 'Bem-vindo à sala virtual da GestRH. Aguarde a entrada do recrutador ou inicie a conversa.', time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Parse room code from query or path
    const searchParams = new URLSearchParams(window.location.search);
    const roomParam = searchParams.get('room') || searchParams.get('interview') || searchParams.get('sala');
    let code = roomParam || '';

    if (!code && window.location.pathname.includes('/room/')) {
      code = decodeURIComponent(window.location.pathname.split('/room/')[1]?.trim() || '');
    }

    setRoomCode(code || 'gestrh-sala-demo');

    // Try finding interview matching room or candidate
    InterviewService.getInterviews().then(all => {
      const matched = all.find(i => 
        (i.locationOrLink && i.locationOrLink.includes(code)) || 
        i.id === code ||
        code.includes(i.id)
      );
      if (matched) {
        setInterview(matched);
        setCandidateName(matched.candidateName);
      } else {
        // Fallback default simulation for direct room links
        setCandidateName('Candidato(a)');
      }
    });
  }, []);

  // Request media stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera não suportada diretamente no seu navegador nesta janela.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, 
        audio: true 
      });
      mediaStreamRef.current = stream;
      setHasCameraAccess(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn(e));
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setHasCameraAccess(false);
      setCameraError("Acesso à câmera não concedido ou bloqueado. Verifique as permissões do navegador.");
    }
  };

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setHasCameraAccess(false);
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, {
      sender: candidateName || 'Você',
      text: newMessage.trim(),
      time: timeStr
    }]);
    setNewMessage('');
  };

  const handleJoin = () => {
    setIsJoined(true);
    if (!hasCameraAccess && isCameraOn) {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center font-display text-lg shadow-lg">
            G
          </div>
          <div>
            <h1 className="font-display font-extrabold text-base text-white flex items-center space-x-2">
              <span>GestRH Meeting</span>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                SALA VIRTUAL HD
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {interview ? `Entrevista: ${interview.jobTitle} - ${interview.companyName}` : `Sala: ${roomCode}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Criptografia de Ponta a Ponta</span>
          </div>

          <a
            href="/vagas"
            className="text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
          >
            Portal de Vagas
          </a>
        </div>
      </header>

      {/* Main Content */}
      {!isJoined ? (
        /* Pre-join Lobby Check Screen */
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Pronto para Entrar</span>
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                Entrevista de Seleção
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {interview 
                  ? `Olá ${interview.candidateName}, você está prestes a participar da entrevista para a vaga de ${interview.jobTitle}.`
                  : 'Confirme seu nome e teste seus equipamentos de áudio e vídeo antes de entrar na sala.'
                }
              </p>
            </div>

            {/* Video Test Box */}
            <div className="bg-slate-950 rounded-2xl aspect-video border border-slate-800 overflow-hidden relative flex items-center justify-center shadow-inner">
              {isCameraOn && hasCameraAccess ? (
                <video
                  ref={(node) => {
                    videoRef.current = node;
                    if (node && mediaStreamRef.current && node.srcObject !== mediaStreamRef.current) {
                      node.srcObject = mediaStreamRef.current;
                      node.play().catch(e => console.warn(e));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                ></video>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="h-20 w-20 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                    <User className="h-10 w-10" />
                  </div>
                  {cameraError ? (
                    <div className="text-xs text-rose-400 font-bold max-w-xs mx-auto">
                      {cameraError}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Câmera desligada</p>
                  )}
                  <button
                    onClick={() => {
                      setIsCameraOn(true);
                      startCamera();
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Video className="h-4 w-4" />
                    <span>Testar e Permitir Câmera</span>
                  </button>
                </div>
              )}

              {/* Controls bar inside lobby video */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 flex items-center space-x-2 z-10">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isMicOn ? 'bg-amber-500 text-slate-950' : 'bg-rose-600 text-white'
                  }`}
                  title="Alternar Microfone"
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isCameraOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                  title="Alternar Câmera"
                >
                  {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Candidate Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Seu Nome Completo</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoin}
              disabled={!candidateName.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Entrar na Sala da Entrevista</span>
            </button>

            {/* Optional Google Meet notice if interview has external link */}
            {interview?.locationOrLink?.includes('google.com') && (
              <div className="pt-2 text-center">
                <a
                  href={interview.locationOrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-400 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Link alternativo direto no Google Meet</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

          </div>
        </main>
      ) : (
        /* Active Video Conference Room View */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 p-4 gap-4 overflow-hidden">
          
          {/* Main Video Stage */}
          <div className="lg:col-span-3 flex flex-col space-y-3">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex-1 relative min-h-[400px] flex items-center justify-center shadow-2xl">
              
              {/* Candidate Video Feed */}
              {isCameraOn && hasCameraAccess ? (
                <video
                  ref={(node) => {
                    videoRef.current = node;
                    if (node && mediaStreamRef.current && node.srcObject !== mediaStreamRef.current) {
                      node.srcObject = mediaStreamRef.current;
                      node.play().catch(e => console.warn(e));
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                ></video>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-4xl flex items-center justify-center mx-auto shadow-2xl">
                    {candidateName.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">{candidateName}</h3>
                  <p className="text-xs text-amber-400 font-mono">Conectado via GestRH LiveKit Room</p>
                </div>
              )}

              {/* Recruiter Picture in Picture Badge */}
              <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 w-48 shadow-2xl backdrop-blur-md">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    RH
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">Recrutador(a)</p>
                    <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Em Espera / Ao Vivo</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Stage Overlay Info */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <span className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Sessão de Entrevista Ativa</span>
                </span>
              </div>

            </div>

            {/* Bottom Meeting Control Toolbar */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 px-2 font-mono">
                  {candidateName}
                </span>
              </div>

              {/* Center Toggles */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-2xl font-bold transition-all cursor-pointer ${
                    isMicOn ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-rose-600 text-white'
                  }`}
                  title="Microfone"
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`p-3 rounded-2xl font-bold transition-all cursor-pointer ${
                    isCameraOn ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                  }`}
                  title="Câmera"
                >
                  {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => setIsJoined(false)}
                  className="bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-2xl font-bold transition-all shadow-md cursor-pointer"
                  title="Sair da Reunião"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>WebRTC Conectado</span>
              </div>

            </div>

          </div>

          {/* Right Chat Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col h-full">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                <span>Chat da Sala</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Ao Vivo</span>
            </div>

            {/* Chat message history */}
            <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-2xl text-xs space-y-1 ${
                  msg.sender === 'Sistema' 
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                    : msg.sender === candidateName || msg.sender === 'Você'
                    ? 'bg-slate-800 border border-slate-700 text-slate-100 ml-4'
                    : 'bg-blue-600/20 border border-blue-500/30 text-blue-200 mr-4'
                }`}>
                  <div className="flex items-center justify-between font-bold text-[10px] opacity-75">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed font-sans">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input message box */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Mensagem para o recrutador..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl transition-all cursor-pointer font-bold"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </main>
      )}

    </div>
  );
}
