import { View, Text } from 'react-native';
import type { CalendarStatus, StatusSummary } from '@/hooks/useCalendarDates';

export interface StatusStyle {
  label: string;
  dotClassName: string;
  chipClassName: string;
  textClassName: string;
}

export const STATUS_STYLES: Record<CalendarStatus, StatusStyle> = {
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

interface CalendarStatusSummaryProps {
  summary: StatusSummary;
}

export function CalendarStatusSummary({ summary }: CalendarStatusSummaryProps) {
  const statusKeys = Object.keys(STATUS_STYLES) as CalendarStatus[];

  return (
    <View className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 mb-4">
      <Text className="text-white/70 text-xs font-sans-semibold uppercase tracking-[0.8px] mb-3">
        Estados
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {statusKeys.map((status) => {
          const style = STATUS_STYLES[status];
          const count = summary[status];
          return (
            <View
              key={status}
              className={`px-3 py-2 rounded-xl border flex-row items-center gap-2 ${style.chipClassName}`}
            >
              <View className={`w-2 h-2 rounded-full ${style.dotClassName}`} />
              <Text className={`text-xs font-sans-semibold ${style.textClassName}`}>
                {style.label}
              </Text>
              <Text className="text-xs text-white/70 font-sans-semibold">{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
