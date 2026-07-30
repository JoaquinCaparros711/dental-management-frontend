import apiClient from '@/api/apiClient';
import type { Appointment, AppointmentRequest } from '@/types/appointment.types';

interface GetAppointmentsParams {
  date?: string;
  patientId?: number;
}

export async function getAppointments(params?: GetAppointmentsParams): Promise<Appointment[]> {
  const response = await apiClient.get<Appointment[]>('/appointments', {
    params: {
      ...(params?.date ? { date: params.date } : {}),
      ...(typeof params?.patientId === 'number' ? { patientId: params.patientId } : {}),
    },
  });
  return response.data;
}

export async function getAppointmentById(id: number): Promise<Appointment> {
  const response = await apiClient.get<Appointment>(`/appointments/${id}`);
  return response.data;
}

export async function createAppointment(data: AppointmentRequest): Promise<Appointment> {
  const response = await apiClient.post<Appointment>('/appointments', data);
  return response.data;
}

export async function updateAppointment(id: number, data: AppointmentRequest): Promise<Appointment> {
  const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
  return response.data;
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}/cancel`);
  return response.data;
}
