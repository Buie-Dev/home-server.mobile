import { renderHook, act } from '@testing-library/react-native';
import * as peopleApi from '../../api/people.api';

jest.mock('../../api/people.api');

const mockedApi = peopleApi as jest.Mocked<typeof peopleApi>;

import usePeople from '../../hooks/usePeople.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePeople', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => usePeople());
    expect(result.current.people).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.ideas).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetchPeople updates state', async () => {
    mockedApi.fetchPeople.mockResolvedValue([{ id: 1, name: 'Alice' }]);
    const { result } = renderHook(() => usePeople());

    await act(async () => { await result.current.fetchPeople(); });
    expect(result.current.people).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('addPerson creates and refetches', async () => {
    mockedApi.createPerson.mockResolvedValue({});
    mockedApi.fetchPeople.mockResolvedValue([]);
    const { result } = renderHook(() => usePeople());

    await act(async () => { await result.current.addPerson({ name: 'Bob' }); });

    expect(mockedApi.createPerson).toHaveBeenCalledWith({ name: 'Bob' });
    expect(mockedApi.fetchPeople).toHaveBeenCalled();
  });

  it('fetchCategories requires personId', async () => {
    mockedApi.fetchCategories.mockResolvedValue([{ id: 1, name: 'Gifts' }]);
    const { result } = renderHook(() => usePeople());

    await act(async () => { await result.current.fetchCategories({ personId: 5 }); });

    expect(mockedApi.fetchCategories).toHaveBeenCalledWith({ personId: 5 });
  });

  it('createCategory calls API with personId and refetches', async () => {
    mockedApi.createCategory.mockResolvedValue({});
    mockedApi.fetchCategories.mockResolvedValue([]);
    const { result } = renderHook(() => usePeople());

    await act(async () => {
      await result.current.createCategory({ personId: 1, name: 'Gifts', subcategoryNames: ['Birthday'] });
    });

    expect(mockedApi.createCategory).toHaveBeenCalledWith({
      personId: 1, name: 'Gifts', subcategoryNames: ['Birthday'],
    });
  });

  it('fetchIdeas loads ideas for a person with filters', async () => {
    mockedApi.fetchIdeas.mockResolvedValue([{ id: 1, title: 'Book' }]);
    const { result } = renderHook(() => usePeople());

    await act(async () => { await result.current.fetchIdeas({ personId: 1, categoryId: 2 }); });

    expect(mockedApi.fetchIdeas).toHaveBeenCalledWith({ personId: 1, categoryId: 2, subcategoryId: undefined });
    expect(result.current.ideas).toEqual([{ id: 1, title: 'Book' }]);
  });

  it('deleteIdea removes from local state', async () => {
    mockedApi.fetchIdeas.mockResolvedValue([
      { id: 1, title: 'A' },
      { id: 2, title: 'B' },
    ]);
    mockedApi.deleteIdea.mockResolvedValue({});
    const { result } = renderHook(() => usePeople());

    await act(async () => { await result.current.fetchIdeas({ personId: 1 }); });
    await act(async () => { await result.current.deleteIdea({ personId: 1, id: 1 }); });

    expect(result.current.ideas).toHaveLength(1);
    expect(result.current.ideas[0].id).toBe(2);
  });
});
