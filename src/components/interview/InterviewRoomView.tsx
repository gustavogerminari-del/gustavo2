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
  Download
} from 'lucide-react';
import { SmartInterview, InterviewFile } from '../../types_interview';

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

  // Video element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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

  // Handle webcam stream when video is active
  useEffect(() => {
    if (isVideoRecording && isRunning) {
      navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraAccess(true);
        })
        .catch((err) => {
          console.warn("Camera access not available in container/iframe, showing high-fidelity avatar simulator.", err);
          setHasCameraAccess(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setHasCameraAccess(false);
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoRecording, isRunning]);

  // Format seconds -> 00:00:00
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Actions
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    onUpdateInterview({ status: 'Em Andamento' });
  };

  const handlePause = () => {
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
    const fullNotesText = notesHistory.join('\n');
    
    try {
      await onFinishAndAnalyze(fullNotesText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
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
              onClick={handleStart}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Iniciar Entrevista</span>
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
                <span>Encerrar e Gerar Parecer IA</span>
              </button>
            </>
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
            
            {isVideoRecording && isRunning && hasCameraAccess ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              ></video>
            ) : (
              /* High-fidelity Simulation Avatar Screen */
              <div className="text-center p-8 relative z-10">
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
                  <p className="font-bold text-sm text-white">Transcrevendo & Analisando com IA...</p>
                  <p className="text-xs text-slate-300">Avaliando 16 competências e gerando parecer.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
