import * as base from '../../api/base.api';
import { loginRequest, fetchMyPermissions, fetchAllUsers, setUserPermissions, createUser, deleteUser } from '../../api/auth.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth.api', () => {
  it('loginRequest posts to /auth/login with credentials', async () => {
    mockedBase.post.mockResolvedValue({ token: 'jwt123' });
    const result = await loginRequest('user', 'pass');
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      { username: 'user', password: 'pass' },
    );
    expect(result).toEqual({ token: 'jwt123' });
  });

  it('fetchMyPermissions gets from /auth/me/permissions', async () => {
    mockedBase.get.mockResolvedValue({ user_id: 1, pages: ['irrigation'] });
    const result = await fetchMyPermissions();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/auth/me/permissions'));
    expect(result).toEqual({ user_id: 1, pages: ['irrigation'] });
  });

  it('fetchAllUsers gets from /admin/users', async () => {
    mockedBase.get.mockResolvedValue([{ id: 1, username: 'admin' }]);
    await fetchAllUsers();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/admin/users'));
  });

  it('setUserPermissions puts to /admin/users/:id/permissions', async () => {
    mockedBase.put.mockResolvedValue(undefined);
    await setUserPermissions(1, { irrigation: true });
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/1/permissions'),
      { irrigation: true },
    );
  });

  it('createUser posts to /admin/users', async () => {
    mockedBase.post.mockResolvedValue({ id: 2, username: 'new' });
    await createUser({ username: 'new', password: 'pass' });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users'),
      { username: 'new', password: 'pass' },
    );
  });

  it('deleteUser deletes /admin/users/:id', async () => {
    mockedBase.del.mockResolvedValue(undefined);
    await deleteUser({ userId: 3 });
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/admin/users/3'));
  });
});
