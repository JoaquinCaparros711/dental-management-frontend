import { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ClinicalBackground } from '@/components/ClinicalBackground';
import { useAppointments } from '@/hooks/useAppointments';
import type { Appointment, AppointmentStatus as ApiAppointmentStatus } from '@/types/appointment.types';
import { Toast } from '@/components/Toast';
import { getPendingToast } from '@/storage/authStorage';

type CalendarMode = 'day' | 'week';
type CalendarStatus = 'scheduled' | 'completed' | 'cancelled';

interface CalendarAppointment {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  treatment: string;
  status: CalendarStatus;
}

interface StatusStyle {
  label: string;
  dotClassName: string;
  chipClassName: string;
  textClassName: string;
}

const STATUS_STYLES: Record<CalendarStatus, StatusStyle> = {
  scheduled: {
    label: 'Programada',
    dotClassName: 'bg-amber-400',
    chipClassName: 'bg-amber-500/15 border-amber-400/30',
    textClassName: 'text-amber-300',
  },
  completed: {
    label: 'Finalizada',
    dotClassName: 'bg-sky-400',
    chipClassName: 'bg-sky-500/15 border-sky-400/30',
    textClassName: 'text-sky-300',
  },
  cancelled: {
    label: 'Cancelada',
    dotClassName: 'bg-rose-400',
    chipClassName: 'bg-rose-500/15 border-rose-400/30',
    textClassName: 'text-rose-300',
  },
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toIsoDate = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (value: Date, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};

const getWeekStart = (value: Date) => {
  const day = value.getDay();
  return addDays(value, -day);
};

const getDateTitle = (value: Date) => `${DAY_NAMES[value.getDay()]}, ${value.getDate()} ${MONTH_NAMES[value.getMonth()]} ${value.getFullYear()}`;

const getTimeRange = (startDate: Date, endDate: Date) => {
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()} - ${endDate.getDate()} ${MONTH_NAMES[startDate.getMonth()]}`;
  }
  return `${startDate.getDate()} ${MONTH_NAMES[startDate.getMonth()]} - ${endDate.getDate()} ${MONTH_NAMES[endDate.getMonth()]}`;
};

const TODAY = new Date();

const mapStatus = (status: ApiAppointmentStatus): CalendarStatus => {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'scheduled';
};

const normalizeDate = (dateTime: string) => dateTime.slice(0, 10);
const normalizeTime = (dateTime: string) => dateTime.slice(11, 16);

const mapAppointment = (appointment: Appointment): CalendarAppointment => ({
  id: String(appointment.id),
  patientName: `${appointment.patientFirstName} ${appointment.patientLastName}`,
  date: normalizeDate(appointment.startTime),
  startTime: normalizeTime(appointment.startTime),
  endTime: normalizeTime(appointment.endTime),
  treatment: appointment.reason || 'Consulta odontológica',
  status: mapStatus(appointment.status),
});

export default function AppointmentCalendarScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<CalendarMode>('day');
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(TODAY));
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const { data: appointments, isLoading, isError, refetch, isFetching } = useAppointments();
  const calendarAppointments = useMemo(
    () => (appointments ?? []).map(mapAppointment),
    [appointments]
  );

  const selectedDateValue = useMemo(() => parseIsoDate(selectedDate), [selectedDate]);
  const weekStart = useMemo(() => getWeekStart(selectedDateValue), [selectedDateValue]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const isoDate = toIsoDate(date);
        const count = calendarAppointments.filter((appointment) => appointment.date === isoDate).length;
        return {
          isoDate,
          date,
          count,
        };
      }),
    [calendarAppointments, weekStart]
  );

  const selectedDayAppointments = useMemo(
    () => calendarAppointments.filter((appointment) => appointment.date === selectedDate),
    [calendarAppointments, selectedDate]
  );

  const weekAppointmentsByDate = useMemo(
    () =>
      weekDays.map((day) => ({
        ...day,
        appointments: calendarAppointments.filter((appointment) => appointment.date === day.isoDate),
      })),
    [calendarAppointments, weekDays]
  );

  const statusSummary = useMemo(() => {
    const source = mode === 'day' ? selectedDayAppointments : weekAppointmentsByDate.flatMap((item) => item.appointments);
    return {
      scheduled: source.filter((appointment) => appointment.status === 'scheduled').length,
      completed: source.filter((appointment) => appointment.status === 'completed').length,
      cancelled: source.filter((appointment) => appointment.status === 'cancelled').length,
    };
  }, [mode, selectedDayAppointments, weekAppointmentsByDate]);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(protected)/home');
  };

  const moveRange = async (direction: -1 | 1) => {
    await Haptics.selectionAsync();
    const current = parseIsoDate(selectedDate);
    const nextDate = mode === 'day' ? addDays(current, direction) : addDays(current, direction * 7);
    setSelectedDate(toIsoDate(nextDate));
  };

  const selectDate = async (isoDate: string) => {
    await Haptics.selectionAsync();
    setSelectedDate(isoDate);
  };

  useFocusEffect(
    useCallback(() => {
      getPendingToast().then((message) => {
        if (message) {
          setToast({ visible: true, message, type: 'success' });
        }
      });
    }, [])
  );

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

  return (
    <ClinicalBackground>
      <SafeAreaView className="flex-1">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
              onPress={handleBack}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-sans-bold text-white">Agenda y Citas</Text>
            <TouchableOpacity
              className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center border border-blue-400/35"
              onPress={handleCreateAppointment}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#BFDBFE" />
            </TouchableOpacity>
          </View>

          <View className="bg-white/[0.045] rounded-2xl p-1.5 border border-white/10 flex-row mb-4">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-xl items-center ${mode === 'day' ? 'bg-blue-500/25 border border-blue-400/30' : ''}`}
              onPress={() => setMode('day')}
              activeOpacity={0.8}
            >
              <Text className={`font-sans-semibold text-sm ${mode === 'day' ? 'text-blue-200' : 'text-white/55'}`}>Día</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-xl items-center ${mode === 'week' ? 'bg-blue-500/25 border border-blue-400/30' : ''}`}
              onPress={() => setMode('week')}
              activeOpacity={0.8}
            >
              <Text className={`font-sans-semibold text-sm ${mode === 'week' ? 'text-blue-200' : 'text-white/55'}`}>Semana</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center" onPress={() => moveRange(-1)}>
              <Ionicons name="chevron-back" size={18} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-sm font-sans-semibold">
              {mode === 'day'
                ? getDateTitle(selectedDateValue)
                : getTimeRange(weekDays[0].date, weekDays[6].date)}
            </Text>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center" onPress={() => moveRange(1)}>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {isFetching && !isLoading ? (
            <View className="flex-row items-center gap-2 pb-3">
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text className="text-white/55 text-xs font-sans">Actualizando agenda...</Text>
            </View>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {weekDays.map((day) => {
              const isSelected = day.isoDate === selectedDate;
              return (
                <TouchableOpacity
                  key={day.isoDate}
                  className={`w-[78px] rounded-2xl py-3 border items-center ${isSelected ? 'bg-blue-500/20 border-blue-400/35' : 'bg-white/[0.02] border-white/10'}`}
                  onPress={() => selectDate(day.isoDate)}
                  activeOpacity={0.8}
                >
                  <Text className={`text-xs font-sans-semibold ${isSelected ? 'text-blue-200' : 'text-white/60'}`}>{DAY_NAMES[day.date.getDay()]}</Text>
                  <Text className={`text-lg font-sans-bold mt-0.5 ${isSelected ? 'text-white' : 'text-white/75'}`}>{day.date.getDate()}</Text>
                  <Text className={`text-[11px] mt-0.5 ${isSelected ? 'text-blue-100/80' : 'text-white/35'}`}>
                    {day.count === 0 ? 'Sin turnos' : `${day.count} turno${day.count > 1 ? 's' : ''}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 36 }}>
          <View className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 mb-4">
            <Text className="text-white/70 text-xs font-sans-semibold uppercase tracking-[0.8px] mb-3">Estados</Text>
            <View className="flex-row flex-wrap gap-2">
              {(Object.keys(STATUS_STYLES) as CalendarStatus[]).map((status) => {
                const style = STATUS_STYLES[status];
                const amount = statusSummary[status];
                return (
                  <View key={status} className={`px-3 py-2 rounded-xl border flex-row items-center gap-2 ${style.chipClassName}`}>
                    <View className={`w-2 h-2 rounded-full ${style.dotClassName}`} />
                    <Text className={`text-xs font-sans-semibold ${style.textClassName}`}>{style.label}</Text>
                    <Text className="text-xs text-white/70 font-sans-semibold">{amount}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : isError ? (
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
          ) : mode === 'day' ? (
            <View className="gap-3">
              {selectedDayAppointments.length === 0 ? (
                <View className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-10 items-center">
                  <Text className="text-4xl mb-3">🗓️</Text>
                  <Text className="text-white/70 text-sm font-sans-semibold">Sin citas para este día</Text>
                </View>
              ) : (
                selectedDayAppointments.map((appointment) => {
                  const statusStyle = STATUS_STYLES[appointment.status];
                  return (
                    <TouchableOpacity
                      key={appointment.id}
                      className="bg-white/[0.03] border border-white/8 rounded-2xl p-4"
                      onPress={() => handleEditAppointment(appointment.id)}
                      activeOpacity={0.85}
                    >
                      <View className="flex-row justify-between items-start gap-3">
                        <View className="flex-1">
                          <Text className="text-white text-base font-sans-bold">{appointment.patientName}</Text>
                          <Text className="text-white/45 text-xs mt-1">{appointment.treatment}</Text>
                        </View>
                        <View className={`px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5 ${statusStyle.chipClassName}`}>
                          <View className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClassName}`} />
                          <Text className={`text-[11px] font-sans-semibold ${statusStyle.textClassName}`}>{statusStyle.label}</Text>
                        </View>
                      </View>
                      <View className="mt-3 flex-row items-center gap-2">
                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                        <Text className="text-white/70 text-sm font-sans-medium">
                          {appointment.startTime} - {appointment.endTime}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : (
            <View className="gap-4">
              {weekAppointmentsByDate.map((day) => (
                <View key={day.isoDate} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
                  <Text className="text-white text-sm font-sans-bold mb-3">
                    {DAY_NAMES[day.date.getDay()]} {day.date.getDate()} {MONTH_NAMES[day.date.getMonth()]}
                  </Text>
                  {day.appointments.length === 0 ? (
                    <Text className="text-white/35 text-xs font-sans">Sin turnos programados</Text>
                  ) : (
                    <View className="gap-2.5">
                      {day.appointments.map((appointment) => {
                        const statusStyle = STATUS_STYLES[appointment.status];
                        return (
                          <TouchableOpacity
                            key={appointment.id}
                            className="flex-row justify-between items-center bg-white/[0.02] rounded-xl p-3 border border-white/8"
                            onPress={() => handleEditAppointment(appointment.id)}
                            activeOpacity={0.85}
                          >
                            <View className="flex-1">
                              <Text className="text-white/85 text-sm font-sans-semibold">{appointment.patientName}</Text>
                              <Text className="text-white/45 text-xs mt-0.5">
                                {appointment.startTime} - {appointment.endTime}
                              </Text>
                            </View>
                            <View className={`px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5 ${statusStyle.chipClassName}`}>
                              <View className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClassName}`} />
                              <Text className={`text-[11px] font-sans-semibold ${statusStyle.textClassName}`}>{statusStyle.label}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ClinicalBackground>
  );
}
