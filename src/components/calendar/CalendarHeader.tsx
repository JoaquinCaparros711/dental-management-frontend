import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarMode } from '@/hooks/useCalendarDates';
import { getDateDisplayTitle, getTimeRangeDisplay } from '@/utils/dateUtils';

interface CalendarHeaderProps {
  mode: CalendarMode;
  selectedDateValue: Date;
  startDate: Date;
  endDate: Date;
  onBack: () => void;
  onCreateAppointment: () => void;
  onModeChange: (mode: CalendarMode) => void;
  onNavigateRange: (direction: -1 | 1) => void;
}

export function CalendarHeader({
  mode,
  selectedDateValue,
  startDate,
  endDate,
  onBack,
  onCreateAppointment,
  onModeChange,
  onNavigateRange,
}: CalendarHeaderProps) {
  const dateTitle =
    mode === 'day'
      ? getDateDisplayTitle(selectedDateValue, 'es')
      : getTimeRangeDisplay(startDate, endDate, 'es');

  return (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row items-center justify-between mb-5">
        <TouchableOpacity
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
          onPress={onBack}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-sans-bold text-white">Agenda y Citas</Text>
        <TouchableOpacity
          className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center border border-blue-400/35"
          onPress={onCreateAppointment}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#BFDBFE" />
        </TouchableOpacity>
      </View>

      <View className="bg-white/[0.045] rounded-2xl p-1.5 border border-white/10 flex-row mb-4">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-xl items-center ${mode === 'day' ? 'bg-blue-500/25 border border-blue-400/30' : ''}`}
          onPress={() => onModeChange('day')}
          activeOpacity={0.8}
        >
          <Text className={`font-sans-semibold text-sm ${mode === 'day' ? 'text-blue-200' : 'text-white/55'}`}>
            Día
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-xl items-center ${mode === 'week' ? 'bg-blue-500/25 border border-blue-400/30' : ''}`}
          onPress={() => onModeChange('week')}
          activeOpacity={0.8}
        >
          <Text className={`font-sans-semibold text-sm ${mode === 'week' ? 'text-blue-200' : 'text-white/55'}`}>
            Semana
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
          onPress={() => onNavigateRange(-1)}
        >
          <Ionicons name="chevron-back" size={18} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-sm font-sans-semibold">{dateTitle}</Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
          onPress={() => onNavigateRange(1)}
        >
          <Ionicons name="chevron-forward" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
