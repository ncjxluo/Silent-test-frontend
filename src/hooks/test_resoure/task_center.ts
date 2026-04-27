import {
  add_kanban_temp,
  get_kanban_temp,
  edit_kanban_temp,
  del_kanban_temp,
  del_kanban_column,
  add_task,
  get_tasks,
  get_kanban_columns_tasks,
  edit_kanban_tasks,
  edit_task,
  del_task,
  del_task_details
} from '@/api/taskcenter.ts'


export const task_center = () => {

  const addKanban = async (data: any) => {
    const res = await add_kanban_temp (data)
    return res.data.data
  }

  const fetchKanbans = async (query: any) => {
    const res = await get_kanban_temp(query)
    return res.data.data
  }

  const editKanban = async (data: any) => {
    const res = await edit_kanban_temp (data)
    return res.data.data
  }

  const delKanban = async (data: any) => {
    const res = await del_kanban_temp (data)
    return res.data.data
  }

  const delKanbanColumn = async (data: any) => {
    const res = await del_kanban_column (data)
    return res.data.data
  }

  const addTask = async (data: any) => {
    const res = await add_task(data)
    return res.data.data
  }

  const fetchTasks = async (query: any) => {
    const res = await get_tasks(query)
    return res.data.data
  }

  const editTask = async (data: any) => {
    const res = await edit_task (data)
    return res.data.data
  }

  const delTask = async (data: any) => {
    const res = await del_task (data)
    return res.data.data
  }

  const delTaskDetails = async (data: any) => {
    const res = await del_task_details (data)
    return res.data.data
  }

  const fetchKanbanColumnTasks = async (query: any) => {
    const res = await get_kanban_columns_tasks(query)
    return res.data.data
  }

  const editKanbanTasks = async (data: any) => {
    const res = await edit_kanban_tasks (data)
    return res.data.data
  }

  return { addKanban, fetchKanbans, editKanban, delKanban, delKanbanColumn, addTask, fetchTasks, editTask, delTask, delTaskDetails, fetchKanbanColumnTasks, editKanbanTasks }
}

