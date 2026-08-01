import type { AppointmentStatus } from '@/types/appointment.types';

export interface ClinicalHistoryEntry {
  id: number;
  patientId: number;
  appointmentId: number;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  clinicalNotes?: string;
}

