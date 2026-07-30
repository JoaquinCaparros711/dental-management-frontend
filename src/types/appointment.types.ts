export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientDni: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  patientId: number;
  startTime: string;
  endTime: string;
  reason?: string;
  status?: AppointmentStatus;
}
