import * as base from '../../api/base.api';
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory,
  fetchTemplates, createTemplate, updateTemplate, deleteTemplate,
  fetchTasks, addTask, addDirectTask, updateTask, completeTask, archiveTask, archiveAllCompleted, removeTask,
  fetchHistory,
  addChecklistItem, updateChecklistItem, deleteChecklistItem,
} from '../../api/todo.api';

jest.mock('../../api/base.api');

const mockedBase = base as jest.Mocked<typeof base>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('todo.api', () => {
  it('fetchCategories gets /todo/categories', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchCategories();
    expect(mockedBase.get).toHaveBeenCalledWith(expect.stringContaining('/todo/categories'));
  });

  it('createCategory posts to /todo/categories with name and subcategoryNames', async () => {
    mockedBase.post.mockResolvedValue({});
    await createCategory('House', ['Kitchen', 'Garage']);
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/todo/categories'),
      { name: 'House', subcategoryNames: ['Kitchen', 'Garage'] },
    );
  });

  it('createSubcategory posts to /todo/categories/:id/subcategories', async () => {
    mockedBase.post.mockResolvedValue({});
    await createSubcategory(1, 'Bathroom');
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/todo/categories/1/subcategories'),
      { name: 'Bathroom' },
    );
  });

  it('updateSubcategory puts to /todo/subcategories/:id', async () => {
    mockedBase.put.mockResolvedValue({});
    await updateSubcategory(5, 'Updated');
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/todo/subcategories/5'),
      { name: 'Updated' },
    );
  });

  it('fetchTemplates passes categoryId and subcategoryId params', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchTemplates(2, 3);
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/todo/templates'),
      { categoryId: 2, subcategoryId: 3 },
    );
  });

  it('createTemplate posts to /todo/templates', async () => {
    mockedBase.post.mockResolvedValue({ id: 1 });
    await createTemplate({ title: 'Test', categoryId: 1, frequency: 'weekly' });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/todo/templates'),
      expect.objectContaining({ title: 'Test', frequency: 'weekly' }),
    );
  });

  it('fetchTasks passes filter params', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchTasks(1, 2);
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/todo/tasks'),
      { categoryId: 1, subcategoryId: 2 },
    );
  });

  it('addTask posts to /todo/tasks with templateId', async () => {
    mockedBase.post.mockResolvedValue({});
    await addTask(5);
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/todo/tasks'),
      { templateId: 5 },
    );
  });

  it('addDirectTask posts to /todo/tasks/direct', async () => {
    mockedBase.post.mockResolvedValue({});
    await addDirectTask({ title: 'Quick', categoryId: 1, frequency: 'one_time' });
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/todo/tasks/direct'),
      expect.objectContaining({ title: 'Quick', categoryId: 1 }),
    );
  });

  it('completeTask puts to /todo/tasks/:id/complete', async () => {
    mockedBase.put.mockResolvedValue({});
    await completeTask(3);
    expect(mockedBase.put).toHaveBeenCalledWith(expect.stringContaining('/todo/tasks/3/complete'), {});
  });

  it('archiveAllCompleted puts to /todo/tasks/archive-completed', async () => {
    mockedBase.put.mockResolvedValue({});
    await archiveAllCompleted();
    expect(mockedBase.put).toHaveBeenCalledWith(expect.stringContaining('/todo/tasks/archive-completed'), {});
  });

  it('addChecklistItem posts to /todo/tasks/:id/checklist', async () => {
    mockedBase.post.mockResolvedValue({ id: 1, text: 'item', checked: false });
    await addChecklistItem(10, 'item');
    expect(mockedBase.post).toHaveBeenCalledWith(
      expect.stringContaining('/todo/tasks/10/checklist'),
      { text: 'item' },
    );
  });

  it('updateChecklistItem puts to /todo/checklist/:id', async () => {
    mockedBase.put.mockResolvedValue({});
    await updateChecklistItem(7, { checked: true });
    expect(mockedBase.put).toHaveBeenCalledWith(
      expect.stringContaining('/todo/checklist/7'),
      { checked: true },
    );
  });

  it('deleteChecklistItem deletes /todo/checklist/:id', async () => {
    mockedBase.del.mockResolvedValue({});
    await deleteChecklistItem(7);
    expect(mockedBase.del).toHaveBeenCalledWith(expect.stringContaining('/todo/checklist/7'));
  });

  it('fetchHistory passes filter params', async () => {
    mockedBase.get.mockResolvedValue([]);
    await fetchHistory(1, 2);
    expect(mockedBase.get).toHaveBeenCalledWith(
      expect.stringContaining('/todo/history'),
      { categoryId: 1, subcategoryId: 2 },
    );
  });
});
