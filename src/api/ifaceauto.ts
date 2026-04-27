import service from '@/utils/axios.ts'

// ----- 下面是接口文档管理的接口 ------------------------------------------------------------------------------------------------------------------------
export const add_api_project = (data = {}) =>{
  return service.post('/api_manager/add_api_project',data)
}

export const edit_api_project = (data = {}) =>{
  return service.post('/api_manager/edit_api_project',data)
}

export const del_api_project = (data = {}) =>{
  return service.post('/api_manager/del_api_project',data)
}

export const get_api_projects = (query = {})  =>{
  return service.get('/api_manager/get_api_projects', {params: query})
}

export const add_api_branch = (data = {}) =>{
  return service.post('/api_manager/add_api_branch',data)
}

export const edit_api_branch = (data = {}) =>{
  return service.post('/api_manager/edit_api_branch',data)
}

export const del_api_branch = (data = {}) =>{
  return service.post('/api_manager/del_api_branch',data)
}

export const get_api_branchs = (query = {})  =>{
  return service.get('/api_manager/get_api_branchs', {params: query})
}

export const add_api_folder = (data = {}) =>{
  return service.post('/api_manager/add_api_folder',data)
}

export const edit_api_folder = (data = {}) =>{
  return service.post('/api_manager/edit_api_folder',data)
}

export const del_api_folder = (data = {}) =>{
  return service.post('/api_manager/del_api_folder',data)
}

export const get_apis = (query = {})  =>{
  return service.get('/api_manager/get_apis',{params: query})
}

export const manage_api_env = (data = {}) =>{
  return service.post('/api_manager/manage_api_env',data)
}

export const del_api_env = (data = {}) =>{
  return service.post('/api_manager/del_api_env', data)
}

export const get_api_envs = (query = {})  =>{
  return service.get('/api_manager/get_api_envs',{params: query})
}

export const api_doc_debug = (data = {}) =>{
  return service.post('/api_manager/api_debug', data)
}

export const manage_api = (data = {}) =>{
  return service.post('/api_manager/manage_api',data)
}

export const del_api = (data = {}) =>{
  return service.post('/api_manager/del_api', data)
}

// ---------- 下面是接口测试用例管理的接口 ------------------------------------------------------------------------------------------------------------------------

export const add_api_case_project = (data = {}) =>{
  return service.post('/api_testcase/add_api_case_project',data)
}

export const edit_api_case_project = (data = {}) =>{
  return service.post('/api_testcase/edit_api_case_project',data)
}

export const del_api_case_project = (data = {}) =>{
  return service.post('/api_testcase/del_api_case_project',data)
}

export const get_api_case_projects = (query = {})  =>{
  return service.get('/api_testcase/get_api_case_projects', {params: query})
}

export const add_api_case_branch = (data = {}) =>{
  return service.post('/api_testcase/add_api_case_branch',data)
}

export const edit_api_case_branch = (data = {}) =>{
  return service.post('/api_testcase/edit_api_case_branch',data)
}

export const del_api_case_branch = (data = {}) =>{
  return service.post('/api_testcase/del_api_case_branch',data)
}

export const get_api_case_branchs = (query = {})  =>{
  return service.get('/api_testcase/get_api_case_branchs', {params: query})
}

export const add_api_case_folder = (data = {}) =>{
  return service.post('/api_testcase/add_api_case_folder',data)
}

export const edit_api_case_folder = (data = {}) =>{
  return service.post('/api_testcase/edit_api_case_folder',data)
}

export const del_api_case_folder = (data = {}) =>{
  return service.post('/api_testcase/del_api_case_folder',data)
}

export const get_api_case_folder = (query = {})  =>{
  return service.get('/api_testcase/get_api_case_folder', {params: query})
}

export const get_api_testcases = (query = {})  =>{
  return service.get('/api_testcase/get_api_testcases',{params: query})
}

export const manage_api_testcase = (data = {}) =>{
  return service.post('/api_testcase/manage_api_testcase',data)
}

export const del_api_testcase = (data = {}) =>{
  return service.post('/api_testcase/del_api_testcase', data)
}

export const get_api_components = (query = {})  =>{
  return service.get('/api_testcase/get_api_components',{params: query})
}

export const debug_api_testcase = (data = {}) =>{
  return service.post('/api_testcase/debug_api_testcase',data)
}

export const send_case_task = (data = {}) =>{
  return service.post('/api_testcase/send_case_task',data)
}

// ----- 下面是接口自动化报告的内容

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

export const monitor_report = (data = {}) =>{
  return service.post('/apireport/monitor_report',data)
}

export const download_jfr = (query = {}) =>{
  return service.get('/apireport/download_jfr', {params: query, responseType: 'blob'})
}
