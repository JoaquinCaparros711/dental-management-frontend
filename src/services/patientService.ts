import apiClient from '@/api/apiClient';
import type { Patient, PatientRequest } from '@/types/patient.types';

export async function getPatients(search?: string): Promise<Patient[]> {
  const response = await apiClient.get<Patient[]>('/patients', {
    params: search ? { search } : {},
  });
  return response.data;
}

export async function getPatientById(id: number): Promise<Patient> {
  const response = await apiClient.get<Patient>(`/patients/${id}`);
  return response.data;
}

export async function createPatient(data: PatientRequest): Promise<Patient> {
  const response = await apiClient.post<Patient>('/patients', data);
  return response.data;
}

export async function updatePatient(id: number, data: PatientRequest): Promise<Patient> {
  const response = await apiClient.put<Patient>(`/patients/${id}`, data);
  return response.data;
}

export async function deletePatient(id: number): Promise<void> {
  await apiClient.delete(`/patients/${id}`);
}
