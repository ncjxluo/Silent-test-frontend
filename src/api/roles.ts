import service from '@/utils/axios.ts'

export const roles_info = (query = {}) =>{
  return service.get('/systems/get_roles',{params: query})
}

export const active_roles_info = (query = {}) =>{
  return service.get('/systems/get_active_roles',{params: query})
}

export const addition_role = (data = {}) =>{
  return service.post('/systems/addition_role',data)
}

export const del_role = (data = {}) =>{
  return service.post('/systems/del_role',data)
}

export const edit_role = (data = {}) =>{
  return service.post('/systems/edit_role',data)
}
