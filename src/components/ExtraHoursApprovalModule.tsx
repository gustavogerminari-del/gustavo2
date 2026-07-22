import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  CheckSquare, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { ExtraHourRequest, PointCorrectionRequest, Employee } from '../types';
import { UserAccount } from '../types_master';

interface ExtraHoursApprovalModuleProps {
  extraHours: ExtraHourRequest[];
  pointCorrections: PointCorrectionRequest[];
  employees: Employee[];
  currentUser: UserAccount | null;
  onUpdateExtraHours: (updated: ExtraHourRequest[]) => void;
  onUpdatePointCorrections: (updated: PointCorrectionRequest[]) => void;
  triggerToast: (msg: string) => void;
}

export default function ExtraHoursApprovalModule({
  extraHours,
  pointCorrections,
  employees,
  currentUser,
  onUpdateExtraHours,
  onUpdatePointCorrections,
  triggerToast
}: ExtraHoursApprovalModuleProps) {
  const [activeTab, setActiveTab] = useState<'horas_extras' | 'correcoes_ponto'>('horas_extras');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchEmp, setSearchEmp] = useState<string>('');

  const isCoordenador = currentUser?.role === 'Coordenador';
  const isRHOrAdmin = !currentUser || currentUser.role === 'RH' || currentUser.role === 'Master' || currentUser.role === 'Empresa Administradora';

  // Handler for Coordenador action
  const handleCoordinatorAction = (id: string, action: 'Aprovar' | 'Rejeitar', notes?: string) => {
    const updated = extraHours.map(item => {
      if (item.id === id) {
        const newStatus = action === 'Aprovar' ? 'Aprovado Coordenador' : 'Rejeitado Coordenador';
        const approvals = item.approvals || [];
        approvals.push({
          step: 'Coordenador' as const,
          user: currentUser?.name || 'Coordenador',
          action: action === 'Aprovar' ? 'Aprovar' as const : 'Rejeitar' as const,
          date: new Date().toISOString().split('T')[0],
          notes
        });
        return {
          ...item,
          status: newStatus as ExtraHourRequest['status'],
          approvals
        };
      }
      return item;
    });
    onUpdateExtraHours(updated);
    triggerToast(`✓ Solicitação de hora extra ${action === 'Aprovar' ? 'aprovada' : 'rejeitada'} pelo Coordenador!`);
  };

  // Handler for RH action
  const handleRHAction = (id: string, action: 'Validar' | 'Rejeitar', notes?: string) => {
    const updated = extraHours.map(item => {
      if (item.id === id) {
        const newStatus = action === 'Validar' ? 'Validado RH' : 'Rejeitado RH';
        const approvals = item.approvals || [];
        approvals.push({
          step: 'RH' as const,
          user: currentUser?.name || 'RH',
          action: action === 'Validar' ? 'Validar' as const : 'Rejeitar' as const,
          date: new Date().toISOString().split('T')[0],
          notes
        });
        return {
          ...item,
          status: newStatus as ExtraHourRequest['status'],
          approvals
        };
      }
      return item;
    });
    onUpdateExtraHours(updated);
    triggerToast(`✓ Hora extra ${action === 'Validar' ? 'validada e lançada na folha' : 'rejeitada pelo RH'}!`);
  };

  // Handler for Point Correction approval
  const handlePointCorrectionAction = (id: string, status: 'Aprovado' | 'Rejeitado') => {
    const updated = pointCorrections.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status,
          approvedBy: currentUser?.name || 'RH',
          approvedDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    onUpdatePointCorrections(updated);
    triggerToast(`✓ Correção de ponto ${status.toLowerCase()} com sucesso!`);
  };

  const filteredExtraHours = extraHours.filter(item => {
    const matchSearch = !searchEmp || item.employeeName.toLowerCase().includes(searchEmp.toLowerCase()) || item.department.toLowerCase().includes(searchEmp.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || item.status === filterStatus;
    
    // Coordenador filtering
    if (isCoordenador) {
      const isMyTeam = item.coordinatorId === currentUser?.employeeId || employees.find(e => e.id === item.employeeId)?.coordinatorId === currentUser?.employeeId;
      return matchSearch && matchStatus && (isMyTeam || !item.coordinatorId);
    }
    return matchSearch && matchStatus;
  });

  const filteredPointCorrections = pointCorrections.filter(item => {
    const matchSearch = !searchEmp || item.employeeName.toLowerCase().includes(searchEmp.toLowerCase()) || item.department.toLowerCase().includes(searchEmp.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            <span>Central de Aprovações & Solicitações de Ponto</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {isCoordenador 
              ? 'Aprove as horas extras dos colaboradores da sua equipe.'
              : 'Valide as horas extras aprovadas por coordenadores para inclusão automática na folha de pagamento.'}
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('horas_extras')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'horas_extras' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Horas Extras ({extraHours.filter(h => h.status.startsWith('Pendente') || h.status === 'Aprovado Coordenador').length})
          </button>
          <button
            onClick={() => setActiveTab('correcoes_ponto')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'correcoes_ponto' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Correções de Ponto ({pointCorrections.filter(p => p.status === 'Pendente').length})
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por colaborador ou setor..."
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs pl-8"
          />
          <User className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs"
          >
            <option value="Todos">Todos</option>
            {activeTab === 'horas_extras' ? (
              <>
                <option value="Pendente Coordenador">Pendente Coordenador</option>
                <option value="Aprovado Coordenador">Aprovado Coordenador</option>
                <option value="Validado RH">Validado RH</option>
                <option value="Rejeitado Coordenador">Rejeitado Coordenador</option>
                <option value="Rejeitado RH">Rejeitado RH</option>
              </>
            ) : (
              <>
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Rejeitado">Rejeitado</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* TAB 1: HORAS EXTRAS */}
      {activeTab === 'horas_extras' && (
        <div className="space-y-4">
          {filteredExtraHours.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
              <CheckSquare className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhuma solicitação de hora extra encontrada</h3>
              <p className="text-slate-400 text-xs mt-1">Todas as horas extras foram processadas ou não há registros com o filtro atual.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredExtraHours.map((he) => {
                const isPendenteCoord = he.status === 'Pendente Coordenador';
                const isAprovadoCoord = he.status === 'Aprovado Coordenador';
                const isValidadoRH = he.status === 'Validado RH';
                const isRejeitado = he.status.startsWith('Rejeitado');

                return (
                  <div 
                    key={he.id} 
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col md:flex-row justify-between gap-4 ${
                      isValidadoRH ? 'border-emerald-200 bg-emerald-50/20' : isRejeitado ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        <span className="font-bold text-slate-900 text-sm">{he.employeeName}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium">{he.department}</span>
                        {he.coordinatorName && (
                          <span className="text-slate-500 text-xs italic">Coordenador: {he.coordinatorName}</span>
                        )}
                        
                        {/* Status Badge */}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-auto md:ml-0 ${
                          isValidadoRH ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          isAprovadoCoord ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          isPendenteCoord ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {he.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Data</span>
                          <span className="font-bold text-slate-800">{he.date}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Horário</span>
                          <span className="font-bold text-slate-800">{he.startTime} - {he.endTime}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Qtd / Tipo</span>
                          <span className="font-bold text-emerald-700">{he.hoursCount}h ({he.type})</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Motivo</span>
                          <span className="text-slate-700 truncate block">{he.reason}</span>
                        </div>
                      </div>

                      {/* Approvals History Trail */}
                      {he.approvals && he.approvals.length > 0 && (
                        <div className="text-[11px] text-slate-500 pt-1 space-y-1 border-t border-slate-100 mt-2">
                          <span className="font-semibold text-slate-600 block">Histórico de Validação:</span>
                          {he.approvals.map((app, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                              <span>
                                <strong>{app.step}:</strong> {app.user} - <em>{app.action}</em> em {app.date}
                                {app.notes && ` ("${app.notes}")`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex md:flex-col justify-end items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Coordenador Action Buttons */}
                      {isPendenteCoord && (isCoordenador || isRHOrAdmin) && (
                        <div className="flex space-x-2 w-full md:w-auto">
                          <button
                            onClick={() => handleCoordinatorAction(he.id, 'Aprovar')}
                            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Aprovar Coord.</span>
                          </button>
                          <button
                            onClick={() => handleCoordinatorAction(he.id, 'Rejeitar')}
                            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Rejeitar</span>
                          </button>
                        </div>
                      )}

                      {/* RH Action Buttons */}
                      {(isAprovadoCoord || (isPendenteCoord && isRHOrAdmin)) && isRHOrAdmin && (
                        <div className="flex space-x-2 w-full md:w-auto mt-1">
                          <button
                            onClick={() => handleRHAction(he.id, 'Validar')}
                            className="flex-1 md:flex-none bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-md"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Validar & Lançar Folha (RH)</span>
                          </button>
                          <button
                            onClick={() => handleRHAction(he.id, 'Rejeitar')}
                            className="flex-1 md:flex-none bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-3 py-2.5 rounded-xl"
                          >
                            Rejeitar RH
                          </button>
                        </div>
                      )}

                      {isValidadoRH && (
                        <div className="flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Lançado na Folha</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CORREÇÕES DE PONTO */}
      {activeTab === 'correcoes_ponto' && (
        <div className="space-y-4">
          {filteredPointCorrections.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
              <CheckSquare className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhuma solicitação de correção de ponto</h3>
              <p className="text-slate-400 text-xs mt-1">Não há ajustes de batida pendentes de validação.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPointCorrections.map((pc) => (
                <div key={pc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-900 text-sm">{pc.employeeName}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-600 text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium">{pc.department}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-auto ${
                        pc.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' :
                        pc.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pc.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">DATA</span>
                        <span className="font-bold text-slate-800">{pc.date}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">ENTRADA</span>
                        <span className="font-bold text-slate-800">{pc.clockIn || '--:--'}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">SAÍDA ALMOÇO</span>
                        <span className="font-bold text-slate-800">{pc.lunchOut || '--:--'}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">RETORNO ALMOÇO</span>
                        <span className="font-bold text-slate-800">{pc.lunchIn || '--:--'}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">SAÍDA</span>
                        <span className="font-bold text-slate-800">{pc.clockOut || '--:--'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <strong>Motivo alegado:</strong> {pc.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  {pc.status === 'Pendente' && isRHOrAdmin && (
                    <div className="flex md:flex-col justify-end items-end gap-2">
                      <button
                        onClick={() => handlePointCorrectionAction(pc.id, 'Aprovado')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aprovar Ajuste</span>
                      </button>
                      <button
                        onClick={() => handlePointCorrectionAction(pc.id, 'Rejeitado')}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1 shadow-sm"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
