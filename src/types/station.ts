export interface StationFuelPrice {
  id: number;
  name: string;
  shortName: string;
  type: "D" | "E" | "G";
  picto: string;
  Update: {
    value: string;
    text: string;
  };
  available: boolean;
  Price?: {
    value: number;
    currency?: string;
    unit?: string;
    text: string;
  };
}

export interface Station {
  id: number;
  Brand: {
    id: number;
    name: string;
    shortName: string;
    nb_stations: number;
  };
  type: "R" | "A";
  name: string;
  Address: {
    street_line: string;
    city_line: string;
  };
  Coordinates?: {
    latitude: number;
    longitude: number;
  };
  Fuels: StationFuelPrice[];
  LastUpdate?: {
    value: string;
    text: string;
  };
  distance?: number;
  Distance?: {
    value: number;
    text: string;
  };
}

// Response from /stations/around/{lat},{lng} - no prices
export interface StationListItem {
  id: number;
  Brand: {
    id: number;
    name: string;
    shortName: string;
    nb_stations: number;
  };
  type: "R" | "A";
  name: string;
  Address: {
    street_line: string;
    city_line: string;
  };
  Coordinates?: {
    latitude: number;
    longitude: number;
  };
  Fuels?: StationFuelPrice[];
  LastUpdate?: {
    value: string;
    text: string;
  };
  distance: number;
  Distance: {
    value: number;
    text: string;
  };
}
