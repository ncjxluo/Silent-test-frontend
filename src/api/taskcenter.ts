import service from '@/utils/axios.ts'

export const add_kanban_temp = (data = {}) =>{
  return service.post('/task_center/add_kanban_temp', data)
}

export const get_kanban_temp = (query = {}) =>{
  return service.get('/task_center/get_kanban_temp',{params: query})
}

export const edit_kanban_temp = (data = {}) =>{
  return service.post('/task_center/edit_kanban_temp', data)
}

export const del_kanban_temp = (data = {}) =>{
  return service.post('/task_center/del_kanban_temp', data)
}

export const del_kanban_column = (data = {}) =>{
  return service.post('/task_center/del_kanban_column', data)
}

export const add_task = (data = {}) =>{
  return service.post('/task_center/add_task', data)
}

export const get_tasks = (query = {}) =>{
  return service.get('/task_center/get_tasks',{params: query})
}

export const edit_task = (data = {}) =>{
  return service.post('/task_center/edit_task', data)
}

export const del_task = (data = {}) =>{
  return service.post('/task_center/del_task', data)
}

export const del_task_details = (data = {}) =>{
  return service.post('/task_center/del_task_details', data)
}


export const get_kanban_columns_tasks = (query = {}) =>{
  return service.get('/task_center/get_kanban_columns_tasks',{params: query})
}

export const edit_kanban_tasks = (data = {}) =>{
  return service.post('/task_center/edit_kanban_tasks', data)
}
