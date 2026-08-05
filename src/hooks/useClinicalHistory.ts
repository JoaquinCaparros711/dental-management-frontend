import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClinicalRecord, getPatientClinicalHistory } from '@/services/clinicalHistoryService';
import type { CreateClinicalRecordRequest } from '@/types/clinicalHistory.types';

export function usePatientClinicalHistory(patientId: number) {
  return useQuery({
    queryKey: ['clinical-history', patientId],
    queryFn: () => getPatientClinicalHistory(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });
}

export function useCreateClinicalRecord(patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClinicalRecordRequest) => createClinicalRecord(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical-history', patientId] });
    },
  });
}
