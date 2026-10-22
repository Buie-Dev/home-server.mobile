import {renderHook, act} from '@testing-library/react-native';
import * as meganApi from '../../api/megan.api';

jest.mock('../../api/megan.api');

const mockedApi = meganApi as jest.Mocked<typeof meganApi>;

import useMegan from '../../hooks/useMegan.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useMegan', () => {
  it('starts with empty state', () => {
    const {result} = renderHook(() => useMegan());
    expect(result.current.categories).toEqual([]);
    expect(result.current.ideas).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetchCategories updates state', async () => {
    const cats = [{id: 1, name: 'Dates', subcategories: [], ideaCount: 5}];
    mockedApi.fetchCategories.mockResolvedValue(cats);
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.fetchCategories();
    });
    expect(result.current.categories).toEqual(cats);
  });

  it('createCategory calls API and refetches', async () => {
    mockedApi.createCategory.mockResolvedValue({});
    mockedApi.fetchCategories.mockResolvedValue([]);
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.createCategory('Fun', ['Outdoors']);
    });

    expect(mockedApi.createCategory).toHaveBeenCalledWith('Fun', ['Outdoors']);
    expect(mockedApi.fetchCategories).toHaveBeenCalled();
  });

  it('fetchIdeas updates state with loading', async () => {
    const ideas = [{id: 1, title: 'Picnic', completed: false}];
    mockedApi.fetchIdeas.mockResolvedValue(ideas);
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.fetchIdeas(1);
    });
    expect(result.current.ideas).toEqual(ideas);
    expect(result.current.loading).toBe(false);
  });

  it('createIdea calls API and refetches all ideas', async () => {
    mockedApi.createIdea.mockResolvedValue({});
    mockedApi.fetchIdeas.mockResolvedValue([]);
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.createIdea({title: 'Hike', categoryId: 1});
    });

    expect(mockedApi.createIdea).toHaveBeenCalledWith({
      title: 'Hike',
      categoryId: 1,
    });
    expect(mockedApi.fetchIdeas).toHaveBeenCalled();
  });

  it('updateIdea calls API and refetches ideas', async () => {
    mockedApi.updateIdea.mockResolvedValue({});
    mockedApi.fetchIdeas.mockResolvedValue([]);
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.updateIdea(1, {title: 'Updated', categoryId: 1});
    });

    expect(mockedApi.updateIdea).toHaveBeenCalledWith(1, {
      title: 'Updated',
      categoryId: 1,
    });
    expect(mockedApi.fetchIdeas).toHaveBeenCalled();
  });

  it('toggleIdea updates local state optimistically', async () => {
    mockedApi.fetchIdeas.mockResolvedValue([
      {id: 1, title: 'A', completed: false},
      {id: 2, title: 'B', completed: false},
    ]);
    mockedApi.toggleIdea.mockResolvedValue({});
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.fetchIdeas();
    });
    await act(async () => {
      await result.current.toggleIdea(1, true);
    });

    expect(mockedApi.toggleIdea).toHaveBeenCalledWith(1, true);
    expect(result.current.ideas.find((i: any) => i.id === 1)?.completed).toBe(
      true,
    );
    expect(result.current.ideas.find((i: any) => i.id === 2)?.completed).toBe(
      false,
    );
  });

  it('deleteIdea removes from local state', async () => {
    mockedApi.fetchIdeas.mockResolvedValue([
      {id: 1, title: 'A'},
      {id: 2, title: 'B'},
    ]);
    mockedApi.deleteIdea.mockResolvedValue({});
    const {result} = renderHook(() => useMegan());

    await act(async () => {
      await result.current.fetchIdeas();
    });
    await act(async () => {
      await result.current.deleteIdea(1);
    });

    expect(result.current.ideas).toHaveLength(1);
    expect(result.current.ideas[0].id).toBe(2);
  });
});
