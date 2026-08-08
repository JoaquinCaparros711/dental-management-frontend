import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Appointment } from '@/types/appointment.types';
import type { PaymentMethod, PaymentStatus } from '@/types/payment.types';

interface PaymentModalProps {
  visible: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (payload: {
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod | null;
    amount?: number;
    paymentNotes?: string | null;
  }) => Promise<void>;
  isLoading?: boolean;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'CASH', label: 'Efectivo', icon: 'cash-outline' },
  { id: 'TRANSFER', label: 'Transferencia', icon: 'card-outline' },
];

export function PaymentModal({ visible, appointment, onClose, onConfirm, isLoading = false }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('PAID');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>('CASH');
  const [amountText, setAmountText] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.paymentStatus || 'PAID');
      setSelectedMethod(appointment.paymentMethod || 'CASH');
      setAmountText(appointment.amount ? appointment.amount.toString() : '');
      setNotes(appointment.paymentNotes || '');
      setErrorMsg('');
    }
  }, [appointment, visible]);

  const handleSubmit = async () => {
    if (status === 'PAID' && !selectedMethod) {
      setErrorMsg('Debes seleccionar un medio de pago al marcar como pagado');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const numericAmount = parseFloat(amountText.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount < 0) {
      setErrorMsg('Ingresa un monto válido');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrorMsg('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await onConfirm({
      paymentStatus: status,
      paymentMethod: status === 'PAID' ? selectedMethod : null,
      amount: numericAmount,
      paymentNotes: notes.trim() || null,
    });
  };

  if (!appointment) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/75 justify-center items-center px-5">
        <View className="w-full max-w-md bg-[#0F172A] rounded-3xl p-6 border border-white/10 shadow-2xl">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white text-xl font-sans-bold">Registrar Pago</Text>
              <Text className="text-white/50 text-xs mt-0.5">
                Paciente: {appointment.patientFirstName} {appointment.patientLastName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-white/10 justify-center items-center">
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-xs font-sans-medium text-center">{errorMsg}</Text>
            </View>
          ) : null}

          {/* Payment Status Selector */}
          <Text className="text-white/70 text-xs font-sans-semibold mb-2">Estado del Pago</Text>
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setStatus('PAID')}
              className={`flex-1 py-3 rounded-xl border flex-row justify-center items-center gap-2 ${
                status === 'PAID'
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={status === 'PAID' ? '#34D399' : '#64748B'}
              />
              <Text className={`text-sm font-sans-bold ${status === 'PAID' ? 'text-emerald-400' : 'text-white/50'}`}>
                Pagado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStatus('PENDING')}
              className={`flex-1 py-3 rounded-xl border flex-row justify-center items-center gap-2 ${
                status === 'PENDING'
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={status === 'PENDING' ? '#FBBF24' : '#64748B'}
              />
              <Text className={`text-sm font-sans-bold ${status === 'PENDING' ? 'text-amber-400' : 'text-white/50'}`}>
                Pendiente
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <Text className="text-white/70 text-xs font-sans-semibold mb-1.5">Monto ($)</Text>
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-3 mb-4">
            <Text className="text-emerald-400 font-sans-bold text-base mr-2">$</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="decimal-pad"
              className="flex-1 py-3 text-white text-base font-sans-semibold"
            />
          </View>

          {/* Payment Method Chips (only when PAID) */}
          {status === 'PAID' ? (
            <>
              <Text className="text-white/70 text-xs font-sans-semibold mb-2">Medio de Pago</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedMethod(method.id)}
                      className={`px-3 py-2 rounded-lg border flex-row items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-500/25 border-blue-500/60'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <Ionicons
                        name={method.icon}
                        size={14}
                        color={isSelected ? '#60A5FA' : 'rgba(255,255,255,0.4)'}
                      />
                      <Text
                        className={`text-xs font-sans-semibold ${
                          isSelected ? 'text-blue-400' : 'text-white/60'
                        }`}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* Payment Notes */}
          <Text className="text-white/70 text-xs font-sans-semibold mb-1.5">Notas / Nro. de Comprobante (Opcional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej. Transferencia #98123"
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-sans mb-5"
          />

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 rounded-xl py-3.5 items-center justify-center border border-blue-400/30"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-sans-bold text-sm">Guardar Pago</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
