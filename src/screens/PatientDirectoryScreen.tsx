import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePatients, useDeletePatient } from '@/hooks/usePatients';
import { PatientCard } from '@/components/PatientCard';
import { Toast } from '@/components/Toast';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { getPendingToast } from '@/storage/authStorage';
import type { Patient } from '@/types/patient.types';

export default function PatientDirectoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  useFocusEffect(
    useCallback(() => {
      getPendingToast().then((message) => {
        if (message) {
          setToast({ visible: true, message, type: 'success' });
        }
      });
    }, [])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: patients, isLoading, isFetching, refetch } = usePatients(debouncedSearch);
  const deleteMutation = useDeletePatient();

  const handleEdit = (patient: Patient) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(protected)/patient-form',
      params: { id: patient.id },
    });
  };

  const handleClinicalHistory = (patient: Patient) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(protected)/patient-clinical-history',
      params: { id: patient.id, name: `${patient.firstName} ${patient.lastName}` },
    });
  };

  const handleDelete = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar Paciente',
      '¿Estás seguro de que deseas eliminar este paciente de tu lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            deleteMutation.mutate(id, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setToast({ visible: true, message: 'Paciente eliminado correctamente', type: 'success' });
              },
              onError: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setToast({ visible: true, message: 'Error al eliminar el paciente', type: 'error' });
              },
            });
          },
        },
      ]
    );
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
        <View className="px-6 pt-4 pb-2 z-10">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-2.5">
              <TouchableOpacity
                className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(protected)/home');
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-2xl font-sans-bold text-white tracking-[0.4px]">Pacientes</Text>
            </View>
            <TouchableOpacity
              className="w-11 h-11 bg-[#3B82F6] rounded-full items-center justify-center shadow-md border border-[#3B82F6]/50"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(protected)/patient-form');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="relative w-full mb-4">
            <TextInput
              className="bg-white/5 border border-white/10 rounded-[14px] pl-11 pr-4 py-[13px] text-white text-base font-sans tracking-[0.3px]"
              placeholder="Buscar por nombre, apellido o DNI..."
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              value={search}
              onChangeText={setSearch}
            />
            <View className="absolute left-4 h-full justify-center items-center">
              <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.45)" />
            </View>
            {search.length > 0 && (
              <TouchableOpacity
                className="absolute right-4 h-full justify-center items-center"
                onPress={() => setSearch('')}
              >
                <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.45)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PatientCard
                patient={item}
                onEdit={handleEdit}
                onClinicalHistory={handleClinicalHistory}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            ListEmptyComponent={() => (
              <View className="flex-1 py-12 items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-[24px]">
                <Text className="text-5xl mb-4">📂</Text>
                <Text className="text-white/70 text-base font-sans-semibold mb-1">
                  No se encontraron pacientes
                </Text>
                <Text className="text-white/40 text-sm text-center px-6 leading-5 font-sans">
                  {search.length > 0
                    ? 'Prueba modificando los términos de búsqueda.'
                    : 'Comienza registrando tu primer paciente con el botón superior.'}
                </Text>
              </View>
            )}
            onRefresh={() => refetch()}
            refreshing={isFetching && !isLoading}
          />
        )}
      </SafeAreaView>
    </ClinicalBackground>
  );
}
