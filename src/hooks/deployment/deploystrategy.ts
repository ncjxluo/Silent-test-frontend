import { add_deploy_strategy, get_deploy_strategy, del_deploy_strategy, edit_deploy_strategy } from '@/api/deploystrategy.ts'



export const deploy_strategy = () => {

  const addDeployStrategy = async (data: any) => {
    const res = await add_deploy_strategy(data)
    return res.data.data
  }

  const fetchDeployStrategy = async (query: any) => {
    const res = await get_deploy_strategy(query)
    return res.data.data
  }

  const editDeployStrategy = async (data: any) => {
    const res = await edit_deploy_strategy(data)
    return res.data.data
  }

  const delDeployStrategy = async (data: any) => {
    const res = await del_deploy_strategy(data)
    return res.data.data
  }

  return { addDeployStrategy, fetchDeployStrategy, editDeployStrategy, delDeployStrategy }
}
