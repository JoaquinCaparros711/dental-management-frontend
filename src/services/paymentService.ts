import apiClient from '@/api/apiClient';
import type { Appointment } from '@/types/appointment.types';
import type { FinancialSummary, UpdatePaymentRequest } from '@/types/payment.types';

export const updateAppointmentPayment = async (
  appointmentId: number,
  payload: UpdatePaymentRequest
): Promise<Appointment> => {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${appointmentId}/payment`,
    payload
  );
  return data;
};

export const getFinancialSummary = async (
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await apiClient.get<FinancialSummary>('/finance/summary', { params });
  return data;
};
