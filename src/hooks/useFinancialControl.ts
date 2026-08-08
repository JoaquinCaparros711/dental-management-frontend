import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinancialSummary, updateAppointmentPayment } from '@/services/paymentService';
import type { UpdatePaymentRequest } from '@/types/payment.types';

export function useFinancialSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['financialSummary', startDate, endDate],
    queryFn: () => getFinancialSummary(startDate, endDate),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePaymentRequest }) =>
      updateAppointmentPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
}
