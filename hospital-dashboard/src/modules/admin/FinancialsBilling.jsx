import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useHospital } from '../../context/HospitalContext';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatInr } from '../../lib/formatters';

export default function FinancialsBilling() {
  const { billing, markInvoicePaid } = useHospital();
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'All') {
      return billing;
    }
    return billing.filter((invoice) => invoice.status === statusFilter);
  }, [billing, statusFilter]);

  const totalRevenue = billing.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingRevenue = billing.filter((invoice) => invoice.status === 'Pending').reduce((sum, invoice) => sum + invoice.amount, 0);
  const averageInvoice = billing.length ? Math.round(billing.reduce((sum, invoice) => sum + invoice.amount, 0) / billing.length) : 0;
  const departmentSummary = Object.entries(
    billing.reduce((accumulator, invoice) => {
      accumulator[invoice.department] = (accumulator[invoice.department] || 0) + invoice.amount;
      return accumulator;
    }, {}),
  );

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0, 53, 95); // Primary color
    doc.text('CurePulse Billing & Transactions', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(114, 119, 128);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);

    const tableColumn = ["Invoice ID", "Patient", "Department", "Date", "Amount", "Status", "Method"];
    const tableRows = filteredInvoices.map(invoice => [
      invoice.id,
      invoice.patient,
      invoice.department,
      formatDate(invoice.date),
      `INR ${invoice.amount.toLocaleString('en-IN')}`,
      invoice.status,
      invoice.method || 'N/A'
    ]);
    
    doc.autoTable({
      startY: 36,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [0, 53, 95] },
      theme: 'striped'
    });
    
    doc.save(`transactions_${Date.now()}.pdf`);
    toast.success('Billing transactions PDF exported');
  }

  function generateFinancialReportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0, 53, 95); // Primary color
    doc.text('CurePulse Financial Executive Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(114, 119, 128);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 32, 196, 32);
    
    doc.setFontSize(12);
    doc.setTextColor(13, 28, 46);
    doc.text(`Total Collections (Paid): INR ${totalRevenue.toLocaleString('en-IN')}`, 14, 40);
    doc.text(`Pending Collections: INR ${pendingRevenue.toLocaleString('en-IN')}`, 14, 47);
    doc.text(`Average Invoice Value: INR ${averageInvoice.toLocaleString('en-IN')}`, 14, 54);
    doc.text(`Total Invoices Raised: ${billing.length}`, 14, 61);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 53, 95);
    doc.text('Department Collections Summary', 14, 72);
    
    const tableColumn = ["Department", "Collected Amount", "Share of Collections"];
    const tableRows = departmentSummary.map(([department, amount]) => {
      const percentage = totalRevenue + pendingRevenue ? Math.round((amount / (totalRevenue + pendingRevenue)) * 100) : 0;
      return [
        department,
        `INR ${amount.toLocaleString('en-IN')}`,
        `${percentage}%`
      ];
    });
    
    doc.autoTable({
      startY: 76,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [0, 53, 95] },
      theme: 'striped'
    });
    
    doc.save(`financial_report_${Date.now()}.pdf`);
    toast.success('Financial Executive Report PDF generated');
  }

  async function handleMarkPaid(invoiceId) {
    try {
      await markInvoicePaid(invoiceId, 'Admin');
      toast.success(`Invoice ${invoiceId} marked as paid`);
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to update invoice');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Financials & Billing</h1>
          <p className="text-body-md text-on-surface-variant">Real-time revenue tracking, billing workflow, and departmental collections.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={exportPdf} className="rounded-lg border border-primary px-4 py-2 text-body-md font-bold text-primary dark:text-primary-fixed cursor-pointer">
            Export PDF
          </button>
          <button type="button" onClick={generateFinancialReportPDF} className="rounded-lg bg-secondary px-4 py-2 text-body-md font-bold text-white cursor-pointer">
            Generate Financial Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Total Revenue</p>
          <h2 className="mt-2 text-display-lg text-primary dark:text-primary-fixed">{formatInr(totalRevenue)}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Pending Collections</p>
          <h2 className="mt-2 text-display-lg text-error">{formatInr(pendingRevenue)}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Average Invoice</p>
          <h2 className="mt-2 text-display-lg text-on-surface">{formatInr(averageInvoice)}</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <p className="text-label-md uppercase text-on-surface-variant">Invoices</p>
          <h2 className="mt-2 text-display-lg text-on-surface">{billing.length}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface">
          <div className="flex items-center justify-between border-b border-outline-variant p-5 dark:border-outline">
            <h2 className="text-headline-md text-on-surface">Recent Invoices & Transactions</h2>
            <div className="flex gap-2">
              {['All', 'Pending', 'Paid'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={`rounded-lg px-3 py-2 text-body-md font-bold ${
                    statusFilter === option ? 'bg-primary text-white' : 'bg-surface-container-low dark:bg-on-primary-fixed'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto p-5">
            {filteredInvoices.length ? (
              <table className="min-w-[860px] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant dark:border-outline">
                    <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Invoice ID</th>
                    <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Patient / Department</th>
                    <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Date</th>
                    <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Amount</th>
                    <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
                    <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-outline-variant/40 dark:border-outline/40">
                      <td className="px-3 py-4 text-body-md font-bold text-primary">{invoice.id}</td>
                      <td className="px-3 py-4">
                        <p className="text-body-md font-bold text-on-surface">{invoice.patient}</p>
                        <p className="text-body-md text-on-surface-variant">{invoice.department}</p>
                      </td>
                      <td className="px-3 py-4 text-body-md text-on-surface">{formatDate(invoice.date)}</td>
                      <td className="px-3 py-4 text-body-md font-bold text-on-surface">{formatInr(invoice.amount)}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-label-md ${invoice.status === 'Paid' ? 'bg-secondary/15 text-secondary' : 'bg-pending-bg text-pending-text'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {invoice.status === 'Pending' ? (
                          <button type="button" onClick={() => handleMarkPaid(invoice.id)} className="rounded-lg bg-primary px-3 py-2 text-body-md font-bold text-white">
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-body-md text-on-surface-variant">Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon="receipt_long" title="Data not present" description="No invoices matched the selected billing filter." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm dark:border-outline dark:bg-surface">
          <h2 className="text-headline-md text-on-surface">Revenue Distribution</h2>
          <div className="mt-4 space-y-4">
            {departmentSummary.map(([department, amount]) => {
              const percentage = totalRevenue + pendingRevenue ? Math.round((amount / (totalRevenue + pendingRevenue)) * 100) : 0;
              return (
                <div key={department}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-body-md font-bold text-on-surface">{department}</span>
                    <span className="text-body-md text-on-surface-variant">{formatInr(amount)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-surface-container-high dark:bg-on-primary-fixed">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                  </div>
                  <p className="mt-1 text-label-md text-outline">{percentage}% of collections</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
