import * as base from '../../api/base.api';
import {
  fetchSchedules, createSchedule, updateSchedule, deleteSchedule, toggleSchedule,
  fetchZones, fetchZoneTypes, checkScheduleSync, forceScheduleSync, reorderSchedules, healthCheck,
} from '../../api/irrigation.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('irrigation.api', () => {
  it('fetchSchedules gets /irrigations/schedules with optional filters', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchSchedules(1, 2);
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/schedules'),
      { zoneId: 1, subzoneId: 2 },
    );
  });

  it('createSchedule puts to /irrigations/schedules', async () => {
    mockedBase.put.mockResolvedValue({ id: 1 });
    const data = { name: 'test', startTime: '08:00', duration: 10, monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false, zoneId: 1 };
    await createSchedule(data);
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/schedules'),
      data,
    );
  });

  it('updateSchedule puts to /irrigations/schedules/:id', async () => {
    mockedBase.put.mockResolvedValue({});
    const data = { name: 'test', startTime: '08:00', duration: 10, monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false, zoneId: 1 };
    await updateSchedule(5, data);
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/schedules/5'),
      data,
    );
  });

  it('deleteSchedule deletes /irrigations/schedules/:id', async () => {
    mockedBase.del.mockResolvedValue({});
    await deleteSchedule(3);
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/irrigations/schedules/3'));
  });

  it('toggleSchedule posts to /irrigations/schedules/:id/toggle', async () => {
    mockedBase.post.mockResolvedValue({});
    await toggleSchedule(2, true);
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/schedules/2/toggle'),
      { active: true },
    );
  });

  it('fetchZones gets /irrigations/zones with optional zoneTypeId', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchZones(3);
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/zones'),
      { zoneTypeId: 3 },
    );
  });

  it('fetchZoneTypes gets /irrigations/zones/types', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchZoneTypes();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/irrigations/zones/types'));
  });

  it('checkScheduleSync gets /irrigations/schedules/sync-status', async () => {
    mockedBase.get.mockResolvedValue({ in_sync: true });
    await checkScheduleSync();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/irrigations/schedules/sync-status'));
  });

  it('forceScheduleSync posts to /irrigations/schedules/sync', async () => {
    mockedBase.post.mockResolvedValue({ synced: 3 });
    await forceScheduleSync();
    expect(mockedBase.post).toHaveBeenCalledWith(expect.stringContaining('/irrigations/schedules/sync'), {});
  });

  it('reorderSchedules puts to /irrigations/schedules/reorder', async () => {
    mockedBase.put.mockResolvedValue({});
    await reorderSchedules([3, 1, 2]);
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/irrigations/schedules/reorder'),
      { ids: [3, 1, 2] },
    );
  });

  it('healthCheck gets base API url', async () => {
    mockedBase.get.mockResolvedValue({ status: 'ok' });
    await healthCheck();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('http'));
  });
});
