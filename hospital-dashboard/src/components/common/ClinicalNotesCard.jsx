import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const priorityConfig = {
  high: { label: 'High Priority', class: 'bg-error/10 text-error border-error/20' },
  medium: { label: 'Medium', class: 'bg-warning/10 text-warning border-warning/20' },
  normal: { label: 'Routine', class: 'bg-secondary/10 text-secondary border-secondary/20' },
};

function exportClinicalReportPDF({
  patientName = 'Nina Patel',
  patientId = 'PT-4422',
  patientAge = '27 yrs',
  patientDob = '27 May 2026',
  doctorName = 'Dr. James Wilson',
  doctorSpecialty = 'Pediatrics',
  date = '27 May 2026 • 01:30 PM',
  notes = 'Review immunization adherence and schedule booster.',
  prescriptions = [],
  followUpDate = '03 June 2026'
}) {
  try {
    const doc = new jsPDF();

    // Primary Colors
    const primaryColor = [0, 53, 95];
    const secondaryColor = [9, 131, 107];
    const textColor = [51, 65, 85];
    const lightBg = [248, 250, 252];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CUREPULSE MEDICAL CENTER', 15, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Smart Health Systems | 24/7 Digital Care Portal', 15, 27);
    doc.text('123 Healthcare Blvd, Medical District, Bengaluru', 15, 33);

    // Document Title
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL CONSULTATION REPORT', 15, 55);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 60, 195, 60);

    // Patient & Consultation Details Grid
    doc.setFillColor(...lightBg);
    doc.roundedRect(15, 65, 180, 45, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, 65, 180, 45, 3, 3, 'S');

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PATIENT INFORMATION', 20, 73);
    doc.text('CONSULTATION INFORMATION', 110, 73);

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Name: ${patientName}`, 20, 80);
    doc.text(`Patient ID: ${patientId}`, 20, 86);
    doc.text(`Age / DOB: ${patientAge} / ${patientDob}`, 20, 92);
    doc.text(`Status: Active`, 20, 98);

    doc.text(`Consulting Doctor: ${doctorName}`, 110, 80);
    doc.text(`Specialty: ${doctorSpecialty || 'General Medicine'}`, 110, 86);
    doc.text(`Consultation Date: ${date}`, 110, 92);
    doc.text(`Report ID: CP-REP-${Math.floor(100000 + Math.random() * 900000)}`, 110, 98);

    // Clinical Notes Section
    let currentY = 122;
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CLINICAL OBSERVATIONS & NOTES', 15, currentY);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY + 3, 195, currentY + 3);

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const notesText = typeof notes === 'string'
      ? notes
      : Array.isArray(notes)
        ? notes.join('\n')
        : 'No clinical notes recorded.';
        
    const splitNotes = doc.splitTextToSize(notesText, 180);
    doc.text(splitNotes, 15, currentY + 10);
    
    currentY += 15 + (splitNotes.length * 5);

    // Prescription Section (if any)
    const activePrescriptions = prescriptions && prescriptions.length > 0 ? prescriptions : [
      { medication: 'Paracetamol Syrup', dosage: '10 ml', frequency: 'Once daily', route: 'Oral' },
      { medication: 'Multivitamin Drops', dosage: '1 ml', frequency: 'Once daily', route: 'Oral' }
    ];

    if (activePrescriptions.length > 0) {
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PRESCRIPTION & MEDICAL INSTRUCTIONS', 15, currentY);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY + 3, 195, currentY + 3);
      
      currentY += 10;
      
      const rxColumns = ['Medication', 'Dosage', 'Frequency', 'Route / Admin'];
      const rxRows = activePrescriptions.map((rx) => {
        const name = typeof rx === 'string' ? rx : rx.medication || rx.name || '';
        const dosage = typeof rx === 'string' ? 'As directed' : rx.dosage || 'As directed';
        const freq = typeof rx === 'string' ? 'Once daily' : rx.frequency || 'Once daily';
        const route = typeof rx === 'string' ? 'Oral' : rx.route || rx.duration || 'Oral';
        return [name, dosage, freq, route];
      });

      doc.autoTable({
        startY: currentY,
        head: [rxColumns],
        body: rxRows,
        headStyles: { fillColor: secondaryColor },
        theme: 'striped',
        styles: { fontSize: 9.5 },
        margin: { left: 15, right: 15 }
      });
      
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Follow Up Info
    if (followUpDate) {
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, currentY, 180, 15, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, currentY, 180, 15, 2, 2, 'S');

      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('FOLLOW-UP APPOINTMENT:', 20, currentY + 9);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');
      doc.text(followUpDate, 72, currentY + 9);
      
      currentY += 25;
    } else {
      currentY += 10;
    }

    // Footer Signatures
    if (currentY > 240) {
      doc.addPage();
      currentY = 40;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY + 15, 75, currentY + 15);
    doc.line(135, currentY + 15, 195, currentY + 15);

    doc.setTextColor(...textColor);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Patient Signature', 35, currentY + 20);
    doc.text('Authorized Doctor Signature', 145, currentY + 20);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer generated clinical consultation report. No physical signature is required.', 45, currentY + 35);

    doc.save(`clinical_report_${patientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    toast.success('Clinical report PDF downloaded successfully');
  } catch (error) {
    console.error(error);
    toast.error('Failed to download PDF report');
  }
}

function NotesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-outline-variant/50 bg-surface p-4 dark:border-outline/50">
          <div className="h-4 bg-surface-container-high rounded w-1/3 mb-2" />
          <div className="h-3 bg-surface-container-high rounded w-1/4 mb-3" />
          <div className="space-y-2">
            <div className="h-3 bg-surface-container-high rounded w-full" />
            <div className="h-3 bg-surface-container-high rounded w-5/6" />
            <div className="h-3 bg-surface-container-high rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-primary/40">clinical_notes</span>
      </div>
      <h3 className="text-base font-bold text-on-surface mb-1">No Consultation Notes Available</h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
        Post-consultation guidance, prescriptions, and doctor recommendations will appear here after your appointments.
      </p>
    </div>
  );
}

export { NotesSkeleton, NotesEmptyState };

export default function ClinicalNotesCard({
  doctorName,
  doctorSpecialty,
  date,
  priority = 'normal',
  notes,
  prescriptions = [],
  followUpDate,
  attachments = [],
  isExpanded: controlledExpanded,
  onToggle,
  variant = 'default',
  patientName,
  patientId,
  patientAge,
  patientDob,
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const toggle = onToggle ?? (() => setInternalExpanded((p) => !p));
  const priorityStyle = priorityConfig[priority] || priorityConfig.normal;

  const handleDownload = () => {
    exportClinicalReportPDF({
      patientName,
      patientId,
      patientAge,
      patientDob,
      doctorName,
      doctorSpecialty,
      date,
      notes,
      prescriptions,
      followUpDate,
    });
  };

  if (!notes && !prescriptions.length && !followUpDate) return null;

  const notesLines = typeof notes === 'string'
    ? notes.split('\n').filter(Boolean)
    : Array.isArray(notes) ? notes : [];

  const wrapperClass = variant === 'minimal'
    ? ''
    : 'rounded-xl border border-outline-variant bg-surface shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 dark:border-outline dark:bg-surface overflow-hidden';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group ${wrapperClass}`}
    >
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left cursor-pointer border-none bg-transparent p-0"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-lg">stethoscope</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-on-surface truncate max-w-[200px] sm:max-w-[300px]">{doctorName || 'Doctor'}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${priorityStyle.class}`}>
                    {priorityStyle.label}
                  </span>
                </div>
                {doctorSpecialty && (
                  <p className="text-xs text-on-surface-variant mt-0.5">{doctorSpecialty}</p>
                )}
                {date && (
                  <p className="text-xs text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                    {date}
                  </p>
                )}
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/60 text-lg transition-transform duration-200 shrink-0" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_more
            </span>
          </div>

          <div className="mt-3 pl-[52px] w-full min-w-0">
            <p className="text-sm text-on-surface leading-relaxed break-words line-clamp-2 w-full min-w-0" style={{ lineHeight: '1.6' }}>
              {notesLines[0] || notes || 'No clinical notes recorded.'}
            </p>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden w-full min-w-0"
          >
            <div className="px-4 pb-4 pt-0 space-y-4 border-t border-outline-variant/50 dark:border-outline/50 w-full min-w-0">
              {notesLines.length > 1 && (
                <div className="pt-4 space-y-2 w-full min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Clinical Notes</p>
                  <div className="space-y-1.5 w-full min-w-0">
                    {notesLines.map((line, i) => {
                      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•');
                      const content = line.trim().replace(/^[-*•]\s*/, '');
                      return (
                        <p key={i} className={`text-sm leading-relaxed break-words w-full min-w-0 ${isBullet ? 'flex items-start gap-2' : ''}`} style={{ lineHeight: '1.6' }}>
                          {isBullet ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                              <span className="text-on-surface min-w-0 break-words">{content}</span>
                            </>
                          ) : (
                            <span className="text-on-surface min-w-0 break-words w-full">{line}</span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}

              {prescriptions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Prescription</p>
                  <div className="space-y-1.5">
                    {prescriptions.map((rx, i) => {
                      const name = typeof rx === 'string' ? rx : rx.medication || rx.name || '';
                      const dosage = typeof rx === 'string' ? '' : rx.dosage || '';
                      const freq = typeof rx === 'string' ? '' : rx.frequency || '';
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-base text-secondary">medication</span>
                          <span className="font-medium text-on-surface">{name}</span>
                          {dosage && <span className="text-on-surface-variant">{dosage}</span>}
                          {freq && <span className="text-on-surface-variant/70">{freq}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {followUpDate && (
                <div className="flex items-center gap-2 text-sm bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
                  <span className="material-symbols-outlined text-base text-primary">event_repeat</span>
                  <span className="font-medium text-on-surface">Follow-up:</span>
                  <span className="text-on-surface-variant">{followUpDate}</span>
                </div>
              )}

              {(attachments?.length > 0) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Attachments ({attachments.length})</p>
                  <div className="space-y-1.5">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-base text-primary">description</span>
                        <span className="text-on-surface truncate flex-1">{att.name || `Report ${i + 1}`}</span>
                        <span className="material-symbols-outlined text-base text-on-surface-variant/60">download</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
