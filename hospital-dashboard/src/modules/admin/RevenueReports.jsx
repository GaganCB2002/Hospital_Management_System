import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useHospital } from '../../context/HospitalContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCompactInr, formatDate, formatInr } from '../../lib/formatters';

function generateDailyData(revenueData) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const daily = [];
  revenueData.forEach((m, mi) => {
    const daysInMonth = 28 + ((mi * 3) % 4);
    const dailyAvg = Math.round(m.revenue / daysInMonth);
    for (let d = 1; d <= daysInMonth; d += 3) {
      const variance = 0.7 + Math.random() * 0.6;
      const dayRev = Math.round(dailyAvg * variance);
      const dayExp = Math.round(dayRev * (0.45 + Math.random() * 0.2));
      daily.push({
        label: `${months[mi]} ${d}`,
        revenue: dayRev,
        expenses: dayExp,
        month: months[mi],
      });
    }
  });
  return daily;
}

function generateQuarterlyData(revenueData) {
  const quarters = [];
  for (let i = 0; i < revenueData.length; i += 3) {
    const chunk = revenueData.slice(i, i + 3);
    const label = `Q${Math.floor(i / 3) + 1}`;
    const revenue = chunk.reduce((s, m) => s + m.revenue, 0);
    const expenses = chunk.reduce((s, m) => s + m.expenses, 0);
    quarters.push({
      label,
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      month: label,
    });
  }
  return quarters;
}

function generateWeeklyData(revenueData) {
  const weekly = [];
  revenueData.forEach((m, mi) => {
    const weeksInMonth = 4 + (mi % 2 === 0 ? 1 : 0);
    const weeklyAvg = Math.round(m.revenue / weeksInMonth);
    for (let w = 1; w <= weeksInMonth; w++) {
      const variance = 0.75 + Math.random() * 0.5;
      const weekRev = Math.round(weeklyAvg * variance);
      const weekExp = Math.round(weekRev * (0.5 + Math.random() * 0.15));
      weekly.push({
        label: `${m.month} W${w}`,
        revenue: weekRev,
        expenses: weekExp,
        month: m.month,
      });
    }
  });
  return weekly;
}

function TransactionDetailModal({ invoice, onClose, isDark }) {
  if (!invoice) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl min-w-0 rounded-3xl border shadow-2xl backdrop-blur-xl p-6 sm:p-8 ${
          isDark
            ? 'bg-slate-950/90 border-white/[0.08]'
            : 'bg-white border-white/30 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center justify-between mb-6 w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
              <span className="material-symbols-outlined text-white text-lg">receipt_long</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-lg font-extrabold tracking-tight break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.id}</h3>
              <p className={`text-xs break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Transaction Details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer bg-transparent ${
              isDark ? 'border-white/[0.06] text-white/50 hover:bg-white/[0.08]' : 'border-slate-200 text-slate-500 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined text-lg block">close</span>
          </button>
        </div>

        <div className={`rounded-2xl border p-5 space-y-4 ${
          isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="grid grid-cols-2 gap-4 w-full min-w-0">
            <div className="min-w-0 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Patient Name</p>
              <p className={`text-sm font-bold mt-1 break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-800'}`}>{invoice.patient}</p>
            </div>
            <div className="min-w-0 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Patient ID</p>
              <p className={`text-sm font-bold mt-1 break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-800'}`}>{invoice.patientId}</p>
            </div>
            <div className="min-w-0 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Department</p>
              <p className={`text-sm font-bold mt-1 break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-800'}`}>{invoice.department}</p>
            </div>
            <div className="min-w-0 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Payment Method</p>
              <p className={`text-sm font-bold mt-1 break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-800'}`}>{invoice.method}</p>
            </div>
            <div className="min-w-0 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Date</p>
              <p className={`text-sm font-bold mt-1 break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDate(invoice.date)}</p>
            </div>
            <div className="min-w-0 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Status</p>
              <span className={`inline-block mt-1 rounded-full px-3 py-1 text-[11px] font-bold whitespace-normal ${
                invoice.status === 'Paid' ? 'bg-secondary/15 text-secondary' : 'bg-pending-bg text-pending-text'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          <div className={`border-t pt-4 w-full min-w-0 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between w-full min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Transaction Amount</p>
              <p className={`text-2xl font-extrabold shrink-0 break-words whitespace-normal ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatInr(invoice.amount)}</p>
            </div>
            <div className="flex items-center justify-between mt-2 w-full min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider break-words whitespace-normal ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Record Type</p>
              <p className={`text-sm font-bold break-words whitespace-normal ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                {invoice.status === 'Paid' ? 'Patient Billing' : 'Pending Collection'}
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-xl text-center text-xs w-full min-w-0 ${
          isDark ? 'bg-blue-500/5 text-white/40' : 'bg-blue-50 text-slate-500'
        }`}>
          <span className="break-words whitespace-normal">Transaction ID: {invoice.id} &bull; Recorded in financial ledger</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RevenueReports() {
  const { revenueData, billing } = useHospital();
  const { isDark } = useTheme();
  const [view, setView] = useState('Monthly');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const quarterlyData = useMemo(() => generateQuarterlyData(revenueData), [revenueData]);

  const chartData = useMemo(() => {
    if (view === 'Quarterly') return quarterlyData;
    return revenueData.map((m) => ({ label: m.month, revenue: m.revenue, expenses: m.expenses, month: m.month }));
  }, [view, quarterlyData, revenueData]);

  const maxValue = Math.max(...chartData.map((d) => d.revenue + d.expenses), 1);

  const totals = useMemo(() => {
    const grossRevenue = revenueData.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = revenueData.reduce((sum, m) => sum + m.expenses, 0);
    const outstandingDebt = billing.filter((i) => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
    return { grossRevenue, netMargin: grossRevenue ? ((grossRevenue - totalExpenses) / grossRevenue) * 100 : 0, totalExpenses, outstandingDebt };
  }, [billing, revenueData]);

  const departmentBreakdown = useMemo(() => {
    const deptMap = {};
    billing.forEach((inv) => {
      if (!deptMap[inv.department]) deptMap[inv.department] = { total: 0, paid: 0, pending: 0, count: 0 };
      deptMap[inv.department].total += inv.amount;
      deptMap[inv.department][inv.status === 'Paid' ? 'paid' : 'pending'] += inv.amount;
      deptMap[inv.department].count += 1;
    });
    return Object.entries(deptMap).sort((a, b) => b[1].total - a[1].total);
  }, [billing]);

  const methodBreakdown = useMemo(() => {
    const methodMap = {};
    billing.forEach((inv) => {
      if (!methodMap[inv.method]) methodMap[inv.method] = { total: 0, count: 0 };
      methodMap[inv.method].total += inv.amount;
      methodMap[inv.method].count += 1;
    });
    return Object.entries(methodMap).sort((a, b) => b[1].total - a[1].total);
  }, [billing]);

  const transactions = billing.map((invoice) => ({
    id: invoice.id,
    patientId: invoice.patientId,
    patient: invoice.patient,
    date: invoice.date,
    department: invoice.department,
    method: invoice.method,
    type: invoice.status === 'Paid' ? 'Patient Billing' : 'Pending Collection',
    amount: invoice.amount,
    status: invoice.status,
  }));

  function handleExportPDF() {
    const doc = new jsPDF('landscape');
    const pageW = 280;

    doc.setFillColor(0, 53, 95);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CUREPULSE HOSPITAL — FINANCIAL OVERVIEW REPORT', 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 24);
    doc.text(`Period: Jan — Jun 2026`, 200, 24);

    let y = 42;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 53, 95);
    doc.text('KEY FINANCIAL METRICS', 14, y);
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageW - 14, y);
    y += 6;

    const kpiData = [
      ['Gross Revenue', `INR ${totals.grossRevenue.toLocaleString('en-IN')}`],
      ['Net Profit Margin', `${totals.netMargin.toFixed(1)}%`],
      ['Total Expenses', `INR ${totals.totalExpenses.toLocaleString('en-IN')}`],
      ['Outstanding Debt', `INR ${totals.outstandingDebt.toLocaleString('en-IN')}`],
    ];
    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value']],
      body: kpiData,
      headStyles: { fillColor: [0, 53, 95], fontSize: 9 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 53, 95);
    doc.text('MONTHLY REVENUE BREAKDOWN', 14, y);
    y += 8;
    doc.line(14, y, pageW - 14, y);
    y += 6;

    const monthlyRows = revenueData.map((m) => [
      m.month,
      `INR ${m.revenue.toLocaleString('en-IN')}`,
      `INR ${m.expenses.toLocaleString('en-IN')}`,
      `INR ${(m.revenue - m.expenses).toLocaleString('en-IN')}`,
      `${(((m.revenue - m.expenses) / m.revenue) * 100).toFixed(1)}%`,
    ]);
    doc.autoTable({
      startY: y,
      head: [['Month', 'Revenue', 'Expenses', 'Net Profit', 'Margin']],
      body: monthlyRows,
      headStyles: { fillColor: [0, 53, 95], fontSize: 8 },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 53, 95);
    doc.text('DEPARTMENT-WISE REVENUE', 14, y);
    y += 8;
    doc.line(14, y, pageW - 14, y);
    y += 6;

    const deptRows = departmentBreakdown.map(([dept, data]) => [
      dept,
      `INR ${data.total.toLocaleString('en-IN')}`,
      data.count,
      `INR ${data.paid.toLocaleString('en-IN')}`,
      `INR ${data.pending.toLocaleString('en-IN')}`,
    ]);
    doc.autoTable({
      startY: y,
      head: [['Department', 'Total Revenue', 'Invoices', 'Collected', 'Pending']],
      body: deptRows,
      headStyles: { fillColor: [0, 53, 95], fontSize: 8 },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 53, 95);
    doc.text('PAYMENT METHOD BREAKDOWN', 14, y);
    y += 8;
    doc.line(14, y, pageW - 14, y);
    y += 6;

    const methodRows = methodBreakdown.map(([method, data]) => [
      method,
      `INR ${data.total.toLocaleString('en-IN')}`,
      data.count,
    ]);
    doc.autoTable({
      startY: y,
      head: [['Payment Method', 'Total Amount', 'Transaction Count']],
      body: methodRows,
      headStyles: { fillColor: [0, 53, 95], fontSize: 8 },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (y > 170) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 53, 95);
    doc.text('COMPLETE TRANSACTION LEDGER', 14, y);
    y += 8;
    doc.line(14, y, pageW - 14, y);
    y += 6;

    const txRows = billing.map((inv) => [
      inv.id, inv.patient, formatDate(inv.date), inv.department,
      inv.method, inv.status === 'Paid' ? 'Patient Billing' : 'Pending Collection',
      `INR ${inv.amount.toLocaleString('en-IN')}`, inv.status,
    ]);
    doc.autoTable({
      startY: y,
      head: [['ID', 'Patient', 'Date', 'Department', 'Method', 'Type', 'Amount', 'Status']],
      body: txRows,
      headStyles: { fillColor: [0, 53, 95], fontSize: 7 },
      styles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer-generated financial report. All amounts are in Indian Rupees (INR).', 14, y);
    doc.text(`Report ID: FIN-REP-${Date.now().toString(36).toUpperCase()}`, 14, y + 5);

    doc.save(`CurePulse_Financial_Report_${Date.now()}.pdf`);
    toast.success('Financial report PDF downloaded successfully');
  }

  return (
    <div className="space-y-6 pb-xl w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between w-full min-w-0 max-w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-display-lg text-primary dark:text-primary-fixed break-words whitespace-normal">Financial Overview</h1>
          <p className="text-body-lg text-on-surface-variant break-words whitespace-normal">Comprehensive view of hospital revenue, expense load, and pending collections.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportPDF}
            className="rounded-lg bg-primary px-5 py-2.5 text-body-md font-bold text-white transition-all active:scale-95 hover:bg-primary/90 cursor-pointer border-none flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 w-full min-w-0 max-w-full">
        {[
          { label: 'Gross Revenue', value: formatCompactInr(totals.grossRevenue), color: 'text-on-surface dark:text-white' },
          { label: 'Net Profit Margin', value: `${totals.netMargin.toFixed(1)}%`, color: 'text-on-surface dark:text-white' },
          { label: 'Total Expenses', value: formatCompactInr(totals.totalExpenses), color: 'text-on-surface dark:text-white' },
          { label: 'Outstanding Debt', value: formatCompactInr(totals.outstandingDebt), color: 'text-error' },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface w-full min-w-0"
          >
            <p className="text-label-md uppercase text-on-surface-variant break-words whitespace-normal">{card.label}</p>
            <h2 className={`mt-2 text-display-lg ${card.color} break-words whitespace-normal`}>{card.value}</h2>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr,0.5fr] w-full min-w-0 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface w-full min-w-0 max-w-full overflow-hidden"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full min-w-0 max-w-full">
            <div className="min-w-0 flex-1">
              <h2 className="text-headline-md text-on-surface break-words whitespace-normal">Revenue over Time</h2>
              <p className="text-body-md text-on-surface-variant break-words whitespace-normal">Indian currency formatting applied across all {view.toLowerCase()} periods. {view === 'Quarterly' ? 'Each quarter aggregates 3 months.' : 'Each bar shows revenue vs expenses.'}</p>
            </div>
            <div className="relative flex gap-1 shrink-0 p-1 rounded-xl bg-surface-container-low dark:bg-on-primary-fixed border border-outline-variant dark:border-outline">
              {['Monthly', 'Quarterly'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={`relative z-10 rounded-lg px-5 py-2 text-body-md font-bold transition-all duration-200 cursor-pointer border-none ${
                    view === option
                      ? 'text-white'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {option}
                </button>
              ))}
              <motion.div
                layoutId="revenue-view-indicator"
                className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-md"
                style={{
                  left: view === 'Monthly' ? '4px' : '50%',
                  width: 'calc(50% - 8px)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-3 w-full min-w-0 max-w-full ${
                view === 'Monthly' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
              }`}
            >
              {chartData.map((item, i) => {
                const revHeight = Math.max((item.revenue / maxValue) * 160, 4);
                const expHeight = Math.max((item.expenses / maxValue) * 160, 4);
                return (
                  <motion.div
                    key={`${view}-${item.label}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className="rounded-xl border border-outline-variant p-3 text-center dark:border-outline w-full min-w-0"
                  >
                    <div className="mx-auto flex h-44 items-end justify-center gap-1.5">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: revHeight }}
                        transition={{ duration: 0.5, delay: i * 0.02, ease: 'easeOut' }}
                        className="w-5 rounded-t bg-primary shadow-sm"
                        title={`Revenue: ${formatInr(item.revenue)}`}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: expHeight }}
                        transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
                        className="w-5 rounded-t bg-secondary shadow-sm"
                        title={`Expenses: ${formatInr(item.expenses)}`}
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-on-surface truncate break-words">{item.label}</p>
                    <p className="text-[10px] text-outline break-words">{formatCompactInr(item.revenue)}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface w-full min-w-0 max-w-full"
        >
          <h2 className="text-headline-md text-on-surface break-words whitespace-normal">Legend</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-body-md text-on-surface">Revenue</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-secondary" />
              <span className="text-body-md text-on-surface">Expenses</span>
            </div>
            <p className="text-body-md text-on-surface-variant">Every amount is rendered using the Indian numbering system.</p>
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant dark:border-outline">
            <h3 className="text-label-md uppercase text-on-surface-variant mb-3">Payment Methods</h3>
            <div className="space-y-2">
              {methodBreakdown.slice(0, 4).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-body-md text-on-surface">{method}</span>
                  <span className="text-label-md font-bold text-on-surface-variant">{formatCompactInr(data.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 w-full min-w-0 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface w-full min-w-0 max-w-full"
        >
          <h2 className="text-headline-md text-on-surface mb-4 break-words whitespace-normal">Revenue by Department</h2>
          <div className="space-y-3 w-full min-w-0 max-w-full">
            {departmentBreakdown.slice(0, 8).map(([dept, data]) => {
              const pct = totals.grossRevenue ? (data.total / totals.grossRevenue) * 100 : 0;
              return (
                <div key={dept} className="w-full min-w-0 max-w-full">
                  <div className="flex items-center justify-between mb-1 w-full min-w-0 max-w-full">
                    <span className="text-body-md font-medium text-on-surface truncate flex-1 min-w-0 break-words">{dept}</span>
                    <span className="text-label-md font-bold text-on-surface-variant shrink-0 ml-2">{formatCompactInr(data.total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden w-full min-w-0 max-w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-0.5 w-full min-w-0 max-w-full">
                    <span className="text-[10px] text-on-surface-variant">{data.count} invoices</span>
                    <span className="text-[10px] text-on-surface-variant">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface w-full min-w-0 max-w-full"
        >
          <h2 className="text-headline-md text-on-surface mb-4 break-words whitespace-normal">Collection Status</h2>
          <div className="space-y-4 w-full min-w-0 max-w-full">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-secondary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                </div>
                <div>
                  <p className="text-body-md font-bold text-on-surface">Collected Revenue</p>
                  <p className="text-label-md text-on-surface-variant">{billing.filter((i) => i.status === 'Paid').length} paid invoices</p>
                </div>
              </div>
              <p className="text-headline-md font-bold text-secondary">
                {formatCompactInr(billing.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-pending-bg/5 border border-pending-bg/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pending-bg/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-pending-text">pending</span>
                </div>
                <div>
                  <p className="text-body-md font-bold text-on-surface">Pending Collection</p>
                  <p className="text-label-md text-on-surface-variant">{billing.filter((i) => i.status === 'Pending').length} unpaid invoices</p>
                </div>
              </div>
              <p className="text-headline-md font-bold text-pending-text">
                {formatCompactInr(billing.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-label-md text-on-surface-variant mb-2">Collection Rate</p>
              <div className="h-3 rounded-full bg-surface-container-high overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totals.grossRevenue ? ((totals.grossRevenue - totals.outstandingDebt) / totals.grossRevenue) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-secondary to-emerald-500"
                />
              </div>
              <p className="text-right text-label-md text-on-surface-variant mt-1">
                {totals.grossRevenue ? (((totals.grossRevenue - totals.outstandingDebt) / totals.grossRevenue) * 100).toFixed(1) : 0}% collected
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface w-full min-w-0 max-w-full overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-5 dark:border-outline w-full min-w-0 max-w-full">
          <div className="min-w-0 flex-1">
            <h2 className="text-headline-md text-on-surface break-words whitespace-normal">Recent Financial Records</h2>
            <p className="text-body-md text-on-surface-variant break-words whitespace-normal">Click on a Transaction ID to view full details.</p>
          </div>
          <span className="text-label-md text-on-surface-variant shrink-0 ml-2">{billing.length} records</span>
        </div>
        <div className="overflow-x-auto w-full min-w-0 max-w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant dark:border-outline">
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Patient</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Date</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Department</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Method</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Type</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Amount</th>
                <th className="px-4 py-3.5 text-label-md uppercase text-on-surface-variant whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((record) => (
                <tr key={record.id} className="border-b border-outline-variant/40 dark:border-outline/40 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(record)}
                      className="font-body-md font-bold text-primary hover:text-primary-fixed-dim transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      {record.id}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-body-md text-on-surface break-words whitespace-normal min-w-0">{record.patient}</td>
                  <td className="px-4 py-4 text-body-md text-on-surface break-words whitespace-normal min-w-0">{formatDate(record.date)}</td>
                  <td className="px-4 py-4 text-body-md text-on-surface break-words whitespace-normal min-w-0">{record.department}</td>
                  <td className="px-4 py-4 text-body-md text-on-surface-variant break-words whitespace-normal min-w-0">{record.method}</td>
                  <td className="px-4 py-4 text-body-md text-on-surface-variant break-words whitespace-normal min-w-0">{record.type}</td>
                  <td className="px-4 py-4 text-body-md font-bold text-on-surface break-words whitespace-normal min-w-0">{formatInr(record.amount)}</td>
                  <td className="px-4 py-4 whitespace-normal min-w-0">
                    <span className={`inline-block rounded-full px-3 py-1 text-label-md font-bold ${
                      record.status === 'Paid' ? 'bg-secondary/15 text-secondary' : 'bg-pending-bg text-pending-text'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetailModal
            invoice={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
