import * as base from '../../api/base.api';
import { fetchDeviceStatus } from '../../api/devices.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('devices.api', () => {
  it('fetchDeviceStatus gets /devices', async () => {
    mockedBase.get.mockResolvedValue([{ id: '1', name: 'garden' }]);
    const result = await fetchDeviceStatus();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/devices'));
    expect(result).toEqual([{ id: '1', name: 'garden' }]);
  });
});
