import { useMemo } from 'react';
import type { Appointment, AppointmentStatus as ApiAppointmentStatus } from '@/types/appointment.types';
import {
  parseIsoDate,
  toIsoDate,
  addDays,
  getStartOfWeek,
  normalizeDateString,
  normalizeTimeString,
} from '@/utils/dateUtils';

export type CalendarMode = 'day' | 'week';
export type CalendarStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CalendarAppointment {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  treatment: string;
  status: CalendarStatus;
}

export interface CalendarDayInfo {
  isoDate: string;
  date: Date;
  count: number;
}

export interface StatusSummary {
  scheduled: number;
  completed: number;
  cancelled: number;
}

const mapStatus = (status: ApiAppointmentStatus): CalendarStatus => {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'scheduled';
};

export const mapAppointmentToCalendarItem = (appointment: Appointment): CalendarAppointment => ({
  id: String(appointment.id),
  patientName: `${appointment.patientFirstName} ${appointment.patientLastName}`,
  date: normalizeDateString(appointment.startTime),
  startTime: normalizeTimeString(appointment.startTime),
  endTime: normalizeTimeString(appointment.endTime),
  treatment: appointment.reason || 'Consulta odontológica',
  status: mapStatus(appointment.status),
});

export function useCalendarDates(
  appointments: Appointment[] = [],
  selectedDate: string,
  mode: CalendarMode
) {
  const calendarAppointments = useMemo(
    () => appointments.map(mapAppointmentToCalendarItem),
    [appointments]
  );

  const selectedDateValue = useMemo(() => parseIsoDate(selectedDate), [selectedDate]);
  const weekStart = useMemo(() => getStartOfWeek(selectedDateValue), [selectedDateValue]);

  const weekDays = useMemo<CalendarDayInfo[]>(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const isoDate = toIsoDate(date);
        const count = calendarAppointments.filter((item) => item.date === isoDate).length;
        return { isoDate, date, count };
      }),
    [calendarAppointments, weekStart]
  );

  const selectedDayAppointments = useMemo(
    () => calendarAppointments.filter((item) => item.date === selectedDate),
    [calendarAppointments, selectedDate]
  );

  const weekAppointmentsByDate = useMemo(
    () =>
      weekDays.map((day) => ({
        ...day,
        appointments: calendarAppointments.filter((item) => item.date === day.isoDate),
      })),
    [calendarAppointments, weekDays]
  );

  const statusSummary = useMemo<StatusSummary>(() => {
    const source =
      mode === 'day'
        ? selectedDayAppointments
        : weekAppointmentsByDate.flatMap((item) => item.appointments);
    return {
      scheduled: source.filter((item) => item.status === 'scheduled').length,
      completed: source.filter((item) => item.status === 'completed').length,
      cancelled: source.filter((item) => item.status === 'cancelled').length,
    };
  }, [mode, selectedDayAppointments, weekAppointmentsByDate]);

  return {
    calendarAppointments,
    selectedDateValue,
    weekStart,
    weekDays,
    selectedDayAppointments,
    weekAppointmentsByDate,
    statusSummary,
  };
}
