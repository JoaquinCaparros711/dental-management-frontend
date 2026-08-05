import apiClient from '@/api/apiClient';
import type { ClinicalHistoryEntry, CreateClinicalRecordRequest } from '@/types/clinicalHistory.types';

export async function getPatientClinicalHistory(patientId: number): Promise<ClinicalHistoryEntry[]> {
  const response = await apiClient.get<ClinicalHistoryEntry[]>(`/patients/${patientId}/clinical-history`);
  return response.data;
}

export async function createClinicalRecord(
  patientId: number,
  data: CreateClinicalRecordRequest
): Promise<ClinicalHistoryEntry> {
  const response = await apiClient.post<ClinicalHistoryEntry>(`/patients/${patientId}/clinical-records`, data);
  return response.data;
}
