import { useQuery } from '@tanstack/react-query';
import { getPatientClinicalHistory } from '@/services/clinicalHistoryService';

export function usePatientClinicalHistory(patientId: number) {
  return useQuery({
    queryKey: ['clinical-history', patientId],
    queryFn: () => getPatientClinicalHistory(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });
}

