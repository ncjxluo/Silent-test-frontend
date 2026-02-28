import service from '@/utils/axios.ts'

export const get_api_suites = () =>{
  return service.get('/apireport/get_api_all_reports',)
}

export const get_api_plans = (query = {} ) =>{
  return service.get('/apireport/get_api_all_plans', {params: query})
}

export const get_api_cases_statistic = (query = {} ) =>{
  return service.get('/apireport/get_api_all_cases_statistic', {params: query})
}

export const get_api_cases = (query = {} ) =>{
  return service.get('/apireport/get_api_all_cases', {params: query})
}

export const get_api_path_select = (query = {} ) =>{
  return service.get('/apireport/get_api_path_select', {params: query})
}

export const edit_api_cases = (data = {}) =>{
  return service.post('/apireport/edit_api_cases',data)
}

export const submit_zentao = (data = {}) =>{
  return service.post('/apireport/submit_zentao',data)
}
