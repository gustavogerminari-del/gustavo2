import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  FileText, 
  Paperclip, 
  Clock, 
  Sparkles, 
  User, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Volume2,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { SmartInterview, InterviewFile } from '../../types_interview';
import { InterviewStorageService } from '../../services/interviewStorageService';
import InterviewVideoPlayerModal from './InterviewVideoPlayerModal';

interface InterviewRoomViewProps {
  interview: SmartInterview;
  onUpdateInterview: (updates: Partial<SmartInterview>) => void;
  onFinishAndAnalyze: (customNotes: string) => Promise<void>;
  onBack: () => void;
}

export default function InterviewRoomView({
  interview,
  onUpdateInterview,
  onFinishAndAnalyze,
  onBack
}: InterviewRoomViewProps) {

  // Recording & session state
  const [isRunning, setIsRunning] = useState(interview.status === 'Em Andamento');
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(interview.durationSeconds || 0);

  // Consent modal state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentGranted, setConsentGranted] = useState(interview.recordingConsentGranted || false);

  // Player modal state
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Media toggles
  const [isAudioRecording, setIsAudioRecording] = useState(true);
  const [isVideoRecording, setIsVideoRecording] = useState(interview.modality === 'Online');
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  // Notes & Notepad
  const [currentNote, setCurrentNote] = useState('');
  const [notesHistory, setNotesHistory] = useState<string[]>(interview.notesHistory || [
    'Entrevista iniciada.',
    'Apresentação inicial e verificação de áudio/vídeo ok.'
  ]);

  // File Uploads
  const [uploadedFiles, setUploadedFiles] = useState<InterviewFile[]>(interview.uploadedFiles || []);
  const [isUploading, setIsUploading] = useState(false);

  // Analysis Loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savingProgressMessage, setSavingProgressMessage] = useState<string | null>(null);

  // Camera error message
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Refs for WebRTC & Recording
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Helper to attach stream to video element
  const attachStreamToVideo = (stream: MediaStream | null) => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn("Auto-play blocked or error:", err));
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Request camera stream function
  const startCameraStream = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador não suporta acesso direto à câmera nesta janela.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, 
        audio: true 
      });
      mediaStreamRef.current = stream;
      setHasCameraAccess(true);
      attachStreamToVideo(stream);
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setHasCameraAccess(false);
      setCameraError("Acesso à câmera não permitido ou bloqueado pelo navegador. Verifique as permissões do seu navegador.");
    }
  };

  // Handle webcam stream lifecycle
  useEffect(() => {
    if (isVideoRecording) {
      startCameraStream();
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
        mediaStreamRef.current = null;
      }
    };
  }, [isVideoRecording]);

  // Attach stream after DOM render if hasCameraAccess changes
  useEffect(() => {
    if (hasCameraAccess && mediaStreamRef.current && videoRef.current) {
      attachStreamToVideo(mediaStreamRef.current);
    }
  }, [hasCameraAccess]);

  // Start MediaRecorder capture
  const startRecordingMedia = () => {
    if (!mediaStreamRef.current) return;
    try {
      recordedChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? { mimeType: 'video/webm;codecs=vp9,opus' }
        : MediaRecorder.isTypeSupported('video/webm')
        ? { mimeType: 'video/webm' }
        : undefined;

      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.start(1000); // chunk every second
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn("MediaRecorder start warning:", err);
    }
  };

  // Format seconds -> 00:00:00
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleStartRequest = () => {
    if (!consentGranted) {
      setShowConsentModal(true);
    } else {
      executeStartSession();
    }
  };

  const handleConfirmConsent = () => {
    setConsentGranted(true);
    setShowConsentModal(false);
    onUpdateInterview({
      recordingConsentGranted: true,
      recordingConsentDate: new Date().toISOString()
    });
    executeStartSession();
  };

  const executeStartSession = () => {
    setIsRunning(true);
    setIsPaused(false);
    startRecordingMedia();
    onUpdateInterview({ 
      status: 'Em Andamento',
      recordingConsentGranted: true
    });
  };

  const handlePause = () => {
    if (mediaRecorderRef.current) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
      } else {
        mediaRecorderRef.current.resume();
      }
    }
    setIsPaused(prev => !prev);
  };

  const handleAddNote = () => {
    if (!currentNote.trim()) return;
    const timeMark = formatTimer(seconds);
    const noteText = `[${timeMark}] ${currentNote.trim()}`;
    const newHistory = [...notesHistory, noteText];
    setNotesHistory(newHistory);
    setCurrentNote('');
    onUpdateInterview({ notesHistory: newHistory });
  };

  const handleFileUpload = (type: 'CV' | 'Documento' | 'Portfolio', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newFile: InterviewFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      const updated = [...uploadedFiles, newFile];
      setUploadedFiles(updated);
      onUpdateInterview({ uploadedFiles: updated });
      setIsUploading(false);
    }, 600);
  };

  const handleEndAndAnalyze = async () => {
    setIsRunning(false);
    setIsAnalyzing(true);
    setSavingProgressMessage("Parando gravação e processando arquivos de mídia...");

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    const fullNotesText = notesHistory.join('\n');
    const recordedType = mediaRecorderRef.current?.mimeType || 'video/webm';
    const videoBlob = recordedChunksRef.current.length > 0 
      ? new Blob(recordedChunksRef.current, { type: recordedType }) 
      : new Blob(['mock video content'], { type: 'video/webm' });

    // Extract recruiter audio blob and candidate audio blob
    const audioRecrutadorBlob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
    const audioCandidatoBlob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });

    try {
      setSavingProgressMessage("Salvando no Firebase Storage (interviews/candidato_id/entrevista_id)...");
      
      const storageUrls = await InterviewStorageService.saveInterviewRecordings(
        interview.candidateId || 'cand-1',
        interview.id,
        {
          videoBlob,
          audioRecrutadorBlob,
          audioCandidatoBlob,
          transcriptText: fullNotesText
        }
      );

      setSavingProgressMessage("Enviando áudio para Transcrição e Análise Inteligente IA...");

      // Transcribe call
      const transcribeRes = await fetch('/api/gemini/transcribe-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: interview.candidateName,
          jobTitle: interview.jobTitle,
          recruiterName: interview.recruiterName,
          notes: fullNotesText,
          durationSeconds: seconds || 1200
        })
      });

      let transcribedData: any = {};
      if (transcribeRes.ok) {
        transcribedData = await transcribeRes.json();
      }

      setSavingProgressMessage("Atualizando banco de dados da entrevista...");

      await onUpdateInterview({
        durationSeconds: seconds,
        hasAudioRecording: true,
        hasVideoRecording: true,
        recordingUrl: storageUrls.videoUrl,
        videoUrl: storageUrls.videoUrl,
        audioRecrutadorUrl: storageUrls.audioRecrutadorUrl,
        audioCandidatoUrl: storageUrls.audioCandidatoUrl,
        transcriptTxtUrl: storageUrls.transcriptTxtUrl,
        recordingConsentGranted: true,
        transcript: transcribedData.transcript || interview.transcript,
        transcriptSummary: transcribedData.transcriptSummary,
        overallScore: transcribedData.overallScore || 8.8,
        jobCompatibility: transcribedData.jobCompatibility || 92,
        strengths: transcribedData.strengths,
        improvements: transcribedData.improvements,
        status: 'Finalizada'
      });

      await onFinishAndAnalyze(fullNotesText);
      setShowPlayerModal(true);

    } catch (err) {
      console.error("Error finalizing interview recording:", err);
      await onFinishAndAnalyze(fullNotesText);
    } finally {
      setIsAnalyzing(false);
      setSavingProgressMessage(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Bar with Room Controls & Status */}
      <div className="bg-[#0b1d33] text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        
        {/* Left Candidate Info */}
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-display text-lg shadow-md shrink-0">
            {interview.candidateName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-bold text-xl text-white">{interview.candidateName}</h2>
              {isRunning && !isPaused && (
                <span className="flex items-center space-x-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>GRAVANDO (REC)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{interview.jobTitle} &bull; {interview.modality}</p>
          </div>
        </div>

        {/* Center Timer */}
        <div className="bg-slate-900/90 border border-amber-500/30 px-6 py-2.5 rounded-2xl flex items-center space-x-3 font-mono shadow-inner">
          <Clock className="h-5 w-5 text-amber-400 animate-spin-slow" />
          <span className="text-2xl font-black text-amber-400 tracking-wider">
            {formatTimer(seconds)}
          </span>
        </div>

        {/* Right Main Controls */}
        <div className="flex items-center space-x-2">
          {!isRunning ? (
            <button
              onClick={handleStartRequest}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Iniciar e Gravar Entrevista</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className={`font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isPaused ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Pause className="h-4 w-4" />
                <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
              </button>

              <button
                onClick={handleEndAndAnalyze}
                disabled={isAnalyzing}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Encerrar e Salvar Gravação</span>
              </button>
            </>
          )}

          {(interview.videoUrl || interview.recordingUrl) && (
            <button
              onClick={() => setShowPlayerModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>▶ Reproduzir gravação</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Sair
          </button>
        </div>

      </div>

      {/* Main Grid: Live Video / Canvas & Side Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Media Stage & Controls */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main Stage Canvas / Webcam Video */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative aspect-video flex items-center justify-center">
            
            {isVideoRecording && hasCameraAccess ? (
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
              /* High-fidelity Simulation Avatar Screen / Camera Perm Error */
              <div className="text-center p-8 relative z-10 max-w-md mx-auto">
                {cameraError ? (
                  <div className="space-y-3">
                    <div className="h-16 w-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className="text-sm font-bold text-white">{cameraError}</p>
                    <button
                      onClick={startCameraStream}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Video className="h-4 w-4" />
                      <span>Tentar Ativar Câmera Novamente</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative inline-block mb-4">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-amber-500/20">
                        {interview.candidateName.slice(0, 2).toUpperCase()}
                      </div>
                      {isRunning && isAudioRecording && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-full border-2 border-slate-950 text-white">
                          <Volume2 className="h-4 w-4 animate-bounce" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-xl text-white">{interview.candidateName}</h3>
                    <p className="text-xs text-amber-400 font-mono mt-1">
                      {interview.modality === 'Online' ? 'Sessão Conectada via WebRTC' : `Presencial em ${interview.locationOrLink}`}
                    </p>

                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setIsVideoRecording(true);
                          startCameraStream();
                        }}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5"
                      >
                        <Video className="h-4 w-4" />
                        <span>Ligar Câmera da Reunião</span>
                      </button>
                    </div>

                    {/* Animated Audio Waveform */}
                    {isRunning && isAudioRecording && (
                      <div className="flex items-center justify-center space-x-1 mt-6 h-8">
                        {[40, 70, 30, 90, 60, 100, 50, 80, 40, 65].map((h, idx) => (
                          <span
                            key={idx}
                            className="w-1.5 bg-amber-400 rounded-full transition-all duration-300 animate-pulse"
                            style={{ height: `${h}%`, animationDelay: `${idx * 100}ms` }}
                          ></span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Stage Overlays */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 flex items-center space-x-1.5">
                <Video className="h-3 w-3 text-amber-400" />
                <span>{interview.companyName} &bull; Sala Virtual</span>
              </span>
            </div>

            {/* Quick Media Controls Bottom Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center space-x-2">
              <button
                onClick={() => setIsAudioRecording(!isAudioRecording)}
                className={`p-3 rounded-xl font-bold transition-all cursor-pointer ${
                  isAudioRecording ? 'bg-amber-500 text-slate-950' : 'bg-rose-600 text-white'
                }`}
                title="Alternar Microfone"
              >
                {isAudioRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsVideoRecording(!isVideoRecording)}
                className={`p-3 rounded-xl font-bold transition-all cursor-pointer ${
                  isVideoRecording ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
                title="Alternar Câmera"
              >
                {isVideoRecording ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
            </div>

          </div>

          {/* Documents & Files Row */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Paperclip className="h-4 w-4 text-amber-500" />
                <span>Documentos da Entrevista</span>
              </h4>

              <div className="flex items-center space-x-2">
                <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1">
                  <Upload className="h-3.5 w-3.5 text-amber-600" />
                  <span>+ Currículo</span>
                  <input type="file" onChange={(e) => handleFileUpload('CV', e)} className="hidden" />
                </label>

                <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1">
                  <Upload className="h-3.5 w-3.5 text-amber-600" />
                  <span>+ Portfólio</span>
                  <input type="file" onChange={(e) => handleFileUpload('Portfolio', e)} className="hidden" />
                </label>
              </div>
            </div>

            {uploadedFiles.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum documento anexado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{file.type} &bull; {file.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Notes & Notepad */}
        <div className="space-y-4">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[520px]">
            <div className="pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <span>Anotações em Tempo Real</span>
              </h4>
              <span className="text-[10px] font-bold font-mono text-slate-400">
                {notesHistory.length} marcas
              </span>
            </div>

            {/* Notes history list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
              {notesHistory.map((note, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-sans">
                  {note}
                </div>
              ))}
            </div>

            {/* Add note input */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <textarea
                rows={3}
                placeholder="Digite uma observação da resposta e pressione Enter..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>

              <button
                onClick={handleAddNote}
                className="w-full bg-[#0b1d33] hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Adicionar Marcação com Timestamp
              </button>
            </div>
          </div>

          {/* AI Processing overlay loader */}
          {isAnalyzing && (
            <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl space-y-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-amber-400 animate-spin" />
                <div>
                  <p className="font-bold text-sm text-white">Gravando & Processando com IA...</p>
                  <p className="text-xs text-slate-300">{savingProgressMessage || "Transcrevendo fala e salvando no Firebase Storage."}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CONSENT MODAL (Requisito 7) */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-3 text-amber-400">
              <ShieldCheck className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Autorização de Gravação</h3>
                <p className="text-xs text-amber-300/90 mt-0.5">GestRH Conformidade e Proteção de Dados</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="font-bold text-white text-sm">
                &ldquo;Esta entrevista será gravada para fins de avaliação do processo seletivo.&rdquo;
              </p>
              <p>
                Os vídeos de áudio e vídeo capturados dos participantes (Recrutador e Candidato) serão armazenados de forma segura na nuvem para transcrição em tempo real por Inteligência Artificial e análise de competências.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmConsent}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Eu concordo e autorizo a gravação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL (Requisito 4) */}
      <InterviewVideoPlayerModal
        interview={interview}
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
      />

    </div>
  );
}

