import * as base from '../../api/base.api';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../../api/events.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('events.api', () => {
  it('fetchEvents gets /events with filter params', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchEvents({categoryId: 1, month: 10, year: 2026});
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/events'),
      {categoryId: 1, subcategoryId: undefined, month: 10, year: 2026},
    );
  });

  it('createEvent posts to /events', async () => {
    mockedBase.post.mockResolvedValue({});
    await createEvent({title: 'Birthday', date: '2026-10-21', categoryId: 1});
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/events'),
      expect.objectContaining({title: 'Birthday'}),
    );
  });

  it('updateEvent puts to /events/:id', async () => {
    mockedBase.put.mockResolvedValue({});
    await updateEvent({
      id: 5,
      data: {title: 'Updated', date: '2026-10-22', categoryId: 1},
    });
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/events/5'),
      expect.objectContaining({title: 'Updated'}),
    );
  });

  it('deleteEvent deletes /events/:id', async () => {
    mockedBase.del.mockResolvedValue({});
    await deleteEvent({id: 3});
    expect(mockedBase.del).toHaveBeenCalledWith(
      expect.stringContaining('/events/3'),
    );
  });

  it('fetchCategories gets /events/categories', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchCategories();
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/events/categories'),
    );
  });

  it('createCategory posts to /events/categories', async () => {
    mockedBase.post.mockResolvedValue({});
    await createCategory({name: 'Personal', subcategoryNames: ['Family']});
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/events/categories'),
      {name: 'Personal', subcategoryNames: ['Family']},
    );
  });

  it('createSubcategory posts to /events/categories/:id/subcategories', async () => {
    mockedBase.post.mockResolvedValue({});
    await createSubcategory({categoryId: 2, name: 'Work'});
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/events/categories/2/subcategories'),
      {name: 'Work'},
    );
  });
});
