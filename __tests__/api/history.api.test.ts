import * as base from '../../api/base.api';
import { fetchHistory, fetchHistoryTotals, deleteHistory } from '../../api/history.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('history.api', () => {
  it('fetchHistory gets /irrigations/history with pagination and filter params', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchHistory({ limit: 100, offset: 0, zoneId: 1, startDate: '2026-01-01' });
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/history'),
      { limit: 100, offset: 0, zoneId: 1, startDate: '2026-01-01' },
    );
  });

  it('fetchHistory works without params', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchHistory();
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/history'),
      undefined,
    );
  });

  it('fetchHistoryTotals gets /irrigations/history/totals with filter params', async () => {
    mockedBase.get.mockResolvedValue({ today: {}, week: {}, month: {} });
    await fetchHistoryTotals({ zoneId: 2, subzoneId: 3 });
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/history/totals'),
      { zoneId: 2, subzoneId: 3 },
    );
  });

  it('deleteHistory deletes /irrigations/history/:id', async () => {
    mockedBase.del.mockResolvedValue({});
    await deleteHistory(42);
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/irrigations/history/42'));
  });
});
