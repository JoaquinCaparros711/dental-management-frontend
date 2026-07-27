import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePatient, useCreatePatient, useUpdatePatient } from '@/hooks/usePatients';
import { TextField } from '@/components/TextField';
import { Toast } from '@/components/Toast';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { savePendingToast } from '@/storage/authStorage';

export default function PatientFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const parsedId = id ? Number(id) : NaN;
  const patientId = Number.isFinite(parsedId) ? parsedId : 0;
  const isEditing = patientId > 0;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const { data: patient, isLoading: isLoadingPatient } = usePatient(Number(id));

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setDni(patient.dni);
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      if (patient.birthDate) {
        const parts = patient.birthDate.split('-');
        setBirthDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
      }
    }
  }, [patient]);

  const handleBirthDateChange = (text: string) => {
    if (text.length < birthDate.length) {
      setBirthDate(text);
      return;
    }

    let cleaned = text.replace(/[^0-9/]/g, '');

    if (cleaned.endsWith('/')) {
      const parts = cleaned.split('/');
      if (parts.length === 2 && parts[0].length === 1) {
        cleaned = `0${parts[0]}/`;
      } else if (parts.length === 3 && parts[1].length === 1) {
        cleaned = `${parts[0]}/0${parts[1]}/`;
      }
    }

    const digits = cleaned.replace(/[^0-9]/g, '');
    let formatted = digits;

    if (digits.length > 0) {
      const day = digits.slice(0, 2);
      if (day.length === 1 && parseInt(day, 10) > 3) {
        formatted = `0${day}/`;
      } else if (day.length === 2) {
        formatted = `${day}/`;
      }
    }
    if (digits.length > 2) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      if (month.length === 1 && parseInt(month, 10) > 1) {
        formatted = `${day}/0${month}/`;
      } else if (month.length === 2) {
        formatted = `${day}/${month}/`;
      } else {
        formatted = `${day}/${month}`;
      }
    }
    if (digits.length > 4) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      formatted = `${day}/${month}/${year}`;
    }

    setBirthDate(formatted);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
  };

  const isFirstNameValid = firstName.trim().length > 0 && /^[^0-9]+$/.test(firstName);
  const isLastNameValid = lastName.trim().length > 0 && /^[^0-9]+$/.test(lastName);
  const isDniValid = dni.trim().length > 0 && /^[0-9]+$/.test(dni);
  const isEmailValid = email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isBirthDateValid = birthDate.trim().length > 0 && /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(birthDate);
  const isPhoneValid = phone.trim().length === 0 || (!/[a-zA-ZÀ-ÿ]/.test(phone) && /^[0-9+\-\s()]+$/.test(phone));

  const isFormValid = isFirstNameValid && isLastNameValid && isDniValid && isEmailValid && isBirthDateValid && isPhoneValid;

  const firstNameState = firstName.length === 0 ? 'idle' : (isFirstNameValid ? 'valid' : 'invalid');
  const lastNameState = lastName.length === 0 ? 'idle' : (isLastNameValid ? 'valid' : 'invalid');
  const dniState = dni.length === 0 ? 'idle' : (isDniValid ? 'valid' : 'invalid');
  const emailState = email.length === 0 ? 'idle' : (isEmailValid ? 'valid' : 'invalid');
  const birthDateState = birthDate.length === 0 ? 'idle' : (isBirthDateValid ? 'valid' : 'invalid');
  const phoneState = phone.length === 0 ? 'idle' : (isPhoneValid ? 'valid' : 'invalid');

  const handleSubmit = async () => {
    if (!isFormValid) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const parts = birthDate.split('/');
    const formattedBirthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const requestData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dni: dni.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      birthDate: formattedBirthDate,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: Number(id), data: requestData },
        {
          onSuccess: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await savePendingToast('¡Paciente actualizado con éxito!');
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(protected)/patients');
            }
          },
          onError: (error: any) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            const serverError = error?.response?.data?.error || 'Error al actualizar el paciente';
            setToast({ visible: true, message: serverError, type: 'error' });
          },
        }
      );
    } else {
      createMutation.mutate(requestData, {
        onSuccess: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await savePendingToast('¡Paciente registrado con éxito!');
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(protected)/patients');
          }
        },
        onError: (error: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          const serverError = error?.response?.data?.error || 'Error al registrar el paciente';
          setToast({ visible: true, message: serverError, type: 'error' });
        },
      });
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-sans-bold text-white pr-10">
            {isEditing ? 'Editar Paciente' : 'Registrar Paciente'}
          </Text>
        </View>

        {isEditing && isLoadingPatient ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
            <TextField
              label="Nombre"
              placeholder="Ej. Juan"
              value={firstName}
              onChangeText={setFirstName}
              validationState={firstNameState}
              errorText="El nombre no puede contener números"
              editable={!isMutating}
            />

            <TextField
              label="Apellido"
              placeholder="Ej. Pérez"
              value={lastName}
              onChangeText={setLastName}
              validationState={lastNameState}
              errorText="El apellido no puede contener números"
              editable={!isMutating}
            />

            <TextField
              label="DNI"
              placeholder="Ej. 12345678"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
              validationState={dniState}
              errorText="El DNI debe ser estrictamente numérico"
              editable={!isMutating}
            />

            <TextField
              label="Fecha de Nacimiento"
              placeholder="DD/MM/AAAA"
              value={birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="numeric"
              maxLength={10}
              validationState={birthDateState}
              errorText="Formato inválido (DD/MM/AAAA)"
              editable={!isMutating}
            />

            <TextField
              label="Teléfono"
              placeholder="Ej. 1122334455"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              validationState={phoneState}
              errorText="El teléfono no puede contener letras"
              editable={!isMutating}
            />

            <TextField
              label="Correo Electrónico"
              placeholder="Ej. juan.perez@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              validationState={emailState}
              errorText="Formato de correo electrónico inválido"
              editable={!isMutating}
            />

            <TouchableOpacity
              className={`bg-[#0A84FF] rounded-2xl py-4.5 items-center mt-6 border border-white/15 ${
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
                    name={isEditing ? 'save-outline' : 'person-add-outline'}
                    size={19}
                    color={isFormValid ? 'white' : 'rgba(255, 255, 255, 0.3)'}
                  />
                  <Text
                    className={`text-base font-sans-bold ${
                      isFormValid ? 'text-white' : 'text-white/30'
                    }`}
                  >
                    {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
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
