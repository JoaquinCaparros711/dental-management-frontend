import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { TextField } from '@/components/TextField';
import { Toast } from '@/components/Toast';
import { usePatients } from '@/hooks/usePatients';
import { useAppointment, useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import { savePendingToast } from '@/storage/authStorage';
import type { AppointmentStatus } from '@/types/appointment.types';

type FormStatus = AppointmentStatus;

const STATUS_OPTIONS: { value: FormStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Programada' },
  { value: 'COMPLETED', label: 'Finalizada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const todayIsoDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isoToDisplayDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const displayDateToIso = (displayDate: string) => {
  const [day, month, year] = displayDate.split('/');
  return `${year}-${month}-${day}`;
};

const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const isValidDateFormat = (value: string) =>
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value);

const isValidTimeFormat = (value: string) =>
  /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value);

const buildDate = (date: string, time: string) => new Date(`${displayDateToIso(date)}T${time}:00`);

interface ServerErrorPayload {
  error?: string;
}

interface RequestError {
  response?: {
    data?: ServerErrorPayload;
  };
}

export default function AppointmentFormScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const parsedId = id ? Number(id) : NaN;
  const appointmentId = Number.isFinite(parsedId) ? parsedId : 0;
  const isEditing = appointmentId > 0;

  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIsoDate();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [showPatientOptions, setShowPatientOptions] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(isoToDisplayDate(defaultDate));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [status, setStatus] = useState<FormStatus>('SCHEDULED');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const { data: patients, isLoading: isLoadingPatients } = usePatients();
  const { data: appointment, isLoading: isLoadingAppointment } = useAppointment(appointmentId);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const isMutating = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!appointment) return;
    setPatientId(appointment.patientId);
    setAppointmentDate(isoToDisplayDate(appointment.startTime.slice(0, 10)));
    setStartTime(appointment.startTime.slice(11, 16));
    setEndTime(appointment.endTime.slice(11, 16));
    const appointmentReason = appointment.reason ?? '';
    setReason(appointmentReason);
    setClinicalNotes(appointment.status === 'COMPLETED' ? appointmentReason : '');
    setStatus(appointment.status);
  }, [appointment]);

  useEffect(() => {
    if (status !== 'COMPLETED') return;
    if (clinicalNotes.trim().length > 0) return;
    if (reason.trim().length === 0) return;
    setClinicalNotes(reason);
  }, [status, clinicalNotes, reason]);

  const selectedPatient = useMemo(
    () => (patients ?? []).find((patient) => patient.id === patientId),
    [patientId, patients]
  );

  const isPatientValid = patientId !== null;
  const isDateValid = isValidDateFormat(appointmentDate);
  const isStartTimeValid = isValidTimeFormat(startTime);
  const isEndTimeValid = isValidTimeFormat(endTime);
  const isRangeValid =
    isDateValid &&
    isStartTimeValid &&
    isEndTimeValid &&
    buildDate(appointmentDate, startTime).getTime() < buildDate(appointmentDate, endTime).getTime();

  const isFormValid = isPatientValid && isDateValid && isStartTimeValid && isEndTimeValid && isRangeValid;
  const isCompleted = status === 'COMPLETED';

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(protected)/appointments');
  };

  const parseServerError = (error: unknown, fallback: string) => {
    const requestError = error as RequestError;
    return requestError.response?.data?.error || fallback;
  };

  const handleSubmit = async () => {
    if (!isFormValid || patientId === null) {
      setToast({ visible: true, message: 'Completa todos los campos con valores válidos.', type: 'error' });
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const payload = {
      patientId,
      startTime: `${displayDateToIso(appointmentDate)}T${startTime}:00`,
      endTime: `${displayDateToIso(appointmentDate)}T${endTime}:00`,
      reason: (status === 'COMPLETED' ? clinicalNotes : reason).trim() || undefined,
      status,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: appointmentId, data: payload },
        {
          onSuccess: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await savePendingToast('¡Cita actualizada con éxito!');
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/(protected)/appointments');
          },
          onError: async (error: unknown) => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setToast({
              visible: true,
              message: parseServerError(error, 'Error al actualizar la cita'),
              type: 'error',
            });
          },
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await savePendingToast('¡Cita creada con éxito!');
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/(protected)/appointments');
      },
      onError: async (error: unknown) => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToast({
          visible: true,
          message: parseServerError(error, 'Error al crear la cita'),
          type: 'error',
        });
      },
    });
  };

  const showLoading = isLoadingAppointment || isLoadingPatients;

  return (
    <ClinicalBackground>
      <SafeAreaView className="flex-1">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />

        <View className="flex-row items-center px-6 py-4 border-b border-white/5">
          <TouchableOpacity
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
            onPress={handleBack}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-sans-bold text-white pr-10">
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
          </Text>
        </View>

        {showLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 36 }}>
            <View className="mb-5">
              <Text className="text-white/50 text-[13px] font-sans-semibold mb-2 tracking-[0.4px] uppercase">
                Paciente
              </Text>
              <TouchableOpacity
                className="border border-white/8 rounded-[14px] px-4 py-[15px] bg-white/2 flex-row items-center justify-between"
                onPress={() => setShowPatientOptions((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text className={`${selectedPatient ? 'text-white' : 'text-white/35'} text-base font-sans`}>
                  {selectedPatient
                    ? `${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.dni})`
                    : 'Seleccionar paciente'}
                </Text>
                <Ionicons
                  name={showPatientOptions ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
              {!isPatientValid ? (
                <Text className="text-[#F87171] text-xs font-sans-medium mt-1.5 pl-1 tracking-[0.2px]">
                  Debes seleccionar un paciente
                </Text>
              ) : null}

              {showPatientOptions ? (
                <View className="mt-2 border border-white/10 rounded-[14px] bg-white/[0.03] max-h-[210px]">
                  <ScrollView>
                    {(patients ?? []).map((patient) => (
                      <TouchableOpacity
                        key={patient.id}
                        className={`px-4 py-3 border-b border-white/5 ${patient.id === patientId ? 'bg-blue-500/20' : ''}`}
                        onPress={() => {
                          setPatientId(patient.id);
                          setShowPatientOptions(false);
                        }}
                      >
                        <Text className="text-white text-sm font-sans-semibold">
                          {patient.firstName} {patient.lastName}
                        </Text>
                        <Text className="text-white/45 text-xs mt-0.5">DNI: {patient.dni}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            <TextField
              label="Fecha"
              placeholder="DD/MM/AAAA"
              value={appointmentDate}
              onChangeText={(value) => setAppointmentDate(formatDateInput(value))}
              keyboardType="numeric"
              maxLength={10}
              validationState={appointmentDate.length === 0 ? 'idle' : isDateValid ? 'valid' : 'invalid'}
              errorText="Formato inválido (DD/MM/AAAA)"
              editable={!isMutating}
            />

            <TextField
              label="Hora de Inicio"
              placeholder="HH:MM"
              value={startTime}
              onChangeText={(value) => setStartTime(formatTimeInput(value))}
              keyboardType="numeric"
              maxLength={5}
              validationState={startTime.length === 0 ? 'idle' : isStartTimeValid ? 'valid' : 'invalid'}
              errorText="Formato inválido (HH:MM)"
              editable={!isMutating}
            />

            <TextField
              label="Hora de Fin"
              placeholder="HH:MM"
              value={endTime}
              onChangeText={(value) => setEndTime(formatTimeInput(value))}
              keyboardType="numeric"
              maxLength={5}
              validationState={
                endTime.length === 0
                  ? 'idle'
                  : isEndTimeValid && isRangeValid
                    ? 'valid'
                    : 'invalid'
              }
              errorText={
                isEndTimeValid
                  ? 'La hora de fin debe ser posterior a la hora de inicio'
                  : 'Formato inválido (HH:MM)'
              }
              editable={!isMutating}
            />

            <TextField
              label="Motivo"
              placeholder="Ej. Consulta de control"
              value={reason}
              onChangeText={setReason}
              editable={!isMutating}
            />

            {isCompleted ? (
              <TextField
                label="Notas clínicas / tratamiento realizado"
                placeholder="Opcional"
                value={clinicalNotes}
                onChangeText={setClinicalNotes}
                editable={!isMutating}
              />
            ) : null}

            <View className="mb-5">
              <Text className="text-white/50 text-[13px] font-sans-semibold mb-2 tracking-[0.4px] uppercase">
                Estado
              </Text>
              <View className="bg-white/[0.03] border border-white/8 rounded-2xl p-1.5 flex-row">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = status === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      className={`flex-1 py-2.5 rounded-xl items-center ${
                        isSelected ? 'bg-blue-500/25 border border-blue-400/30' : ''
                      }`}
                      onPress={() => setStatus(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs font-sans-semibold ${isSelected ? 'text-blue-200' : 'text-white/55'}`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              className={`bg-[#0A84FF] rounded-2xl py-4.5 items-center mt-2 border border-white/15 ${
                !isFormValid || isMutating
                  ? 'bg-[#0A84FF]/25 border-white/3 shadow-none elevation-0'
                  : 'elevation-5'
              }`}
              style={
                !isFormValid || isMutating
                  ? undefined
                  : {
                      shadowColor: '#0A84FF',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                    }
              }
              onPress={handleSubmit}
              disabled={!isFormValid || isMutating}
              activeOpacity={0.85}
            >
              {isMutating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center gap-2 p-4">
                  <Ionicons
                    name={isEditing ? 'save-outline' : 'add-circle-outline'}
                    size={19}
                    color={isFormValid ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                  />
                  <Text className={`text-base font-sans-bold ${isFormValid ? 'text-white' : 'text-white/30'}`}>
                    {isEditing ? 'Guardar Cambios' : 'Crear Cita'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </ClinicalBackground>
  );
}
