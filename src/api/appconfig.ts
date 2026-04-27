import service from '@/utils/axios.ts'

export const get_app_config = (query = {}) =>{
  return service.get('/app_config/get_app_config',{params: query})
}

export const add_app_config = (data = {}) =>{
  return service.post('/app_config/add_app_config',data)
}

export const del_app_config = (data = {}) =>{
  return service.post('/app_config/del_app_config',data)
}

export const edit_app_config = (data = {}) =>{
  return service.post('/app_config/edit_app_config',data)
}

export const add_app_line = (data = {}) =>{
  return service.post('/app_config/add_app_line',data)
}

export const get_app_line = (query = {}) =>{
  return service.get('/app_config/get_app_line',{params: query})
}

export const get_app_config_selected = (query = {}) =>{
  return service.get('/app_config/get_app_config_selected',{params: query})
}


