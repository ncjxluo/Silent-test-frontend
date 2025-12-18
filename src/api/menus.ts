import service from '@/utils/axios.ts'

export const menus_info = (query = {}) =>{
  return service.get('/systems/get_menus')
}
