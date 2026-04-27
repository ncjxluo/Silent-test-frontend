import {
  add_api_case_project,
  edit_api_case_project,
  del_api_case_project,
  get_api_case_projects,
  add_api_case_branch,
  edit_api_case_branch,
  del_api_case_branch,
  get_api_case_branchs,
  add_api_case_folder,
  edit_api_case_folder,
  del_api_case_folder,
  get_api_case_folder,
  get_api_testcases,
  manage_api_testcase,
  del_api_testcase,
  get_api_components,
  debug_api_testcase,
  send_case_task,
} from '@/api/ifaceauto.ts'


export const api_testcase_manager = () => {

  const addApiCaseProject = async (data: any) => {
    const res = await add_api_case_project(data)
    return res.data.data
  }

  const fetchApiCaseProjects = async (query: any) => {
    const res = await get_api_case_projects(query)
    return res.data.data
  }

  const editApiCaseProject = async (data: any) => {
    const res = await edit_api_case_project(data)
    return res.data.data
  }

  const delApiCaseProject = async (data: any) => {
    const res = await del_api_case_project(data)
    return res.data.data
  }

  const addApiCaseBranch = async (data: any) => {
    const res = await add_api_case_branch(data)
    return res.data.data
  }

  const fetchApiCaseBranchs = async (query: any) => {
    const res = await get_api_case_branchs(query)
    return res.data.data
  }

  const editApiCaseBranch = async (data: any) => {
    const res = await edit_api_case_branch(data)
    return res.data.data
  }

  const delApiCaseBranch = async (data: any) => {
    const res = await del_api_case_branch(data)
    return res.data.data
  }

  const addApiCaseFolder = async (data: any) => {
    const res = await add_api_case_folder(data)
    return res.data.data
  }

  const editApiCaseFolder = async (data: any) => {
    const res = await edit_api_case_folder(data)
    return res.data.data
  }

  const delApiCaseFolder = async (data: any) => {
    const res = await del_api_case_folder(data)
    return res.data.data
  }

  const fetchApiCaseFolders = async (query: any) => {
    const res = await get_api_case_folder(query)
    return res.data.data
  }

  const fetchApiTestCases = async (query: any) => {
    const res = await get_api_testcases(query)
    return res.data.data
  }

  const manageApiTestCase = async (data: any) => {
    const res = await manage_api_testcase(data)
    return res.data.data
  }

  const delApiTestCase = async (data: any) => {
    const res = await del_api_testcase(data)
    return res.data.data
  }

  const DebugApiTestCase = async (data: any) => {
    const res = await debug_api_testcase(data)
    return res.data.data
  }

  const SendCaseTask = async (data: any) => {
    const res = await send_case_task(data)
    return res.data.data
  }

  const fetchApiComponents = async (query: any) => {
    const res = await get_api_components(query)
    return res.data.data
  }

  return {  addApiCaseProject, fetchApiCaseProjects, editApiCaseProject,
    delApiCaseProject, addApiCaseBranch, fetchApiCaseBranchs,
    editApiCaseBranch, delApiCaseBranch, addApiCaseFolder,
    editApiCaseFolder, delApiCaseFolder, fetchApiTestCases,
    manageApiTestCase, delApiTestCase, fetchApiComponents,
    SendCaseTask, DebugApiTestCase, fetchApiCaseFolders }
}
