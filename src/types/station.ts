export interface StationFuelPrice {
  id: number;
  name: string;
  short_name: string;
  type: 'D' | 'E' | 'G';
  picto: string;
  Update: {
    value: string;
    text: string;
  };
  rupture: boolean;
  Price: {
    value: number;
    text: string;
  };
}

export interface Station {
  id: number;
  Brand: {
    id: number;
    name: string;
    short_name: string;
    nb_stations: number;
  };
  type: 'R' | 'A';
  name: string;
  Address: {
    street_line: string;
    city_line: string;
  };
  Fuels: StationFuelPrice[];
  LastUpdate: {
    value: string;
    text: string;
  };
  Distance: {
    value: number;
    text: string;
  };
}
