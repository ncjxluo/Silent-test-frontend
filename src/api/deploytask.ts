import service from '@/utils/axios.ts'

export const exec_deploy_task = (data = {}) =>{
  return service.post('/deploy_task/exec_deploy_task',data)
}

export const get_deploy_result = (query = {}) =>{
  return service.get('/deploy_task/get_deploy_result',{params: query})
}
