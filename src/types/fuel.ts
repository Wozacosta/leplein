export interface Fuel {
  id: number;
  name: string;
  short_name: string;
  type: 'D' | 'E' | 'G';
  picto: string;
}

export type FuelId = 1 | 2 | 3 | 4 | 5 | 6;

export const FUEL_IDS = {
  GAZOLE: 1,
  SP95: 2,
  SP98: 6,
  E10: 5,
  E85: 3,
  GPLC: 4,
} as const;
