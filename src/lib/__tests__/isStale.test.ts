import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { isStale, formatTimeAgo } from "../isStale";
import { STALE_THRESHOLD_HOURS } from "../constants";

describe("isStale", () => {
  beforeEach(() => {
    // Mock current time to 2026-01-25T12:00:00Z for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false for data updated less than 48 hours ago", () => {
    // 24 hours ago
    const recentUpdate = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isStale(recentUpdate)).toBe(false);
  });

  it("returns false for data updated exactly at threshold", () => {
    const atThreshold = new Date(
      Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000,
    ).toISOString();
    expect(isStale(atThreshold)).toBe(false);
  });

  it("returns true for data updated more than 48 hours ago", () => {
    // 49 hours ago
    const oldUpdate = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
    expect(isStale(oldUpdate)).toBe(true);
  });

  it("returns true for data updated several days ago", () => {
    // 5 days ago
    const veryOldUpdate = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isStale(veryOldUpdate)).toBe(true);
  });

  it("returns false for just updated data", () => {
    const justNow = new Date().toISOString();
    expect(isStale(justNow)).toBe(false);
  });
});

describe("formatTimeAgo", () => {
  beforeEach(() => {
    // Mock current time to 2026-01-25T12:00:00Z for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("just now format (< 1 minute)", () => {
    it('returns "à l\'instant" for just now (0 seconds)', () => {
      const justNow = new Date().toISOString();
      expect(formatTimeAgo(justNow)).toBe("à l'instant");
    });

    it('returns "à l\'instant" for 30 seconds ago', () => {
      const thirtySecsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      expect(formatTimeAgo(thirtySecsAgo)).toBe("à l'instant");
    });
  });

  describe("minutes format (1-59 minutes)", () => {
    it("handles 1 minute ago correctly", () => {
      const oneMinsAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
      expect(formatTimeAgo(oneMinsAgo)).toBe("il y a 1 min");
    });

    it('returns "il y a X min" for times less than 1 hour', () => {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      expect(formatTimeAgo(thirtyMinsAgo)).toBe("il y a 30 min");
    });

    it('returns "il y a 59 min" for 59 minutes ago', () => {
      const fiftyNineMinsAgo = new Date(
        Date.now() - 59 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(fiftyNineMinsAgo)).toBe("il y a 59 min");
    });
  });

  describe("hours format (1-24 hours)", () => {
    it('returns "il y a 1h" for exactly 1 hour ago', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      expect(formatTimeAgo(oneHourAgo)).toBe("il y a 1h");
    });

    it('returns "il y a Xh" for times 1-24 hours ago', () => {
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(twoHoursAgo)).toBe("il y a 2h");
    });

    it('returns "il y a 12h" for 12 hours ago', () => {
      const twelveHoursAgo = new Date(
        Date.now() - 12 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(twelveHoursAgo)).toBe("il y a 12h");
    });

    it('returns "il y a 23h" for 23 hours ago', () => {
      const twentyThreeHoursAgo = new Date(
        Date.now() - 23 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(twentyThreeHoursAgo)).toBe("il y a 23h");
    });
  });

  describe("days format (1-7 days)", () => {
    it('returns "il y a 1j" for exactly 1 day ago', () => {
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(oneDayAgo)).toBe("il y a 1j");
    });

    it('returns "il y a Xj" for times 1-7 days ago', () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(threeDaysAgo)).toBe("il y a 3j");
    });

    it('returns "il y a 6j" for 6 days ago', () => {
      const sixDaysAgo = new Date(
        Date.now() - 6 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(formatTimeAgo(sixDaysAgo)).toBe("il y a 6j");
    });
  });

  describe("date format (> 7 days)", () => {
    it("returns French locale date for times > 7 days", () => {
      const twoWeeksAgo = new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString();
      // Should match format like "11/01/2026" (French dd/mm/yyyy)
      expect(formatTimeAgo(twoWeeksAgo)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("returns correct French date format for exactly 7 days ago", () => {
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      // 7 days from 2026-01-25 is 2026-01-18 → "18/01/2026"
      expect(formatTimeAgo(sevenDaysAgo)).toBe("18/01/2026");
    });

    it("returns correct French date for 30 days ago", () => {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      // 30 days from 2026-01-25 is 2025-12-26 → "26/12/2025"
      expect(formatTimeAgo(thirtyDaysAgo)).toBe("26/12/2025");
    });
  });

  describe("edge cases", () => {
    it("handles ISO 8601 date strings with timezone", () => {
      // 2 hours before current mocked time
      const withTimezone = "2026-01-25T10:00:00Z";
      expect(formatTimeAgo(withTimezone)).toBe("il y a 2h");
    });

    it("handles date string without timezone (treated as local)", () => {
      // This will be parsed as local time, result depends on timezone
      // Just verify it doesn't throw and returns a valid format
      const noTimezone = "2026-01-25T10:00:00";
      const result = formatTimeAgo(noTimezone);
      expect(result).toMatch(
        /^(à l'instant|il y a \d+\s*(min|h|j)|\d{2}\/\d{2}\/\d{4})$/,
      );
    });

    it('returns "—" for empty string input', () => {
      expect(formatTimeAgo("")).toBe("—");
    });

    it('returns "—" for malformed date string', () => {
      expect(formatTimeAgo("not-a-date")).toBe("—");
    });

    it('returns "—" for invalid date format', () => {
      expect(formatTimeAgo("abc123")).toBe("—");
    });

    it('returns "à l\'instant" for future dates (clock drift)', () => {
      // 1 hour in the future
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      expect(formatTimeAgo(futureDate)).toBe("à l'instant");
    });

    it('returns "à l\'instant" for dates slightly in the future', () => {
      // 5 minutes in the future (server clock ahead)
      const slightlyFuture = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      expect(formatTimeAgo(slightlyFuture)).toBe("à l'instant");
    });
  });
});
