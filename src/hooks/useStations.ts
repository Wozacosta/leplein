import useSWR from 'swr';

import { endpoints } from '@/lib/api';
import { fetcher } from '@/lib/fetcher';

import type { Station } from '@/types/station';

export function useStations(lat: number | null, lng: number | null) {
  const url = lat && lng ? endpoints.stationsAround(lat, lng) : null;

  return useSWR<Station[]>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}
