import * as base from '../../api/base.api';
import {
  fetchCategories,
  createCategory,
  createSubcategory,
  fetchIdeas,
  createIdea,
  toggleIdea,
  deleteIdea,
} from '../../api/megan.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('megan.api', () => {
  it('fetchCategories gets /megan/categories', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchCategories();
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/megan/categories'),
    );
  });

  it('createCategory posts to /megan/categories', async () => {
    mockedBase.post.mockResolvedValue({});
    await createCategory('Dates', ['Restaurants']);
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/megan/categories'),
      {name: 'Dates', subcategoryNames: ['Restaurants']},
    );
  });

  it('createSubcategory posts to /megan/categories/:id/subcategories', async () => {
    mockedBase.post.mockResolvedValue({});
    await createSubcategory(1, 'Activities');
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/megan/categories/1/subcategories'),
      {name: 'Activities'},
    );
  });

  it('fetchIdeas gets /megan/ideas with filters', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchIdeas(1, 2);
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/megan/ideas'),
      {categoryId: 1, subcategoryId: 2},
    );
  });

  it('createIdea posts to /megan/ideas', async () => {
    mockedBase.post.mockResolvedValue({});
    await createIdea({title: 'Picnic', categoryId: 1});
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/megan/ideas'),
      expect.objectContaining({title: 'Picnic'}),
    );
  });

  it('toggleIdea puts to /megan/ideas/:id/toggle', async () => {
    mockedBase.put.mockResolvedValue({});
    await toggleIdea(3, true);
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/megan/ideas/3/toggle'),
      {completed: true},
    );
  });

  it('deleteIdea deletes /megan/ideas/:id', async () => {
    mockedBase.del.mockResolvedValue({});
    await deleteIdea(4);
    expect(mockedBase.del).toHaveBeenCalledWith(
      expect.stringContaining('/megan/ideas/4'),
    );
  });
});
