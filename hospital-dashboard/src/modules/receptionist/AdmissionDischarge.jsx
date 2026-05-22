export default function AdmissionDischarge() {
  const admissions = [
    { id: '#PT-8492', name: 'Sarah Jenkins', dept: 'Cardiology', bed: 'C-402', status: 'Urgent', statusColor: 'bg-error/10 text-error dark:text-error-container', rowClass: '' },
    { id: '#PT-8493', name: 'Michael Chen', dept: 'Orthopedics', bed: 'O-115', status: 'Stable', statusColor: 'bg-surface-variant dark:bg-surface text-on-surface', rowClass: '' },
    { id: '#PT-8494', name: 'Emily Davis', dept: 'Neurology', bed: 'Pending', isPending: true, status: 'Intake', statusColor: 'bg-surface-variant dark:bg-surface text-on-surface', rowClass: 'bg-surface-container-low/50 dark:bg-on-primary-fixed/50 border-l-2 border-primary dark:border-primary-fixed' },
    { id: '#PT-8495', name: 'Robert Wilson', dept: 'General Surgery', bed: 'G-220', status: 'Stable', statusColor: 'bg-surface-variant dark:bg-surface text-on-surface', rowClass: '' },
    { id: '#PT-8496', name: 'Amanda Lee', dept: 'Pediatrics', bed: 'P-305', status: 'Stable', statusColor: 'bg-surface-variant dark:bg-surface text-on-surface', rowClass: '' }
  ];

  const discharges = [
    { id: 1, name: 'James Thompson', ptId: '#PT-8102', bed: 'C-405', time: '14:00', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', isImg: true, progress: '66%', opacity: '',
      checks: [
        { label: 'Medical Clearance', icon: 'check_circle', iconColor: 'text-secondary dark:text-secondary-fixed' },
        { label: 'Pharmacy Meds', icon: 'check_circle', iconColor: 'text-secondary dark:text-secondary-fixed' },
        { label: 'Transport Arranged', icon: 'radio_button_unchecked', iconColor: 'text-outline' }
      ]
    },
    { id: 2, name: 'Maria Rodriguez', ptId: '#PT-8215', bed: 'G-210', time: '16:30', initials: 'MR', isImg: false, progress: '33%', opacity: 'opacity-80',
      checks: []
    }
  ];

  const wards = [
    { id: 1, name: 'Cardiology (Ward C)', beds: ['occupied', 'occupied', 'occupied', 'available', 'available'] },
    { id: 2, name: 'Orthopedics (Ward O)', beds: ['occupied-primary', 'occupied-primary', 'available', 'available', 'available'] },
    { id: 3, name: 'Neurology (Ward N)', beds: ['occupied-primary', 'occupied-primary', 'occupied-primary', 'occupied-primary', 'occupied-primary'] }
  ];

  const renderBed = (status, idx) => {
    const bgClass = status === 'occupied'
      ? 'bg-error dark:bg-error-container'
      : status === 'occupied-primary'
        ? 'bg-primary/40 dark:bg-primary-fixed/50'
        : 'bg-surface-variant dark:bg-surface';
    const title = status === 'occupied' || status === 'occupied-primary' ? 'Occupied' : 'Available';
    return <div key={idx} className={`w-3 h-6 rounded-sm ${bgClass}`} title={title}></div>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-lg md:p-xl scroll-smooth bg-background dark:bg-background">
      <div className="max-w-[1600px] mx-auto space-y-lg pb-xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-background mb-1">Admission & Discharge Tracking</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Real-time overview of patient flow and bed management.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="bg-surface-container-lowest dark:bg-surface border border-outline-variant dark:border-outline text-on-surface font-label-md text-label-md px-4 py-2 rounded flex items-center hover:bg-surface-container-low dark:hover:bg-on-primary-fixed transition-colors shadow-sm">
              <span className="material-symbols-outlined mr-2 text-sm">filter_list</span>
              Filter Views
            </button>
            <button className="bg-primary text-on-primary font-label-md text-label-md font-bold px-4 py-2 rounded flex items-center hover:bg-primary/90 transition-colors shadow-sm" onClick={() => alert('Admit Patient Modal opens here.')}>
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Admit Patient
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          {/* KPI Cards (Bento Style) */}
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Admissions */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-lg p-5 border border-outline-variant/50 dark:border-outline shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface-variant mb-1">Current Admissions</p>
                  <h3 className="font-display-lg text-display-lg font-bold text-primary dark:text-primary-fixed">142</h3>
                </div>
                <div className="p-2 bg-primary-container/10 dark:bg-primary-fixed/10 rounded-md text-primary dark:text-primary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bed</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-data-mono text-data-mono font-bold text-secondary dark:text-secondary-fixed">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                <span>+5% from yesterday</span>
              </div>
            </div>

            {/* Pending Discharges */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-lg p-5 border border-outline-variant/50 dark:border-outline shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface-variant mb-1">Pending Discharges</p>
                  <h3 className="font-display-lg text-display-lg font-bold text-secondary dark:text-secondary-fixed">28</h3>
                </div>
                <div className="p-2 bg-secondary-container/20 dark:bg-secondary-fixed/20 rounded-md text-secondary dark:text-secondary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-data-mono text-data-mono font-bold text-secondary dark:text-secondary-fixed">
                <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                <span>12 cleared to go</span>
              </div>
            </div>

            {/* Available Beds */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-lg p-5 border border-outline-variant/50 dark:border-outline shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface-variant mb-1">Available Beds</p>
                  <h3 className="font-display-lg text-display-lg font-bold text-on-background">45</h3>
                </div>
                <div className="p-2 bg-surface-variant dark:bg-surface rounded-md text-on-surface">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                </div>
              </div>
              <div className="w-full bg-surface-variant dark:bg-on-primary-fixed rounded-full h-1.5 mt-2">
                <div className="bg-primary dark:bg-primary-fixed h-1.5 rounded-full" style={{ width: '76%' }}></div>
              </div>
              <div className="flex justify-between mt-2 font-data-mono text-[10px] text-on-surface-variant">
                <span>Occupancy</span>
                <span>76%</span>
              </div>
            </div>

            {/* Avg Length of Stay */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-lg p-5 border border-outline-variant/50 dark:border-outline shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-outline/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface-variant mb-1">Avg Length of Stay</p>
                  <div className="flex items-baseline">
                    <h3 className="font-display-lg text-display-lg font-bold text-on-background">4.2</h3>
                    <span className="font-body-md text-body-md text-on-surface-variant ml-1">Days</span>
                  </div>
                </div>
                <div className="p-2 bg-surface-container dark:bg-on-primary-fixed rounded-md text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-data-mono text-data-mono font-bold text-secondary dark:text-secondary-fixed">
                <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
                <span>-0.3 days this month</span>
              </div>
            </div>
          </div>

          {/* Main Tracking Tables */}
          <div className="md:col-span-8 space-y-6">
            {/* Recent Admissions */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-xl border border-outline-variant/40 dark:border-outline shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-outline-variant/40 dark:border-outline flex justify-between items-center bg-surface-bright dark:bg-surface">
                <h3 className="font-headline-md text-headline-md font-bold text-on-background">Recent Admissions</h3>
                <button className="text-primary dark:text-primary-fixed font-label-md text-label-md font-bold hover:underline">View All</button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-surface-bright dark:bg-surface-container z-10 shadow-[0_1px_0_rgba(194,199,209,1)] dark:shadow-none">
                    <tr>
                      <th className="p-3 font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Patient ID</th>
                      <th className="p-3 font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Name</th>
                      <th className="p-3 font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Department</th>
                      <th className="p-3 font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Bed</th>
                      <th className="p-3 font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 dark:divide-outline font-body-md text-body-md text-on-background bg-white dark:bg-surface">
                    {admissions.map(adm => (
                      <tr key={adm.id} className={`hover:bg-surface-container-low dark:hover:bg-on-primary-fixed transition-colors cursor-pointer ${adm.rowClass}`}>
                        <td className="p-3 font-data-mono text-data-mono font-bold text-primary dark:text-primary-fixed">{adm.id}</td>
                        <td className="p-3 font-medium">{adm.name}</td>
                        <td className="p-3">{adm.dept}</td>
                        <td className={`p-3 font-data-mono text-data-mono ${adm.isPending ? 'text-outline italic' : ''}`}>{adm.bed}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${adm.statusColor}`}>{adm.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side Widgets */}
          <div className="md:col-span-4 space-y-6">
            {/* Discharge Checklist Radar */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-xl border border-outline-variant/40 dark:border-outline shadow-sm p-5 h-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-headline-md font-bold text-on-background">Pending Discharges</h3>
                <span className="material-symbols-outlined text-outline">more_vert</span>
              </div>
              <div className="space-y-4">
                {discharges.map(dc => (
                  <div key={dc.id} className={`bg-surface-bright dark:bg-on-primary-fixed border border-outline-variant/50 dark:border-outline rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${dc.opacity}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {dc.isImg ? (
                          <img alt="Patient portrait" className="w-8 h-8 rounded-full mr-2 border border-outline-variant dark:border-outline" src={dc.img} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-container dark:bg-primary-fixed/20 text-on-primary-container dark:text-primary-fixed flex items-center justify-center font-bold text-xs mr-2 border border-primary/20">
                            {dc.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-label-md text-label-md font-bold text-on-background leading-tight">{dc.name}</p>
                          <p className="font-data-mono text-[10px] text-outline">{dc.ptId} • Bed {dc.bed}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-secondary dark:text-secondary-fixed bg-secondary-container/30 dark:bg-secondary-fixed/30 px-2 py-0.5 rounded">{dc.time}</span>
                    </div>
                    {dc.checks.length > 0 && (
                      <div className="space-y-1">
                        {dc.checks.map((chk, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-body-md text-body-md text-on-surface-variant text-xs flex items-center">
                              <span className={`material-symbols-outlined text-[14px] mr-1 ${chk.iconColor}`}>{chk.icon}</span> {chk.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="w-full bg-surface-variant dark:bg-surface rounded-full h-1 mt-3">
                      <div className="bg-secondary dark:bg-secondary-fixed h-1 rounded-full" style={{ width: dc.progress }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-primary dark:text-primary-fixed font-label-md text-label-md font-bold py-2 border border-primary/20 dark:border-primary-fixed/30 rounded hover:bg-primary/5 transition-colors">
                View All Discharges
              </button>
            </div>

            {/* Bed Availability Map */}
            <div className="bg-surface-container-lowest dark:bg-surface rounded-xl border border-outline-variant/40 dark:border-outline shadow-sm p-5">
              <h3 className="font-headline-md text-headline-md font-bold text-on-background mb-4">Ward Status</h3>
              <div className="space-y-3">
                {wards.map(ward => (
                  <div key={ward.id} className="flex items-center justify-between">
                    <span className="font-body-md text-body-md font-medium text-on-surface">{ward.name}</span>
                    <div className="flex space-x-1">
                      {ward.beds.map((b, i) => renderBed(b, i))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
