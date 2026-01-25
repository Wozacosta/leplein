"use client";

import { useState, useCallback, useEffect } from "react";

function getStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    // Clear corrupted value from localStorage
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  // Start with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with localStorage after hydration - this is intentional to read
  // client-side state after SSR, not causing cascading renders.
  useEffect(() => {
    setStoredValue(getStoredValue(key, initialValue));
    setIsHydrated(true);
    // Only run on mount - key and initialValue should not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  // Return initialValue until hydrated to prevent flash
  return [isHydrated ? storedValue : initialValue, setValue];
}
