import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
import { saveToken, savePendingToast, getPendingToast } from '@/storage/authStorage';
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
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={handleHideToast}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🦷</Text>
            <Text style={styles.appName}>OdontoGestión</Text>
            <Text style={styles.appSubtitle}>Crear nueva cuenta</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registro</Text>
            <Text style={styles.cardSubtitle}>Completá todos los campos para continuar</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
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
              <View style={styles.halfField}>
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
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{backendError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isSubmitDisabled && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitDisabled}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>
                ¿Ya tenés cuenta?{' '}
                <Text style={styles.loginLinkAccent}>Iniciá sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ClinicalBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 52,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)', // Translucent glass fill
    borderRadius: 28,
    padding: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)', // Thin glass edge
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 24,
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0A84FF', // Glossy iOS blue
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Glass highlight
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.03)',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontWeight: '400',
  },
  loginLinkAccent: {
    color: '#0A84FF',
    fontWeight: '600',
  },
});
