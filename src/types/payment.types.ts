export type PaymentStatus = 'PENDING' | 'PAID';

export type PaymentMethod = 'CASH' | 'TRANSFER';

export interface UpdatePaymentRequest {
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paymentDate?: string | null;
  amount?: number;
  paymentNotes?: string | null;
}

export interface FinancialSummary {
  totalIncome: number;
  totalPending: number;
  paidCount: number;
  pendingCount: number;
  incomeByMethod: Record<PaymentMethod, number>;
}
