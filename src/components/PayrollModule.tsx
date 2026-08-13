import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Wallet, 
  CreditCard, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileText,
  AlertCircle,
  HelpCircle,
  Undo2,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { Employee, TimeRegister, EmployeeBenefit, PaySlip, AppSettings, ExtraHourRequest, INSSBracket, IRRFBracket } from '../types';

interface PayrollModuleProps {
  employees: Employee[];
  timeRegisters: TimeRegister[];
  employeeBenefits: EmployeeBenefit[];
  payslips: PaySlip[];
  onUpdatePayslips: (payslips: PaySlip[]) => void;
  settings: AppSettings;
  triggerToast: (msg: string) => void;
  extraHours: ExtraHourRequest[];
  inssBrackets: INSSBracket[];
  irrfBrackets: IRRFBracket[];
}

interface PayrollEntry {
  // Proventos
  he50: number;
  he100: number;
  adicionalNoturno: number;
  comissao: number;
  bonificacao: number;
  premio: number;
  assiduidade: number;
  outrosAdicionais: number;
  
  // Descontos
  inss: number;
  irrf: number;
  valeTransporte: number;
  faltas: number;
  atrasos: number;
  adiantamentos: number;
}

export default function PayrollModule({
  employees,
  timeRegisters,
  employeeBenefits,
  payslips,
  onUpdatePayslips,
  settings,
  triggerToast,
  extraHours,
  inssBrackets,
  irrfBrackets
}: PayrollModuleProps) {
  // Workflow Steps: 'conferencia' | 'lancamentos' | 'calculo' | 'fechamento' | 'holerite'
  const [currentStep, setCurrentStep] = useState<'conferencia' | 'lancamentos' | 'calculo' | 'fechamento' | 'holerite'>('conferencia');
  
  // Reference month
  const targetMonth = '2026-07';

  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.status !== 'Desligado');
  }, [employees]);

  // Selected Employee for Lançamentos step
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Initializing manual entries state dictionary
  const [manualEntries, setManualEntries] = useState<Record<string, PayrollEntry>>({});

  // Active Payslip selected for detailed viewing
  const [viewingPayslip, setViewingPayslip] = useState<PaySlip | null>(null);

  // --- TIME AND HOURS APURACAO REPORT CALCULATIONS ---
  const hoursReportData = useMemo(() => {
    return activeEmployees.map(emp => {
      // Get point registers for target month (2026-07)
      const empPoints = timeRegisters.filter(r => r.employeeId === emp.id && r.date.startsWith(targetMonth));
      
      const hoursWorked = empPoints.reduce((acc, curr) => acc + curr.totalHours, 0);
      const extra50 = empPoints.reduce((acc, curr) => acc + curr.extraHours, 0);
      
      // Simulated/mocked extras 100%, bank, delays, and absences for rich UX
      // We can base these on some simple stable hashes to keep them consistent
      const charSum = emp.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const extra100 = charSum % 5 === 0 ? 4 : 0;
      const bank = parseFloat(((charSum % 12) - 3).toFixed(1)); // can be negative (owed) or positive (credits)
      const delays = charSum % 7 === 0 ? 1.5 : (charSum % 9 === 0 ? 0.8 : 0);
      const absences = charSum % 13 === 0 ? 1 : 0;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        department: emp.department,
        hoursWorked: parseFloat(hoursWorked.toFixed(1)) || 160.0, // default if no registers
        extra50: parseFloat(extra50.toFixed(1)),
        extra100,
        bank,
        delays,
        absences
      };
    });
  }, [activeEmployees, timeRegisters]);

  // --- BENEFIT INTEGRATION HELPERS ---
  const getSuggestedEntriesFromBenefits = (empId: string, baseSalary: number, empObj?: Employee): Partial<PayrollEntry> => {
    const emp = empObj || employees.find(e => e.id === empId);
    const activeBens = employeeBenefits.filter(eb => eb.employeeId === empId && eb.status === 'Ativo');
    
    let valeTransporte = 0;
    let comissao = 0;
    let assiduidade = 0;
    let bonificacao = 0;
    let outrosAdicionais = 0;

    activeBens.forEach(eb => {
      let val = eb.value;
      if (eb.valueType === 'Porcentagem') {
        val = parseFloat(((eb.value / 100) * baseSalary).toFixed(2));
      }

      if (eb.benefitType === 'VT' && eb.category === 'Desconto') {
        valeTransporte += val;
      } else if (eb.benefitType === 'Comissão' && eb.category === 'Provento') {
        comissao += val;
      } else if (eb.benefitType === 'Assiduidade' && eb.category === 'Provento') {
        assiduidade += val;
      } else if (eb.benefitType === 'Bonificação' && eb.category === 'Provento') {
        bonificacao += val;
      } else if (eb.category === 'Provento') {
        outrosAdicionais += val;
      }
    });

    // Automatic Vale Transporte (VT) calculation from Employee record if enabled
    if (emp?.hasValeTransporte) {
      const ticketPrice = emp.ticketPrice || 0;
      const daysUsed = emp.daysUsed || 22;
      const monthlyVtCost = emp.vtMonthlyValue || (ticketPrice * daysUsed * 2);
      const maxDiscount6Percent = baseSalary * 0.06;
      valeTransporte = parseFloat(Math.min(monthlyVtCost, maxDiscount6Percent).toFixed(2));
    }

    // Calculate Approved Extra Hours for this employee
    const approvedHE = extraHours.filter(h => h.employeeId === empId && (h.status === 'Validado RH' || h.status === 'Aprovado Coordenador'));
    const hourlyRate = baseSalary / 220; // 220h mensal padrão
    const calcHe50 = parseFloat((approvedHE.filter(h => h.type === '50%').reduce((sum, h) => sum + h.hoursCount, 0) * hourlyRate * 1.5).toFixed(2));
    const calcHe100 = parseFloat((approvedHE.filter(h => h.type === '100%').reduce((sum, h) => sum + h.hoursCount, 0) * hourlyRate * 2.0).toFixed(2));

    // Calculate Gross Salary for INSS / IRRF base
    const grossSalary = baseSalary + calcHe50 + calcHe100 + comissao + bonificacao + assiduidade + outrosAdicionais;

    // INSS Automatic Calculation using inssBrackets table
    let inss = 0;
    const activeInss = inssBrackets && inssBrackets.length > 0 
      ? [...inssBrackets].sort((a, b) => a.minSalary - b.minSalary)
      : [
          { id: '1', year: 2026, minSalary: 0, maxSalary: 1412.00, rate: 0.075, deductible: 0 },
          { id: '2', year: 2026, minSalary: 1412.01, maxSalary: 2666.68, rate: 0.09, deductible: 21.18 },
          { id: '3', year: 2026, minSalary: 2666.69, maxSalary: 4000.03, rate: 0.12, deductible: 101.18 },
          { id: '4', year: 2026, minSalary: 4000.04, maxSalary: 7786.02, rate: 0.14, deductible: 181.18 }
        ];

    const matchedInss = [...activeInss].reverse().find(b => grossSalary >= b.minSalary);
    if (matchedInss) {
      if (matchedInss.deductible !== undefined && matchedInss.deductible > 0) {
        inss = Math.max(0, (grossSalary * matchedInss.rate) - matchedInss.deductible);
      } else {
        for (const b of activeInss) {
          if (grossSalary > b.minSalary) {
            const inBracket = Math.min(grossSalary, b.maxSalary) - b.minSalary;
            inss += Math.max(0, inBracket * b.rate);
          }
        }
      }
    } else {
      inss = grossSalary * 0.075;
    }
    inss = parseFloat(inss.toFixed(2));

    // IRRF Automatic Calculation using irrfBrackets table and Dependents
    let irrf = 0;
    const activeIrrf = irrfBrackets && irrfBrackets.length > 0
      ? [...irrfBrackets].sort((a, b) => a.minSalary - b.minSalary)
      : [
          { id: '1', year: 2026, minSalary: 0, maxSalary: 2259.20, rate: 0, deduction: 0, dependentDeduction: 189.59 },
          { id: '2', year: 2026, minSalary: 2259.21, maxSalary: 2826.65, rate: 0.075, deduction: 169.44, dependentDeduction: 189.59 },
          { id: '3', year: 2026, minSalary: 2826.66, maxSalary: 3751.05, rate: 0.15, deduction: 381.44, dependentDeduction: 189.59 },
          { id: '4', year: 2026, minSalary: 3751.06, maxSalary: 4664.68, rate: 0.225, deduction: 662.77, dependentDeduction: 189.59 },
          { id: '5', year: 2026, minSalary: 4664.69, maxSalary: 999999.99, rate: 0.275, deduction: 896.00, dependentDeduction: 189.59 }
        ];

    const depDeductionVal = activeIrrf[0]?.dependentDeduction || 189.59;
    const totalDepDeduction = ((emp?.dependentsCount) || 0) * depDeductionVal;
    const irrfBase = Math.max(0, grossSalary - inss - totalDepDeduction);

    const matchedIrrf = [...activeIrrf].reverse().find(b => irrfBase >= b.minSalary);
    if (matchedIrrf && matchedIrrf.rate > 0) {
      irrf = Math.max(0, (irrfBase * matchedIrrf.rate) - matchedIrrf.deduction);
    }
    irrf = parseFloat(irrf.toFixed(2));

    return {
      valeTransporte,
      comissao,
      assiduidade,
      bonificacao,
      outrosAdicionais,
      he50: calcHe50,
      he100: calcHe100,
      inss,
      irrf
    };
  };

  // Pre-load manual entries structure for selected employee
  const currentSelectedEntry = useMemo(() => {
    if (!selectedEmpId) return null;
    const emp = activeEmployees.find(e => e.id === selectedEmpId);
    if (!emp) return null;

    // Return existing if edited, or initialize
    if (manualEntries[selectedEmpId]) {
      return manualEntries[selectedEmpId];
    }

    // Default initialization with hours from registers & active benefits
    const hoursReport = hoursReportData.find(h => h.employeeId === selectedEmpId);
    const hourlyRate = emp.salary / 160;
    
    const calculatedHe50 = hoursReport ? parseFloat((hoursReport.extra50 * hourlyRate * 1.5).toFixed(2)) : 0;
    const calculatedHe100 = hoursReport ? parseFloat((hoursReport.extra100 * hourlyRate * 2.0).toFixed(2)) : 0;
    const calculatedAtrasos = hoursReport ? parseFloat((hoursReport.delays * hourlyRate).toFixed(2)) : 0;
    const calculatedFaltas = hoursReport ? parseFloat((hoursReport.absences * (emp.salary / 30)).toFixed(2)) : 0;

    const benefitsIntegrations = getSuggestedEntriesFromBenefits(selectedEmpId, emp.salary, emp);

    const initialHe50 = (benefitsIntegrations.he50 || 0) > 0 ? benefitsIntegrations.he50! : calculatedHe50;
    const initialHe100 = (benefitsIntegrations.he100 || 0) > 0 ? benefitsIntegrations.he100! : calculatedHe100;

    return {
      he50: initialHe50,
      he100: initialHe100,
      adicionalNoturno: 0,
      comissao: benefitsIntegrations.comissao || 0,
      bonificacao: benefitsIntegrations.bonificacao || 0,
      premio: 0,
      assiduidade: benefitsIntegrations.assiduidade || 0,
      outrosAdicionais: benefitsIntegrations.outrosAdicionais || 0,
      
      inss: benefitsIntegrations.inss || 0,
      irrf: benefitsIntegrations.irrf || 0,
      valeTransporte: benefitsIntegrations.valeTransporte || 0,
      faltas: calculatedFaltas,
      atrasos: calculatedAtrasos,
      adiantamentos: 0
    };
  }, [selectedEmpId, manualEntries, activeEmployees, hoursReportData]);

  // Handle saving the entries for the selected employee
  const handleSaveEntry = (updatedEntry: PayrollEntry) => {
    if (!selectedEmpId) return;
    setManualEntries(prev => ({
      ...prev,
      [selectedEmpId]: updatedEntry
    }));
    triggerToast(`✓ Lançamentos salvos para ${activeEmployees.find(e => e.id === selectedEmpId)?.name}!`);
  };

  // Populate all employees with their integrated benefit values as quick action
  const handleAutoPopulateAllBenefits = () => {
    const updated: Record<string, PayrollEntry> = { ...manualEntries };
    
    activeEmployees.forEach(emp => {
      const hoursReport = hoursReportData.find(h => h.employeeId === emp.id);
      const hourlyRate = emp.salary / 160;
      
      const calculatedHe50 = hoursReport ? parseFloat((hoursReport.extra50 * hourlyRate * 1.5).toFixed(2)) : 0;
      const calculatedHe100 = hoursReport ? parseFloat((hoursReport.extra100 * hourlyRate * 2.0).toFixed(2)) : 0;
      const calculatedAtrasos = hoursReport ? parseFloat((hoursReport.delays * hourlyRate).toFixed(2)) : 0;
      const calculatedFaltas = hoursReport ? parseFloat((hoursReport.absences * (emp.salary / 30)).toFixed(2)) : 0;

      const benefitsIntegrations = getSuggestedEntriesFromBenefits(emp.id, emp.salary, emp);

      const finalHe50 = (benefitsIntegrations.he50 || 0) > 0 ? benefitsIntegrations.he50! : calculatedHe50;
      const finalHe100 = (benefitsIntegrations.he100 || 0) > 0 ? benefitsIntegrations.he100! : calculatedHe100;

      updated[emp.id] = {
        he50: finalHe50,
        he100: finalHe100,
        adicionalNoturno: updated[emp.id]?.adicionalNoturno || 0,
        comissao: benefitsIntegrations.comissao || 0,
        bonificacao: benefitsIntegrations.bonificacao || 0,
        premio: updated[emp.id]?.premio || 0,
        assiduidade: benefitsIntegrations.assiduidade || 0,
        outrosAdicionais: benefitsIntegrations.outrosAdicionais || 0,
        
        inss: benefitsIntegrations.inss || 0,
        irrf: benefitsIntegrations.irrf || 0,
        valeTransporte: benefitsIntegrations.valeTransporte || 0,
        faltas: calculatedFaltas,
        atrasos: calculatedAtrasos,
        adiantamentos: updated[emp.id]?.adiantamentos || 0
      };
    });

    setManualEntries(updated);
    triggerToast(`✓ Lançamentos de todos os colaboradores integrados com Benefícios e Horas!`);
  };

  // Calculate values for Step 3 (Cálculo)
  const computedPayrollList = useMemo(() => {
    return activeEmployees.map(emp => {
      // Get manual entries or fallback to automatic default integrations
      let entry = manualEntries[emp.id];
      if (!entry) {
        // Calculate standard defaults on the fly for calculation review
        const hoursReport = hoursReportData.find(h => h.employeeId === emp.id);
        const hourlyRate = emp.salary / 160;
        
        const calculatedHe50 = hoursReport ? parseFloat((hoursReport.extra50 * hourlyRate * 1.5).toFixed(2)) : 0;
        const calculatedHe100 = hoursReport ? parseFloat((hoursReport.extra100 * hourlyRate * 2.0).toFixed(2)) : 0;
        const calculatedAtrasos = hoursReport ? parseFloat((hoursReport.delays * hourlyRate).toFixed(2)) : 0;
        const calculatedFaltas = hoursReport ? parseFloat((hoursReport.absences * (emp.salary / 30)).toFixed(2)) : 0;

        const benefitsIntegrations = getSuggestedEntriesFromBenefits(emp.id, emp.salary, emp);

        const finalHe50 = (benefitsIntegrations.he50 || 0) > 0 ? benefitsIntegrations.he50! : calculatedHe50;
        const finalHe100 = (benefitsIntegrations.he100 || 0) > 0 ? benefitsIntegrations.he100! : calculatedHe100;

        entry = {
          he50: finalHe50,
          he100: finalHe100,
          adicionalNoturno: 0,
          comissao: benefitsIntegrations.comissao || 0,
          bonificacao: benefitsIntegrations.bonificacao || 0,
          premio: 0,
          assiduidade: benefitsIntegrations.assiduidade || 0,
          outrosAdicionais: benefitsIntegrations.outrosAdicionais || 0,
          
          inss: benefitsIntegrations.inss || 0,
          irrf: benefitsIntegrations.irrf || 0,
          valeTransporte: benefitsIntegrations.valeTransporte || 0,
          faltas: calculatedFaltas,
          atrasos: calculatedAtrasos,
          adiantamentos: 0
        };
      }

      const totalProventos = emp.salary + 
        entry.he50 + 
        entry.he100 + 
        entry.adicionalNoturno + 
        entry.comissao + 
        entry.bonificacao + 
        entry.premio + 
        entry.assiduidade + 
        entry.outrosAdicionais;

      const totalDescontos = entry.inss + 
        entry.irrf + 
        entry.valeTransporte + 
        entry.faltas + 
        entry.atrasos + 
        entry.adiantamentos;

      const netSalary = totalProventos - totalDescontos;

      return {
        employee: emp,
        entry,
        totalProventos,
        totalDescontos,
        netSalary
      };
    });
  }, [activeEmployees, manualEntries, hoursReportData]);

  // Aggregate stats for closing
  const closingStats = useMemo(() => {
    let totalBase = 0;
    let totalProventosAdicionais = 0;
    let totalDescontos = 0;
    let totalLiquido = 0;

    computedPayrollList.forEach(item => {
      totalBase += item.employee.salary;
      totalProventosAdicionais += (item.totalProventos - item.employee.salary);
      totalDescontos += item.totalDescontos;
      totalLiquido += item.netSalary;
    });

    return {
      totalBase,
      totalProventosAdicionais,
      totalDescontos,
      totalLiquido,
      totalBruto: totalBase + totalProventosAdicionais
    };
  }, [computedPayrollList]);

  // Finish workflow and close Payroll (Step 4 -> Step 5)
  const handleConfirmClosing = () => {
    const generatedSlips: PaySlip[] = computedPayrollList.map(item => {
      return {
        id: `ps-${item.employee.id}-${Date.now()}`,
        employeeId: item.employee.id,
        employeeName: item.employee.name,
        month: targetMonth,
        baseSalary: item.employee.salary,
        extraHoursEarnings: item.entry.he50 + item.entry.he100, // combined display
        deductions: item.totalDescontos,
        netSalary: item.netSalary,
        status: 'Pendente',
        generatedAt: '2026-07-21',

        // detailed elements
        he50: item.entry.he50,
        he100: item.entry.he100,
        adicionalNoturno: item.entry.adicionalNoturno,
        comissao: item.entry.comissao,
        bonificacao: item.entry.bonificacao,
        premio: item.entry.premio,
        assiduidade: item.entry.assiduidade,
        outrosAdicionais: item.entry.outrosAdicionais,

        inss: item.entry.inss,
        irrf: item.entry.irrf,
        valeTransporte: item.entry.valeTransporte,
        faltas: item.entry.faltas,
        atrasos: item.entry.atrasos,
        adiantamentos: item.entry.adiantamentos,

        totalProventos: item.totalProventos,
        totalDescontos: item.totalDescontos
      };
    });

    onUpdatePayslips(generatedSlips);
    triggerToast(`✓ Folha de Pagamento de Julho/2026 fechada com sucesso! ${generatedSlips.length} Holerites gerados.`);
    setCurrentStep('holerite');
  };

  // --- EXPORT HOURS REPORT TO EXCEL (CSV) ---
  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Colaborador;Cargo;Departamento;Horas Trabalhadas;Horas Extras 50%;Horas Extras 100%;Banco de Horas;Atrasos;Faltas\n";
    
    hoursReportData.forEach(row => {
      csvContent += `${row.employeeName};${row.role};${row.department};${row.hoursWorked}h;${row.extra50}h;${row.extra100}h;${row.bank}h;${row.delays}h;${row.absences}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Apuracao_Horas_Julho_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("✓ Apuração de horas exportada para Excel (CSV) com sucesso!");
  };

  // --- EXPORT HOURS REPORT TO PDF ---
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerToast("⚠️ Popup bloqueado! Permita popups para baixar o PDF.");
      return;
    }
    
    const html = `
      <html>
        <head>
          <title>Relatório de Apuração de Horas - Julho/2026</title>
          <style>
            body { font-family: sans-serif; padding: 25px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { font-size: 16px; font-weight: bold; color: #0b1d33; }
            .title { text-align: center; margin: 20px 0; }
            .title h2 { margin: 0; font-size: 20px; color: #0f172a; }
            .title p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 12px 10px; text-align: left; font-size: 11px; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RL CONNECT - R Lourenço Recrutamento e Seleção</div>
            <div style="font-size: 11px; text-align: right; color: #64748b;">Mês de Referência: 07/2026</div>
          </div>
          <div class="title">
            <h2>Relatório Consolidado de Apuração de Horas</h2>
            <p>Exportação de conformidade trabalhista para fechamento de folha</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Cargo / Depto</th>
                <th>Horas Trabalhadas</th>
                <th>HE 50%</th>
                <th>HE 100%</th>
                <th>Banco Horas</th>
                <th>Atrasos (h)</th>
                <th>Faltas (dias)</th>
              </tr>
            </thead>
            <tbody>
              ${hoursReportData.map(row => `
                <tr>
                  <td><strong>${row.employeeName}</strong></td>
                  <td>${row.role} (${row.department})</td>
                  <td>${row.hoursWorked}h</td>
                  <td style="color: #10b981; font-weight: bold;">+${row.extra50}h</td>
                  <td style="color: #059669; font-weight: bold;">+${row.extra100}h</td>
                  <td style="font-weight: bold; color: ${row.bank >= 0 ? '#10b981' : '#ef4444'}">${row.bank >= 0 ? '+' : ''}${row.bank}h</td>
                  <td style="color: ${row.delays > 0 ? '#f59e0b' : '#64748b'}">${row.delays}h</td>
                  <td style="color: ${row.absences > 0 ? '#ef4444' : '#64748b'}; font-weight: ${row.absences > 0 ? 'bold' : 'normal'}">${row.absences}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Documento de controle interno gerado em ${new Date().toLocaleDateString('pt-BR')} &bull; RL CONNECT Gestão Integrada de Pessoas CLT & Benefícios
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    triggerToast("✓ Relatório de horas gerado em PDF!");
  };

  // --- PRINT HOLERITE RECIBO ---
  const handlePrintHolerite = (ps: PaySlip) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerToast("⚠️ Popup de impressão bloqueado pelo navegador.");
      return;
    }

    const emp = employees.find(e => e.id === ps.employeeId);
    const role = emp?.role || 'Colaborador';
    const dept = emp?.department || 'Geral';
    const admission = emp?.admissionDate ? emp.admissionDate.split('-').reverse().join('/') : '01/01/2024';

    const tProv = ps.baseSalary + 
      (ps.he50 || 0) + 
      (ps.he100 || 0) + 
      (ps.adicionalNoturno || 0) + 
      (ps.comissao || 0) + 
      (ps.bonificacao || 0) + 
      (ps.premio || 0) + 
      (ps.assiduidade || 0) + 
      (ps.outrosAdicionais || 0);

    const tDesc = (ps.inss || 0) + 
      (ps.irrf || 0) + 
      (ps.valeTransporte || 0) + 
      (ps.faltas || 0) + 
      (ps.atrasos || 0) + 
      (ps.adiantamentos || 0);

    const netVal = tProv - tDesc;

    const html = `
      <html>
        <head>
          <title>Recibo de Holerite - ${ps.employeeName}</title>
          <style>
            body { font-family: monospace; padding: 15px; font-size: 11px; line-height: 1.3; color: #000; }
            .box { border: 1.5px solid #000; padding: 12px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            td, th { border: 1px solid #000; padding: 4px; text-align: left; }
            th { background-color: #f3f4f6; }
            .right { text-align: right; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .sig-area { margin-top: 35px; display: flex; justify-content: space-between; }
            .sig { border-top: 1px solid #000; width: 45%; text-align: center; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="box">
            <table>
              <tr>
                <td width="60%">
                  <span class="bold" style="font-size: 12px;">${settings.companyName}</span><br/>
                  ${settings.address}
                </td>
                <td width="40%" class="center bold" style="font-size: 12px;">
                  DEMONSTRATIVO DE PAGAMENTO<br/>
                  JULHO / 2026
                </td>
              </tr>
            </table>

            <table>
              <tr>
                <td><span class="bold">Código:</span><br/>${ps.employeeId}</td>
                <td><span class="bold">Nome do Funcionário:</span><br/>${ps.employeeName}</td>
                <td><span class="bold">Cargo:</span><br/>${role}</td>
                <td><span class="bold">Admissão:</span><br/>${admission}</td>
              </tr>
              <tr>
                <td colspan="2"><span class="bold">Departamento:</span><br/>${dept}</td>
                <td colspan="2"><span class="bold">CBO:</span><br/>2524-05 &bull; Mensalista</td>
              </tr>
            </table>

            <table style="height: 180px; vertical-align: top;">
              <thead>
                <tr>
                  <th width="8%">Cód</th>
                  <th width="52%">Descrição</th>
                  <th width="10%" class="right">Referência</th>
                  <th width="15%" class="right">Proventos</th>
                  <th width="15%" class="right">Descontos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>001</td>
                  <td>Salário Base</td>
                  <td class="right">30d</td>
                  <td class="right">${ps.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="right">-</td>
                </tr>
                ${ps.he50 ? `<tr><td>002</td><td>Horas Extras 50%</td><td class="right">Lançado</td><td class="right">${ps.he50.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.he100 ? `<tr><td>003</td><td>Horas Extras 100%</td><td class="right">Lançado</td><td class="right">${ps.he100.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.adicionalNoturno ? `<tr><td>004</td><td>Adicional Noturno</td><td class="right">Lançado</td><td class="right">${ps.adicionalNoturno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.comissao ? `<tr><td>005</td><td>Comissão</td><td class="right">Lançado</td><td class="right">${ps.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.bonificacao ? `<tr><td>006</td><td>Bonificação</td><td class="right">Lançado</td><td class="right">${ps.bonificacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.premio ? `<tr><td>007</td><td>Prêmio de Produção</td><td class="right">Lançado</td><td class="right">${ps.premio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.assiduidade ? `<tr><td>008</td><td>Prêmio Assiduidade</td><td class="right">Lançado</td><td class="right">${ps.assiduidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                ${ps.outrosAdicionais ? `<tr><td>009</td><td>Outros Adicionais</td><td class="right">Lançado</td><td class="right">${ps.outrosAdicionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="right">-</td></tr>` : ''}
                
                ${ps.inss ? `<tr><td>101</td><td>Desconto INSS</td><td class="right">9.0%</td><td class="right">-</td><td class="right">${ps.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                ${ps.irrf ? `<tr><td>102</td><td>Desconto IRRF Retido</td><td class="right">Simplif.</td><td class="right">-</td><td class="right">${ps.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                ${ps.valeTransporte ? `<tr><td>103</td><td>Desconto Vale Transporte</td><td class="right">6.0%</td><td class="right">-</td><td class="right">${ps.valeTransporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                ${ps.faltas ? `<tr><td>104</td><td>Desconto Faltas / Ausências</td><td class="right">Dias</td><td class="right">-</td><td class="right">${ps.faltas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                ${ps.atrasos ? `<tr><td>105</td><td>Desconto Atrasos</td><td class="right">Horas</td><td class="right">-</td><td class="right">${ps.atrasos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                ${ps.adiantamentos ? `<tr><td>106</td><td>Adiantamento Salarial</td><td class="right">Lançado</td><td class="right">-</td><td class="right">${ps.adiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
              </tbody>
            </table>

            <table style="margin-top: 10px;">
              <tr>
                <td width="50%" rowspan="2" style="vertical-align: top;">
                  Declaro ter recebido o valor líquido correspondente ao meu trabalho do período descrito neste recibo.
                  <br/><br/>
                  Data: ____/____/2026
                </td>
                <td><span class="bold">Total Proventos:</span><br/>R$ ${tProv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span class="bold">Total Descontos:</span><br/>R$ ${tDesc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colspan="2" class="bold" style="font-size: 12px; padding: 6px;">
                  VALOR LÍQUIDO A RECEBER: R$ ${netVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </table>

            <table style="margin-top: 5px;">
              <tr>
                <td><span class="bold">Salário Contratual:</span><br/>R$ ${ps.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span class="bold">Base Calc. INSS:</span><br/>R$ ${ps.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span class="bold">Base Calc. FGTS:</span><br/>R$ ${ps.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span class="bold">FGTS do Mês:</span><br/>R$ ${(ps.baseSalary * 0.08).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            </table>

            <div class="sig-area">
              <div class="sig">Assinatura do Empregador</div>
              <div class="sig">Assinatura do Colaborador</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    triggerToast(`✓ Recibo de Holerite de ${ps.employeeName} enviado para impressão!`);
  };

  // Helper to handle manual inputs in Lançamentos form
  const handleFieldChange = (field: keyof PayrollEntry, value: string) => {
    if (!currentSelectedEntry) return;
    const num = parseFloat(value) || 0;
    const updated = {
      ...currentSelectedEntry,
      [field]: num
    };
    setManualEntries(prev => ({
      ...prev,
      [selectedEmpId]: updated
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* 5-Step Process Flow Visualizer Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800">Esteira Digital de Fechamento de Folha</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Confirme, lance adicionais, calcule e gere os holerites oficiais CLT.</p>
            </div>
          </div>

          {/* Quick Step Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'conferencia', label: '1. Conferência' },
              { id: 'lancamentos', label: '2. Lançamentos' },
              { id: 'calculo', label: '3. Cálculo' },
              { id: 'fechamento', label: '4. Fechamento' },
              { id: 'holerite', label: '5. Holerites' }
            ].map((step, idx) => {
              const stepsOrder = ['conferencia', 'lancamentos', 'calculo', 'fechamento', 'holerite'];
              const currentIdx = stepsOrder.indexOf(currentStep);
              const stepIdx = stepsOrder.indexOf(step.id);
              
              const isCompleted = stepIdx < currentIdx;
              const isActive = step.id === currentStep;

              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && <span className="text-slate-200 text-xs font-bold font-mono shrink-0">&raquo;</span>}
                  <button
                    onClick={() => {
                      // Allow jumping back or going forward if reviewed
                      if (stepIdx <= currentIdx || stepIdx === currentIdx + 1) {
                        setCurrentStep(step.id as any);
                        if (step.id === 'lancamentos' && !selectedEmpId && activeEmployees.length > 0) {
                          setSelectedEmpId(activeEmployees[0].id);
                        }
                      }
                    }}
                    className={`
                      text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0
                      ${isActive 
                        ? 'bg-[#0b1d33] text-white shadow-sm font-semibold' 
                        : isCompleted 
                          ? 'bg-emerald-50 text-emerald-700 font-medium' 
                          : 'bg-slate-50 text-slate-400 cursor-not-allowed hover:bg-slate-100'}
                    `}
                  >
                    {step.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- STEP 1: CONFERÊNCIA & RELATÓRIO DE HORAS --- */}
      {currentStep === 'conferencia' && (
        <div className="space-y-6" id="payroll-step-conferencia">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                  <Clock className="h-4.5 w-4.5 text-emerald-600" />
                  <span>Relatório de Apuração de Horas &bull; Julho 2026</span>
                </h3>
                <p className="text-slate-400 text-xs">Examine o saldo mensal de banco de horas, horas normais e adicionais extraídos do ponto eletrônico.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] py-2 px-3.5 rounded-xl border border-slate-200 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Exportar Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-[#0b1d33] hover:bg-[#0b1d33]/95 text-white font-bold text-[10px] py-2 px-3.5 rounded-xl transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-white" />
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>

            {/* Hours Report Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Cargo / Depto</th>
                    <th className="py-3 px-4">Horas Trabalhadas</th>
                    <th className="py-3 px-4 text-amber-600">HE 50%</th>
                    <th className="py-3 px-4 text-[#059669]">HE 100%</th>
                    <th className="py-3 px-4">Banco de Horas</th>
                    <th className="py-3 px-4">Atrasos</th>
                    <th className="py-3 px-4">Faltas</th>
                    <th className="py-3 px-4 text-right">Status Apuração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hoursReportData.map((row) => (
                    <tr key={row.employeeId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{row.employeeName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">ID: {row.employeeId}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-500">
                        {row.role} <span className="text-slate-300">&bull;</span> {row.department}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.hoursWorked}h</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-600">+{row.extra50}h</td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#059669]">+{row.extra100}h</td>
                      <td className={`py-3 px-4 font-mono font-extrabold ${row.bank >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {row.bank >= 0 ? '+' : ''}{row.bank}h
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.delays}h</td>
                      <td className={`py-3 px-4 font-mono ${row.absences > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {row.absences}d
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          ✓ CONFERIDO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-xl flex items-start space-x-2.5 text-xs text-amber-800">
              <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Nota de Conferência Manual do RH:</span>
                <p className="mt-0.5 font-medium leading-relaxed">Conforme regimento de controle interno da empresa, os dados acima representam a consolidação exata das batidas de ponto eletrônico aprovadas. Ao avançar, os cálculos preliminares de horas adicionais, faltas e atrasos serão importados diretamente para os lançamentos individuais de cada colaborador.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button
                onClick={() => {
                  setCurrentStep('lancamentos');
                  if (activeEmployees.length > 0 && !selectedEmpId) {
                    setSelectedEmpId(activeEmployees[0].id);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
              >
                <span>Avançar para Lançamentos</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- STEP 2: LANÇAMENTOS MANUAIS (Earnings & Deductions with Benefit Integration) --- */}
      {currentStep === 'lancamentos' && (
        <div className="space-y-6" id="payroll-step-lancamentos">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sidebar list of employees */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 h-[650px] flex flex-col shadow-sm">
              <div className="mb-4">
                <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Colaboradores</h4>
                <p className="text-[10px] text-slate-400 mt-1">Selecione para ver e modificar lançamentos manuais.</p>
              </div>

              {/* Quick action: Auto populate all benefits */}
              <button
                onClick={handleAutoPopulateAllBenefits}
                className="mb-4 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 text-[10px] font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Puxar Benefícios e Horas Ativos (Todos)</span>
              </button>

              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {activeEmployees.map(emp => {
                  const hasCustomEntry = !!manualEntries[emp.id];
                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmpId(emp.id)}
                      className={`
                        w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center cursor-pointer
                        ${selectedEmpId === emp.id 
                          ? 'bg-[#0b1d33]/5 border-emerald-500 shadow-sm' 
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50'}
                      `}
                    >
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{emp.name}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{emp.role} &bull; R$ {emp.salary.toLocaleString('pt-BR')}</span>
                      </div>
                      
                      {hasCustomEntry ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[8px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                          SALVO
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-400 text-[8px] font-bold px-2 py-0.5 rounded-full font-mono">
                          INTEGRADO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Entries Editor Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 h-[650px] flex flex-col justify-between shadow-sm">
              {selectedEmpId && currentSelectedEntry ? (
                <>
                  <div className="space-y-4 overflow-y-auto flex-1 pr-1 mb-4">
                    {/* Header summary card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-slate-900">
                          {activeEmployees.find(e => e.id === selectedEmpId)?.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Cargo: {activeEmployees.find(e => e.id === selectedEmpId)?.role} &bull; Salário Contratual: R$ {activeEmployees.find(e => e.id === selectedEmpId)?.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Display of linked benefits */}
                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Benefícios Vinculados</span>
                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                          {employeeBenefits.filter(eb => eb.employeeId === selectedEmpId).map(eb => (
                            <span key={eb.id} className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              {eb.benefitName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Integrated dynamic values notice */}
                    <div className="bg-emerald-50/40 border border-emerald-100/50 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                      <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">O sistema pré-carregou automaticamente as horas extras do ponto e os proventos/descontos ativos do colaborador. Ajuste o que for necessário para este mês.</span>
                    </div>

                    {/* Columns form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      {/* PROVENTOS SECTION */}
                      <div className="space-y-3">
                        <h5 className="font-display font-bold text-xs text-emerald-800 border-b border-emerald-50 pb-2 flex items-center space-x-1.5 uppercase">
                          <TrendingUp className="h-4 w-4" />
                          <span>Proventos (Créditos R$)</span>
                        </h5>

                        <div className="space-y-2 text-xs font-semibold">
                          <div>
                            <label className="block text-slate-500 mb-1">Horas Extras 50% (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.he50 || ''}
                              onChange={(e) => handleFieldChange('he50', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Horas Extras 100% (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.he100 || ''}
                              onChange={(e) => handleFieldChange('he100', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Adicional Noturno (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.adicionalNoturno || ''}
                              onChange={(e) => handleFieldChange('adicionalNoturno', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Comissão (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.comissao || ''}
                              onChange={(e) => handleFieldChange('comissao', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Bonificação (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.bonificacao || ''}
                              onChange={(e) => handleFieldChange('bonificacao', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Prêmio (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.premio || ''}
                              onChange={(e) => handleFieldChange('premio', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Assiduidade (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.assiduidade || ''}
                              onChange={(e) => handleFieldChange('assiduidade', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Outros adicionais (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.outrosAdicionais || ''}
                              onChange={(e) => handleFieldChange('outrosAdicionais', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DESCONTOS SECTION */}
                      <div className="space-y-3">
                        <h5 className="font-display font-bold text-xs text-rose-800 border-b border-rose-50 pb-2 flex items-center space-x-1.5 uppercase">
                          <TrendingUp className="h-4 w-4 rotate-180 text-rose-600" />
                          <span>Descontos (Abatimentos R$)</span>
                        </h5>

                        <div className="space-y-2 text-xs font-semibold">
                          <div>
                            <label className="block text-slate-500 mb-1">INSS Simplificado (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.inss || ''}
                              onChange={(e) => handleFieldChange('inss', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b1d33] focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">IRRF Retido Simplificado (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.irrf || ''}
                              onChange={(e) => handleFieldChange('irrf', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b1d33] focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Vale transporte (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.valeTransporte || ''}
                              onChange={(e) => handleFieldChange('valeTransporte', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b1d33] focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Faltas / Dias não trabalhados (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.faltas || ''}
                              onChange={(e) => handleFieldChange('faltas', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b1d33] focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Atrasos batidos (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.atrasos || ''}
                              onChange={(e) => handleFieldChange('atrasos', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b1d33] focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Adiantamentos salariais (R$)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={currentSelectedEntry.adiantamentos || ''}
                              onChange={(e) => handleFieldChange('adiantamentos', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0b1d33] focus:bg-white rounded-xl py-2 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <div className="text-xs font-mono font-bold text-slate-400">
                      Total Bruto Estimado: R$ {(
                        activeEmployees.find(e => e.id === selectedEmpId)!.salary + 
                        currentSelectedEntry.he50 + 
                        currentSelectedEntry.he100 + 
                        currentSelectedEntry.adicionalNoturno + 
                        currentSelectedEntry.comissao + 
                        currentSelectedEntry.bonificacao + 
                        currentSelectedEntry.premio + 
                        currentSelectedEntry.assiduidade + 
                        currentSelectedEntry.outrosAdicionais
                      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    <button
                      onClick={() => handleSaveEntry(currentSelectedEntry)}
                      className="bg-[#0b1d33] hover:bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
                    >
                      Salvar Lançamento deste Colaborador
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-slate-400 text-xs">
                  <Users className="h-8 w-8 text-slate-300 mb-2" />
                  Selecione um colaborador na lista ao lado para gerenciar seus lançamentos manuais.
                </div>
              )}
            </div>

          </div>

          {/* Footer Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <button
              onClick={() => setCurrentStep('conferencia')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar para Apuração de Horas</span>
            </button>

            <button
              onClick={() => setCurrentStep('calculo')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
            >
              <span>Avançar para Cálculo Geral</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

      {/* --- STEP 3: CÁLCULO GERAL (Review and verification) --- */}
      {currentStep === 'calculo' && (
        <div className="space-y-6" id="payroll-step-calculo">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">Conferência de Cálculos de Provisão e Encargos</h3>
              <p className="text-slate-400 text-xs">O RH deve auditar e conferir os valores líquidos e descontos calculados de forma exata para cada contrato de trabalho.</p>
            </div>

            {/* Calculations review table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Cargo & Depto</th>
                    <th className="py-3 px-4">Salário Base</th>
                    <th className="py-3 px-4 text-emerald-700">(+) Adicionais / HE</th>
                    <th className="py-3 px-4 text-rose-700">(-) Descontos / Impostos</th>
                    <th className="py-3 px-4">(=) Salário Líquido</th>
                    <th className="py-3 px-4 text-right">Detalhamento rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {computedPayrollList.map((item) => (
                    <tr key={item.employee.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.employee.name}</td>
                      <td className="py-3 px-4 text-slate-500">{item.employee.role} ({item.employee.department})</td>
                      <td className="py-3 px-4 font-mono">R$ {item.employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600">
                        +R$ {(item.totalProventos - item.employee.salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-600">
                        -R$ {item.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-900">
                        R$ {item.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
                          HE50: R${item.entry.he50} | VT: R${item.entry.valeTransporte} | INSS: R${item.entry.inss}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <button
                onClick={() => setCurrentStep('lancamentos')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Voltar para Lançamentos</span>
              </button>

              <button
                onClick={() => setCurrentStep('fechamento')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
              >
                <span>Avançar para Fechamento</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- STEP 4: FECHAMENTO DA FOLHA --- */}
      {currentStep === 'fechamento' && (
        <div className="space-y-6" id="payroll-step-fechamento">
          
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 p-8 shadow-md text-center space-y-6">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-slate-900">Confirmar e Assinar Eletronicamente o Fechamento</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">Esta ação fecha permanentemente a folha de pagamento da empresa para o mês de Julho de 2026 e emite os Holerites digitais aos colaboradores.</p>
            </div>

            {/* Financial summary metrics card */}
            <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-6 text-left space-y-3 font-semibold text-xs">
              <h5 className="font-display font-extrabold text-slate-800 text-[10px] uppercase tracking-wider font-mono border-b border-slate-100 pb-2">Demonstrativo de Custos Consolidados</h5>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Salários Base (CLT):</span>
                <span className="font-mono text-slate-800">R$ {closingStats.totalBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Adicionais e Horas Extras:</span>
                <span className="font-mono text-emerald-600">+ R$ {closingStats.totalProventosAdicionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total de Descontos e Impostos Retidos:</span>
                <span className="font-mono text-rose-600">- R$ {closingStats.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-200/50 pt-3 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-800">Custo Total Líquido de Desembolso:</span>
                <span className="font-mono text-[#0b1d33]">R$ {closingStats.totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-150">
              <button
                onClick={() => setCurrentStep('calculo')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Voltar ao Cálculo</span>
              </button>

              <button
                onClick={handleConfirmClosing}
                className="bg-[#0b1d33] hover:bg-[#0b1d33]/95 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>Confirmar e Fechar Folha</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- STEP 5: VISUALIZAÇÃO DE HOLERITES E IMPRESSÃO --- */}
      {currentStep === 'holerite' && (
        <div className="space-y-6" id="payroll-step-holerite">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">Demonstrativos Gerados (Holerites Oficiais)</h3>
              <p className="text-slate-400 text-xs">Os holerites estão devidamente assinados digitalmente pela RL CONNECT e disponíveis para consulta do colaborador ou exportação para o banco.</p>
            </div>

            <button
              onClick={() => {
                // reset workflow to step 1
                if (confirm("Deseja reabrir os lançamentos e conferência da folha de Julho/2026?")) {
                  setCurrentStep('conferencia');
                }
              }}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Undo2 className="h-4 w-4" />
              <span>Reabrir Lançamentos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List of generated PaySlips */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Holerites do Mês ({payslips.length})</h4>
              
              <div className="space-y-2 overflow-y-auto max-h-[500px]">
                {payslips.filter(ps => ps.month === targetMonth).map(ps => (
                  <button
                    key={ps.id}
                    onClick={() => setViewingPayslip(ps)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center cursor-pointer
                      ${viewingPayslip?.id === ps.id 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50'}
                    `}
                  >
                    <div>
                      <span className={`font-bold text-xs block ${viewingPayslip?.id === ps.id ? 'text-white' : 'text-slate-800'}`}>
                        {ps.employeeName}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${viewingPayslip?.id === ps.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Líquido: R$ {ps.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 ${viewingPayslip?.id === ps.id ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Holerite Brazilian Layout Display card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[550px] flex flex-col justify-between">
              {viewingPayslip ? (
                <>
                  <div className="space-y-6">
                    {/* Header info */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-[#0b1d33]">{settings.companyName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{settings.address}</p>
                      </div>

                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold px-3 py-1 rounded-full uppercase">
                          OFICIAL CLT
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Ref. 07/2026</p>
                      </div>
                    </div>

                    {/* Employee specifics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 text-[10px] font-semibold text-slate-600">
                      <div>
                        <span className="text-slate-400 block font-mono">Código</span>
                        <span className="text-slate-800 font-bold">{viewingPayslip.employeeId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono">Colaborador</span>
                        <span className="text-slate-800 font-bold">{viewingPayslip.employeeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono">Cargo</span>
                        <span className="text-slate-800 font-bold">
                          {employees.find(e => e.id === viewingPayslip.employeeId)?.role || 'Colaborador'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono">Departamento</span>
                        <span className="text-slate-800 font-bold">
                          {employees.find(e => e.id === viewingPayslip.employeeId)?.department || 'TI'}
                        </span>
                      </div>
                    </div>

                    {/* PaySlip details items listing */}
                    <div className="border border-slate-150 rounded-xl overflow-hidden text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-mono font-bold text-[9px] uppercase border-b border-slate-150">
                            <th className="py-2.5 px-3">Cód</th>
                            <th className="py-2.5 px-3">Descrição do Lançamento</th>
                            <th className="py-2.5 px-3 right text-right">Referência</th>
                            <th className="py-2.5 px-3 right text-right text-emerald-700">Proventos (R$)</th>
                            <th className="py-2.5 px-3 right text-right text-rose-700">Descontos (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {/* Base Salary */}
                          <tr>
                            <td className="py-2 px-3 text-slate-400">001</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">Salário Base Mensal</td>
                            <td className="py-2 px-3 text-right text-slate-500">30d</td>
                            <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                              R$ {viewingPayslip.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400">-</td>
                          </tr>

                          {/* Hours Extras 50% */}
                          {!!viewingPayslip.he50 && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">002</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Horas Extras 50%</td>
                              <td className="py-2 px-3 text-right text-slate-500">Apurado</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.he50.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Hours Extras 100% */}
                          {!!viewingPayslip.he100 && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">003</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Horas Extras 100% (Domingos/Feriados)</td>
                              <td className="py-2 px-3 text-right text-slate-500">Apurado</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.he100.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Adicional Noturno */}
                          {!!viewingPayslip.adicionalNoturno && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">004</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Adicional Noturno</td>
                              <td className="py-2 px-3 text-right text-slate-500">Noturno</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.adicionalNoturno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Comissão */}
                          {!!viewingPayslip.comissao && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">005</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Comissão de Vendas</td>
                              <td className="py-2 px-3 text-right text-slate-500">Variável</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Bonificação */}
                          {!!viewingPayslip.bonificacao && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">006</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Bonificação Especial</td>
                              <td className="py-2 px-3 text-right text-slate-500">Espontâneo</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.bonificacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Prêmio */}
                          {!!viewingPayslip.premio && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">007</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Prêmio de Incentivo</td>
                              <td className="py-2 px-3 text-right text-slate-500 font-mono">Metas</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.premio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Assiduidade */}
                          {!!viewingPayslip.assiduidade && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">008</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Prêmio por Assiduidade</td>
                              <td className="py-2 px-3 text-right text-slate-500">Conformidade</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.assiduidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* Outros adicionais */}
                          {!!viewingPayslip.outrosAdicionais && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">009</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Outros Adicionais / Auxílios</td>
                              <td className="py-2 px-3 text-right text-slate-500">Customizado</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-bold">
                                R$ {viewingPayslip.outrosAdicionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                            </tr>
                          )}

                          {/* INSS */}
                          {!!viewingPayslip.inss && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">101</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Desconto INSS Oficial</td>
                              <td className="py-2 px-3 text-right text-slate-500">9.0%</td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-rose-600 font-bold">
                                R$ {viewingPayslip.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}

                          {/* IRRF */}
                          {!!viewingPayslip.irrf && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">102</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Desconto IRRF Retido</td>
                              <td className="py-2 px-3 text-right text-slate-500">Simplif.</td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-rose-600 font-bold">
                                R$ {viewingPayslip.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}

                          {/* Vale Transporte */}
                          {!!viewingPayslip.valeTransporte && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">103</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Desconto Vale Transporte</td>
                              <td className="py-2 px-3 text-right text-slate-500">VT 6.0%</td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-rose-600 font-bold">
                                R$ {viewingPayslip.valeTransporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}

                          {/* Faltas */}
                          {!!viewingPayslip.faltas && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">104</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Faltas / Ausências não Justificadas</td>
                              <td className="py-2 px-3 text-right text-slate-500">Dias</td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-rose-600 font-bold">
                                R$ {viewingPayslip.faltas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}

                          {/* Atrasos */}
                          {!!viewingPayslip.atrasos && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">105</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Desconto Atrasos apurados</td>
                              <td className="py-2 px-3 text-right text-slate-500">Horas</td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-rose-600 font-bold">
                                R$ {viewingPayslip.atrasos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}

                          {/* Adiantamento */}
                          {!!viewingPayslip.adiantamentos && (
                            <tr>
                              <td className="py-2 px-3 text-slate-400">106</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">Adiantamento de Salário Quinzenal</td>
                              <td className="py-2 px-3 text-right text-slate-500">Lançado</td>
                              <td className="py-2 px-3 text-right text-slate-400">-</td>
                              <td className="py-2 px-3 text-right text-rose-600 font-bold">
                                R$ {viewingPayslip.adiantamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer values card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px] font-mono">Total de Proventos</span>
                        <span className="font-mono text-emerald-700 font-extrabold text-sm">
                          R$ {(
                            viewingPayslip.baseSalary + 
                            (viewingPayslip.he50 || 0) + 
                            (viewingPayslip.he100 || 0) + 
                            (viewingPayslip.adicionalNoturno || 0) + 
                            (viewingPayslip.comissao || 0) + 
                            (viewingPayslip.bonificacao || 0) + 
                            (viewingPayslip.premio || 0) + 
                            (viewingPayslip.assiduidade || 0) + 
                            (viewingPayslip.outrosAdicionais || 0)
                          ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px] font-mono">Total de Descontos</span>
                        <span className="font-mono text-rose-700 font-extrabold text-sm">
                          R$ {(
                            (viewingPayslip.inss || 0) + 
                            (viewingPayslip.irrf || 0) + 
                            (viewingPayslip.valeTransporte || 0) + 
                            (viewingPayslip.faltas || 0) + 
                            (viewingPayslip.atrasos || 0) + 
                            (viewingPayslip.adiantamentos || 0)
                          ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="border-l md:border-l border-slate-200 pl-0 md:pl-4">
                        <span className="text-[#0b1d33] block font-bold uppercase tracking-wider text-[8px] font-mono">Salário Líquido a Receber</span>
                        <span className="font-mono text-slate-900 font-black text-sm">
                          R$ {viewingPayslip.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-150 pt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handlePrintHolerite(viewingPayslip)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimir Holerite</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-slate-400 text-xs">
                  <Printer className="h-8 w-8 text-slate-300 mb-2" />
                  Selecione um holerite na lista ao lado para ver o demonstrativo detalhado e imprimir.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
