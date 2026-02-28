import {
  users_info,
  addition_user,
  del_user,
  change_user
} from '@/api/users.ts'


export const system_users = () => {

  const fetchUsers = async (query: any) => {
    const res = await users_info(query)
    return res.data.data
  }

  const additionUser = async (data: any) => {
    const res = await addition_user (data)
    return res.data.data
  }

  const delUser = async (data: any) => {
    const res = await del_user(data)
    return res.data.data
  }

  const changeUser = async (data: any) => {
    const res = await change_user(data)
    return res.data.data
  }

  return { fetchUsers, additionUser,delUser, changeUser }
}
