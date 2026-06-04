import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '@/services/patientService';
import type { PatientRequest } from '@/types/patient.types';

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ['patients', search],
    queryFn: () => getPatients(search),
    placeholderData: (previousData) => previousData,
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientRequest) => createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatientRequest }) => updatePatient(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
