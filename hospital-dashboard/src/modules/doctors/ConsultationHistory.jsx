import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import ClinicalNotesCard from '../../components/common/ClinicalNotesCard';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../lib/formatters';
import { matchesQuery } from '../../lib/search';

function exportConsultationPDF(records) {
  try {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(0, 53, 95);
    doc.text('CurePulse Hospital Management System', 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(114, 119, 128);
    doc.text('Consultation History Report', 14, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 38);
    doc.text(`Department: All Clinical Encounters`, 14, 44);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 48, 196, 48);

    const tableColumn = ["Patient", "Patient ID/DOB", "Date/Time", "Clinical Notes", "Primary Diagnosis", "Prescriptions", "Consulting Doctor"];
    const tableRows = records.map(r => [
      r.name,
      r.patientId || '',
      r.date,
      r.notes || '',
      r.diagnosis || 'N/A',
      r.medications ? r.medications.join(', ') : 'None',
      r.doctor
    ]);

    doc.autoTable({
      startY: 52,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [0, 53, 95] },
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    doc.save(`consultation_history_${Date.now()}.pdf`);
    toast.success('Consultation history PDF exported successfully');
  } catch (error) {
    console.error(error);
    toast.error('Failed to export consultation history PDF');
  }
}

const statusBadgeMap = {
  Completed: { text: 'Completed', class: 'bg-secondary-container/20 text-secondary dark:text-secondary-fixed' },
  Confirmed: { text: 'Active', class: 'bg-primary/10 text-primary dark:text-primary-fixed' },
  Pending: { text: 'Pending', class: 'border border-outline dark:border-outline text-on-surface-variant' },
  Rejected: { text: 'Rejected', class: 'bg-error-container/20 text-error dark:text-error-container' },
};

export default function ConsultationHistory() {
  const { appointments, patients, doctors } = useHospital();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const currentDoctor = useMemo(() =>
    doctors.find(d => d.name === user?.name),
    [doctors, user]
  );

  const records = useMemo(() => {
    if (!currentDoctor) return [];

    const doctorAppointments = appointments.filter(apt =>
      apt.doctorId === currentDoctor.doctorId ||
      apt.doctor === currentDoctor.name
    );

    return doctorAppointments.map((apt) => {
      const patient = patients.find(p => p.id === apt.patientId);
      const diagnosisList = patient?.diagnosisHistory || [];
      const primaryDiagnosis = diagnosisList.length > 0 ? diagnosisList[0].diagnosis : apt.type;
      const medications = patient?.prescriptions?.map(p => `${p.medication}${p.dosage ? ` ${p.dosage}` : ''}`) || [];
      const patientDOB = patient?.age ? `${patient.age} yrs` : '';
      const badge = statusBadgeMap[apt.status] || statusBadgeMap.Pending;

      return {
        id: apt.id || apt.appointmentId,
        colSpan: apt.status === 'Completed' ? 'col-span-12 lg:col-span-8' : 'col-span-12 lg:col-span-4',
        stripeColor: apt.status === 'Completed'
          ? 'bg-primary/50'
          : apt.status === 'Confirmed'
            ? 'bg-secondary-container dark:bg-secondary-fixed'
            : 'bg-surface-container-high dark:bg-surface-container',
        avatarUrl: patient
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.name)}`
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(apt.patient)}`,
        name: apt.patient,
        patientId: `${apt.patientId}${patientDOB ? ` • DOB: ${patientDOB}` : ''}`,
        badgeText: badge.text,
        badgeClass: badge.class,
        date: formatDateTime(apt.date, apt.time),
        diagnosis: primaryDiagnosis,
        diagnosisColor: 'text-primary dark:text-primary-fixed',
        notes: apt.notes || 'No clinical notes recorded.',
        medications: medications.length > 0 ? medications.slice(0, 3) : [],
        doctor: apt.doctor,
        isFullLayout: apt.status === 'Completed' || apt.status === 'Confirmed',
        status: apt.status,
        location: apt.location,
        type: apt.type,
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments, patients, currentDoctor]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(records.map(r => {
      const apt = appointments.find(a => a.patientId === r.patientId?.split(' •')[0]);
      return apt?.department;
    }).filter(Boolean));
    return [...depts];
  }, [records, appointments]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (search && !matchesQuery(r.name, search) && !matchesQuery(r.patientId, search) && !matchesQuery(r.diagnosis, search)) return false;
      if (departmentFilter) {
        const apt = appointments.find(a => a.patientId === r.patientId?.split(' •')[0]);
        if (apt?.department !== departmentFilter) return false;
      }
      if (dateFilter) {
        const aptDate = r.date?.split(' •')[0];
        if (aptDate !== dateFilter) return false;
      }
      return true;
    });
  }, [records, search, departmentFilter, dateFilter, appointments]);

  const handleExportPDF = () => {
    exportConsultationPDF(filteredRecords);
  };

  return (
    <div className="flex-1 overflow-y-auto p-lg md:p-xl scroll-smooth bg-background dark:bg-background">
      <div className="max-w-[1600px] mx-auto space-y-lg pb-xl">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-display-lg text-display-lg font-bold text-on-surface">Consultation History</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Archive of all clinical encounters and patient records.</p>
          </div>
          <div className="flex gap-sm">
            <button onClick={handleExportPDF} className="px-md py-sm border border-outline dark:border-outline bg-surface-container-lowest dark:bg-surface text-primary dark:text-primary-fixed rounded-lg font-label-md text-label-md font-bold hover:bg-surface-container-low dark:hover:bg-on-primary-fixed transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">download</span> Export
            </button>
          </div>
        </div>

        <section className="grid grid-cols-12 gap-lg mb-xl">
          <div className="col-span-12 bg-surface dark:bg-surface border border-outline-variant dark:border-outline rounded-xl p-md flex flex-wrap gap-md items-center shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <label className="block font-label-md text-label-md font-bold text-on-surface-variant mb-xs">Patient ID or Name</label>
              <input
                className="w-full bg-surface-container-lowest dark:bg-on-primary-fixed border border-outline-variant dark:border-outline rounded-lg px-sm py-xs text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. PT-8921 or Doe"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block font-label-md text-label-md font-bold text-on-surface-variant mb-xs">Date Range</label>
              <input
                className="w-full bg-surface-container-lowest dark:bg-on-primary-fixed border border-outline-variant dark:border-outline rounded-lg px-sm py-xs text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block font-label-md text-label-md font-bold text-on-surface-variant mb-xs">Department</label>
              <select
                className="w-full bg-surface-container-lowest dark:bg-on-primary-fixed border border-outline-variant dark:border-outline rounded-lg px-sm py-xs text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="pt-6">
              <button
                onClick={() => { setSearch(''); setDepartmentFilter(''); setDateFilter(''); }}
                className="px-md py-sm bg-primary text-white rounded-lg font-label-md text-label-md font-bold hover:bg-primary/90 transition-colors h-10 shadow-sm"
              >
                {search || departmentFilter || dateFilter ? 'Clear Filters' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </section>

        {filteredRecords.length === 0 ? (
          <div className="col-span-12 text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">history</span>
            <p className="text-on-surface-variant mt-sm">No consultation records found.</p>
          </div>
        ) : (
          <section className="grid grid-cols-12 gap-lg">
            {filteredRecords.map((record) => (
              <article key={record.id} className={`${record.colSpan} bg-surface dark:bg-surface border border-outline-variant dark:border-outline rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${record.stripeColor}`}></div>

                <div className="flex justify-between items-start mb-md">
                  {record.isFullLayout ? (
                    <div className="flex items-center gap-sm">
                      <div className="w-12 h-12 rounded-full bg-surface-container dark:bg-on-primary-fixed overflow-hidden border border-outline-variant dark:border-outline">
                        <img alt="Patient Avatar" className="w-full h-full object-cover" src={record.avatarUrl} />
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{record.name}</h3>
                        <p className="font-data-mono text-data-mono text-on-surface-variant">{record.patientId}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-headline-md text-[18px] font-bold text-on-surface">{record.name}</h3>
                      <p className="font-data-mono text-[12px] text-on-surface-variant">{record.patientId}</p>
                    </div>
                  )}

                  {record.isFullLayout ? (
                    <div className="text-right">
                      <span className={`inline-block px-sm py-xs ${record.badgeClass} font-label-md text-label-md font-bold rounded-full mb-xs`}>{record.badgeText}</span>
                      <p className="font-body-md text-body-md text-on-surface-variant">{record.date}</p>
                    </div>
                  ) : (
                    <span className={`inline-block px-sm py-xs ${record.badgeClass} font-label-md font-bold text-[10px] rounded-full`}>{record.badgeText}</span>
                  )}
                </div>

                {record.isFullLayout && (
                  <div className="mb-md">
                    <h4 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase mb-xs">Primary Diagnosis</h4>
                    <p className={`font-headline-md text-headline-md font-bold ${record.diagnosisColor}`}>{record.diagnosis}</p>
                  </div>
                )}

                <div className={record.isFullLayout ? "mb-md" : "mb-md"}>
                  {record.isFullLayout && <h4 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase mb-xs">Clinical Notes</h4>}
                  <ClinicalNotesCard
                    doctorName={record.doctor}
                    date={record.date}
                    notes={record.notes}
                    priority="normal"
                    variant="minimal"
                    patientName={record.name}
                    patientId={record.patientId?.split(' •')[0]}
                    patientDob={record.patientId?.split('DOB: ')[1]}
                    prescriptions={record.medications}
                  />
                </div>

                <div className={`${record.isFullLayout ? 'flex justify-between items-center border-t border-outline-variant dark:border-outline pt-md mt-md' : 'mt-auto border-t border-outline-variant dark:border-outline pt-sm'}`}>
                  {!record.isFullLayout && (
                    <p className="font-body-md text-[12px] text-on-surface-variant mb-xs">{record.date}</p>
                  )}

                  {record.isFullLayout && record.medications.length > 0 && (
                    <div className="flex gap-sm flex-wrap">
                      {record.medications.map((med, idx) => (
                        <span key={idx} className="px-sm py-xs border border-outline dark:border-outline rounded-md font-data-mono text-[12px] text-on-surface-variant flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">medication</span> {med}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className={`font-body-md ${record.isFullLayout ? 'text-body-md' : 'text-[12px]'} text-on-surface-variant flex items-center gap-xs`}>
                    <span className="material-symbols-outlined text-[14px]">stethoscope</span> {record.doctor}
                  </p>
                </div>

                {record.location && (
                  <div className="mt-sm pt-sm border-t border-outline-variant dark:border-outline">
                    <p className="font-body-md text-[12px] text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">location_on</span> {record.location}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
