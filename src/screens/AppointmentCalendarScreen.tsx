import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ClinicalBackground } from '@/components/ClinicalBackground';
import { Toast } from '@/components/Toast';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarStatusSummary } from '@/components/calendar/CalendarStatusSummary';
import { AppointmentCardItem } from '@/components/calendar/AppointmentCardItem';

import { useAppointments } from '@/hooks/useAppointments';
import { useCalendarDates, type CalendarMode } from '@/hooks/useCalendarDates';
import { getPendingToast } from '@/storage/authStorage';
import { parseIsoDate, toIsoDate, addDays, DAY_NAMES_ES, MONTH_NAMES_ES } from '@/utils/dateUtils';

const TODAY_ISO = toIsoDate(new Date());

export default function AppointmentCalendarScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<CalendarMode>('day');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_ISO);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const { data: appointments, isLoading, isError, refetch, isFetching } = useAppointments();

  const {
    selectedDateValue,
    weekDays,
    selectedDayAppointments,
    weekAppointmentsByDate,
    statusSummary,
  } = useCalendarDates(appointments ?? [], selectedDate, mode);

  useFocusEffect(
    useCallback(() => {
      getPendingToast().then((message) => {
        if (message) {
          setToast({ visible: true, message, type: 'success' });
        }
      });
    }, [])
  );

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(protected)/home');
  };

  const handleMoveRange = async (direction: -1 | 1) => {
    await Haptics.selectionAsync();
    const current = parseIsoDate(selectedDate);
    const nextDate = mode === 'day' ? addDays(current, direction) : addDays(current, direction * 7);
    setSelectedDate(toIsoDate(nextDate));
  };

  const handleSelectDate = async (isoDate: string) => {
    await Haptics.selectionAsync();
    setSelectedDate(isoDate);
  };

  const handleCreateAppointment = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(protected)/appointment-form',
      params: { date: selectedDate },
    });
  };

  const handleEditAppointment = async (appointmentId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(protected)/appointment-form',
      params: { id: appointmentId },
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="bg-white/[0.02] border border-dashed border-rose-400/25 rounded-2xl py-10 items-center px-6">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-rose-300 text-sm font-sans-semibold text-center mb-3">
            No se pudo cargar la agenda
          </Text>
          <TouchableOpacity
            className="px-4 py-2 rounded-xl border border-blue-400/30 bg-blue-500/20"
            onPress={() => refetch()}
          >
            <Text className="text-blue-200 text-sm font-sans-semibold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (mode === 'day') {
      if (selectedDayAppointments.length === 0) {
        return (
          <View className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-10 items-center">
            <Text className="text-4xl mb-3">🗓️</Text>
            <Text className="text-white/70 text-sm font-sans-semibold">Sin citas para este día</Text>
          </View>
        );
      }

      return (
        <View className="gap-3">
          {selectedDayAppointments.map((appointment) => (
            <AppointmentCardItem
              key={appointment.id}
              appointment={appointment}
              onPress={handleEditAppointment}
            />
          ))}
        </View>
      );
    }

    return (
      <View className="gap-4">
        {weekAppointmentsByDate.map((day) => (
          <View key={day.isoDate} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
            <Text className="text-white text-sm font-sans-bold mb-3">
              {DAY_NAMES_ES[day.date.getDay()]} {day.date.getDate()} {MONTH_NAMES_ES[day.date.getMonth()]}
            </Text>
            {day.appointments.length === 0 ? (
              <Text className="text-white/35 text-xs font-sans">Sin turnos programados</Text>
            ) : (
              <View className="gap-2.5">
                {day.appointments.map((appointment) => (
                  <AppointmentCardItem
                    key={appointment.id}
                    appointment={appointment}
                    onPress={handleEditAppointment}
                    compact
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
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

        <CalendarHeader
          mode={mode}
          selectedDateValue={selectedDateValue}
          startDate={weekDays[0]?.date ?? selectedDateValue}
          endDate={weekDays[6]?.date ?? selectedDateValue}
          onBack={handleBack}
          onCreateAppointment={handleCreateAppointment}
          onModeChange={setMode}
          onNavigateRange={handleMoveRange}
        />

        <View className="px-6">
          {isFetching && !isLoading ? (
            <View className="flex-row items-center gap-2 pb-3">
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text className="text-white/55 text-xs font-sans">Actualizando agenda...</Text>
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
          >
            {weekDays.map((day) => {
              const isSelected = day.isoDate === selectedDate;
              return (
                <TouchableOpacity
                  key={day.isoDate}
                  className={`w-[78px] rounded-2xl py-3 border items-center ${
                    isSelected ? 'bg-blue-500/20 border-blue-400/35' : 'bg-white/[0.02] border-white/10'
                  }`}
                  onPress={() => handleSelectDate(day.isoDate)}
                  activeOpacity={0.8}
                >
                  <Text className={`text-xs font-sans-semibold ${isSelected ? 'text-blue-200' : 'text-white/60'}`}>
                    {DAY_NAMES_ES[day.date.getDay()]}
                  </Text>
                  <Text className={`text-lg font-sans-bold mt-0.5 ${isSelected ? 'text-white' : 'text-white/75'}`}>
                    {day.date.getDate()}
                  </Text>
                  <Text className={`text-[11px] mt-0.5 ${isSelected ? 'text-blue-100/80' : 'text-white/35'}`}>
                    {day.count === 0 ? 'Sin turnos' : `${day.count} turno${day.count > 1 ? 's' : ''}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 36 }}>
          <CalendarStatusSummary summary={statusSummary} />
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </ClinicalBackground>
  );
}
