import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { useHospital } from '../../context/HospitalContext';
import StatCard from '../../components/common/StatCard';

export default function BillingDashboard() {
  const { billing, inventory } = useHospital();

  const totalRevenue = billing.filter(b => b.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = billing.filter(b => b.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const criticalItems = inventory.filter(i => i.status === 'Critical').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface dark:text-white">Billing & Pharmacy</h1>
        <p className="text-sm text-on-surface-variant">Financial overview and inventory management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={FiDollarSign} trend="up" trendValue="+8%" />
        <StatCard title="Pending Payments" value={`₹${pendingAmount.toLocaleString()}`} icon={FiCreditCard} variant="warning" />
        <StatCard title="Total Invoices" value={billing.length} icon={FiTrendingUp} />
        <StatCard title="Critical Stock" value={criticalItems} icon={FiAlertCircle} variant="error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Billing */}
        <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-on-surface dark:text-white">Recent Invoices</h3>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-outline uppercase border-b border-outline-variant/30 dark:border-outline">
                  <th className="pb-3 font-medium">Invoice ID</th>
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 dark:divide-[#233144]">
                {billing.slice(0, 5).map((invoice, index) => (
                  <motion.tr key={invoice.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
                    <td className="py-3 text-sm font-medium text-on-surface dark:text-white">{invoice.id}</td>
                    <td className="py-3 text-sm text-on-surface-variant">{invoice.patient}</td>
                    <td className="py-3 text-sm font-medium text-on-surface dark:text-white">₹{invoice.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                        invoice.status === 'Paid' ? 'bg-secondary-container text-on-secondary-container' : 'bg-warning-container text-warning-on-container text-amber-700 bg-amber-100'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pharmacy Inventory */}
        <div className="bg-surface dark:bg-surface-container border border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-on-surface dark:text-white">Medical Inventory Status</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <FiPackage /> Update Stock
            </button>
          </div>
          <div className="space-y-4">
            {inventory.slice(0, 5).map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between p-3 border border-outline-variant/30 dark:border-outline rounded-lg">
                <div>
                  <p className="text-sm font-bold text-on-surface dark:text-white">{item.name}</p>
                  <p className="text-xs text-outline">{item.category}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-on-surface dark:text-white">{item.stock} {item.unit}</p>
                    <p className="text-xs text-outline">Threshold: {item.threshold}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                    item.status === 'Normal' ? 'bg-secondary-container text-on-secondary-container' : 
                    item.status === 'Low' ? 'bg-pending-bg text-pending-text' : 'bg-error-container text-on-error-container'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
