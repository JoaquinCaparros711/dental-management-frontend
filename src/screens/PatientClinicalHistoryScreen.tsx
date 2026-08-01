import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { Toast } from '@/components/Toast';
import { usePatientClinicalHistory } from '@/hooks/useClinicalHistory';

const formatDateTime = (iso: string) => {
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

  const { data, isLoading, isError, refetch, error } = usePatientClinicalHistory(patientId);

  const errorMessage = useMemo(() => {
    const requestError = error as RequestError | null;
    return requestError?.response?.data?.error ?? 'No se pudo cargar el historial clínico';
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
          <View className="flex-1 pr-8">
            <Text className="text-center text-lg font-sans-bold text-white">Historial Clínico</Text>
            <Text className="text-center text-white/45 text-xs mt-0.5 font-sans">{patientName}</Text>
          </View>
        </View>

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
          <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 36 }}>
            {!data || data.length === 0 ? (
              <View className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-10 items-center px-6">
                <Text className="text-4xl mb-3">📝</Text>
                <Text className="text-white/70 text-sm font-sans-semibold text-center">
                  Este paciente aún no tiene notas clínicas registradas.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {data.map((entry) => {
                  const start = formatDateTime(entry.startTime);
                  const end = formatDateTime(entry.endTime);
                  return (
                    <View key={entry.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-white text-sm font-sans-bold">{start.dateText}</Text>
                        <View className="px-2.5 py-1 rounded-lg border bg-sky-500/15 border-sky-400/30">
                          <Text className="text-[11px] font-sans-semibold text-sky-200">Finalizada</Text>
                        </View>
                      </View>
                      <View className="mt-2 flex-row items-center gap-2">
                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                        <Text className="text-white/70 text-xs font-sans">
                          Turno {start.timeText} - {end.timeText}
                        </Text>
                      </View>
                      <View className="mt-3 border border-white/8 bg-white/[0.02] rounded-xl px-3 py-2.5">
                        <Text className="text-white/45 text-[11px] font-sans-semibold uppercase tracking-[0.4px] mb-1">
                          Notas clínicas
                        </Text>
                        <Text className="text-white/80 text-sm font-sans">
                          {entry.clinicalNotes?.trim() || 'Sin notas clínicas cargadas.'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ClinicalBackground>
  );
}
