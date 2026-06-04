import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { removeToken, savePendingToast, getPendingToast } from '@/storage/authStorage';
import { useAppAuth } from '@/navigation/AppNavigator';
import { Toast } from '@/components/Toast';
import { ClinicalBackground } from '@/components/ClinicalBackground';

export default function HomeScreen() {
  const router = useRouter();
  const { setToken } = useAppAuth();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    getPendingToast().then((message) => {
      if (message) {
        setToast({ visible: true, message, type: 'success' });
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await savePendingToast('¡Sesión cerrada con éxito!');
    await removeToken();
    setToken(null);
  }, [setToken]);

  return (
    <ClinicalBackground>
      <SafeAreaView className="flex-1">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
        <View className="flex-1 px-6 pt-6 pb-8 z-10">
          <View className="flex-row items-center gap-2.5 mb-8">
            <Text className="text-3xl">🦷</Text>
            <Text className="text-2xl font-sans-bold text-white tracking-[0.4px]">OdontoGestión</Text>
          </View>

          <View
            className="bg-white/[0.045] rounded-[24px] p-6 border-[1.5px] border-white/8 mb-4 shadow-black elevation-8"
            style={{
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            <Text className="text-xl font-sans-bold text-white mb-2.5 tracking-[0.2px]">¡Bienvenido al sistema!</Text>
            <Text className="text-sm text-white/55 leading-[22px] mb-4.5 font-sans">
              Autenticación JWT verificada correctamente. Tu sesión está activa y protegida.
            </Text>
            <View className="flex-row items-center gap-2 bg-emerald-500/10 rounded-[20px] px-3.5 py-1.5 self-start border border-emerald-500/25">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-emerald-400 text-[13px] font-sans-semibold">Sesión activa</Text>
            </View>
          </View>

          <View className="bg-white/[0.025] rounded-[24px] p-6 border border-white/5">
            <Text className="text-base font-sans-semibold text-white/70 mb-2.5">Panel Principal</Text>
            <Text className="text-sm text-white/40 leading-[22px] font-sans">
              Las funcionalidades del sistema de gestión dental se integrarán aquí en las próximas User Stories del proyecto.
            </Text>
          </View>

          <View className="flex-1" />

          <TouchableOpacity
            className="bg-red-500/8 rounded-2xl py-4 items-center border-[1.5px] border-red-500/25"
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text className="text-red-300 text-base font-sans-semibold tracking-[0.4px]">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ClinicalBackground>
  );
}
