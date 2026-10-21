import {renderHook, act} from '@testing-library/react-native';
import {mockWebSocketValue, resetWebSocketMock} from '../helpers';
import * as rowingApi from '../../api/rowing.api';

jest.mock('../../api/rowing.api');

const mockedApi = rowingApi as jest.Mocked<typeof rowingApi>;

import {useRowing} from '../../hooks/useRowing.hook';

beforeEach(() => {
  jest.clearAllMocks();
  resetWebSocketMock();
});

describe('useRowing', () => {
  it('starts with empty state', () => {
    const {result} = renderHook(() => useRowing());
    expect(result.current.boatClasses).toEqual([]);
    expect(result.current.crewMembers).toEqual([]);
    expect(result.current.boats).toEqual([]);
    expect(result.current.crews).toEqual([]);
    expect(result.current.races).toEqual([]);
    expect(result.current.activeRace).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetchAllBoatClasses updates state', async () => {
    const classes = [{id: 1, symbol: '1x', crewCount: 1, hasCox: false}];
    mockedApi.fetchBoatClasses.mockResolvedValue(classes);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.fetchAllBoatClasses();
    });
    expect(result.current.boatClasses).toEqual(classes);
  });

  it('fetchAllBoatClasses sets error on failure', async () => {
    mockedApi.fetchBoatClasses.mockRejectedValue(new Error('fail'));
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.fetchAllBoatClasses();
    });
    expect(result.current.error).toBe('Failed to load boat classes');
  });

  it('addCrewMember creates and refetches', async () => {
    mockedApi.createCrewMember.mockResolvedValue({id: 1});
    mockedApi.fetchCrewMembers.mockResolvedValue([
      {id: 1, name: 'Alice', gender: 'Women', createdAt: '2026-01-01'},
    ]);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.addCrewMember({name: 'Alice', gender: 'Women'});
    });

    expect(mockedApi.createCrewMember).toHaveBeenCalledWith({
      name: 'Alice',
      gender: 'Women',
    });
    expect(result.current.crewMembers).toHaveLength(1);
  });

  it('removeBoat deletes and refetches', async () => {
    mockedApi.deleteBoat.mockResolvedValue({success: true});
    mockedApi.fetchBoats.mockResolvedValue([]);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.removeBoat({id: 1});
    });

    expect(mockedApi.deleteBoat).toHaveBeenCalledWith({id: 1});
    expect(mockedApi.fetchBoats).toHaveBeenCalled();
  });

  it('startRace creates race and returns id', async () => {
    mockedApi.createRace.mockResolvedValue({id: 42});
    const {result} = renderHook(() => useRowing());

    let id: number = 0;
    await act(async () => {
      id = await result.current.startRace({
        distance: '2000m',
        raceType: 'time_trial',
        crewIds: [1, 2],
      });
    });

    expect(id).toBe(42);
  });

  it('finishRace completes and reloads race', async () => {
    mockedApi.completeRace.mockResolvedValue({success: true});
    mockedApi.fetchRace.mockResolvedValue({id: 1, status: 'completed'} as any);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.finishRace({id: 1});
    });

    expect(mockedApi.completeRace).toHaveBeenCalledWith({id: 1});
    expect(mockedApi.fetchRace).toHaveBeenCalledWith({id: 1});
  });

  it('sendBoatStart records start, sends WebSocket message, and reloads race', async () => {
    mockedApi.recordEntryStart.mockResolvedValue({success: true});
    mockedApi.fetchRace.mockResolvedValue({id: 1, entries: []} as any);
    const {result} = renderHook(() => useRowing());

    // Set active race first
    mockedApi.fetchRace.mockResolvedValue({id: 1, entries: []} as any);
    await act(async () => {
      await result.current.loadRace({id: 1});
    });

    await act(async () => {
      await result.current.sendBoatStart({
        raceId: 1,
        entryId: 5,
        boatName: 'Shell A',
        timestamp: 1000,
      });
    });

    expect(mockedApi.recordEntryStart).toHaveBeenCalledWith({
      entryId: 5,
      startTime: 1000,
    });
    expect(mockWebSocketValue.sendMessage).toHaveBeenCalledWith(
      'rowing/start',
      {raceId: 1, entryId: 5, boatName: 'Shell A', timestamp: 1000},
    );
  });

  it('sendBoatFinish records finish with elapsed time', async () => {
    mockedApi.recordEntryFinish.mockResolvedValue({success: true});
    mockedApi.fetchRace.mockResolvedValue({id: 1, entries: []} as any);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.loadRace({id: 1});
    });
    await act(async () => {
      await result.current.sendBoatFinish({
        raceId: 1,
        entryId: 5,
        boatName: 'Shell A',
        timestamp: 2000,
        elapsedMs: 1000,
      });
    });

    expect(mockedApi.recordEntryFinish).toHaveBeenCalledWith({
      entryId: 5,
      finishTime: 2000,
      elapsedMs: 1000,
    });
  });

  it('setEntryDns marks entry and reloads active race', async () => {
    mockedApi.markEntryDns.mockResolvedValue({success: true});
    mockedApi.fetchRace.mockResolvedValue({id: 1, entries: []} as any);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.loadRace({id: 1});
    });
    await act(async () => {
      await result.current.setEntryDns({entryId: 3});
    });

    expect(mockedApi.markEntryDns).toHaveBeenCalledWith({entryId: 3});
  });

  it('removeEntry deletes entry and reloads active race', async () => {
    mockedApi.deleteEntry.mockResolvedValue({success: true});
    mockedApi.fetchRace.mockResolvedValue({id: 1, entries: []} as any);
    const {result} = renderHook(() => useRowing());

    await act(async () => {
      await result.current.loadRace({id: 1});
    });
    await act(async () => {
      await result.current.removeEntry({entryId: 7});
    });

    expect(mockedApi.deleteEntry).toHaveBeenCalledWith({entryId: 7});
  });

  it('editCrew returns copied status from API', async () => {
    mockedApi.updateCrew.mockResolvedValue({id: 1, copied: true});
    mockedApi.fetchCrews.mockResolvedValue([]);
    const {result} = renderHook(() => useRowing());

    const seats = {
      cox: null,
      seat1: 1,
      seat2: null,
      seat3: null,
      seat4: null,
      seat5: null,
      seat6: null,
      seat7: null,
      seat8: null,
    };
    let res: {copied: boolean} = {copied: false};
    await act(async () => {
      res = await result.current.editCrew({
        id: 1,
        boatId: 1,
        gender: 'Men',
        ageCategory: 'Open',
        ...seats,
      });
    });

    expect(res.copied).toBe(true);
  });
});
