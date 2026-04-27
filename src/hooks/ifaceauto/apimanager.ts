import {
  add_api_project,
  get_api_projects,
  edit_api_project,
  del_api_project,
  add_api_branch,
  edit_api_branch,
  del_api_branch,
  get_api_branchs,
  add_api_folder,
  edit_api_folder,
  del_api_folder,
  get_apis,
  manage_api_env,
  del_api_env,
  get_api_envs,
  api_doc_debug,
  manage_api,
  del_api
} from '@/api/ifaceauto.ts'


export const api_manager = () => {

  const addApiProject = async (data: any) => {
    const res = await add_api_project(data)
    return res.data.data
  }

  const fetchApiProjects = async (query: any) => {
    const res = await get_api_projects(query)
    return res.data.data
  }

  const editApiProject = async (data: any) => {
    const res = await edit_api_project(data)
    return res.data.data
  }

  const delApiProject = async (data: any) => {
    const res = await del_api_project(data)
    return res.data.data
  }

  const addApiBranch = async (data: any) => {
    const res = await add_api_branch(data)
    return res.data.data
  }

  const fetchApiBranchs = async (query: any) => {
    const res = await get_api_branchs(query)
    return res.data.data
  }

  const editApiBranch = async (data: any) => {
    const res = await edit_api_branch(data)
    return res.data.data
  }

  const delApiBranch = async (data: any) => {
    const res = await del_api_branch(data)
    return res.data.data
  }

  const fetchApis = async (query: any) => {
    const res = await get_apis(query)
    return res.data.data
  }

  const addApiFolder = async (data: any) => {
    const res = await add_api_folder(data)
    return res.data.data
  }

  // const fetchApiFolders = async (query: any) => {
  //   const res = await get_api_folders(query)
  //   return res.data.data
  // }

  const editApiFolder = async (data: any) => {
    const res = await edit_api_folder(data)
    return res.data.data
  }

  const delApiFolder = async (data: any) => {
    const res = await del_api_folder(data)
    return res.data.data
  }

  const manageApiEnv = async (data: any) => {
    const res = await manage_api_env(data)
    return res.data.data
  }

  const delApiEnv = async (data: any) => {
    const res = await del_api_env(data)
    return res.data.data
  }

  const fetchEnvs = async (query: any) => {
    const res = await get_api_envs(query)
    return res.data.data
  }

  const debugApi = async (data: any) => {
    const res = await api_doc_debug(data)
    return res.data.data
  }

  const manageApi = async (data: any) => {
    const res = await manage_api(data)
    return res.data.data
  }

  const delApi = async (data: any) => {
    const res = await del_api(data)
    return res.data.data
  }

  return { addApiProject, fetchApiProjects, editApiProject, delApiProject, addApiBranch,
    fetchApiBranchs, editApiBranch, delApiBranch, addApiFolder, editApiFolder, delApiFolder,
    fetchApis, manageApiEnv, delApiEnv, fetchEnvs, debugApi, manageApi, delApi }
}
