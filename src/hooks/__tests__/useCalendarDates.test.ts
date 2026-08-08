import { mapAppointmentToCalendarItem } from '../useCalendarDates';
import type { Appointment } from '@/types/appointment.types';

describe('useCalendarDates utils', () => {
  const mockAppointment: Appointment = {
    id: 1,
    patientId: 101,
    patientFirstName: 'Carlos',
    patientLastName: 'Gomez',
    patientDni: '12345678',
    startTime: '2026-08-15T10:00:00Z',
    endTime: '2026-08-15T11:00:00Z',
    status: 'SCHEDULED',
    reason: 'Checkup',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  };

  it('should map appointment to calendar item format correctly', () => {
    // Act
    const item = mapAppointmentToCalendarItem(mockAppointment);

    // Assert
    expect(item.id).toBe('1');
    expect(item.patientName).toBe('Carlos Gomez');
    expect(item.date).toBe('2026-08-15');
    expect(item.startTime).toBe('10:00');
    expect(item.endTime).toBe('11:00');
    expect(item.treatment).toBe('Checkup');
    expect(item.status).toBe('scheduled');
  });

  it('should fallback reason to default dental consultation string when undefined', () => {
    // Arrange
    const appointmentWithoutReason: Appointment = {
      ...mockAppointment,
      reason: undefined,
    };

    // Act
    const item = mapAppointmentToCalendarItem(appointmentWithoutReason);

    // Assert
    expect(item.treatment).toBe('Consulta odontológica');
  });
});
