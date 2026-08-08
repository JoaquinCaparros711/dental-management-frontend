import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarAppointment } from '@/hooks/useCalendarDates';
import { STATUS_STYLES } from './CalendarStatusSummary';

interface AppointmentCardItemProps {
  appointment: CalendarAppointment;
  onPress: (id: string) => void;
  compact?: boolean;
}

export function AppointmentCardItem({ appointment, onPress, compact = false }: AppointmentCardItemProps) {
  const statusStyle = STATUS_STYLES[appointment.status];

  if (compact) {
    return (
      <TouchableOpacity
        className="flex-row justify-between items-center bg-white/[0.02] rounded-xl p-3 border border-white/8"
        onPress={() => onPress(appointment.id)}
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
  }

  return (
    <TouchableOpacity
      className="bg-white/[0.03] border border-white/8 rounded-2xl p-4"
      onPress={() => onPress(appointment.id)}
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
}
