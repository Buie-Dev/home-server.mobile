import * as base from '../../api/base.api';
import {
  fetchPeople,
  createPerson,
  deletePerson,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  fetchIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
} from '../../api/people.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('people.api', () => {
  it('fetchPeople gets /people/', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchPeople();
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/people/'),
    );
  });

  it('createPerson posts to /people/', async () => {
    mockedBase.post.mockResolvedValue({});
    await createPerson({name: 'Alice'});
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/people/'),
      {name: 'Alice'},
    );
  });

  it('deletePerson deletes /people/:id', async () => {
    mockedBase.del.mockResolvedValue({});
    await deletePerson({personId: 3});
    expect(mockedBase.del).toHaveBeenCalledWith(
      expect.stringContaining('/people/3'),
    );
  });

  it('fetchCategories gets /people/:id/categories', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchCategories({personId: 1});
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/people/1/categories'),
    );
  });

  it('createCategory posts to /people/:id/categories', async () => {
    mockedBase.post.mockResolvedValue({});
    await createCategory({
      personId: 1,
      name: 'Gifts',
      subcategoryNames: ['Birthday'],
    });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/people/1/categories'),
      {name: 'Gifts', subcategoryNames: ['Birthday']},
    );
  });

  it('fetchIdeas gets /people/:id/ideas with filters', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchIdeas({personId: 1, categoryId: 2});
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/people/1/ideas'),
      {categoryId: 2, subcategoryId: undefined},
    );
  });

  it('createIdea posts to /people/:id/ideas', async () => {
    mockedBase.post.mockResolvedValue({});
    await createIdea({personId: 1, title: 'Book', categoryId: 2});
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/people/1/ideas'),
      expect.objectContaining({title: 'Book', categoryId: 2}),
    );
  });

  it('deleteIdea deletes /people/:id/ideas/:ideaId', async () => {
    mockedBase.del.mockResolvedValue({});
    await deleteIdea({personId: 1, id: 5});
    expect(mockedBase.del).toHaveBeenCalledWith(
      expect.stringContaining('/people/1/ideas/5'),
    );
  });
});
