import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'unit_preference';

interface UnitContextValue {
  useGallons: boolean;
  toggleUnit: () => void;
}

const UnitContext = createContext<UnitContextValue>({ useGallons: false, toggleUnit: () => {} });

export const UnitProvider = ({ children }: { children: React.ReactNode }) => {
  const [useGallons, setUseGallons] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val === 'gallons') setUseGallons(true);
    });
  }, []);

  const toggleUnit = useCallback(() => {
    setUseGallons(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'gallons' : 'litres');
      return next;
    });
  }, []);

  return (
    <UnitContext.Provider value={{ useGallons, toggleUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => useContext(UnitContext);
