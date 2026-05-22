import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

function ProfileCard({ user }) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="h-32 bg-primary-container/50 relative" />
      <div className="px-5 pb-5 relative flex flex-col items-center text-center -mt-16">
        <div className="w-32 h-32 rounded-full border-4 border-surface bg-surface-container-highest overflow-hidden mb-4 shadow-sm relative">
          <img alt="Avatar" className="w-full h-full object-cover" src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
        </div>
        <h2 className="text-lg font-bold text-on-surface mb-1">{user.name}</h2>
        <span className="px-2.5 py-1 text-xs font-bold rounded border border-primary/20 bg-primary/10 text-primary mb-3">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
        <div className="w-full border-t border-outline-variant pt-4 flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-outline text-lg">mail</span>
            <span className="text-sm text-on-surface">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-outline text-lg">call</span>
              <span className="text-sm text-on-surface">{user.phone}</span>
            </div>
          )}
          {user.department && (
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-outline text-lg">business</span>
              <span className="text-sm text-on-surface">{user.department} Department</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AllProfilesTab({ doctors, patients }) {
  const [activeSubTab, setActiveSubTab] = useState('doctors');
  const tabs = [
    { key: 'doctors', label: 'Doctors', icon: 'stethoscope' },
    { key: 'patients', label: 'Patients', icon: 'patient_list' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-outline-variant pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors cursor-pointer border-none ${
              activeSubTab === tab.key
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'doctors' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-2">Doctor</th>
                <th className="py-3 px-2">Department</th>
                <th className="py-3 px-2">Specialization</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.doctorId} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <img className="w-8 h-8 rounded-full object-cover" src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} alt="" />
                      <span className="font-bold text-on-surface">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-on-surface-variant">{doc.department}</td>
                  <td className="py-3 px-2 text-on-surface-variant">{doc.specialization}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      doc.status === 'Available' ? 'bg-secondary/10 text-secondary' :
                      doc.status === 'In-Surgery' ? 'bg-warning/10 text-warning' :
                      'bg-surface-container-high text-on-surface-variant'
                    }`}>{doc.status}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-on-surface">{doc.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'patients' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-2">Patient</th>
                <th className="py-3 px-2">Age/Gender</th>
                <th className="py-3 px-2">Department</th>
                <th className="py-3 px-2">Doctor</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id || p.patientId} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{p.patient || p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-on-surface-variant">{p.age || '-'}/{p.gender ? p.gender.charAt(0) : '-'}</td>
                  <td className="py-3 px-2 text-on-surface-variant">{p.department || '-'}</td>
                  <td className="py-3 px-2 text-on-surface-variant">{p.doctor || p.doctorId || '-'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      (p.status === 'Admitted' || p.status === 'Active') ? 'bg-secondary/10 text-secondary' :
                      p.status === 'Discharged' ? 'bg-surface-container-high text-on-surface-variant' :
                      'bg-warning/10 text-warning'
                    }`}>{p.status || 'Active'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { doctors, patients } = useHospital();
  const [activeSection, setActiveSection] = useState('profile');

  if (!user) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-3">person_off</span>
        <h2 className="text-xl font-bold text-on-surface">Profile not found</h2>
        <p className="text-sm text-on-surface-variant mt-1">Please log in to view your profile.</p>
      </div>
    );
  }

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-background">
      <div className="max-w-[1200px] mx-auto space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-sm">account_circle</span>
              <span className="text-primary font-bold">Profile</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="flex gap-2 border-b border-outline-variant pb-2">
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors cursor-pointer border-none ${
                activeSection === 'profile'
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-lg">person</span>
              My Profile
            </button>
            <button
              onClick={() => setActiveSection('all-profiles')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors cursor-pointer border-none ${
                activeSection === 'all-profiles'
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-lg">groups</span>
              All Profiles
            </button>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <ProfileCard user={user} />
            </div>

            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="text-base font-bold text-on-surface border-b border-outline-variant pb-3 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">Full Name</span>
                    <p className="text-sm font-bold text-on-surface mt-1">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">Role</span>
                    <p className="text-sm font-bold text-on-surface mt-1">{roleLabel}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">Email</span>
                    <p className="text-sm text-on-surface mt-1">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">Phone</span>
                    <p className="text-sm text-on-surface mt-1">{user.phone || 'Not provided'}</p>
                  </div>
                  {user.department && (
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase">Department</span>
                      <p className="text-sm font-bold text-on-surface mt-1">{user.department}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="text-base font-bold text-on-surface border-b border-outline-variant pb-3 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-primary">{doctors?.length || 0}</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">Total Doctors</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-secondary">{patients?.length || 0}</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">Total Patients</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-warning">{
                      doctors?.filter(d => d.status === 'Available' || d.status === 'In-Surgery').length || 0
                    }</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">Active Doctors</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-primary">{
                      doctors?.length ? `${Math.round(doctors.filter(d => d.rating >= 4).length / doctors.length * 100)}%` : '0%'
                    }</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">High Rated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'all-profiles' && user.role === 'admin' && (
          <AllProfilesTab doctors={doctors || []} patients={patients || []} />
        )}
      </div>
    </div>
  );
}
