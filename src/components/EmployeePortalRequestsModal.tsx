import React, { useState } from 'react';
import { Clock, CheckCircle2, X, Plus, AlertCircle, FileText, Bus, HeartHandshake } from 'lucide-react';
import { ExtraHourRequest, PointCorrectionRequest, Employee } from '../types';

interface EmployeePortalRequestsModalProps {
  employee?: Employee;
  isOpen: boolean;
  type: 'hora_extra' | 'correcao_ponto' | 'beneficios';
  onClose: () => void;
  coordinators?: Employee[];
  onSubmitExtraHour: (request: ExtraHourRequest) => void;
  onSubmitPointCorrection: (request: PointCorrectionRequest) => void;
  triggerToast: (msg: string) => void;
}

export default function EmployeePortalRequestsModal({
  employee: propEmployee,
  isOpen,
  type,
  onClose,
  coordinators = [],
  onSubmitExtraHour,
  onSubmitPointCorrection,
  triggerToast
}: EmployeePortalRequestsModalProps) {
  if (!isOpen) return null;

  const employee: Employee = propEmployee || {
    id: 'emp-fallback',
    name: 'Colaborador',
    email: 'colaborador@empresa.com',
    phone: '(11) 99999-9999',
    role: 'Colaborador',
    department: 'Operacional',
    salary: 5000,
    admissionDate: '2026-01-01',
    status: 'Ativo',
    coordinatorName: 'Gestor Direto',
    hasValeTransporte: true,
    ticketPrice: 5.0,
    daysUsed: 22,
    vtMonthlyValue: 220
  };

  // Form State for Extra Hours
  const [heDate, setHeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [heStartTime, setHeStartTime] = useState<string>('18:00');
  const [heEndTime, setHeEndTime] = useState<string>('20:00');
  const [heHoursCount, setHeHoursCount] = useState<number>(2.0);
  const [heType, setHeType] = useState<'50%' | '100%' | 'Banco de Horas'>('50%');
  const [heReason, setHeReason] = useState<string>('');
  const [heCoordinatorId, setHeCoordinatorId] = useState<string>(employee.coordinatorId || '');

  // Form State for Point Correction
  const [pcDate, setPcDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pcClockIn, setPcClockIn] = useState<string>('08:00');
  const [pcLunchOut, setPcLunchOut] = useState<string>('12:00');
  const [pcLunchIn, setPcLunchIn] = useState<string>('13:00');
  const [pcClockOut, setPcClockOut] = useState<string>('17:00');
  const [pcReason, setPcReason] = useState<string>('');

  const handleExtraHourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heReason.trim()) {
      alert('Por favor informe a justificativa da hora extra!');
      return;
    }

    const selectedCoord = coordinators.find(c => c.id === heCoordinatorId);

    const newRequest: ExtraHourRequest = {
      id: `he-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      coordinatorId: heCoordinatorId || employee.coordinatorId,
      coordinatorName: selectedCoord ? selectedCoord.name : employee.coordinatorName || 'Coordenador Direto',
      date: heDate,
      startTime: heStartTime,
      endTime: heEndTime,
      hoursCount: Number(heHoursCount),
      type: heType,
      reason: heReason,
      status: 'Pendente Coordenador',
      createdAt: new Date().toISOString()
    };

    onSubmitExtraHour(newRequest);
    triggerToast('✓ Solicitação de hora extra enviada com sucesso ao seu Coordenador!');
    onClose();
  };

  const handlePointCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pcReason.trim()) {
      alert('Por favor informe a justificativa do ajuste!');
      return;
    }

    const newCorrection: PointCorrectionRequest = {
      id: `pc-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      date: pcDate,
      clockIn: pcClockIn,
      lunchOut: pcLunchOut,
      lunchIn: pcLunchIn,
      clockOut: pcClockOut,
      reason: pcReason,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    onSubmitPointCorrection(newCorrection);
    triggerToast('✓ Solicitação de correção de ponto enviada para análise do RH!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#047857] text-white p-5 flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-base">
              {type === 'hora_extra' && 'Solicitar Hora Extra'}
              {type === 'correcao_ponto' && 'Solicitar Ajuste de Ponto'}
              {type === 'beneficios' && 'Meus Benefícios & Vale Transporte'}
            </h3>
            <p className="text-emerald-100 text-xs font-medium mt-0.5">
              {employee.name} • {employee.department}
            </p>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. SOLICITAR HORA EXTRA */}
        {type === 'hora_extra' && (
          <form onSubmit={handleExtraHourSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Hora Extra *</label>
                <input
                  type="date"
                  required
                  value={heDate}
                  onChange={(e) => setHeDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Adicional *</label>
                <select
                  value={heType}
                  onChange={(e) => setHeType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                >
                  <option value="50%">Hora Extra 50% (Dias úteis)</option>
                  <option value="100%">Hora Extra 100% (Domingos/Feriados)</option>
                  <option value="Banco de Horas">Banco de Horas</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Início</label>
                <input
                  type="time"
                  required
                  value={heStartTime}
                  onChange={(e) => setHeStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fim</label>
                <input
                  type="time"
                  required
                  value={heEndTime}
                  onChange={(e) => setHeEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qtd Horas</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={heHoursCount}
                  onChange={(e) => setHeHoursCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Coordenador Responsável *</label>
              <select
                value={heCoordinatorId}
                onChange={(e) => setHeCoordinatorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
              >
                <option value="">-- Coordenador Direto --</option>
                {coordinators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Justificativa / Motivo *</label>
              <textarea
                required
                rows={3}
                value={heReason}
                onChange={(e) => setHeReason(e.target.value)}
                placeholder="Ex: Suporte ao fechamento contábil mensal ou entrega urgente de projeto."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Enviar Solicitação
              </button>
            </div>
          </form>
        )}

        {/* 2. SOLICITAR CORREÇÃO DE PONTO */}
        {type === 'correcao_ponto' && (
          <form onSubmit={handlePointCorrectionSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data do Registro *</label>
              <input
                type="date"
                required
                value={pcDate}
                onChange={(e) => setPcDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Entrada</label>
                <input
                  type="time"
                  value={pcClockIn}
                  onChange={(e) => setPcClockIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saída Almoço</label>
                <input
                  type="time"
                  value={pcLunchOut}
                  onChange={(e) => setPcLunchOut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Volta Almoço</label>
                <input
                  type="time"
                  value={pcLunchIn}
                  onChange={(e) => setPcLunchIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saída Final</label>
                <input
                  type="time"
                  value={pcClockOut}
                  onChange={(e) => setPcClockOut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo do Esquecimento / Ajuste *</label>
              <textarea
                required
                rows={3}
                value={pcReason}
                onChange={(e) => setPcReason(e.target.value)}
                placeholder="Ex: Ponto biométrico sem sinal ou esquecimento ao sair para almoço externamente."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Solicitar Ajuste ao RH
              </button>
            </div>
          </form>
        )}

        {/* 3. CONSULTA DE BENEFÍCIOS E VALE TRANSPORTE */}
        {type === 'beneficios' && (
          <div className="p-6 space-y-4">
            
            {/* Vale Transporte Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Bus className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Vale Transporte (VT CLT)</h4>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${employee.hasValeTransporte ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {employee.hasValeTransporte ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {employee.hasValeTransporte ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">VALOR PASSAGEM</span>
                    <span className="font-bold text-slate-800">R$ {(employee.ticketPrice || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DIAS UTILIZADOS</span>
                    <span className="font-bold text-slate-800">{employee.daysUsed || 22} dias</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CUSTO MENSAL TOTAL</span>
                    <span className="font-bold text-slate-800">
                      R$ {(employee.vtMonthlyValue || ((employee.ticketPrice || 0) * (employee.daysUsed || 22) * 2)).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DESCONTO MÁX. (6% SALÁRIO)</span>
                    <span className="font-bold text-emerald-700">
                      - R$ {Math.min(
                        employee.vtMonthlyValue || ((employee.ticketPrice || 0) * (employee.daysUsed || 22) * 2),
                        (employee.salary || 0) * 0.06
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Você optou por não utilizar o benefício de Vale Transporte.</p>
              )}
            </div>

            {/* General Info */}
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <strong className="block font-bold">Assistência & Plano de Saúde:</strong>
              <p>Inclusão no convênio médico corporativo ativada. Em caso de dúvidas sobre inclusão de dependentes ({employee.dependentsCount || 0} cadastrados), contate o RH.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                Fechar
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
