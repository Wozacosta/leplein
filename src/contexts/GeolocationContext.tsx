'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

import type { ReactNode } from 'react';
import type { Coordinates, GeolocationStatus } from '@/types/geolocation';

interface GeolocationContextValue {
  coordinates: Coordinates | null;
  status: GeolocationStatus;
  error: string | null;
  requestPermission: () => void;
}

const GeolocationContext = createContext<GeolocationContextValue | null>(null);

interface GeolocationProviderProps {
  children: ReactNode;
}

export function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus('granted');
        setError(null);
      },
      (err) => {
        setStatus('denied');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Vous avez refusé l\'accès à votre position');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position non disponible');
            break;
          case err.TIMEOUT:
            setError('Délai d\'attente dépassé');
            break;
          default:
            setError('Erreur de géolocalisation');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  // Auto-request on mount if permission was previously granted
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestPermission();
        }
      });
    }
  }, [requestPermission]);

  return (
    <GeolocationContext.Provider value={{ coordinates, status, error, requestPermission }}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation(): GeolocationContextValue {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
}
