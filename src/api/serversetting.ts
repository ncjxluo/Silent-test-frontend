import service from '@/utils/axios.ts'

export const add_server_group = (data = {}) =>{
  return service.post('/server_setting/add_server_group', data)
}

export const get_server_group = () =>{
  return service.get('/server_setting/get_server_group')
}

export const del_server_group = (data = {}) =>{
  return service.post('/server_setting/del_server_group', data)
}

export const add_virtual_machine = (data = {}) =>{
  return service.post('/server_setting/add_virtual_machine', data)
}

export const get_virtual_machine = (query = {}) =>{
  return service.get('/server_setting/get_virtual_machine', {params: query})
}

export const verify_virtual_machine = (data = {}) =>{
  return service.post('/server_setting/verify_virtual_machine', data)
}

export const get_virtual_machine_search = (query = {}) =>{
  return service.get('/server_setting/get_virtual_machine_all_search', {params: query})
}

export const del_virtual_machine = (data = {}) =>{
  return service.post('/server_setting/del_virtual_machine', data)
}

export const edit_virtual_machine = (data = {}) =>{
  return service.post('/server_setting/edit_virtual_machine', data)
}
