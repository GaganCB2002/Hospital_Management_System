import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { formatCompactInr, formatInr } from '../../lib/formatters';

export default function DoctorProfile() {
  const { user } = useAuth();
  const { doctors, appointments } = useHospital();

  const doctor = useMemo(
    () => doctors.find((d) => d.name === user?.name || d.email === user?.email || d.doctorId === user?.doctorId),
    [doctors, user],
  );

  const myAppointments = useMemo(
    () => appointments.filter((a) => a.doctorId === doctor?.doctorId || a.doctor === doctor?.name),
    [appointments, doctor],
  );

  const completedAppointments = myAppointments.filter((a) => a.status === 'Completed');
  const pendingAppointments = myAppointments.filter((a) => ['Pending', 'Confirmed'].includes(a.status));
  const totalPatientsHandled = doctor?.assignedPatients?.length || 0;

  if (!doctor) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-3">person_off</span>
        <h2 className="text-xl font-bold text-on-surface">Doctor profile not found</h2>
        <p className="text-sm text-on-surface-variant mt-1">Please ensure your doctor account is properly linked.</p>
      </div>
    );
  }

  const qualParts = doctor.qualification ? doctor.qualification.split(', ').map((q, i) => ({ id: i, degree: q, institution: i === 0 ? 'Premier Medical Institute' : i === 1 ? 'National University Hospital' : 'Advanced Fellowship Program', year: `${2026 - doctor.experienceYears + i * 2 - 2} - ${2026 - doctor.experienceYears + i * 2}` })) : [];
  const stats = doctor.performanceStats || { consultations: 0, successRate: '0%', averageWait: '0 mins', monthlyRevenue: 0 };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-background">
      <div className="max-w-[1200px] mx-auto space-y-6 pb-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              <span>Doctors</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary font-bold">Profile Management</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Dr. {doctor.name}</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-lg">print</span>
              Print Profile
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left Column - Identity Card */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

            {/* Doctor Identity Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="h-32 bg-primary-container/50 relative">
                <button className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                </button>
              </div>
              <div className="px-5 pb-5 relative flex flex-col items-center text-center -mt-16">
                <div className="w-32 h-32 rounded-full border-4 border-surface bg-surface-container-highest overflow-hidden mb-4 shadow-sm relative">
                  <img alt="Doctor Avatar" className="w-full h-full object-cover" src={doctor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`} />
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center border-2 border-surface">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-on-surface mb-1">Dr. {doctor.name}</h2>
                <p className="text-sm text-on-surface-variant mb-3">{doctor.specialization}</p>
                <div className="flex gap-2 mb-5">
                  <span className="px-2.5 py-1 text-xs font-bold rounded border border-primary/20 bg-primary/10 text-primary">{doctor.department}</span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded border ${
                    doctor.status === 'Available' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                    doctor.status === 'In-Surgery' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-surface-container-high text-on-surface-variant border-outline-variant'
                  }`}>{doctor.status}</span>
                </div>
                <div className="w-full border-t border-outline-variant pt-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-lg">mail</span>
                    <span className="text-sm text-on-surface">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-lg">call</span>
                    <span className="text-sm text-on-surface">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-lg">business</span>
                    <span className="text-sm text-on-surface">{doctor.department} Department, Room {1000 + parseInt(doctor.doctorId?.replace('DOC-', '') || '1')}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-outline text-lg">payments</span>
                    <span className="text-sm text-on-surface">Consultation Fee: {formatInr(doctor.consultationFee)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Schedule */}
            <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                <h3 className="text-base font-bold text-on-surface">Weekly Schedule</h3>
              </div>
              <div className="space-y-2.5">
                {(doctor.availabilitySchedule || []).length > 0 ? doctor.availabilitySchedule.map((day) => (
                  <div key={day.day} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-on-surface-variant w-20 shrink-0 pt-0.5">{day.day}</span>
                    <div className="flex flex-wrap gap-1">
                      {day.slots.map((slot) => (
                        <span key={slot} className={`text-xs font-semibold px-2 py-1 rounded ${
                          slot === 'Emergency On-call' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                        }`}>{slot}</span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-on-surface-variant italic">No schedule available</p>
                )}
              </div>
            </div>

            {/* Administrative Notes */}
            <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-on-surface">Administrative Notes</h3>
                <button className="text-primary hover:bg-surface-container-low p-1 rounded transition-colors cursor-pointer border-none bg-transparent">
                  <span className="material-symbols-outlined">edit_note</span>
                </button>
              </div>
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                {doctor.bio || `${doctor.name} is an experienced ${doctor.specialization} specialist with ${doctor.experience || 'many years'} of practice.`}
              </p>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

            {/* Biography */}
            <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface border-b border-outline-variant pb-3 mb-4">Professional Biography</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Dr. {doctor.name} is a board-certified {doctor.specialization} specialist in the {doctor.department} department with {doctor.experience || 'extensive'} of clinical experience.
                {doctor.bio ? ` ${doctor.bio}` : ''}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Holds {doctor.qualification} and is dedicated to providing patient-centered care with the latest evidence-based practices. 
                With a track record of {stats.successRate} success rate and over {stats.consultations} consultations, 
                Dr. {doctor.name.split(' ').pop()} is recognized for exceptional clinical outcomes and patient satisfaction.
              </p>
            </div>

            {/* Education & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Education */}
              <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-primary">school</span>
                  <h3 className="text-base font-bold text-on-surface">Education & Qualifications</h3>
                </div>
                {qualParts.length > 0 ? (
                  <ul className="space-y-3 flex-1">
                    {qualParts.map((q) => (
                      <li key={q.id} className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{q.degree}</span>
                        <span className="text-sm font-bold text-on-surface">{q.institution}</span>
                        <span className="text-xs text-outline">{q.year}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-on-surface-variant italic flex-1 flex items-center">{doctor.qualification}</p>
                )}
              </div>

              {/* Certifications */}
              <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                  <h3 className="text-base font-bold text-on-surface">Certifications & Licenses</h3>
                </div>
                <div className="space-y-2 flex-1">
                  {[
                    { name: 'Board Certification', detail: `${doctor.department} • Valid till 2028`, verified: true },
                    { name: 'State Medical License', detail: `Lic #MD-${8000 + parseInt(doctor.doctorId?.replace('DOC-', '') || '1')} • Active`, verified: true },
                    { name: 'Professional Membership', detail: `${doctor.department} Association • Active`, verified: true },
                  ].map((cert) => (
                    <div key={cert.name} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/50 flex justify-between items-center group hover:border-primary transition-colors">
                      <div>
                        <div className="text-sm font-bold text-on-surface">{cert.name}</div>
                        <div className="text-xs text-outline">{cert.detail}</div>
                      </div>
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  ))}
                  <button className="w-full mt-auto pt-2 text-center text-xs font-bold text-primary hover:underline uppercase cursor-pointer border-none bg-transparent">
                    + Add Certification
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col items-center text-center shadow-sm">
                <span className="text-2xl font-bold text-primary">{doctor.experienceYears}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase mt-1">Years Exp.</span>
              </div>
              <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col items-center text-center shadow-sm">
                <span className="text-2xl font-bold text-primary">{stats.consultations}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase mt-1">Total Consults</span>
              </div>
              <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col items-center text-center shadow-sm">
                <span className="text-2xl font-bold text-primary">{stats.successRate}</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase mt-1">Success Rate</span>
              </div>
              <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col items-center text-center shadow-sm">
                <span className="text-2xl font-bold text-secondary">{doctor.rating}</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-sm ${i < Math.round(doctor.rating || 0) ? 'text-yellow-500' : 'text-outline'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="text-xs font-bold text-on-surface-variant uppercase mt-1">Patient Rating</span>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface border-b border-outline-variant pb-3 mb-4">Clinical Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Cases Handled (Total)</span>
                  <span className="text-xl font-bold text-on-surface">{stats.consultations}</span>
                  <span className="text-xs text-on-surface-variant">Lifetime patient consultations</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Currently Assigned</span>
                  <span className="text-xl font-bold text-on-surface">{totalPatientsHandled}</span>
                  <span className="text-xs text-on-surface-variant">Active patients under care</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Avg. Wait Time</span>
                  <span className="text-xl font-bold text-on-surface">{stats.averageWait}</span>
                  <span className="text-xs text-on-surface-variant">Patient wait time in clinic</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-4 border-t border-outline-variant">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Completed Appointments</span>
                  <span className="text-xl font-bold text-secondary">{completedAppointments.length}</span>
                  <span className="text-xs text-on-surface-variant">Successfully completed visits</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Pending Appointments</span>
                  <span className="text-xl font-bold text-warning">{pendingAppointments.length}</span>
                  <span className="text-xs text-on-surface-variant">Awaiting confirmation/completion</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Monthly Revenue</span>
                  <span className="text-xl font-bold text-primary">{formatCompactInr(stats.monthlyRevenue)}</span>
                  <span className="text-xs text-on-surface-variant">Estimated monthly contribution</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
