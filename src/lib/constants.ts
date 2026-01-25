export const DEFAULT_RADIUS = 5000; // meters

export const FUEL_TYPES = [
  { id: 1, name: 'Gazole', shortName: 'Gazole', picto: 'B7' },
  { id: 2, name: 'Sans Plomb 95', shortName: 'SP95', picto: 'E5' },
  { id: 5, name: 'Sans Plomb 95-E10', shortName: 'E10', picto: 'E10' },
  { id: 6, name: 'Sans Plomb 98', shortName: 'SP98', picto: 'E5' },
  { id: 3, name: 'E85', shortName: 'E85', picto: 'E85' },
  { id: 4, name: 'GPLc', shortName: 'GPLc', picto: 'LPG' },
] as const;

export const STALE_THRESHOLD_HOURS = 48; // Consider data stale after 48 hours
