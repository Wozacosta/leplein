import { describe, it, expect } from "vitest";

import { formatDistance } from "../formatDistance";

describe("formatDistance", () => {
  it("formats distances under 1000m in meters", () => {
    expect(formatDistance(500)).toBe("500 m");
    expect(formatDistance(100)).toBe("100 m");
    expect(formatDistance(999)).toBe("999 m");
  });

  it("rounds meters to whole numbers", () => {
    expect(formatDistance(500.7)).toBe("501 m");
    expect(formatDistance(500.2)).toBe("500 m");
  });

  it("formats distances of 1000m+ in kilometers with 1 decimal", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(1500)).toBe("1.5 km");
    expect(formatDistance(2300)).toBe("2.3 km");
  });

  it("formats larger distances correctly", () => {
    expect(formatDistance(5000)).toBe("5.0 km");
    expect(formatDistance(10500)).toBe("10.5 km");
  });

  it("handles edge case at exactly 1000m", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
  });

  it("handles zero distance", () => {
    expect(formatDistance(0)).toBe("0 m");
  });

  it("handles small distances", () => {
    expect(formatDistance(1)).toBe("1 m");
    expect(formatDistance(50)).toBe("50 m");
  });
});
