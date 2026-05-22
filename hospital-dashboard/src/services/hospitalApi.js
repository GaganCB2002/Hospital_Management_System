import {
  activityFeed,
  appointments as seedAppointments,
  bedOccupancy,
  billingData as seedBilling,
  departmentStats,
  doctors as seedDoctors,
  medicalInventory,
  patients as seedPatients,
  revenueData,
  settingsSeed,
} from '../mock/data';
import { matchesQuery } from '../lib/search';

const STORAGE_KEY = 'curepulse_hospital_db_v3';
const pendingRequests = new Map();

const defaultDb = {
  patients: seedPatients,
  doctors: seedDoctors,
  appointments: seedAppointments,
  billing: seedBilling,
  activityFeed,
  inventory: medicalInventory,
  revenueData,
  departmentStats,
  bedOccupancy,
  settings: settingsSeed,
  meta: {
    passwordUpdatedAt: null,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeContact(contact) {
  if (!contact) {
    return { name: 'N/A', relation: 'N/A', phone: 'N/A' };
  }

  if (typeof contact === 'string') {
    return { name: contact, relation: 'Relative', phone: 'N/A' };
  }

  return {
    name: contact.name || 'N/A',
    relation: contact.relation || 'Relative',
    phone: contact.phone || 'N/A',
  };
}

function normalizeDocument(document, fallbackName, category = 'General') {
  return {
    id: document?.id || `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: document?.name || fallbackName || 'Document',
    type: document?.type || 'application/octet-stream',
    size: Number(document?.size) || 0,
    category: document?.category || category,
    uploadedAt: document?.uploadedAt || new Date().toISOString(),
    uploadedBy: document?.uploadedBy || 'System',
    dataUrl: document?.dataUrl || '',
  };
}

function normalizeInstruction(instruction, doctorName = 'Doctor') {
  if (!instruction) {
    return null;
  }

  if (typeof instruction === 'string') {
    return {
      id: `INS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      note: instruction,
      createdAt: new Date().toISOString(),
      doctorName,
    };
  }

  return {
    id: instruction.id || `INS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    note: instruction.note || instruction.message || '',
    createdAt: instruction.createdAt || new Date().toISOString(),
    doctorName: instruction.doctorName || doctorName,
  };
}

function normalizeStatusHistory(history, status, actor = 'System') {
  const normalized = ensureArray(history)
    .map((entry) => ({
      id: entry.id || `HIS-${Math.random().toString(36).slice(2, 7)}`,
      status: entry.status || status,
      actor: entry.actor || actor,
      timestamp: entry.timestamp || new Date().toISOString(),
      note: entry.note || '',
    }))
    .filter((entry) => entry.status);

  if (!normalized.length) {
    normalized.push({
      id: `HIS-${Date.now()}`,
      status,
      actor,
      timestamp: new Date().toISOString(),
      note: 'Appointment created',
    });
  }

  return normalized;
}

function buildPatientSeedDocuments(patient) {
  const labDocuments = ensureArray(patient.labReports).map((report) =>
    normalizeDocument(report, report.name || 'Lab Report', 'Lab Report'),
  );
  const scanDocuments = ensureArray(patient.scanReports).map((report) =>
    normalizeDocument(report, report.name || 'Scan Report', 'Scan Report'),
  );
  return [...labDocuments, ...scanDocuments];
}

function normalizeBillingRecord(invoice) {
  return {
    ...invoice,
    amount: Number(invoice.amount) || 0,
    status: invoice.status || 'Pending',
    method: invoice.method || 'Cash',
  };
}

function buildLookups(collection, keys) {
  const map = new Map();
  collection.forEach((item) => {
    keys.forEach((key) => {
      if (item?.[key]) {
        map.set(item[key], item);
      }
    });
  });
  return map;
}

function buildBillingSummary(patientId, billing) {
  return billing
    .filter((invoice) => invoice.patientId === patientId)
    .reduce(
      (summary, invoice) => {
        summary.totalBilled += invoice.amount;
        if (invoice.status === 'Pending') {
          summary.pendingAmount += invoice.amount;
        }
        summary.invoiceCount += 1;
        return summary;
      },
      { totalBilled: 0, pendingAmount: 0, invoiceCount: 0 },
    );
}

function normalizeDb(inputDb) {
  const base = {
    ...clone(defaultDb),
    ...clone(inputDb || {}),
    settings: {
      ...clone(defaultDb.settings),
      ...(inputDb?.settings || {}),
    },
  };

  const billing = ensureArray(base.billing).map(normalizeBillingRecord);
  const rawPatients = ensureArray(base.patients);
  const rawDoctors = ensureArray(base.doctors);
  const rawAppointments = ensureArray(base.appointments);

  const patientLookup = buildLookups(rawPatients, ['id', 'name']);
  const doctorLookup = buildLookups(rawDoctors, ['doctorId', 'id', 'name']);

  const appointments = rawAppointments.map((appointment) => {
    const patient = patientLookup.get(appointment.patientId) || patientLookup.get(appointment.patient);
    const doctor = doctorLookup.get(appointment.doctorId) || doctorLookup.get(appointment.doctor);
    const billingSummary = buildBillingSummary(patient?.id || appointment.patientId, billing);
    const documents = ensureArray(appointment.documents).map((document) =>
      normalizeDocument(document, document?.name || `${appointment.patient || 'Patient'} document`, document?.category || 'Appointment'),
    );
    const doctorInstructions = ensureArray(appointment.doctorInstructions)
      .map((instruction) => normalizeInstruction(instruction, doctor?.name || appointment.doctor))
      .filter(Boolean);

    return {
      ...appointment,
      patientId: patient?.id || appointment.patientId || '',
      patient: patient?.name || appointment.patient || 'Unknown Patient',
      patientFullName: patient?.name || appointment.patientFullName || appointment.patient || 'Unknown Patient',
      doctorId: doctor?.doctorId || doctor?.id || appointment.doctorId || '',
      doctor: doctor?.name || appointment.doctor || 'Unknown Doctor',
      doctorFullName: doctor?.name || appointment.doctorFullName || appointment.doctor || 'Unknown Doctor',
      doctorSpecialization: doctor?.specialization || appointment.doctorSpecialization || 'General',
      department: appointment.department || doctor?.department || patient?.department || 'General',
      type: appointment.type || 'Consultation',
      status: appointment.status || 'Pending',
      bookingMode: appointment.bookingMode || appointment.mode || 'Walk-in',
      bookingSource: appointment.bookingSource || 'Portal',
      fees: Number(appointment.fees ?? doctor?.consultationFee ?? 0),
      notes: appointment.notes || '',
      appointmentId: appointment.appointmentId || `APT-${String(appointment.id || Date.now()).slice(-4)}`,
      contactPhone: appointment.contactPhone || patient?.mobile || patient?.phone || '',
      contactEmail: appointment.contactEmail || patient?.email || '',
      contactDetails: {
        phone: appointment.contactPhone || patient?.mobile || patient?.phone || 'N/A',
        email: appointment.contactEmail || patient?.email || 'N/A',
      },
      patientStatus: patient?.status || appointment.patientStatus || 'Active',
      doctorProfile: {
        doctorId: doctor?.doctorId || doctor?.id || appointment.doctorId || '',
        avatar: doctor?.avatar || '',
        qualification: doctor?.qualification || 'N/A',
        experience: doctor?.experience || 'N/A',
        experienceYears: Number(doctor?.experienceYears) || 0,
        fee: Number(doctor?.consultationFee ?? appointment.fees ?? 0),
        rating: Number(doctor?.rating) || 0,
        department: doctor?.department || appointment.department || 'General',
        specialization: doctor?.specialization || appointment.doctorSpecialization || 'General',
        availabilitySchedule: ensureArray(doctor?.availabilitySchedule),
      },
      documents,
      doctorInstructions,
      statusHistory: normalizeStatusHistory(appointment.statusHistory, appointment.status || 'Pending'),
      previousAppointmentHistory: rawAppointments
        .filter((entry) => (entry.patientId || patient?.id) === (patient?.id || appointment.patientId) && entry.id !== appointment.id)
        .map((entry) => ({
          id: entry.appointmentId || `APT-${String(entry.id).slice(-4)}`,
          date: entry.date,
          time: entry.time,
          status: entry.status,
          doctor: entry.doctor,
        })),
      billingSummary,
      location: appointment.location || `${appointment.department || doctor?.department || 'General'} OPD`,
    };
  });

  const patients = rawPatients.map((patient, index) => {
    const doctor = doctorLookup.get(patient.doctorId) || doctorLookup.get(patient.doctor);
    const patientAppointments = appointments.filter((appointment) => appointment.patientId === patient.id || appointment.patient === patient.name);
    const patientBilling = billing.filter((invoice) => invoice.patientId === patient.id);
    const doctorInstructionLog = [
      ...ensureArray(patient.doctorInstructionLog),
      ...patientAppointments.flatMap((appointment) =>
        ensureArray(appointment.doctorInstructions).map((instruction) => ({
          ...instruction,
          appointmentId: appointment.appointmentId,
        })),
      ),
    ];
    const documents = ensureArray(patient.documents).length
      ? ensureArray(patient.documents).map((document) =>
          normalizeDocument(document, document?.name || `${patient.name} document`, document?.category || 'Patient'),
        )
      : buildPatientSeedDocuments(patient);

    return {
      ...patient,
      id: patient.id || `PT-${String(Date.now()).slice(-4)}-${index}`,
      name: patient.name || patient.personalDetails?.fullName || 'Unknown Patient',
      age: Number(patient.age || patient.personalDetails?.age || 0),
      gender: patient.gender || patient.personalDetails?.gender || 'Unknown',
      phone: patient.phone || patient.mobile || patient.personalDetails?.mobile || '',
      mobile: patient.mobile || patient.phone || patient.personalDetails?.mobile || '',
      email: patient.email || patient.personalDetails?.email || '',
      bloodType: patient.bloodType || patient.personalDetails?.bloodType || 'Unknown',
      ward: patient.ward || 'Pending Triage',
      admittedDate: patient.admittedDate || new Date().toISOString().slice(0, 10),
      department: patient.department || doctor?.department || 'General',
      doctor: doctor?.name || patient.doctor || 'Unassigned',
      doctorId: doctor?.doctorId || doctor?.id || patient.doctorId || '',
      status: patient.status || 'Pending',
      condition: patient.condition || 'Stable',
      notes: patient.notes || '',
      allergies: ensureArray(patient.allergies),
      emergencyContact: normalizeContact(patient.emergencyContact),
      insuranceProvider: patient.insuranceProvider || patient.insuranceDetails?.provider || 'Self Pay',
      insurancePolicy: patient.insurancePolicy || patient.insuranceDetails?.policyNumber || 'SELF-PAY',
      bookingMode: patient.bookingMode || 'Walk-in',
      documents,
      personalDetails: {
        fullName: patient.name || patient.personalDetails?.fullName || 'Unknown Patient',
        age: Number(patient.age || patient.personalDetails?.age || 0),
        gender: patient.gender || patient.personalDetails?.gender || 'Unknown',
        bloodType: patient.bloodType || patient.personalDetails?.bloodType || 'Unknown',
        address: patient.address || patient.personalDetails?.address || 'Address not available',
        email: patient.email || patient.personalDetails?.email || '',
        mobile: patient.mobile || patient.phone || patient.personalDetails?.mobile || '',
      },
      admissionHistory: ensureArray(patient.admissionHistory).length
        ? ensureArray(patient.admissionHistory)
        : [
            {
              date: patient.admittedDate || new Date().toISOString().slice(0, 10),
              summary: `Admitted to ${patient.ward || 'Observation'} under ${patient.department || 'General'}.`,
              status: patient.status || 'Pending',
            },
          ],
      previousTreatments: ensureArray(patient.previousTreatments),
      labReports: ensureArray(patient.labReports),
      prescriptions: ensureArray(patient.prescriptions),
      diagnosisHistory: ensureArray(patient.diagnosisHistory),
      insuranceDetails: {
        provider: patient.insuranceProvider || patient.insuranceDetails?.provider || 'Self Pay',
        policyNumber: patient.insurancePolicy || patient.insuranceDetails?.policyNumber || 'SELF-PAY',
        coverage: patient.insuranceDetails?.coverage || (patient.insuranceProvider === 'Self Pay' ? 'Not covered' : '80% inpatient coverage'),
      },
      assignedDoctor: doctor
        ? {
            id: doctor.doctorId || doctor.id,
            name: doctor.name,
            department: doctor.department,
            specialization: doctor.specialization,
            phone: doctor.phone,
            email: doctor.email,
            consultationFee: doctor.consultationFee,
            experience: doctor.experience,
            rating: doctor.rating,
            avatar: doctor.avatar,
          }
        : null,
      billingHistory: patientBilling,
      upcomingAppointments: patientAppointments.filter((appointment) => ['Pending', 'Confirmed', 'Checked In', 'In Progress'].includes(appointment.status)),
      previousAppointments: patientAppointments.filter((appointment) => ['Completed', 'Rejected', 'Cancelled'].includes(appointment.status)),
      surgeryHistory: ensureArray(patient.surgeryHistory),
      vitalsTimeline: ensureArray(patient.vitalsTimeline),
      scanReports: ensureArray(patient.scanReports),
      dischargeSummary: patient.dischargeSummary || 'Discharge summary will be generated after treating physician clearance.',
      doctorInstructionLog: doctorInstructionLog
        .filter((instruction) => instruction?.note)
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
    };
  });

  const doctors = rawDoctors.map((doctor) => {
    const doctorAppointments = appointments.filter(
      (appointment) => appointment.doctorId === doctor.doctorId || appointment.doctor === doctor.name,
    );
    const assignedPatients = patients.filter((patient) => patient.doctorId === doctor.doctorId || patient.doctor === doctor.name);
    const revenueEstimate = doctorAppointments
      .filter((appointment) => ['Confirmed', 'Completed', 'Checked In', 'In Progress'].includes(appointment.status))
      .reduce((total, appointment) => total + Number(appointment.fees || doctor.consultationFee || 0), 0);

    return {
      ...doctor,
      consultationFee: Number(doctor.consultationFee) || 0,
      rating: Number(doctor.rating) || 0,
      availabilitySchedule: ensureArray(doctor.availabilitySchedule),
      assignedPatients: assignedPatients.map((patient) => ({
        id: patient.id,
        name: patient.name,
        status: patient.status,
        ward: patient.ward,
      })),
      appointmentHistory: doctorAppointments.map((appointment) => ({
        id: appointment.appointmentId,
        patient: appointment.patient,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        type: appointment.type,
      })),
      performanceStats: {
        consultations: doctorAppointments.length,
        successRate: doctor.performanceStats?.successRate || '94%',
        averageWait: doctor.performanceStats?.averageWait || '15 mins',
        monthlyRevenue: Number(doctor.performanceStats?.monthlyRevenue || revenueEstimate || 0),
      },
      patients: assignedPatients.length,
    };
  });

  return {
    ...base,
    patients,
    doctors,
    appointments: appointments.sort((first, second) => `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`)),
    billing,
    activityFeed: ensureArray(base.activityFeed),
    inventory: ensureArray(base.inventory),
    revenueData: ensureArray(base.revenueData),
    departmentStats: ensureArray(base.departmentStats),
    bedOccupancy: ensureArray(base.bedOccupancy),
  };
}

function readDb() {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    const normalized = normalizeDb(defaultDb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  try {
    const parsed = JSON.parse(storedValue);
    return normalizeDb(parsed);
  } catch {
    const normalized = normalizeDb(defaultDb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }
}

function writeDb(db) {
  const normalized = normalizeDb(db);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return clone(normalized);
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function simulateRequest(requestKey, handler, { retries = 1 } = {}) {
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const run = (async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await delay(120 + attempt * 120);
        const data = await handler();
        return { status: 200, data };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  })().finally(() => {
    pendingRequests.delete(requestKey);
  });

  pendingRequests.set(requestKey, run);
  return run;
}

function appendAuditLog(db, actor, action) {
  db.settings.auditLogs = [
    {
      id: `AUD-${Date.now()}`,
      actor,
      action,
      timestamp: new Date().toLocaleString('en-IN'),
    },
    ...(db.settings.auditLogs || []),
  ].slice(0, 25);
}

function appendActivity(db, entry) {
  db.activityFeed = [
    {
      id: Date.now(),
      time: 'Just now',
      ...entry,
    },
    ...(db.activityFeed || []),
  ].slice(0, 20);
}

function findPatientIndex(db, patientId) {
  return db.patients.findIndex((patient) => patient.id === patientId || patient.patientId === patientId);
}

function findDoctorRecord(db, value) {
  return db.doctors.find((doctor) => doctor.doctorId === value || doctor.id === value || doctor.name === value);
}

function findAppointmentIndex(db, appointmentId) {
  return db.appointments.findIndex((appointment) => appointment.id === appointmentId || appointment.appointmentId === appointmentId);
}

export const hospitalApi = {
  getSnapshot() {
    return readDb();
  },

  async bootstrap() {
    return simulateRequest('bootstrap', async () => readDb());
  },

  async getPatients(params = {}) {
    const {
      query = '',
      department = 'All Departments',
      status = 'All Status',
      page = 1,
      limit = 5,
    } = params;
    return simulateRequest(`patients:${JSON.stringify(params)}`, async () => {
      const db = readDb();
      const filtered = db.patients.filter((patient) => {
        const matchesSearchQuery = matchesQuery(patient, query, [
          'name',
          'id',
          'mobile',
          'email',
          'doctor',
        ]);
        const matchesDepartment = department === 'All Departments' || patient.department === department;
        const matchesStatus = status === 'All Status' || patient.status === status;
        return matchesSearchQuery && matchesDepartment && matchesStatus;
      });
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        records: filtered.slice(start, end),
        total: filtered.length,
        page,
        hasMore: end < filtered.length,
      };
    });
  },

  async getAppointments(params = {}) {
    const {
      query = '',
      status = 'All Status',
      bookingMode = 'All Modes',
      page = 1,
      limit = 5,
    } = params;
    return simulateRequest(`appointments:${JSON.stringify(params)}`, async () => {
      const db = readDb();
      const filtered = db.appointments.filter((appointment) => {
        const matchesSearchQuery = matchesQuery(appointment, query, [
          'appointmentId',
          'patient',
          'doctor',
          'department',
          'type',
          'bookingMode',
        ]);
        const matchesStatus = status === 'All Status' || appointment.status === status;
        const matchesMode = bookingMode === 'All Modes' || appointment.bookingMode === bookingMode;
        return matchesSearchQuery && matchesStatus && matchesMode;
      });
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        records: filtered.slice(start, end),
        total: filtered.length,
        page,
        hasMore: end < filtered.length,
      };
    });
  },

  async globalSearch(query) {
    return simulateRequest(`search:${query}`, async () => {
      const db = readDb();
      return {
        patients: db.patients
          .filter((patient) => matchesQuery(patient, query, ['name', 'id', 'doctor', 'email']))
          .slice(0, 5),
        doctors: db.doctors
          .filter((doctor) => matchesQuery(doctor, query, ['name', 'specialization', 'department']))
          .slice(0, 5),
        appointments: db.appointments
          .filter((appointment) => matchesQuery(appointment, query, ['patient', 'doctor', 'appointmentId']))
          .slice(0, 5),
        billing: db.billing
          .filter((invoice) => matchesQuery(invoice, query, ['id', 'patient', 'department']))
          .slice(0, 5),
      };
    });
  },

  async updateAppointmentStatus(appointmentId, status, payload = {}) {
    return simulateRequest(`appointment-update:${appointmentId}:${status}`, async () => {
      const db = readDb();
      const appointmentIndex = findAppointmentIndex(db, appointmentId);
      if (appointmentIndex === -1) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      const currentAppointment = db.appointments[appointmentIndex];
      const nextHistory = [
        ...normalizeStatusHistory(currentAppointment.statusHistory, currentAppointment.status, payload.actor || 'System'),
        {
          id: `HIS-${Date.now()}`,
          status,
          actor: payload.actor || 'System',
          timestamp: new Date().toISOString(),
          note: payload.rejectionReason || payload.note || '',
        },
      ];

      db.appointments[appointmentIndex] = {
        ...currentAppointment,
        status,
        rejectionReason: payload.rejectionReason || '',
        statusHistory: nextHistory,
      };

      appendActivity(db, {
        type: 'appointment',
        icon: 'event',
        message:
          status === 'Rejected'
            ? `Appointment ${currentAppointment.appointmentId} was rejected with reason recorded.`
            : status === 'Cancelled'
            ? `Appointment ${currentAppointment.appointmentId} was cancelled by patient.`
            : `Appointment ${currentAppointment.appointmentId} moved to ${status}.`,
      });
      appendAuditLog(db, payload.actor || 'Admin', `Updated appointment ${currentAppointment.appointmentId} to ${status}`);
      writeDb(db);
      return db.appointments[appointmentIndex];
    });
  },

  async updateAppointment(appointmentId, updates, actor = 'System') {
    return simulateRequest(`appointment-edit:${appointmentId}`, async () => {
      const db = readDb();
      const appointmentIndex = findAppointmentIndex(db, appointmentId);
      if (appointmentIndex === -1) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      const currentAppointment = db.appointments[appointmentIndex];
      const mergedDocuments = updates.documents
        ? [...ensureArray(currentAppointment.documents), ...ensureArray(updates.documents)]
        : currentAppointment.documents;

      db.appointments[appointmentIndex] = {
        ...currentAppointment,
        ...updates,
        documents: mergedDocuments,
      };

      if (updates.patientStatus && currentAppointment.patientId) {
        const patientIndex = findPatientIndex(db, currentAppointment.patientId);
        if (patientIndex !== -1) {
          db.patients[patientIndex] = {
            ...db.patients[patientIndex],
            status: updates.patientStatus,
          };
        }
      }

      appendAuditLog(db, actor, `Updated appointment ${currentAppointment.appointmentId}`);
      writeDb(db);
      return db.appointments[appointmentIndex];
    });
  },

  async addDoctorInstruction(appointmentId, note, actor = 'Doctor') {
    return simulateRequest(`appointment-instruction:${appointmentId}`, async () => {
      if (!note?.trim()) {
        const error = new Error('Instruction note is required');
        error.status = 400;
        throw error;
      }

      const db = readDb();
      const appointmentIndex = findAppointmentIndex(db, appointmentId);
      if (appointmentIndex === -1) {
        const error = new Error('Appointment not found');
        error.status = 404;
        throw error;
      }

      const appointment = db.appointments[appointmentIndex];
      const instruction = {
        id: `INS-${Date.now()}`,
        note: note.trim(),
        createdAt: new Date().toISOString(),
        doctorName: actor,
      };

      db.appointments[appointmentIndex] = {
        ...appointment,
        doctorInstructions: [...ensureArray(appointment.doctorInstructions), instruction],
      };

      const patientIndex = findPatientIndex(db, appointment.patientId);
      if (patientIndex !== -1) {
        db.patients[patientIndex] = {
          ...db.patients[patientIndex],
          doctorInstructionLog: [
            instruction,
            ...ensureArray(db.patients[patientIndex].doctorInstructionLog),
          ],
        };
      }

      appendAuditLog(db, actor, `Added doctor instruction for appointment ${appointment.appointmentId}`);
      appendActivity(db, {
        type: 'medication',
        icon: 'clinical_notes',
        message: `${actor} added patient instructions for ${appointment.patient}.`,
      });
      writeDb(db);
      return db.appointments[appointmentIndex];
    });
  },

  async addPatientDocument(patientId, documents, actor = 'Portal User') {
    return simulateRequest(`patient-documents:${patientId}`, async () => {
      const db = readDb();
      const patientIndex = findPatientIndex(db, patientId);
      if (patientIndex === -1) {
        const error = new Error('Patient not found');
        error.status = 404;
        throw error;
      }

      db.patients[patientIndex] = {
        ...db.patients[patientIndex],
        documents: [...ensureArray(db.patients[patientIndex].documents), ...ensureArray(documents)],
      };

      appendAuditLog(db, actor, `Uploaded documents for patient ${patientId}`);
      writeDb(db);
      return db.patients[patientIndex];
    });
  },

  async updatePatient(patientId, updates, actor = 'Admin') {
    return simulateRequest(`patient-update:${patientId}`, async () => {
      const db = readDb();
      const patientIndex = findPatientIndex(db, patientId);
      if (patientIndex === -1) {
        const error = new Error('Patient not found');
        error.status = 404;
        throw error;
      }

      const doctor = updates.doctorId || updates.doctor
        ? findDoctorRecord(db, updates.doctorId || updates.doctor)
        : findDoctorRecord(db, db.patients[patientIndex].doctorId || db.patients[patientIndex].doctor);

      db.patients[patientIndex] = {
        ...db.patients[patientIndex],
        ...updates,
        doctor: doctor?.name || updates.doctor || db.patients[patientIndex].doctor,
        doctorId: doctor?.doctorId || doctor?.id || updates.doctorId || db.patients[patientIndex].doctorId,
        personalDetails: {
          ...(db.patients[patientIndex].personalDetails || {}),
          fullName: updates.name || db.patients[patientIndex].name,
          age: updates.age || db.patients[patientIndex].age,
          gender: updates.gender || db.patients[patientIndex].gender,
          bloodType: updates.bloodType || db.patients[patientIndex].bloodType,
          email: updates.email || db.patients[patientIndex].email,
          mobile: updates.mobile || updates.phone || db.patients[patientIndex].mobile,
          address: updates.address || db.patients[patientIndex].personalDetails?.address,
        },
      };
      appendAuditLog(db, actor, `Updated patient ${patientId}`);
      writeDb(db);
      return db.patients[patientIndex];
    });
  },

  async createPatient(payload, actor = 'Admin') {
    return simulateRequest(`patient-create:${payload.name}`, async () => {
      const db = readDb();
      const doctor = findDoctorRecord(db, payload.doctorId || payload.doctor);
      const patientId = payload.id || `PT-${Date.now().toString().slice(-4)}`;
      const nextPatient = {
        id: patientId,
        name: payload.name,
        age: Number(payload.age) || 0,
        gender: payload.gender || 'Unknown',
        phone: payload.phone || payload.mobile || '',
        mobile: payload.phone || payload.mobile || '',
        email: payload.email || '',
        bloodType: payload.bloodType || 'Unknown',
        ward: payload.ward || 'Pending Triage',
        admittedDate: payload.admittedDate || new Date().toISOString().slice(0, 10),
        department: payload.department || doctor?.department || 'General',
        doctor: doctor?.name || payload.doctor || 'Unassigned',
        doctorId: doctor?.doctorId || doctor?.id || payload.doctorId || '',
        status: payload.status || 'Pending',
        condition: payload.condition || 'Stable',
        notes: payload.notes || '',
        allergies: ensureArray(payload.allergies),
        emergencyContact: normalizeContact(payload.emergencyContact),
        insuranceProvider: payload.insuranceProvider || 'Self Pay',
        insurancePolicy: payload.insurancePolicy || 'SELF-PAY',
        bookingMode: payload.bookingMode || 'Walk-in',
        documents: ensureArray(payload.documents),
        personalDetails: {
          fullName: payload.name,
          age: Number(payload.age) || 0,
          gender: payload.gender || 'Unknown',
          bloodType: payload.bloodType || 'Unknown',
          address: payload.address || 'Address not provided',
          email: payload.email || '',
          mobile: payload.phone || payload.mobile || '',
        },
        admissionHistory: [
          {
            date: payload.admittedDate || new Date().toISOString().slice(0, 10),
            summary: `Registered via ${payload.bookingMode || 'front desk'} intake.`,
            status: payload.status || 'Pending',
          },
        ],
        previousTreatments: [],
        labReports: [],
        prescriptions: [],
        diagnosisHistory: [],
        insuranceDetails: {
          provider: payload.insuranceProvider || 'Self Pay',
          policyNumber: payload.insurancePolicy || 'SELF-PAY',
          coverage: payload.insuranceProvider ? '80% inpatient coverage' : 'Not covered',
        },
        assignedDoctor: null,
        billingHistory: [],
        upcomingAppointments: [],
        previousAppointments: [],
        surgeryHistory: [],
        vitalsTimeline: [],
        scanReports: [],
        dischargeSummary: 'Discharge summary will be generated after clearance.',
        doctorInstructionLog: [],
      };
      db.patients = [nextPatient, ...db.patients];
      appendAuditLog(db, actor, `Created patient ${nextPatient.id}`);
      appendActivity(db, {
        type: 'admission',
        icon: 'person_add',
        message: `New patient ${nextPatient.name} was registered in the system.`,
      });
      writeDb(db);
      return nextPatient;
    });
  },

  async deletePatient(patientId, actor = 'Admin') {
    return simulateRequest(`patient-delete:${patientId}`, async () => {
      const db = readDb();
      db.patients = db.patients.filter((patient) => patient.id !== patientId);
      db.appointments = db.appointments.filter((appointment) => appointment.patientId !== patientId);
      db.billing = db.billing.filter((invoice) => invoice.patientId !== patientId);
      appendAuditLog(db, actor, `Deleted patient record ${patientId}`);
      appendActivity(db, {
        type: 'discharge',
        icon: 'delete',
        message: `Patient record ${patientId} was removed from the system archive.`,
      });
      writeDb(db);
      return { success: true };
    });
  },

  async createAppointment(payload, actor = 'Admin') {
    return simulateRequest(`appointment-create:${payload.patient}:${payload.date}:${payload.time}`, async () => {
      const db = readDb();
      const patient = db.patients.find((entry) => entry.name === payload.patient || entry.id === payload.patientId);
      const doctor = findDoctorRecord(db, payload.doctorId || payload.doctor);
      const nextAppointment = {
        id: Date.now(),
        appointmentId: `APT-${Date.now().toString().slice(-4)}`,
        patientId: patient?.id || payload.patientId || '',
        patient: patient?.name || payload.patient,
        doctorId: doctor?.doctorId || doctor?.id || payload.doctorId || '',
        doctor: doctor?.name || payload.doctor,
        department: payload.department || doctor?.department || patient?.department || 'General',
        doctorSpecialization: doctor?.specialization || 'General',
        patientFullName: patient?.name || payload.patient,
        doctorFullName: doctor?.name || payload.doctor,
        patientStatus: payload.patientStatus || patient?.status || 'Active',
        contactPhone: payload.contactPhone || patient?.phone || patient?.mobile || '',
        contactEmail: payload.contactEmail || patient?.email || '',
        contactDetails: {
          phone: payload.contactPhone || patient?.phone || patient?.mobile || 'N/A',
          email: payload.contactEmail || patient?.email || 'N/A',
        },
        bookingMode: payload.bookingMode || 'Walk-in',
        bookingSource: payload.bookingSource || actor,
        fees: Number(payload.fees ?? doctor?.consultationFee ?? 0),
        location: payload.location || `${payload.department || doctor?.department || 'General'} OPD`,
        notes: payload.notes || '',
        type: payload.type || 'Consultation',
        status: payload.status || 'Pending',
        documents: ensureArray(payload.documents),
        doctorInstructions: [],
        statusHistory: [
          {
            id: `HIS-${Date.now()}`,
            status: payload.status || 'Pending',
            actor,
            timestamp: new Date().toISOString(),
            note: 'Appointment created',
          },
        ],
        ...payload,
      };
      db.appointments = [nextAppointment, ...db.appointments];

      if (patient && ensureArray(payload.documents).length) {
        const patientIndex = findPatientIndex(db, patient.id);
        if (patientIndex !== -1) {
          db.patients[patientIndex] = {
            ...db.patients[patientIndex],
            documents: [...ensureArray(db.patients[patientIndex].documents), ...ensureArray(payload.documents)],
          };
        }
      }

      appendAuditLog(db, actor, `Created appointment ${nextAppointment.appointmentId}`);
      appendActivity(db, {
        type: 'appointment',
        icon: 'event',
        message: `New appointment ${nextAppointment.appointmentId} was booked for ${nextAppointment.patient}.`,
      });
      writeDb(db);
      return nextAppointment;
    });
  },

  async createInvoice(patient, actor = 'Admin') {
    return simulateRequest(`invoice-create:${patient.id}`, async () => {
      const db = readDb();
      const amount = Number(patient.assignedDoctor?.consultationFee || patient.consultationFee || 18500);
      const newInvoice = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        patient: patient.name,
        amount,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending',
        method: 'Insurance',
        department: patient.department,
      };
      db.billing = [newInvoice, ...db.billing];
      appendAuditLog(db, actor, `Generated invoice ${newInvoice.id} for ${patient.name}`);
      appendActivity(db, {
        type: 'billing',
        icon: 'payments',
        message: `New billing invoice ${newInvoice.id} generated for ${patient.name}.`,
      });
      writeDb(db);
      return newInvoice;
    });
  },

  async markInvoicePaid(invoiceId, actor = 'Admin') {
    return simulateRequest(`invoice-paid:${invoiceId}`, async () => {
      const db = readDb();
      const invoiceIndex = db.billing.findIndex((invoice) => invoice.id === invoiceId);
      if (invoiceIndex === -1) {
        const error = new Error('Invoice not found');
        error.status = 404;
        throw error;
      }
      db.billing[invoiceIndex] = {
        ...db.billing[invoiceIndex],
        status: 'Paid',
        method: db.billing[invoiceIndex].method || 'Cash',
      };
      appendAuditLog(db, actor, `Marked invoice ${invoiceId} as paid`);
      writeDb(db);
      return db.billing[invoiceIndex];
    });
  },

  async updateDoctor(doctorId, updates, actor = 'Admin') {
    return simulateRequest(`doctor-update:${doctorId}`, async () => {
      const db = readDb();
      const doctorIndex = db.doctors.findIndex((doctor) => doctor.id === doctorId || doctor.doctorId === doctorId);
      if (doctorIndex === -1) {
        const error = new Error('Doctor not found');
        error.status = 404;
        throw error;
      }
      db.doctors[doctorIndex] = { ...db.doctors[doctorIndex], ...updates };
      appendAuditLog(db, actor, `Updated doctor ${db.doctors[doctorIndex].name}`);
      writeDb(db);
      return db.doctors[doctorIndex];
    });
  },

  async createDoctor(payload, actor = 'Admin') {
    return simulateRequest(`doctor-create:${payload.name}`, async () => {
      const db = readDb();
      const nextDoctor = {
        id: Date.now(),
        doctorId: payload.doctorId || `DOC-${Date.now().toString().slice(-4)}`,
        availabilitySchedule: payload.availabilitySchedule || [],
        performanceStats: payload.performanceStats || {
          consultations: 0,
          successRate: '0%',
          averageWait: '0 mins',
          monthlyRevenue: 0,
        },
        assignedPatients: [],
        appointmentHistory: [],
        consultationFee: payload.consultationFee || 1500,
        rating: payload.rating || 4.5,
        leaveStatus: payload.leaveStatus || payload.status || 'Active Duty',
        ...payload,
      };
      db.doctors = [nextDoctor, ...db.doctors];
      appendAuditLog(db, actor, `Created doctor profile ${nextDoctor.name}`);
      writeDb(db);
      return nextDoctor;
    });
  },

  async deleteDoctor(doctorId, actor = 'Admin') {
    return simulateRequest(`doctor-delete:${doctorId}`, async () => {
      const db = readDb();
      db.doctors = db.doctors.filter((doctor) => doctor.id !== doctorId && doctor.doctorId !== doctorId);
      appendAuditLog(db, actor, `Deleted doctor ${doctorId}`);
      writeDb(db);
      return { success: true };
    });
  },

  async replaceBilling(nextBilling, actor = 'Admin') {
    return simulateRequest('billing-replace', async () => {
      const db = readDb();
      db.billing = typeof nextBilling === 'function' ? nextBilling(db.billing) : nextBilling;
      appendAuditLog(db, actor, 'Updated billing records');
      writeDb(db);
      return db.billing;
    });
  },

  async saveSettings(nextSettings, actor = 'Admin') {
    return simulateRequest('settings-save', async () => {
      const db = readDb();
      db.settings = {
        ...db.settings,
        ...nextSettings,
      };
      appendAuditLog(db, actor, 'Saved settings changes');
      writeDb(db);
      return db.settings;
    });
  },

  async updatePassword(payload, actor = 'Admin') {
    return simulateRequest('password-update', async () => {
      if (!payload.currentPassword || !payload.newPassword) {
        const error = new Error('Current and new password are required');
        error.status = 400;
        throw error;
      }

      const db = readDb();
      db.meta.passwordUpdatedAt = new Date().toISOString();
      appendAuditLog(db, actor, 'Updated admin password');
      writeDb(db);
      return { updatedAt: db.meta.passwordUpdatedAt };
    });
  },
};
