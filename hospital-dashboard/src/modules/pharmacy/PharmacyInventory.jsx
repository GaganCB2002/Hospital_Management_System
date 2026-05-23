import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

export default function PharmacyInventory() {
  const [filterCategory, setFilterCategory] = useState('All Categories');
  
  // Dynamic state for items
  const [items, setItems] = useState([
    { name: 'Sterile Surgical Pack (Type-C)', ref: 'SN-992-K', batch: 'B4401-22', status: 'Stable', stock: 412, pct: 82, expiry: '12/2025', category: 'Surgical Kits' },
    { name: 'Epinephrine 1mg/mL Ampules', ref: 'PH-112-E', batch: 'EP220-41', status: 'Low Stock', stock: 14, pct: 12, expiry: '08/2024', category: 'Medications' },
    { name: 'N95 Particulate Respirator (M)', ref: 'PP-441-N', batch: 'M3110-99', status: 'Expiring', stock: 1200, pct: 65, expiry: '03/2024', category: 'PPE' },
    { name: 'Saline Solution 0.9% 500mL', ref: 'IV-223-S', batch: 'SL-881-22', status: 'Stable', stock: 2440, pct: 95, expiry: '11/2026', category: 'Medications' }
  ]);

  // Modal control states
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [restockQty, setRestockQty] = useState(250);
  const [restockStatus, setRestockStatus] = useState('Restock Requested');

  const lowStockCount = items.filter(i => i.status === 'Low Stock').length;
  const expiringCount = items.filter(i => i.status === 'Expiring').length;
  const pendingRequestsCount = items.filter(i => ['Restock Requested', 'Order Placed'].includes(i.status)).length;

  const statCards = [
    {
      id: 1,
      title: 'Total SKU Items',
      value: '1,482',
      icon: 'inventory',
      iconColor: 'text-secondary',
      iconBg: 'bg-secondary-container',
      topRightText: '+2.4% vs last mo',
      topRightColor: 'text-secondary',
      isAlert: false
    },
    {
      id: 2,
      title: 'Low Stock Alerts',
      value: lowStockCount.toString(),
      icon: 'warning',
      iconColor: 'text-error',
      iconBg: 'bg-error-container',
      topRightText: lowStockCount > 0 ? 'Action Required' : 'All Stable',
      topRightColor: 'text-error',
      isAlert: lowStockCount > 0
    },
    {
      id: 3,
      title: 'Expiring Soon',
      value: expiringCount.toString(),
      icon: 'event_busy',
      iconColor: 'text-tertiary dark:text-tertiary-fixed',
      iconBg: 'bg-tertiary-fixed',
      topRightText: 'Within 30 Days',
      topRightColor: 'text-tertiary dark:text-tertiary-fixed',
      isAlert: false
    },
    {
      id: 4,
      title: 'Open Requests',
      value: pendingRequestsCount.toString(),
      icon: 'pending_actions',
      iconColor: 'text-primary',
      iconBg: 'bg-surface-container-high',
      topRightText: `${items.filter(i => i.status === 'Restock Requested').length} Pending`,
      topRightColor: 'text-primary',
      isAlert: false
    }
  ];

  const logisticsTimeline = [
    {
      id: 1,
      icon: 'local_shipping',
      iconBg: 'bg-secondary',
      title: 'Shipment Delivered',
      time: '14:22 • Central Loading Dock',
      detailTitle: 'PO #88219 - Pfizer Inc.',
      detailDesc: '200x Insulin Glargine vials checked into cold storage.',
      detailBg: 'bg-surface-container-low border border-outline-variant/50',
      detailTitleColor: 'text-secondary'
    },
    {
      id: 2,
      icon: 'request_quote',
      iconBg: 'bg-primary',
      title: 'Restock Request Created',
      time: '11:05 • Dept. of Cardiology',
      desc: 'Nursing Station A requested 50x Sterile Gloves (Large).'
    },
    {
      id: 3,
      icon: 'assignment_return',
      iconBg: 'bg-error',
      title: 'Batch Recalled',
      time: '09:15 • System Alert',
      detailTitle: 'Recall: Batch EP-441',
      detailDesc: 'Manufacturer alert for potential packaging breach.',
      detailBg: 'bg-error-container/10 border border-error/20',
      detailTitleColor: 'text-error'
    },
    {
      id: 4,
      icon: 'inventory',
      iconBg: 'bg-outline-variant',
      title: 'Cycle Count Completed',
      time: 'Yesterday • Pharmacy Main',
      desc: 'Discrepancy found: -2 units Morphine Sulfate 10mg.'
    }
  ];

  const burnRateData = [
    { label: 'Mon', height: '45%', colorClass: 'bg-primary/10 hover:bg-primary' },
    { label: 'Tue', height: '60%', colorClass: 'bg-primary/10 hover:bg-primary' },
    { label: 'Wed', height: '85%', colorClass: 'bg-primary/20 hover:bg-primary' },
    { label: 'Thu', height: '55%', colorClass: 'bg-primary/10 hover:bg-primary' },
    { label: 'Fri (Peak)', height: '100%', colorClass: 'bg-secondary hover:opacity-80' },
    { label: 'Sat', height: '30%', colorClass: 'bg-primary/10 hover:bg-primary' },
    { label: 'Sun', height: '25%', colorClass: 'bg-primary/10 hover:bg-primary' }
  ];

  const getStatusClasses = (status) => {
    switch(status) {
      case 'Stable': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Low Stock': return 'bg-error/10 text-error border-error/20';
      case 'Expiring': return 'bg-warning-container/50 text-warning border-warning/20';
      case 'Restock Requested': return 'bg-pending-bg text-pending-text border-pending-text/20';
      case 'Order Placed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-outline-variant/10 text-outline border-outline-variant/20';
    }
  };

  const getStockClasses = (status) => {
    if (status === 'Low Stock') return 'bg-error text-error';
    if (status === 'Expiring') return 'bg-warning text-white';
    if (status === 'Restock Requested') return 'bg-pending-text text-white';
    if (status === 'Order Placed') return 'bg-primary text-white';
    return 'bg-secondary text-on-secondary';
  };

  // Export Inventory Report PDF
  const handleExportReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 53, 95); // Primary color
    doc.text('CurePulse Pharmacy Inventory Report', 14, 20);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    
    // Add brief summary statistics
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total SKU Items in Database: 1,482`, 14, 36);
    doc.text(`Active Low Stock Alerts: ${lowStockCount}`, 14, 42);
    doc.text(`Expiring Items: ${expiringCount}`, 14, 48);
    doc.text(`Pending Stock Requests: ${pendingRequestsCount}`, 14, 54);
    
    // Decorative line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 58, 196, 58);
    
    // Table content
    const tableColumn = ["Item Description", "Ref ID", "Batch #", "Category", "Status", "Stock Level", "Expiry"];
    const tableRows = items.map(item => [
      item.name,
      item.ref,
      item.batch,
      item.category || 'N/A',
      item.status,
      item.stock,
      item.expiry
    ]);
    
    doc.autoTable({
      startY: 62,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [0, 53, 95] },
      theme: 'striped',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 } // Give description more space
      }
    });
    
    doc.save(`pharmacy_inventory_report_${Date.now()}.pdf`);
    toast.success('Inventory PDF Report downloaded successfully');
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    
    const updatedItems = [...items];
    const item = { ...updatedItems[selectedItemIdx] };
    item.stock += qty;
    item.status = restockStatus;
    
    // Assume 3000 is maximum capacity for stock bar pct calculations
    const maxCapacity = 3000;
    item.pct = Math.min(100, Math.round((item.stock / maxCapacity) * 100));
    
    updatedItems[selectedItemIdx] = item;
    setItems(updatedItems);
    setIsRestockModalOpen(false);
    toast.success(`Restock request submitted for ${item.name}! Status updated to: ${restockStatus}`);
  };

  // Filter items by category dropdown selection
  const filteredItems = items.filter(item => {
    if (filterCategory === 'All Categories') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6 pb-24">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">Medical Inventory Dashboard</h2>
          <p className="text-sm text-on-surface-variant">Real-time oversight of clinical assets and pharmacy stock levels.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest border border-primary text-primary font-bold rounded-lg hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined">download</span> Export Report
          </button>
          <button 
            onClick={() => setIsRestockModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">add_shopping_cart</span> Request Restock
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.id} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
            {card.isAlert && <div className="absolute right-0 top-0 w-16 h-16 bg-error-container blur-2xl opacity-50"></div>}
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className={`material-symbols-outlined ${card.iconColor} ${card.iconBg} p-2 rounded-lg`}>{card.icon}</span>
              <span className={`text-xs font-bold ${card.topRightColor}`}>{card.topRightText}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider relative z-10">{card.title}</p>
            <p className="text-3xl font-bold text-primary mt-1 relative z-10">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* High Density Inventory Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
            <h3 className="text-xl font-bold text-primary">Critical Supplies</h3>
            <div className="flex items-center gap-4">
              <select 
                value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-on-surface-variant focus:ring-0 cursor-pointer"
              >
                <option>All Categories</option>
                <option>Medications</option>
                <option>Surgical Kits</option>
                <option>PPE</option>
              </select>
              <button className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">filter_list</button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Item Description</th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Batch #</th>
                  <th className="px-6 py-2 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-2 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-2 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => {
                    setSelectedItemIdx(items.findIndex(i => i.name === item.name));
                    setIsRestockModalOpen(true);
                  }}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">{item.name}</span>
                        <span className="text-xs text-outline font-medium mt-0.5">Ref: {item.ref}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-medium text-on-surface-variant">{item.batch}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusClasses(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-outline-variant/30 h-1.5 rounded-full overflow-hidden flex">
                          <div className={`h-full ${getStockClasses(item.status).split(' ')[0]}`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                        <span className={`font-mono text-sm ${item.status === 'Low Stock' ? 'text-error font-bold' : 'text-on-surface'}`}>{item.stock}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono text-sm font-medium ${item.status === 'Expiring' ? 'text-tertiary dark:text-tertiary-fixed font-bold' : 'text-on-surface-variant'}`}>
                      {item.expiry}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-center mt-auto">
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">View Full Inventory Matrix</button>
          </div>
        </div>

        {/* Recent Supply Chain Activity */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright">
            <h3 className="text-xl font-bold text-primary">Logistics Timeline</h3>
          </div>
          <div className="p-6 flex-grow overflow-y-auto max-h-[400px]">
            <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-outline-variant/40">
              {logisticsTimeline.map((item) => (
                <div key={item.id} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-6 h-6 ${item.iconBg} rounded-full flex items-center justify-center ring-4 ring-white dark:ring-inverse-surface shadow-sm z-10`}>
                    <span className="material-symbols-outlined text-white text-[14px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.title}</p>
                    <p className="text-xs text-outline mb-2 font-medium">{item.time}</p>
                    {item.detailTitle ? (
                      <div className={`p-3 rounded-lg ${item.detailBg}`}>
                      <p className={`text-xs font-bold mb-1 ${item.detailTitleColor}`}>{item.detailTitle}</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{item.detailDesc}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-outline-variant flex justify-center mt-auto bg-surface-container-lowest">
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">View All Activities</button>
          </div>
        </div>
      </div>

      {/* Analytical Sparkline Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <h4 className="text-xl font-bold text-primary mb-6">Consumables Burn Rate</h4>
          <div className="h-48 w-full flex items-end gap-1 px-2 border-b border-outline-variant/30 pb-2">
            {burnRateData.map((bar, idx) => (
              <div key={idx} className={`flex-1 rounded-t transition-all group relative cursor-pointer ${bar.colorClass}`} style={{ height: bar.height }}>
                <span className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface dark:bg-surface-bright dark:text-on-surface text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap z-20">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <div>
              <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Average Daily</p>
              <p className="text-xl font-bold text-primary">1.2k units</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Forecasted Exhaustion</p>
              <p className="text-xl font-bold text-secondary">22 Days</p>
            </div>
          </div>
        </div>
        
        <div className="relative rounded-xl overflow-hidden shadow-sm group h-[300px] md:h-auto border border-outline-variant">
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=400&fit=crop" 
            alt="Central Storage" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-6">
            <p className="text-xl font-bold text-white mb-2">Central Storage Overview</p>
            <p className="text-sm font-medium text-white mb-6 max-w-sm">Visual verification system enabled for Zone 4-B Cold Storage.</p>
            <button className="bg-secondary-fixed text-on-secondary-fixed px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-black/20">
              Access Live Cam
            </button>
          </div>
        </div>
      </div>

      {/* Restock Request Modal */}
      <Modal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} title="" size="md">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant dark:border-outline -mx-6 -mt-2 px-6 pb-4 mb-2">
          <span className="material-symbols-outlined text-secondary">add_shopping_cart</span>
          <h3 className="text-xl font-bold text-on-surface">Request Stock Restock</h3>
        </div>

        <form onSubmit={handleRestockSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Select Item</label>
            <select
              value={selectedItemIdx}
              onChange={(e) => setSelectedItemIdx(parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
            >
              {items.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.name} ({item.status} - Stock: {item.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Quantity</label>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              min="1"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Request Type</label>
            <select
              value={restockStatus}
              onChange={(e) => setRestockStatus(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
            >
              <option value="Restock Requested">Restock Requested</option>
              <option value="Order Placed">Order Placed</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-5 py-2.5 border border-outline-variant rounded-lg text-body-md font-bold text-on-surface hover:bg-surface-container transition-colors dark:border-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition-all shadow-md"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
