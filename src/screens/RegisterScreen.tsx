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
import { useRegister } from '@/hooks/useAuth';
import { saveToken, savePendingToast, getPendingToast, saveUserName } from '@/storage/authStorage';
import { useAppAuth } from '@/navigation/AppNavigator';
import { ClinicalBackground } from '@/components/ClinicalBackground';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTAINS_LETTER = /[a-zA-ZÀ-ÿ]/;

function isValidName(value: string): boolean {
  return value.trim().length > 0 && CONTAINS_LETTER.test(value);
}

type ValidationState = 'valid' | 'invalid' | 'idle';

function nameValidationState(value: string): ValidationState {
  if (value.length === 0) return 'idle';
  return isValidName(value) ? 'valid' : 'invalid';
}

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const router = useRouter();
  const { setToken } = useAppAuth();
  const { mutate: register, isPending, error } = useRegister();

  useEffect(() => {
    getPendingToast().then((message) => {
      if (message) {
        setToast({ visible: true, message, type: 'info' });
      }
    });
  }, []);

  const emailValidationState: ValidationState =
    email.length === 0 ? 'idle' : EMAIL_REGEX.test(email) ? 'valid' : 'invalid';

  const passwordValidationState: ValidationState =
    password.length === 0 ? 'idle' : password.length > 8 ? 'valid' : 'invalid';

  const confirmPasswordValidationState: ValidationState =
    confirmPassword.length === 0
      ? 'idle'
      : confirmPassword === password && password.length > 8
      ? 'valid'
      : 'invalid';

  const isFormValid =
    isValidName(firstName) &&
    isValidName(lastName) &&
    EMAIL_REGEX.test(email) &&
    password.length > 8 &&
    confirmPassword === password;

  const handleRegister = useCallback(() => {
    if (!isFormValid) return;

    // Tactile feedback on press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    register(
      { firstName, lastName, email, password },
      {
        onSuccess: async (data) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await savePendingToast('¡Cuenta creada exitosamente!');
          await saveToken(data.token);
          await saveUserName(firstName, lastName);
          setToken(data.token);
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      }
    );
  }, [firstName, lastName, email, password, isFormValid, register, setToken]);

  const handleHideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const backendError = error
    ? ((error as AxiosError<{ error: string }>).response?.data?.error ??
      'Error en el registro. Intentá de nuevo.')
    : null;

  const isSubmitDisabled = !isFormValid || isPending;

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
          <View className="items-center mb-8">
            <Text className="text-[52px] mb-3">🦷</Text>
            <Text className="text-2xl font-sans-bold text-white tracking-[0.5px]">OdontoGestión</Text>
            <Text className="text-sm text-white/40 mt-1 tracking-[0.4px] font-sans-medium">Crear nueva cuenta</Text>
          </View>

          <View
            className="bg-white/[0.045] rounded-[28px] p-7 border-[1.5px] border-white/8 shadow-black elevation-12"
            style={{
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
            }}
          >
            <Text className="text-2xl font-sans-bold text-white mb-1.5 tracking-[0.2px]">Registro</Text>
            <Text className="text-sm text-white/40 mb-6 font-sans">Completá todos los campos para continuar</Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="Nombre"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  validationState={nameValidationState(firstName)}
                  errorText="El nombre debe contener letras"
                  placeholder="Juan"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Apellido"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  validationState={nameValidationState(lastName)}
                  errorText="El apellido debe contener letras"
                  placeholder="Pérez"
                />
              </View>
            </View>

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
              label="Contraseña (más de 8 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              validationState={passwordValidationState}
              errorText="La contraseña debe tener más de 8 caracteres"
              placeholder="••••••••••"
            />

            <TextField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              validationState={confirmPasswordValidationState}
              errorText="Las contraseñas no coinciden"
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
              onPress={handleRegister}
              disabled={isSubmitDisabled}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-sans-semibold tracking-[0.4px]">Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="mt-6 items-center">
              <Text className="text-white/40 text-sm font-sans">
                ¿Ya tenés cuenta?{' '}
                <Text className="text-[#0A84FF] font-sans-semibold">Iniciá sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ClinicalBackground>
  );
}
