import {
  users_info
} from '@/api/users.ts'


export const system_users = () => {

  const fetchUsers = async (query: any) => {
    const res = await users_info(query)
    return res.data.data
  }

  return { fetchUsers }
}
