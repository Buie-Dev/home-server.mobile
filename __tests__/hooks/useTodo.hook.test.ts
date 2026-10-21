import {renderHook, act} from '@testing-library/react-native';
import * as todoApi from '../../api/todo.api';

jest.mock('../../api/todo.api');

const mockedApi = todoApi as jest.Mocked<typeof todoApi>;

import useTodo from '../../hooks/useTodo.hook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useTodo', () => {
  it('starts with empty state', () => {
    const {result} = renderHook(() => useTodo());
    expect(result.current.categories).toEqual([]);
    expect(result.current.templates).toEqual([]);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.history).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetchCategories updates state', async () => {
    const cats = [{id: 1, name: 'House', subcategories: [], itemCount: 2}];
    mockedApi.fetchCategories.mockResolvedValue(cats);
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.fetchCategories();
    });
    expect(result.current.categories).toEqual(cats);
  });

  it('createCategory calls API and refetches categories', async () => {
    mockedApi.createCategory.mockResolvedValue({});
    mockedApi.fetchCategories.mockResolvedValue([]);
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.createCategory('New', ['Sub1']);
    });

    expect(mockedApi.createCategory).toHaveBeenCalledWith('New', ['Sub1']);
    expect(mockedApi.fetchCategories).toHaveBeenCalled();
  });

  it('fetchTasks stores filter params for refetch', async () => {
    const tasks = [{id: 1, title: 'Task 1'}];
    mockedApi.fetchTasks.mockResolvedValue(tasks);
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.fetchTasks(2, 3);
    });
    expect(mockedApi.fetchTasks).toHaveBeenCalledWith(2, 3);
    expect(result.current.tasks).toEqual(tasks);
  });

  it('completeTask calls API and refetches tasks', async () => {
    mockedApi.completeTask.mockResolvedValue({});
    mockedApi.fetchTasks.mockResolvedValue([]);
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.completeTask(1);
    });

    expect(mockedApi.completeTask).toHaveBeenCalledWith(1);
    expect(mockedApi.fetchTasks).toHaveBeenCalled();
  });

  it('archiveAllCompleted calls API and refetches tasks', async () => {
    mockedApi.archiveAllCompleted.mockResolvedValue({});
    mockedApi.fetchTasks.mockResolvedValue([]);
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.archiveAllCompleted();
    });

    expect(mockedApi.archiveAllCompleted).toHaveBeenCalled();
  });

  it('deleteTemplate removes from local state', async () => {
    mockedApi.fetchTemplates.mockResolvedValue([
      {id: 1, title: 'T1'},
      {id: 2, title: 'T2'},
    ]);
    mockedApi.deleteTemplate.mockResolvedValue({});
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.fetchTemplates();
    });
    await act(async () => {
      await result.current.deleteTemplate(1);
    });

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].id).toBe(2);
  });

  it('addChecklistItem appends item to task optimistically', async () => {
    mockedApi.fetchTasks.mockResolvedValue([
      {id: 10, title: 'Task', checklistItems: []},
    ]);
    mockedApi.addChecklistItem.mockResolvedValue({
      id: 99,
      text: 'New item',
      checked: false,
    });
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.fetchTasks();
    });
    await act(async () => {
      await result.current.addChecklistItem(10, 'New item');
    });

    const task = result.current.tasks.find((t: any) => t.id === 10);
    expect(task?.checklistItems).toHaveLength(1);
    expect(task?.checklistItems?.[0].text).toBe('New item');
  });

  it('toggleChecklistItem updates checked state optimistically', async () => {
    mockedApi.fetchTasks.mockResolvedValue([
      {
        id: 10,
        title: 'Task',
        checklistItems: [{id: 1, text: 'Item', checked: false}],
      },
    ]);
    mockedApi.updateChecklistItem.mockResolvedValue({});
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.fetchTasks();
    });
    await act(async () => {
      await result.current.toggleChecklistItem(10, 1, true);
    });

    const task = result.current.tasks.find((t: any) => t.id === 10);
    expect(task?.checklistItems?.[0].checked).toBe(true);
  });

  it('removeChecklistItem removes item from task optimistically', async () => {
    mockedApi.fetchTasks.mockResolvedValue([
      {
        id: 10,
        title: 'Task',
        checklistItems: [{id: 1, text: 'Item', checked: false}],
      },
    ]);
    mockedApi.deleteChecklistItem.mockResolvedValue({});
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.fetchTasks();
    });
    await act(async () => {
      await result.current.removeChecklistItem(10, 1);
    });

    const task = result.current.tasks.find((t: any) => t.id === 10);
    expect(task?.checklistItems).toHaveLength(0);
  });

  it('addTaskWithTemplate creates template then adds task from it', async () => {
    mockedApi.createTemplate.mockResolvedValue({id: 5});
    mockedApi.addTask.mockResolvedValue({});
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.addTaskWithTemplate({
        title: 'Weekly Clean',
        categoryId: 1,
        frequency: 'weekly',
      });
    });

    expect(mockedApi.createTemplate).toHaveBeenCalled();
    expect(mockedApi.addTask).toHaveBeenCalledWith(5);
  });

  it('addDirectTask passes frequency as one_time', async () => {
    mockedApi.addDirectTask.mockResolvedValue({});
    const {result} = renderHook(() => useTodo());

    await act(async () => {
      await result.current.addDirectTask({title: 'Quick', categoryId: 1});
    });

    expect(mockedApi.addDirectTask).toHaveBeenCalledWith(
      expect.objectContaining({frequency: 'one_time'}),
    );
  });
});
