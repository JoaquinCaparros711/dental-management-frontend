import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { AxiosError } from 'axios';
import * as Haptics from 'expo-haptics';
import { TextField } from '@/components/TextField';
import { Toast } from '@/components/Toast';
import { useLogin } from '@/hooks/useAuth';
import { saveToken, savePendingToast, getPendingToast } from '@/storage/authStorage';
import { useAppAuth } from '@/navigation/AppNavigator';
import { ClinicalBackground } from '@/components/ClinicalBackground';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  const router = useRouter();
  const { setToken } = useAppAuth();
  const { mutate: login, isPending, error } = useLogin();

  useEffect(() => {
    getPendingToast().then((message) => {
      if (message) {
        setToast({ visible: true, message, type: 'info' });
      }
    });
  }, []);

  const emailValidationState =
    email.length === 0 ? 'idle' : EMAIL_REGEX.test(email) ? 'valid' : 'invalid';

  const handleLogin = useCallback(() => {
    // Tactile feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    login(
      { email, password },
      {
        onSuccess: async (data) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await savePendingToast('¡Inicio de sesión exitoso!');
          await saveToken(data.token);
          setToken(data.token);
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      }
    );
  }, [email, password, login, setToken]);

  const handleHideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const backendError = error
    ? ((error as AxiosError<{ error: string }>).response?.data?.error ??
      'Error al iniciar sesión. Intentá de nuevo.')
    : null;

  const isSubmitDisabled = isPending || email.length === 0 || password.length === 0;

  return (
    <ClinicalBackground>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={handleHideToast}
        />
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-9">
            <Text className="text-[56px] mb-3">🦷</Text>
            <Text className="text-3xl font-sans-bold text-white tracking-[0.5px]">OdontoGestión</Text>
            <Text className="text-sm text-white/40 mt-1.5 tracking-[0.4px] font-sans-medium">Sistema de Gestión Dental</Text>
          </View>

          <View
            className="bg-white/[0.045] rounded-[28px] p-7 border-[1.5px] border-white/8 shadow-black elevation-12"
            style={{
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
            }}
          >
            <Text className="text-2xl font-sans-bold text-white mb-1.5 tracking-[0.2px]">Iniciar Sesión</Text>
            <Text className="text-sm text-white/40 mb-6.5 font-sans">Ingresá tus credenciales para continuar</Text>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              validationState={emailValidationState}
              errorText="Ingresá un correo electrónico válido"
              placeholder="doctor@clinica.com"
            />

            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              validationState="idle"
              placeholder="••••••••••"
            />

            {backendError && (
              <View className="bg-red-500/10 rounded-xl p-3.5 mb-4.5 border border-red-500/25">
                <Text className="text-red-300 text-sm font-sans-medium">{backendError}</Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-[#0A84FF] rounded-2xl py-4 items-center mt-2 border border-white/15 ${
                isSubmitDisabled
                  ? 'bg-[#0A84FF]/25 border-white/3 shadow-none elevation-0'
                  : 'elevation-5'
              }`}
              style={
                isSubmitDisabled
                  ? undefined
                  : {
                      shadowColor: '#0A84FF',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                    }
              }
              onPress={handleLogin}
              disabled={isSubmitDisabled}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-sans-semibold tracking-[0.4px]">Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="mt-6 items-center"
            >
              <Text className="text-white/40 text-sm font-sans">
                ¿No tenés cuenta?{' '}
                <Text className="text-[#0A84FF] font-sans-semibold">Registrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ClinicalBackground>
  );
}
