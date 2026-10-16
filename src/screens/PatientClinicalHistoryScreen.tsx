import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { Toast } from '@/components/Toast';
import { usePatientClinicalHistory, useCreateClinicalRecord } from '@/hooks/useClinicalHistory';
import { formatDateInput } from '@/utils/dateUtils';

const formatDateTime = (iso: string) => {
  if (!iso) return { dateText: '', timeText: '' };
  const date = new Date(iso);
  const dateText = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  const timeText = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return { dateText, timeText };
};

interface ServerErrorPayload {
  error?: string;
  message?: string;
}

interface RequestError {
  response?: {
    data?: ServerErrorPayload;
  };
}

export default function PatientClinicalHistoryScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const patientId = id ? Number(id) : NaN;
  const patientName = typeof name === 'string' ? name : 'Paciente';

  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'success' | 'error' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [notesError, setNotesError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<'ALL' | 'TODAY' | 'THIS_MONTH' | 'CUSTOM'>('ALL');

  const { data, isLoading, isError, refetch, error } = usePatientClinicalHistory(patientId);
  const createMutation = useCreateClinicalRecord(patientId);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const filter = dateFilter.trim();
    if (!filter && activeQuickFilter === 'ALL') return data;

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = `${now.getMonth() + 1}`.padStart(2, '0');
    const todayDay = `${now.getDate()}`.padStart(2, '0');
    const todayIso = `${todayYear}-${todayMonth}-${todayDay}`;
    const thisMonthPrefix = `${todayYear}-${todayMonth}`;

    if (activeQuickFilter === 'TODAY') {
      return data.filter((entry) => entry.createdAt?.startsWith(todayIso));
    }

    if (activeQuickFilter === 'THIS_MONTH') {
      return data.filter((entry) => entry.createdAt?.startsWith(thisMonthPrefix));
    }

    if (filter) {
      const cleanFilter = filter.toLowerCase();
      return data.filter((entry) => {
        if (!entry.createdAt) return false;
        const isoDate = entry.createdAt.slice(0, 10);
        const [y, m, d] = isoDate.split('-');
        const displayDate = `${d}/${m}/${y}`;
        return displayDate.includes(cleanFilter) || isoDate.includes(cleanFilter);
      });
    }

    return data;
  }, [data, dateFilter, activeQuickFilter]);

  const errorMessage = useMemo(() => {
    const requestError = error as RequestError | null;
    return requestError?.response?.data?.error ?? requestError?.response?.data?.message ?? 'No se pudo cargar el historial clínico';
  }, [error]);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(protected)/patients');
  };

  const handleRetry = async () => {
    await Haptics.selectionAsync();
    try {
      await refetch();
    } catch {
      setToast({ visible: true, message: errorMessage, type: 'error' });
    }
  };

  const handleOpenModal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotesInput('');
    setNotesError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNotesInput('');
    setNotesError('');
  };

  const handleSubmitEvolution = async () => {
    const trimmedNotes = notesInput.trim();
    if (!trimmedNotes) {
      setNotesError('Debe ingresar las notas de la evolución clínica.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      await createMutation.mutateAsync({ notes: trimmedNotes });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsModalOpen(false);
      setNotesInput('');
      setNotesError('');
      setToast({
        visible: true,
        message: 'Evolución clínica registrada correctamente.',
        type: 'success',
      });
    } catch (err: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const reqErr = err as RequestError | null;
      const msg = reqErr?.response?.data?.error ?? reqErr?.response?.data?.message ?? 'No se pudo guardar la evolución clínica';
      setToast({ visible: true, message: msg, type: 'error' });
    }
  };

  return (
    <ClinicalBackground>
      <SafeAreaView className="flex-1">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />

        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
          <TouchableOpacity
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
            onPress={handleBack}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1 px-3 items-center">
            <Text className="text-lg font-sans-bold text-white">Historial Clínico</Text>
            <Text className="text-white/45 text-xs mt-0.5 font-sans" numberOfLines={1}>{patientName}</Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 px-3 py-2 rounded-xl flex-row items-center gap-1.5"
            onPress={handleOpenModal}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white text-xs font-sans-semibold">Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Date Filter Bar */}
        {data && data.length > 0 ? (
          <View className="px-6 pt-3 pb-1 z-10">
            <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2">
              <Ionicons name="calendar-outline" size={18} color="#60A5FA" />
              <TextInput
                className="flex-1 ml-2.5 text-white text-sm font-sans"
                placeholder="Filtrar por fecha (DD/MM/AAAA)..."
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={dateFilter}
                onChangeText={(val) => {
                  setDateFilter(formatDateInput(val));
                  setActiveQuickFilter('CUSTOM');
                }}
                keyboardType="numeric"
                maxLength={10}
              />
              {dateFilter.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setDateFilter('');
                    setActiveQuickFilter('ALL');
                    Haptics.selectionAsync();
                  }}
                  className="p-1"
                >
                  <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.45)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Filter Chips */}
            <View className="flex-row items-center gap-2 mt-2.5">
              <TouchableOpacity
                onPress={() => {
                  setDateFilter('');
                  setActiveQuickFilter('ALL');
                  Haptics.selectionAsync();
                }}
                className={`px-3 py-1.5 rounded-xl border ${
                  activeQuickFilter === 'ALL' && !dateFilter
                    ? 'bg-blue-600/30 border-blue-400/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text
                  className={`text-xs font-sans-semibold ${
                    activeQuickFilter === 'ALL' && !dateFilter ? 'text-blue-200' : 'text-white/60'
                  }`}
                >
                  Todas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const now = new Date();
                  const d = `${now.getDate()}`.padStart(2, '0');
                  const m = `${now.getMonth() + 1}`.padStart(2, '0');
                  const y = now.getFullYear();
                  setDateFilter(`${d}/${m}/${y}`);
                  setActiveQuickFilter('TODAY');
                  Haptics.selectionAsync();
                }}
                className={`px-3 py-1.5 rounded-xl border ${
                  activeQuickFilter === 'TODAY'
                    ? 'bg-blue-600/30 border-blue-400/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text
                  className={`text-xs font-sans-semibold ${
                    activeQuickFilter === 'TODAY' ? 'text-blue-200' : 'text-white/60'
                  }`}
                >
                  Hoy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const now = new Date();
                  const m = `${now.getMonth() + 1}`.padStart(2, '0');
                  const y = now.getFullYear();
                  setDateFilter(`${m}/${y}`);
                  setActiveQuickFilter('THIS_MONTH');
                  Haptics.selectionAsync();
                }}
                className={`px-3 py-1.5 rounded-xl border ${
                  activeQuickFilter === 'THIS_MONTH'
                    ? 'bg-blue-600/30 border-blue-400/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Text
                  className={`text-xs font-sans-semibold ${
                    activeQuickFilter === 'THIS_MONTH' ? 'text-blue-200' : 'text-white/60'
                  }`}
                >
                  Este mes
                </Text>
              </TouchableOpacity>

              {dateFilter.length > 0 || activeQuickFilter !== 'ALL' ? (
                <View className="ml-auto bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                  <Text className="text-white/45 text-[11px] font-sans">
                    {filteredData.length} de {data.length}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : isError ? (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-4xl mb-3">⚠️</Text>
            <Text className="text-rose-300 text-sm font-sans-semibold text-center mb-3">{errorMessage}</Text>
            <TouchableOpacity
              className="px-4 py-2 rounded-xl border border-blue-400/30 bg-blue-500/20"
              onPress={handleRetry}
            >
              <Text className="text-blue-200 text-sm font-sans-semibold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 36 }}>
            {!data || data.length === 0 ? (
              <View className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-12 items-center px-6">
                <Text className="text-4xl mb-3">📝</Text>
                <Text className="text-white/70 text-sm font-sans-semibold text-center mb-4">
                  Este paciente aún no tiene evoluciones clínicas registradas.
                </Text>
                <TouchableOpacity
                  className="bg-blue-500/20 border border-blue-400/30 px-4 py-2.5 rounded-xl flex-row items-center gap-2"
                  onPress={handleOpenModal}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#93C5FD" />
                  <Text className="text-blue-200 text-sm font-sans-semibold">Registrar primera evolución</Text>
                </TouchableOpacity>
              </View>
            ) : filteredData.length === 0 ? (
              <View className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-12 items-center px-6">
                <Text className="text-4xl mb-3">🔍</Text>
                <Text className="text-white/70 text-sm font-sans-semibold text-center mb-1">
                  Sin evoluciones para la fecha seleccionada
                </Text>
                <Text className="text-white/40 text-xs font-sans text-center mb-4">
                  No se encontraron registros que coincidan con "{dateFilter}".
                </Text>
                <TouchableOpacity
                  className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl"
                  onPress={() => {
                    setDateFilter('');
                    setActiveQuickFilter('ALL');
                    Haptics.selectionAsync();
                  }}
                >
                  <Text className="text-white text-xs font-sans-semibold">Ver todas las evoluciones</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-3">
                {filteredData.map((entry) => {
                  const { dateText, timeText } = formatDateTime(entry.createdAt);
                  const isAppointmentLinked = Boolean(entry.appointmentId);

                  return (
                    <View key={entry.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="calendar-outline" size={15} color="rgba(255,255,255,0.6)" />
                          <Text className="text-white text-sm font-sans-bold">{dateText} {timeText ? `• ${timeText} hs` : ''}</Text>
                        </View>
                        <View
                          className={`px-2.5 py-1 rounded-lg border ${
                            isAppointmentLinked
                              ? 'bg-sky-500/15 border-sky-400/30'
                              : 'bg-emerald-500/15 border-emerald-400/30'
                          }`}
                        >
                          <Text
                            className={`text-[11px] font-sans-semibold ${
                              isAppointmentLinked ? 'text-sky-200' : 'text-emerald-200'
                            }`}
                          >
                            {isAppointmentLinked ? 'Turno Completado' : 'Evolución Directa'}
                          </Text>
                        </View>
                      </View>

                      <View className="mt-3 border border-white/8 bg-white/[0.02] rounded-xl px-3.5 py-3">
                        <Text className="text-white/45 text-[11px] font-sans-semibold uppercase tracking-[0.4px] mb-1">
                          Notas Clínicas
                        </Text>
                        <Text className="text-white/85 text-sm font-sans leading-5">
                          {entry.notes?.trim() || 'Sin observaciones.'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* Modal para Agregar Evolución */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent
          onRequestClose={handleCloseModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-end bg-black/75"
          >
            <View className="bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 shadow-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white text-lg font-sans-bold">Nueva Evolución Clínica</Text>
                  <Text className="text-white/50 text-xs font-sans">{patientName}</Text>
                </View>
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
                  onPress={handleCloseModal}
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>

              <Text className="text-white/70 text-xs font-sans-semibold mb-2">Observaciones y Diagnóstico</Text>
              <TextInput
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-sans text-sm min-h-[120px] max-h-[200px]"
                multiline
                textAlignVertical="top"
                placeholder="Escriba los detalles del tratamiento, diagnóstico o evolución..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={notesInput}
                onChangeText={(text) => {
                  setNotesInput(text);
                  if (notesError) setNotesError('');
                }}
              />
              {notesError ? (
                <Text className="text-rose-400 text-xs font-sans mt-1.5">{notesError}</Text>
              ) : null}

              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-2xl border border-white/10 bg-white/5 items-center"
                  onPress={handleCloseModal}
                  disabled={createMutation.isPending}
                >
                  <Text className="text-white/70 font-sans-semibold text-sm">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 items-center justify-center border border-blue-400/30"
                  onPress={handleSubmitEvolution}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-sans-bold text-sm">Guardar Evolución</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </ClinicalBackground>
  );
}
