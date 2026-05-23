import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useHospital } from '../../../context/HospitalContext';
import { formatDateTime, formatInr } from '../../../lib/formatters';
import RevenueChart from '../../../components/charts/RevenueChart';
import DepartmentChart from '../../../components/charts/DepartmentChart';
import { medicalInventory } from '../../../mock/data';


export default function AdminDashboard() {
  const { doctors, patients, appointments, billing, activityFeed, revenueData, departmentStats } = useHospital();
  const navigate = useNavigate();

  const paidRevenue = billing.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const dashboardCards = [
    {
      title: 'Total Patients',
      value: patients.length,
      subtitle: 'Active hospital records',
      action: () => navigate('/admin/patients'),
    },
    {
      title: 'Available Doctors',
      value: doctors.filter((doctor) => doctor.status === 'Available').length,
      subtitle: `${doctors.length} on roster`,
      action: () => navigate('/admin/doctors'),
    },
    {
      title: 'Pending Approvals',
      value: appointments.filter((appointment) => appointment.status === 'Pending').length,
      subtitle: 'Workflow items awaiting action',
      action: () => navigate('/admin/doctors'),
    },
    {
      title: 'Revenue Collected',
      value: formatInr(paidRevenue),
      subtitle: 'Paid invoices in INR',
      action: () => navigate('/admin/financials'),
    },
  ];

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => ['Pending', 'Confirmed'].includes(appointment.status)).slice(0, 5),
    [appointments],
  );

  const handleDownload = (reportName) => {
    downloadReport(reportName, patients, billing);
  };

  const totalEmployees = doctors.length;
  const presentEmployees = doctors.filter(doctor => doctor.status !== 'On Leave' && doctor.status !== 'Leave').length;
  const leaveEmployees = doctors.filter(doctor => doctor.status === 'On Leave' || doctor.status === 'Leave').length;
  const inSurgeryEmployees = doctors.filter(doctor => doctor.status === 'In-Surgery').length;
  const onCallEmployees = doctors.filter(doctor => doctor.status === 'On-Call').length;
  const availableEmployees = doctors.filter(doctor => doctor.status === 'Available').length;
  const presenceRate = totalEmployees ? Math.round((presentEmployees / totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={card.action}
            className="rounded-2xl border border-outline-variant bg-surface p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md w-full min-w-0"
          >
            <p className="text-label-md uppercase text-on-surface-variant break-words">{card.title}</p>
            <h2 className="mt-2 text-display-lg text-on-surface break-words">{card.value}</h2>
            <p className="text-body-md text-on-surface-variant break-words">{card.subtitle}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr] w-full min-w-0">
        <div className="w-full min-w-0"><RevenueChart data={revenueData} /></div>
        <div className="w-full min-w-0"><DepartmentChart data={departmentStats} /></div>
      </div>

      <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-outline-variant pb-4">
          <div>
            <h2 className="text-headline-md text-on-surface">Workforce Availability & Attendance</h2>
            <p className="text-body-md text-on-surface-variant">Real-time status of hospital roster, active staff duty, and leave records.</p>
          </div>
          <button type="button" onClick={() => navigate('/admin/employees')} className="rounded-xl bg-primary px-4 py-2 text-body-md font-bold text-on-primary transition-all hover:bg-primary/95">
            Manage Roster
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-5">
          <div className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0">
            <p className="text-xs uppercase text-on-surface-variant break-words">Total Employees</p>
            <h3 className="mt-1 text-headline-lg font-bold text-on-surface break-words">{totalEmployees}</h3>
          </div>
          <div className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0">
            <p className="text-xs uppercase text-secondary break-words">Present Today</p>
            <h3 className="mt-1 text-headline-lg font-bold text-secondary break-words">{presentEmployees}</h3>
          </div>
          <div className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0">
            <p className="text-xs uppercase text-on-surface-variant break-words">Available Duty</p>
            <h3 className="mt-1 text-headline-lg font-bold text-on-surface break-words">{availableEmployees}</h3>
          </div>
          <div className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0">
            <p className="text-xs uppercase text-on-surface break-words">On Call</p>
            <h3 className="mt-1 text-headline-lg font-bold text-on-surface break-words">{onCallEmployees}</h3>
          </div>
          <div className="rounded-xl border border-outline-variant p-4 bg-surface-container-lowest w-full min-w-0">
            <p className="text-xs uppercase text-error break-words">On Leave</p>
            <h3 className="mt-1 text-headline-lg font-bold text-error break-words">{leaveEmployees}</h3>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-md font-bold text-on-surface">Staff Roster Attendance Rate</span>
            <span className="text-body-md font-bold text-secondary">{presenceRate}% Active</span>
          </div>
          <div className="w-full bg-outline-variant/30 h-3 rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all" style={{ width: `${presenceRate}%` }}></div>
          </div>
          <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed">
            <strong>Workforce Analysis:</strong> Out of {totalEmployees} registered employees, {presentEmployees} are present on active duty today ({availableEmployees} Available, {inSurgeryEmployees} in Surgery operations, {onCallEmployees} on emergency On-Call). Currently, {leaveEmployees} employee(s) are on leave today. Roster efficiency is operating at {presenceRate}% capacity.
          </p>
        </div>

        <div className="mt-6">
          <h4 className="text-body-md font-bold text-on-surface mb-3">Live Roster Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {doctors.map(doctor => (
              <div key={doctor.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant bg-surface-container-lowest w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img src={doctor.avatar} alt={doctor.name} className="h-10 w-10 rounded-full border border-outline-variant bg-surface object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-bold text-on-surface break-words">{doctor.name}</p>
                    <p className="text-xs text-on-surface-variant break-words">{doctor.role || 'Doctor'} • {doctor.department}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  doctor.status === 'Available' ? 'bg-secondary/15 text-secondary' :
                  doctor.status === 'In-Surgery' ? 'bg-error-container text-error' :
                  doctor.status === 'On-Call' ? 'bg-primary/15 text-on-surface' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {doctor.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant p-5">
            <div>
              <h2 className="text-headline-md text-on-surface">Appointments Overview</h2>
              <p className="text-body-md text-on-surface-variant">Upcoming appointments with direct access to the workflow queue.</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/doctors')} className="text-body-md font-bold text-on-surface">
              View Calendar
            </button>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Patient</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Doctor</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Date & Time</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Department</th>
                  <th className="px-3 py-3 text-label-md uppercase text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-outline-variant/40">
                    <td className="px-3 py-4 text-body-md font-bold text-on-surface">{appointment.patient}</td>
                    <td className="px-3 py-4 text-body-md text-on-surface">{appointment.doctor}</td>
                    <td className="px-3 py-4 text-body-md text-on-surface-variant">{formatDateTime(appointment.date, appointment.time)}</td>
                    <td className="px-3 py-4 text-body-md text-on-surface">{appointment.department}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-label-md ${appointment.status === 'Pending' ? 'bg-pending-bg text-pending-text' : 'bg-secondary/15 text-secondary'}`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
          <h2 className="text-headline-md text-on-surface">Daily Reports</h2>
          <div className="mt-4 space-y-3">
            {['Patient Census Report', 'Financial Summary', 'Inventory Snapshot'].map((report) => (
              <button key={report} type="button" onClick={() => handleDownload(report)} className="w-full rounded-xl border border-outline-variant px-4 py-3 text-left transition-colors hover:bg-surface-container-low">
                <p className="text-body-md font-bold text-on-surface">{report}</p>
                <p className="text-body-md text-on-surface-variant">Download latest report</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md text-on-surface">Hospital Activity</h2>
            <button type="button" onClick={() => navigate('/admin/settings')} className="text-body-md font-bold text-on-surface">Audit Logs</button>
          </div>
          <div className="mt-4 space-y-3">
            {activityFeed.slice(0, 5).map((feed) => (
              <div key={feed.id} className="rounded-xl border border-outline-variant p-4">
                <p className="text-body-md text-on-surface">{feed.message}</p>
                <p className="mt-2 text-label-md text-on-surface-variant">{feed.time}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
          <h2 className="text-headline-md text-on-surface">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <button type="button" onClick={() => navigate('/admin/patients')} className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary">
              Open Patient Records
            </button>
            <button type="button" onClick={() => navigate('/admin/financials')} className="w-full rounded-xl bg-secondary px-4 py-3 text-body-md font-bold text-on-secondary">
              Review Billing Queue
            </button>
            <button type="button" onClick={() => navigate('/admin/settings')} className="w-full rounded-xl border border-outline-variant px-4 py-3 text-body-md font-bold text-on-surface">
              Open Settings
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function downloadReport(reportName, patients, billing) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setTextColor(0, 53, 95);
  doc.text('CurePulse Hospital Management System', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(114, 119, 128);
  doc.text(reportName, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 38);
  doc.text(`Operator: Admin Portal`, 14, 44);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 48, 196, 48);

  if (reportName === 'Patient Census Report') {
    const tableColumn = ["Patient ID", "Name", "Age/Gender", "Ward/Dept", "Doctor", "Status", "Condition"];
    const tableRows = patients.map(p => [
      p.id, p.name, `${p.age} / ${p.gender}`, `${p.ward} (${p.department})`, p.doctor, p.status, p.condition
    ]);
    doc.autoTable({ startY: 52, head: [tableColumn], body: tableRows, headStyles: { fillColor: [0, 53, 95] }, theme: 'striped' });
  } else if (reportName === 'Financial Summary') {
    const tableColumn = ["Invoice ID", "Patient", "Date", "Department", "Method", "Status", "Amount"];
    const tableRows = billing.map(b => [
      b.id, b.patient, b.date, b.department, b.method, b.status, `INR ${b.amount.toLocaleString('en-IN')}`
    ]);
    const totalPaid = billing.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const totalPending = billing.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
    
    doc.autoTable({ startY: 52, head: [tableColumn], body: tableRows, headStyles: { fillColor: [0, 53, 95] }, theme: 'striped' });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 107, 95);
    doc.text(`Total Paid Revenue: INR ${totalPaid.toLocaleString('en-IN')}`, 14, finalY);
    doc.setTextColor(110, 0, 29);
    doc.text(`Total Pending Collection: INR ${totalPending.toLocaleString('en-IN')}`, 14, finalY + 7);
  } else if (reportName === 'Inventory Snapshot') {
    const items = medicalInventory || [];
    const tableColumn = ["Item Name", "Category", "Stock Level", "Threshold", "Status"];
    const tableRows = items.map(i => [i.name, i.category, `${i.stock} ${i.unit}`, i.threshold, i.status]);
    doc.autoTable({ startY: 52, head: [tableColumn], body: tableRows, headStyles: { fillColor: [0, 53, 95] }, theme: 'striped' });
  } else {
    doc.text("Generic report details summarized.", 14, 52);
  }
  
  doc.save(`${reportName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  toast.success(`${reportName} PDF Downloaded`);
}
