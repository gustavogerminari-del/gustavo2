/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types_master';
import { firebaseService } from '../firebase';

interface FirstAccessModalProps {
  currentUser: UserAccount;
  onSuccess: (updatedUser: UserAccount) => void;
}

export default function FirstAccessModal({ currentUser, onSuccess }: FirstAccessModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Passwords
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Step 2: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 3: Confirmation
  const [confirmName, setConfirmName] = useState(currentUser.name || '');
  const [confirmEmail, setConfirmEmail] = useState(currentUser.email || '');
  const [confirmCpf, setConfirmCpf] = useState(currentUser.cpf || '');
  const [confirmedData, setConfirmedData] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword.length < 6) {
      setPassError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    if (newPassword === currentUser.temporaryPassword || newPassword === '123456' || newPassword === 'GestRH@2026') {
      setPassError('Por favor, escolha uma senha diferente da senha provisória.');
      return;
    }

    // Advance to Step 2
    setCurrentStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Você precisa aceitar os Termos de Uso do Ponto Eletrônico para continuar.');
      return;
    }
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedData) {
      alert('Por favor, marque a caixa de confirmação dos seus dados cadastrais.');
      return;
    }

    setSubmitting(true);
    const nowStr = new Date().toLocaleString('pt-BR');

    const updatedUser: UserAccount = {
      ...currentUser,
      password: newPassword || currentUser.password || 'GestRH@2026',
      temporaryPassword: '',
      mustChangePassword: false,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      dataConfirmed: true,
      status: 'Ativo',
      lastLogin: nowStr,
      lastLoginStatus: 'Sucesso',
      cpf: confirmCpf || currentUser.cpf,
      name: confirmName || currentUser.name,
      logs: [
        ...(currentUser.logs || []),
        {
          id: `log-${Date.now()}`,
          action: 'Alteração',
          timestamp: nowStr,
          performedBy: currentUser.name,
          details: 'Primeiro Acesso concluído com redefinição de senha e aceite de termos de ponto.'
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', updatedUser);
      // Update local storage session and device session
      sessionStorage.setItem('gestrh_tab_session', JSON.stringify(updatedUser));
      const sessionKey = localStorage.getItem('gestrh_active_device_key') || 'gestrh_device_session_default';
      localStorage.setItem(sessionKey, JSON.stringify(updatedUser));
      
      onSuccess(updatedUser);
    } catch (err: any) {
      alert(`Erro ao salvar primeiro acesso: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-200 font-extrabold block">PRIMEIRO ACESSO OBRIGATÓRIO</span>
              <h2 className="text-xl font-bold font-display leading-tight">Bem-vindo ao Sistema de Ponto GestRH</h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Olá, <strong>{currentUser.name}</strong>! Configure sua conta para liberar seu acesso ao aplicativo.
              </p>
            </div>
          </div>

          {/* Stepper progress */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-emerald-700/60">
            <div className={`flex items-center space-x-2 text-xs font-bold ${currentStep >= 1 ? 'text-amber-300' : 'text-emerald-300/50'}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-amber-400 text-slate-950' : 'bg-emerald-800 text-emerald-400'}`}>1</div>
              <span>Redefinir Senha</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs font-bold ${currentStep >= 2 ? 'text-amber-300' : 'text-emerald-300/50'}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-amber-400 text-slate-950' : 'bg-emerald-800 text-emerald-400'}`}>2</div>
              <span>Termos de Uso</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs font-bold ${currentStep >= 3 ? 'text-amber-300' : 'text-emerald-300/50'}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-amber-400 text-slate-950' : 'bg-emerald-800 text-emerald-400'}`}>3</div>
              <span>Confirmar Dados</span>
            </div>
          </div>
        </div>

        {/* STEP 1: REDEFINIR SENHA PROVISÓRIA */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="p-6 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
              <KeyRound className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sua senha atual é uma senha provisória gerada pelo RH.</p>
                <p className="text-amber-800 mt-0.5">
                  Por medidas de segurança e conformidade da empresa, crie uma senha pessoal e secreta antes de utilizar o sistema de ponto.
                </p>
              </div>
            </div>

            {passError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-rose-700 font-semibold">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail / Login de Acesso</label>
                <input 
                  type="text" 
                  disabled 
                  value={currentUser.email} 
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha Pessoal *</label>
                <div className="relative flex items-center">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nova Senha *</label>
                <div className="relative flex items-center">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha exatamente igual"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Avançar para Termos de Uso</span>
                <Check className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: TERMOS DE USO */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <FileText className="h-5 w-5 text-emerald-600" />
                <span>Termo de Aceite do Aplicativo de Ponto Eletrônico (Portaria MTP 671)</span>
              </div>
              <p className="text-xs text-slate-500">
                Leia atentamente as diretrizes de registro de ponto digital corporativo antes de prosseguir.
              </p>
            </div>

            {/* Scrollable Terms Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-3 max-h-56 overflow-y-auto leading-relaxed shadow-inner">
              <p className="font-bold text-slate-900 uppercase">1. IDENTIFICAÇÃO E REGISTRO DE PONTO</p>
              <p>
                O colaborador declara estar ciente de que todos os registros efetuados no Aplicativo de Ponto Eletrônico GestRH correspondem à sua real jornada de trabalho, constituindo documento de fé pública nos termos da legislação trabalhista brasileira (CLT e Portaria MTP nº 671/2021).
              </p>
              <p className="font-bold text-slate-900 uppercase">2. INDIVIDUALIDADE E INVIOLABILIDADE</p>
              <p>
                As credenciais de acesso (Login e Senha) são estritamente pessoais e intransferíveis. O colaborador é integralmente responsável pela guarda e confidencialidade de sua senha, sendo expressamente vedado o registro de ponto por terceiros.
              </p>
              <p className="font-bold text-slate-900 uppercase">3. GEOLOCALIZAÇÃO E DISPOSITIVO</p>
              <p>
                O sistema poderá coletar dados de localização (latitude/longitude) e horário do servidor no exato momento da marcação para garantir a autenticidade e auditoria das marcações de entrada, almoço e saída.
              </p>
            </div>

            <label className="flex items-start space-x-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
              <input 
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-emerald-950">
                Li, compreendi e aceito integralmente os Termos de Uso e Políticas de Marcação de Ponto Eletrônico da empresa.
              </span>
            </label>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!acceptedTerms}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Avançar para Dados Cadastrais</span>
                <Check className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONFIRMAR DADOS CADASTRAIS */}
        {currentStep === 3 && (
          <form onSubmit={handleFinalSubmit} className="p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <span>Confirmação dos Dados do Colaborador</span>
              </h3>
              <p className="text-xs text-slate-500">
                Verifique se os seus dados cadastrais estão atualizados para a emissão correta do espelho de ponto e holerites.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">E-mail Corporativo</label>
                <input 
                  type="email"
                  disabled
                  value={confirmEmail}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">CPF *</label>
                <input 
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={confirmCpf}
                  onChange={(e) => setConfirmCpf(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Perfil e Permissão</label>
                <div className="py-2 px-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-between">
                  <span>Aplicativo de Ponto Liberado</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                </div>
              </div>
            </div>

            <label className="flex items-start space-x-3 p-3.5 bg-slate-100 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-200/60 transition-colors">
              <input 
                type="checkbox"
                required
                checked={confirmedData}
                onChange={(e) => setConfirmedData(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                Confirmo que as informações acima e meu CPF estão corretos e atualizados.
              </span>
            </label>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-4 py-2"
              >
                Voltar
              </button>

              <button
                type="submit"
                disabled={submitting || !confirmedData}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>{submitting ? 'Gravando Configurações...' : 'Concluir Primeiro Acesso e Entrar'}</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
