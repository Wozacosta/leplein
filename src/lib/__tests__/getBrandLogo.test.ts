import { describe, it, expect } from "vitest";

import { getBrandLogo } from "../getBrandLogo";

describe("getBrandLogo", () => {
  describe("exact matches", () => {
    it("returns logo path for exact brand name match", () => {
      expect(getBrandLogo("total")).toBe("/brands/total.png");
      expect(getBrandLogo("shell")).toBe("/brands/shell.png");
      expect(getBrandLogo("bp")).toBe("/brands/bp.png");
    });

    it("handles case insensitivity", () => {
      expect(getBrandLogo("Total")).toBe("/brands/total.png");
      expect(getBrandLogo("SHELL")).toBe("/brands/shell.png");
      expect(getBrandLogo("BP")).toBe("/brands/bp.png");
    });

    it("handles brands starting with numbers", () => {
      expect(getBrandLogo("8 à Huit")).toBe("/brands/8ahuit.png");
      expect(getBrandLogo("8ahuit")).toBe("/brands/8ahuit.png");
    });
  });

  describe("accent normalization", () => {
    it("removes accents from brand names", () => {
      expect(getBrandLogo("Géant")).toBe("/brands/geant.png");
      expect(getBrandLogo("E.Leclerc")).toBe("/brands/eleclerc.png");
    });
  });

  describe("special character handling", () => {
    it("removes dots and special characters", () => {
      expect(getBrandLogo("E.Leclerc")).toBe("/brands/eleclerc.png");
      expect(getBrandLogo("B.P.")).toBe("/brands/bp.png");
    });

    it("removes spaces", () => {
      expect(getBrandLogo("Carrefour Market")).toBe("/brands/carrefourmarket.png");
      expect(getBrandLogo("Simply Market")).toBe("/brands/simplymarket.png");
    });
  });

  describe("suffix stripping", () => {
    it("strips express suffix to match base brand", () => {
      expect(getBrandLogo("Carrefour Express")).toBe("/brands/carrefourexpress.png");
      // essoexpress exists, so it should match directly
      expect(getBrandLogo("Esso Express")).toBe("/brands/essoexpress.png");
    });

    it("strips energies suffix for TotalEnergies", () => {
      expect(getBrandLogo("TotalEnergies")).toBe("/brands/total.png");
      expect(getBrandLogo("Total Energies")).toBe("/brands/total.png");
    });

    it("only strips suffixes from end of string", () => {
      // "intermarche" should match directly, not be confused by "market" mid-string
      expect(getBrandLogo("Intermarché")).toBe("/brands/intermarche.png");
    });

    it("strips market suffix when logo exists without it", () => {
      // carrefourmarket exists as a logo
      expect(getBrandLogo("Carrefour Market")).toBe("/brands/carrefourmarket.png");
    });
  });

  describe("null handling", () => {
    it("returns null for undefined input", () => {
      expect(getBrandLogo(undefined)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(getBrandLogo("")).toBeNull();
    });

    it("returns null for unknown brands", () => {
      expect(getBrandLogo("Unknown Brand")).toBeNull();
      expect(getBrandLogo("FakeBrand")).toBeNull();
    });
  });

  describe("real-world brand names from API", () => {
    it("handles common French fuel station brands", () => {
      expect(getBrandLogo("Auchan")).toBe("/brands/auchan.png");
      expect(getBrandLogo("Intermarché")).toBe("/brands/intermarche.png");
      expect(getBrandLogo("Carrefour")).toBe("/brands/carrefour.png");
      expect(getBrandLogo("Casino")).toBe("/brands/casino.png");
      expect(getBrandLogo("Esso")).toBe("/brands/esso.png");
      expect(getBrandLogo("Avia")).toBe("/brands/avia.png");
    });
  });
});
