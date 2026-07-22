/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SaaSModule {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'Ativo' | 'Inativo';
}

export interface SaaSProduct {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  status: 'Ativo' | 'Inativo';
  linkedModules: string[]; // ids of SaaSModule
}

export interface SaaSPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  includedModules: string[]; // ids of SaaSModule
  userLimit: number;
  status: 'Ativo' | 'Inativo';
}

export interface SaaSCompany {
  id: string;
  name: string;
  cnpj: string;
  adminEmail: string;
  status: 'Ativo' | 'Bloqueado';
  planId: string; // id of SaaSPlan
  releasedModules: string[]; // list of active module ids
  userLimit: number;
  createdAt: string;
  address?: string;
  contact?: string;
}

export type UserRole = 'Master' | 'Empresa Administradora' | 'RH' | 'Funcionário' | 'Coordenador' | 'Consultor RH';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string; // empty for Master
  employeeId?: string; // links to Employee for 'Funcionário'
  status: 'Ativo' | 'Bloqueado';
  password?: string;
}

// Configurações do Site Principal (Master Admin)
export interface SiteHomeConfig {
  titulo: string;
  subtitulo: string;
  descricao: string;
  botaoTexto: string;
  botaoLink: string;
  imagem: string;
}

export interface SiteEmpresaConfig {
  missao: string;
  visao: string;
  valores: string[];
}

export interface SitePlanoConfig {
  id: string;
  nome: string;
  descricao: string;
  valorMensal: string;
  valorAnual: string;
  beneficios: string[];
  botaoTexto?: string;
  botaoLink?: string;
  ativo: boolean;
  ordem: number;
  destaque?: boolean;
  badge?: string;
}

export interface SiteMidiaConfig {
  logo: string;
  favicon: string;
  bannerInicial: string;
  imagensInstitucionais: string[];
}

export interface SiteContatoConfig {
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  redesSociais: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
}

export interface SiteConfig {
  home: SiteHomeConfig;
  empresa: SiteEmpresaConfig;
  planos: SitePlanoConfig[];
  midia: SiteMidiaConfig;
  contato: SiteContatoConfig;
}

