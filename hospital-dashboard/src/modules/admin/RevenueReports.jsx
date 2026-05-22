import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useHospital } from '../../context/HospitalContext';
import { formatCompactInr, formatDate, formatInr } from '../../lib/formatters';


export default function RevenueReports() {
  const { revenueData, billing } = useHospital();
  const [view, setView] = useState('Monthly');

  const totals = useMemo(() => {
    const grossRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
    const totalExpenses = revenueData.reduce((sum, month) => sum + month.expenses, 0);
    const outstandingDebt = billing.filter((invoice) => invoice.status === 'Pending').reduce((sum, invoice) => sum + invoice.amount, 0);
    return {
      grossRevenue,
      netMargin: grossRevenue ? ((grossRevenue - totalExpenses) / grossRevenue) * 100 : 0,
      totalExpenses,
      outstandingDebt,
    };
  }, [billing, revenueData]);

  const transactions = billing.slice(0, 6).map((invoice) => ({
    id: invoice.id,
    date: invoice.date,
    department: invoice.department,
    type: invoice.status === 'Paid' ? 'Patient Billing' : 'Pending Collection',
    amount: invoice.amount,
    status: invoice.status,
  }));

  function handleExportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0, 53, 95); // Primary color
    doc.text('CurePulse Hospital Financial Overview', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(114, 119, 128);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    doc.text(`Gross Revenue: INR ${totals.grossRevenue.toLocaleString('en-IN')}`, 14, 34);
    doc.text(`Total Expenses: INR ${totals.totalExpenses.toLocaleString('en-IN')}`, 14, 40);
    doc.text(`Net Profit Margin: ${totals.netMargin.toFixed(1)}%`, 14, 46);
    doc.text(`Outstanding Debt: INR ${totals.outstandingDebt.toLocaleString('en-IN')}`, 14, 52);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 56, 196, 56);

    const tableColumn = ["Transaction ID", "Date", "Department", "Type", "Amount", "Status"];
    const tableRows = billing.map(invoice => [
      invoice.id,
      formatDate(invoice.date),
      invoice.department,
      invoice.status === 'Paid' ? 'Patient Billing' : 'Pending Collection',
      `INR ${invoice.amount.toLocaleString('en-IN')}`,
      invoice.status
    ]);
    
    doc.autoTable({
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [0, 53, 95] },
      theme: 'striped'
    });

    doc.save(`financial_overview_${Date.now()}.pdf`);
    toast.success('Financial PDF Report Downloaded');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-display-lg text-primary dark:text-primary-fixed">Financial Overview</h1>
          <p className="text-body-lg text-on-surface-variant">Comprehensive view of hospital revenue, expense load, and pending collections.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 text-body-md dark:border-outline">
            This Month
          </button>
          <button type="button" onClick={handleExportPDF} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white transition-all active:scale-95">
            Export PDF
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Gross Revenue</p>
          <h2 className="mt-2 text-display-lg text-on-surface">{formatCompactInr(totals.grossRevenue)}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Net Profit Margin</p>
          <h2 className="mt-2 text-display-lg text-on-surface">{totals.netMargin.toFixed(1)}%</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Total Expenses</p>
          <h2 className="mt-2 text-display-lg text-on-surface">{formatCompactInr(totals.totalExpenses)}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Outstanding Debt</p>
          <h2 className="mt-2 text-display-lg text-error">{formatCompactInr(totals.outstandingDebt)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr,0.5fr]">
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-headline-md text-on-surface">Revenue over Time</h2>
              <p className="text-body-md text-on-surface-variant">Indian currency formatting applied across all months.</p>
            </div>
            <div className="flex gap-2">
              {['Daily', 'Weekly', 'Monthly'].map((option) => (
                <button key={option} type="button" onClick={() => setView(option)} className={`rounded-lg px-3 py-2 text-body-md font-bold ${view === option ? 'bg-primary text-white' : 'bg-surface-container-low dark:bg-on-primary-fixed'}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {revenueData.map((month) => {
              const combined = month.revenue + month.expenses;
              const revenueHeight = combined ? Math.round((month.revenue / combined) * 140) : 0;
              const expenseHeight = combined ? Math.round((month.expenses / combined) * 140) : 0;
              return (
                <div key={month.month} className="rounded-xl border border-outline-variant p-4 text-center dark:border-outline">
                  <div className="mx-auto flex h-40 items-end justify-center gap-2">
                    <div className="w-6 rounded-t bg-primary" style={{ height: `${revenueHeight}px` }} title={formatInr(month.revenue)} />
                    <div className="w-6 rounded-t bg-secondary" style={{ height: `${expenseHeight}px` }} title={formatInr(month.expenses)} />
                  </div>
                  <p className="mt-3 text-body-md font-bold text-on-surface">{month.month}</p>
                  <p className="text-label-md text-outline">{formatCompactInr(month.revenue)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
          <h2 className="text-headline-md text-on-surface">Legend</h2>
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
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface">
        <div className="flex items-center justify-between border-b border-outline-variant p-5 dark:border-outline">
          <div>
            <h2 className="text-headline-md text-on-surface">Recent Financial Records</h2>
            <p className="text-body-md text-on-surface-variant">Detailed ledger of recent patient collections and pending invoices.</p>
          </div>
          <button type="button" className="rounded-lg border border-outline-variant px-4 py-2 text-body-md dark:border-outline">
            Filter
          </button>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-[820px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant dark:border-outline">
                <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Transaction ID</th>
                <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Date</th>
                <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Department</th>
                <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Type</th>
                <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Amount</th>
                <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((record) => (
                <tr key={record.id} className="border-b border-outline-variant/40 dark:border-outline/40">
                  <td className="px-3 py-4 text-body-md font-bold text-primary">{record.id}</td>
                  <td className="px-3 py-4 text-body-md text-on-surface">{formatDate(record.date)}</td>
                  <td className="px-3 py-4 text-body-md text-on-surface">{record.department}</td>
                  <td className="px-3 py-4 text-body-md text-on-surface-variant">{record.type}</td>
                  <td className="px-3 py-4 text-body-md font-bold text-on-surface">{formatInr(record.amount)}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-3 py-1 text-label-md ${record.status === 'Paid' ? 'bg-secondary/15 text-secondary' : 'bg-pending-bg text-pending-text'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
