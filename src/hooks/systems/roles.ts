import {
  roles_info,
  active_roles_info,
  addition_role,
  del_role,
  edit_role
} from '@/api/roles.ts'


export const system_role = () => {

  const fetchRole = async (query: any) => {
    const res = await roles_info(query)
    return res.data.data
  }

  const fetchActiveRole = async (query: any) => {
    const res = await active_roles_info(query)
    return res.data.data
  }

  const additionRole = async (data: any) => {
    const res = await addition_role (data)
    return res.data.data
  }

  const delRole = async (data: any) => {
    const res = await del_role (data)
    return res.data.data
  }

  const editRole = async (data: any) => {
    const res = await edit_role(data)
    return res.data.data
  }

  return { fetchRole, fetchActiveRole, additionRole, delRole, editRole }
}

