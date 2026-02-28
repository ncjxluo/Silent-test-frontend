import service from '@/utils/axios.ts'

export const users_info = (query = {}) =>{
  return service.get('/systems/get_users',{params: query})
}

export const addition_user = (data = {}) =>{
  return service.post('/systems/addition_user',data)
}

export const del_user = (data = {}) =>{
  return service.post('/systems/del_user',data)
}

export const change_user = (data = {}) =>{
  return service.post('/systems/edit_user',data)
}
