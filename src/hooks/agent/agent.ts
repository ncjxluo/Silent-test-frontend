import {
  get_api_agents
} from '@/api/agent.ts'


export const agent_reports = () => {

  const fetchApiAgents = async (query: any) => {
    const res = await get_api_agents(query)
    return res.data.data
  }

  return { fetchApiAgents }
}
