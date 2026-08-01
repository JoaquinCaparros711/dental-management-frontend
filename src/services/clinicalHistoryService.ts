import { getAppointments } from '@/services/appointmentService';
import type { ClinicalHistoryEntry } from '@/types/clinicalHistory.types';

export async function getPatientClinicalHistory(patientId: number): Promise<ClinicalHistoryEntry[]> {
  const appointments = await getAppointments({ patientId });

  return appointments
    .filter((appointment) => appointment.status === 'COMPLETED')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .map((appointment) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      clinicalNotes: appointment.reason,
    }));
}

