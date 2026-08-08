import type { PaymentMethod, PaymentStatus } from './payment.types';

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
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paymentDate?: string | null;
  amount?: number;
  paymentNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  patientId: number;
  startTime: string;
  endTime: string;
  reason?: string;
  status?: AppointmentStatus;
  amount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
}
