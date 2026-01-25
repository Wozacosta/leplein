export const API_BASE = 'https://api.prix-carburants.2aaz.fr';

export const endpoints = {
  stationsAround: (lat: number, lng: number) =>
    `${API_BASE}/stations/around/${lat},${lng}`,
  fuels: () => `${API_BASE}/fuels/`,
  station: (id: number) => `${API_BASE}/station/${id}`,
};
