import service from '@/utils/axios.ts'

export const users_info = (query = {}) =>{
  return service.get('/systems/get_users',{params: query})
}
