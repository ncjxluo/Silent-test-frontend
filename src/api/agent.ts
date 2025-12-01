import service from '@/utils/axios.ts'

export const get_api_agents = (query = {} ) =>{
  return service.get('/agent/get_api_agents', {params: query})
}
