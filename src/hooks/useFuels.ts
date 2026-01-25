import useSWR from 'swr';

import { endpoints } from '@/lib/api';
import { fetcher } from '@/lib/fetcher';

import type { Fuel } from '@/types/fuel';

export function useFuels() {
  return useSWR<Fuel[]>(endpoints.fuels(), fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000, // 1 hour - reference data rarely changes
  });
}
