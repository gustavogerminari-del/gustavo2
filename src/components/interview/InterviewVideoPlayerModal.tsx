import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  X, 
  Volume2, 
  VolumeX, 
  Download, 
  Video, 
  Mic, 
  FileText, 
  Clock, 
  Calendar, 
  User, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  ShieldCheck,
  Maximize2,
  List
} from 'lucide-react';
import { SmartInterview, TranscriptItem } from '../../types_interview';

interface InterviewVideoPlayerModalProps {
  interview: SmartInterview;
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewVideoPlayerModal({
  interview,
  isOpen,
  onClose
}: InterviewVideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(interview.durationSeconds || 300);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'feedback' | 'audioTracks'>('transcript');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.warn(e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!isOpen) return null;

  // Format seconds -> MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Parse "00:01:15" -> seconds
  const parseTimestampToSeconds = (ts: string): number => {
    if (!ts) return 0;
    const parts = ts.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const handleJumpToTime = (timestampStr: string) => {
    const sec = parseTimestampToSeconds(timestampStr);
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      setCurrentTime(sec);
      setIsPlaying(true);
      videoRef.current.play().catch(e => console.warn(e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sec = parseFloat(e.target.value);
    setCurrentTime(sec);
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
    }
  };

  const handleDownload = (content: string | Blob | undefined, filename: string, type: string) => {
    if (!content) {
      alert(`O arquivo ${filename} não está disponível para download nesta gravação.`);
      return;
    }
    let url = typeof content === 'string' ? content : URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Video source fallback URL
  const videoSrc = interview.videoUrl || interview.recordingUrl || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-white">
                  Gravação Completa da Entrevista
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  REC FULL HD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center space-x-1">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <strong className="text-slate-200">{interview.candidateName}</strong>
                </span>
                <span>&bull;</span>
                <span>{interview.jobTitle}</span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{interview.date} às {interview.time}</span>
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer"
            title="Fechar Player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Left Video Stage + Right Interactive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
          
          {/* Left Column: Video Stage & Controls (2 cols) */}
          <div className="lg:col-span-2 p-4 sm:p-6 bg-slate-950 border-r border-slate-800 flex flex-col justify-between space-y-4">
            
            {/* Video Box */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration || interview.durationSeconds || 300);
                }}
                className="w-full h-full object-contain"
              />

              {/* Center Play Overlay when paused */}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute p-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-2xl transition-all transform hover:scale-110 cursor-pointer"
                >
                  <Play className="h-8 w-8 fill-current ml-1" />
                </button>
              )}

              {/* Video Badge */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-white flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{interview.companyName} &bull; Sala Gravada</span>
              </div>
            </div>

            {/* Video Timeline & Controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              
              {/* Scrub bar */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-amber-400 min-w-[50px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-mono text-slate-400 min-w-[50px] text-right">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Buttons Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Áudio Dual Sincronizado</span>
                </div>
              </div>

            </div>

            {/* Download Files Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="font-display font-bold text-xs text-slate-300 flex items-center space-x-2">
                <Download className="h-4 w-4 text-amber-400" />
                <span>Exportar Arquivos de Mídia da Entrevista</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload(interview.videoUrl || interview.recordingUrl, `entrevista_${interview.candidateName.replace(/\s+/g, '_')}.mp4`, 'video/mp4')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2 cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Vídeo (.mp4)</span>
                </button>

                <button
                  onClick={() => handleDownload(interview.audioRecrutadorUrl, `audio_recrutador_${interview.id}.wav`, 'audio/wav')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2 cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Áudio Recrutador (.wav)</span>
                </button>

                <button
                  onClick={() => handleDownload(interview.audioCandidatoUrl, `audio_candidato_${interview.id}.wav`, 'audio/wav')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2 cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Áudio Candidato (.wav)</span>
                </button>

                <button
                  onClick={() => {
                    const txtContent = interview.transcript 
                      ? interview.transcript.map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join('\n\n')
                      : interview.transcriptSummary || 'Sem transcrição disponível.';
                    const txtBlob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
                    handleDownload(txtBlob, `transcricao_${interview.candidateName.replace(/\s+/g, '_')}.txt`, 'text/plain');
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Transcrição (.txt)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Transcrição Sincronizada & Parecer IA */}
          <div className="p-4 sm:p-6 bg-slate-900 flex flex-col justify-between space-y-4">
            
            {/* Tabs Selector */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'transcript' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Transcrição IA
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'feedback' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Parecer IA
              </button>
            </div>

            {/* TAB: Transcrição Sincronizada */}
            {activeTab === 'transcript' && (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-display font-bold text-xs text-slate-300 flex items-center space-x-2">
                    <List className="h-4 w-4 text-amber-400" />
                    <span>Falas dos Participantes com Timestamps</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Clique para saltar</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {!interview.transcript || interview.transcript.length === 0 ? (
                    <div className="p-4 bg-slate-950 rounded-2xl text-xs text-slate-400 italic text-center">
                      Nenhuma fala transcrita para esta gravação.
                    </div>
                  ) : (
                    interview.transcript.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleJumpToTime(item.timestamp)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 group ${
                          item.speaker !== 'Candidato'
                            ? 'bg-blue-950/30 border-blue-800/40 hover:bg-blue-900/40 text-blue-100'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-extrabold text-[11px] ${
                            item.speaker !== 'Candidato' ? 'text-blue-400' : 'text-amber-400'
                          }`}>
                            {item.speaker !== 'Candidato' ? `🎙️ ${interview.recruiterName || 'Recrutador'}` : `👤 ${interview.candidateName}`}
                          </span>
                          <span className="bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-lg transition-all">
                            ▶ {item.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed font-sans">{item.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: Parecer IA */}
            {activeTab === 'feedback' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-300">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">Nota da Avaliação IA</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {interview.overallScore || 8.5} / 10
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Compatibilidade com a Vaga</span>
                      <span className="font-bold text-amber-400">{interview.jobCompatibility || 90}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${interview.jobCompatibility || 90}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Resumo da Transcrição */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <h5 className="font-bold text-amber-400 text-xs">Resumo Executivo da Sessão</h5>
                  <p className="leading-relaxed text-slate-300">
                    {interview.transcriptSummary || 'Candidato com excelente desenvoltura comunicativa e respostas assertivas nos tópicos de competências.'}
                  </p>
                </div>

                {/* Pontos Fortes */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <h5 className="font-bold text-emerald-400 text-xs">Pontos Fortes Identificados</h5>
                  <ul className="space-y-1.5">
                    {(interview.strengths || ['Boa dicção e postura', 'Domínio técnico sobre o cargo']).map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
