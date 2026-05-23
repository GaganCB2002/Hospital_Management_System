import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend,
} from 'recharts';
import Modal from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { formatInr, formatDate } from '../../lib/formatters';

const PIE_COLORS = ['#2563EB', '#059669', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DoctorDetailModal({ doctor, isOpen, onClose, onEdit, onDelete }) {
  const { patients, appointments } = useHospital();
  const { user } = useAuth();

  const doctorPatients = useMemo(
    () => patients.filter((p) => p.doctorId === doctor?.doctorId || p.doctor === doctor?.name),
    [patients, doctor],
  );
  const doctorAppointments = useMemo(
    () => appointments.filter((a) => a.doctorId === doctor?.doctorId || a.doctor === doctor?.name),
    [appointments, doctor],
  );
  const completedAppts = doctorAppointments.filter((a) => a.status === 'Completed');
  const stats = doctor?.performanceStats || { consultations: 0, successRate: '0%', averageWait: '0 mins', monthlyRevenue: 0 };

  const monthlyData = useMemo(() => [
    { month: 'Jan', consultations: 28 + (doctor ? (doctor.id * 3) % 10 : 0) },
    { month: 'Feb', consultations: 32 + (doctor ? (doctor.id * 7) % 10 : 0) },
    { month: 'Mar', consultations: 25 + (doctor ? (doctor.id * 4) % 10 : 0) },
    { month: 'Apr', consultations: 38 + (doctor ? (doctor.id * 9) % 10 : 0) },
    { month: 'May', consultations: 42 + (doctor ? (doctor.id * 2) % 10 : 0) },
    { month: 'Jun', consultations: 35 + (doctor ? (doctor.id * 5) % 10 : 0) },
  ], [doctor]);

  const caseDistribution = [
    { name: 'Routine Checkups', value: 40 },
    { name: 'Surgeries', value: 25 },
    { name: 'Emergency', value: 15 },
    { name: 'Follow-ups', value: 12 },
    { name: 'Consultations', value: 8 },
  ];

  const ratingBreakdown = useMemo(() => [
    { stars: '5 Star', count: 72 + (doctor ? (doctor.id * 11) % 15 : 0) },
    { stars: '4 Star', count: 18 + (doctor ? (doctor.id * 3) % 7 : 0) },
    { stars: '3 Star', count: 7 + (doctor ? (doctor.id * 2) % 5 : 0) },
    { stars: '2 Star', count: 2 + (doctor ? (doctor.id * 1) % 3 : 0) },
    { stars: '1 Star', count: 1 },
  ], [doctor]);

  if (!doctor) return null;

  const qualList = doctor.qualification ? doctor.qualification.split(', ') : ['MBBS'];
  const sampleReviews = [
    { id: 1, patient: 'John Doe', rating: 5, comment: 'Excellent doctor! Very thorough in diagnosis and treatment.', date: '2026-05-15' },
    { id: 2, patient: 'Mary Smith', rating: 4, comment: 'Great experience. The doctor explained everything clearly.', date: '2026-05-10' },
    { id: 3, patient: 'Robert Johnson', rating: 5, comment: 'Highly skilled and compassionate. Highly recommend.', date: '2026-05-05' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-6">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-5 border border-outline-variant">
          <div className="shrink-0 flex flex-col items-center md:items-start w-full md:w-auto min-w-0">
            <img src={doctor.avatar} alt={doctor.name} className="w-28 h-28 rounded-2xl border-2 border-outline-variant object-cover bg-surface shadow-md" />
            <div className="flex gap-1.5 mt-3">
              <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer border-none">Book</button>
              <button className="px-3 py-1.5 border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer bg-transparent">Contact</button>
            </div>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-xl font-bold text-on-surface break-words">{doctor.name}</h2>
            <p className="text-sm text-on-surface-variant mt-0.5 break-words">{doctor.specialization}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 break-words">{doctor.department}</span>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border break-words ${
                doctor.status === 'Available' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                doctor.status === 'In-Surgery' ? 'bg-warning/10 text-warning border-warning/20' :
                'bg-surface-container-high text-on-surface-variant border-outline-variant'
              }`}>{doctor.status}</span>
              {doctor.leaveStatus && <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-surface-container-high text-on-surface-variant border border-outline-variant break-words">{doctor.leaveStatus}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-on-surface-variant w-full">
              <span className="flex items-center gap-1 break-words"><span className="material-symbols-outlined text-base shrink-0">school</span><span className="min-w-0 break-words">{doctor.qualification || 'N/A'}</span></span>
              <span className="flex items-center gap-1 break-words"><span className="material-symbols-outlined text-base shrink-0">work_history</span><span className="min-w-0 break-words">{doctor.experience}</span></span>
              <span className="flex items-center gap-1 break-words"><span className="material-symbols-outlined text-base shrink-0">payments</span><span className="min-w-0 break-words">Fee: {formatInr(doctor.consultationFee)}</span></span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Experience', value: doctor.experience || `${doctor.experienceYears || 0}y`, icon: 'work_history', color: 'text-primary' },
            { label: 'Rating', value: `${doctor.rating || 0}/5`, icon: 'star', color: 'text-yellow-500' },
            { label: 'Patients', value: doctorPatients.length || doctor.patients || 0, icon: 'patients', color: 'text-secondary' },
            { label: 'Consultations', value: stats.consultations, icon: 'monitoring', color: 'text-primary' },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col items-center text-center w-full min-w-0">
              <span className={`material-symbols-outlined text-lg ${s.color} shrink-0`}>{s.icon}</span>
              <span className="text-lg font-bold text-on-surface mt-1 break-words w-full">{s.value}</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-0.5 text-center w-full">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Personal & Professional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-surface rounded-xl border border-outline-variant p-5">
            <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">badge</span> Personal Information
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Phone', value: doctor.phone, icon: 'call' },
                { label: 'Email', value: doctor.email, icon: 'mail' },
                { label: 'Department', value: doctor.department, icon: 'business' },
                { label: 'Employee ID', value: doctor.doctorId, icon: 'tag' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 w-full">
                  <span className="material-symbols-outlined text-outline text-base shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block break-words">{item.label}</span>
                    <span className="text-sm text-on-surface break-words">{item.value || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-surface rounded-xl border border-outline-variant p-5">
            <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span> Professional Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Qualifications</span>
                <ul className="mt-1 space-y-1">
                  {qualList.map((q, i) => <li key={i} className="text-sm text-on-surface flex items-center gap-1.5 w-full"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /><span className="min-w-0 break-words">{q}</span></li>)}
                </ul>
              </div>
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Specialization</span>
                <p className="text-sm text-on-surface mt-0.5">{doctor.specialization}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Experience</span>
                <p className="text-sm text-on-surface mt-0.5">{doctor.experience || `${doctor.experienceYears || 0} years`}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">License ID</span>
                <p className="text-sm text-on-surface mt-0.5">LIC-MD-{8000 + parseInt(doctor.doctorId?.replace('DOC-', '') || '1')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-surface rounded-xl border border-outline-variant p-5">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">monitoring</span> Performance Analytics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Success Rate', value: stats.successRate, color: 'text-secondary' },
              { label: 'Avg Wait Time', value: stats.averageWait, color: 'text-warning' },
              { label: 'Monthly Revenue', value: formatInr(stats.monthlyRevenue), color: 'text-primary' },
              { label: 'Completed Cases', value: completedAppts.length, color: 'text-secondary' },
            ].map((m) => (
              <div key={m.label} className="text-center p-3 bg-surface-container-low rounded-xl w-full min-w-0">
                <span className={`text-lg font-bold ${m.color} break-words`}>{m.value}</span>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mt-0.5 break-words">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Consultations */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-3">Monthly Consultations</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.3} />
                    <XAxis dataKey="month" stroke="var(--color-on-surface-variant)" fontSize={11} />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', borderRadius: '8px', color: 'var(--color-on-surface)', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="consultations" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Case Distribution Pie */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-3">Case Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={caseDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {caseDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', borderRadius: '8px', color: 'var(--color-on-surface)', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: 'var(--color-on-surface-variant)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Management */}
        <div className="bg-surface rounded-xl border border-outline-variant p-5">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_month</span> Weekly Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {(doctor.availabilitySchedule || []).length > 0 ? doctor.availabilitySchedule.map((day) => (
              <div key={day.day} className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/50">
                <p className="text-xs font-bold text-primary mb-1.5">{day.day}</p>
                <div className="flex flex-wrap gap-1">
                  {day.slots.map((slot) => (
                    <span key={slot} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      slot === 'Emergency On-call' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                    }`}>{slot}</span>
                  ))}
                </div>
              </div>
            )) : <p className="text-sm text-on-surface-variant col-span-full italic">No schedule available</p>}
          </div>
        </div>

        {/* Appointment History */}
        <div className="bg-surface rounded-xl border border-outline-variant p-5">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span> Appointment History
          </h3>
          {doctorAppointments.length > 0 ? (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold text-on-surface-variant uppercase">Patient</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold text-on-surface-variant uppercase">Date</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold text-on-surface-variant uppercase">Time</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold text-on-surface-variant uppercase">Type</th>
                    <th className="text-left py-2.5 px-3 text-[10px] font-bold text-on-surface-variant uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointments.slice(0, 8).map((a) => (
                    <tr key={a.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 px-3 text-sm text-on-surface">{a.patient}</td>
                      <td className="py-2.5 px-3 text-sm text-on-surface-variant">{a.date}</td>
                      <td className="py-2.5 px-3 text-sm text-on-surface-variant">{a.time}</td>
                      <td className="py-2.5 px-3 text-sm text-on-surface-variant">{a.type}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.status === 'Completed' ? 'bg-confirmed-bg text-confirmed-text' :
                          a.status === 'Confirmed' ? 'bg-secondary/10 text-secondary' :
                          a.status === 'Pending' ? 'bg-pending-bg text-pending-text' :
                          'bg-surface-container-high text-on-surface-variant'
                        }`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant italic">No appointments found</p>
          )}
        </div>

        {/* Reviews & Ratings */}
        <div className="bg-surface rounded-xl border border-outline-variant p-5">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">reviews</span> Reviews & Ratings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Breakdown Chart */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase mb-3">Rating Distribution</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" opacity={0.3} />
                    <XAxis type="number" stroke="var(--color-on-surface-variant)" fontSize={11} />
                    <YAxis dataKey="stars" type="category" stroke="var(--color-on-surface-variant)" fontSize={11} width={55} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', borderRadius: '8px', color: 'var(--color-on-surface)', fontSize: '12px' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {ratingBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Recent Reviews */}
            <div className="space-y-2">
              {sampleReviews.map((r) => (
                <div key={r.id} className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-on-surface">{r.patient}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-sm ${i < r.rating ? 'text-yellow-500' : 'text-outline'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{r.comment}</p>
                  <p className="text-[10px] text-outline mt-1">{formatDate(r.date)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {user?.role === 'admin' && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant w-full min-w-0">
            <button
              onClick={() => onEdit?.(doctor)}
              className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer border-none"
            >
              Edit Profile
            </button>
            <button className="px-3.5 py-2 border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer bg-transparent">
              Assign Department
            </button>
            <button className="px-3.5 py-2 border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer bg-transparent">
              Update Schedule
            </button>
            <button className="px-3.5 py-2 border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer bg-transparent">
              Download Profile
            </button>
            <button
              onClick={() => onDelete?.(doctor)}
              className="px-3.5 py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors cursor-pointer border-none"
            >
              Delete Doctor
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
