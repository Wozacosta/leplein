'use client';

import { useGeolocation } from '@/contexts/GeolocationContext';

export function LocationPrompt() {
  const { status, error, requestPermission } = useGeolocation();

  if (status === 'granted') {
    return null;
  }

  if (status === 'requesting') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" />
        <p className="text-gray-600">Recherche de votre position...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="p-4 mb-4 bg-blue-100 rounded-full">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Trouvez le carburant le moins cher
      </h2>

      <p className="mb-6 text-gray-600">
        {error || 'Autorisez l\'accès à votre position pour voir les stations à proximité'}
      </p>

      <button
        onClick={requestPermission}
        className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800"
      >
        {status === 'denied' ? 'Réessayer' : 'Activer la géolocalisation'}
      </button>

      {status === 'denied' && (
        <p className="mt-4 text-sm text-gray-500">
          Vous pouvez aussi autoriser la géolocalisation dans les paramètres de votre navigateur
        </p>
      )}
    </div>
  );
}
