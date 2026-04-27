import { get_app_config,add_app_config,edit_app_config,del_app_config,add_app_line,get_app_line,get_app_config_selected } from '@/api/appconfig.ts'

export const app_config = () => {

  const fetchAppConfig = async (query: any) => {
    const res = await get_app_config(query)
    return res.data.data
  }

  const addAppConfig = async (data: any) => {
    const res = await add_app_config(data)
    return res.data.data
  }

  const editAppConfig = async (data: any) => {
    const res = await edit_app_config(data)
    return res.data.data
  }

  const delAppConfig = async (data: any) => {
    const res = await del_app_config(data)
    return res.data.data
  }

  const addAppLine = async (data: any) => {
    const res = await add_app_line(data)
    return res.data.data
  }

  const fetchAppLine = async (query: any) => {
    const res = await get_app_line(query)
    return res.data.data
  }

  const fetchAppConfigSelected = async (query: any) => {
    const res = await get_app_config_selected(query)
    return res.data.data
  }

  return { fetchAppConfig, addAppConfig, editAppConfig, delAppConfig,addAppLine,fetchAppLine,fetchAppConfigSelected }
}
