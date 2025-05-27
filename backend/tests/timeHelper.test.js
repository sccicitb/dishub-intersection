const helper = require('../app/helpers/timeHelper');

describe('timeHelper', () => {
  describe('formatTime and pad', () => {
    test('pad adds 0 to single digit', () => {
      expect(helper.pad(2)).toBe('02');
      expect(helper.pad(12)).toBe('12');
    });

    test('formatTime returns HH:mm', () => {
      const date = new Date('2025-06-01T14:03:05');
      expect(helper.formatTime(date)).toBe('14:03');
    });
  });

  describe('getIntervals', () => {
    test('interval 15min, isToday=false (full day)', () => {
      const intervals = helper.getIntervals('2025-06-01', '15min', false);
      expect(intervals[0].label).toBe('00:00');
      expect(intervals.length).toBe(96); // 24h*4
      expect(intervals[95].label).toBe('23:45');
    });

    test('interval 1jam, isToday=false (full day)', () => {
      const intervals = helper.getIntervals('2025-06-01', '1jam', false);
      expect(intervals.length).toBe(24);
      expect(intervals[0].label).toBe('00:00');
      expect(intervals[23].label).toBe('23:00');
    });

    test('interval 15min, isToday=true, now=06:29 (should round to 06:30)', () => {
    const fakeNow = new Date('2025-06-01T06:29:00');
    const intervals = helper.getIntervals('2025-06-01', '15min', true, fakeNow);
    expect(intervals.length).toBe(26);
    expect(intervals.at(-1).label).toBe('06:15');
    expect(intervals.at(-1).end.getHours()).toBe(6);
    expect(intervals.at(-1).end.getMinutes()).toBe(30);
    });

    test('interval 1jam, isToday=true, now=17:03 (should round to 18:00)', () => {
    const fakeNow = new Date('2025-06-01T17:03:00');
    const intervals = helper.getIntervals('2025-06-01', '1jam', true, fakeNow);
    expect(intervals.length).toBe(18);
    expect(intervals.at(-1).label).toBe('17:00');
    expect(intervals[17]).toBeDefined();
    expect(intervals[17].label).toBe('17:00');
    });

  });

  describe('getPeriodLabel', () => {
    test('return correct period label', () => {
      expect(helper.getPeriodLabel('06:00')).toBe('Pagi');
      expect(helper.getPeriodLabel('12:05')).toBe('Siang');
      expect(helper.getPeriodLabel('17:10')).toBe('Sore');
      expect(helper.getPeriodLabel('22:00')).toBe('Malam');
    });
    test('fallback if not match', () => {
      expect(helper.getPeriodLabel('00:00')).toBe('Malam');
    });
  });
});
