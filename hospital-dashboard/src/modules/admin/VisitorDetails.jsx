import { useMemo, useState, useCallback } from 'react';
import { FiSearch, FiTrash2, FiUsers, FiMonitor, FiSmartphone, FiTablet, FiEye, FiEyeOff, FiClock, FiUser, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getVisitors, clearAllVisitors } from '../../services/visitorTracker';
import { formatDateTime } from '../../lib/formatters';

function DeviceIcon({ deviceType }) {
  if (deviceType === 'Mobile') return <FiSmartphone className="text-lg" />;
  if (deviceType === 'Tablet') return <FiTablet className="text-lg" />;
  return <FiMonitor className="text-lg" />;
}

function BrowserIcon({ browser }) {
  const colors = {
    Chrome: 'text-yellow-500',
    Firefox: 'text-orange-500',
    Safari: 'text-blue-500',
    Edge: 'text-emerald-500',
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container-high ${colors[browser] || 'text-on-surface-variant'}`}>{browser}</span>;
}

export default function VisitorDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [showOnlyLoggedIn, setShowOnlyLoggedIn] = useState(false);
  const [visitorData, setVisitorData] = useState(() => {
    const data = getVisitors();
    return data.reverse();
  });

  const refresh = useCallback(() => {
    const data = getVisitors();
    setVisitorData(data.reverse());
  }, []);

  const visitors = visitorData;

  const stats = useMemo(() => {
    const total = visitors.length;
    const today = visitors.filter(v => v.firstVisit?.startsWith(new Date().toISOString().slice(0, 10))).length;
    const loggedIn = visitors.filter(v => v.user).length;
    const uniqueDevices = new Set(visitors.map(v => v.device?.userAgent)).size;
    return { total, today, loggedIn, uniqueDevices };
  }, [visitors]);

  const filteredVisitors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return visitors.filter(v => {
      if (showOnlyLoggedIn && !v.user) return false;
      if (!q) return true;
      return (
        v.user?.name?.toLowerCase().includes(q) ||
        v.user?.email?.toLowerCase().includes(q) ||
        v.user?.role?.toLowerCase().includes(q) ||
        v.device?.browser?.toLowerCase().includes(q) ||
        v.device?.os?.toLowerCase().includes(q) ||
        v.device?.deviceType?.toLowerCase().includes(q) ||
        v.referrer?.toLowerCase().includes(q)
      );
    });
  }, [visitors, searchTerm, showOnlyLoggedIn]);

  function handleClear() {
    clearAllVisitors();
    refresh();
    toast.success('Visitor data cleared');
  }

  function handleRefresh() {
    refresh();
    toast.success('Data refreshed');
  }

  function formatTimeSpent(seconds) {
    if (!seconds && seconds !== 0) return '...';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Visitor Details</h1>
          <p className="text-on-surface-variant text-sm mt-1">Monitor site visitors, devices, and user activity</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-high transition-all cursor-pointer text-sm font-medium">
            <FiRefreshCw className="text-base" />
            Refresh
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all cursor-pointer text-sm font-medium border border-error/20">
            <FiTrash2 />
            Clear Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-outline-variant bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiUsers className="text-primary text-lg" />
            </div>
            <span className="text-label-md uppercase text-on-surface-variant tracking-wider">Total Visitors</span>
          </div>
          <p className="text-display-md font-extrabold text-on-surface">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <FiClock className="text-secondary text-lg" />
            </div>
            <span className="text-label-md uppercase text-on-surface-variant tracking-wider">Today</span>
          </div>
          <p className="text-display-md font-extrabold text-on-surface">{stats.today}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <FiUser className="text-warning text-lg" />
            </div>
            <span className="text-label-md uppercase text-on-surface-variant tracking-wider">Logged In</span>
          </div>
          <p className="text-display-md font-extrabold text-on-surface">{stats.loggedIn}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <FiMonitor className="text-info text-lg" />
            </div>
            <span className="text-label-md uppercase text-on-surface-variant tracking-wider">Unique Devices</span>
          </div>
          <p className="text-display-md font-extrabold text-on-surface">{stats.uniqueDevices}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by name, email, device, referrer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
          <button
            onClick={() => setShowOnlyLoggedIn(!showOnlyLoggedIn)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
              showOnlyLoggedIn
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {showOnlyLoggedIn ? <FiEye /> : <FiEyeOff />}
            Logged-in Only
          </button>
          <span className="text-sm text-on-surface-variant">{filteredVisitors.length} session{filteredVisitors.length !== 1 ? 's' : ''}</span>
        </div>

        {filteredVisitors.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <FiUsers className="text-4xl mx-auto mb-3 opacity-40" />
            <p className="font-medium">No visitor data yet</p>
            <p className="text-sm mt-1">Visitor data will appear here when people browse the site.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {filteredVisitors.map((session) => (
              <div key={session.sessionId}>
                <div
                  onClick={() => setExpanded(expanded === session.sessionId ? null : session.sessionId)}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    session.user ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    <DeviceIcon deviceType={session.device?.deviceType} />
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-5 gap-4 items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {session.user ? session.user.name : 'Guest'}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {session.user ? session.user.email : session.device?.deviceType || 'Unknown'}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-on-surface truncate">{session.device?.browser || '?'} on {session.device?.os || '?'}</p>
                      <BrowserIcon browser={session.device?.browser} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-on-surface truncate">
                        {session.user ? <span className="capitalize">{session.user.role}</span> : '—'}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-on-surface truncate">{session.pageCount} page{session.pageCount !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-on-surface-variant truncate" title={session.referrer}>{session.referrer || 'Direct'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-on-surface-variant">{formatDateTime(session.firstVisit)}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg transition-transform" style={{ transform: expanded === session.sessionId ? 'rotate(180deg)' : '' }}>
                    expand_more
                  </span>
                </div>

                {expanded === session.sessionId && (
                  <div className="px-4 pb-4 pt-0 bg-surface-container-low">
                    <div className="ml-14 p-4 rounded-xl bg-surface border border-outline-variant space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Device</p>
                          <p className="text-sm text-on-surface">{session.device?.browser} / {session.device?.os}</p>
                          <p className="text-xs text-on-surface-variant">{session.device?.screenResolution}</p>
                          <p className="text-xs text-on-surface-variant mt-1">{session.device?.deviceType}</p>
                        </div>
                        {session.user && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">User</p>
                            <p className="text-sm text-on-surface">{session.user.name}</p>
                            <p className="text-xs text-on-surface-variant">{session.user.email}</p>
                            <p className="text-xs text-on-surface-variant capitalize">{session.user.role}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Referrer</p>
                          <p className="text-sm text-on-surface truncate max-w-[200px]" title={session.referrer}>{session.referrer || 'Direct'}</p>
                          <p className="text-xs text-on-surface-variant mt-1">First visit: {formatDateTime(session.firstVisit)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Pages Visited ({session.pages?.length})</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {session.pages?.map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface-container-high text-sm">
                              <span className="text-on-surface font-mono text-xs">{page.path}</span>
                              <span className="text-on-surface-variant text-xs flex items-center gap-1">
                                <FiClock className="text-[10px]" />
                                {page.timeSpent ? formatTimeSpent(page.timeSpent) : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">User Agent</p>
                        <p className="text-xs text-on-surface-variant break-all font-mono">{session.device?.userAgent}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
