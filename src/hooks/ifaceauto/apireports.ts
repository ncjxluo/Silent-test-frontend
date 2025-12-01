import {
  get_api_suites,
  get_api_plans,
  get_api_cases,
  get_api_cases_statistic,
  get_api_path_select,
} from '@/api/ifaceauto.ts'


export const api_reports = () => {

  const fetchSuites = async () => {
    const res = await get_api_suites()
    return res.data.data
  }

  const fetchPlans = async (query: any) => {
    const res = await get_api_plans(query)
    return res.data.data
  }

  const fetchCases_statistic = async (query: any) => {
    const res = await get_api_cases_statistic(query)
    return res.data.data
  }

  const fetchCases = async (query: any) => {
    const res = await get_api_cases(query)
    return res.data.data
  }

  const fetchPathSelect = async (query: any) => {
    const res = await get_api_path_select(query)
    return res.data.data
  }

  return { fetchSuites, fetchPlans, fetchCases_statistic, fetchCases, fetchPathSelect }
}
