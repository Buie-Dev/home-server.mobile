import {renderHook, act, waitFor} from '@testing-library/react-native';
import {mockWebSocketValue, resetWebSocketMock} from '../helpers';
import * as devicesApi from '../../api/devices.api';

jest.mock('../../api/devices.api');

const mockedApi = devicesApi as jest.Mocked<typeof devicesApi>;

import useDevices from '../../hooks/useDevices.hook';

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  resetWebSocketMock();
});

afterEach(() => {
  jest.useRealTimers();
});

const mockDevices = [
  {
    id: 'garden-controller',
    name: 'Garden',
    description: 'RPi Zero',
    type: 'raspberry_pi',
    healthCheckResponse: 'garden-controller',
  },
  {
    id: 'irrigation-controller',
    name: 'Irrigation',
    description: 'RPi',
    type: 'raspberry_pi',
    healthCheckResponse: 'irrigation-controller',
  },
];

describe('useDevices', () => {
  it('starts with empty devices and not loading', () => {
    const {result} = renderHook(() => useDevices());
    expect(result.current.devices).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetchDevices loads devices with checking status', async () => {
    mockedApi.fetchDeviceStatus.mockResolvedValue(mockDevices);
    const {result} = renderHook(() => useDevices());

    await act(async () => {
      await result.current.fetchDevices();
    });

    expect(result.current.devices).toHaveLength(2);
    expect(result.current.devices[0].status).toBe('checking');
    expect(result.current.devices[0].lastChecked).toBeNull();
  });

  it('fetchDevices sets empty array on error', async () => {
    mockedApi.fetchDeviceStatus.mockRejectedValue(new Error('fail'));
    const {result} = renderHook(() => useDevices());

    await act(async () => {
      await result.current.fetchDevices();
    });

    expect(result.current.devices).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('checkConnectivity sends healthcheck/request via WebSocket', async () => {
    mockedApi.fetchDeviceStatus.mockResolvedValue(mockDevices);
    const {result} = renderHook(() => useDevices());
    await act(async () => {
      await result.current.fetchDevices();
    });

    act(() => {
      result.current.checkConnectivity();
    });

    expect(mockWebSocketValue.sendMessage).toHaveBeenCalledWith(
      'healthcheck/request',
      {},
    );
  });

  it('checkConnectivity does nothing when not connected', async () => {
    mockWebSocketValue.isConnected = false;
    mockedApi.fetchDeviceStatus.mockResolvedValue(mockDevices);
    const {result} = renderHook(() => useDevices());
    await act(async () => {
      await result.current.fetchDevices();
    });

    act(() => {
      result.current.checkConnectivity();
    });

    expect(mockWebSocketValue.sendMessage).not.toHaveBeenCalled();
  });

  it('checkConnectivity does nothing when no devices loaded', async () => {
    const {result} = renderHook(() => useDevices());
    act(() => {
      result.current.checkConnectivity();
    });
    expect(mockWebSocketValue.sendMessage).not.toHaveBeenCalled();
  });

  it('marks unresponsive devices as offline after 5 second timeout', async () => {
    mockedApi.fetchDeviceStatus.mockResolvedValue(mockDevices);
    const {result} = renderHook(() => useDevices());
    await act(async () => {
      await result.current.fetchDevices();
    });

    act(() => {
      result.current.checkConnectivity();
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.devices[0].status).toBe('offline');
    expect(result.current.devices[1].status).toBe('offline');
  });
});
