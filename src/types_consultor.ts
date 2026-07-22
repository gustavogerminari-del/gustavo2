/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ConsultorRole = 
  | 'Administrador Master'
  | 'Administrador'
  | 'Consultor'
  | 'Recrutador'
  | 'Cliente'
  | 'Gestor do Cliente'
  | 'Candidato';

export type PipelineStage = 
  | 'Novo'
  | 'Triagem'
  | 'Contato'
  | 'Entrevista RH'
  | 'Teste'
  | 'Entrevista Cliente'
  | 'Aprovado'
  | 'Contratado'
  | 'Banco de Talentos';

export type CRMPipelineStage = 
  | 'Lead'
  | 'Contato'
  | 'Reunião'
  | 'Proposta'
  | 'Negociação'
  | 'Contrato'
  | 'Cliente Ativo';

export interface ClienteEmpresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  responsavel: string;
  telefone: string;
  whatsapp: string;
  email: string;
  site: string;
  endereco: string;
  cidade: string;
  estado: string;
  segmento: string;
  numeroFuncionarios: number;
  observacoes?: string;
  status: 'Ativo' | 'Inativo' | 'Lead' | 'Proposta';
  consultorResponsavelId: string;
  consultorName: string;
  dataCadastro: string;
  logoUrl?: string;
}

export interface VagaConsultoria {
  id: string;
  clienteId: string;
  clienteNome: string;
  cargo: string;
  descricao: string;
  responsabilidades: string[];
  requisitos: string[];
  beneficios: string[];
  salario: number | string;
  cidade: string;
  estado: string;
  modalidade: 'Presencial' | 'Remoto' | 'Híbrido';
  tipoContratacao: 'CLT' | 'PJ' | 'Estágio' | 'Temporário';
  quantidade: number;
  prazo: string; // YYYY-MM-DD
  status: 'Aberta' | 'Em Andamento' | 'Pausada' | 'Finalizada' | 'Cancelada';
  publicadoPortal: boolean;
  canaisPublicacao: string[];
  dataCriacao: string;
  consultorId: string;
}

export interface CandidatoConsultoria {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  cargoDesejado: string;
  experienciaAnos: number;
  escolaridade: string;
  idiomas: string[];
  cursos: string[];
  hardSkills: string[];
  softSkills: string[];
  pretensaoSalarial: number;
  disponibilidade: 'Imediata' | '15 dias' | '30 dias';
  favorito: boolean;
  tags: string[];
  observacoes?: string;
  resumoIA?: string;
  aiScore?: number; // 0 - 100
  fitClass?: 'Excelente' | 'Muito Bom' | 'Bom' | 'Regular' | 'Baixo Fit';
  pontosFortes?: string[];
  pontosFracos?: string[];
  perguntasSugeridas?: string[];
  etapaPipeline: PipelineStage;
  vagaId?: string;
  vagaTitulo?: string;
  clienteId?: string;
  clienteNome?: string;
  resumeUrl?: string;
  resumeText?: string;
  dataCadastro: string;
  consultorId: string;
  historicoEtapas?: {
    etapa: PipelineStage;
    data: string;
    usuario: string;
    observacao?: string;
  }[];
}

export interface EntrevistaConsultoria {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  vagaId: string;
  vagaTitulo: string;
  clienteId: string;
  clienteNome: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  tipo: 'Presencial' | 'Google Meet' | 'Zoom' | 'MS Teams';
  linkMeet?: string;
  responsavel: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada';
  checklist: { item: string; concluido: boolean }[];
  notas?: string;
  parecerTecnico?: string;
  avaliacaoScore?: number; // 1-5 stars
  linkGravacao?: string;
}

export interface CRMDeal {
  id: string;
  clienteEmpresa: string;
  cnpj?: string;
  responsavel: string;
  telefone: string;
  email: string;
  valorEstimado: number;
  etapa: CRMPipelineStage;
  probabilidade: number; // %
  dataPrevisaoFechamento: string;
  consultorResponsavel: string;
  historicoAtividades: {
    id: string;
    tipo: 'Ligação' | 'Email' | 'WhatsApp' | 'Reunião' | 'Tarefa';
    descricao: string;
    data: string;
    usuario: string;
  }[];
  dataCriacao: string;
}

export interface FinanceiroContrato {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipoCobrança: 'Por Vaga' | 'Mensalidade' | 'Porcentagem Salarial';
  valorUnitario: number;
  vagasInclusas?: number;
  status: 'Ativo' | 'Pendente' | 'Encerrado';
  dataInicio: string;
  dataVencimento: string;
  comissaoConsultor: number; // %
}

export interface ReceitaDespesa {
  id: string;
  clienteId?: string;
  clienteNome?: string;
  descricao: string;
  tipo: 'Receita' | 'Despesa';
  categoria: 'Honorários de Recrutamento' | 'Mensalidade SaaS' | 'Ferramentas' | 'Comissões' | 'Outros';
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  reciboGerado?: boolean;
}

export interface NotificacaoSistema {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  tipo: 'Entrevista' | 'Candidato' | 'Proposta' | 'Financeiro' | 'IA';
}
