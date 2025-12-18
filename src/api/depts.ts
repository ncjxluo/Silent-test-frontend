import service from '@/utils/axios.ts'

export const depts_info = (query = {}) =>{
  return service.get('/systems/get_depts',{params: query})
}

export const addition_dept = (data = {}) =>{
  return service.post('/systems/addition_dept',data)
}

export const del_dept = (data = {}) =>{
  return service.post('/systems/del_dept',data)
}

export const change_dept = (data = {}) =>{
  return service.post('/systems/edit_dept',data)
}
