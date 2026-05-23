import { useMemo, useState } from 'react';
import { FiCheckCircle, FiFileText, FiPrinter, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useHospital } from '../../context/HospitalContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatDate, formatInr } from '../../lib/formatters';

export default function Billing() {
  const { billing, patients, createInvoice, markInvoicePaid } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 250);
  const [updatingInvoice, setUpdatingInvoice] = useState('');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateInvoice(e) {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    const patientObj = patients.find((p) => p.id === selectedPatientId);
    if (!patientObj) {
      toast.error('Selected patient not found');
      return;
    }

    setIsCreating(true);
    try {
      await createInvoice(patientObj, 'Receptionist');
      toast.success(`Invoice generated successfully for ${patientObj.name}`);
      setIsNewInvoiceModalOpen(false);
      setSelectedPatientId('');
    } catch (err) {
      toast.error(err.message || 'Unable to create invoice');
    } finally {
      setIsCreating(false);
    }
  }

  const filteredBilling = useMemo(
    () => billing.filter((invoice) => {
      const query = debouncedSearch.toLowerCase().trim();
      if (!query) {
        return true;
      }
      return [invoice.patient, invoice.id, invoice.department].some((value) => value.toLowerCase().includes(query));
    }),
    [billing, debouncedSearch],
  );

  async function handleMarkPaid(invoiceId) {
    setUpdatingInvoice(invoiceId);
    try {
      await markInvoicePaid(invoiceId, 'Receptionist');
      toast.success('Invoice marked as paid');
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to update invoice');
    } finally {
      setUpdatingInvoice('');
    }
  }

  function handlePrint(invoice) {
    const printWindow = window.open('', '_blank', 'width=720,height=620');
    if (!printWindow) {
      toast.error('Print preview blocked by browser');
      return;
    }
    printWindow.document.write(`
      <html>
        <head><title>${invoice.id}</title></head>
        <body>
          <h1>${invoice.id}</h1>
          <p>Patient: ${invoice.patient}</p>
          <p>Department: ${invoice.department}</p>
          <p>Date: ${formatDate(invoice.date)}</p>
          <p>Amount: ${formatInr(invoice.amount)}</p>
          <p>Status: ${invoice.status}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface ">Billing Operations</h1>
        <p className="text-sm text-on-surface-variant">Process payments and generate invoices</p>
      </div>

      <div className="min-h-[70vh] overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm dark:border-outline dark:bg-surface-container">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest p-4 dark:border-outline dark:bg-surface-container-high md:flex-row md:items-center">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search by invoice ID, patient, or department..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-outline dark:bg-surface-container "
            />
          </div>
          <button 
            onClick={() => {
              if (patients && patients.length > 0) {
                setSelectedPatientId(patients[0].id);
              }
              setIsNewInvoiceModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container cursor-pointer"
          >
            <FiFileText /> New Invoice
          </button>
        </div>

        <div className="overflow-x-auto">
          {filteredBilling.length ? (
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low dark:border-outline dark:bg-surface-container-high">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Invoice ID</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Patient Name</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Date</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Amount</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-[#233144]">
                {filteredBilling.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors hover:bg-surface-container-lowest dark:hover:bg-[#1a2d42]/50">
                    <td className="p-4 text-sm font-medium text-on-surface ">{invoice.id}</td>
                    <td className="p-4 text-sm text-on-surface ">{invoice.patient}</td>
                    <td className="p-4 text-sm text-outline">{formatDate(invoice.date)}</td>
                    <td className="p-4 text-sm font-bold text-on-surface ">{formatInr(invoice.amount)}</td>
                    <td className="p-4">
                      <span className={`inline-flex w-max items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-pending-bg text-pending-text'
                      }`}>
                        {invoice.status === 'Paid' ? <FiCheckCircle /> : null}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(invoice.id)}
                            disabled={updatingInvoice === invoice.id}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition-colors hover:bg-primary-container disabled:opacity-70"
                          >
                            {updatingInvoice === invoice.id ? 'Saving...' : 'Mark Paid'}
                          </button>
                        ) : null}
                        <button type="button" onClick={() => handlePrint(invoice)} className="rounded-lg bg-surface-container-low p-2 text-outline transition-colors hover:text-primary dark:bg-surface-container-high">
                          <FiPrinter />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState icon="receipt_long" title="Data not present" description="No invoices matched the current search query." />
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isNewInvoiceModalOpen} onClose={() => setIsNewInvoiceModalOpen(false)} title="Generate New Invoice" size="md">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-on-primary-fixed"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) - {p.department}
                </option>
              ))}
            </select>
          </div>

          {selectedPatientId && (
            <div className="rounded-xl border border-outline-variant p-4 space-y-2 dark:border-outline bg-surface-container-low">
              <p className="text-body-md">
                <strong>Department:</strong> {patients.find(p => p.id === selectedPatientId)?.department || 'General'}
              </p>
              <p className="text-body-md">
                <strong>Primary Doctor:</strong> {patients.find(p => p.id === selectedPatientId)?.doctor || 'Unassigned'}
              </p>
              <p className="text-body-md">
                <strong>Estimated Amount:</strong> {
                  formatInr(Number(
                    patients.find(p => p.id === selectedPatientId)?.assignedDoctor?.consultationFee || 
                    patients.find(p => p.id === selectedPatientId)?.consultationFee || 
                    1500
                  ))
                }
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
            <button
              type="button"
              onClick={() => setIsNewInvoiceModalOpen(false)}
              className="px-5 py-2.5 border border-outline-variant rounded-lg text-body-md font-bold text-on-surface hover:bg-surface-container transition-colors dark:border-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !selectedPatientId}
              className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
