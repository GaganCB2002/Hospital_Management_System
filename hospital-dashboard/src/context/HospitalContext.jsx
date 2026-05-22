/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  bedOccupancy as seedBedOccupancy,
  departmentStats as seedDepartmentStats,
  revenueData as seedRevenueData,
} from '../mock/data';
import { hospitalApi } from '../services/hospitalApi';

const HospitalContext = createContext(null);

export function HospitalProvider({ children }) {
  const [state, setState] = useState(() => {
    const snapshot = hospitalApi.getSnapshot();
    return {
      ...snapshot,
      revenueData: snapshot.revenueData || seedRevenueData,
      departmentStats: snapshot.departmentStats || seedDepartmentStats,
      bedOccupancy: snapshot.bedOccupancy || seedBedOccupancy,
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const syncState = useCallback(async () => {
    const response = await hospitalApi.bootstrap();
    setState(response.data);
    return response.data;
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await syncState();
    } catch (requestError) {
      setError(requestError.message || 'Failed to load hospital records.');
    } finally {
      setLoading(false);
    }
  }, [syncState]);

  const updatePatient = useCallback(async (patientId, updates, actor) => {
    const response = await hospitalApi.updatePatient(patientId, updates, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const addPatient = useCallback(async (payload, actor) => {
    const response = await hospitalApi.createPatient(payload, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const deletePatient = useCallback(async (patientId, actor) => {
    const response = await hospitalApi.deletePatient(patientId, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const updateAppointmentStatus = useCallback(async (appointmentId, status, payload) => {
    const response = await hospitalApi.updateAppointmentStatus(appointmentId, status, payload);
    await syncState();
    return response.data;
  }, [syncState]);

  const addAppointment = useCallback(async (payload, actor) => {
    const response = await hospitalApi.createAppointment(payload, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const updateAppointment = useCallback(async (appointmentId, updates, actor) => {
    const response = await hospitalApi.updateAppointment(appointmentId, updates, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const addDoctorInstruction = useCallback(async (appointmentId, note, actor) => {
    const response = await hospitalApi.addDoctorInstruction(appointmentId, note, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const addPatientDocument = useCallback(async (patientId, documents, actor) => {
    const response = await hospitalApi.addPatientDocument(patientId, documents, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const saveSettings = useCallback(async (nextSettings, actor) => {
    const response = await hospitalApi.saveSettings(nextSettings, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const updatePassword = useCallback(async (payload, actor) => {
    const response = await hospitalApi.updatePassword(payload, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const createInvoice = useCallback(async (patient, actor) => {
    const response = await hospitalApi.createInvoice(patient, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const setBilling = useCallback(async (nextBilling, actor) => {
    const response = await hospitalApi.replaceBilling(nextBilling, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const markInvoicePaid = useCallback(async (invoiceId, actor) => {
    const response = await hospitalApi.markInvoicePaid(invoiceId, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const updateDoctor = useCallback(async (doctorId, updates, actor) => {
    const response = await hospitalApi.updateDoctor(doctorId, updates, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const addDoctor = useCallback(async (payload, actor) => {
    const response = await hospitalApi.createDoctor(payload, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const deleteDoctor = useCallback(async (doctorId, actor) => {
    const response = await hospitalApi.deleteDoctor(doctorId, actor);
    await syncState();
    return response.data;
  }, [syncState]);

  const queryPatients = useCallback((params) => hospitalApi.getPatients(params), []);
  const queryAppointments = useCallback((params) => hospitalApi.getAppointments(params), []);
  const globalSearch = useCallback((query) => hospitalApi.globalSearch(query), []);

  const value = useMemo(() => ({
    ...state,
    loading,
    error,
    refreshAll,
    queryPatients,
    queryAppointments,
    globalSearch,
    updatePatient,
    addPatient,
    deletePatient,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    addDoctorInstruction,
    addPatientDocument,
    saveSettings,
    updatePassword,
    createInvoice,
    markInvoicePaid,
    setBilling,
    addDoctor,
    updateDoctor,
    deleteDoctor,
  }), [
    error,
    loading,
    queryAppointments,
    queryPatients,
    refreshAll,
    saveSettings,
    state,
    updateAppointmentStatus,
    addAppointment,
    updateAppointment,
    addDoctor,
    addDoctorInstruction,
    addPatient,
    addPatientDocument,
    deleteDoctor,
    updateDoctor,
    updatePassword,
    updatePatient,
    deletePatient,
    createInvoice,
    markInvoicePaid,
    setBilling,
    globalSearch,
  ]);

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
}
