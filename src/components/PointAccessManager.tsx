/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  RefreshCw, 
  Send, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  Building2, 
  Smartphone, 
  Copy, 
  Check, 
  Mail, 
  MessageSquare,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { UserAccount, UserRole, EmployeeAccessPermissions } from '../types_master';
import { Employee, SaaSCompany } from '../types';
import { firebaseService } from '../services/centralServices';

interface PointAccessManagerProps {
  currentUser: UserAccount | null;
  employees: Employee[];
  systemUsers: UserAccount[];
  companies?: SaaSCompany[];
  onRefreshUsers: () => void;
  onOpenEmployeeModal?: (emp: Employee, tab?: 'dados' | 'acesso') => void;
  triggerToast: (msg: string) => void;
}

export default function PointAccessManager({
  currentUser,
  employees,
  systemUsers,
  companies = [],
  onRefreshUsers,
  onOpenEmployeeModal,
  triggerToast
}: PointAccessManagerProps) {
  // Filters state
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('Todos');
  const [deptFilter, setDeptFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Selected user for credentials modal
  const [credentialsModalUser, setCredentialsModalUser] = useState<UserAccount | null>(null);
  
  // Selected user for quick editing modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editLogin, setEditLogin] = useState('');
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Inativo' | 'Bloqueado'>('Ativo');
  const [editPermitirPonto, setEditPermitirPonto] = useState(true);
  const [editPermissions, setEditPermissions] = useState<EmployeeAccessPermissions>({
    portalColaborador: true,
    aplicativoPonto: true,
    holerites: true,
    ferias: true,
    documentos: true,
    bancoHoras: true,
    beneficios: true,
  });
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  // Password reset alert
  const [tempPassAlert, setTempPassAlert] = useState<{
    userName: string;
    email: string;
    pass: string;
  } | null>(null);

  // Departments list
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  // Role permissions check
  const canManage = currentUser?.role === 'Master' || 
                    currentUser?.role === 'Empresa Administradora' || 
                    currentUser?.role === 'RH' || 
                    currentUser?.role === 'Consultor RH';

  // Helper: Get Employee linked to UserAccount
  const getEmployeeForUser = (user: UserAccount): Employee | undefined => {
    return employees.find(e => e.id === user.employeeId || e.email.trim().toLowerCase() === user.email.trim().toLowerCase());
  };

  // Helper: Generate automatic random password
  const generateAutoPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'GestRH@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Filtered list of Employees with their associated UserAccount
  const employeeAccessList = employees.map(emp => {
    const userAcc = systemUsers.find(u => u.employeeId === emp.id || u.email.trim().toLowerCase() === emp.email.trim().toLowerCase());
    return {
      emp,
      userAcc
    };
  }).filter(({ emp, userAcc }) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchCpf = emp.cpf ? emp.cpf.includes(q) : false;
      const matchLogin = userAcc?.username?.toLowerCase().includes(q) || userAcc?.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCpf && !matchLogin) return false;
    }

    // Company filter
    if (companyFilter !== 'Todos' && emp.companyId !== companyFilter) {
      return false;
    }

    // Dept filter
    if (deptFilter !== 'Todos' && emp.department !== deptFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'Todos') {
      if (statusFilter === 'Sem Acesso') {
        if (userAcc) return false;
      } else {
        if (!userAcc || userAcc.status !== statusFilter) return false;
      }
    }

    return true;
  });

  // Action: Create point access for employee
  const handleCreateAccess = async (targetEmp: Employee) => {
    if (!canManage) {
      alert('Apenas Administradores e RH podem criar acessos ao ponto.');
      return;
    }

    const tempPass = generateAutoPassword();
    const username = targetEmp.email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');

    const newAccess: UserAccount = {
      id: `usr-${Date.now()}`,
      email: targetEmp.email.trim(),
      name: targetEmp.name,
      username,
      cpf: targetEmp.cpf || '',
      role: 'Funcionário',
      companyId: targetEmp.companyId || 'company-1',
      employeeId: targetEmp.id,
      status: 'Ativo',
      temporaryPassword: tempPass,
      password: tempPass,
      mustChangePassword: true,
      permitirAplicativoPonto: true,
      createdAt: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      createdBy: currentUser?.name || 'RH',
      lastLogin: 'Nunca acessou',
      lastLoginStatus: 'Nunca',
      permissions: {
        portalColaborador: true,
        aplicativoPonto: true,
        holerites: true,
        ferias: true,
        documentos: true,
        bancoHoras: true,
        beneficios: true
      },
      logs: [
        {
          id: `log-${Date.now()}`,
          action: 'Criação',
          timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          performedBy: currentUser?.name || 'Administrador RH',
          details: 'Acesso ao Ponto criado e liberado com senha provisória'
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', newAccess);
      onRefreshUsers();
      triggerToast(`✓ Acesso ao Ponto criado com sucesso para ${targetEmp.name}!`);
      setTempPassAlert({
        userName: targetEmp.name,
        email: targetEmp.email,
        pass: tempPass
      });
    } catch (err: any) {
      alert(`Erro ao criar acesso: ${err.message || err}`);
    }
  };

  // Action: Reset Password
  const handleResetPassword = async (user: UserAccount) => {
    if (!canManage) return;

    const newPass = generateAutoPassword();
    const updatedUser: UserAccount = {
      ...user,
      temporaryPassword: newPass,
      password: newPass,
      mustChangePassword: true,
      logs: [
        ...(user.logs || []),
        {
          id: `log-${Date.now()}`,
          action: 'Redefinição de Senha',
          timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          performedBy: currentUser?.name || 'Administrador RH',
          details: 'Senha provisória redefinida'
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', updatedUser);
      onRefreshUsers();
      triggerToast(`✓ Senha redefinida para ${user.name}!`);
      setTempPassAlert({
        userName: user.name,
        email: user.email,
        pass: newPass
      });
    } catch (err: any) {
      alert(`Erro ao redefinir senha: ${err.message || err}`);
    }
  };

  // Action: Toggle Block Status
  const handleToggleBlock = async (user: UserAccount) => {
    if (!canManage) return;

    const isBlocking = user.status === 'Ativo';
    const nextStatus: 'Ativo' | 'Bloqueado' = isBlocking ? 'Bloqueado' : 'Ativo';
    const nowStr = `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`;

    const updatedUser: UserAccount = {
      ...user,
      status: nextStatus,
      permitirAplicativoPonto: !isBlocking,
      blockedDate: isBlocking ? nowStr : undefined,
      logs: [
        ...(user.logs || []),
        {
          id: `log-${Date.now()}`,
          action: isBlocking ? 'Bloqueio' : 'Desbloqueio',
          timestamp: nowStr,
          performedBy: currentUser?.name || 'Administrador RH',
          details: isBlocking ? 'Acesso ao ponto bloqueado manualmente' : 'Acesso ao ponto desbloqueado'
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', updatedUser);
      onRefreshUsers();
      triggerToast(`✓ Acesso de ${user.name} foi ${isBlocking ? '🟠 BLOQUEADO' : '🟢 DESBLOQUEADO'}!`);
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message || err}`);
    }
  };

  // Action: Delete user access
  const handleDeleteAccess = async (user: UserAccount) => {
    if (!canManage) return;

    if (!confirm(`Tem certeza que deseja EXCLUIR O ACESSO AO PONTO de "${user.name}"?\n\nO funcionário não conseguirá mais registrar ponto. Seu cadastro de funcionário permanecerá intacto.`)) {
      return;
    }

    try {
      await firebaseService.db.deleteDoc('USERS', user.id);
      onRefreshUsers();
      triggerToast(`✓ Acesso ao ponto de "${user.name}" excluído. Cadastro do funcionário mantido.`);
    } catch (err: any) {
      alert(`Erro ao excluir acesso: ${err.message || err}`);
    }
  };

  // Action: Open Edit Modal for User Account
  const handleStartEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setEditLogin(user.email);
    setEditStatus(user.status as any || 'Ativo');
    setEditPermitirPonto(user.permitirAplicativoPonto !== false);
    setEditPermissions(user.permissions || {
      portalColaborador: true,
      aplicativoPonto: user.permitirAplicativoPonto !== false,
      holerites: true,
      ferias: true,
      documentos: true,
      bancoHoras: true,
      beneficios: true,
    });
    setEditPassword('');
    setEditConfirmPassword('');
  };

  // Submit Edit User Form
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editPassword && editPassword !== editConfirmPassword) {
      alert('A nova senha e a confirmação de senha não correspondem.');
      return;
    }

    const updatedUser: UserAccount = {
      ...editingUser,
      email: editLogin.trim(),
      status: editStatus,
      permitirAplicativoPonto: editPermissions.aplicativoPonto,
      permissions: editPermissions,
      password: editPassword ? editPassword : editingUser.password,
      temporaryPassword: editPassword ? editPassword : editingUser.temporaryPassword,
      mustChangePassword: editPassword ? true : editingUser.mustChangePassword,
      logs: [
        ...(editingUser.logs || []),
        {
          id: `log-${Date.now()}`,
          action: 'Alteração',
          timestamp: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
          performedBy: currentUser?.name || 'Administrador RH',
          details: 'Dados do acesso e permissões de módulos atualizados'
        }
      ]
    };

    try {
      await firebaseService.db.saveDoc('USERS', updatedUser);
      onRefreshUsers();
      setEditingUser(null);
      triggerToast(`✓ Acesso de ${updatedUser.name} atualizado com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao salvar edições de acesso: ${err.message || err}`);
    }
  };

  // Share helpers
  const getShareText = (user: UserAccount, pass?: string) => {
    const tempPass = pass || user.temporaryPassword || user.password || 'GestRH@2026';
    return `Olá *${user.name}*!\n\nSeu acesso ao *Aplicativo de Ponto Eletrônico GestRH* foi criado e liberado pelo RH.\n\n👤 *Nome:* ${user.name}\n🔑 *Login:* ${user.email}\n🔐 *Senha Provisória:* ${tempPass}\n🌐 *Link do Aplicativo:* ${window.location.origin}\n\n*Observação:* No seu primeiro acesso, você deverá cadastrar sua nova senha pessoal e aceitar os termos de uso de ponto.`;
  };

  const handleShareWhatsApp = (user: UserAccount, pass?: string) => {
    const text = getShareText(user, pass);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = (user: UserAccount, pass?: string) => {
    const text = getShareText(user, pass);
    const subject = encodeURIComponent('Liberação de Acesso ao Aplicativo de Ponto - GestRH');
    window.open(`mailto:${user.email}?subject=${subject}&body=${encodeURIComponent(text)}`, '_blank');
  };

  // Statistics counters
  const totalEmployees = employees.length;
  const activeAccesses = systemUsers.filter(u => u.status === 'Ativo' && u.permitirAplicativoPonto !== false).length;
  const blockedAccesses = systemUsers.filter(u => u.status === 'Bloqueado').length;
  const pendingFirstAccess = systemUsers.filter(u => u.mustChangePassword || u.lastLoginStatus === 'Nunca' || u.lastLogin === 'Nunca acessou').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Gestão de Acessos ao Ponto Eletrônico</span>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Controle e Liberação de Acesso dos Colaboradores
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Somente colaboradores autorizados pelo RH ou Administrador possuem permissão para registrar ponto digital.
            </p>
          </div>

          {!canManage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Modo Leitura: Apenas perfis Master, Administrador e RH podem gerenciar acessos.</span>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Colaboradores</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black font-mono text-slate-800">{totalEmployees}</span>
              <span className="text-xs text-slate-500 font-medium">cadastrados</span>
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">Acessos Liberados</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black font-mono text-emerald-800">{activeAccesses}</span>
              <span className="text-xs text-emerald-600 font-bold">ativos no ponto</span>
            </div>
          </div>

          <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4">
            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase block">Bloqueados / Inativos</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black font-mono text-rose-800">{blockedAccesses}</span>
              <span className="text-xs text-rose-600 font-bold">impedidos</span>
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Pendente 1º Acesso</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black font-mono text-amber-900">{pendingFirstAccess}</span>
              <span className="text-xs text-amber-700 font-medium">aguardando troca de senha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar nome, CPF, e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Empresa filter */}
          {companies.length > 0 && (
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
            >
              <option value="Todos">Todas as Empresas</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Departamento filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
          >
            <option value="Todos">Todos Departamentos</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
          >
            <option value="Todos">Todos os Status de Acesso</option>
            <option value="Ativo">Acessos Ativos</option>
            <option value="Inativo">Acessos Inativos</option>
            <option value="Bloqueado">Acessos Bloqueados</option>
            <option value="Sem Acesso">Sem Acesso Criado</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4">Colaborador</th>
                <th className="py-3.5 px-4">Departamento / Cargo</th>
                <th className="py-3.5 px-4">Login de Acesso</th>
                <th className="py-3.5 px-4">App de Ponto</th>
                <th className="py-3.5 px-4">Status Acesso</th>
                <th className="py-3.5 px-4">Último Acesso</th>
                <th className="py-3.5 px-4">Criado em / por</th>
                <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {employeeAccessList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum colaborador encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                employeeAccessList.map(({ emp, userAcc }) => {
                  const isDesligado = emp.status === 'Desligado';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Employee name and CPF */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {emp.id} {emp.cpf ? `• CPF: ${emp.cpf}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dept / Role */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{emp.department}</span>
                        <span className="text-[10px] text-slate-500">{emp.role}</span>
                      </td>

                      {/* Login */}
                      <td className="py-3.5 px-4 font-mono">
                        {userAcc ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{userAcc.email}</span>
                            {userAcc.username && (
                              <span className="text-[10px] text-slate-500">@{userAcc.username}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem login criado</span>
                        )}
                      </td>

                      {/* Permitir Ponto Badge */}
                      <td className="py-3.5 px-4">
                        {isDesligado ? (
                          <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-rose-200">
                            🚫 Desligado
                          </span>
                        ) : userAcc ? (
                          userAcc.permitirAplicativoPonto !== false ? (
                            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center space-x-1 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Sim (Liberado)</span>
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center space-x-1 border border-amber-200">
                              <XCircle className="h-3 w-3 text-amber-600" />
                              <span>Não (Bloqueado)</span>
                            </span>
                          )
                        ) : (
                          <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            Sem Acesso
                          </span>
                        )}
                      </td>

                      {/* Access Status */}
                      <td className="py-3.5 px-4">
                        {userAcc ? (
                          <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            userAcc.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/50'
                              : userAcc.status === 'Bloqueado'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300/50'
                              : 'bg-amber-100 text-amber-800 border border-amber-300/50'
                          }`}>
                            {userAcc.status}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                            Não Criado
                          </span>
                        )}
                      </td>

                      {/* Last Access */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {userAcc ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {userAcc.lastLogin || 'Nunca acessou'}
                            </span>
                            {userAcc.mustChangePassword ? (
                              <span className="text-amber-600 font-bold text-[9px] block">⚠️ Aguardando 1º acesso</span>
                            ) : (
                              <span className="text-emerald-600 text-[9px] block">✓ Senha Pessoal Cadastrada</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Creation Info */}
                      <td className="py-3.5 px-4 text-[10px] text-slate-500">
                        {userAcc ? (
                          <div>
                            <span className="font-mono text-slate-700 block">{userAcc.createdAt || '21/07/2026'}</span>
                            <span className="text-slate-400 block">Por: {userAcc.createdBy || 'RH'}</span>
                          </div>
                        ) : (
                          <span>--</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {!userAcc ? (
                          <button
                            type="button"
                            onClick={() => handleCreateAccess(emp)}
                            disabled={!canManage}
                            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center space-x-1 cursor-pointer transition-all"
                          >
                            <Key className="h-3.5 w-3.5" />
                            <span>Criar Acesso ao Ponto</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Editar */}
                            <button
                              type="button"
                              title="Editar Acesso"
                              onClick={() => handleStartEditUser(userAcc)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {/* Redefinir Senha */}
                            <button
                              type="button"
                              title="Redefinir Senha"
                              onClick={() => handleResetPassword(userAcc)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-700 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>

                            {/* Bloquear / Desbloquear */}
                            <button
                              type="button"
                              title={userAcc.status === 'Ativo' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                              onClick={() => handleToggleBlock(userAcc)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                userAcc.status === 'Ativo' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              {userAcc.status === 'Ativo' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                            </button>

                            {/* Enviar Credenciais */}
                            <button
                              type="button"
                              title="Enviar Credenciais"
                              onClick={() => setCredentialsModalUser(userAcc)}
                              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>

                            {/* Excluir Acesso */}
                            <button
                              type="button"
                              title="Excluir Acesso"
                              onClick={() => handleDeleteAccess(userAcc)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: ENVIAR CREDENCIAIS --- */}
      {credentialsModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Enviar Credenciais de Ponto</h3>
                  <p className="text-xs text-slate-500">{credentialsModalUser.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setCredentialsModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-mono space-y-1.5 mb-5">
              <div><strong className="text-slate-500">Nome:</strong> <span className="text-slate-900 font-sans font-bold">{credentialsModalUser.name}</span></div>
              <div><strong className="text-slate-500">Login:</strong> <span className="text-slate-900 font-bold">{credentialsModalUser.email}</span></div>
              <div><strong className="text-slate-500">Senha Provisória:</strong> <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">{credentialsModalUser.temporaryPassword || credentialsModalUser.password || 'GestRH@2026'}</span></div>
              <div><strong className="text-slate-500">Link:</strong> <span className="text-emerald-700 font-bold">{window.location.origin}</span></div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleShareWhatsApp(credentialsModalUser);
                  setCredentialsModalUser(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Enviar via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleShareEmail(credentialsModalUser);
                  setCredentialsModalUser(null);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                <span>Enviar via E-mail Corporativo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getShareText(credentialsModalUser));
                  triggerToast('✓ Mensagem copiada para a área de transferência!');
                  setCredentialsModalUser(null);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar Mensagem</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDITAR ACESSO DO USUÁRIO --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <Edit3 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Editar Configurações de Acesso ao Ponto</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Funcionário</label>
                <input type="text" disabled value={editingUser.name} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Login (E-mail ou CPF)</label>
                <input 
                  type="text" 
                  required 
                  value={editLogin} 
                  onChange={(e) => setEditLogin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status do Acesso</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Permitir App de Ponto</label>
                  <select 
                    value={editPermissions.aplicativoPonto ? 'sim' : 'nao'}
                    onChange={(e) => {
                      const val = e.target.value === 'sim';
                      setEditPermitirPonto(val);
                      setEditPermissions(prev => ({ ...prev, aplicativoPonto: val }));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
                  >
                    <option value="sim">Sim (Liberado)</option>
                    <option value="nao">Não (Bloqueado)</option>
                  </select>
                </div>
              </div>

              {/* Modules permissions section */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">Módulos Liberados no Sistema</label>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setEditPermissions({
                        portalColaborador: true,
                        aplicativoPonto: true,
                        holerites: true,
                        ferias: true,
                        documentos: true,
                        bancoHoras: true,
                        beneficios: true,
                      })}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Marcar Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPermissions({
                        portalColaborador: false,
                        aplicativoPonto: false,
                        holerites: false,
                        ferias: false,
                        documentos: false,
                        bancoHoras: false,
                        beneficios: false,
                      })}
                      className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  {[
                    { key: 'portalColaborador', label: 'Portal do Colaborador' },
                    { key: 'aplicativoPonto', label: 'Aplicativo de Ponto' },
                    { key: 'holerites', label: 'Holerites' },
                    { key: 'ferias', label: 'Solicitações de Férias' },
                    { key: 'documentos', label: 'Documentos' },
                    { key: 'bancoHoras', label: 'Banco de Horas' },
                    { key: 'beneficios', label: 'Benefícios' },
                  ].map((m) => {
                    const isChecked = editPermissions[m.key as keyof EmployeeAccessPermissions] !== false;
                    return (
                      <label key={m.key} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl cursor-pointer hover:bg-slate-100/80">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setEditPermissions(prev => ({ ...prev, [m.key]: val }));
                            if (m.key === 'aplicativoPonto') {
                              setEditPermitirPonto(val);
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span className={`text-[11px] font-bold ${isChecked ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Password update optional */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Alterar Senha de Acesso</span>
                  <button
                    type="button"
                    onClick={() => {
                      const auto = generateAutoPassword();
                      setEditPassword(auto);
                      setEditConfirmPassword(auto);
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-md"
                  >
                    Gerar Senha Automática
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Nova Senha Provisória</label>
                    <input 
                      type="text" 
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Deixe em branco para manter"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Confirmar Nova Senha</label>
                    <input 
                      type="text" 
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-100 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TEMP PASS ALERT DIALOG --- */}
      {tempPassAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-800">
              <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center font-bold shrink-0">
                <Key className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Acesso ao Ponto Criado com Sucesso!</h3>
                <p className="text-xs text-slate-500">{tempPassAlert.userName}</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                <span className="text-slate-600 font-medium">Login de Acesso:</span>
                <span className="font-mono font-bold text-slate-900">{tempPassAlert.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Senha Provisória:</span>
                <span className="font-mono font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded">{tempPassAlert.pass}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleShareWhatsApp({ name: tempPassAlert.userName, email: tempPassAlert.email } as any, tempPassAlert.pass);
                  setTempPassAlert(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Enviar Credenciais via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setTempPassAlert(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
