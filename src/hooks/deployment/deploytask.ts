import { exec_deploy_task, get_deploy_result } from '@/api/deploytask.ts'


export const deploy_task_operation = () => {

  const execDeployTask = async (data: any) => {
    const res = await exec_deploy_task(data)
    return res.data.data
  }

  const getDeployResult = async (query: any) => {
    const res = await get_deploy_result(query)
    return res.data.data
  }

  return { execDeployTask, getDeployResult }
}
