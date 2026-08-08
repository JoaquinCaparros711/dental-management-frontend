import {
  parseIsoDate,
  toIsoDate,
  addDays,
  getStartOfWeek,
  getDateDisplayTitle,
  normalizeDateString,
  normalizeTimeString,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('parseIsoDate', () => {
    it('should correctly parse a valid YYYY-MM-DD date string into a Date object', () => {
      // Arrange
      const isoString = '2026-08-15';

      // Act
      const result = parseIsoDate(isoString);

      // Assert
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(7); // August is index 7
      expect(result.getDate()).toBe(15);
    });

    it('should fallback to current date for invalid or empty input', () => {
      // Act
      const result = parseIsoDate('');

      // Assert
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });
  });

  describe('toIsoDate', () => {
    it('should format Date into YYYY-MM-DD string', () => {
      // Arrange
      const date = new Date(2026, 7, 15); // 2026-08-15

      // Act
      const isoString = toIsoDate(date);

      // Assert
      expect(isoString).toBe('2026-08-15');
    });
  });

  describe('addDays', () => {
    it('should add specified number of days to a Date immutably', () => {
      // Arrange
      const initialDate = new Date(2026, 7, 15);

      // Act
      const nextDay = addDays(initialDate, 1);

      // Assert
      expect(nextDay.getDate()).toBe(16);
      expect(initialDate.getDate()).toBe(15); // Ensure immutability
    });

    it('should handle negative days offset', () => {
      // Arrange
      const initialDate = new Date(2026, 7, 15);

      // Act
      const prevDay = addDays(initialDate, -5);

      // Assert
      expect(prevDay.getDate()).toBe(10);
    });
  });

  describe('getStartOfWeek', () => {
    it('should return Sunday for any day of that week', () => {
      // Arrange: 2026-08-15 is a Saturday (day 6)
      const date = new Date(2026, 7, 15);

      // Act
      const sunday = getStartOfWeek(date);

      // Assert
      expect(sunday.getDay()).toBe(0); // Sunday
      expect(sunday.getDate()).toBe(9); // 2026-08-09
    });
  });

  describe('getDateDisplayTitle', () => {
    it('should format date for Spanish display title', () => {
      // Arrange: 2026-08-15 is Saturday
      const date = new Date(2026, 7, 15);

      // Act
      const title = getDateDisplayTitle(date, 'es');

      // Assert
      expect(title).toBe('Sáb, 15 Ago 2026');
    });
  });

  describe('normalizeDateString and normalizeTimeString', () => {
    it('should extract date and time substrings correctly from ISO string', () => {
      // Arrange
      const fullIso = '2026-08-15T14:30:00Z';

      // Act
      const dateStr = normalizeDateString(fullIso);
      const timeStr = normalizeTimeString(fullIso);

      // Assert
      expect(dateStr).toBe('2026-08-15');
      expect(timeStr).toBe('14:30');
    });
  });
});
