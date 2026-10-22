import axios from 'axios';
import {get, post, put, del} from '../../api/base.api';

jest.mock('axios');
jest.mock('../../lib/tokenStorage', () => ({
  getToken: jest.fn().mockResolvedValue('test-token'),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('base.api', () => {
  describe('get', () => {
    it('calls axios.get with route, params and headers', async () => {
      mockedAxios.get.mockResolvedValue({data: {ok: true}});
      const result = await get('/test', {foo: 'bar'});
      expect(mockedAxios.get).toHaveBeenCalledWith('/test', {
        params: {foo: 'bar'},
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
      });
      expect(result).toEqual({ok: true});
    });
  });

  describe('post', () => {
    it('calls axios.post with route, data and headers', async () => {
      mockedAxios.post.mockResolvedValue({data: {id: 1}});
      const result = await post('/test', {name: 'x'});
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/test',
        {name: 'x'},
        expect.objectContaining({headers: expect.any(Object)}),
      );
      expect(result).toEqual({id: 1});
    });
  });

  describe('put', () => {
    it('calls axios.put with route, data and headers', async () => {
      mockedAxios.put.mockResolvedValue({data: {updated: true}});
      const result = await put('/test/1', {name: 'y'});
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/test/1',
        {name: 'y'},
        expect.objectContaining({headers: expect.any(Object)}),
      );
      expect(result).toEqual({updated: true});
    });
  });

  describe('del', () => {
    it('calls axios.delete with route, data in body and headers', async () => {
      mockedAxios.delete.mockResolvedValue({data: {deleted: true}});
      const result = await del('/test/1', {reason: 'z'});
      expect(mockedAxios.delete).toHaveBeenCalledWith('/test/1', {
        data: {reason: 'z'},
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result).toEqual({deleted: true});
    });
  });
});
