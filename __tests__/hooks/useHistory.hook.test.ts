import {renderHook, act} from '@testing-library/react-native';
import * as historyApi from '../../api/history.api';

jest.mock('../../api/history.api');

const mockedApi = historyApi as jest.Mocked<typeof historyApi>;

import useHistory from '../../hooks/useHistory.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

const makeTotals = () => ({
  today: {litres: 10, minutes: 5, runs: 1},
  week: {litres: 50, minutes: 25, runs: 5},
  month: {litres: 200, minutes: 100, runs: 20},
});

describe('useHistory', () => {
  it('starts with empty state', () => {
    const {result} = renderHook(() => useHistory());
    expect(result.current.history).toEqual([]);
    expect(result.current.totals).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(true);
  });

  it('fetchHistory fetches history and totals in parallel', async () => {
    const rows = [{id: 1, zoneName: 'Front'}];
    const totals = makeTotals();
    mockedApi.fetchHistory.mockResolvedValue(rows);
    mockedApi.fetchHistoryTotals.mockResolvedValue(totals);

    const {result} = renderHook(() => useHistory());

    await act(async () => {
      await result.current.fetchHistory({zoneId: 1});
    });

    expect(mockedApi.fetchHistory).toHaveBeenCalledWith({
      limit: 100,
      offset: 0,
      zoneId: 1,
    });
    expect(mockedApi.fetchHistoryTotals).toHaveBeenCalledWith({
      zoneId: 1,
      subzoneId: undefined,
    });
    expect(result.current.history).toEqual(rows);
    expect(result.current.totals).toEqual(totals);
  });

  it('sets hasMore to true when page is full', async () => {
    const fullPage = Array.from({length: 100}, (_, i) => ({id: i}));
    mockedApi.fetchHistory.mockResolvedValue(fullPage);
    mockedApi.fetchHistoryTotals.mockResolvedValue(makeTotals());

    const {result} = renderHook(() => useHistory());
    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(result.current.hasMore).toBe(true);
  });

  it('sets hasMore to false when page is not full', async () => {
    mockedApi.fetchHistory.mockResolvedValue([{id: 1}]);
    mockedApi.fetchHistoryTotals.mockResolvedValue(makeTotals());

    const {result} = renderHook(() => useHistory());
    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore appends next page with correct offset', async () => {
    const page1 = Array.from({length: 100}, (_, i) => ({id: i}));
    const page2 = [{id: 100}, {id: 101}];
    mockedApi.fetchHistory.mockResolvedValueOnce(page1);
    mockedApi.fetchHistoryTotals.mockResolvedValue(makeTotals());

    const {result} = renderHook(() => useHistory());
    await act(async () => {
      await result.current.fetchHistory();
    });

    mockedApi.fetchHistory.mockResolvedValueOnce(page2);
    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockedApi.fetchHistory).toHaveBeenLastCalledWith(
      expect.objectContaining({limit: 100, offset: 100}),
    );
    expect(result.current.history).toHaveLength(102);
  });

  it('loadMore does nothing when hasMore is false', async () => {
    mockedApi.fetchHistory.mockResolvedValue([{id: 1}]);
    mockedApi.fetchHistoryTotals.mockResolvedValue(makeTotals());

    const {result} = renderHook(() => useHistory());
    await act(async () => {
      await result.current.fetchHistory();
    });

    jest.clearAllMocks();
    await act(async () => {
      await result.current.loadMore();
    });
    expect(mockedApi.fetchHistory).not.toHaveBeenCalled();
  });

  it('deleteHistory removes item locally and refetches totals', async () => {
    const rows = [{id: 1}, {id: 2}, {id: 3}];
    mockedApi.fetchHistory.mockResolvedValue(rows);
    mockedApi.fetchHistoryTotals.mockResolvedValue(makeTotals());
    mockedApi.deleteHistory.mockResolvedValue({});

    const {result} = renderHook(() => useHistory());
    await act(async () => {
      await result.current.fetchHistory();
    });

    await act(async () => {
      await result.current.deleteHistory(2);
    });

    expect(mockedApi.deleteHistory).toHaveBeenCalledWith(2);
    expect(result.current.history).toHaveLength(2);
    expect(result.current.history.find((r: any) => r.id === 2)).toBeUndefined();
  });

  it('fetchHistory resets to empty on error', async () => {
    mockedApi.fetchHistory.mockRejectedValue(new Error('fail'));
    mockedApi.fetchHistoryTotals.mockRejectedValue(new Error('fail'));

    const {result} = renderHook(() => useHistory());
    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
