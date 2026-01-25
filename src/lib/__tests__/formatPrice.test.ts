import { describe, it, expect } from "vitest";

import { formatPrice } from "../formatPrice";

describe("formatPrice", () => {
  it("formats a standard price with French locale and /L suffix", () => {
    // Intl.NumberFormat uses narrow no-break space (U+202F) before €
    expect(formatPrice(1.72)).toMatch(/1,72\s*€\/L/);
  });

  it("formats price with 2 decimal places", () => {
    expect(formatPrice(1.7)).toMatch(/1,70\s*€\/L/);
  });

  it("rounds to 2 decimal places", () => {
    expect(formatPrice(1.726)).toMatch(/1,73\s*€\/L/);
    expect(formatPrice(1.724)).toMatch(/1,72\s*€\/L/);
  });

  it("handles whole numbers", () => {
    expect(formatPrice(2)).toMatch(/2,00\s*€\/L/);
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toMatch(/0,00\s*€\/L/);
  });

  it("handles prices above 2 euros", () => {
    expect(formatPrice(2.15)).toMatch(/2,15\s*€\/L/);
  });

  it("uses French thousand separator for large numbers", () => {
    // Edge case - unlikely but should handle gracefully
    // French locale uses narrow no-break space as thousand separator
    expect(formatPrice(1234.56)).toMatch(/1[\s\u202F]234,56\s*€\/L/);
  });
});
