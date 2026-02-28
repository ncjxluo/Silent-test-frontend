import service from '@/utils/axios.ts'

export const get_notice = (query = {} ) =>{
  return service.get('/dashboard/get_notice', {params: query})
}

export const get_memo = (query = {} ) =>{
  return service.get('/dashboard/get_memo', {params: query})
}

export const add_memo = (data = {}) =>{
  return service.post('/dashboard/add_memo', data)
}

export const edit_memo = (data = {}) =>{
  return service.post('/dashboard/edit_memo', data)
}

export const del_memo = (data = {}) =>{
  return service.post('/dashboard/del_memo', data)
}
