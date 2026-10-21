import {renderHook, act} from '@testing-library/react-native';
import * as eventsApi from '../../api/events.api';

jest.mock('../../api/events.api');

const mockedApi = eventsApi as jest.Mocked<typeof eventsApi>;

import useEvents from '../../hooks/useEvents.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useEvents', () => {
  it('starts with empty state', () => {
    const {result} = renderHook(() => useEvents());
    expect(result.current.events).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetchEvents stores filters and updates state', async () => {
    const events = [{id: 1, title: 'Birthday'}];
    mockedApi.fetchEvents.mockResolvedValue(events);
    const {result} = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents({month: 10, year: 2026});
    });

    expect(mockedApi.fetchEvents).toHaveBeenCalledWith(
      expect.objectContaining({month: 10, year: 2026}),
    );
    expect(result.current.events).toEqual(events);
  });

  it('createEvent calls API and refetches events', async () => {
    mockedApi.createEvent.mockResolvedValue({});
    mockedApi.fetchEvents.mockResolvedValue([]);
    const {result} = renderHook(() => useEvents());

    await act(async () => {
      await result.current.createEvent({
        data: {title: 'Party', date: '2026-12-25', categoryId: 1},
      });
    });

    expect(mockedApi.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({title: 'Party'}),
    );
    expect(mockedApi.fetchEvents).toHaveBeenCalled();
  });

  it('deleteEvent removes from local state without refetch', async () => {
    mockedApi.fetchEvents.mockResolvedValue([
      {id: 1, title: 'A'},
      {id: 2, title: 'B'},
    ]);
    mockedApi.deleteEvent.mockResolvedValue({});
    const {result} = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents();
    });
    await act(async () => {
      await result.current.deleteEvent({id: 1});
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe(2);
  });

  it('createCategory calls API and refetches categories', async () => {
    mockedApi.createCategory.mockResolvedValue({});
    mockedApi.fetchCategories.mockResolvedValue([]);
    const {result} = renderHook(() => useEvents());

    await act(async () => {
      await result.current.createCategory({name: 'Work', subcategoryNames: []});
    });

    expect(mockedApi.createCategory).toHaveBeenCalledWith({
      name: 'Work',
      subcategoryNames: [],
    });
    expect(mockedApi.fetchCategories).toHaveBeenCalled();
  });

  it('createSubcategory calls API and refetches categories', async () => {
    mockedApi.createSubcategory.mockResolvedValue({});
    mockedApi.fetchCategories.mockResolvedValue([]);
    const {result} = renderHook(() => useEvents());

    await act(async () => {
      await result.current.createSubcategory({categoryId: 1, name: 'Meetings'});
    });

    expect(mockedApi.createSubcategory).toHaveBeenCalledWith({
      categoryId: 1,
      name: 'Meetings',
    });
  });
});
