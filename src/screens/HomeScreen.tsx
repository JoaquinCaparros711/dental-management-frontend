import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { removeToken, savePendingToast, getPendingToast, getUserName, removeUserName } from '@/storage/authStorage';
import { useAppAuth } from '@/navigation/AppNavigator';
import { Toast } from '@/components/Toast';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { Ionicons } from '@expo/vector-icons';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';

const getTodayIsoDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const { setToken } = useAppAuth();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  const [userName, setUserName] = useState('Odontólogo');
  const today = getTodayIsoDate();
  const { data: patients } = usePatients();
  const { data: todayAppointments } = useAppointments(today);
  const activePatientsCount = patients?.length ?? 0;
  const todayAppointmentsCount = todayAppointments?.length ?? 0;

  useEffect(() => {
    getPendingToast().then((message) => {
      if (message) {
        setToast({ visible: true, message, type: 'success' });
      }
    });

    getUserName().then((name) => {
      if (name.firstName && name.lastName) {
        setUserName(`${name.firstName} ${name.lastName}`);
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await savePendingToast('¡Sesión cerrada con éxito!');
    await removeToken();
    await removeUserName();
    setToken(null);
  }, [setToken]);

  const handleNavigatePatients = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(protected)/patients');
  }, [router]);

  const handleNavigateAppointments = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(protected)/appointments');
  }, [router]);

  const handleLockedAction = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setToast({
      visible: true,
      message: 'Módulo en desarrollo. Estará disponible en las próximas versiones.',
      type: 'info'
    });
  }, []);

  return (
    <ClinicalBackground>
      <SafeAreaView className="flex-1">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6 z-10">
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center gap-2.5">
                <Text className="text-3xl">🦷</Text>
                <Text className="text-2xl font-sans-bold text-white tracking-[0.4px]">OdontoGestión</Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-emerald-500/10 rounded-full px-3 py-1 border border-emerald-500/20">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <Text className="text-emerald-400 text-xs font-sans-semibold">En línea</Text>
              </View>
            </View>

            <View
              className="bg-white/[0.045] rounded-[28px] p-6 border-[1.5px] border-white/8 mb-6 shadow-black elevation-8"
              style={{
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              }}
            >
              <Text className="text-white/50 text-xs font-sans-semibold uppercase tracking-[1px] mb-1">Panel del Doctor</Text>
              <Text className="text-2xl font-sans-bold text-white mb-2 tracking-[0.2px]">¡Hola, {userName}!</Text>
              <Text className="text-sm text-white/55 leading-[22px] font-sans">
                Bienvenido de vuelta. Desde aquí puedes gestionar tu agenda, tus finanzas y ver el expediente clínico de tus pacientes.
              </Text>
            </View>

            <View className="flex-row justify-between gap-3 mb-6">
              <View className="flex-1 bg-white/[0.025] border border-white/5 rounded-[22px] p-4 items-center">
                <Text className="text-2xl mb-1">👥</Text>
                <Text className="text-white text-base font-sans-bold">{activePatientsCount}</Text>
                <Text className="text-white/40 text-xs mt-0.5">Pacientes</Text>
              </View>
              <View className="flex-1 bg-white/[0.025] border border-white/5 rounded-[22px] p-4 items-center">
                <Text className="text-2xl mb-1">📅</Text>
                <Text className="text-white text-base font-sans-bold">{todayAppointmentsCount}</Text>
                <Text className="text-white/40 text-xs mt-0.5">Turnos</Text>
              </View>
              <View className="flex-1 bg-white/[0.025] border border-white/5 rounded-[22px] p-4 items-center">
                <Text className="text-2xl mb-1">📈</Text>
                <Text className="text-white text-base font-sans-bold">Control</Text>
                <Text className="text-white/40 text-xs mt-0.5">Finanzas</Text>
              </View>
            </View>

            <Text className="text-white/70 text-base font-sans-semibold mb-4 ml-1">Módulos del Sistema</Text>

            <View className="gap-3.5 mb-8">
              <TouchableOpacity
                className="bg-blue-500/10 rounded-[24px] p-4.5 flex-row items-center justify-between border border-blue-500/25 shadow-sm"
                onPress={handleNavigatePatients}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-blue-500/15 justify-center items-center border border-blue-500/20">
                    <Ionicons name="people-outline" size={24} color="#60A5FA" />
                  </View>
                  <View>
                    <Text className="text-white text-base font-sans-bold">Directorio de Pacientes</Text>
                    <Text className="text-white/45 text-xs mt-1">Altas, consultas y expedientes</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.35)" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-purple-500/10 rounded-[24px] p-4.5 flex-row items-center justify-between border border-purple-400/30"
                onPress={handleNavigateAppointments}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-purple-500/15 justify-center items-center border border-purple-400/25">
                    <Ionicons name="calendar-outline" size={24} color="#C4B5FD" />
                  </View>
                  <View>
                    <Text className="text-white text-base font-sans-bold">Agenda y Citas</Text>
                    <Text className="text-white/45 text-xs mt-1">Vista diaria y semanal interactiva</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.35)" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white/[0.015] rounded-[24px] p-4.5 flex-row items-center justify-between border border-white/5 opacity-55"
                onPress={handleLockedAction}
                activeOpacity={0.9}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-white/5 justify-center items-center border border-white/5">
                    <Ionicons name="cash-outline" size={24} color="rgba(255,255,255,0.4)" />
                  </View>
                  <View>
                    <Text className="text-white/60 text-base font-sans-bold">Control Financiero</Text>
                    <Text className="text-white/30 text-xs mt-1">Pagos, deudas y liquidación</Text>
                  </View>
                </View>
                <Ionicons name="lock-closed-outline" size={16} color="rgba(255, 255, 255, 0.25)" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-red-500/8 rounded-[20px] py-4 items-center border border-red-500/25 mt-2"
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text className="text-red-300 text-sm font-sans-semibold tracking-[0.4px]">Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ClinicalBackground>
  );
}
