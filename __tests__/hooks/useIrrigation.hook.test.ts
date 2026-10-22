import {renderHook, act, waitFor} from '@testing-library/react-native';
import {mockWebSocketValue, resetWebSocketMock} from '../helpers';
import * as irrigationApi from '../../api/irrigation.api';

jest.mock('../../api/irrigation.api');

const mockedApi = irrigationApi as jest.Mocked<typeof irrigationApi>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  resetWebSocketMock();
  mockedApi.fetchZones.mockResolvedValue([]);
  mockedApi.healthCheck.mockResolvedValue({});
});

afterEach(() => {
  jest.useRealTimers();
});

// Import after mocks are set up
import useIrrigation from '../../hooks/useIrrigation.hook';

// Helper to render hook and wait for mount effects (fetchZones, healthCheck) to settle
const renderAndWaitForMount = async () => {
  const hook = renderHook(() => useIrrigation());
  await waitFor(() => {
    expect(mockedApi.fetchZones).toHaveBeenCalled();
  });
  return hook;
};

describe('useIrrigation', () => {
  it('fetches zones and runs health check on mount', async () => {
    renderHook(() => useIrrigation());
    await waitFor(() => {
      expect(mockedApi.fetchZones).toHaveBeenCalled();
      expect(mockedApi.healthCheck).toHaveBeenCalled();
    });
  });

  it('sets connected to true when health check succeeds', async () => {
    mockedApi.healthCheck.mockResolvedValue({});
    const {result} = renderHook(() => useIrrigation());
    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });
  });

  it('sets connected to false when health check fails', async () => {
    mockedApi.healthCheck.mockRejectedValue(new Error('timeout'));
    const {result} = renderHook(() => useIrrigation());
    await waitFor(() => {
      expect(result.current.connected).toBe(false);
    });
  });

  it('runs health check every 60 seconds', async () => {
    mockedApi.healthCheck.mockResolvedValue({});
    renderHook(() => useIrrigation());
    await waitFor(() => expect(mockedApi.healthCheck).toHaveBeenCalledTimes(1));

    act(() => {
      jest.advanceTimersByTime(60000);
    });
    await waitFor(() => expect(mockedApi.healthCheck).toHaveBeenCalledTimes(2));
  });

  it('fetchSchedules calls API and updates state', async () => {
    const schedules = [{id: 1, name: 'Morning', zoneName: 'Front'}];
    mockedApi.fetchSchedules.mockResolvedValue(schedules);
    const {result} = await renderAndWaitForMount();

    await act(async () => {
      await result.current.fetchSchedules(1);
    });

    expect(mockedApi.fetchSchedules).toHaveBeenCalledWith(1, undefined);
    expect(result.current.schedules).toEqual(schedules);
  });

  it('createSchedule calls API', async () => {
    mockedApi.createSchedule.mockResolvedValue({});
    const {result} = await renderAndWaitForMount();
    const data = {
      name: 'test',
      startTime: '08:00',
      duration: 10,
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      zoneId: 1,
    };

    await act(async () => {
      await result.current.createSchedule(data);
    });

    expect(mockedApi.createSchedule).toHaveBeenCalledWith(data);
  });

  it('toggleSchedule calls API and refetches schedules', async () => {
    mockedApi.toggleSchedule.mockResolvedValue({});
    mockedApi.fetchSchedules.mockResolvedValue([]);
    const {result} = await renderAndWaitForMount();

    await act(async () => {
      await result.current.toggleSchedule(1, true);
    });

    expect(mockedApi.toggleSchedule).toHaveBeenCalledWith(1, true);
    expect(mockedApi.fetchSchedules).toHaveBeenCalled();
  });

  it('stopAll sends WebSocket message', async () => {
    const {result} = await renderAndWaitForMount();
    act(() => {
      result.current.stopAll();
    });
    expect(mockWebSocketValue.sendMessage).toHaveBeenCalledWith('stopAll', {});
  });

  it('stopQueueItem sends WebSocket message with id', async () => {
    const {result} = await renderAndWaitForMount();
    act(() => {
      result.current.stopQueueItem('abc');
    });
    expect(mockWebSocketValue.sendMessage).toHaveBeenCalledWith('stop', {
      id: 'abc',
    });
  });

  it('checkSync returns sync status from API', async () => {
    const syncStatus = {
      in_sync: true,
      missing_from_automation: [],
      mismatched: [],
      extra_in_automation: [],
    };
    mockedApi.checkScheduleSync.mockResolvedValue(syncStatus);
    const {result} = await renderAndWaitForMount();

    let status;
    await act(async () => {
      status = await result.current.checkSync();
    });

    expect(status).toEqual(syncStatus);
  });

  it('checkSync returns null on error', async () => {
    mockedApi.checkScheduleSync.mockRejectedValue(new Error('fail'));
    const {result} = await renderAndWaitForMount();

    let status;
    await act(async () => {
      status = await result.current.checkSync();
    });

    expect(status).toBeNull();
  });

  it('formats zones from WebSocket states and zone details', async () => {
    const zoneDetails = [
      {
        id: 1,
        name: 'Front Lawn',
        zone: 1,
        type: 'lawn',
        subzones: [{id: 10, name: 'Left', subzone: 1}],
      },
      {id: 2, name: 'Garden', zone: 2, type: 'garden'},
    ];
    mockedApi.fetchZones.mockResolvedValue(zoneDetails);
    mockWebSocketValue.latestCurrentStates = [
      {id: 1, state: true, subzones: [{id: 1, state: false}]},
      {id: 2, state: false},
    ];

    const {result} = renderHook(() => useIrrigation());
    await waitFor(() => {
      expect(result.current.zones.length).toBe(2);
    });

    expect(result.current.zones[0].name).toBe('Front Lawn');
    expect(result.current.zones[0].state).toBe(true);
    expect(result.current.zones[0].subzones?.[0].name).toBe('Left');
    expect(result.current.zones[0].subzones?.[0].state).toBe(false);
    expect(result.current.zones[1].state).toBe(false);
  });

  it('formats queue from WebSocket states and zone details', async () => {
    const zoneDetails = [
      {
        id: 1,
        name: 'Front Lawn',
        zone: 1,
        type: 'lawn',
        subzones: [{id: 10, name: 'Left', subzone: 1}],
      },
    ];
    mockedApi.fetchZones.mockResolvedValue(zoneDetails);
    mockWebSocketValue.latestCurrentQueueStates = [
      {
        id: 'q1',
        duration: 300,
        zone: 1,
        priority: 1,
        start_time: '1000',
        subzones: [{id: 1, state: true}],
      },
    ];

    const {result} = renderHook(() => useIrrigation());
    await waitFor(() => {
      expect(result.current.priorityQueue.length).toBe(1);
    });

    expect(result.current.priorityQueue[0].name).toBe('Front Lawn');
    expect(result.current.priorityQueue[0].startTime).toBe(1000);
    expect(result.current.priorityQueue[0].subZones?.[0].name).toBe('Left');
  });

  it('returns empty zones when no zone details loaded', async () => {
    mockedApi.fetchZones.mockResolvedValue([]);
    mockWebSocketValue.latestCurrentStates = [{id: 1, state: true}];

    const {result} = renderHook(() => useIrrigation());
    await waitFor(() => {
      expect(result.current.zones).toEqual([]);
    });
  });
});
