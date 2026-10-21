import React from 'react';
import {renderHook, act, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UnitProvider, useUnit} from '../../context/UnitContext';

const wrapper = ({children}: {children: React.ReactNode}) => (
  <UnitProvider>{children}</UnitProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UnitContext', () => {
  it('defaults to litres (useGallons = false)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const {result} = renderHook(() => useUnit(), {wrapper});
    await waitFor(() => {
      expect(result.current.useGallons).toBe(false);
    });
  });

  it('loads gallons preference from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('gallons');
    const {result} = renderHook(() => useUnit(), {wrapper});
    await waitFor(() => {
      expect(result.current.useGallons).toBe(true);
    });
  });

  it('toggleUnit switches from litres to gallons and persists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const {result} = renderHook(() => useUnit(), {wrapper});
    await waitFor(() => expect(result.current.useGallons).toBe(false));

    act(() => {
      result.current.toggleUnit();
    });

    expect(result.current.useGallons).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'unit_preference',
      'gallons',
    );
  });

  it('toggleUnit switches from gallons to litres and persists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('gallons');
    const {result} = renderHook(() => useUnit(), {wrapper});
    await waitFor(() => expect(result.current.useGallons).toBe(true));

    act(() => {
      result.current.toggleUnit();
    });

    expect(result.current.useGallons).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'unit_preference',
      'litres',
    );
  });
});
