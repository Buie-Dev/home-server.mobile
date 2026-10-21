import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, setToken, clearToken } from '../../lib/tokenStorage';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tokenStorage', () => {
  it('getToken reads from AsyncStorage with auth_token key', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('abc123');
    const token = await getToken();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
    expect(token).toBe('abc123');
  });

  it('getToken returns null when no token stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const token = await getToken();
    expect(token).toBeNull();
  });

  it('setToken writes to AsyncStorage with auth_token key', async () => {
    await setToken('xyz789');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'xyz789');
  });

  it('clearToken removes from AsyncStorage with auth_token key', async () => {
    await clearToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });
});
