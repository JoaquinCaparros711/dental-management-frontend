export interface ClinicalHistoryEntry {
  id: number;
  patientId: number;
  patientFirstName?: string;
  patientLastName?: string;
  appointmentId?: number | null;
  dentistId: number;
  notes: string;
  createdAt: string;
}

export interface CreateClinicalRecordRequest {
  notes: string;
  appointmentId?: number;
}
