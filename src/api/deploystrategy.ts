import service from '@/utils/axios.ts'

export const add_deploy_strategy = (data = {}) =>{
  return service.post('/deploy_strategy/add_deploy_strategy',data)
}

export const get_deploy_strategy = (query = {}) =>{
  return service.get('/deploy_strategy/get_deploy_strategy',{params: query})
}

export const edit_deploy_strategy = (data = {}) =>{
  return service.post('/deploy_strategy/edit_deploy_strategy',data)
}

export const del_deploy_strategy = (data = {}) =>{
  return service.post('/deploy_strategy/del_deploy_strategy',data)
}
