/**
 * Types for the "Entrevista Inteligente com IA" Module
 */

import { VideoProvider } from './services/videoIntegrationService';

export type InterviewStatus = 
  | 'Agendada' 
  | 'Em Andamento' 
  | 'Finalizada' 
  | 'Aprovada' 
  | 'Reprovada' 
  | 'Segunda Entrevista' 
  | 'Banco de Talentos'
  | 'Cancelada';

export type InterviewModality = 'Presencial' | 'Online' | 'Telefone';

export interface InterviewFile {
  id: string;
  name: string;
  type: 'CV' | 'Documento' | 'Portfolio';
  url: string;
  size: string;
  uploadedAt: string;
}

export interface TranscriptItem {
  id: string;
  speaker: 'Entrevistador' | 'Candidato';
  timestamp: string;
  text: string;
  topic?: string;
}

export interface InterviewTopic {
  title: string;
  summary: string;
  startTime: string;
  endTime: string;
}

export type CompetencyKey =
  | 'comunicacao'
  | 'conhecimentoTecnico'
  | 'experiencia'
  | 'perfilComportamental'
  | 'lideranca'
  | 'organizacao'
  | 'relacionamentoInterpessoal'
  | 'resolucaoProblemas'
  | 'inteligenciaEmocional'
  | 'proatividade'
  | 'comprometimento'
  | 'criatividade'
  | 'capacidadeAnalitica'
  | 'aprendizado'
  | 'adaptabilidade'
  | 'tomadaDecisao';

export interface CompetencyScoreItem {
  key: CompetencyKey;
  label: string;
  category: 'Técnica' | 'Comportamental' | 'Gestão';
  score: number; // 0 to 10
  comments: string;
  justification: string;
}

export type CompetencyScoresMap = Record<CompetencyKey, CompetencyScoreItem>;

export interface IdentifiedCompetencies {
  softSkills: string[];
  hardSkills: string[];
  languages: string[];
  courses: string[];
  tools: string[];
  certifications: string[];
}

export interface FinalAIParecer {
  summary: string;
  conclusion: string;
  recommendation: string;
  risks: string[];
  potential: string;
}

export type SuggestedDecision = 'Aprovado' | 'Segunda Entrevista' | 'Banco de Talentos' | 'Reprovado';

export interface SmartInterview {
  id: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateAvatar?: string;
  recruiterId: string;
  recruiterName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  modality: InterviewModality;
  videoPlatform?: VideoProvider;
  videoPlatformConnected?: boolean;
  locationOrLink: string;
  notes?: string;
  status: InterviewStatus;
  
  // Sala & Gravação
  durationSeconds: number;
  hasAudioRecording: boolean;
  hasVideoRecording: boolean;
  recordingUrl?: string;
  notesHistory?: string[];
  uploadedFiles: InterviewFile[];

  // Transcrição & Resultados IA
  transcript?: TranscriptItem[];
  transcriptSummary?: string;
  topics?: InterviewTopic[];
  
  // Avaliações
  competencies?: CompetencyScoresMap;
  overallScore: number; // 0-10
  jobCompatibility: number; // 0-100%
  strengths: string[];
  improvements: string[];
  identifiedSkills?: IdentifiedCompetencies;
  finalParecer?: FinalAIParecer;
  
  suggestedDecision?: SuggestedDecision;
  finalDecision?: SuggestedDecision;
  decisionNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface InterviewStats {
  todayCount: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  approvedCount: number;
  rejectedCount: number;
  secondInterviewCount: number;
  talentBankCount: number;
  avgDurationMinutes: number;
  avgScore: number;
}

export interface InterviewModuleSettings {
  aiModelName: string;
  autoTranscribe: boolean;
  enableVideoRecording: boolean;
  enableAudioRecording: boolean;
  minPassingScore: number;
  defaultInterviewDurationMinutes: number;
  customPromptCriteria: string;
  notifyRecruiterOnFinish: boolean;
}
