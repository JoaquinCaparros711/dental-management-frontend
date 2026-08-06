import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { Toast } from '@/components/Toast';
import { PaymentModal } from '@/components/PaymentModal';
import { useAppointments } from '@/hooks/useAppointments';
import { useFinancialSummary, useUpdatePayment } from '@/hooks/useFinancialControl';
import type { Appointment } from '@/types/appointment.types';
import type { PaymentMethod, PaymentStatus } from '@/types/payment.types';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
};

export default function FinancialControlScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useFinancialSummary();
  const { data: appointments, isLoading: isAppointmentsLoading, refetch: refetchAppointments } = useAppointments();
  const updatePaymentMutation = useUpdatePayment();

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchAppointments()]);
  };

  const handleOpenPaymentModal = (app: Appointment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAppointment(app);
    setModalVisible(true);
  };

  const handleConfirmPayment = async (payload: {
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod | null;
    amount?: number;
    paymentNotes?: string | null;
  }) => {
    if (!selectedAppointment) return;

    try {
      await updatePaymentMutation.mutateAsync({
        id: selectedAppointment.id,
        payload,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setSelectedAppointment(null);
      setToast({
        visible: true,
        message: '¡Información de pago actualizada con éxito!',
        type: 'success',
      });
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToast({
        visible: true,
        message: 'No se pudo actualizar el pago. Intenta nuevamente.',
        type: 'error',
      });
    }
  };

  const filteredAppointments = (appointments || []).filter((app) => {
    const status = app.paymentStatus || 'PENDING';
    if (filter === 'PAID') return status === 'PAID';
    if (filter === 'PENDING') return status === 'PENDING';
    return true;
  });

  const isLoading = isSummaryLoading || isAppointmentsLoading;

  return (
    <ClinicalBackground>
      <SafeAreaView className="flex-1">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />

        <PaymentModal
          visible={modalVisible}
          appointment={selectedAppointment}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmPayment}
          isLoading={updatePaymentMutation.isPending}
        />

        {/* Top Navigation Bar */}
        <View className="px-6 pt-4 pb-3 flex-row items-center justify-between border-b border-white/10 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-sans-bold">Control Financiero</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1 px-6 pt-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#60A5FA"
            />
          }
        >
          {/* Summary KPI Cards */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="cash-outline" size={18} color="#34D399" />
                <Text className="text-emerald-400 text-xs font-sans-semibold uppercase">Cobrado</Text>
              </View>
              <Text className="text-white text-xl font-sans-bold">
                ${summary?.totalIncome != null ? summary.totalIncome.toLocaleString('es-AR') : '0'}
              </Text>
              <Text className="text-white/40 text-[10px] mt-1">{summary?.paidCount || 0} cobros realizados</Text>
            </View>

            <View className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="time-outline" size={18} color="#FBBF24" />
                <Text className="text-amber-400 text-xs font-sans-semibold uppercase">Pendiente</Text>
              </View>
              <Text className="text-white text-xl font-sans-bold">
                ${summary?.totalPending != null ? summary.totalPending.toLocaleString('es-AR') : '0'}
              </Text>
              <Text className="text-white/40 text-[10px] mt-1">{summary?.pendingCount || 0} turnos pendientes</Text>
            </View>
          </View>

          {/* Income Breakdown by Payment Method */}
          {summary?.incomeByMethod ? (
            <View className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6">
              <Text className="text-white text-sm font-sans-bold mb-3">Cobros por Medio de Pago</Text>
              <View className="gap-2.5">
                {Object.entries(summary.incomeByMethod)
                  .filter(([methodKey]) => methodKey in PAYMENT_METHOD_LABELS)
                  .map(([methodKey, methodAmount]) => {
                    const label = PAYMENT_METHOD_LABELS[methodKey as PaymentMethod];
                    return (
                      <View key={methodKey} className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                          <View className="w-2 h-2 rounded-full bg-blue-400" />
                          <Text className="text-white/70 text-xs font-sans">{label}</Text>
                        </View>
                        <Text className="text-white text-xs font-sans-bold">
                          ${methodAmount != null ? methodAmount.toLocaleString('es-AR') : '0'}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          ) : null}

          {/* Filter Pills */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base font-sans-bold">Registro de Cobros</Text>
            <View className="flex-row bg-white/5 rounded-xl p-1 border border-white/10">
              {(['ALL', 'PENDING', 'PAID'] as const).map((f) => {
                const isActive = filter === f;
                const label = f === 'ALL' ? 'Todos' : f === 'PENDING' ? 'Pendientes' : 'Pagados';
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-lg ${isActive ? 'bg-blue-600' : ''}`}
                  >
                    <Text className={`text-xs font-sans-semibold ${isActive ? 'text-white' : 'text-white/50'}`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Appointments Payment List */}
          {isLoading && !appointments ? (
            <ActivityIndicator size="large" color="#60A5FA" className="my-10" />
          ) : filteredAppointments.length === 0 ? (
            <View className="bg-white/5 border border-white/10 rounded-2xl p-6 items-center my-4">
              <Ionicons name="wallet-outline" size={36} color="rgba(255,255,255,0.3)" />
              <Text className="text-white/50 text-sm font-sans-medium mt-2 text-center">
                No hay turnos registrados en este filtro.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredAppointments.map((app) => {
                const isPaid = app.paymentStatus === 'PAID';
                const statusColor = isPaid ? '#34D399' : '#FBBF24';
                const statusBg = isPaid ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-amber-500/15 border-amber-500/30';
                const statusLabel = isPaid ? 'PAGADO' : 'PENDIENTE';

                return (
                  <View
                    key={app.id}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex-row justify-between items-center"
                  >
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-white text-base font-sans-bold">
                          {app.patientFirstName} {app.patientLastName}
                        </Text>
                        <View className={`px-2 py-0.5 rounded-full border ${statusBg}`}>
                          <Text className="text-[10px] font-sans-bold" style={{ color: statusColor }}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>

                      {app.reason ? (
                        <Text className="text-white/60 text-xs font-sans mb-1" numberOfLines={1}>
                          {app.reason}
                        </Text>
                      ) : null}

                      <Text className="text-white/40 text-[11px] font-sans">
                        Monto: <Text className="text-white font-sans-bold">${app.amount || 0}</Text>
                        {isPaid && app.paymentMethod ? (
                          <Text> • {PAYMENT_METHOD_LABELS[app.paymentMethod]}</Text>
                        ) : null}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleOpenPaymentModal(app)}
                      className="bg-blue-500/20 border border-blue-500/40 px-3 py-2 rounded-xl"
                    >
                      <Text className="text-blue-400 text-xs font-sans-bold">
                        {isPaid ? 'Editar' : 'Cobrar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ClinicalBackground>
  );
}
