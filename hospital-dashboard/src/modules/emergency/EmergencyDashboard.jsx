import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { useHospital } from '../../context/HospitalContext';

export default function EmergencyDashboard() {
  const { patients, bedOccupancy, inventory } = useHospital();



  const [alerts, setAlerts] = useState(() => {
    const criticalPatients = patients.filter(p => p.status === 'Emergency' || p.condition === 'Critical');
    if (criticalPatients.length > 0) {
      return criticalPatients.map((p, i) => ({
        id: i + 1,
        type: 'critical',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        label: 'Code Blue',
        location: p.ward || p.department || 'Unknown',
        bed: `${p.ward || 'Ward'} (${p.name})`,
        status: p.condition === 'Critical' ? 'On Scene' : 'En Route',
        team: `T${(i % 4) + 1}`,
        description: p.notes || `Emergency admission — ${p.condition || 'Immediate attention required'}.`
      }));
    }
    return [];
  });

  const [filterType, setFilterType] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [broadcastLabel, setBroadcastLabel] = useState('Code Blue');
  const [broadcastLocation, setBroadcastLocation] = useState('ER Ward A');
  const [broadcastBed, setBroadcastBed] = useState('Bed 01');
  const [broadcastTeam, setBroadcastTeam] = useState('T1');
  const [broadcastStatus, setBroadcastStatus] = useState('Dispatched');
  const [broadcastNotes, setBroadcastNotes] = useState('');

  const activeAlerts = alerts.filter(a => a.type !== 'resolved');
  const totalActiveCount = activeAlerts.length;

  const codeBlueCount = alerts.filter(a => a.label === 'Code Blue' && a.type !== 'resolved').length;
  const rapidRespCount = alerts.filter(a => a.label === 'Rapid Response' && a.type !== 'resolved').length;
  const traumaCount = alerts.filter(a => a.label === 'Trauma Alert' && a.type !== 'resolved').length;

  const activeCounts = [
    { id: 1, count: codeBlueCount.toString(), label: 'Code Blue' },
    { id: 2, count: rapidRespCount.toString(), label: 'Rapid Resp', isMiddle: true },
    { id: 3, count: traumaCount.toString(), label: 'Trauma' }
  ];

  const resources = useMemo(() => {
    const icu = bedOccupancy.find(b => b.ward === 'ICU');
    const icuPct = icu ? Math.round((icu.occupied / icu.total) * 100) : 90;
    const ventItem = inventory.find(i => i.name?.toLowerCase().includes('ventilator') || i.name?.toLowerCase().includes('vent'));
    const crashCarts = inventory.find(i => i.name?.toLowerCase().includes('crash') || i.category?.toLowerCase().includes('crash'));

    return [
      {
        id: 1, name: 'ICU Beds', icon: 'bed',
        available: icu ? `${icu.occupied}/${icu.total}` : '2/24',
        percent: `${icuPct}%`,
        status: icuPct > 85 ? 'Critical Capacity' : icuPct > 60 ? 'Low Availability' : 'Stable',
        color: icuPct > 85 ? 'error' : icuPct > 60 ? 'tertiary' : 'secondary'
      },
      {
        id: 2, name: 'Ventilators', icon: 'air',
        available: ventItem ? `${Math.round(ventItem.stock / 10)}/${Math.round(ventItem.threshold / 10)}` : '8/45',
        percent: ventItem ? `${Math.min(100, Math.round((ventItem.stock / ventItem.threshold) * 100))}%` : '82%',
        status: ventItem && ventItem.stock < ventItem.threshold ? 'Low Availability' : 'Stable',
        color: ventItem && ventItem.stock < ventItem.threshold ? 'tertiary' : 'secondary'
      },
      {
        id: 3, name: 'Crash Carts', icon: 'medication',
        available: crashCarts ? `${crashCarts.stock}/${crashCarts.threshold}` : '12/15',
        percent: crashCarts ? `${Math.min(100, Math.round((crashCarts.stock / crashCarts.threshold) * 100))}%` : '20%',
        status: crashCarts && crashCarts.stock < crashCarts.threshold ? 'Low Availability' : 'Stable',
        color: crashCarts && crashCarts.stock < crashCarts.threshold ? 'tertiary' : 'secondary'
      }
    ];
  }, [bedOccupancy, inventory]);

  const handleExportLog = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(180, 35, 35);
    doc.text('CurePulse Emergency Center Alert Log', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Log Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Active Critical Wards: ICU, ER, Cardiology, Neurology`, 14, 36);
    doc.text(`Total Logged Alerts: ${alerts.length}`, 14, 42);
    doc.text(`Active Emergency Alerts: ${totalActiveCount}`, 14, 48);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 52, 196, 52);

    const tableColumn = ["Time", "Alert Level", "Label/Code", "Location", "Bed Info", "Team", "Status"];
    const tableRows = alerts.map(alert => [
      alert.time,
      alert.type.toUpperCase(),
      alert.label,
      alert.location,
      alert.bed,
      alert.team || 'None',
      alert.status
    ]);

    doc.autoTable({
      startY: 56,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [180, 35, 35] },
      theme: 'striped',
      styles: { fontSize: 9 }
    });

    doc.save(`emergency_alerts_log_${Date.now()}.pdf`);
    toast.success('Emergency Alerts log exported as PDF');
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    const type = ['Code Blue', 'Trauma Alert', 'Fire Alert'].includes(broadcastLabel) ? 'critical' : 'warning';

    const newAlert = {
      id: Date.now(),
      type,
      time: new Date().toTimeString().split(' ')[0],
      label: broadcastLabel,
      location: broadcastLocation,
      bed: broadcastBed,
      status: broadcastStatus,
      team: broadcastTeam === 'None' ? null : broadcastTeam,
      description: broadcastNotes || `Emergency alert for ${broadcastLabel} dispatched at ${broadcastLocation}.`
    };

    setAlerts([newAlert, ...alerts]);
    setIsBroadcastModalOpen(false);
    setBroadcastNotes('');
    toast.success(`Broadcasted: ${broadcastLabel} in ${broadcastLocation}!`);
  };

  const handleResolveAlert = (alertId) => {
    setAlerts(alerts.map(a => {
      if (a.id === alertId) {
        return { ...a, type: 'resolved', status: 'Cleared', team: null };
      }
      return a;
    }));
    setIsDetailModalOpen(false);
    toast.success('Alert marked as resolved / cleared.');
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-4xl font-bold text-on-surface break-words whitespace-normal">Emergency Center</h2>
          <p className="text-lg text-on-surface-variant mt-1 break-words whitespace-normal">Live monitoring across all critical wards.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportLog}
            className="px-4 py-2 border border-outline-variant text-primary font-bold rounded hover:bg-surface-container-lowest transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">print</span> Export Log
          </button>
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-4 py-2 bg-error text-white font-bold rounded hover:bg-error/90 transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">campaign</span> Broadcast All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 bg-error text-white rounded-xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex justify-between items-start">
            <h3 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2 break-words whitespace-normal">
              <span className="material-symbols-outlined animate-pulse shrink-0">e911_emergency</span>
              Active Criticals
            </h3>
            <span className="font-mono bg-white/20 px-2 py-1 rounded text-xs font-bold">Live Update</span>
          </div>
          <div className="relative z-10 text-center py-8">
            <div className="relative inline-block">
              <span className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping scale-150"></span>
              <span className="text-[100px] leading-none font-black tracking-tighter relative z-10 text-white drop-shadow-md">
                {String(totalActiveCount).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="relative z-10 border-t border-white/20 pt-4 grid grid-cols-3 gap-2 text-center">
            {activeCounts.map(count => (
              <div key={count.id} className={count.isMiddle ? "border-l border-r border-white/20" : ""}>
                <p className="text-xl font-bold">{count.count}</p>
                <p className="text-xs opacity-80 font-bold uppercase tracking-wider">{count.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-surface dark:bg-surface border border-outline-variant dark:border-outline rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center dark:bg-surface dark:border-outline">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2 break-words whitespace-normal">
              <span className="material-symbols-outlined text-error animate-pulse shrink-0">sensors</span>
              Live Alerts Feed
            </h3>

            <div className="relative">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="bg-surface-container border border-outline-variant text-sm px-3 py-1 rounded-full text-on-surface-variant flex items-center gap-1 cursor-pointer hover:bg-outline-variant/20 font-bold dark:bg-surface-container-high dark:border-outline"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Filter: <span className="capitalize text-primary dark:text-primary-fixed font-black">{filterType}</span>
              </button>
              {filterMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-outline-variant rounded-lg shadow-lg z-30 py-1 dark:bg-surface-container-high dark:border-outline">
                  {['all', 'critical', 'warning', 'resolved'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setFilterType(t);
                        setFilterMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-surface-container-low transition-colors dark:hover:bg-surface-container ${filterType === t ? 'text-primary font-bold dark:text-primary-fixed' : 'text-on-surface'}`}
                    >
                      {t} Alerts
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-surface border-b border-outline-variant/50 text-xs font-bold text-outline sticky top-0 z-10 uppercase tracking-wider dark:bg-surface-container-high dark:border-outline">
              <div className="col-span-2">Time (EST)</div>
              <div className="col-span-3">Alert Type</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-4">Status & Responding</div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-outline font-bold">No alerts logged matching filter.</div>
            ) : (
              filteredAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedAlert(alert);
                    setIsDetailModalOpen(true);
                  }}
                  className={`grid grid-cols-12 gap-2 px-4 py-4 border-b border-outline-variant/30 items-center hover:bg-surface-container-low transition-colors cursor-pointer dark:hover:bg-surface-container-high/50
                    ${alert.type === 'critical' ? 'bg-error/5 border-l-4 border-l-error dark:bg-error-container/10' : ''}
                    ${alert.type === 'warning' ? 'border-l-4 border-l-tertiary' : ''}
                    ${alert.type === 'resolved' ? 'opacity-70' : ''}
                  `}
                >
                  <div className={`col-span-2 font-mono font-bold ${alert.type === 'critical' ? 'text-error' : alert.type === 'warning' ? 'text-tertiary' : 'text-outline'}`}>
                    {alert.time}
                  </div>
                  <div className="col-span-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded
                      ${alert.type === 'critical' ? 'bg-error text-white' : alert.type === 'warning' ? 'bg-tertiary text-white' : 'border border-outline text-outline dark:border-outline-variant'}
                    `}>
                      <span className="material-symbols-outlined text-[14px]">
                        {alert.type === 'resolved' ? 'check_circle' : alert.type === 'critical' ? 'vital_signs' : 'directions_run'}
                      </span>
                      {alert.label}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-on-surface font-bold break-words whitespace-normal">{alert.location}</p>
                    <p className="text-xs text-outline font-medium break-words whitespace-normal">{alert.bed}</p>
                  </div>
                  <div className="col-span-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {alert.team && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border
                          ${alert.type === 'critical' ? 'bg-primary-container text-on-primary-container border-primary dark:bg-primary-fixed dark:text-primary-fixed-dim' : 'bg-surface-variant text-on-surface border-outline dark:bg-surface-container'}
                        `}>
                          {alert.team}
                        </div>
                      )}
                      {alert.type === 'resolved' && <span className="material-symbols-outlined text-secondary">check_circle</span>}
                      <span className={`text-sm font-bold ${alert.type === 'critical' ? 'text-error' : alert.type === 'warning' ? 'text-tertiary' : 'text-outline'}`}>
                        {alert.status}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlert(alert);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-container dark:text-primary-fixed dark:hover:text-primary-fixed-dim"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-12 bg-surface dark:bg-surface border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm mt-4">
          <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 break-words whitespace-normal">
            <span className="material-symbols-outlined text-primary shrink-0">inventory_2</span>
            Critical Resource Availability
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map(res => (
              <div key={res.id} className="bg-surface p-4 rounded-lg border border-outline-variant/50 dark:bg-surface-container-high dark:border-outline">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold text-on-surface flex items-center gap-2 min-w-0 w-full">
                    <span className="material-symbols-outlined text-primary-container shrink-0">{res.icon}</span>
                    <span className="break-words whitespace-normal min-w-0">{res.name}</span>
                  </span>
                  <span className="text-xl text-on-surface font-bold">{res.available}</span>
                </div>
                <div className="w-full bg-outline-variant/30 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${res.color === 'error' ? 'bg-error' : res.color === 'tertiary' ? 'bg-tertiary' : 'bg-secondary'}`} style={{ width: res.percent }}></div>
                </div>
                <p className={`text-xs font-bold text-right uppercase tracking-wider ${res.color === 'error' ? 'text-error' : res.color === 'tertiary' ? 'text-tertiary' : 'text-secondary'}`}>{res.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="" size="md">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant dark:border-outline -mx-6 -mt-2 px-6 pb-4 mb-2">
          <span className="material-symbols-outlined text-error">campaign</span>
          <h3 className="text-xl font-bold text-error break-words whitespace-normal">Broadcast Emergency Alert</h3>
        </div>
        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Alert Label / Code</label>
            <select
              value={broadcastLabel}
              onChange={(e) => setBroadcastLabel(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
            >
              <option value="Code Blue">Code Blue (Cardiac Arrest)</option>
              <option value="Trauma Alert">Trauma Alert (Severe Trauma)</option>
              <option value="Fire Alert">Fire Alert (Smoke/Fire detected)</option>
              <option value="Rapid Response">Rapid Response (Medical assistance)</option>
              <option value="Fall Alert">Fall Alert (Patient slip/fall)</option>
              <option value="Hazmat Alert">Hazmat Alert (Chemical hazard)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Location</label>
              <input
                type="text"
                value={broadcastLocation}
                onChange={(e) => setBroadcastLocation(e.target.value)}
                placeholder="e.g. ICU Ward A"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Bed / Room Info</label>
              <input
                type="text"
                value={broadcastBed}
                onChange={(e) => setBroadcastBed(e.target.value)}
                placeholder="e.g. Bed 02 (Jack, M)"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Responding Team</label>
              <select
                value={broadcastTeam}
                onChange={(e) => setBroadcastTeam(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
              >
                <option value="T1">Team 1 (T1)</option>
                <option value="T2">Team 2 (T2)</option>
                <option value="T3">Team 3 (T3)</option>
                <option value="T4">Team 4 (T4)</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Initial Status</label>
              <select
                value={broadcastStatus}
                onChange={(e) => setBroadcastStatus(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
              >
                <option value="Dispatched">Dispatched</option>
                <option value="En Route">En Route</option>
                <option value="On Scene">On Scene</option>
                <option value="Stabilizing">Stabilizing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Emergency Notes</label>
            <textarea
              value={broadcastNotes}
              onChange={(e) => setBroadcastNotes(e.target.value)}
              placeholder="Describe details: Patient Vitals status, required equipment..."
              rows="3"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:border-outline dark:bg-surface"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface hover:bg-surface-container transition-colors dark:border-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-error text-white font-bold rounded-lg hover:bg-error/90 transition-all shadow-md"
            >
              Broadcast Alert
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="" size="md">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant dark:border-outline -mx-6 -mt-2 px-6 pb-4 mb-2">
          <span className={`inline-flex items-center justify-center p-2 rounded-lg
            ${selectedAlert?.type === 'critical' ? 'bg-error-container text-error' : selectedAlert?.type === 'warning' ? 'bg-pending-bg text-pending-text' : 'bg-secondary/15 text-secondary'}
          `}>
            <span className="material-symbols-outlined">
              {selectedAlert?.type === 'resolved' ? 'check_circle' : 'e911_emergency'}
            </span>
          </span>
          <div>
            <h3 className="text-xl font-bold text-on-surface">{selectedAlert?.label}</h3>
            <p className="text-xs text-outline font-medium">Alert ID: {selectedAlert?.id}</p>
          </div>
        </div>

        {selectedAlert && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-surface-container p-4 rounded-xl dark:bg-surface-container-high">
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Trigger Time</p>
                <p className="text-sm font-bold text-on-surface">{selectedAlert.time} EST</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Location & Bed</p>
                <p className="text-sm font-bold text-on-surface">{selectedAlert.location} - {selectedAlert.bed}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Responding Team</p>
                <p className="text-sm font-bold text-on-surface">{selectedAlert.team || 'No team assigned'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Current Status</p>
                <span className={`inline-block mt-0.5 text-xs font-bold px-2 py-0.5 rounded uppercase
                  ${selectedAlert.type === 'critical' ? 'bg-error text-white' : selectedAlert.type === 'warning' ? 'bg-tertiary text-white' : 'bg-secondary text-white'}
                `}>
                  {selectedAlert.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-outline mb-1">Clinical Incident Description</p>
              <p className="text-sm text-on-surface leading-relaxed bg-surface-container-lowest border border-outline-variant p-3 rounded-lg dark:bg-surface dark:border-outline">
                {selectedAlert.description || 'No detailed incident notes available.'}
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-outline mb-3">Response Timeline</p>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white dark:border-inverse-surface"></span>
                  <p className="text-xs font-bold text-on-surface">Alert Triggered</p>
                  <p className="text-[10px] text-outline">{selectedAlert.time}</p>
                </div>
                {selectedAlert.team && (
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white dark:border-inverse-surface"></span>
                    <p className="text-xs font-bold text-on-surface">Team {selectedAlert.team} Dispatched</p>
                    <p className="text-[10px] text-outline">Within 30 seconds of alert</p>
                  </div>
                )}
                {selectedAlert.status !== 'Dispatched' && selectedAlert.status !== 'En Route' && selectedAlert.status !== 'Cleared' && (
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white dark:border-inverse-surface"></span>
                    <p className="text-xs font-bold text-on-surface">First Responders On Scene</p>
                    <p className="text-[10px] text-outline">Team engaged at patient bedside</p>
                  </div>
                )}
                {selectedAlert.type === 'resolved' && (
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-white dark:border-inverse-surface"></span>
                    <p className="text-xs font-bold text-secondary">Incident Resolved & Cleared</p>
                    <p className="text-[10px] text-outline">Closed by department physician</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant dark:border-outline">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface hover:bg-surface-container transition-colors dark:border-outline"
              >
                Close
              </button>
              {selectedAlert.type !== 'resolved' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success(`Dispatched update ping to team ${selectedAlert.team || 'A'}`);
                      setIsDetailModalOpen(false);
                    }}
                    className="px-4 py-2 bg-surface-container-high border border-outline-variant text-primary font-bold rounded-lg hover:bg-surface-container transition-colors dark:border-outline"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveAlert(selectedAlert.id)}
                    className="px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md"
                  >
                    Resolve Incident
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
