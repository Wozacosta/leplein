// Available brand logos (downloaded from prix-carburants.2aaz.fr)
const BRAND_LOGOS = new Set([
  "8ahuit",
  "agip",
  "atac",
  "auchan",
  "autre",
  "avia",
  "bi1",
  "bp",
  "bpexpress",
  "bricomarche",
  "campus",
  "carrefour",
  "carrefourcontact",
  "carrefourexpress",
  "carrefourmarket",
  "casino",
  "coccinelle",
  "colruyt",
  "cora",
  "dyneff",
  "ecomarche",
  "elan",
  "eleclerc",
  "elf",
  "eni",
  "esso",
  "essoexpress",
  "fina",
  "geant",
  "intermarche",
  "k9",
  "maximarche",
  "migros",
  "monoprix",
  "netto",
  "oilfrance",
  "roady",
  "shell",
  "shopi",
  "simplymarket",
  "spar",
  "supermarchecasino",
  "supermarchematch",
  "systemeu",
  "total",
  "totalaccess",
  "vito",
  "weldom",
]);

// Normalize brand name to match logo filename
function normalizeBrandName(brandName: string): string {
  return brandName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric
    .replace(/\s+/g, ""); // Remove spaces
}

// Suffixes to strip when trying to match brand logos
const SUFFIXES_TO_STRIP = [
  "express",
  "market",
  "contact",
  "access",
  "energies",
];

// Get local brand logo path, returns null if not found
export function getBrandLogo(brandName: string | undefined): string | null {
  if (!brandName) return null;

  const normalized = normalizeBrandName(brandName);

  if (BRAND_LOGOS.has(normalized)) {
    return `/brands/${normalized}.png`;
  }

  // Try stripping common suffixes (only from end of string)
  for (const suffix of SUFFIXES_TO_STRIP) {
    if (normalized.endsWith(suffix)) {
      const variant = normalized.slice(0, -suffix.length);
      if (BRAND_LOGOS.has(variant)) {
        return `/brands/${variant}.png`;
      }
    }
  }

  return null;
}
